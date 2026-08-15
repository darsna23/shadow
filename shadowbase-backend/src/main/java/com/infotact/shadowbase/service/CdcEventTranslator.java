package com.infotact.shadowbase.service;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.Iterator;
import java.util.Map;

/**
 * Translates a Debezium change-event payload (op: c=create, u=update, d=delete)
 * into an equivalent SQL statement to replay against the shadow clone.
 * This is intentionally simple — enough to demonstrate the replay pipeline.
 */
public final class CdcEventTranslator {

    private CdcEventTranslator() {}

    public static String toSql(JsonNode event) {
        JsonNode payload = event.has("payload") ? event.get("payload") : event;
        String op = payload.get("op").asText();
        String table = payload.get("source").get("table").asText();

        return switch (op) {
            case "c" -> buildInsert(table, payload.get("after"));
            case "u" -> buildUpdate(table, payload.get("after"));
            case "d" -> buildDelete(table, payload.get("before"));
            default -> throw new IllegalArgumentException("Unsupported CDC op: " + op);
        };
    }

    private static String buildInsert(String table, JsonNode after) {
        StringBuilder cols = new StringBuilder();
        StringBuilder vals = new StringBuilder();
        Iterator<Map.Entry<String, JsonNode>> fields = after.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> f = fields.next();
            if (cols.length() > 0) { cols.append(", "); vals.append(", "); }
            cols.append(f.getKey());
            vals.append(literal(f.getValue()));
        }
        return "INSERT INTO " + table + " (" + cols + ") VALUES (" + vals + ")";
    }

    private static String buildUpdate(String table, JsonNode after) {
        StringBuilder set = new StringBuilder();
        Iterator<Map.Entry<String, JsonNode>> fields = after.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> f = fields.next();
            if (!f.getKey().equals("id")) {
                if (set.length() > 0) set.append(", ");
                set.append(f.getKey()).append(" = ").append(literal(f.getValue()));
            }
        }
        return "UPDATE " + table + " SET " + set + " WHERE id = " + literal(after.get("id"));
    }

    private static String buildDelete(String table, JsonNode before) {
        return "DELETE FROM " + table + " WHERE id = " + literal(before.get("id"));
    }

    private static String literal(JsonNode value) {
        return value.isTextual() ? "'" + value.asText().replace("'", "''") + "'" : value.asText();
    }
}

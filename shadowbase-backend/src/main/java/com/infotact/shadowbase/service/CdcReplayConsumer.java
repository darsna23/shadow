package com.infotact.shadowbase.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

/**
 * Listens to the Debezium change-data-capture topic (production DB events,
 * mirrored via Kafka) and replays each insert/update/delete against the
 * shadow database clone in real time. Any SQL exception raised here means
 * the migration script broke something the live schema didn't — surfaced
 * to the dashboard instead of production.
 */
@Component
public class CdcReplayConsumer {

    private final ObjectMapper mapper = new ObjectMapper();
    private final ShadowEnvironmentService environmentService;
    private final MetricsService metricsService;

    public CdcReplayConsumer(ShadowEnvironmentService environmentService, MetricsService metricsService) {
        this.environmentService = environmentService;
        this.metricsService = metricsService;
    }

    @KafkaListener(topics = "${shadowbase.cdc.topic:dbserver1.public.orders}", groupId = "shadowbase-replayer")
    public void onChangeEvent(String rawEvent, String envId) {
        metricsService.recordQueryReceived();
        try {
            JsonNode event = mapper.readTree(rawEvent);
            String sql = CdcEventTranslator.toSql(event); // op (c/u/d) -> INSERT/UPDATE/DELETE
            replay(envId, sql);
            metricsService.recordQueryReplayed();
        } catch (Exception e) {
            metricsService.recordError(rawEvent, e.getMessage());
        }
    }

    private void replay(String envId, String sql) throws Exception {
        String jdbcUrl = environmentService.jdbcUrlFor(envId);
        try (Connection conn = DriverManager.getConnection(jdbcUrl, "shadow", "shadow");
             Statement stmt = conn.createStatement()) {
            stmt.execute(sql);
        }
    }
}

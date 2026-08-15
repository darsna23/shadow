package com.infotact.shadowbase.service;

import org.springframework.stereotype.Service;
import org.testcontainers.containers.PostgreSQLContainer;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.UUID;

/**
 * Spins up isolated, disposable database clones on demand using Testcontainers.
 * Each environment represents one "shadow sandbox" a developer can point
 * replayed production traffic against, without ever touching the real DB.
 */
@Service
public class ShadowEnvironmentService {

    // envId -> running container, so we can route replayed queries and tear it down later
    private final Map<String, PostgreSQLContainer<?>> environments = new ConcurrentHashMap<>();

    public String createEnvironment(String baseSchemaSql) {
        String envId = "env-" + UUID.randomUUID().toString().substring(0, 8);

        PostgreSQLContainer<?> container = new PostgreSQLContainer<>("postgres:16-alpine")
                .withDatabaseName("shadow_db")
                .withUsername("shadow")
                .withPassword("shadow");

        container.start();
        environments.put(envId, container);

        if (baseSchemaSql != null && !baseSchemaSql.isBlank()) {
            applySql(envId, baseSchemaSql);
        }
        return envId;
    }

    public void applySql(String envId, String sql) {
        PostgreSQLContainer<?> container = requireEnv(envId);
        try (Connection conn = DriverManager.getConnection(
                container.getJdbcUrl(), container.getUsername(), container.getPassword());
             Statement stmt = conn.createStatement()) {
            stmt.execute(sql);
        } catch (Exception e) {
            throw new RuntimeException("Migration script failed against " + envId + ": " + e.getMessage(), e);
        }
    }

    public String jdbcUrlFor(String envId) {
        return requireEnv(envId).getJdbcUrl();
    }

    public void destroyEnvironment(String envId) {
        PostgreSQLContainer<?> container = environments.remove(envId);
        if (container != null) {
            container.stop();
        }
    }

    private PostgreSQLContainer<?> requireEnv(String envId) {
        PostgreSQLContainer<?> c = environments.get(envId);
        if (c == null) throw new IllegalArgumentException("Unknown environment: " + envId);
        return c;
    }
}

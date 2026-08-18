package com.infotact.shadowbase.controller;

import com.infotact.shadowbase.service.ShadowEnvironmentService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/environments")
@CrossOrigin(origins = "*")
public class EnvironmentController {

    private final ShadowEnvironmentService environmentService;

    public EnvironmentController(ShadowEnvironmentService environmentService) {
        this.environmentService = environmentService;
    }

    /** Spins up a fresh, disposable Postgres clone and (optionally) seeds it with a base schema. */
    @PostMapping
    public Map<String, String> create(@RequestBody(required = false) Map<String, String> body) {
        String baseSchema = body == null ? null : body.get("baseSchemaSql");
        String envId = environmentService.createEnvironment(baseSchema);
        return Map.of("environmentId", envId, "jdbcUrl", environmentService.jdbcUrlFor(envId));
    }

    @PostMapping("/{envId}/migrate")
    public Map<String, String> migrate(@PathVariable String envId, @RequestBody Map<String, String> body) {
        environmentService.applySql(envId, body.get("sql"));
        return Map.of("status", "applied", "environmentId", envId);
    }

    @DeleteMapping("/{envId}")
    public Map<String, String> destroy(@PathVariable String envId) {
        environmentService.destroyEnvironment(envId);
        return Map.of("status", "destroyed", "environmentId", envId);
    }
}

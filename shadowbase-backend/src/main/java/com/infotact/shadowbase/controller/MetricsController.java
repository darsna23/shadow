package com.infotact.shadowbase.controller;

import com.infotact.shadowbase.service.MetricsService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/metrics")
@CrossOrigin(origins = "*")
public class MetricsController {

    private final MetricsService metricsService;

    public MetricsController(MetricsService metricsService) {
        this.metricsService = metricsService;
    }

    @GetMapping("/summary")
    public Map<String, Object> summary() {
        return Map.of(
                "totalQueries", metricsService.getReceived(),
                "queriesReplayed", metricsService.getReplayed(),
                "errors", metricsService.getErrors(),
                "errorRatePercent", Math.round(metricsService.getErrorRate() * 100.0) / 100.0
        );
    }

    @GetMapping("/exceptions")
    public Iterable<MetricsService.SqlException> exceptions() {
        return metricsService.getRecentExceptions();
    }
}

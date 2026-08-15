package com.infotact.shadowbase.controller;

import com.infotact.shadowbase.service.MigrationAnalysisService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/migrations")
@CrossOrigin(origins = "*")
public class MigrationController {

    private final MigrationAnalysisService analysisService;

    public MigrationController(MigrationAnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping("/analyze")
    public Map<String, List<String>> analyze(@RequestBody Map<String, String> body) {
        return Map.of("warnings", analysisService.analyze(body.get("sql")));
    }
}

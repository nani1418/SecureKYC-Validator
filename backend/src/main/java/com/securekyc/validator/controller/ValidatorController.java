package com.securekyc.validator.controller;

import com.securekyc.validator.dto.ValidationRequest;
import com.securekyc.validator.dto.ValidationResponse;
import com.securekyc.validator.service.AadhaarValidationService;
import com.securekyc.validator.service.HistoryService;
import com.securekyc.validator.service.PanValidationService;
import com.securekyc.validator.service.StatsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ValidatorController {

    private final PanValidationService panValidationService;
    private final AadhaarValidationService aadhaarValidationService;
    private final HistoryService historyService;
    private final StatsService statsService;

    public ValidatorController(
            PanValidationService panValidationService,
            AadhaarValidationService aadhaarValidationService,
            HistoryService historyService,
            StatsService statsService) {
        this.panValidationService = panValidationService;
        this.aadhaarValidationService = aadhaarValidationService;
        this.historyService = historyService;
        this.statsService = statsService;
    }

    @PostMapping("/pan/validate")
    public ResponseEntity<ValidationResponse> validatePan(@Valid @RequestBody ValidationRequest request) {
        ValidationResponse response = panValidationService.validate(request.value());
        historyService.addRecord(response);
        statsService.recordValidation(response);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/aadhaar/validate")
    public ResponseEntity<ValidationResponse> validateAadhaar(@Valid @RequestBody ValidationRequest request) {
        ValidationResponse response = aadhaarValidationService.validate(request.value());
        historyService.addRecord(response);
        statsService.recordValidation(response);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<ValidationResponse>> getHistory(@RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(historyService.searchHistory(search));
        }
        return ResponseEntity.ok(historyService.getHistory());
    }

    @DeleteMapping("/history")
    public ResponseEntity<Map<String, String>> clearHistory() {
        historyService.clearHistory();
        statsService.clearStats(); // Clear stats as well to keep dashboard clean
        return ResponseEntity.ok(Map.of("message", "History and stats cleared successfully"));
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        return ResponseEntity.ok(statsService.getStatistics());
    }
}

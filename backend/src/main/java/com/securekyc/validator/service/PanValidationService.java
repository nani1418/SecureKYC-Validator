package com.securekyc.validator.service;

import com.securekyc.validator.dto.ValidationResponse;
import com.securekyc.validator.util.ValidationUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class PanValidationService {

    private static final Logger log = LoggerFactory.getLogger(PanValidationService.class);

    private static final Map<Character, String> CATEGORIES = Map.of(
        'P', "Individual",
        'C', "Company",
        'H', "Hindu Undivided Family (HUF)",
        'F', "Firm",
        'A', "Association of Persons (AOP)",
        'T', "Trust",
        'B', "Body of Individuals (BOI)",
        'L', "Local Authority",
        'J', "Artificial Juridical Person",
        'G', "Government"
    );

    public ValidationResponse validate(String input) {
        long startTime = System.nanoTime();
        log.info("Starting PAN validation check for input length: {}", input != null ? input.length() : "null");

        String normalized = normalize(input);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME);
        
        Map<String, Object> details = new HashMap<>();
        details.put("type", "PAN");
        details.put("originalInput", input);
        details.put("normalizedValue", normalized);
        details.put("expectedFormat", "AAAAA9999A");

        // Helper parameters to generate responses
        ValidationResponse response;

        if (normalized.length() != 10) {
            log.warn("PAN validation failed: Invalid Length ({} characters)", normalized.length());
            details.put("errorDescription", "Expected exactly 10 characters. Your input contains " + normalized.length() + " character(s) after normalization.");
            details.put("errorSuggestion", "Ensure you input exactly 10 alphanumeric characters in PAN structure.");
            response = new ValidationResponse("INVALID", "Invalid Length", normalized, timestamp, details);
            return completeResponse(response, startTime, false);
        }

        // Check first 5 characters
        for (int i = 0; i < 5; i++) {
            char ch = normalized.charAt(i);
            if (!Character.isLetter(ch)) {
                if (i == 3) {
                    log.warn("PAN validation failed: Fourth character is not an alphabet");
                    details.put("errorDescription", "The fourth character must be an alphabet representing the holder category. Your input contains '" + ch + "' which is a digit/special symbol.");
                    details.put("errorSuggestion", "Replace the fourth character with an uppercase alphabet representing your tax status (e.g., 'P' for Individual).");
                    response = new ValidationResponse("INVALID", "Fourth digit must be alphabet", normalized, timestamp, details);
                } else {
                    log.warn("PAN validation failed: Non-alphabet in first 5 characters at position {}", i + 1);
                    details.put("errorDescription", "The first five characters of a PAN must all be alphabets. Your input contains '" + ch + "' at position " + (i + 1) + ".");
                    details.put("errorSuggestion", "Ensure all characters in the first 5 positions are uppercase alphabets (A-Z).");
                    response = new ValidationResponse("INVALID", "First five must be alphabets", normalized, timestamp, details);
                }
                return completeResponse(response, startTime, false);
            }
        }

        // Category validation (4th character)
        char categoryChar = normalized.charAt(3);
        if (!CATEGORIES.containsKey(categoryChar)) {
            log.warn("PAN validation failed: Invalid Category letter '{}'", categoryChar);
            details.put("errorDescription", "The fourth character '" + categoryChar + "' is not a recognized category character.");
            details.put("errorSuggestion", "Use a valid category identifier: P (Individual), C (Company), H (HUF), F (Firm), A (AOP), T (Trust), B (BOI), L (Local Authority), J (Artificial Juridical Person), G (Government).");
            response = new ValidationResponse("INVALID", "Invalid Category", normalized, timestamp, details);
            return completeResponse(response, startTime, false);
        }

        // Digits check (Characters 6 to 9, indices 5 to 8)
        for (int i = 5; i < 9; i++) {
            char ch = normalized.charAt(i);
            if (!Character.isDigit(ch)) {
                log.warn("PAN validation failed: Expected digit in middle sections at index {}", i + 1);
                details.put("errorDescription", "Characters in positions 6 to 9 must be numeric digits. Your input contains '" + ch + "' at position " + (i + 1) + ".");
                details.put("errorSuggestion", "Replace alphabetical characters or special symbols in positions 6 through 9 with numbers (0-9).");
                response = new ValidationResponse("INVALID", "Digits expected", normalized, timestamp, details);
                return completeResponse(response, startTime, false);
            }
        }

        // Last character check
        char lastChar = normalized.charAt(9);
        if (!Character.isLetter(lastChar)) {
            log.warn("PAN validation failed: Last character is not an alphabet");
            details.put("errorDescription", "The final character of the PAN must be an alphabet. Your input contains '" + lastChar + "'.");
            details.put("errorSuggestion", "Ensure the 10th character is an uppercase letter (A-Z).");
            response = new ValidationResponse("INVALID", "Last character must be alphabet", normalized, timestamp, details);
            return completeResponse(response, startTime, false);
        }

        // Success Details
        log.info("PAN validation check succeeded for value: {}", normalized);
        details.put("categoryCode", String.valueOf(categoryChar));
        details.put("categoryName", CATEGORIES.get(categoryChar));
        response = new ValidationResponse("VALID", "Valid PAN Card", normalized, timestamp, details);
        return completeResponse(response, startTime, true);
    }

    private ValidationResponse completeResponse(ValidationResponse response, long startTime, boolean isValid) {
        long durationNs = System.nanoTime() - startTime;
        double durationMs = (double) durationNs / 1_000_000.0;
        double roundedMs = Math.round(durationMs * 100.0) / 100.0; // round to 2 decimal places

        Map<String, Object> details = response.details();
        details.put("validationTimeMs", roundedMs);

        // Calculate FinTech compliance scores
        Map<String, Integer> scores = ValidationUtils.calculateScores(
            (String) details.get("originalInput"),
            response.normalizedValue(),
            "PAN",
            isValid
        );
        details.putAll(scores);

        return response;
    }

    public String normalize(String value) {
        return ValidationUtils.normalizePan(value);
    }
}

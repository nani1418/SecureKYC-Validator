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
public class AadhaarValidationService {

    private static final Logger log = LoggerFactory.getLogger(AadhaarValidationService.class);

    public ValidationResponse validate(String input) {
        long startTime = System.nanoTime();
        log.info("Starting Aadhaar validation check for input length: {}", input != null ? input.length() : "null");

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME);
        
        Map<String, Object> details = new HashMap<>();
        details.put("type", "AADHAAR");
        details.put("originalInput", input);
        details.put("expectedFormat", "12 Digits (e.g. XXXX XXXX XXXX)");

        ValidationResponse response;

        if (input == null) {
            log.warn("Aadhaar validation failed: Input is null");
            details.put("errorDescription", "The input value is completely empty or null.");
            details.put("errorSuggestion", "Please provide a valid 12-digit number.");
            response = new ValidationResponse("INVALID", "Invalid Length", "", timestamp, details);
            return completeResponse(response, startTime, false);
        }

        // 1. Check for Devanagari digits (०-९) in the original input
        if (input.matches(".*[\\u0966-\\u096F].*")) {
            log.warn("Aadhaar validation failed: Contains Devanagari digits");
            details.put("errorDescription", "Your input contains digits in Devanagari script (०-९). Devanagari characters are strictly rejected to prevent encoding issues.");
            details.put("errorSuggestion", "Convert Devanagari numerals to standard ASCII numbers (0-9). For example, convert '१' to '1'.");
            response = new ValidationResponse("INVALID", "Invalid characters", "", timestamp, details);
            return completeResponse(response, startTime, false);
        }

        // 2. Check for invalid characters (letters, other symbols) in original input
        String normalized = normalize(input);
        details.put("normalizedValue", normalized);

        // Check if original has other invalid characters besides digits, space, hyphen
        if (!normalized.isEmpty() && !normalized.matches("[0-9]+")) {
            if (normalized.matches(".*[A-Za-z].*")) {
                log.warn("Aadhaar validation failed: Contains letters");
                details.put("errorDescription", "Aadhaar numbers must consist only of numeric digits. Your input contains alphabetical letters.");
                details.put("errorSuggestion", "Remove all letters from the input and provide only the 12 numeric digits.");
                response = new ValidationResponse("INVALID", "Contains non-digit", normalized, timestamp, details);
            } else {
                log.warn("Aadhaar validation failed: Contains invalid symbols");
                details.put("errorDescription", "Aadhaar numbers must consist only of numeric digits. Special characters other than hyphens and spaces are not allowed.");
                details.put("errorSuggestion", "Clear all special symbols and punctuations. Only digits are allowed.");
                response = new ValidationResponse("INVALID", "Invalid characters", normalized, timestamp, details);
            }
            return completeResponse(response, startTime, false);
        }

        // Check length
        if (normalized.length() != 12) {
            log.warn("Aadhaar validation failed: Invalid Length ({} characters)", normalized.length());
            details.put("errorDescription", "Expected exactly 12 numeric digits. Your input has " + normalized.length() + " digits after sanitization.");
            details.put("errorSuggestion", "Ensure you input exactly 12 digits. Double check if you missed any numbers.");
            response = new ValidationResponse("INVALID", "Invalid Length", normalized, timestamp, details);
            return completeResponse(response, startTime, false);
        }

        // 3. Verhoeff Checksum check
        if (!ValidationUtils.validateVerhoeff(normalized)) {
            log.warn("Aadhaar validation failed: Verhoeff checksum validation failed");
            details.put("errorDescription", "The check digit (last digit) of the Aadhaar number did not match the mathematical checksum calculated by the Verhoeff algorithm.");
            details.put("errorSuggestion", "Double-check the digits for typos or transposed adjacent numbers (e.g. typing '34' instead of '43').");
            response = new ValidationResponse("INVALID", "Invalid checksum", normalized, timestamp, details);
            return completeResponse(response, startTime, false);
        }

        // Success Details
        log.info("Aadhaar validation check succeeded for value: {}", normalized);
        String masked = "XXXX-XXXX-" + normalized.substring(8);
        details.put("maskedValue", masked);
        response = new ValidationResponse("VALID", "Valid Aadhaar Card", normalized, timestamp, details);
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
            "AADHAAR",
            isValid
        );
        details.putAll(scores);

        return response;
    }

    public String normalize(String value) {
        return ValidationUtils.normalizeAadhaar(value);
    }
}

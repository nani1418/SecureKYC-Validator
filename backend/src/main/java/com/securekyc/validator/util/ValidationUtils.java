package com.securekyc.validator.util;

import java.util.HashMap;
import java.util.Map;

public class ValidationUtils {

    // Verhoeff algorithm tables
    private static final int[][] MULTIPLICATION = {
        {0, 1, 2, 3, 4, 5, 6, 7, 8, 9},
        {1, 2, 3, 4, 0, 6, 7, 8, 9, 5},
        {2, 3, 4, 0, 1, 7, 8, 9, 5, 6},
        {3, 4, 0, 1, 2, 8, 9, 5, 6, 7},
        {4, 0, 1, 2, 3, 9, 5, 6, 7, 8},
        {5, 9, 8, 7, 6, 0, 4, 3, 2, 1},
        {6, 5, 9, 8, 7, 1, 0, 4, 3, 2},
        {7, 6, 5, 9, 8, 2, 1, 0, 4, 3},
        {8, 7, 6, 5, 9, 3, 2, 1, 0, 4},
        {9, 8, 7, 6, 5, 4, 3, 2, 1, 0}
    };

    private static final int[][] PERMUTATION = {
        {0, 1, 2, 3, 4, 5, 6, 7, 8, 9},
        {1, 5, 7, 6, 2, 8, 3, 0, 9, 4},
        {5, 8, 0, 3, 7, 9, 6, 1, 4, 2},
        {8, 9, 1, 6, 0, 4, 3, 5, 2, 7},
        {9, 4, 5, 3, 1, 2, 6, 8, 7, 0},
        {4, 2, 8, 6, 5, 7, 3, 9, 0, 1},
        {2, 7, 9, 3, 8, 0, 6, 4, 1, 5},
        {7, 0, 4, 6, 9, 1, 3, 2, 5, 8}
    };

    public static boolean validateVerhoeff(String number) {
        if (number == null || number.isEmpty()) {
            return false;
        }
        int checksum = 0;
        int len = number.length();
        for (int i = 0; i < len; i++) {
            int digit = number.charAt(len - 1 - i) - '0';
            if (digit < 0 || digit > 9) {
                return false;
            }
            checksum = MULTIPLICATION[checksum][PERMUTATION[i % 8][digit]];
        }
        return checksum == 0;
    }

    public static String normalizeAadhaar(String val) {
        if (val == null) return "";
        return val.replaceAll("[- ]", "");
    }

    public static String normalizePan(String val) {
        if (val == null) return "";
        return val.trim().replaceAll("[- ]", "").toUpperCase();
    }

    /**
     * Calculates input quality scores based on the degree of normalization required.
     * Higher score indicates input was already in perfect, clean format.
     */
    public static Map<String, Integer> calculateScores(String original, String normalized, String type, boolean isValid) {
        Map<String, Integer> scores = new HashMap<>();
        if (!isValid) {
            scores.put("confidenceScore", 0);
            scores.put("qualityScore", 0);
            scores.put("securityScore", 50); // basic filter ran
            return scores;
        }

        // 1. Confidence Score
        // Aadhaar using mathematical checksum: 99% confidence in syntax validation
        // PAN format check: 95% confidence in structure validation
        int confidence = "AADHAAR".equals(type) ? 99 : 95;

        // 2. Input Quality Score
        // Start with 100%, deduct points for spacing issues, casing conversions, and delimiters
        int quality = 100;
        if (original != null && normalized != null) {
            // Check spaces
            int spacesCount = original.length() - original.replace(" ", "").length();
            quality -= (spacesCount * 10);
            
            // Check hyphens
            int hyphensCount = original.length() - original.replace("-", "").length();
            quality -= (hyphensCount * 15);

            // Check casing changes
            int caseDiffs = 0;
            for (int i = 0; i < Math.min(original.length(), normalized.length()); i++) {
                char origChar = original.charAt(i);
                if (Character.isLowerCase(origChar)) {
                    caseDiffs++;
                }
            }
            quality -= (caseDiffs * 10);
        }
        quality = Math.max(10, Math.min(100, quality)); // clamp between 10% and 100%

        // 3. Security Score
        // Aadhaar validation has extra layers (rejections of non-digit strings, checksum): 96%
        // PAN validation: 92%
        int security = "AADHAAR".equals(type) ? 96 : 92;

        scores.put("confidenceScore", confidence);
        scores.put("qualityScore", quality);
        scores.put("securityScore", security);

        return scores;
    }
}

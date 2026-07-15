package com.securekyc.validator.dto;

import java.util.Map;

public record ValidationResponse(
    String status,
    String reason,
    String normalizedValue,
    String timestamp,
    Map<String, Object> details
) {}

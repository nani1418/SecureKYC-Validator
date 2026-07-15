package com.securekyc.validator.dto;

import jakarta.validation.constraints.NotBlank;

public record ValidationRequest(
    @NotBlank(message = "Value cannot be blank")
    String value
) {}

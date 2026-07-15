package com.securekyc.validator.service;

import com.securekyc.validator.dto.ValidationResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AadhaarValidationServiceTest {

    private AadhaarValidationService service;

    @BeforeEach
    void setUp() {
        service = new AadhaarValidationService();
    }

    @Test
    void testValidAadhaar() {
        // "999933999936" is a standard valid Aadhaar mock number using Verhoeff
        ValidationResponse response = service.validate("999933999936");
        assertEquals("VALID", response.status());
        assertEquals("999933999936", response.normalizedValue());
        assertEquals("XXXX-XXXX-9936", response.details().get("maskedValue"));
    }

    @Test
    void testValidAadhaarWithSpacesAndHyphens() {
        ValidationResponse response = service.validate("9999-3399-9936");
        assertEquals("VALID", response.status());
        assertEquals("999933999936", response.normalizedValue());

        response = service.validate("9999 3399 9936");
        assertEquals("VALID", response.status());
        assertEquals("999933999936", response.normalizedValue());
    }

    @Test
    void testInvalidLength() {
        ValidationResponse response = service.validate("99993399993");
        assertEquals("INVALID", response.status());
        assertEquals("Invalid Length", response.reason());

        response = service.validate("9999339999366");
        assertEquals("INVALID", response.status());
        assertEquals("Invalid Length", response.reason());
    }

    @Test
    void testRejectDevanagariDigits() {
        // Contains Devanagari digit ० (U+0966)
        ValidationResponse response = service.validate("99993399993०");
        assertEquals("INVALID", response.status());
        assertEquals("Invalid characters", response.reason());
    }

    @Test
    void testContainsNonDigit() {
        ValidationResponse response = service.validate("99993399993A");
        assertEquals("INVALID", response.status());
        assertEquals("Contains non-digit", response.reason());
    }

    @Test
    void testInvalidCharacters() {
        ValidationResponse response = service.validate("99993399993#");
        assertEquals("INVALID", response.status());
        assertEquals("Invalid characters", response.reason());
    }

    @Test
    void testInvalidChecksum() {
        // Last digit changed from 6 to 2 (999933999932 is invalid)
        ValidationResponse response = service.validate("999933999932");
        assertEquals("INVALID", response.status());
        assertEquals("Invalid checksum", response.reason());
    }

    @Test
    void testNullAndEmptyInput() {
        ValidationResponse response = service.validate(null);
        assertEquals("INVALID", response.status());
        assertEquals("Invalid Length", response.reason());

        response = service.validate("");
        assertEquals("INVALID", response.status());
        assertEquals("Invalid Length", response.reason());
    }
}

package com.securekyc.validator.service;

import com.securekyc.validator.dto.ValidationResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PanValidationServiceTest {

    private PanValidationService service;

    @BeforeEach
    void setUp() {
        service = new PanValidationService();
    }

    @Test
    void testValidPanIndividual() {
        ValidationResponse response = service.validate("ABCPD1234Z");
        assertEquals("VALID", response.status());
        assertEquals("ABCPD1234Z", response.normalizedValue());
        assertEquals("Individual", response.details().get("categoryName"));
        assertEquals("P", response.details().get("categoryCode"));
    }

    @Test
    void testValidPanCompany() {
        ValidationResponse response = service.validate("ABCCD5678A");
        assertEquals("VALID", response.status());
        assertEquals("ABCCD5678A", response.normalizedValue());
        assertEquals("Company", response.details().get("categoryName"));
        assertEquals("C", response.details().get("categoryCode"));
    }

    @Test
    void testInvalidLength() {
        ValidationResponse response = service.validate("ABCPD123");
        assertEquals("INVALID", response.status());
        assertEquals("Invalid Length", response.reason());

        response = service.validate("ABCPD123456");
        assertEquals("INVALID", response.status());
        assertEquals("Invalid Length", response.reason());
    }

    @Test
    void testFirstFiveMustBeAlphabets() {
        ValidationResponse response = service.validate("AB1PD1234Z");
        assertEquals("INVALID", response.status());
        assertEquals("First five must be alphabets", response.reason());
    }

    @Test
    void testFourthDigitMustBeAlphabet() {
        // Checking the fourth character index 3, if not a letter
        ValidationResponse response = service.validate("ABC2D1234Z");
        assertEquals("INVALID", response.status());
        assertEquals("Fourth digit must be alphabet", response.reason());
    }

    @Test
    void testInvalidCategory() {
        ValidationResponse response = service.validate("ABCXD1234Z");
        assertEquals("INVALID", response.status());
        assertEquals("Invalid Category", response.reason());
    }

    @Test
    void testDigitsExpected() {
        ValidationResponse response = service.validate("ABCPD1A34Z");
        assertEquals("INVALID", response.status());
        assertEquals("Digits expected", response.reason());
    }

    @Test
    void testLastCharacterMustBeAlphabet() {
        ValidationResponse response = service.validate("ABCPD12345");
        assertEquals("INVALID", response.status());
        assertEquals("Last character must be alphabet", response.reason());
    }

    @Test
    void testNormalization() {
        ValidationResponse response = service.validate("  abcpd-1234-z  ");
        assertEquals("VALID", response.status());
        assertEquals("ABCPD1234Z", response.normalizedValue());
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

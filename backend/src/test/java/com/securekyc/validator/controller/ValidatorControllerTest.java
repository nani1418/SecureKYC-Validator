package com.securekyc.validator.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.securekyc.validator.dto.ValidationRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ValidatorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testValidatePanEndpointValid() throws Exception {
        ValidationRequest request = new ValidationRequest("ABCPD1234Z");
        
        mockMvc.perform(post("/api/pan/validate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("VALID"))
                .andExpect(jsonPath("$.normalizedValue").value("ABCPD1234Z"))
                .andExpect(jsonPath("$.details.type").value("PAN"))
                .andExpect(jsonPath("$.details.categoryCode").value("P"));
    }

    @Test
    void testValidatePanEndpointInvalid() throws Exception {
        ValidationRequest request = new ValidationRequest("ABCPD123"); // invalid length
        
        mockMvc.perform(post("/api/pan/validate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INVALID"))
                .andExpect(jsonPath("$.reason").value("Invalid Length"));
    }

    @Test
    void testValidateAadhaarEndpointValid() throws Exception {
        ValidationRequest request = new ValidationRequest("9999-3399-9936");
        
        mockMvc.perform(post("/api/aadhaar/validate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("VALID"))
                .andExpect(jsonPath("$.normalizedValue").value("999933999936"))
                .andExpect(jsonPath("$.details.type").value("AADHAAR"));
    }

    @Test
    void testValidateAadhaarEndpointInvalidChecksum() throws Exception {
        ValidationRequest request = new ValidationRequest("999933999932"); // invalid checksum
        
        mockMvc.perform(post("/api/aadhaar/validate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INVALID"))
                .andExpect(jsonPath("$.reason").value("Invalid checksum"));
    }

    @Test
    void testValidationRequestBlankFieldReturnsBadRequest() throws Exception {
        ValidationRequest request = new ValidationRequest(""); // triggers Jakarta Validation annotations
        
        mockMvc.perform(post("/api/pan/validate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Error"))
                .andExpect(jsonPath("$.message").value("Value cannot be blank"));
    }

    @Test
    void testGetHistoryEndpoint() throws Exception {
        mockMvc.perform(get("/api/history"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void testGetStatisticsEndpoint() throws Exception {
        mockMvc.perform(get("/api/statistics"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalValidations").isNumber());
    }
}

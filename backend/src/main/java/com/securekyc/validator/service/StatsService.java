package com.securekyc.validator.service;

import com.securekyc.validator.dto.ValidationResponse;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class StatsService {

    private final AtomicLong totalValidations = new AtomicLong(0);
    private final AtomicLong totalValid = new AtomicLong(0);
    private final AtomicLong totalInvalid = new AtomicLong(0);

    private final AtomicLong panTotal = new AtomicLong(0);
    private final AtomicLong panValid = new AtomicLong(0);
    private final AtomicLong panInvalid = new AtomicLong(0);

    private final AtomicLong aadhaarTotal = new AtomicLong(0);
    private final AtomicLong aadhaarValid = new AtomicLong(0);
    private final AtomicLong aadhaarInvalid = new AtomicLong(0);

    public synchronized void recordValidation(ValidationResponse response) {
        totalValidations.incrementAndGet();
        boolean isValid = "VALID".equals(response.status());
        if (isValid) {
            totalValid.incrementAndGet();
        } else {
            totalInvalid.incrementAndGet();
        }

        String type = (String) response.details().get("type");
        if ("PAN".equals(type)) {
            panTotal.incrementAndGet();
            if (isValid) {
                panValid.incrementAndGet();
            } else {
                panInvalid.incrementAndGet();
            }
        } else if ("AADHAAR".equals(type)) {
            aadhaarTotal.incrementAndGet();
            if (isValid) {
                aadhaarValid.incrementAndGet();
            } else {
                aadhaarInvalid.incrementAndGet();
            }
        }
    }

    public synchronized Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        long total = totalValidations.get();
        long valid = totalValid.get();
        long invalid = totalInvalid.get();

        double successRate = total == 0 ? 0.0 : ((double) valid / total) * 100.0;

        stats.put("totalValidations", total);
        stats.put("totalValid", valid);
        stats.put("totalInvalid", invalid);
        stats.put("successRate", Math.round(successRate * 100.0) / 100.0); // round to 2 decimal places

        Map<String, Object> panStats = new HashMap<>();
        panStats.put("total", panTotal.get());
        panStats.put("valid", panValid.get());
        panStats.put("invalid", panInvalid.get());
        stats.put("pan", panStats);

        Map<String, Object> aadhaarStats = new HashMap<>();
        aadhaarStats.put("total", aadhaarTotal.get());
        aadhaarStats.put("valid", aadhaarValid.get());
        aadhaarStats.put("invalid", aadhaarInvalid.get());
        stats.put("aadhaar", aadhaarStats);

        return stats;
    }

    public synchronized void clearStats() {
        totalValidations.set(0);
        totalValid.set(0);
        totalInvalid.set(0);
        panTotal.set(0);
        panValid.set(0);
        panInvalid.set(0);
        aadhaarTotal.set(0);
        aadhaarValid.set(0);
        aadhaarInvalid.set(0);
    }
}

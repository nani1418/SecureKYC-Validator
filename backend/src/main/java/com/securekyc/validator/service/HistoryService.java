package com.securekyc.validator.service;

import com.securekyc.validator.dto.ValidationResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HistoryService {

    private final List<ValidationResponse> historyList = new ArrayList<>();
    private static final int MAX_HISTORY_SIZE = 20;

    public synchronized void addRecord(ValidationResponse response) {
        // Add to the beginning of the list (newest first)
        historyList.add(0, response);
        // Truncate if list exceeds maximum size
        while (historyList.size() > MAX_HISTORY_SIZE) {
            historyList.remove(historyList.size() - 1);
        }
    }

    public synchronized List<ValidationResponse> getHistory() {
        return new ArrayList<>(historyList);
    }

    public synchronized List<ValidationResponse> searchHistory(String query) {
        if (query == null || query.isBlank()) {
            return getHistory();
        }
        String lowerQuery = query.toLowerCase().trim();
        return historyList.stream()
            .filter(record -> 
                record.normalizedValue().toLowerCase().contains(lowerQuery) ||
                (record.reason() != null && record.reason().toLowerCase().contains(lowerQuery)) ||
                (record.details().get("originalInput") != null && 
                 record.details().get("originalInput").toString().toLowerCase().contains(lowerQuery)) ||
                record.status().toLowerCase().contains(lowerQuery) ||
                record.details().get("type").toString().toLowerCase().contains(lowerQuery)
            )
            .collect(Collectors.toList());
    }

    public synchronized void clearHistory() {
        historyList.clear();
    }
}

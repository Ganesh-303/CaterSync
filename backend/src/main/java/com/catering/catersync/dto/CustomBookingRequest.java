package com.catering.catersync.dto;

import java.time.LocalDate;
import java.util.List;

public class CustomBookingRequest {
    private Long userId;
    private LocalDate eventDate;
    private List<CatererSelection> selections;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public List<CatererSelection> getSelections() {
        return selections;
    }

    public void setSelections(List<CatererSelection> selections) {
        this.selections = selections;
    }
}

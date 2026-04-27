package com.catering.catersync.dto;

import  java.time.LocalDate;

public class FlashBookingRequest {
    private Long userId;
    private Long catererId;
    private String vegType;
    private LocalDate eventDate;

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public String getVegType() {
        return vegType;
    }

    public void setVegType(String vegType) {
        this.vegType = vegType;
    }

    public Long getCatererId() {
        return catererId;
    }

    public void setCatererId(Long catererId) {
        this.catererId = catererId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}

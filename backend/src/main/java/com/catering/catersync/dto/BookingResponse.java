package com.catering.catersync.dto;

import java.time.LocalDate;
import java.util.List;

public class BookingResponse {
    private Long id;
    private String bookingType;
    private LocalDate eventDate;
    private String status;
    private double totalPrice;
    private List<BookingItemResponse> items;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBookingType() {
        return bookingType;
    }

    public void setBookingType(String bookingType) {
        this.bookingType = bookingType;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public List<BookingItemResponse> getItems() {
        return items;
    }

    public void setItems(List<BookingItemResponse> items) {
        this.items = items;
    }
}

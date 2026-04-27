package com.catering.catersync.entity;


import jakarta.persistence.*;

@Entity
@Table(name = "booking_inventory_usage")
public class BookingInventoryUsage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long bookingId;
    private Long inventoryItemId;
    private int usedQty;

    public Long getId(){return id;}

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getInventoryItemId() {
        return inventoryItemId;
    }

    public void setInventoryItemId(Long inventoryItemId) {
        this.inventoryItemId = inventoryItemId;
    }

    public int getUsedQty() {
        return usedQty;
    }

    public void setUsedQty(int usedQty) {
        this.usedQty = usedQty;
    }
}

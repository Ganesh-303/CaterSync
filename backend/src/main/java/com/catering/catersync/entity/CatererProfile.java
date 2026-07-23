package com.catering.catersync.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity

public class CatererProfile {
    @Id
    private Long userId;
    private String vegType;  // VEG /NON VEG
    private String services;  // food, beverages,sides
    private String styles; // punjabi, jain, andhra
    private int minNoticeDays;
    private boolean flashEnabled;
    private boolean customEnabled;
    private boolean available = true;
    private int maxCapacity = 1000;
    private int maxBookings = 3;

    private double avgRating = 0.0;
    private long ratingCount = 0;

    public double getAvgRating() {
        return avgRating;
    }

    public void setAvgRating(double avgRating) {
        this.avgRating = avgRating;
    }

    public long getRatingCount() {
        return ratingCount;
    }

    public void setRatingCount(long ratingCount) {
        this.ratingCount = ratingCount;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public String getVegType() {
        return vegType;
    }

    public void setVegType(String vegType) {
        this.vegType = vegType;
    }

    public String getServices() {
        return services;
    }

    public void setServices(String services) {
        this.services = services;
    }

    public String getStyles() {
        return styles;
    }

    public void setStyles(String styles) {
        this.styles = styles;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public int getMinNoticeDays() {
        return minNoticeDays;
    }

    public void setMinNoticeDays(int minNoticeDays) {
        this.minNoticeDays = minNoticeDays;
    }

    public boolean isFlashEnabled() {
        return flashEnabled;
    }

    public void setFlashEnabled(boolean flashEnabled) {
        this.flashEnabled = flashEnabled;
    }

    public boolean isCustomEnabled() {
        return customEnabled;
    }

    public void setCustomEnabled(boolean customEnabled) {
        this.customEnabled = customEnabled;
    }

    public int getMaxCapacity() {
        return maxCapacity;
    }

    public void setMaxCapacity(int maxCapacity) {
        this.maxCapacity = maxCapacity;
    }

    public int getMaxBookings() {
        return maxBookings;
    }

    public void setMaxBookings(int maxBookings) {
        this.maxBookings = maxBookings;
    }
}
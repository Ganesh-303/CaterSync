package com.catering.catersync.dto;

import jakarta.validation.constraints.*;

public class ReviewRequest {

    @NotNull(message = "catererId is required")
    private Long catererId;

    @NotNull(message = "bookingId is required")
    private Long bookingId;

    @NotNull(message = "userId is required")
    private Long userId;

    @Min(value = 1,message = "stars must be between 1 and 5")
    @Max(value = 5,message = "stars must be between 1 and 5")
    private int stars;

    @Size(max =500,message = "comment max 500 chars")
    private String comment;

    public Long getCatererId() {
        return catererId;
    }

    public void setCatererId(Long catererId) {
        this.catererId = catererId;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public int getStars() {
        return stars;
    }

    public void setStars(int stars) {
        this.stars = stars;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}

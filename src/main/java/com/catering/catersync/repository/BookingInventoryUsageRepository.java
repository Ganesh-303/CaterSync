package com.catering.catersync.repository;

import com.catering.catersync.entity.BookingInventoryUsage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingInventoryUsageRepository extends JpaRepository<BookingInventoryUsage, Long> {
    List<BookingInventoryUsage> findByBookingId(Long bookingId);
    void deleteByBookingId(Long bookingId);
}

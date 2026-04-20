package com.catering.catersync.repository;

import com.catering.catersync.entity.BookingStaffAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingStaffAssignmentRepository extends JpaRepository<BookingStaffAssignment, Long> {
    List<BookingStaffAssignment> findByBookingId(Long bookingId);
    void deleteByBookingId(Long bookingId);
}

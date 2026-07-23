package com.catering.catersync.repository;

import com.catering.catersync.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking,Long>{
    List<Booking> findByUserId(Long userId);

    @Query("SELECT DISTINCT b FROM Booking b JOIN b.items i WHERE i.catererId = :catererId")
    List<Booking> findByCatererId(@Param("catererId") Long catererId);

    List<Booking> findByEventDate(LocalDate eventDate);
}

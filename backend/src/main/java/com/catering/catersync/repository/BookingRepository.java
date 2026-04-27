package com.catering.catersync.repository;

import com.catering.catersync.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking,Long>{}

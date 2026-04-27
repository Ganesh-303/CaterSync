package com.catering.catersync.repository;

import  com.catering.catersync.entity.BookingItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingItemRepository extends JpaRepository<BookingItem, Long> {}

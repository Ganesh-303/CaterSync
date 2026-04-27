package com.catering.catersync.repository;

import com.catering.catersync.entity.CatererReview;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CatererReviewRepository extends JpaRepository<CatererReview, Long>{
    boolean existsByBookingIdAndUserId(Long bookingId, Long userId);

}

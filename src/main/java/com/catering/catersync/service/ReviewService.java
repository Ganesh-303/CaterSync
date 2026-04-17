package com.catering.catersync.service;

import com.catering.catersync.entity.CatererProfile;
import com.catering.catersync.entity.CatererReview;
import com.catering.catersync.repository.CatererRepository;
import com.catering.catersync.repository.CatererReviewRepository;
import org.springframework.stereotype.Service;

@Service
public class ReviewService {
    private final CatererReviewRepository reviewRepo;
    private final CatererRepository catererRepo;

    public ReviewService(CatererReviewRepository reviewRepo,CatererRepository catererRepo){
        this.reviewRepo = reviewRepo;
        this.catererRepo = catererRepo;
    }
    public CatererReview submitReview(CatererReview r){
        if (r.getStars() < 1 || r.getStars() > 5){
            throw new IllegalArgumentException("start must be between 1 and 5");
        }
        if (reviewRepo.existsByBookingIdAndUserId(r.getBookingId(), r.getUserId()))   {
            throw new IllegalArgumentException("you already reviewed this booking");

        }
        CatererReview saved = reviewRepo.save(r);
        CatererProfile c = catererRepo.findById(r.getCatererId()).orElseThrow(() -> new IllegalArgumentException("caterer not found"));
        double oldAvg = c.getAvgRating();
        long count = c.getRatingCount();

        double newAvg =((oldAvg* count)+ r.getStars())/(count +1);
        c.setRatingCount(count+1);
        c.setAvgRating(newAvg);

        catererRepo.save(c);
        return saved;

    }
}

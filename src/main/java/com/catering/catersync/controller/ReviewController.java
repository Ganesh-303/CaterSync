package com.catering.catersync.controller;


import com.catering.catersync.entity.CatererReview;
import com.catering.catersync.service.ReviewService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService service;

    public ReviewController(ReviewService service){
        this.service =service;
    }
    @PostMapping
    public CatererReview submit(@RequestBody CatererReview review){
        return service.submitReview(review);
    }

}

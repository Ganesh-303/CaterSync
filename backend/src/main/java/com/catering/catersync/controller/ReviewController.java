package com.catering.catersync.controller;


import com.catering.catersync.entity.CatererReview;
import com.catering.catersync.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.catering.catersync.dto.ReviewRequest;
import com.catering.catersync.dto.ReviewResponse;

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
    @PostMapping
    public ReviewResponse submit(@Valid @RequestBody ReviewRequest req) {
        CatererReview entity = new CatererReview();
        entity.setBookingId(req.getBookingId());
        entity.setCatererId(req.getCatererId());
        entity.setUserId(req.getUserId());
        entity.setStars(req.getStars());
        entity.setComment(req.getComment());

        //save + compute avg rating logic stays in service(unchanged)
        CatererReview saved = service.submitReview(entity);

        //map Entity -> DTO
        ReviewResponse resp = new ReviewResponse();
        resp.setId(saved.getId());
        resp.setCatererId(saved.getCatererId());
        resp.setBookingId(saved.getBookingId());
        resp.setUserId(saved.getUserId());
        resp.setStars(saved.getStars());
        resp.setComment(saved.getComment());
        resp.setCreatedAt(saved.getCreatedAt());

        return resp;
    }

}
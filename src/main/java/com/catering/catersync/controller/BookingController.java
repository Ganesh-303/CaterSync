package com.catering.catersync.controller;

import com.catering.catersync.dto.CustomBookingRequest;
import com.catering.catersync.dto.FlashBookingRequest;
import com.catering.catersync.entity.Booking;
import com.catering.catersync.entity.BookingStatus;
import com.catering.catersync.service.BookingService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service){
        this.service = service;
    }

    @PostMapping("/flash")
    public Booking createFlash(@RequestBody FlashBookingRequest req){
        return service.createFlashBooking(req);
    }

    @PostMapping("/custom")
    public Booking createCustom(@RequestBody CustomBookingRequest req){
        return service.createCustomBooking(req);
    }

    @GetMapping("/{id}")
    public Booking get (@PathVariable Long id){
        return service.getBooking(id);
    }
}

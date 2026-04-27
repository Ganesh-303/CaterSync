package com.catering.catersync.controller;

import com.catering.catersync.dto.BookingResponse;
import com.catering.catersync.dto.CustomBookingRequest;
import com.catering.catersync.dto.FlashBookingRequest;
import com.catering.catersync.dto.InventoryUsageRequest;
import com.catering.catersync.entity.Booking;
import com.catering.catersync.entity.BookingStatus;
import com.catering.catersync.mapper.BookingMapper;
import com.catering.catersync.service.BookingService;
import jakarta.validation.Valid;
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
    public BookingResponse createCustom(@Valid @RequestBody CustomBookingRequest req){
        Booking saved = service.createCustomBooking(req);
        return BookingMapper.toDto(saved);
    }

    @GetMapping("/{id}")
    public Booking get (@PathVariable Long id){
        return service.getBooking(id);
    }

    @PutMapping("/{id}/cancel")
    public BookingResponse cancel(@PathVariable Long id){
        Booking b = service.cancelBooking(id);
        return BookingMapper.toDto(b);
    }

    @PostMapping("/{id}/inventory-usage")
    public String allocateInventory(@PathVariable Long id,
                                    @Valid @RequestBody InventoryUsageRequest req){
        service.allocateInventory(id, req.getInventoryItemId(), req.getQty());
        return "Inventory allocated successfully for bookingId ="+id;
    }
}

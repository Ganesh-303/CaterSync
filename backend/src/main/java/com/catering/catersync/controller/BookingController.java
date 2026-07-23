package com.catering.catersync.controller;

import com.catering.catersync.dto.BookingResponse;
import com.catering.catersync.dto.CustomBookingRequest;
import com.catering.catersync.dto.FlashBookingRequest;
import com.catering.catersync.dto.InventoryUsageRequest;
import com.catering.catersync.entity.Booking;
import com.catering.catersync.entity.BookingStatus;
import com.catering.catersync.entity.BookingInventoryUsage;
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
    public BookingResponse createFlash(@RequestBody FlashBookingRequest req){
        Booking saved = service.createFlashBooking(req);
        return BookingMapper.toDto(saved);
    }

    @PostMapping("/custom")
    public BookingResponse createCustom(@Valid @RequestBody CustomBookingRequest req){
        Booking saved = service.createCustomBooking(req);
        return BookingMapper.toDto(saved);
    }

    @GetMapping
    public java.util.List<BookingResponse> getAll(){
        return service.getAllBookings().stream()
                .map(BookingMapper::toDto)
                .toList();
    }

    @GetMapping("/caterer/{catererId}")
    public java.util.List<BookingResponse> getByCaterer(@PathVariable Long catererId) {
        return service.getBookingsByCaterer(catererId).stream()
                .map(BookingMapper::toDto)
                .toList();
    }

    @GetMapping("/user/{userId}")
    public java.util.List<BookingResponse> getByUser(@PathVariable Long userId) {
        return service.getBookingsByUser(userId).stream()
                .map(BookingMapper::toDto)
                .toList();
    }

    @PutMapping("/{id}/confirm")
    public BookingResponse confirm(@PathVariable Long id){
        Booking b = service.confirmBooking(id);
        return BookingMapper.toDto(b);
    }

    @GetMapping("/{id}")
    public BookingResponse get (@PathVariable Long id){
        return BookingMapper.toDto(service.getBooking(id));
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

    @GetMapping("/inventory-usages")
    public java.util.List<BookingInventoryUsage> getAllInventoryUsages(){
        return service.getAllInventoryUsages();
    }

    @GetMapping("/{id}/inventory-usage")
    public java.util.List<BookingInventoryUsage> getInventoryUsage(@PathVariable Long id){
        return service.getInventoryUsageForBooking(id);
    }
}

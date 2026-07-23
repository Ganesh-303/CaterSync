package com.catering.catersync.controller;

import com.catering.catersync.entity.CatererProfile;
import com.catering.catersync.service.CatererService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/caterers")
public class CatererController {
    private final CatererService service;


    public CatererController(CatererService service) {
        this.service = service;
    }

    @PostMapping
    public CatererProfile register(@RequestBody CatererProfile c) {
        return service.register(c);
    }

    @GetMapping
    public List<CatererProfile> List() {
        return service.getAll();
    }

    @GetMapping("/available")
    public List<CatererProfile> getAvailable(@RequestParam String date) {
        java.time.LocalDate eventDate = java.time.LocalDate.parse(date);
        return service.getAvailableOnDate(eventDate);
    }

    @GetMapping("/{id}")
    public CatererProfile getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/{id}/check-availability")
    public com.catering.catersync.dto.CatererAvailabilityResponse checkAvailability(
            @PathVariable Long id,
            @RequestParam String date,
            @RequestParam int guestCount,
            @RequestParam(required = false) List<Long> menuItemIds
    ) {
        java.time.LocalDate eventDate = java.time.LocalDate.parse(date);
        return service.checkAvailability(id, eventDate, guestCount, menuItemIds);
    }

    @PutMapping("/{id}")
    public CatererProfile updateProfile(@PathVariable Long id, @RequestBody CatererProfile details) {
        return service.updateProfile(id, details);
    }
}

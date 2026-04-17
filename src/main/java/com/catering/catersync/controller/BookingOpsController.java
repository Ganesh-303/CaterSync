package com.catering.catersync.controller;


import com.catering.catersync.dto.AssignStaffRequest;
import com.catering.catersync.entity.BookingStaffAssignment;
import com.catering.catersync.service.BookingOpsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingOpsController {

    private final BookingOpsService service;

    public BookingOpsController(BookingOpsService service) {
        this.service = service;
    }

    @PostMapping("/{id}/assign-staff")
    public List<BookingStaffAssignment> assign(@PathVariable Long id, @RequestBody AssignStaffRequest req){
        return service.assignStaff(id, req);
    }

    @GetMapping("{id}/staff")
    public List<BookingStaffAssignment> ListAssigned(@PathVariable Long id){
        return service.getAssignedStaff(id);
    }
}

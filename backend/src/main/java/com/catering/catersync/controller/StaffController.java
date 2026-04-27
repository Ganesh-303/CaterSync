package com.catering.catersync.controller;


import com.catering.catersync.entity.Staff;
import com.catering.catersync.repository.StaffRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    private final StaffRepository repo;

    public StaffController(StaffRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public Staff add(@RequestBody Staff staff){
        return repo.save(staff);
    }

    @GetMapping
    public List<Staff> List() {
        return repo.findAll();
    }

    @GetMapping("/available")
    public List<Staff> available(@RequestParam(required = false) String role) {
        if (role == null || role.isBlank()) return repo.findByAvailableTrue();
        return repo.findByRoleAndAvailableTrue(role);
    }
    @PutMapping("/{id}/availability")
    public Staff setAvailability(@PathVariable Long id, @RequestParam boolean available) {
        Staff s = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("staff not found"));
        s.setAvailable(available);
        return repo.save(s);
    }
}

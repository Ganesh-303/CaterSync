package com.catering.catersync.service;


import com.catering.catersync.dto.AssignStaffRequest;
import com.catering.catersync.entity.BookingStaffAssignment;
import com.catering.catersync.entity.Staff;
import com.catering.catersync.repository.BookingStaffAssignmentRepository;
import com.catering.catersync.repository.StaffRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class BookingOpsService {
    private final BookingStaffAssignmentRepository assignRepo;
    private final StaffRepository staffRepo;

    public BookingOpsService(BookingStaffAssignmentRepository assignRepo, StaffRepository staffRepo) {
        this.assignRepo = assignRepo;
        this.staffRepo = staffRepo;
    }

    public List<BookingStaffAssignment> assignStaff(Long bookingId, AssignStaffRequest req){
        List<BookingStaffAssignment> saved = new ArrayList<>();
        for(Long staffId : req.getStaffIds()){
            Staff s = staffRepo.findById(staffId)
                    .orElseThrow(() -> new IllegalArgumentException("staff not found: " +staffId));
            if(!s.isAvailable()){
                throw new IllegalArgumentException("Staff not available: " +staffId);
            }
            BookingStaffAssignment a = new BookingStaffAssignment();
            a.setBookingId(bookingId);
            a.setStaffId(staffId);
            a.setDuty(req.getDuty());
            saved.add(assignRepo.save(a));

            s.setAvailable(false);
            staffRepo.save(s);

        }
        return saved;
    }
    public List<BookingStaffAssignment> getAssignedStaff(Long bookingId) {
        return assignRepo.findByBookingId(bookingId);
    }
}

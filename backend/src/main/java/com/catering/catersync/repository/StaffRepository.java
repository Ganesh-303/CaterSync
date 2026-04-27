package com.catering.catersync.repository;

import com.catering.catersync.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StaffRepository extends JpaRepository<Staff, Long>{
    List<Staff> findByAvailableTrue();
    List<Staff> findByRoleAndAvailableTrue(String role);
}

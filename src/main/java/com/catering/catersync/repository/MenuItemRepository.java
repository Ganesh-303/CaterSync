package com.catering.catersync.repository;


import com.catering.catersync.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long>{
    List<MenuItem> findByCatererId(Long catererId);

    List<MenuItem> findByCatererAndFlashTrue(Long catererId);

    List<MenuItem> findByCatererIdAndCategory(Long catererId, String category);

}

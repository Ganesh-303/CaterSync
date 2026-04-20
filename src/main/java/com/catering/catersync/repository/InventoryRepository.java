package com.catering.catersync.repository;

import com.catering.catersync.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {
    List<InventoryItem> findByInventoryItemId(long inventoryItemId);
}

package com.catering.catersync.service;

import com.catering.catersync.entity.InventoryItem;
import com.catering.catersync.repository.InventoryRepository;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
public class InventoryService {
    private  final InventoryRepository repo;

    public InventoryService(InventoryRepository repo) {
        this.repo = repo;
    }

    public InventoryItem addOrUpdate(InventoryItem item){
        return repo.save(item);
    }

    public List<InventoryItem> listAll(){
        return repo.findAll();
    }

    public InventoryItem adjustQuantity(Long itemId, int delta){
        InventoryItem item = repo.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory item not found "+itemId));
        int newQty = item.getQuantity() + delta;
        if(newQty < 0) throw new IllegalArgumentException("not enough stock for itemId= "+itemId);
        item.setQuantity(newQty);
        return repo.save(item);
    }
}

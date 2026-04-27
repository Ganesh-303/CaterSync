package com.catering.catersync.controller;


import com.catering.catersync.entity.InventoryItem;
import com.catering.catersync.service.InventoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService service;

    public InventoryController(InventoryService service){
        this.service = service;
    }

    @PostMapping
    public InventoryItem add(@RequestBody InventoryItem item){
        return service.addOrUpdate(item);
    }

    @GetMapping
    public List<InventoryItem> list(){
        return service.listAll();
    }
    @PutMapping("/{id}/adjust")
    public InventoryItem adjust(@PathVariable Long id,@RequestParam int delta){
        return service.adjustQuantity(id, delta);
    }

}

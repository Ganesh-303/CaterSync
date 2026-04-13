package com.catering.catersync.controller;

import com.catering.catersync.entity.MenuItem;
import com.catering.catersync.dto.*;
import com.catering.catersync.service.MenuService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/caterers/{catererId}")
public class MenuController {

    private final MenuService service;

    public MenuController(MenuService service){
        this.service = service;
    }
    //POST /api/caterers/{catererId}/menu
    @PostMapping("/menu")
    public MenuItem addMenuItem (@PathVariable Long catererId,
                                 @RequestBody MenuItemRequest request){
        return service.addMenuItem(catererId, request);
    }
    //Get /api/caterers/{catererId}/menu
    // Optional: ?category =APPETIZER
    @GetMapping("/menu")
    public List<MenuItem> getMenu(@PathVariable Long catererId,
                                  @RequestParam(required = false) String category){
        return service.getMenu(catererId, category);

    }

    //GET /api/caterers/{catererId}/flash-menu
    //Body: {"menuItemIds": [1,2,5]}
    @PostMapping("/flash-menu")
    public String setFlashMenu(@PathVariable Long catererId,
                               @RequestBody FlashMenuRequest request) {
        service.setFlashMenu(catererId, request);
        return "Flash menu updated";
    }
}

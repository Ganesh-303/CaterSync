package com.catering.catersync.service;

import com.catering.catersync.dto.*;
import com.catering.catersync.entity.MenuItem;
import com.catering.catersync.repository.MenuItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MenuService {
    private final MenuItemRepository repo;

    public MenuService(MenuItemRepository repo) {
        this.repo = repo;
    }

    //add item to caterer menu
    public MenuItem addMenuItem(Long catererId, MenuItemRequest req) {
        MenuItem item = new MenuItem();
        item.setCatererId(catererId);
        item.setCategory(req.getCategory());
        item.setName(req.getName());
        item.setVeg(req.isVeg());
        item.setPrice(req.getPrice());
        item.setFlash(false);
        return repo.save(item);
    }

    public List<MenuItem> getMenu(Long catererId, String category){
        if (category == null || category.isBlank()){
            return repo.findByCatererId(catererId);
        }
        return repo.findByCatererIdAndCategory(catererId, category);
    }

    public List<MenuItem> getFlashMenu(Long catererId){
        return repo.findByCatererAndFlashTrue(catererId);

    }

    //set flash Menu: mark given items flash = true and others flash = false (for same caterer)
    public void setFlashMenu(Long catererId, FlashMenuRequest request){
        List<MenuItem> all = repo.findByCatererId(catererId);

        for (MenuItem item : all) {
           boolean shouldBeFlash = request.getMenuItemIds() != null && request.getMenuItemIds().contains(item.getId());
           item.setFlash(shouldBeFlash);
        }
        repo.saveAll(all);

    }
}

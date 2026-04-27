package com.catering.catersync.dto;


import java.util.List;

public class FlashMenuRequest {
    private List<Long> menuItemIds;

    public List<Long> getMenuItemIds() {
        return menuItemIds;
    }

    public void setMenuItemIds(List<Long> menuItemIds) {
        this.menuItemIds = menuItemIds;
    }
}

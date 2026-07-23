package com.catering.catersync.dto;

import java.util.List;

public class CatererAvailabilityResponse {
    private boolean available;
    private List<String> reasons;
    private List<InventoryShortage> shortages;

    public CatererAvailabilityResponse() {}

    public CatererAvailabilityResponse(boolean available, List<String> reasons, List<InventoryShortage> shortages) {
        this.available = available;
        this.reasons = reasons;
        this.shortages = shortages;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public List<String> getReasons() {
        return reasons;
    }

    public void setReasons(List<String> reasons) {
        this.reasons = reasons;
    }

    public List<InventoryShortage> getShortages() {
        return shortages;
    }

    public void setShortages(List<InventoryShortage> shortages) {
        this.shortages = shortages;
    }

    public static class InventoryShortage {
        private String itemName;
        private int required;
        private int available;

        public InventoryShortage() {}

        public InventoryShortage(String itemName, int required, int available) {
            this.itemName = itemName;
            this.required = required;
            this.available = available;
        }

        public String getItemName() {
            return itemName;
        }

        public void setItemName(String itemName) {
            this.itemName = itemName;
        }

        public int getRequired() {
            return required;
        }

        public void setRequired(int required) {
            this.required = required;
        }

        public int getAvailable() {
            return available;
        }

        public void setAvailable(int available) {
            this.available = available;
        }
    }
}

package com.catering.catersync.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class InventoryUsageRequest {
    @NotNull(message = "inventoryItemId is required")
    private Long inventoryItemId;

    @Min(value = 1,message = "qty must be >= 1")
    private int qty;

    public Long getInventoryItemId() {
        return inventoryItemId;
    }

    public void setInventoryItemId(Long inventoryItemId) {
        this.inventoryItemId = inventoryItemId;
    }

    public int getQty() {
        return qty;
    }

    public void setQty(int qty) {
        this.qty = qty;
    }
}

package com.catering.catersync.mapper;

import com.catering.catersync.dto.BookingItemResponse;
import com.catering.catersync.dto.BookingResponse;
import com.catering.catersync.entity.Booking;

public class BookingMapper {
    public static BookingResponse toDto(Booking b){
        BookingResponse r = new BookingResponse();
        r.setId(b.getId());
        r.setBookingType(b.getBookingType().name());
        r.setEventDate(b.getEventDate());
        r.setStatus(b.getStatus().name());
        r.setTotalPrice(b.getTotalPrice());
        r.setGuestCount(b.getGuestCount());

        var itemDtos = b.getItems().stream().map(i ->{
            BookingItemResponse ir = new BookingItemResponse();
            ir.setId(i.getId());
            ir.setCatererId(i.getCatererId());
            ir.setMenuItemId(i.getMenuItemId());
            ir.setItemName(i.getItemName());
            ir.setVeg(i.isVeg());
            ir.setPrice(i.getPrice());
            ir.setQuantity(i.getQuantity());
            return ir;
        }).toList();

        r.setItems(itemDtos);
        return r;
    }
}

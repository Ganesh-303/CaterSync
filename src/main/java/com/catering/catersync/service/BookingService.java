package com.catering.catersync.service;

import com.catering.catersync.dto.CatererSelection;
import com.catering.catersync.dto.CustomBookingRequest;
import com.catering.catersync.dto.FlashBookingRequest;
import com.catering.catersync.entity.*;
import com.catering.catersync.repository.BookingRepository;
import com.catering.catersync.repository.MenuItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepo;
    private final MenuItemRepository menuRepo;

    public BookingService(BookingRepository bookingRepo, MenuItemRepository menuRepo){
        this.bookingRepo = bookingRepo;
        this.menuRepo = menuRepo;
    }

    public Booking createFlashBooking(FlashBookingRequest req) {
        //#1 get flash menu items from caterer
        List<MenuItem> flashItems = menuRepo.findByCatererIdAndFlashTrue(req.getCatererId());

        //#2 optinally filter based on vegtype
        boolean wantVeg = "VEG".equalsIgnoreCase(req.getVegType());
        List<MenuItem> finalItems = flashItems.stream()
                .filter(mi -> mi.isVeg() == wantVeg)
                .toList();
        //#3 compute total price(sum of menu item prices )
        double total = finalItems.stream().mapToDouble(MenuItem::getPrice).sum();

        //#4 create Booking
        Booking booking = new Booking();
        booking.setUserId(req.getUserId());
        booking.setBookingType(BookingType.FLASH);
        booking.setEventDate(req.getEventDate());
        booking.setStatus(BookingStatus.CREATED);
        booking.setTotalPrice(total);

        //#5 create booking items snapshot
        for (MenuItem mi : finalItems) {
            BookingItem bi = new BookingItem();
            bi.setCatererId(req.getCatererId());
            bi.setMenuItemId(mi.getId());
            bi.setItemName(mi.getName());
            bi.setVeg(mi.isVeg());
            bi.setPrice(mi.getPrice());
            bi.setQuantity(1);
            booking.addItem(bi);
        }
        return bookingRepo.save(booking);
    }
        public Booking createCustomBooking(CustomBookingRequest req) {
            Booking booking = new Booking();
            booking.setUserId(req.getUserId());
            booking.setBookingType(BookingType.CUSTOM);
            booking.setEventDate(req.getEventDate());
            booking.setStatus(BookingStatus.CREATED);

            double total = 0.0;

            for (CatererSelection sel : req.getSelections()){
                List<MenuItem> items = menuRepo.findAllById(sel.getMenuItemIds());

                //ensure items belong to this caterer (important for correctness)
                for (MenuItem mi : items){
                    if (!sel.getCatererId().equals(mi.getCatererId())){
                        throw new IllegalArgumentException(
                                "Menu item "+ mi.getId()+  " does not belong to this caterer "+sel.getCatererId()
                        );
                    }
                    BookingItem bi = new BookingItem();
                    bi.setCatererId(sel.getCatererId());
                    bi.setMenuItemId(mi.getId());
                    bi.setItemName(mi.getName());
                    bi.setVeg(mi.isVeg());
                    bi.setPrice(mi.getPrice());
                    bi.setQuantity(1);

                    booking.addItem(bi);
                    total += mi.getPrice();
                }
            }
            booking.setTotalPrice(total);

            return bookingRepo.save(booking);

        }
        public Booking getBooking(Long bookingId){
            return bookingRepo.findById(bookingId)
                    .orElseThrow(() -> new IllegalArgumentException("Booking not found: "+bookingId));
        }

}

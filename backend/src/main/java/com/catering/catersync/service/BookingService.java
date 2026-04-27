package com.catering.catersync.service;

import com.catering.catersync.dto.CatererSelection;
import com.catering.catersync.dto.CustomBookingRequest;
import com.catering.catersync.dto.FlashBookingRequest;
import com.catering.catersync.entity.*;
import com.catering.catersync.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepo;
    private final MenuItemRepository menuRepo;

    private final BookingStaffAssignmentRepository bookingStaffRepo;
    private final StaffRepository staffRepo;

    private final BookingInventoryUsageRepository bookingInventoryRepo;
    private final InventoryRepository inventoryRepo;


    public BookingService(BookingRepository bookingRepo, MenuItemRepository menuRepo, BookingStaffAssignmentRepository bookingStaffRepo, StaffRepository staffRepo, BookingInventoryUsageRepository bookingInventoryRepo, InventoryRepository inventoryRepo) {
        this.bookingRepo = bookingRepo;
        this.menuRepo = menuRepo;
        this.bookingStaffRepo = bookingStaffRepo;
        this.staffRepo = staffRepo;
        this.bookingInventoryRepo = bookingInventoryRepo;
        this.inventoryRepo = inventoryRepo;
    }



    public Booking createFlashBooking(FlashBookingRequest req) {
        //#1 get flash menu items from caterer
        List<MenuItem> flashItems = menuRepo.findByCatererIdAndFlashTrue(req.getCatererId());

        //#2 optinaly filter based on vegtype
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


        @Transactional
        public Booking cancelBooking(Long bookingId){
            Booking booking = bookingRepo.findById(bookingId)
                    .orElseThrow(() -> new IllegalArgumentException("Booking not found: "+bookingId));

            //if already cancelled, no-op
            if (booking.getStatus()== BookingStatus.CANCELLED) {return booking;}

            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepo.save(booking);
            // release staff
            List<BookingStaffAssignment> assignments = bookingStaffRepo.findByBookingId(bookingId);
            for(BookingStaffAssignment a : assignments){
                Staff s = staffRepo.findById(a.getStaffId())
                        .orElseThrow(() -> new IllegalArgumentException("staff not found: " + a.getStaffId()));
                s.setAvailable(true);
                staffRepo.save(s);
            }
            bookingStaffRepo.deleteByBookingId(bookingId);

            restoreInventoryForBooking(bookingId);
            return booking;

        }
        @Transactional
        public void allocateInventory(Long bookingId, Long inventoryItemId, int qty){
        if (qty <= 0) throw new IllegalArgumentException("qty must be > 0");
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));
        if (booking.getStatus() == BookingStatus.CANCELLED){
            throw new IllegalArgumentException("cannot allocate inventory to cancelled booking");
        }
        InventoryItem item = inventoryRepo.findById(inventoryItemId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory item not found: "+inventoryItemId));

        int newQty = item.getQuantity() - qty;
        if (newQty < 0){
            throw new IllegalArgumentException("Not enough stock for itemId= "+inventoryItemId);
        }
        item.setQuantity(newQty);
        inventoryRepo.save(item);

        BookingInventoryUsage usage = new BookingInventoryUsage();
        usage.setBookingId(bookingId);
        usage.setInventoryItemId(inventoryItemId);
        usage.setUsedQty(qty);
        bookingInventoryRepo.save(usage);
        }

        @Transactional
        public void restoreInventoryForBooking(Long bookingId){
            List<BookingInventoryUsage> usages = bookingInventoryRepo.findByBookingId(bookingId);

            for (BookingInventoryUsage u : usages){
                InventoryItem item =inventoryRepo.findById(u.getInventoryItemId())
                        .orElseThrow(() -> new IllegalArgumentException("Inventoryitem not found: "+ u.getInventoryItemId()));

                item.setQuantity(item.getQuantity()+ u.getUsedQty());
                inventoryRepo.save(item);
            }
            bookingInventoryRepo.deleteByBookingId(bookingId);
        }


}

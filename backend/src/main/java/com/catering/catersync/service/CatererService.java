package com.catering.catersync.service;


import com.catering.catersync.dto.CatererAvailabilityResponse;
import com.catering.catersync.entity.Booking;
import com.catering.catersync.entity.CatererProfile;
import com.catering.catersync.entity.InventoryItem;
import com.catering.catersync.entity.MenuItem;
import com.catering.catersync.entity.Staff;
import com.catering.catersync.repository.BookingRepository;
import com.catering.catersync.repository.CatererRepository;
import com.catering.catersync.repository.InventoryRepository;
import com.catering.catersync.repository.MenuItemRepository;
import com.catering.catersync.repository.StaffRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class CatererService {
    private final CatererRepository repo;
    private final BookingRepository bookingRepo;
    private final InventoryRepository inventoryRepo;
    private final MenuItemRepository menuRepo;
    private final StaffRepository staffRepo;

    public CatererService(CatererRepository repo, BookingRepository bookingRepo,
                          InventoryRepository inventoryRepo, MenuItemRepository menuRepo,
                          StaffRepository staffRepo) {
        this.repo = repo;
        this.bookingRepo = bookingRepo;
        this.inventoryRepo = inventoryRepo;
        this.menuRepo = menuRepo;
        this.staffRepo = staffRepo;
    }

    public CatererProfile register(CatererProfile c) {
        return repo.save(c);
    }

    public List<CatererProfile> getAll() {
        return repo.findAll();
    }

    public CatererProfile getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Caterer not found: " + id));
    }

    public List<CatererProfile> getAvailableOnDate(LocalDate date) {
        List<CatererProfile> allAvailable = repo.findAll().stream()
                .filter(CatererProfile::isAvailable)
                .toList();

        List<Booking> bookingsOnDate = bookingRepo.findByEventDate(date);
        java.util.Set<Long> busyCatererIds = bookingsOnDate.stream()
                .filter(b -> b.getStatus() != com.catering.catersync.entity.BookingStatus.CANCELLED)
                .flatMap(b -> b.getItems().stream())
                .map(item -> item.getCatererId())
                .collect(java.util.stream.Collectors.toSet());

        return allAvailable.stream()
                .filter(c -> !busyCatererIds.contains(c.getUserId()))
                .toList();
    }

    public CatererAvailabilityResponse checkAvailability(Long catererId, LocalDate date, int guestCount, List<Long> menuItemIds) {
        CatererProfile caterer = repo.findById(catererId)
                .orElseThrow(() -> new IllegalArgumentException("Caterer not found: " + catererId));

        List<String> reasons = new ArrayList<>();
        List<CatererAvailabilityResponse.InventoryShortage> shortages = new ArrayList<>();

        // 1. General Profile Availability & notice period
        if (!caterer.isAvailable()) {
            reasons.add("Caterer profile is marked as inactive/unavailable");
        }

        LocalDate today = LocalDate.now();
        LocalDate earliestDate = today.plusDays(caterer.getMinNoticeDays());
        if (date.isBefore(earliestDate)) {
            reasons.add("Booking date " + date + " is too soon. Minimum notice period is " 
                    + caterer.getMinNoticeDays() + " days (earliest available: " + earliestDate + ")");
        }

        // 2. Global Admin Daily Limit Check (max 5 orders per date)
        List<Booking> allBookingsOnDate = bookingRepo.findByEventDate(date);
        long activeGlobalBookingsCount = allBookingsOnDate.stream()
                .filter(b -> b.getStatus() != com.catering.catersync.entity.BookingStatus.CANCELLED)
                .count();
        if (activeGlobalBookingsCount >= 5) {
            reasons.add("Admin daily order limit of 5 bookings has been reached for this date");
        }

        // 3. Caterer Max Bookings & Capacity Checks on date
        List<Booking> activeCatererBookingsOnDate = allBookingsOnDate.stream()
                .filter(b -> b.getStatus() != com.catering.catersync.entity.BookingStatus.CANCELLED)
                .filter(b -> b.getItems().stream().anyMatch(item -> item.getCatererId().equals(catererId)))
                .toList();

        int activeCatererBookingsCount = activeCatererBookingsOnDate.size();
        if (activeCatererBookingsCount + 1 > caterer.getMaxBookings()) {
            reasons.add("Caterer daily limit of " + caterer.getMaxBookings() + " bookings has been reached");
        }

        int activeCatererGuestsSum = activeCatererBookingsOnDate.stream()
                .mapToInt(Booking::getGuestCount)
                .sum();
        if (activeCatererGuestsSum + guestCount > caterer.getMaxCapacity()) {
            reasons.add("Caterer daily capacity of " + caterer.getMaxCapacity() 
                    + " guests would be exceeded (current: " + activeCatererGuestsSum 
                    + ", requested: " + guestCount + ")");
        }

        // 4. Menu Verification
        if (menuItemIds != null && !menuItemIds.isEmpty()) {
            List<MenuItem> items = menuRepo.findAllById(menuItemIds);
            for (MenuItem item : items) {
                if (!item.getCatererId().equals(catererId)) {
                    reasons.add("Menu item '" + item.getName() + "' (ID: " + item.getId() + ") does not belong to this caterer");
                }
            }
            if (items.size() < menuItemIds.size()) {
                reasons.add("One or more requested menu items do not exist");
            }
        } else {
            List<MenuItem> catererMenu = menuRepo.findByCatererId(catererId);
            if (catererMenu.isEmpty()) {
                reasons.add("Caterer does not have any menu items registered");
            }
        }

        // 5. Staff & Logistics Vehicle Inventory check
        List<Staff> availableStaff = staffRepo.findByAvailableTrue();
        
        long availableManagers = availableStaff.stream().filter(s -> "MANAGER".equalsIgnoreCase(s.getRole())).count();
        long availableDrivers = availableStaff.stream().filter(s -> "DRIVER".equalsIgnoreCase(s.getRole())).count();
        long availableVehicles = availableStaff.stream().filter(s -> 
            "VEHICLE".equalsIgnoreCase(s.getRole()) || 
            "VAN".equalsIgnoreCase(s.getRole()) || 
            "HEAVY_VAN".equalsIgnoreCase(s.getRole()) || 
            "LOGISTICS".equalsIgnoreCase(s.getRole())
        ).count();
        long availableSupport = availableStaff.stream().filter(s -> "SUPPORT_STAFF".equalsIgnoreCase(s.getRole())).count();
        long availableServing = availableStaff.stream().filter(s -> 
            "SERVING_STAFF".equalsIgnoreCase(s.getRole()) || 
            "WAITER".equalsIgnoreCase(s.getRole()) || 
            "CHEF".equalsIgnoreCase(s.getRole())
        ).count();

        // Required staff counts (Manager: 1, Driver: 1, Vehicle: 1, Support: 2, Serving: 1 per 10 guests)
        int reqManagers = 1;
        int reqDrivers = 1;
        int reqVehicles = 1;
        int reqSupport = 2;
        int reqServing = (int) Math.max(1, Math.ceil((double) guestCount / 10.0));

        if (availableManagers < reqManagers) {
            shortages.add(new CatererAvailabilityResponse.InventoryShortage("Manager", reqManagers, (int) availableManagers));
        }
        if (availableDrivers < reqDrivers) {
            shortages.add(new CatererAvailabilityResponse.InventoryShortage("Driver", reqDrivers, (int) availableDrivers));
        }
        if (availableVehicles < reqVehicles) {
            shortages.add(new CatererAvailabilityResponse.InventoryShortage("Vehicle", reqVehicles, (int) availableVehicles));
        }
        if (availableSupport < reqSupport) {
            shortages.add(new CatererAvailabilityResponse.InventoryShortage("Support Staff", reqSupport, (int) availableSupport));
        }
        if (availableServing < reqServing) {
            shortages.add(new CatererAvailabilityResponse.InventoryShortage("Serving Staff", reqServing, (int) availableServing));
        }

        if (!shortages.isEmpty()) {
            reasons.add("Deficient staff/vehicle logistics inventory in system to fulfill order demands");
        }

        boolean isAvailable = reasons.isEmpty();
        return new CatererAvailabilityResponse(isAvailable, reasons, shortages);
    }

    public CatererProfile updateProfile(Long id, CatererProfile details) {
        CatererProfile existing = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Caterer not found: " + id));
        existing.setVegType(details.getVegType());
        existing.setServices(details.getServices());
        existing.setStyles(details.getStyles());
        existing.setMinNoticeDays(details.getMinNoticeDays());
        existing.setFlashEnabled(details.isFlashEnabled());
        existing.setCustomEnabled(details.isCustomEnabled());
        existing.setAvailable(details.isAvailable());
        existing.setMaxCapacity(details.getMaxCapacity());
        existing.setMaxBookings(details.getMaxBookings());
        return repo.save(existing);
    }
}

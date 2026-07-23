import React, { useState, useEffect } from 'react';
import { api } from './services/api';

const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

function App() {
  // Authentication Role Simulation
  const [currentUserRole, setCurrentUserRole] = useState('CUSTOMER'); // 'CUSTOMER' | 'CATERER' | 'ADMIN'
  const [currentUserId, setCurrentUserId] = useState(4); // 4 for Customer (seeded), 1 for Caterer (Royal Feast)

  // Navigation / View Tabs
  const [view, setView] = useState('discover'); // 'discover' for customer tab

  // Health status
  const [serverOnline, setServerOnline] = useState(false);

  // Dynamic Lists
  const [caterers, setCaterers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [userBookings, setUserBookings] = useState([]); // bookings for current customer
  const [catererBookings, setCatererBookings] = useState([]); // bookings for current caterer
  const [inventoryUsages, setInventoryUsages] = useState([]);
  const [filterDate, setFilterDate] = useState('');

  // Filtering & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [vegTypeFilter, setVegTypeFilter] = useState('');

  // Active selection states
  const [selectedCaterer, setSelectedCaterer] = useState(null);
  const [catererMenu, setCatererMenu] = useState([]);
  const [catererFlashMenu, setCatererFlashMenu] = useState([]);

  // Admin coordination selections
  const [selectedBookingForCoordination, setSelectedBookingForCoordination] = useState(null);
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  const [allocatedStockItem, setAllocatedStockItem] = useState('');
  const [allocatedStockQty, setAllocatedStockQty] = useState('');

  // Interactive Modals
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Shopping Cart for Custom Booking
  const [customCart, setCustomCart] = useState([]); // [{ catererId, item }]
  const [customBookingDate, setCustomBookingDate] = useState('');
  const [customBookingGuestCount, setCustomBookingGuestCount] = useState(50);

  // Form Payloads
  const [bookingPayload, setBookingPayload] = useState({ eventDate: '', vegType: 'VEG', guestCount: 50 });
  const [reviewPayload, setReviewPayload] = useState({ stars: 5, comment: '' });

  // Caterer Roster Forms
  const [catererForm, setCatererForm] = useState({
    userId: 1, vegType: 'VEG', services: 'Royal Banquets, Buffet Layouts, Mocktail Bars', styles: 'North Indian, Punjabi, Jain', minNoticeDays: 3, flashEnabled: true, customEnabled: true
  });
  const [catererNewDish, setCatererNewDish] = useState({ name: '', price: '', category: 'APPETIZER', veg: true, flashEnabled: false });

  // Roster Forms
  const [staffForm, setStaffForm] = useState({ name: '', role: 'SERVING_STAFF', available: true });
  const [inventoryForm, setInventoryForm] = useState({ itemName: '', quantity: '', unit: 'pcs' });

  // Notifications
  const [toast, setToast] = useState(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Trigger brief alert toast
  const triggerToast = (msg, isErr = false) => {
    setToast({ msg, isErr });
    setTimeout(() => setToast(null), 3000);
  };

  // Heartbeat server ping
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await api.checkHealth();
        if (res === 'OK') setServerOnline(true);
      } catch (err) {
        setServerOnline(false);
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch core arrays
  const refreshData = async (userId, userRole) => {
    const uid = userId !== undefined ? userId : currentUserId;
    const role = userRole !== undefined ? userRole : currentUserRole;
    try {
      const caterersList = await api.getCaterers();
      setCaterers(caterersList);
    } catch (err) { console.error('getCaterers failed:', err?.response?.data || err.message); }

    try {
      const staffList = await api.getStaff();
      setStaff(staffList);
    } catch (err) { console.error('getStaff failed:', err?.response?.data || err.message); }

    try {
      const inventoryList = await api.getInventory();
      setInventory(inventoryList);
    } catch (err) { console.error('getInventory failed:', err?.response?.data || err.message); }

    try {
      const bookingsList = await api.getBookings();
      setBookings(bookingsList);
    } catch (err) { console.error('getBookings failed:', err?.response?.data || err.message); }

    try {
      const usagesList = await api.getInventoryUsages();
      setInventoryUsages(usagesList);
    } catch (err) { console.error('getInventoryUsages failed:', err?.response?.data || err.message); }

    // Load role-specific booking lists from dedicated endpoints
    if (role === 'CUSTOMER') {
      try {
        const myBookings = await api.getBookingsByUser(uid);
        setUserBookings(myBookings);
      } catch (err) {
        console.error('getBookingsByUser failed:', err?.response?.data || err.message);
        setUserBookings([]);
      }
    } else if (role === 'CATERER') {
      try {
        const myCatBookings = await api.getBookingsByCaterer(uid);
        setCatererBookings(myCatBookings);
      } catch (err) {
        console.error('getBookingsByCaterer failed:', err?.response?.data || err.message);
        setCatererBookings([]);
      }
    } else if (role === 'ADMIN') {
      // Admin sees all bookings — already loaded above
    }
  };

  useEffect(() => {
    if (serverOnline) {
      refreshData(currentUserId, currentUserRole);
    }
  }, [serverOnline]);

  const handleRoleChange = (role) => {
    let newUserId = currentUserId;
    setCurrentUserRole(role);
    if (role === 'CUSTOMER') {
      newUserId = 4; // Customer userId 4 (use a real seeded user)
      setCurrentUserId(newUserId);
      setView('discover');
    } else if (role === 'CATERER') {
      newUserId = 1; // Maps to Royal Feast (caterer userId=1)
      setCurrentUserId(newUserId);
      setView('caterer-dashboard');
      // Load current settings of Caterer 1
      const royal = caterers.find(c => c.userId === 1);
      if (royal) {
        setCatererForm({
          userId: royal.userId,
          vegType: royal.vegType,
          services: royal.services || '',
          styles: royal.styles || '',
          minNoticeDays: royal.minNoticeDays,
          flashEnabled: royal.flashEnabled,
          customEnabled: royal.customEnabled,
          maxCapacity: royal.maxCapacity || 1000,
          maxBookings: royal.maxBookings || 3
        });
      }
    } else if (role === 'ADMIN') {
      newUserId = 99;
      setCurrentUserId(newUserId);
      setView('admin-dashboard');
    }
    triggerToast(`Switched view: Logged in as ${role}`);
    refreshData(newUserId, role);
  };

  // Search filter caterers
  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!serverOnline) return;
    try {
      const results = await api.searchCaterers({ query: searchQuery });
      if (results && results.length > 0) {
        setCaterers(results);
      } else {
        const all = await api.getCaterers();
        const queryLower = searchQuery.toLowerCase();
        const filtered = all.filter(c =>
          (c.vegType?.toLowerCase().includes(queryLower)) ||
          (c.services?.toLowerCase().includes(queryLower)) ||
          (c.styles?.toLowerCase().includes(queryLower)) ||
          (c.userId.toString() === searchQuery)
        );
        setCaterers(filtered);
      }
    } catch (err) {
      triggerToast("Search failed: connection error.", true);
    }
  };

  // Select a Caterer card to load detailed menus
  const handleSelectCaterer = async (caterer) => {
    setSelectedCaterer(caterer);
    try {
      const menu = await api.getMenu(caterer.userId);
      setCatererMenu(menu);

      if (caterer.flashEnabled) {
        const flash = await api.getFlashMenu(caterer.userId);
        setCatererFlashMenu(flash);
      } else {
        setCatererFlashMenu([]);
      }
    } catch (err) {
      setCatererMenu([]);
      setCatererFlashMenu([]);
    }
  };

  // Seed baseline data
  const handleSeedDatabase = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    try {
      await api.seedDatabase();
      triggerToast("Database populated with premium data successfully!");
      refreshData();
    } catch (err) {
      triggerToast("Seeding failed: check server status.", true);
    } finally {
      setIsSeeding(false);
    }
  };

  // CUSTOMER: Add menu item to custom cart
  const handleAddToCart = (item) => {
    if (customCart.some(c => c.item.id === item.id)) {
      triggerToast("Dish already added to cart!");
      return;
    }
    setCustomCart([...customCart, { catererId: selectedCaterer.userId, item }]);
    triggerToast(`Added ${item.name} to custom booking cart!`);
  };

  // CUSTOMER: Remove item from cart
  const handleRemoveFromCart = (itemId) => {
    setCustomCart(customCart.filter(c => c.item.id !== itemId));
  };

  // CUSTOMER: Submit dynamic Custom Booking
  const handleCustomBookingSubmit = async () => {
    if (!customBookingDate) {
      triggerToast("Please select an event date for booking.", true);
      return;
    }
    if (customCart.length === 0) {
      triggerToast("Your custom cart is empty.", true);
      return;
    }

    try {
      // Group menu items by caterer
      const selectionsMap = {};
      customCart.forEach(cartItem => {
        if (!selectionsMap[cartItem.catererId]) {
          selectionsMap[cartItem.catererId] = [];
        }
        selectionsMap[cartItem.catererId].push(cartItem.item.id);
      });

      const selections = Object.keys(selectionsMap).map(catererId => ({
        catererId: parseInt(catererId),
        menuItemIds: selectionsMap[catererId]
      }));

      const req = {
        userId: currentUserId,
        eventDate: customBookingDate,
        selections,
        guestCount: parseInt(customBookingGuestCount)
      };

      await api.createCustomBooking(req);
      triggerToast("Custom event booking submitted successfully!");
      setCustomCart([]);
      setCustomBookingDate('');
      setCustomBookingGuestCount(50);
      refreshData(currentUserId, currentUserRole);
    } catch (err) {
      const msg = err?.response?.data?.message || "Custom booking failed. Check date, notice limits or capacity.";
      triggerToast(msg, true);
    }
  };

  // CUSTOMER: Book quick flash package
  const handleFlashBooking = async (e) => {
    e.preventDefault();
    if (!bookingPayload.eventDate) {
      triggerToast("Please select an event date.", true);
      return;
    }
    try {
      const req = {
        userId: currentUserId,
        catererId: selectedCaterer.userId,
        vegType: bookingPayload.vegType,
        eventDate: bookingPayload.eventDate,
        guestCount: parseInt(bookingPayload.guestCount || 50)
      };
      await api.createFlashBooking(req);
      triggerToast("Flash instant booking placed!");
      setShowBookingModal(false);
      setBookingPayload({ eventDate: '', vegType: 'VEG', guestCount: 50 });
      refreshData(currentUserId, currentUserRole);
    } catch (err) {
      const msg = err?.response?.data?.message || "Booking failed: check notice, capacity, or roster limits.";
      triggerToast(msg, true);
    }
  };

  // CUSTOMER: Submit review feedback
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const req = {
        catererId: selectedCaterer.userId,
        bookingId: 10,
        userId: currentUserId,
        stars: parseInt(reviewPayload.stars),
        comment: reviewPayload.comment
      };
      await api.submitReview(req);
      triggerToast("Review posted successfully!");
      setShowReviewModal(false);
      setReviewPayload({ stars: 5, comment: '' });
      refreshData();
    } catch (err) {
      triggerToast("Failed to submit review.", true);
    }
  };

  // CATERER: Update profile details & settings
  const handleUpdateCatererProfile = async (e) => {
    e.preventDefault();
    try {
      await api.updateCatererProfile(currentUserId, {
        ...catererForm,
        userId: parseInt(currentUserId),
        minNoticeDays: parseInt(catererForm.minNoticeDays),
        maxCapacity: parseInt(catererForm.maxCapacity || 1000),
        maxBookings: parseInt(catererForm.maxBookings || 3)
      });
      triggerToast("Caterer profile updated successfully!");
      refreshData();
    } catch (err) {
      triggerToast("Failed to update profile settings.", true);
    }
  };

  // CATERER: Add new menu dish
  const handleAddCatererDish = async (e) => {
    e.preventDefault();
    if (!catererNewDish.name || !catererNewDish.price) return;
    try {
      await api.addMenuItem(currentUserId, {
        name: catererNewDish.name,
        price: parseFloat(catererNewDish.price),
        category: catererNewDish.category,
        veg: catererNewDish.veg,
        flashEnabled: catererNewDish.flashEnabled
      });
      triggerToast(`Dish "${catererNewDish.name}" registered successfully!`);
      setCatererNewDish({ name: '', price: '', category: 'APPETIZER', veg: true, flashEnabled: false });

      // Reload active caterer menu
      const menu = await api.getMenu(currentUserId);
      setCatererMenu(menu);
      refreshData();
    } catch (err) {
      triggerToast("Failed to register menu dish.", true);
    }
  };

  // CATERER: Publish item to flash menu toggle
  const handleToggleFlashItem = async (menuItem) => {
    try {
      const updated = {
        ...menuItem,
        flashEnabled: !menuItem.flashEnabled
      };
      // For simplified seeded implementation, we toggle directly by registering
      await api.addMenuItem(currentUserId, updated);
      triggerToast("Flash menu option updated.");
      const menu = await api.getMenu(currentUserId);
      setCatererMenu(menu);
      refreshData();
    } catch (err) {
      triggerToast("Failed to adjust flash list.", true);
    }
  };

  // ADMIN: Staff management
  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!staffForm.name) return;
    try {
      await api.addStaff(staffForm);
      triggerToast("Staff member rostered.");
      setStaffForm({ name: '', role: 'SERVING_STAFF', available: true });
      refreshData();
    } catch (err) {
      triggerToast("Failed to add staff.", true);
    }
  };

  const handleToggleStaff = async (id, currentVal) => {
    try {
      await api.setStaffAvailability(id, !currentVal);
      triggerToast("Staff availability updated.");
      refreshData();
    } catch (err) {
      triggerToast("Failed to change status.", true);
    }
  };

  // ADMIN: Inventory management
  const handleAddInventory = async (e) => {
    e.preventDefault();
    if (!inventoryForm.itemName || !inventoryForm.quantity) return;
    try {
      await api.addInventory({
        itemName: inventoryForm.itemName,
        quantity: parseInt(inventoryForm.quantity),
        unit: inventoryForm.unit
      });
      triggerToast("Stock item registered.");
      setInventoryForm({ itemName: '', quantity: '', unit: 'pcs' });
      refreshData();
    } catch (err) {
      triggerToast("Failed to register stock.", true);
    }
  };

  const handleAdjustInventory = async (id, delta) => {
    try {
      await api.adjustInventory(id, delta);
      triggerToast("Stock levels adjusted.");
      refreshData();
    } catch (err) {
      triggerToast("Failed to adjust quantity.", true);
    }
  };

  // ADMIN: Coordinator Select Booking
  const handleSelectBookingForCoordination = async (booking) => {
    setSelectedBookingForCoordination(booking);
    setSelectedStaffIds([]);
    try {
      const assigned = await api.getAssignedStaff(booking.id);
      setSelectedStaffIds(assigned.map(a => a.staffId));
    } catch (err) {
      setSelectedStaffIds([]);
    }
  };

  // ADMIN: Allocate stock to selected booking
  const handleAllocateStock = async (e) => {
    e.preventDefault();
    if (!selectedBookingForCoordination) {
      triggerToast("Please select a booking card first.", true);
      return;
    }
    if (!allocatedStockItem || !allocatedStockQty) return;
    try {
      await api.allocateInventory(
        selectedBookingForCoordination.id,
        {
          inventoryItemId: parseInt(allocatedStockItem),
          qty: parseInt(allocatedStockQty)
        }
      );
      triggerToast("Materials allocated successfully!");
      setAllocatedStockQty('');
      refreshData();
      // Reload booking to see updated totals/status if needed
      const updated = await api.getBooking(selectedBookingForCoordination.id);
      setSelectedBookingForCoordination(updated);
    } catch (err) {
      triggerToast("Stock allocation failed: insufficient quantities.", true);
    }
  };

  // ADMIN: Assign staff roster to booking
  const handleAssignStaffSubmit = async () => {
    if (!selectedBookingForCoordination) {
      triggerToast("Please select a booking card first.", true);
      return;
    }
    try {
      await api.assignStaff(selectedBookingForCoordination.id, selectedStaffIds);
      triggerToast("Roster staff assigned to the event!");
      refreshData();
    } catch (err) {
      triggerToast("Staff assignment failed.", true);
    }
  };

  const handleStaffCheckboxChange = (staffId) => {
    if (selectedStaffIds.includes(staffId)) {
      setSelectedStaffIds(selectedStaffIds.filter(id => id !== staffId));
    } else {
      setSelectedStaffIds([...selectedStaffIds, staffId]);
    }
  };

  // ADMIN: Cancel booking
  const handleCancelBooking = async (id) => {
    try {
      await api.cancelBooking(id);
      triggerToast("Booking cancelled. Stock levels & staff status restored.");
      setSelectedBookingForCoordination(null);
      refreshData();
    } catch (err) {
      triggerToast("Failed to cancel booking.", true);
    }
  };

  const handleConfirmBooking = async (id) => {
    try {
      await api.confirmBooking(id);
      triggerToast("Booking confirmed and locked successfully!");
      refreshData();
    } catch (err) {
      triggerToast("Failed to confirm booking.", true);
    }
  };

  return (
    <div className="app-wrapper">
      {/* Toast notifications */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#181d28', border: `1px solid ${toast.isErr ? '#f44336' : '#0abf73'}`,
          borderRadius: '24px', padding: '12px 24px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          zIndex: 1000, fontWeight: 600, color: '#f3f4f6', transition: 'all 0.2s ease'
        }}>
          {toast.msg}
        </div>
      )}

      {/* Navigation Header */}
      <nav className="navbar">
        <div className="container nav-container">
          <a href="#" className="nav-logo" onClick={() => handleRoleChange('CUSTOMER')}>
            <span className="logo-dot"></span>
            <span className="logo-name">CaterSync</span>
          </a>

          <div className="nav-links">
            {currentUserRole === 'CUSTOMER' && (
              <a href="#" className="nav-link active" onClick={() => { setView('discover'); setSelectedCaterer(null); }}>Find Caterers</a>
            )}
            {currentUserRole === 'CATERER' && (
              <a href="#" className="nav-link active" onClick={() => setView('caterer-dashboard')}>Caterer Panel</a>
            )}
            {currentUserRole === 'ADMIN' && (
              <a href="#" className="nav-link active" onClick={() => setView('admin-dashboard')}>Logistics Dashboard</a>
            )}

            {/* Health status indicator */}
            <div className="health-status-indicator">
              <span className={`dot-status ${serverOnline ? 'online' : 'offline'}`}></span>
              <span>{serverOnline ? 'Spring Boot Active' : 'Offline'}</span>
            </div>

            {/* Role simulation dropdown selector */}
            <div style={{ marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>ROLE:</span>
              <select
                value={currentUserRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                style={{
                  background: '#121621', border: '1px solid var(--border-glass)', borderRadius: '18px',
                  color: 'var(--color-primary)', fontWeight: 800, padding: '4px 12px', fontSize: '12px', cursor: 'pointer'
                }}
              >
                <option value="CUSTOMER">Customer (ID: 101)</option>
                <option value="CATERER">Caterer (Royal Feast)</option>
                <option value="ADMIN">Logistics Admin</option>
              </select>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Workspace content */}
      <main className="container" style={{ flexGrow: 1, paddingBottom: '60px' }}>

        {/* H2 Empty Database Seeding Call */}
        {serverOnline && caterers.length === 0 && (
          <div className="glass-card" style={{
            marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderLeft: '4px solid var(--color-accent-orange)', background: 'rgba(255, 152, 0, 0.05)'
          }}>
            <div>
              <h4 style={{ color: 'var(--color-accent-orange)', marginBottom: '4px' }}>Empty Database Detected</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Load high-quality, pre-populated caterers, catalog dishes, raw stock, and staff roster data instantly.</p>
            </div>
            <button className="btn btn-accent" onClick={handleSeedDatabase} disabled={isSeeding}>
              {isSeeding ? 'Seeding Database...' : 'Populate Baseline Data'}
            </button>
          </div>
        )}

        {/* Offline warning banner */}
        {!serverOnline && (
          <div className="glass-card" style={{
            marginTop: '32px', textAlign: 'center', border: '1px solid var(--color-accent-red)',
            background: 'rgba(244, 67, 54, 0.05)'
          }}>
            <h3 style={{ color: 'var(--color-accent-red)', marginBottom: '8px' }}>Spring Boot Server Offline</h3>
            <p style={{ maxWidth: '580px', margin: '0 auto 16px', color: 'var(--text-muted)', fontSize: '14px' }}>
              Ensure your Spring Boot project is fully booted on port <code>8080</code> inside the active workspace.
            </p>
          </div>
        )}

        {/* VIEW 1: CUSTOMER DISCOVER PORTAL */}
        {view === 'discover' && currentUserRole === 'CUSTOMER' && (
          <div style={{ animation: 'fade-in 0.3s ease' }}>
            <div className="hero-section">
              <span className="badge-tag">Gourmet Feasts</span>
              <h1 className="hero-title"><span className="gradient-text">Top-Tier Catering Services</span></h1>
              <p className="hero-subtitle">Search registered cuisines, construct custom event bookings in real time, and view operational logistics.</p>

              {/* Dynamic search bar */}
              <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', maxWidth: '800px', margin: '0 auto', justifyContent: 'center', alignItems: 'center' }}>
                <input
                  type="text"
                  className="input-field"
                  style={{ flexGrow: 1, minWidth: '260px', height: '48px', fontSize: '15px' }}
                  placeholder="Search cuisine, corporate specialities, or caterer ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                {/* Event Availability Date Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#121621', border: '1px solid var(--border-glass)', borderRadius: '24px', padding: '0 16px', height: '48px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)' }}>DATE FILTER:</span>
                  <input
                    type="date"
                    style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                  />
                  {filterDate && (
                    <button type="button" onClick={() => setFilterDate('')} style={{ background: 'none', border: 'none', color: 'var(--color-accent-red)', fontWeight: 800, cursor: 'pointer', fontSize: '14px' }}>×</button>
                  )}
                </div>

                <button type="submit" className="btn" style={{ height: '48px' }}>Search</button>
              </form>
            </div>

            {/* Split cards and detail viewer */}
            <div style={{ display: 'grid', gridTemplateColumns: selectedCaterer ? '1.2fr 1.8fr' : '1fr', gap: '30px' }}>

              {/* Left Column: Caterer Profile Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {(() => {
                    const isCatererAvailableOnDate = (caterer, date) => {
                      if (!date) return true;
                      
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const selected = new Date(date);
                      selected.setHours(0, 0, 0, 0);
                      const diffTime = selected.getTime() - today.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                      if (diffDays <= caterer.minNoticeDays) {
                        return false;
                      }

                      return !bookings.some(b =>
                        b.eventDate === date &&
                        b.status !== 'CANCELLED' &&
                        b.items &&
                        b.items.some(item => item.catererId === caterer.userId)
                      );
                    };
                    const displayedCaterers = caterers.filter(c => isCatererAvailableOnDate(c, filterDate));
                    window.__displayedCaterers = displayedCaterers;
                    return (
                      <h3>Caterer Catalog ({displayedCaterers.length}) {filterDate && <span style={{ color: 'var(--color-primary)', fontSize: '12px' }}>available on {filterDate}</span>}</h3>
                    );
                  })()}
                  {selectedCaterer && (
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setSelectedCaterer(null)}>Close Profile</button>
                  )}
                </div>

                {(!window.__displayedCaterers || window.__displayedCaterers.length === 0) ? (
                  <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No available caterer profiles found for this search/date.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: selectedCaterer ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                    {window.__displayedCaterers.map((c) => (
                      <div
                        key={c.userId}
                        className={`glass-card ${selectedCaterer?.userId === c.userId ? 'active' : ''}`}
                        style={{
                          cursor: 'pointer',
                          borderColor: selectedCaterer?.userId === c.userId ? 'var(--color-primary)' : 'var(--border-glass)'
                        }}
                        onClick={() => handleSelectCaterer(c)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div>
                            <h4 style={{ fontSize: '18px' }}>{c.name || `Caterer #${c.userId}`}</h4>
                            <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                              {c.vegType?.replace('_', ' ')}
                            </span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: 'var(--color-accent-orange)', fontWeight: 700 }}>
                              ★ {c.avgRating > 0 ? c.avgRating : 'New'}
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                              ({c.ratingCount} reviews)
                            </span>
                          </div>
                        </div>

                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                          <strong>Services:</strong> {c.services || 'Premium events'}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-dim)', borderTop: '1px solid var(--border-glass)', paddingTop: '10px' }}>
                          <span>Cuisines: <em>{c.styles || 'Traditional'}</em></span>
                          <span>Notice: {c.minNoticeDays} days</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Detailed Caterer Menu Catalog & Shopping Cart */}
              {selectedCaterer && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                  {/* Detailed Card Profile */}
                  <div className="glass-card" style={{ animation: 'fade-in 0.3s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px', marginBottom: '20px' }}>
                      <div>
                        <h2 style={{ fontSize: '24px' }}>{selectedCaterer.name || `Caterer #${selectedCaterer.userId}`}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Contact: {selectedCaterer.contactEmail || 'caterer@catersync.com'}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary" onClick={() => setShowReviewModal(true)}>Write Review</button>
                        {selectedCaterer.flashEnabled && (
                          <button className="btn btn-accent" onClick={() => setShowBookingModal(true)}>⚡ Flash Book</button>
                        )}
                      </div>
                    </div>

                    <div className="grid-2" style={{ marginBottom: '24px' }}>
                      <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Min Notice Days</span>
                        <h4 style={{ marginTop: '2px' }}>{selectedCaterer.minNoticeDays} Days</h4>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Booking Channels</span>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '12px', fontWeight: 600 }}>
                          <span style={{ color: selectedCaterer.flashEnabled ? 'var(--color-primary)' : 'var(--text-dim)' }}>⚡ Flash Option</span>
                          <span style={{ color: selectedCaterer.customEnabled ? 'var(--color-secondary)' : 'var(--text-dim)' }}>☰ Custom Menu Selection</span>
                        </div>
                      </div>
                    </div>

                    {/* Standard Menu Listing */}
                    <div>
                      <h3 style={{ fontSize: '16px', marginBottom: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
                        Browse Dishes & Add to Basket
                      </h3>
                      {catererMenu.length === 0 ? (
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No catalog items registered by this caterer.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                          {catererMenu.map((item) => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                              <div>
                                <span style={{ fontSize: '14px', fontWeight: 700 }}>{item.name}</span>
                                <div style={{ fontSize: '10px', color: item.veg ? 'var(--color-primary)' : 'var(--color-accent-red)', fontWeight: 700, marginTop: '2px' }}>
                                  {item.veg ? '● VEG' : '● NON VEG'} · {item.category?.replace('_', ' ')}
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <span style={{ fontWeight: 800, color: 'var(--color-secondary)' }}>₹{item.price}</span>
                                {selectedCaterer.customEnabled && (
                                  <button
                                    className="btn btn-secondary"
                                    style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid rgba(0, 188, 212, 0.3)', color: 'var(--color-secondary)' }}
                                    onClick={() => handleAddToCart(item)}
                                  >
                                    + Add to Basket
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shopping Cart Drawer for Custom Booking */}
                  {customCart.length > 0 && (
                    <div className="glass-card" style={{ border: '2px solid rgba(0, 188, 212, 0.3)', background: 'rgba(0, 188, 212, 0.02)', animation: 'fade-in 0.3s ease' }}>
                      <h3 style={{ fontSize: '18px', color: 'var(--color-secondary)', marginBottom: '14px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
                        🛒 Your Custom Event Booking Planner
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                        {customCart.map((cartItem) => (
                          <div key={cartItem.item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
                            <div>
                              <span style={{ fontSize: '13px', fontWeight: 600 }}>{cartItem.item.name}</span>
                              <span style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block' }}>Caterer ID: {cartItem.catererId}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontWeight: 700, fontSize: '13px' }}>₹{cartItem.item.price}</span>
                              <button
                                className="action-link-btn"
                                style={{ color: 'var(--color-accent-red)', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 800, fontSize: '14px' }}
                                onClick={() => handleRemoveFromCart(cartItem.item.id)}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Total and Date Checkout Selector */}
                      <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '16px', marginBottom: '14px' }}>
                          <span>Event Subtotal Cost:</span>
                          <span style={{ color: 'var(--color-secondary)' }}>
                            ₹{customCart.reduce((sum, current) => sum + current.item.price, 0)}
                          </span>
                        </div>

                        <div className="grid-3" style={{ alignItems: 'end', gap: '10px' }}>
                          <div className="input-group" style={{ marginBottom: 0 }}>
                            <label style={{ color: 'var(--text-main)' }}>Select Event Date</label>
                            <input
                              type="date"
                              className="input-field"
                              value={customBookingDate}
                              onChange={(e) => setCustomBookingDate(e.target.value)}
                              min={getTomorrowDateString()}
                            />
                          </div>
                          <div className="input-group" style={{ marginBottom: 0 }}>
                            <label style={{ color: 'var(--text-main)' }}>Number of Guests</label>
                            <input
                              type="number"
                              className="input-field"
                              min="1"
                              value={customBookingGuestCount}
                              onChange={(e) => setCustomBookingGuestCount(e.target.value)}
                            />
                          </div>
                          <button className="btn btn-accent" style={{ height: '42px', width: '100%' }} onClick={handleCustomBookingSubmit}>
                            Confirm Custom Booking
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* My Bookings Section */}
            <div style={{ marginTop: '40px', borderTop: '1px solid var(--border-glass)', paddingTop: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '20px' }}>My Placed Event Bookings</h3>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 16px', fontSize: '12px' }}
                  onClick={() => api.getBookingsByUser(currentUserId).then(setUserBookings).catch(() => {})}
                >
                  ↻ Refresh Orders
                </button>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Track your active, upcoming, and past catering reservation orders.</p>

              {userBookings.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)' }}>
                  <p style={{ marginBottom: '8px' }}>You have not placed any orders yet.</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Your User ID is: <strong style={{ color: 'var(--color-primary)' }}>{currentUserId}</strong>. After placing a booking above, click ↻ Refresh Orders.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                  {userBookings.map(b => {
                    const isUpcoming = b.eventDate >= new Date().toISOString().split('T')[0] && b.status !== 'CANCELLED';
                    return (
                      <div key={b.id} className="glass-card" style={{ borderLeft: `4px solid ${b.status === 'CANCELLED' ? 'var(--color-accent-red)' : isUpcoming ? 'var(--color-primary)' : 'var(--text-dim)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-secondary)' }}>
                            BOOKING #{b.id} ({b.bookingType})
                          </span>
                          <span className={`badge-tag`}
                            style={{
                              padding: '2px 8px', fontSize: '10px', borderRadius: '12px', fontWeight: 800,
                              background: b.status === 'CANCELLED' ? 'rgba(244,67,54,0.1)' : isUpcoming ? 'rgba(0,188,212,0.1)' : 'rgba(255,255,255,0.05)',
                              color: b.status === 'CANCELLED' ? 'var(--color-accent-red)' : isUpcoming ? 'var(--color-primary)' : 'var(--text-dim)'
                            }}>
                            {b.status}
                          </span>
                        </div>
                        <p style={{ fontSize: '14px', margin: '4px 0' }}><strong>Date:</strong> {b.eventDate} {isUpcoming && <span style={{ color: 'var(--color-primary)', fontSize: '11px', fontWeight: 700 }}>(Upcoming)</span>}</p>
                        <p style={{ fontSize: '14px', margin: '4px 0' }}><strong>Total Cost:</strong> ₹{b.totalPrice}</p>
                        <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)', paddingTop: '10px' }}>
                          <strong>Dishes:</strong> {b.items && b.items.length > 0 ? b.items.map(i => i.itemName).join(', ') : 'No item details'}
                        </div>
                        {isUpcoming && (
                          <button
                            className="btn btn-secondary"
                            style={{ marginTop: '12px', width: '100%', height: '32px', fontSize: '12px', padding: '0', borderColor: 'var(--color-accent-red)', color: 'var(--color-accent-red)' }}
                            onClick={() => handleCancelBooking(b.id)}
                          >
                            Cancel Booking
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* VIEW 2: CATERER SETTINGS & MENU PUBLISHING PANEL */}
        {view === 'caterer-dashboard' && currentUserRole === 'CATERER' && (
          <div style={{ animation: 'fade-in 0.3s ease', marginTop: '32px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Caterer Profile Settings</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Publish your gourmet menu selections, configure operational notice limits, and check bookings.</p>

            <div className="grid-2">

              {/* Profile Config Card */}
              <div className="glass-card">
                <h3 style={{ fontSize: '20px', marginBottom: '18px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                  Notice Periods & Booking Options
                </h3>

                <form onSubmit={handleUpdateCatererProfile}>
                  <div className="input-group">
                    <label>Notice Period Required (Days)</label>
                    <input
                      type="number" className="input-field" required
                      value={catererForm.minNoticeDays} onChange={(e) => setCatererForm({ ...catererForm, minNoticeDays: e.target.value })}
                    />
                  </div>

                  <div className="input-group">
                    <label>Speciality Services (Comma separated)</label>
                    <input
                      type="text" className="input-field" required
                      value={catererForm.services} onChange={(e) => setCatererForm({ ...catererForm, services: e.target.value })}
                    />
                  </div>

                  <div className="input-group">
                    <label>Cuisine Styles Offered (Comma separated)</label>
                    <input
                      type="text" className="input-field" required
                      value={catererForm.styles} onChange={(e) => setCatererForm({ ...catererForm, styles: e.target.value })}
                    />
                  </div>

                  <div className="grid-2">
                    <div className="input-group">
                      <label>Max Daily Capacity (Guests)</label>
                      <input
                        type="number" className="input-field" required min="1"
                        value={catererForm.maxCapacity || 1000} onChange={(e) => setCatererForm({ ...catererForm, maxCapacity: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="input-group">
                      <label>Max Daily Bookings</label>
                      <input
                        type="number" className="input-field" required min="1"
                        value={catererForm.maxBookings || 3} onChange={(e) => setCatererForm({ ...catererForm, maxBookings: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="grid-2" style={{ margin: '14px 0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '13px' }}>
                      <input
                        type="checkbox" checked={catererForm.flashEnabled}
                        onChange={(e) => setCatererForm({ ...catererForm, flashEnabled: e.target.checked })}
                        style={{ marginRight: '8px' }}
                      />
                      Enable ⚡ Flash Bookings
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '13px' }}>
                      <input
                        type="checkbox" checked={catererForm.customEnabled}
                        onChange={(e) => setCatererForm({ ...catererForm, customEnabled: e.target.checked })}
                        style={{ marginRight: '8px' }}
                      />
                      Enable Custom Booking
                    </label>
                  </div>

                  <button type="submit" className="btn btn-accent" style={{ width: '100%', height: '44px', marginTop: '10px' }}>
                    Save Profile Settings
                  </button>
                </form>
              </div>

              {/* Menu Dish Editor Card */}
              <div className="glass-card">
                <h3 style={{ fontSize: '20px', marginBottom: '18px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                  Publish A New Catalog Dish
                </h3>

                <form onSubmit={handleAddCatererDish} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="grid-2">
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label>Dish Name</label>
                      <input
                        type="text" className="input-field" placeholder="e.g. Kashmiri Dum Aloo" required
                        value={catererNewDish.name} onChange={(e) => setCatererNewDish({ ...catererNewDish, name: e.target.value })}
                      />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label>Dish Price (₹)</label>
                      <input
                        type="number" className="input-field" placeholder="e.g. 180" required
                        value={catererNewDish.price} onChange={(e) => setCatererNewDish({ ...catererNewDish, price: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid-3" style={{ alignItems: 'end' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label>Course Type</label>
                      <select
                        className="input-field"
                        value={catererNewDish.category} onChange={(e) => setCatererNewDish({ ...catererNewDish, category: e.target.value })}
                      >
                        <option value="APPETIZER">APPETIZER</option>
                        <option value="MAIN_COURSE">MAIN COURSE</option>
                        <option value="DESSERT">DESSERT</option>
                      </select>
                    </div>

                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label>Veg Specialist</label>
                      <select
                        className="input-field"
                        value={catererNewDish.veg} onChange={(e) => setCatererNewDish({ ...catererNewDish, veg: e.target.value === 'true' })}
                      >
                        <option value="true">Pure Vegetarian</option>
                        <option value="false">Non-Vegetarian</option>
                      </select>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '12px', height: '42px' }}>
                      <input
                        type="checkbox" checked={catererNewDish.flashEnabled}
                        onChange={(e) => setCatererNewDish({ ...catererNewDish, flashEnabled: e.target.checked })}
                        style={{ marginRight: '6px' }}
                      />
                      Add directly to Flash Pack
                    </label>
                  </div>

                  <button type="submit" className="btn" style={{ width: '100%', height: '44px', marginTop: '6px' }}>
                    Publish Dish
                  </button>
                </form>
              </div>

            </div>

            {/* Menu catalog list with flash adjustments */}
            <div className="glass-card" style={{ marginTop: '30px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                Your Current Menu Catalog
              </h3>
              {catererMenu.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No catalog items registered. Switch role to Populator or use form above.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {catererMenu.map((item) => (
                    <div key={item.id} style={{ background: 'rgba(255,255,255,0.01)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '14px' }}>{item.name}</span>
                        <div style={{ fontSize: '10px', color: item.veg ? 'var(--color-primary)' : 'var(--color-accent-red)', fontWeight: 700, marginTop: '2px' }}>
                          {item.veg ? 'VEG' : 'NON VEG'} · {item.category}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        <span style={{ fontWeight: 800, color: 'var(--color-secondary)', fontSize: '14px' }}>₹{item.price}</span>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '2px 8px', fontSize: '10px', borderColor: item.flashEnabled ? 'var(--color-accent-orange)' : 'var(--border-glass)', color: item.flashEnabled ? 'var(--color-accent-orange)' : 'var(--text-muted)' }}
                          onClick={() => handleToggleFlashItem(item)}
                        >
                          {item.flashEnabled ? '⚡ Flash Pack' : 'Standard'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Incoming Event Notifications & Logistics Assignments */}
            <div className="glass-card" style={{ marginTop: '30px', border: '1px solid rgba(0, 188, 212, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '20px', color: 'var(--color-secondary)' }}>
                  Incoming Booking Notifications &amp; Logistics
                </h3>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 16px', fontSize: '12px' }}
                  onClick={() => api.getBookingsByCaterer(currentUserId).then(setCatererBookings).catch(() => {})}
                >
                  ↻ Refresh Orders
                </button>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                View customer orders containing your menu items and check allocated operational inventory.
              </p>

              {catererBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '13px' }}>
                  <p>No incoming orders placed for your catering profile yet.</p>
                  <p style={{ fontSize: '12px', marginTop: '6px' }}>Your Caterer ID is: <strong style={{ color: 'var(--color-secondary)' }}>{currentUserId}</strong>. Click ↻ Refresh Orders after a customer places a booking.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {catererBookings.map((b) => {
                    const isCancelled = b.status === 'CANCELLED';
                    const myItems = (b.items || []).filter(item => item.catererId === currentUserId);
                    const myUsages = inventoryUsages.filter(u => u.bookingId === b.id);
                    return (
                      <div key={b.id} style={{ background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-glass)', position: 'relative' }}>
                        {!isCancelled && (
                          <span style={{
                            position: 'absolute', top: '16px', right: '16px',
                            background: 'rgba(10, 191, 115, 0.1)', color: '#0abf73',
                            fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px'
                          }}>
                            🔔 ORDER ACTIVE
                          </span>
                        )}
                        <h4 style={{ fontSize: '15px', color: 'var(--color-primary)', marginBottom: '8px' }}>
                          Booking #{b.id} ({b.bookingType} Package)
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '13px' }}>
                          <div><strong>Event Date:</strong> {b.eventDate}</div>
                          <div><strong>Client ID:</strong> Customer #{b.userId}</div>
                          <div><strong>Order Status:</strong> <span style={{ fontWeight: 700, color: isCancelled ? 'var(--color-accent-red)' : 'var(--color-primary)' }}>{b.status}</span></div>
                          <div><strong>Total Value:</strong> ₹{b.totalPrice}</div>
                        </div>

                        <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(255, 255, 255, 0.01)', borderRadius: '6px', border: '1px solid var(--border-glass)', fontSize: '12px' }}>
                          <strong style={{ color: 'var(--text-main)' }}>Your Selected Dishes:</strong>{' '}
                          {myItems.length > 0
                            ? myItems.map(item => `${item.itemName} (Qty: ${item.quantity || 1})`).join(', ')
                            : <span style={{ color: 'var(--text-dim)' }}>{(b.items || []).map(i => i.itemName).join(', ') || 'No item details'}</span>
                          }
                        </div>

                        <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(0, 188, 212, 0.02)', borderRadius: '6px', border: '1px solid rgba(0, 188, 212, 0.1)', fontSize: '12px' }}>
                          <strong style={{ color: 'var(--color-secondary)' }}>Logistics Allocated Stock:</strong>{' '}
                          {myUsages.length === 0 ? (
                            <span style={{ color: 'var(--text-dim)' }}>No material stock allocated by admin yet.</span>
                          ) : (
                            myUsages.map(u => {
                              const invItem = inventory.find(i => i.id === u.inventoryItemId);
                              return `${invItem ? invItem.itemName : 'Material #' + u.inventoryItemId} (${u.usedQty} units)`;
                            }).join(', ')
                          )}
                        </div>

                        {!isCancelled && (
                          <div style={{ display: 'flex', gap: '10px', marginTop: '14px', borderTop: '1px solid var(--border-glass)', paddingTop: '10px' }}>
                            {b.status === 'CREATED' && (
                              <button
                                className="btn btn-accent"
                                style={{ padding: '6px 14px', fontSize: '12px', height: '32px' }}
                                onClick={() => handleConfirmBooking(b.id)}
                              >
                                ✓ Accept &amp; Confirm Order
                              </button>
                            )}
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '6px 14px', fontSize: '12px', height: '32px', color: 'var(--color-accent-red)', borderColor: 'rgba(244, 67, 54, 0.2)' }}
                              onClick={() => handleCancelBooking(b.id)}
                            >
                              ✗ Cancel Order
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* VIEW 3: ADMIN / LOGISTICS DASHBOARD */}
        {view === 'admin-dashboard' && currentUserRole === 'ADMIN' && (
          <div style={{ animation: 'fade-in 0.3s ease', marginTop: '32px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Logistics & System Roster</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Allocate raw material items, roster operations staff, and manage active booking assignments.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '30px', marginBottom: '30px' }}>

              {/* Left Column: Live Booking Orders list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Customer Event Orders ({bookings.length})</h3>
                  {selectedBookingForCoordination && (
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setSelectedBookingForCoordination(null)}>Clear Selection</button>
                  )}
                </div>

                {bookings.length === 0 ? (
                  <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No bookings placed yet. Switch role to "Customer" to place a custom or flash booking.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {bookings.map((b) => (
                      <div
                        key={b.id}
                        className={`glass-card ${selectedBookingForCoordination?.id === b.id ? 'active' : ''}`}
                        style={{
                          cursor: 'pointer',
                          borderColor: selectedBookingForCoordination?.id === b.id ? 'var(--color-primary)' : 'var(--border-glass)'
                        }}
                        onClick={() => handleSelectBookingForCoordination(b)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 800 }}>ORDER #{b.id}</span>
                          <span style={{
                            fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px',
                            background: b.status === 'CANCELLED' ? 'rgba(244,67,54,0.1)' : 'rgba(10,191,115,0.1)',
                            color: b.status === 'CANCELLED' ? 'var(--color-accent-red)' : 'var(--color-primary)'
                          }}>
                            {b.status}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '14px', fontWeight: 700 }}>
                              {b.bookingType === 'FLASH' ? '⚡ Instant Flash Package' : '☰ Custom Event Feast'}
                            </span>
                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                              Date: {b.eventDate} · Customer ID: {b.userId}
                            </span>
                          </div>
                          <span style={{ fontWeight: 800, color: 'var(--color-secondary)' }}>₹{b.totalPrice}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Dynamic Booking Coordinator Drawer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {selectedBookingForCoordination ? (
                  <div className="glass-card" style={{ border: '2px solid var(--color-primary)', background: 'rgba(10, 191, 115, 0.01)', animation: 'fade-in 0.3s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '14px', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '20px' }}>🛠️ Order Coordinator: #{selectedBookingForCoordination.id}</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Status: {selectedBookingForCoordination.status} · Date: {selectedBookingForCoordination.eventDate}</p>
                      </div>
                      <button className="btn btn-secondary" style={{ color: 'var(--color-accent-red)', borderColor: 'rgba(244,67,54,0.3)' }} onClick={() => handleCancelBooking(selectedBookingForCoordination.id)}>
                        Cancel Event
                      </button>
                    </div>

                    {/* Booking Items list snapshot */}
                    <div style={{ marginBottom: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', padding: '12px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 800, display: 'block', marginBottom: '8px' }}>DISPATCHED MEALS:</span>
                      {selectedBookingForCoordination.items?.map((item) => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
                          <span>· {item.itemName} (x{item.quantity})</span>
                          <span style={{ color: 'var(--color-secondary)' }}>₹{item.price}</span>
                        </div>
                      ))}
                    </div>

                    {/* Coordinator Split: Staff Checkbox & Stock Dropdown */}
                    <div className="grid-2">
                      {/* Staff Assignment */}
                      <div style={{ borderRight: '1px solid var(--border-glass)', paddingRight: '20px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: 700, display: 'block', marginBottom: '10px' }}>Assign Operational Staff</span>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto', marginBottom: '12px' }}>
                          {staff.filter(s => s.role !== 'CHEF').map((s) => (
                            <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={selectedStaffIds.includes(s.id)}
                                disabled={!s.available && !selectedStaffIds.includes(s.id)}
                                onChange={() => handleStaffCheckboxChange(s.id)}
                              />
                              <span style={{ color: s.available ? 'var(--text-main)' : 'var(--text-dim)' }}>
                                {s.name} ({s.role})
                              </span>
                            </label>
                          ))}
                        </div>

                        <button className="btn" style={{ padding: '8px 16px', fontSize: '12px', width: '100%' }} onClick={handleAssignStaffSubmit}>
                          Lock Staff Assignment
                        </button>
                      </div>

                      {/* Stock Allocation */}
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: 700, display: 'block', marginBottom: '10px' }}>Allocate Raw Materials</span>

                        <form onSubmit={handleAllocateStock} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <select
                            className="input-field" required
                            value={allocatedStockItem} onChange={(e) => setAllocatedStockItem(e.target.value)}
                          >
                            <option value="">-- Choose Stock --</option>
                            {inventory.map(item => (
                              <option key={item.id} value={item.id}>
                                {item.itemName} (Stock: {item.quantity} {item.unit})
                              </option>
                            ))}
                          </select>

                          <input
                            type="number" className="input-field" placeholder="Quantity to Allocate" required
                            value={allocatedStockQty} onChange={(e) => setAllocatedStockQty(e.target.value)}
                          />

                          <button type="submit" className="btn btn-accent" style={{ padding: '8px 16px', fontSize: '12px' }}>
                            Dispatch Material Stock
                          </button>
                        </form>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '280px', color: 'var(--text-dim)', fontSize: '14px', borderStyle: 'dashed' }}>
                    Choose an customer order card from the left panel to coordinate materials and roster chef assignments.
                  </div>
                )}
              </div>

            </div>

            {/* Inventory Roster adjustments */}
            <div className="grid-2">

              {/* Left Panel: Inventory Adjuster */}
              <div className="glass-card">
                <h3 style={{ fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                  Raw Materials Inventory ({inventory.length})
                </h3>

                <form onSubmit={handleAddInventory} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px auto', gap: '8px', marginBottom: '20px' }}>
                  <input
                    type="text" className="input-field" placeholder="Material Item name" required
                    value={inventoryForm.itemName} onChange={(e) => setInventoryForm({ ...inventoryForm, itemName: e.target.value })}
                  />
                  <input
                    type="number" className="input-field" placeholder="Qty" required
                    value={inventoryForm.quantity} onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })}
                  />
                  <select
                    className="input-field"
                    value={inventoryForm.unit} onChange={(e) => setInventoryForm({ ...inventoryForm, unit: e.target.value })}
                  >
                    <option value="pcs">pcs</option>
                    <option value="KG">KG</option>
                    <option value="LITRE">L</option>
                  </select>
                  <button type="submit" className="btn">Add</button>
                </form>

                {inventory.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No raw stock registered.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {inventory.map((item) => {
                      const usedQty = inventoryUsages
                        .filter(u => u.inventoryItemId === item.id)
                        .reduce((sum, u) => sum + u.usedQty, 0);
                      return (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: '14px' }}>{item.itemName}</span>
                            <div style={{ fontSize: '11px', marginTop: '2px', display: 'flex', gap: '12px' }}>
                              <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Available: {item.quantity} {item.unit}</span>
                              <span style={{ color: 'var(--color-accent-orange)', fontWeight: 700 }}>Allocated (Used): {usedQty} {item.unit}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '11px' }} onClick={() => handleAdjustInventory(item.id, -10)}>-10</button>
                            <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '11px' }} onClick={() => handleAdjustInventory(item.id, -1)}>-1</button>
                            <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '11px' }} onClick={() => handleAdjustInventory(item.id, 1)}>+1</button>
                            <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '11px' }} onClick={() => handleAdjustInventory(item.id, 10)}>+10</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Panel: Staff Roster */}
              <div className="glass-card">
                <h3 style={{ fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                  Operational Staff Roster ({staff.length})
                </h3>

                <form onSubmit={handleAddStaff} style={{ display: 'grid', gridTemplateColumns: '1fr 120px auto', gap: '8px', marginBottom: '20px' }}>
                  <input
                    type="text" className="input-field" placeholder="Full name" required
                    value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  />
                  <select
                    className="input-field"
                    value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                  >
                    <option value="SERVING_STAFF">SERVING_STAFF</option>
                    <option value="DRIVER">DRIVER</option>
                    <option value="VEHICLE">VEHICLE (Logistics)</option>
                    <option value="SUPPORT_STAFF">SUPPORT_STAFF</option>
                    <option value="MANAGER">MANAGER</option>
                  </select>
                  <button type="submit" className="btn">Add</button>
                </form>

                {staff.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No staff registered.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {staff.filter(s => s.role !== 'CHEF').map((s) => (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.available ? 'var(--color-primary)' : 'var(--color-accent-red)' }}></span>
                            <span style={{ fontWeight: 700, fontSize: '14px' }}>{s.name}</span>
                          </div>
                          <span style={{ fontSize: '10px', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', display: 'inline-block', marginTop: '4px' }}>
                            {s.role}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label style={{ fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <input
                              type="checkbox" checked={s.available}
                              onChange={() => handleToggleStaff(s.id, s.available)}
                              style={{ marginRight: '6px', cursor: 'pointer' }}
                            />
                            Available
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>

      {/* MODAL 1: INSTANT FLASH BOOKING */}
      {showBookingModal && selectedCaterer && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px' }}>⚡ Instant Booking: {selectedCaterer.name}</h3>
              <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '14px' }} onClick={() => setShowBookingModal(false)}>×</button>
            </div>

            <form onSubmit={handleFlashBooking}>
              <div className="input-group">
                <label>Event Category Selection</label>
                <select
                  className="input-field"
                  value={bookingPayload.vegType} onChange={(e) => setBookingPayload({ ...bookingPayload, vegType: e.target.value })}
                >
                  <option value="VEG">VEG (Vegetarian Feast)</option>
                  <option value="NON_VEG">NON VEG (Multi-cuisine Feast)</option>
                </select>
              </div>

              <div className="input-group">
                <label>Event Booking Date</label>
                <input
                  type="date" className="input-field" required
                  value={bookingPayload.eventDate} onChange={(e) => setBookingPayload({ ...bookingPayload, eventDate: e.target.value })}
                  min={getTomorrowDateString()}
                />
              </div>

              <div className="input-group">
                <label>Number of Guests (Catering Size)</label>
                <input
                  type="number" className="input-field" required min="1"
                  value={bookingPayload.guestCount || 50} 
                  onChange={(e) => setBookingPayload({ ...bookingPayload, guestCount: parseInt(e.target.value) })}
                />
              </div>

              <button type="submit" className="btn btn-accent" style={{ width: '100%', height: '44px', marginTop: '16px' }}>
                Confirm Instant Booking
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: WRITE A REVIEW */}
      {showReviewModal && selectedCaterer && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px' }}>Rate: {selectedCaterer.name}</h3>
              <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '14px' }} onClick={() => setShowReviewModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmitReview}>
              <div className="input-group">
                <label>Stars Rating (1 - 5 stars)</label>
                <select
                  className="input-field"
                  value={reviewPayload.stars} onChange={(e) => setReviewPayload({ ...reviewPayload, stars: e.target.value })}
                >
                  <option value="5">★★★★★ (5 Stars - Outstanding)</option>
                  <option value="4">★★★★☆ (4 Stars - Excellent)</option>
                  <option value="3">★★★☆☆ (3 Stars - Good)</option>
                  <option value="2">★★☆☆☆ (2 Stars - Average)</option>
                  <option value="1">★☆☆☆☆ (1 Star - Poor)</option>
                </select>
              </div>

              <div className="input-group">
                <label>Feedback Comment</label>
                <textarea
                  className="input-field" rows="3" style={{ resize: 'none' }} required
                  value={reviewPayload.comment} onChange={(e) => setReviewPayload({ ...reviewPayload, comment: e.target.value })}
                  placeholder="Review the menu presentation, taste, and hospitality..."
                />
              </div>

              <button type="submit" className="btn btn-accent" style={{ width: '100%', height: '44px', marginTop: '16px' }}>
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;

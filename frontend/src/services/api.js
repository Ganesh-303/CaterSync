import axios from 'axios';

const API_BASE_URL = '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Server Health
  checkHealth: async () => {
    const { data } = await apiClient.get('/health');
    return data;
  },

  // Caterers & Search
  getCaterers: async () => {
    const { data } = await apiClient.get('/api/caterers');
    return data;
  },

  registerCaterer: async (caterer) => {
    const { data } = await apiClient.post('/api/caterers', caterer);
    return data;
  },

  searchCaterers: async (params) => {
    const { data } = await apiClient.get('/api/caterers/search', { params });
    return data;
  },

  checkCatererAvailability: async (catererId, params) => {
    const { data } = await apiClient.get(`/api/caterers/${catererId}/check-availability`, { params });
    return data;
  },

  updateCatererProfile: async (catererId, profileData) => {
    const { data } = await apiClient.put(`/api/caterers/${catererId}`, profileData);
    return data;
  },

  // Menu items
  getMenu: async (catererId, category = '') => {
    const params = category ? { category } : {};
    const { data } = await apiClient.get(`/api/caterers/${catererId}/menu`, { params });
    return data;
  },

  addMenuItem: async (catererId, menuItem) => {
    const { data } = await apiClient.post(`/api/caterers/${catererId}/menu`, menuItem);
    return data;
  },

  getFlashMenu: async (catererId) => {
    const { data } = await apiClient.get(`/api/caterers/${catererId}/flash-menu`);
    return data;
  },

  setFlashMenu: async (catererId, menuItemIds) => {
    const { data } = await apiClient.post(`/api/caterers/${catererId}/flash-menu`, { menuItemIds });
    return data;
  },

  // Bookings
  getBookings: async () => {
    const { data } = await apiClient.get('/api/bookings');
    return data;
  },

  getBookingsByUser: async (userId) => {
    const { data } = await apiClient.get(`/api/bookings/user/${userId}`);
    return data;
  },

  getBookingsByCaterer: async (catererId) => {
    const { data } = await apiClient.get(`/api/bookings/caterer/${catererId}`);
    return data;
  },

  createFlashBooking: async (req) => {
    const { data } = await apiClient.post('/api/bookings/flash', req);
    return data;
  },

  createCustomBooking: async (req) => {
    const { data } = await apiClient.post('/api/bookings/custom', req);
    return data;
  },

  getBooking: async (id) => {
    const { data } = await apiClient.get(`/api/bookings/${id}`);
    return data;
  },

  cancelBooking: async (id) => {
    const { data } = await apiClient.put(`/api/bookings/${id}/cancel`);
    return data;
  },

  confirmBooking: async (id) => {
    const { data } = await apiClient.put(`/api/bookings/${id}/confirm`);
    return data;
  },

  allocateInventory: async (bookingId, req) => {
    const { data } = await apiClient.post(`/api/bookings/${bookingId}/inventory-usage`, req);
    return data;
  },

  // Staff
  getStaff: async () => {
    const { data } = await apiClient.get('/api/staff');
    return data;
  },

  addStaff: async (staff) => {
    const { data } = await apiClient.post('/api/staff', staff);
    return data;
  },

  getAvailableStaff: async (role = '') => {
    const params = role ? { role } : {};
    const { data } = await apiClient.get('/api/staff/available', { params });
    return data;
  },

  setStaffAvailability: async (id, available) => {
    const { data } = await apiClient.put(`/api/staff/${id}/availability`, null, {
      params: { available },
    });
    return data;
  },

  assignStaff: async (bookingId, staffIds) => {
    const { data } = await apiClient.post(`/api/bookings/${bookingId}/assign-staff`, { staffIds });
    return data;
  },

  getAssignedStaff: async (bookingId) => {
    const { data } = await apiClient.get(`/api/bookings/${bookingId}/staff`);
    return data;
  },

  // Inventory
  getInventory: async () => {
    const { data } = await apiClient.get('/api/inventory');
    return data;
  },

  addInventory: async (item) => {
    const { data } = await apiClient.post('/api/inventory', item);
    return data;
  },

  adjustInventory: async (id, delta) => {
    const { data } = await apiClient.put(`/api/inventory/${id}/adjust`, null, {
      params: { delta },
    });
    return data;
  },

  getInventoryUsages: async () => {
    const { data } = await apiClient.get('/api/bookings/inventory-usages');
    return data;
  },

  getBookingInventoryUsage: async (bookingId) => {
    const { data } = await apiClient.get(`/api/bookings/${bookingId}/inventory-usage`);
    return data;
  },

  // Reviews
  getReviews: async () => {
    const { data } = await apiClient.get('/api/reviews');
    return data;
  },

  getReviewsByCaterer: async (catererId) => {
    const { data } = await apiClient.get(`/api/reviews/caterer/${catererId}`);
    return data;
  },

  submitReview: async (review) => {
    const { data } = await apiClient.post('/api/reviews', review);
    return data;
  },

  // Auto Seeding Helper (Feeds beautiful default data if database is empty!)
  seedDatabase: async () => {
    console.log('Seeding database...');

    // 1. Seed Caterers
    const c1 = await api.registerCaterer({
      userId: 1,
      vegType: 'VEG',
      services: 'Lunch Buffets, Wedding Banquets, Mocktails',
      styles: 'North Indian, Jain, Punjabi',
      minNoticeDays: 3,
      flashEnabled: true,
      customEnabled: true,
      available: true
    });

    const c2 = await api.registerCaterer({
      userId: 2,
      vegType: 'NON_VEG',
      services: 'Corporate Dinners, Live Grills, Beverages',
      styles: 'Barbecue, Mughlai, Chinese',
      minNoticeDays: 2,
      flashEnabled: true,
      customEnabled: true,
      available: true
    });

    const c3 = await api.registerCaterer({
      userId: 3,
      vegType: 'VEG',
      services: 'South Indian Breakfasts, Healthy Juices',
      styles: 'Andhra style, jain, South Indian',
      minNoticeDays: 4,
      flashEnabled: false,
      customEnabled: true,
      available: true
    });

    // 2. Seed Menu Items for Caterer 1
    await api.addMenuItem(1, { name: 'Shahi Paneer Tikka', veg: true, price: 180, category: 'APPETIZER', flashEnabled: true });
    await api.addMenuItem(1, { name: 'Dal Makhani & Butter Naan', veg: true, price: 240, category: 'MAIN_COURSE', flashEnabled: true });
    await api.addMenuItem(1, { name: 'Malai Kulfi', veg: true, price: 90, category: 'DESSERT', flashEnabled: false });

    // Seed Menu Items for Caterer 2
    await api.addMenuItem(2, { name: 'Tandoori Chicken Platter', veg: false, price: 320, category: 'APPETIZER', flashEnabled: true });
    await api.addMenuItem(2, { name: 'Mutton Biryani Feast', veg: false, price: 450, category: 'MAIN_COURSE', flashEnabled: true });
    await api.addMenuItem(2, { name: 'Choco Lava Lava Cake', veg: true, price: 150, category: 'DESSERT', flashEnabled: false });

    // Seed Menu Items for Caterer 3
    await api.addMenuItem(3, { name: 'Idli Vada & Sambar Platter', veg: true, price: 120, category: 'APPETIZER', flashEnabled: false });
    await api.addMenuItem(3, { name: 'Special Andhra Thali', veg: true, price: 220, category: 'MAIN_COURSE', flashEnabled: false });

    // 3. Seed Inventory Items for Caterer 1
    await api.addInventory({ itemName: 'Stainless Steel Buffet chafers', quantity: 30, unit: 'pcs', catererId: 1 });
    await api.addInventory({ itemName: 'Luxury Satin Tablecloths', quantity: 150, unit: 'pcs', catererId: 1 });
    await api.addInventory({ itemName: 'Crystal Beverage Glasses', quantity: 500, unit: 'pcs', catererId: 1 });
    await api.addInventory({ itemName: 'Porcelain Dinner Plates', quantity: 400, unit: 'pcs', catererId: 1 });

    // Seed Inventory Items for Caterer 2
    await api.addInventory({ itemName: 'Stainless Steel Buffet chafers', quantity: 10, unit: 'pcs', catererId: 2 });
    await api.addInventory({ itemName: 'Luxury Satin Tablecloths', quantity: 50, unit: 'pcs', catererId: 2 });
    await api.addInventory({ itemName: 'Crystal Beverage Glasses', quantity: 100, unit: 'pcs', catererId: 2 });
    await api.addInventory({ itemName: 'Porcelain Dinner Plates', quantity: 100, unit: 'pcs', catererId: 2 });

    // Seed Inventory Items for Caterer 3 (low stock)
    await api.addInventory({ itemName: 'Stainless Steel Buffet chafers', quantity: 2, unit: 'pcs', catererId: 3 });
    await api.addInventory({ itemName: 'Luxury Satin Tablecloths', quantity: 20, unit: 'pcs', catererId: 3 });
    await api.addInventory({ itemName: 'Crystal Beverage Glasses', quantity: 30, unit: 'pcs', catererId: 3 });
    await api.addInventory({ itemName: 'Porcelain Dinner Plates', quantity: 30, unit: 'pcs', catererId: 3 });

    // 4. Seed Staff Members
    // Managers
    await api.addStaff({ name: 'Anil Kapoor', role: 'MANAGER', available: true });
    await api.addStaff({ name: 'Sanjay Dutt', role: 'MANAGER', available: true });
    await api.addStaff({ name: 'Akshay Kumar', role: 'MANAGER', available: true });

    // Serving Staff
    await api.addStaff({ name: 'Rohit Sharma', role: 'SERVING_STAFF', available: true });
    await api.addStaff({ name: 'Virat Kohli', role: 'SERVING_STAFF', available: true });
    await api.addStaff({ name: 'KL Rahul', role: 'SERVING_STAFF', available: true });
    await api.addStaff({ name: 'Jasprit Bumrah', role: 'SERVING_STAFF', available: true });
    await api.addStaff({ name: 'Rishabh Pant', role: 'SERVING_STAFF', available: true });
    await api.addStaff({ name: 'Hardik Pandya', role: 'SERVING_STAFF', available: true });
    await api.addStaff({ name: 'Ravindra Jadeja', role: 'SERVING_STAFF', available: true });
    await api.addStaff({ name: 'Shreyas Iyer', role: 'SERVING_STAFF', available: true });
    await api.addStaff({ name: 'Ishan Kishan', role: 'SERVING_STAFF', available: true });
    await api.addStaff({ name: 'Shubman Gill', role: 'SERVING_STAFF', available: true });
    await api.addStaff({ name: 'Suryakumar Yadav', role: 'SERVING_STAFF', available: true });
    await api.addStaff({ name: 'Axar Patel', role: 'SERVING_STAFF', available: true });
    await api.addStaff({ name: 'Mohammed Shami', role: 'SERVING_STAFF', available: true });
    await api.addStaff({ name: 'Yuzvendra Chahal', role: 'SERVING_STAFF', available: true });
    await api.addStaff({ name: 'Kuldeep Yadav', role: 'SERVING_STAFF', available: true });

    // Drivers
    await api.addStaff({ name: 'Vikram Singh', role: 'DRIVER', available: true });
    await api.addStaff({ name: 'Rajesh Kumar', role: 'DRIVER', available: true });
    await api.addStaff({ name: 'Ramesh Chenji', role: 'DRIVER', available: true });
    await api.addStaff({ name: 'Suresh Babu', role: 'DRIVER', available: true });

    // Logistics Vehicles
    await api.addStaff({ name: 'Logistics Van #1', role: 'VEHICLE', available: true });
    await api.addStaff({ name: 'Logistics Van #2', role: 'VEHICLE', available: true });
    await api.addStaff({ name: 'Heavy Logistics Van #1', role: 'VEHICLE', available: true });
    await api.addStaff({ name: 'Heavy Logistics Van #2', role: 'VEHICLE', available: true });
    await api.addStaff({ name: 'Delivery Truck #1', role: 'VEHICLE', available: true });

    // Support Staff
    await api.addStaff({ name: 'Kavita Roy', role: 'SUPPORT_STAFF', available: true });
    await api.addStaff({ name: 'Sneha Sharma', role: 'SUPPORT_STAFF', available: true });
    await api.addStaff({ name: 'Pooja Patel', role: 'SUPPORT_STAFF', available: true });
    await api.addStaff({ name: 'Amit Verma', role: 'SUPPORT_STAFF', available: true });
    await api.addStaff({ name: 'Neha Gupta', role: 'SUPPORT_STAFF', available: true });
    await api.addStaff({ name: 'Rahul Mehra', role: 'SUPPORT_STAFF', available: true });

    return { c1, c2, c3 };
  }
};

// Data storage
let users = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'passenger1', password: 'pass123', role: 'passenger' },
    { username: 'conductor1', password: 'cond123', role: 'conductor' },
    { username: 'operator1', password: 'oper123', role: 'operator' }
];

let busSchedules = [
    { id: 1, route: 'Cebu to Daan Bantayan', departure: '06:00', price: 180, totalSeats: 40, bookedSeats: [] },
    { id: 2, route: 'Daan Bantayan to Cebu', departure: '14:00', price: 180, totalSeats: 40, bookedSeats: [] },
    { id: 3, route: 'Cebu to Santander', departure: '07:00', price: 165, totalSeats: 40, bookedSeats: [] },
    { id: 4, route: 'Santander to Cebu', departure: '13:00', price: 165, totalSeats: 40, bookedSeats: [] },
    { id: 5, route: 'Cebu to Lapu-Lapu', departure: '08:00', price: 25, totalSeats: 40, bookedSeats: [] },
    { id: 6, route: 'Lapu-Lapu to Cebu', departure: '16:00', price: 25, totalSeats: 40, bookedSeats: [] },
    { id: 7, route: 'Cebu to Balamban', departure: '09:00', price: 70, totalSeats: 40, bookedSeats: [] },
    { id: 8, route: 'Balamban to Cebu', departure: '15:00', price: 70, totalSeats: 40, bookedSeats: [] }
];

let bookings = [];
let currentUser = null;
let selectedBus = null;
let selectedSeats = [];

// Initialize
function init() {
    loadBusRoutes();
    loadSchedule();
}

// Login
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;

    const user = users.find(u => u.username === username && u.password === password && u.role === userType);

    if (user) {
        currentUser = user;
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainSection').style.display = 'block';
        document.getElementById('currentUser').textContent = user.username;
        document.getElementById('currentRole').textContent = user.role;
        
        if (user.role === 'admin' || user.role === 'operator') {
            document.getElementById('adminTab').style.display = 'block';
        }
        
        loadMyBookings();
        updateAdminStats();
        showMessage('loginMessage', 'Login successful!', 'success');
    } else {
        showMessage('loginMessage', 'Invalid credentials or user type!', 'danger');
    }
}

// Register
function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;

    if (!username || !password) {
        showMessage('loginMessage', 'Please fill all fields!', 'danger');
        return;
    }

    if (users.find(u => u.username === username)) {
        showMessage('loginMessage', 'Username already exists!', 'danger');
        return;
    }

    users.push({ username, password, role: userType });
    
    // Show success alert
    alert('✅ You are successfully registered!\n\nPlease login with your credentials.');
    
    showMessage('loginMessage', 'Registration successful! Please login.', 'success');
    
    // Clear the password field for security
    document.getElementById('password').value = '';
}

// Logout
function logout() {
    currentUser = null;
    selectedBus = null;
    selectedSeats = [];
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('mainSection').style.display = 'none';
    document.getElementById('adminTab').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Show section
function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    
    document.getElementById(section + 'Section').classList.add('active');
    event.target.classList.add('active');

    if (section === 'myBookings') loadMyBookings();
    if (section === 'schedule') loadSchedule();
    if (section === 'admin') {
        updateAdminStats();
        loadAllBookings();
    }
}

// Load bus routes
function loadBusRoutes() {
    const select = document.getElementById('busRoute');
    select.innerHTML = '<option value="">-- Select Route --</option>';
    busSchedules.forEach(bus => {
        select.innerHTML += `<option value="${bus.id}">${bus.route} - ${bus.departure} (₱${bus.price})</option>`;
    });
}

// Load bus details
function loadBusDetails() {
    const busId = parseInt(document.getElementById('busRoute').value);
    if (!busId) {
        document.getElementById('busDetailsSection').style.display = 'none';
        return;
    }

    selectedBus = busSchedules.find(b => b.id === busId);
    selectedSeats = [];
    
    document.getElementById('selectedRoute').textContent = selectedBus.route;
    document.getElementById('selectedDeparture').textContent = selectedBus.departure;
    document.getElementById('selectedPrice').textContent = selectedBus.price;
    document.getElementById('availableSeats').textContent = selectedBus.totalSeats - selectedBus.bookedSeats.length;
    
    renderSeatMap();
    updateBookingSummary();
    
    document.getElementById('busDetailsSection').style.display = 'block';
}

// Render seat map
function renderSeatMap() {
    const seatMap = document.getElementById('seatMap');
    seatMap.innerHTML = '';
    
    for (let i = 1; i <= selectedBus.totalSeats; i++) {
        const seat = document.createElement('div');
        seat.className = 'seat';
        seat.textContent = i;
        
        if (selectedBus.bookedSeats.includes(i)) {
            seat.classList.add('booked');
        } else {
            seat.onclick = () => toggleSeat(i);
        }
        
        seatMap.appendChild(seat);
    }
}

// Toggle seat selection
function toggleSeat(seatNumber) {
    const index = selectedSeats.indexOf(seatNumber);
    if (index > -1) {
        selectedSeats.splice(index, 1);
    } else {
        selectedSeats.push(seatNumber);
    }
    
    renderSeatMap();
    
    document.querySelectorAll('.seat').forEach(seat => {
        if (selectedSeats.includes(parseInt(seat.textContent)) && !seat.classList.contains('booked')) {
            seat.classList.add('selected');
        }
    });
    
    updateBookingSummary();
}

// Update booking summary
function updateBookingSummary() {
    document.getElementById('selectedSeatsDisplay').textContent = 
        selectedSeats.length > 0 ? selectedSeats.sort((a,b) => a-b).join(', ') : 'None';
    document.getElementById('totalPrice').textContent = selectedSeats.length * selectedBus.price;
}

// Confirm booking
function confirmBooking() {
    if (!currentUser) {
        alert('Please login first!');
        return;
    }

    if (selectedSeats.length === 0) {
        alert('Please select at least one seat!');
        return;
    }

    const booking = {
        id: bookings.length + 1,
        username: currentUser.username,
        busId: selectedBus.id,
        route: selectedBus.route,
        departure: selectedBus.departure,
        seats: [...selectedSeats],
        totalPrice: selectedSeats.length * selectedBus.price,
        date: new Date().toLocaleString()
    };

    bookings.push(booking);
    selectedBus.bookedSeats.push(...selectedSeats);
    
    alert(`Booking confirmed!\nBooking ID: ${booking.id}\nSeats: ${selectedSeats.join(', ')}\nTotal: ₱${booking.totalPrice}`);
    
    selectedSeats = [];
    loadBusDetails();
    updateAdminStats();
}

// Load my bookings
function loadMyBookings() {
    const myBookings = bookings.filter(b => b.username === currentUser.username);
    const container = document.getElementById('bookingsList');
    
    if (myBookings.length === 0) {
        container.innerHTML = '<p>No bookings yet.</p>';
        return;
    }

    container.innerHTML = '<table><thead><tr><th>Booking ID</th><th>Route</th><th>Departure</th><th>Seats</th><th>Price</th><th>Date</th><th>Action</th></tr></thead><tbody>';
    
    myBookings.forEach(booking => {
        container.innerHTML += `
            <tr>
                <td>${booking.id}</td>
                <td>${booking.route}</td>
                <td>${booking.departure}</td>
                <td>${booking.seats.join(', ')}</td>
                <td>₱${booking.totalPrice}</td>
                <td>${booking.date}</td>
                <td><button class="btn btn-danger" onclick="cancelBooking(${booking.id})">Cancel</button></td>
            </tr>
        `;
    });
    
    container.innerHTML += '</tbody></table>';
}

// Cancel booking
function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    const booking = bookings.find(b => b.id === bookingId);
    const bus = busSchedules.find(b => b.id === booking.busId);
    
    bus.bookedSeats = bus.bookedSeats.filter(seat => !booking.seats.includes(seat));
    bookings = bookings.filter(b => b.id !== bookingId);
    
    loadMyBookings();
    updateAdminStats();
    alert('Booking cancelled successfully!');
}

// Load schedule
function loadSchedule() {
    const container = document.getElementById('scheduleList');
    container.innerHTML = '';
    
    busSchedules.forEach(bus => {
        container.innerHTML += `
            <div class="bus-card">
                <h3>${bus.route}</h3>
                <div class="bus-info"><strong>Departure:</strong> ${bus.departure}</div>
                <div class="bus-info"><strong>Price:</strong> ₱${bus.price}</div>
                <div class="bus-info"><strong>Available Seats:</strong> ${bus.totalSeats - bus.bookedSeats.length}/${bus.totalSeats}</div>
            </div>
        `;
    });
}

// Add bus schedule
function addBusSchedule() {
    const route = document.getElementById('newRoute').value;
    const departure = document.getElementById('newDeparture').value;
    const price = parseInt(document.getElementById('newPrice').value);
    const seats = parseInt(document.getElementById('newSeats').value);

    if (!route || !departure || !price || !seats) {
        alert('Please fill all fields!');
        return;
    }

    const newBus = {
        id: busSchedules.length + 1,
        route,
        departure,
        price,
        totalSeats: seats,
        bookedSeats: []
    };

    busSchedules.push(newBus);
    loadBusRoutes();
    loadSchedule();
    
    document.getElementById('newRoute').value = '';
    document.getElementById('newDeparture').value = '';
    document.getElementById('newPrice').value = '';
    document.getElementById('newSeats').value = '40';
    
    alert('Bus schedule added successfully!');
}

// Update admin stats
function updateAdminStats() {
    document.getElementById('totalBookings').textContent = bookings.length;
    document.getElementById('totalRevenue').textContent = '₱' + bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    document.getElementById('totalPassengers').textContent = new Set(bookings.map(b => b.username)).size;
}

// Load all bookings
function loadAllBookings() {
    const tbody = document.getElementById('allBookingsBody');
    tbody.innerHTML = '';
    
    bookings.forEach(booking => {
        tbody.innerHTML += `
            <tr>
                <td>${booking.id}</td>
                <td>${booking.username}</td>
                <td>${booking.route}</td>
                <td>${booking.seats.join(', ')}</td>
                <td>₱${booking.totalPrice}</td>
                <td>${booking.date}</td>
            </tr>
        `;
    });
}

// Show message
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => element.innerHTML = '', 3000);
}

// Initialize on load
init();
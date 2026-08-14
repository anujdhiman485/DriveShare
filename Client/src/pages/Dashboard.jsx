import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { carAPI, bookingAPI, exchangeAPI } from '../utils/apiService';
import gsap from 'gsap';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [myCars, setMyCars] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [receivedBookings, setReceivedBookings] = useState([]);
  const [exchangeRequests, setExchangeRequests] = useState([]);
  const [myExchanges, setMyExchanges] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    console.log('🔄 Fetching dashboard data...');
    try {
      // Fetch user's cars
      console.log('📡 Calling carAPI.getMyCars()...');
      const carsResponse = await carAPI.getMyCars();
      console.log('🚗 Cars Response:', carsResponse);
      if (carsResponse.success) {
        console.log('✅ Cars data:', carsResponse.data);
        setMyCars(carsResponse.data || []);
      } else {
        console.log('❌ Cars fetch failed:', carsResponse);
      }

      // Fetch user's bookings
      const myBookingsResponse = await bookingAPI.getMyBookings();
      if (myBookingsResponse.success) {
        setMyBookings(myBookingsResponse.data || []);
      }

      // Fetch received booking requests
      const receivedResponse = await bookingAPI.getReceivedBookings();
      if (receivedResponse.success) {
        setReceivedBookings(receivedResponse.data || []);
      }

      // Fetch exchange requests
      const exchangeResponse = await exchangeAPI.getReceivedExchangeRequests();
      if (exchangeResponse.success) {
        setExchangeRequests(exchangeResponse.data || []);
      }

      // Fetch exchange requests the user sent
      const myExchangeResponse = await exchangeAPI.getMyExchangeRequests();
      if (myExchangeResponse.success) {
        setMyExchanges(myExchangeResponse.data || []);
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      console.error('Error details:', error.response || error.message);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchDashboardData();

    // Check if coming from AddCar with success and switch to My Cars tab
    if (location.state?.showTab) {
      setActiveTab(location.state.showTab);
      // Clear state to prevent affecting future navigations
      window.history.replaceState({}, document.title);
    }
  }, [navigate, fetchDashboardData, location.state?.showTab]);

  useEffect(() => {
    gsap.fromTo(
      '.dashboard-header, .dashboard-tabs, .dashboard-content',
      { y: 18, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.44, ease: 'power2.out' }
    );
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      await bookingAPI.updateBookingStatus(bookingId, 'confirmed');
      alert('Booking accepted!');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error accepting booking:', error);
      alert('Failed to accept booking');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    try {
      await bookingAPI.updateBookingStatus(bookingId, 'cancelled');
      alert('Booking rejected!');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Failed to reject booking');
    }
  };

  const handleExchangeStatus = async (exchangeId, status) => {
    try {
      await exchangeAPI.updateExchangeStatus(exchangeId, status);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating exchange:', error);
      alert(error.message || 'Failed to update exchange request');
    }
  };

  const formatRange = (start, end) =>
    `${new Date(start).toLocaleDateString()} to ${new Date(end).toLocaleDateString()}`;

  return (
    <div className="dashboard">
      {location.state?.newCarAdded && (
        <div className="success-banner">
          ✅ Car added successfully! You can see it below in My Cars.
        </div>
      )}
      
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={async () => {
              const token = localStorage.getItem('token');
              const user = localStorage.getItem('user');
              console.log('🔑 Token:', token ? 'EXISTS (length: ' + token.length + ')' : 'MISSING');
              console.log('👤 User:', user);
              console.log('🔄 Manual refresh triggered');
              await fetchDashboardData();
            }} 
            className="btn btn-secondary"
            style={{ marginRight: '10px' }}
          >
            🔄 Refresh
          </button>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'myCars' ? 'active' : ''}`}
          onClick={() => setActiveTab('myCars')}
        >
          My Cars
        </button>
        <button
          className={`tab ${activeTab === 'myBookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('myBookings')}
        >
          My Bookings
        </button>
        <button
          className={`tab ${activeTab === 'receivedBookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('receivedBookings')}
        >
          Received Requests
        </button>
        <button
          className={`tab ${activeTab === 'exchanges' ? 'active' : ''}`}
          onClick={() => setActiveTab('exchanges')}
        >
          Exchange Requests
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{myCars.length}</h3>
                <p>My Cars</p>
              </div>
              <div className="stat-card">
                <h3>{myBookings.length}</h3>
                <p>My Bookings</p>
              </div>
              <div className="stat-card">
                <h3>{receivedBookings.length}</h3>
                <p>Pending Requests</p>
              </div>
              <div className="stat-card">
                <h3>{exchangeRequests.length}</h3>
                <p>Exchange Requests</p>
              </div>
            </div>

            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="actions-grid">
                <Link to="/add-car" className="action-card">
                  <span className="action-icon">🚗</span>
                  <span>Add New Car</span>
                </Link>
                <Link to="/cars" className="action-card">
                  <span className="action-icon">🔍</span>
                  <span>Browse Cars</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'myCars' && (
          <div className="my-cars">
            <div className="section-header">
              <h2>My Cars</h2>
              <Link to="/add-car" className="btn btn-primary">Add New Car</Link>
            </div>

            <div className="cars-list">
              {myCars.length > 0 ? (
                myCars.map(car => (
                  <div key={car._id} className="car-item">
                    <div className="car-item-info">
                      <h3>{car.brand} {car.model}</h3>
                      <p>Year: {car.year}</p>
                      <p>Location: {car.location}, {car.area}</p>
                      <span className={`status ${car.isAvailable ? 'available' : 'unavailable'}`}>
                        {car.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                      <span className={`badge ${car.availableFor}`}>
                        {car.availableFor === 'both' ? 'Rent & Exchange' : car.availableFor}
                      </span>
                    </div>
                    <div className="car-item-stats">
                      <p>₹{car.pricePerDay}/day</p>
                      <p>{car.totalBookings || 0} total bookings</p>
                      <p>Rating: {car.rating.toFixed(1)} ⭐ ({car.totalRatings})</p>
                    </div>
                    <div className="car-item-actions">
                      <button className="btn-small">Edit</button>
                      <button className="btn-small btn-danger">Delete</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state">No cars listed yet. <Link to="/add-car">Add your first car</Link></p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'myBookings' && (
          <div className="my-bookings">
            <h2>My Bookings</h2>
            <div className="bookings-list">
              {myBookings.length > 0 ? (
                myBookings.map(booking => (
                  <Link
                    key={booking._id}
                    to={`/booking/${booking._id}`}
                    className="booking-item booking-item-link"
                  >
                    <div className="booking-info">
                      <h3>{booking.car?.brand} {booking.car?.model}</h3>
                      <p>{formatRange(booking.startDate, booking.endDate)}</p>
                      <p>Total: ₹{booking.totalPrice} ({booking.totalDays} days)</p>
                      <span className={`status ${booking.status}`}>{booking.status}</span>
                    </div>
                    <span className="booking-chevron">View details →</span>
                  </Link>
                ))
              ) : (
                <p className="empty-state">No bookings yet. <Link to="/cars">Browse cars</Link></p>
              )}
            </div>

            <h2 style={{ marginTop: '1.5rem' }}>My Exchange Requests</h2>
            <div className="bookings-list">
              {myExchanges.length > 0 ? (
                myExchanges.map(exchange => (
                  <Link
                    key={exchange._id}
                    to={`/exchange/${exchange._id}`}
                    className="booking-item booking-item-link"
                  >
                    <div className="booking-info">
                      <h3>{exchange.requestedCar?.brand} {exchange.requestedCar?.model}</h3>
                      <p>
                        You offered: {exchange.offeredCar?.brand} {exchange.offeredCar?.model}
                      </p>
                      <p>{formatRange(exchange.startDate, exchange.endDate)}</p>
                      <span className={`status ${exchange.status}`}>{exchange.status}</span>
                    </div>
                    <span className="booking-chevron">View details →</span>
                  </Link>
                ))
              ) : (
                <p className="empty-state">No exchange requests sent yet.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'receivedBookings' && (
          <div className="received-bookings">
            <h2>Received Booking Requests</h2>
            <div className="bookings-list">
              {receivedBookings.length > 0 ? (
                receivedBookings.map(booking => (
                  <div key={booking._id} className="booking-item">
                    <div className="booking-info">
                      <h3>{booking.car?.brand} {booking.car?.model}</h3>
                      <p>Renter: {booking.renter?.fullName}</p>
                      <p>Phone: {booking.renter?.phone}</p>
                      <p>{new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}</p>
                      <p>Total: ₹{booking.totalPrice} ({booking.totalDays} days)</p>
                      {booking.message && <p>Message: {booking.message}</p>}
                      <span className={`status ${booking.status}`}>{booking.status}</span>
                    </div>
                    {booking.status === 'pending' && (
                      <div className="booking-actions">
                        <button 
                          className="btn btn-primary btn-small"
                          onClick={() => handleAcceptBooking(booking._id)}
                        >
                          Accept
                        </button>
                        <button 
                          className="btn btn-danger btn-small"
                          onClick={() => handleRejectBooking(booking._id)}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="empty-state">No booking requests</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'exchanges' && (
          <div className="exchange-requests">
            <h2>Car Exchange Requests</h2>
            <div className="exchanges-list">
              {exchangeRequests.length > 0 ? (
                exchangeRequests.map(request => (
                  <div key={request._id} className="exchange-item">
                    <div className="exchange-info">
                      <h3>Exchange Request from {request.requester?.fullName || 'A user'}</h3>
                      <p>Your car: {request.requestedCar?.brand} {request.requestedCar?.model} ({request.requestedCar?.year})</p>
                      <p>Their car: {request.offeredCar?.brand} {request.offeredCar?.model} ({request.offeredCar?.year})</p>
                      <p>{formatRange(request.startDate, request.endDate)} • {request.totalDays} days</p>
                      {request.requester?.phone && <p>Phone: {request.requester.phone}</p>}
                      {request.message && <p>Message: {request.message}</p>}
                      <span className={`status ${request.status}`}>{request.status}</span>
                    </div>
                    {request.status === 'pending' && (
                      <div className="exchange-actions">
                        <button
                          className="btn btn-primary btn-small"
                          onClick={() => handleExchangeStatus(request._id, 'accepted')}
                        >
                          Accept
                        </button>
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => handleExchangeStatus(request._id, 'rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="empty-state">No exchange requests</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

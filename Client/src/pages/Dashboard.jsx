import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [myCars, setMyCars] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [receivedBookings, setReceivedBookings] = useState([]);
  const [exchangeRequests, setExchangeRequests] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // TODO: Replace with actual API calls
      setMyCars([
        { id: 1, brand: 'Honda', model: 'Civic', year: 2020, status: 'available', bookings: 5 },
        { id: 2, brand: 'Maruti', model: 'Swift', year: 2021, status: 'rented', bookings: 3 }
      ]);

      setMyBookings([
        { id: 1, car: 'Toyota Camry', startDate: '2025-12-15', endDate: '2025-12-20', status: 'confirmed' },
        { id: 2, car: 'BMW 3 Series', startDate: '2025-12-25', endDate: '2025-12-27', status: 'pending' }
      ]);

      setReceivedBookings([
        { id: 1, car: 'Honda Civic', renter: 'Alice', startDate: '2025-12-18', endDate: '2025-12-22', status: 'pending' }
      ]);

      setExchangeRequests([
        { id: 1, myCar: 'Honda Civic', theirCar: 'Hyundai Creta', user: 'Bob', status: 'pending' }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleAcceptBooking = (bookingId) => {
    // TODO: Implement API call
    console.log('Accept booking:', bookingId);
    alert('Booking accepted!');
  };

  const handleRejectBooking = (bookingId) => {
    // TODO: Implement API call
    console.log('Reject booking:', bookingId);
    alert('Booking rejected!');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'my-cars' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-cars')}
        >
          My Cars
        </button>
        <button
          className={`tab ${activeTab === 'my-bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-bookings')}
        >
          My Bookings
        </button>
        <button
          className={`tab ${activeTab === 'received-bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('received-bookings')}
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

        {activeTab === 'my-cars' && (
          <div className="my-cars">
            <div className="section-header">
              <h2>My Cars</h2>
              <Link to="/add-car" className="btn btn-primary">Add New Car</Link>
            </div>

            <div className="cars-list">
              {myCars.length > 0 ? (
                myCars.map(car => (
                  <div key={car.id} className="car-item">
                    <div className="car-item-info">
                      <h3>{car.brand} {car.model}</h3>
                      <p>Year: {car.year}</p>
                      <span className={`status ${car.status}`}>{car.status}</span>
                    </div>
                    <div className="car-item-stats">
                      <p>{car.bookings} total bookings</p>
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

        {activeTab === 'my-bookings' && (
          <div className="my-bookings">
            <h2>My Bookings</h2>
            <div className="bookings-list">
              {myBookings.length > 0 ? (
                myBookings.map(booking => (
                  <div key={booking.id} className="booking-item">
                    <h3>{booking.car}</h3>
                    <p>{booking.startDate} to {booking.endDate}</p>
                    <span className={`status ${booking.status}`}>{booking.status}</span>
                  </div>
                ))
              ) : (
                <p className="empty-state">No bookings yet. <Link to="/cars">Browse cars</Link></p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'received-bookings' && (
          <div className="received-bookings">
            <h2>Received Booking Requests</h2>
            <div className="bookings-list">
              {receivedBookings.length > 0 ? (
                receivedBookings.map(booking => (
                  <div key={booking.id} className="booking-item">
                    <div className="booking-info">
                      <h3>{booking.car}</h3>
                      <p>Renter: {booking.renter}</p>
                      <p>{booking.startDate} to {booking.endDate}</p>
                      <span className={`status ${booking.status}`}>{booking.status}</span>
                    </div>
                    {booking.status === 'pending' && (
                      <div className="booking-actions">
                        <button 
                          className="btn btn-primary btn-small"
                          onClick={() => handleAcceptBooking(booking.id)}
                        >
                          Accept
                        </button>
                        <button 
                          className="btn btn-danger btn-small"
                          onClick={() => handleRejectBooking(booking.id)}
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
                  <div key={request.id} className="exchange-item">
                    <div className="exchange-info">
                      <h3>Exchange Request from {request.user}</h3>
                      <p>Your car: {request.myCar}</p>
                      <p>Their car: {request.theirCar}</p>
                      <span className={`status ${request.status}`}>{request.status}</span>
                    </div>
                    {request.status === 'pending' && (
                      <div className="exchange-actions">
                        <button className="btn btn-primary btn-small">Accept</button>
                        <button className="btn btn-danger btn-small">Reject</button>
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

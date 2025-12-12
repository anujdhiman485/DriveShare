import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { bookingAPI, exchangeAPI, carAPI } from '../utils/apiService';
import './BookingPage.css';

const BookingPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { car, type } = location.state || {};

  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    message: '',
    carForExchange: null
  });

  const [myCars, setMyCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch user's cars if type is exchange
  useEffect(() => {
    const fetchMyCars = async () => {
      if (type === 'exchange') {
        try {
          const response = await carAPI.getMyCars();
          if (response.success) {
            setMyCars(response.data || []);
          }
        } catch (err) {
          console.error('Error fetching cars:', err);
        }
      }
    };
    fetchMyCars();
  }, [type]);

  const handleChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
  };

  const calculateDays = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalPrice = calculateDays() * (car?.pricePerDay || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to create a booking');
      navigate('/login');
      return;
    }

    if (type === 'exchange' && !bookingData.carForExchange) {
      setError('Please select a car for exchange');
      setLoading(false);
      return;
    }

    try {
      if (type === 'rent') {
        // Create rental booking
        const bookingPayload = {
          carId: id,  // Match backend expectation
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          message: bookingData.message || ''
        };

        console.log('Creating booking:', bookingPayload);
        const response = await bookingAPI.createBooking(bookingPayload);
        
        if (response.success) {
          alert('Booking request submitted successfully! Check your dashboard.');
          navigate('/dashboard', { state: { showTab: 'myBookings', newBooking: true } });
        } else {
          setError(response.message || 'Failed to create booking');
        }
      } else {
        // Create exchange request
        const exchangePayload = {
          requestedCar: id,
          offeredCar: bookingData.carForExchange,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          message: bookingData.message || ''
        };

        console.log('Creating exchange:', exchangePayload);
        const response = await exchangeAPI.createExchangeRequest(exchangePayload);
        
        if (response.success) {
          alert('Exchange request submitted successfully! Check your dashboard.');
          navigate('/dashboard', { state: { showTab: 'myBookings', newExchange: true } });
        } else {
          setError(response.message || 'Failed to create exchange request');
        }
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!car) {
    return <div className="error">Invalid booking request</div>;
  }

  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="booking-summary">
          <h2>Booking Summary</h2>
          <div className="summary-car">
            <img src={car.image} alt={`${car.brand} ${car.model}`} />
            <div>
              <h3>{car.brand} {car.model}</h3>
              <p>{car.year} • {car.location}</p>
            </div>
          </div>

          {type === 'rent' && (
            <div className="price-breakdown">
              <h3>Price Details</h3>
              <div className="price-row">
                <span>₹{car.pricePerDay} × {calculateDays() || 0} days</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="price-row total">
                <span>Total</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>
          )}
        </div>

        <div className="booking-form-section">
          <h2>{type === 'rent' ? 'Complete Your Booking' : 'Request Car Exchange'}</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group">
              <label htmlFor="startDate">
                {type === 'rent' ? 'Start Date' : 'Exchange Start Date'}
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={bookingData.startDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">
                {type === 'rent' ? 'End Date' : 'Exchange End Date'}
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={bookingData.endDate}
                onChange={handleChange}
                min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {type === 'exchange' && (
              <div className="form-group">
                <label htmlFor="carForExchange">Select Your Car for Exchange</label>
                <select
                  id="carForExchange"
                  name="carForExchange"
                  value={bookingData.carForExchange || ''}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose a car...</option>
                  {myCars.map(myCar => (
                    <option key={myCar._id || myCar.id} value={myCar._id || myCar.id}>
                      {myCar.brand} {myCar.model} ({myCar.year})
                    </option>
                  ))}
                </select>
                <small>Don't have a car listed? <a href="/add-car">Add your car</a></small>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="message">Message to Owner (Optional)</label>
              <textarea
                id="message"
                name="message"
                value={bookingData.message}
                onChange={handleChange}
                placeholder="Any special requests or information..."
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading 
                ? 'Processing...' 
                : type === 'rent' ? 'Confirm Booking' : 'Send Exchange Request'
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { carAPI } from '../utils/apiService';
import './CarDetails.css';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingType, setBookingType] = useState('rent'); // rent or exchange

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      console.log('🚗 Fetching car details for ID:', id);
      const response = await carAPI.getCarById(id);
      
      if (response.success && response.data) {
        console.log('✅ Car details fetched:', response.data);
        // Backend returns { car, reviews } in data
        setCar(response.data.car || response.data);
      } else {
        console.error('Failed to fetch car details:', response.message);
        setCar(null);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching car details:', error);
      setCar(null);
      setLoading(false);
    }
  };

  const handleBooking = () => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    if (bookingType === 'rent') {
      navigate(`/book/${id}`, { state: { car, type: 'rent' } });
    } else {
      navigate(`/book/${id}`, { state: { car, type: 'exchange' } });
    }
  };

  if (loading) {
    return <div className="loading">Loading car details...</div>;
  }

  if (!car) {
    return <div className="error">Car not found</div>;
  }

  return (
    <div className="car-details">
      <div className="details-container">
        <div className="car-image-section">
          <img 
            src={car.images?.[0] || 'https://via.placeholder.com/800x500?text=Car+Image'} 
            alt={`${car.brand} ${car.model}`}
            onError={(e) => {
              console.error('❌ Car details image failed to load');
              e.target.src = `https://via.placeholder.com/800x600/667eea/ffffff?text=${encodeURIComponent(car.brand + ' ' + car.model)}`;
            }}
          />
        </div>

        <div className="car-info-section">
          <h1>{car.brand} {car.model}</h1>
          <div className="car-meta">
            <span>⭐ {car.rating}</span>
            <span>📍 {car.location}</span>
            <span>📅 {car.year}</span>
          </div>

          {car.availableFor !== 'exchange' && (
            <div className="pricing">
              <span className="price">₹{car.pricePerDay}</span>
              <span className="price-label">per day</span>
            </div>
          )}

          <div className="car-specs">
            <div className="spec">
              <span className="spec-label">Fuel Type</span>
              <span className="spec-value">{car.fuelType}</span>
            </div>
            <div className="spec">
              <span className="spec-label">Transmission</span>
              <span className="spec-value">{car.transmission}</span>
            </div>
            <div className="spec">
              <span className="spec-label">Seating</span>
              <span className="spec-value">{car.seats} People</span>
            </div>
          </div>

          <div className="description">
            <h3>About this car</h3>
            <p>{car.description}</p>
          </div>

          <div className="features">
            <h3>Features</h3>
            <div className="features-list">
              {car.features && car.features.length > 0 ? (
                car.features.map((feature, index) => (
                  <span key={index} className="feature-tag">✓ {feature}</span>
                ))
              ) : (
                <p>No features listed</p>
              )}
            </div>
          </div>

          <div className="owner-info">
            <h3>Owner Details</h3>
            <div className="owner-card">
              <div className="owner-avatar">
                {car.owner?.avatar ? (
                  <img src={car.owner.avatar} alt={car.owner.fullName} />
                ) : (
                  '👤'
                )}
              </div>
              <div>
                <p className="owner-name">{car.owner?.fullName || 'Car Owner'}</p>
                <p className="owner-stats">
                  ⭐ {car.owner?.rating || 0} • {car.totalBookings || 0} successful rentals
                </p>
              </div>
            </div>
          </div>

          {car.availableFor === 'both' && (
            <div className="booking-type">
              <label>
                <input
                  type="radio"
                  value="rent"
                  checked={bookingType === 'rent'}
                  onChange={(e) => setBookingType(e.target.value)}
                />
                Rent this car
              </label>
              <label>
                <input
                  type="radio"
                  value="exchange"
                  checked={bookingType === 'exchange'}
                  onChange={(e) => setBookingType(e.target.value)}
                />
                Request Exchange
              </label>
            </div>
          )}

          <button className="btn btn-primary btn-large" onClick={handleBooking}>
            {car.availableFor === 'exchange' || bookingType === 'exchange' 
              ? 'Request Exchange' 
              : 'Book Now'}
          </button>
        </div>
      </div>

      {car.reviews && car.reviews.length > 0 && (
        <div className="reviews-section">
          <h2>Reviews</h2>
          <div className="reviews-list">
            {car.reviews.map((review, index) => (
              <div key={index} className="review-card">
                <div className="review-header">
                  <span className="review-user">{review.user}</span>
                  <span className="review-rating">⭐ {review.rating}</span>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CarDetails;

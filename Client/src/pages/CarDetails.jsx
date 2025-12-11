import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
      // TODO: Replace with actual API call
      const dummyCar = {
        id: parseInt(id),
        brand: 'Toyota',
        model: 'Camry',
        year: 2022,
        pricePerDay: 50,
        location: 'Mumbai',
        image: 'https://via.placeholder.com/800x500?text=Toyota+Camry',
        availableFor: 'both',
        owner: {
          name: 'John Doe',
          rating: 4.5,
          totalRentals: 45
        },
        description: 'Well-maintained Toyota Camry with excellent fuel efficiency. Perfect for city drives and long trips. Fully serviced and cleaned before every rental.',
        features: ['AC', 'Power Steering', 'ABS', 'Airbags', 'Music System', 'GPS'],
        fuelType: 'Petrol',
        transmission: 'Automatic',
        seating: 5,
        rating: 4.5,
        reviews: [
          { user: 'Alice', rating: 5, comment: 'Great car and smooth experience!' },
          { user: 'Bob', rating: 4, comment: 'Good condition, owner was helpful.' }
        ]
      };

      setCar(dummyCar);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching car details:', error);
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
          <img src={car.image} alt={`${car.brand} ${car.model}`} />
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
              <span className="spec-value">{car.seating} People</span>
            </div>
          </div>

          <div className="description">
            <h3>About this car</h3>
            <p>{car.description}</p>
          </div>

          <div className="features">
            <h3>Features</h3>
            <div className="features-list">
              {car.features.map((feature, index) => (
                <span key={index} className="feature-tag">✓ {feature}</span>
              ))}
            </div>
          </div>

          <div className="owner-info">
            <h3>Owner Details</h3>
            <div className="owner-card">
              <div className="owner-avatar">👤</div>
              <div>
                <p className="owner-name">{car.owner.name}</p>
                <p className="owner-stats">
                  ⭐ {car.owner.rating} • {car.owner.totalRentals} successful rentals
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

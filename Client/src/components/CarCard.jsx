import { useNavigate } from 'react-router-dom';
import { formatDistance } from '../utils/locationUtils';
import './CarCard.css';

const CarCard = ({ car, userLocation }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/cars/${car._id || car.id}`);
  };

  // Get owner name from populated owner or fallback
  const ownerName = car.owner?.fullName || car.owner?.username || 'Unknown';
  
  // Get default image if not provided
  const carImage = car.images?.[0] || `https://via.placeholder.com/300x200/667eea/ffffff?text=${encodeURIComponent(car.brand + ' ' + car.model)}`;
  
  // Debug logging
  if (!car.images || car.images.length === 0) {
    console.log('⚠️ CarCard missing images:', {
      brand: car.brand,
      model: car.model,
      images: car.images,
      fallbackImage: carImage
    });
  }

  return (
    <div className="car-card" onClick={handleCardClick}>
      <div className="car-image">
        <img 
          src={carImage} 
          alt={`${car.brand} ${car.model}`}
          onError={(e) => {
            console.error('❌ Image failed to load:', carImage);
            e.target.src = `https://via.placeholder.com/300x200/667eea/ffffff?text=${encodeURIComponent(car.brand + ' ' + car.model)}`;
          }}
        />
        <div className="car-badge">
          {car.availableFor === 'rent' && <span className="badge rent">For Rent</span>}
          {car.availableFor === 'exchange' && <span className="badge exchange">For Exchange</span>}
          {car.availableFor === 'both' && (
            <>
              <span className="badge rent">Rent</span>
              <span className="badge exchange">Exchange</span>
            </>
          )}
        </div>
        {car.distance !== undefined && userLocation && (
          <div className="distance-badge">
            📍 {formatDistance(car.distance)} away
          </div>
        )}
      </div>

      <div className="car-info">
        <h3 className="car-title">{car.brand} {car.model}</h3>
        <p className="car-year">Year: {car.year}</p>
        
        {(car.availableFor === 'rent' || car.availableFor === 'both') && (
          <p className="car-price">₹{car.pricePerDay}/day</p>
        )}
        
        <div className="car-details">
          <span className="car-location">
            📍 {car.area ? `${car.area}, ` : ''}{car.location}
          </span>
          <span className="car-rating">⭐ {car.rating?.toFixed(1) || '0.0'}</span>
        </div>

        <p className="car-owner">Owner: {ownerName}</p>
      </div>
    </div>
  );
};

export default CarCard;

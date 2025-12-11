import { useNavigate } from 'react-router-dom';
import { formatDistance } from '../utils/locationUtils';
import './CarCard.css';

const CarCard = ({ car, userLocation }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/cars/${car.id}`);
  };

  return (
    <div className="car-card" onClick={handleCardClick}>
      <div className="car-image">
        <img src={car.image} alt={`${car.brand} ${car.model}`} />
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
          <span className="car-rating">⭐ {car.rating}</span>
        </div>

        <p className="car-owner">Owner: {car.owner}</p>
      </div>
    </div>
  );
};

export default CarCard;

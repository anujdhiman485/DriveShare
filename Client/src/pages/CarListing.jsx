import { useState, useEffect, useCallback } from 'react';
import CarCard from '../components/CarCard';
import { carAPI } from '../utils/apiService';
import { 
  getCurrentLocation, 
  calculateDistance, 
  indianCities, 
  getCityByName
} from '../utils/locationUtils';
import './CarListing.css';

const CarListing = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, rent, exchange
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [maxDistance, setMaxDistance] = useState(50); // default 50km
  const [sortBy, setSortBy] = useState('distance'); // distance, price, rating
  const [locationError, setLocationError] = useState('');

  const detectUserLocation = useCallback(async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      setLocationError('');
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Unable to get your location. Please select a city manually.');
    }
  }, []);

  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching cars from API...');
      
      // Build query parameters
      const params = {};
      
      // Add location-based search if available
      if (userLocation) {
        params.lat = userLocation.latitude;
        params.lon = userLocation.longitude;
        params.maxDistance = maxDistance;
      } else if (selectedCity) {
        const city = getCityByName(selectedCity);
        if (city) {
          params.lat = city.lat;
          params.lon = city.lon;
          params.maxDistance = maxDistance;
        }
      }
      
      // Add filter
      if (filter !== 'all') {
        params.availableFor = filter;
      }
      
      // Add search term
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      // Add sort
      params.sortBy = sortBy;
      
      console.log('📡 API params:', params);
      
      const response = await carAPI.getAllCars(params);
      console.log('✅ Cars response:', response);
      
      if (response.success) {
        const fetchedCars = response.data.cars || [];
        
        // Add distance calculation for client-side
        const carsWithDistance = fetchedCars.map(car => {
          if (userLocation && car.coordinates?.coordinates) {
            const [lon, lat] = car.coordinates.coordinates; // MongoDB stores as [lon, lat]
            const distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              lat,
              lon
            );
            return { ...car, distance };
          } else if (selectedCity && car.coordinates?.coordinates) {
            const city = getCityByName(selectedCity);
            if (city) {
              const [lon, lat] = car.coordinates.coordinates;
              const distance = calculateDistance(
                city.lat,
                city.lon,
                lat,
                lon
              );
              return { ...car, distance };
            }
          }
          return car;
        });
        
        console.log(`📦 Found ${carsWithDistance.length} cars`);
        setCars(carsWithDistance);
      } else {
        console.error('❌ Failed to fetch cars:', response.message);
        setCars([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching cars:', error);
      setCars([]);
      setLoading(false);
    }
  }, [userLocation, selectedCity, maxDistance, filter, searchTerm, sortBy]);

  useEffect(() => {
    detectUserLocation();
  }, [detectUserLocation]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleCitySelect = (cityName) => {
    setSelectedCity(cityName);
    const city = getCityByName(cityName);
    if (city) {
      setUserLocation({
        latitude: city.lat,
        longitude: city.lon
      });
    }
  };

  const handleUseMyLocation = () => {
    detectUserLocation();
    setSelectedCity('');
  };

  const filteredCars = cars.filter(car => {
    // Filter by availability type
    const matchesFilter = filter === 'all' || 
                         car.availableFor === filter || 
                         car.availableFor === 'both';
    
    // Filter by search term
    const matchesSearch = car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (car.area && car.area.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by distance (if user location is available)
    let matchesDistance = true;
    if (userLocation && car.distance !== undefined) {
      matchesDistance = car.distance <= maxDistance;
    }

    // Filter by selected city
    let matchesCity = true;
    if (selectedCity) {
      matchesCity = car.location.toLowerCase() === selectedCity.toLowerCase();
    }

    return matchesFilter && matchesSearch && matchesDistance && matchesCity;
  });

  // Sort cars
  const sortedCars = [...filteredCars].sort((a, b) => {
    if (sortBy === 'distance' && a.distance !== undefined && b.distance !== undefined) {
      return a.distance - b.distance;
    } else if (sortBy === 'price') {
      return (a.pricePerDay || 0) - (b.pricePerDay || 0);
    } else if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    return 0;
  });

  if (loading) {
    return <div className="loading">Loading cars...</div>;
  }

  return (
    <div className="car-listing">
      <div className="listing-header">
        <h1>Available Cars Near You</h1>
        <p>Find your perfect ride or exchange cars with enthusiasts nearby</p>
      </div>

      {/* Location Section */}
      <div className="location-section">
        <div className="location-header">
          <h3>📍 Your Location</h3>
          <button className="btn-location" onClick={handleUseMyLocation}>
            🎯 Use My Location
          </button>
        </div>

        {locationError && (
          <div className="location-error">{locationError}</div>
        )}

        {userLocation && !selectedCity && (
          <div className="location-info">
            <span className="location-badge">Using your current location</span>
          </div>
        )}

        <div className="city-selector">
          <label htmlFor="citySelect">Or select a city:</label>
          <select
            id="citySelect"
            value={selectedCity}
            onChange={(e) => handleCitySelect(e.target.value)}
            className="city-dropdown"
          >
            <option value="">All Cities</option>
            {indianCities.map(city => (
              <option key={city.name} value={city.name}>
                {city.name}, {city.state}
              </option>
            ))}
          </select>
        </div>

        {userLocation && (
          <div className="distance-filter">
            <label htmlFor="distanceRange">
              Show cars within: <strong>{maxDistance}km</strong>
            </label>
            <input
              type="range"
              id="distanceRange"
              min="5"
              max="200"
              step="5"
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="distance-slider"
            />
            <div className="distance-labels">
              <span>5km</span>
              <span>200km</span>
            </div>
          </div>
        )}
      </div>

      <div className="listing-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by brand, model, area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="control-row">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Cars
            </button>
            <button
              className={`filter-btn ${filter === 'rent' ? 'active' : ''}`}
              onClick={() => setFilter('rent')}
            >
              For Rent
            </button>
            <button
              className={`filter-btn ${filter === 'exchange' ? 'active' : ''}`}
              onClick={() => setFilter('exchange')}
            >
              For Exchange
            </button>
          </div>

          <div className="sort-section">
            <label htmlFor="sortBy">Sort by:</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-dropdown"
            >
              {userLocation && <option value="distance">Nearest First</option>}
              <option value="price">Price: Low to High</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {sortedCars.length > 0 && (
        <div className="results-info">
          Found <strong>{sortedCars.length}</strong> cars
          {selectedCity && ` in ${selectedCity}`}
          {userLocation && !selectedCity && ` within ${maxDistance}km`}
        </div>
      )}

      <div className="cars-grid">
        {sortedCars.length > 0 ? (
          sortedCars.map(car => (
            <CarCard key={car.id} car={car} userLocation={userLocation} />
          ))
        ) : (
          <div className="no-results">
            <p>No cars found matching your criteria</p>
            {userLocation && (
              <button className="btn-secondary" onClick={() => setMaxDistance(maxDistance + 50)}>
                Expand search area to {maxDistance + 50}km
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CarListing;

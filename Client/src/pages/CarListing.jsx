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
  const [maxDistance, setMaxDistance] = useState(200); // default 200km
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
      
      // If city is manually selected, use city-based search (shows ALL cars in that city)
      if (selectedCity) {
        params.city = selectedCity;
        console.log('🏙️ Using city-based search:', selectedCity);
      }
      // Otherwise, use live location with radius search
      else if (userLocation) {
        params.lat = userLocation.latitude;
        params.lon = userLocation.longitude;
        params.maxDistance = maxDistance;
        console.log('📍 Using live location within', maxDistance, 'km');
      }
      // No location available - don't fetch cars
      else {
        console.log('⚠️ No location available - waiting for user location or city selection');
        setCars([]);
        setLoading(false);
        return;
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
        
        // Add distance calculation for client-side display
        const carsWithDistance = fetchedCars.map(car => {
          if (car.coordinates?.coordinates) {
            const [lon, lat] = car.coordinates.coordinates; // MongoDB stores as [lon, lat]
            
            // Calculate distance from user's live location
            if (userLocation && !selectedCity) {
              const distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                lat,
                lon
              );
              return { ...car, distance };
            }
            // Calculate distance from selected city
            else if (selectedCity) {
              const city = getCityByName(selectedCity);
              if (city) {
                const distance = calculateDistance(
                  city.lat,
                  city.lon,
                  lat,
                  lon
                );
                return { ...car, distance };
              }
            }
          }
          return car;
        });
        
        if (selectedCity) {
          console.log(`📦 Found ${carsWithDistance.length} cars in ${selectedCity}`);
        } else {
          console.log(`📦 Found ${carsWithDistance.length} cars within ${maxDistance}km`);
        }
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

        {(userLocation || selectedCity) && (
          <div className="distance-filter">
            <label htmlFor="distanceRange">
              Search radius: <strong>{maxDistance}km</strong>
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

      {(userLocation || selectedCity) && (
        <div className="results-info">
          {sortedCars.length > 0 ? (
            <>
              Found <strong>{sortedCars.length}</strong> cars
              {selectedCity ? (
                <> in <strong>{selectedCity}</strong></>
              ) : (
                <> within <strong>{maxDistance}km</strong> of your location</>
              )}
            </>
          ) : (
            <p>
              {selectedCity 
                ? `Searching for cars in ${selectedCity}...`
                : `Searching for cars within ${maxDistance}km...`
              }
            </p>
          )}
        </div>
      )}

      <div className="cars-grid">
        {loading ? (
          <div className="loading-message">
            <p>Loading cars...</p>
          </div>
        ) : !userLocation && !selectedCity ? (
          <div className="no-results">
            <h3>📍 Location Required</h3>
            <p>Please allow location access or select a city to see available cars within 200km radius.</p>
            <button className="btn-primary" onClick={detectUserLocation}>
              Enable Location Access
            </button>
          </div>
        ) : sortedCars.length > 0 ? (
          sortedCars.map(car => (
            <CarCard key={car._id || car.id} car={car} userLocation={userLocation} />
          ))
        ) : (
          <div className="no-results">
            <p>
              {selectedCity 
                ? `No cars found in ${selectedCity}`
                : `No cars found within ${maxDistance}km of your location`
              }
            </p>
            {!selectedCity && maxDistance < 200 && (
              <button className="btn-secondary" onClick={() => setMaxDistance(Math.min(maxDistance + 50, 200))}>
                Expand search area to {Math.min(maxDistance + 50, 200)}km
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CarListing;

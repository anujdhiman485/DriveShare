import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { indianCities, getCityByName, getCurrentLocation, findNearestCities } from '../utils/locationUtils';
import { carAPI } from '../utils/apiService';
import './AddCar.css';

const AddCar = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    fuelType: 'petrol',
    transmission: 'manual',
    seating: '',
    pricePerDay: '',
    location: '',
    area: '',
    coordinates: { lat: null, lon: null },
    description: '',
    features: [],
    availableFor: 'rent',
    images: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [detectedCity, setDetectedCity] = useState(null);

  const featureOptions = [
    'AC', 'Power Steering', 'ABS', 'Airbags', 'Music System', 
    'GPS', 'Bluetooth', 'Sunroof', 'Parking Sensors', 'Reverse Camera'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      if (checked) {
        setFormData({
          ...formData,
          features: [...formData.features, value]
        });
      } else {
        setFormData({
          ...formData,
          features: formData.features.filter(f => f !== value)
        });
      }
    } else if (name === 'location') {
      // When city is selected, auto-fill coordinates
      const city = getCityByName(value);
      setFormData({
        ...formData,
        location: value,
        coordinates: city ? { lat: city.lat, lon: city.lon } : { lat: null, lon: null }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleUseMyLocation = async () => {
    setDetectingLocation(true);
    setError('');
    
    try {
      const location = await getCurrentLocation();
      console.log('📍 Detected location:', location);
      
      // Find nearest city
      const nearestCities = findNearestCities(location.latitude, location.longitude, 100, 1);
      
      if (nearestCities.length > 0) {
        const nearest = nearestCities[0];
        console.log('🏙️ Nearest city:', nearest.name, nearest.distance, 'km away');
        
        setDetectedCity(nearest);
        setFormData({
          ...formData,
          location: nearest.name,
          coordinates: { 
            lat: location.latitude, 
            lon: location.longitude 
          }
        });
      } else {
        setFormData({
          ...formData,
          coordinates: { 
            lat: location.latitude, 
            lon: location.longitude 
          }
        });
        setError('Location detected, but no nearby city found in our list. Please select a city manually.');
      }
    } catch (err) {
      console.error('Location detection error:', err);
      setError(err.message || 'Failed to detect location. Please enable location permission and try again.');
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    // TODO: Handle image upload to server/cloud storage
    setFormData({
      ...formData,
      images: files
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to add a car');
      navigate('/login');
      return;
    }

    // Validation
    if (!formData.location || !formData.coordinates.lat) {
      setError('Please select a city');
      return;
    }

    if (formData.availableFor !== 'exchange' && !formData.pricePerDay) {
      setError('Please enter price per day for rent');
      return;
    }

    if (!formData.brand || !formData.model || !formData.year || !formData.seating) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.description) {
      setError('Please add a description for your car');
      return;
    }

    if (!formData.area) {
      setError('Please enter the area/locality');
      return;
    }

    setLoading(true);

    try {
      // Prepare car data for API
      const carData = {
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        year: parseInt(formData.year),
        type: 'sedan', // You can add a type selector if needed
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        seats: parseInt(formData.seating),
        pricePerDay: formData.availableFor === 'exchange' ? 0 : parseFloat(formData.pricePerDay),
        description: formData.description.trim(),
        features: formData.features,
        location: formData.location,
        area: formData.area.trim(),
        coordinates: formData.coordinates,
        availableFor: formData.availableFor
      };

      console.log('Sending car data:', carData);

      const response = await carAPI.createCar(carData);
      
      console.log('API Response:', response);
      
      if (response.success) {
        // Navigate to dashboard with state to show My Cars tab
        navigate('/dashboard', { state: { showTab: 'myCars', newCarAdded: true } });
      } else {
        setError(response.message || 'Failed to add car');
      }
    } catch (err) {
      console.error('Error adding car:', err);
      setError(err.message || 'Network error. Please check if backend is running and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-car">
      <div className="add-car-container">
        <h1>List Your Car</h1>
        <p className="subtitle">Share your car and earn money or exchange with fellow enthusiasts</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="add-car-form">
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="brand">Brand *</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Toyota, Honda"
                />
              </div>

              <div className="form-group">
                <label htmlFor="model">Model *</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Camry, Civic"
                />
              </div>

              <div className="form-group">
                <label htmlFor="year">Year *</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  min="2000"
                  max={new Date().getFullYear() + 1}
                  placeholder="2023"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fuelType">Fuel Type *</label>
                <select
                  id="fuelType"
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  required
                >
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="cng">CNG</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="transmission">Transmission *</label>
                <select
                  id="transmission"
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  required
                >
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="seating">Seating Capacity *</label>
                <input
                  type="number"
                  id="seating"
                  name="seating"
                  value={formData.seating}
                  onChange={handleChange}
                  required
                  min="2"
                  max="8"
                  placeholder="5"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Location & Pricing</h2>
            
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="location">City *</label>
                <div className="location-input-group">
                  <select
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a city</option>
                    {indianCities.map(city => (
                      <option key={city.name} value={city.name}>
                        {city.name}, {city.state}
                      </option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    className="use-location-btn"
                    onClick={handleUseMyLocation}
                    disabled={detectingLocation}
                  >
                    {detectingLocation ? '📍 Detecting...' : '📍 Use My Location'}
                  </button>
                </div>
                <small>Select the city where your car is located</small>
                {detectedCity && (
                  <div className="detected-location-info">
                    ✓ Location detected near {detectedCity.name}, {detectedCity.state} ({detectedCity.distance.toFixed(1)}km away)
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="area">Area/Locality *</label>
                <input
                  type="text"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Andheri West, Koramangala"
                />
                <small>Specify the exact area for better search results</small>
              </div>

              <div className="form-group">
                <label htmlFor="pricePerDay">Price Per Day (₹)</label>
                <input
                  type="number"
                  id="pricePerDay"
                  name="pricePerDay"
                  value={formData.pricePerDay}
                  onChange={handleChange}
                  min="0"
                  placeholder="500"
                  disabled={formData.availableFor === 'exchange'}
                />
                <small>Leave empty if only for exchange</small>
              </div>
            </div>

            {formData.location && formData.coordinates.lat && (
              <div className="location-info">
                <p className="info-text">
                  ✓ Location coordinates set: {formData.coordinates.lat.toFixed(4)}, {formData.coordinates.lon.toFixed(4)}
                </p>
                <small>This helps users find cars near them</small>
              </div>
            )}
          </div>

          <div className="form-section">
            <h2>Availability</h2>
            
            <div className="form-group">
              <label>Available For *</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="availableFor"
                    value="rent"
                    checked={formData.availableFor === 'rent'}
                    onChange={handleChange}
                  />
                  Rent Only
                </label>
                <label>
                  <input
                    type="radio"
                    name="availableFor"
                    value="exchange"
                    checked={formData.availableFor === 'exchange'}
                    onChange={handleChange}
                  />
                  Exchange Only
                </label>
                <label>
                  <input
                    type="radio"
                    name="availableFor"
                    value="both"
                    checked={formData.availableFor === 'both'}
                    onChange={handleChange}
                  />
                  Both
                </label>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Description</h2>
            
            <div className="form-group">
              <label htmlFor="description">Car Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe your car, its condition, and any special features..."
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Features</h2>
            
            <div className="features-grid">
              {featureOptions.map(feature => (
                <label key={feature} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={feature}
                    checked={formData.features.includes(feature)}
                    onChange={handleChange}
                  />
                  {feature}
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2>Images</h2>
            
            <div className="form-group">
              <label htmlFor="images">Upload Car Images</label>
              <input
                type="file"
                id="images"
                name="images"
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
              <small>You can upload multiple images</small>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
            {loading ? 'Adding Car...' : 'List My Car'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCar;

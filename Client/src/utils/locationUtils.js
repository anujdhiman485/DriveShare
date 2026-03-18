// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Get user's current location
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    console.log('📍 Requesting current location from browser...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        console.log('✅ Location detected:', location);
        resolve(location);
      },
      (error) => {
        console.error('❌ Location error:', error);
        let errorMessage = 'Unable to get your location';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'An unknown error occurred while getting location.';
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true, // Request GPS for more accurate location
        timeout: 10000, // 10 second timeout
        maximumAge: 0 // Don't use cached position
      }
    );
  });
};

// Major Indian cities with coordinates (you can expand this)
export const indianCities = [
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777 },
  { name: 'Delhi', state: 'Delhi', lat: 28.7041, lon: 77.1025 },
  { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lon: 77.5946 },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867 },
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714 },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639 },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
  { name: 'Surat', state: 'Gujarat', lat: 21.1702, lon: 72.8311 },
  { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
  { name: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lon: 80.3319 },
  { name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882 },
  { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577 },
  { name: 'Thane', state: 'Maharashtra', lat: 19.2183, lon: 72.9781 },
  { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126 },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lon: 83.2185 },
  { name: 'Pimpri-Chinchwad', state: 'Maharashtra', lat: 18.6298, lon: 73.7997 },
  { name: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376 },
  { name: 'Vadodara', state: 'Gujarat', lat: 22.3072, lon: 73.1812 },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6692, lon: 77.4538 },
  { name: 'Ludhiana', state: 'Punjab', lat: 30.9010, lon: 75.8573 },
  { name: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lon: 78.0081 },
  { name: 'Nashik', state: 'Maharashtra', lat: 19.9975, lon: 73.7898 },
  { name: 'Faridabad', state: 'Haryana', lat: 28.4089, lon: 77.3178 },
  { name: 'Ambala', state: 'Haryana', lat: 30.3782, lon: 76.7767 },
  { name: 'Panchkula', state: 'Haryana', lat: 30.6942, lon: 76.8534 },
  { name: 'Meerut', state: 'Uttar Pradesh', lat: 28.9845, lon: 77.7064 },
  { name: 'Rajkot', state: 'Gujarat', lat: 22.3039, lon: 70.8022 },
  { name: 'Kalyan-Dombivali', state: 'Maharashtra', lat: 19.2403, lon: 73.1305 },
  { name: 'Vasai-Virar', state: 'Maharashtra', lat: 19.4612, lon: 72.7988 },
  { name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739 },
  { name: 'Srinagar', state: 'Jammu and Kashmir', lat: 34.0837, lon: 74.7973 },
  { name: 'Aurangabad', state: 'Maharashtra', lat: 19.8762, lon: 75.3433 },
  { name: 'Dhanbad', state: 'Jharkhand', lat: 23.7957, lon: 86.4304 },
  { name: 'Amritsar', state: 'Punjab', lat: 31.6340, lon: 74.8723 },
  { name: 'Navi Mumbai', state: 'Maharashtra', lat: 19.0330, lon: 73.0297 },
  { name: 'Allahabad', state: 'Uttar Pradesh', lat: 25.4358, lon: 81.8463 },
  { name: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lon: 85.3096 },
  { name: 'Howrah', state: 'West Bengal', lat: 22.5958, lon: 88.2636 },
  { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558 },
  { name: 'Jabalpur', state: 'Madhya Pradesh', lat: 23.1815, lon: 79.9864 },
  { name: 'Gwalior', state: 'Madhya Pradesh', lat: 26.2183, lon: 78.1828 },
  { name: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lon: 80.6480 },
  { name: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lon: 73.0243 },
  { name: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lon: 78.1198 },
  { name: 'Raipur', state: 'Chhattisgarh', lat: 21.2514, lon: 81.6296 },
  { name: 'Kota', state: 'Rajasthan', lat: 25.2138, lon: 75.8648 },
  { name: 'Chandigarh', state: 'Chandigarh', lat: 30.7333, lon: 76.7794 },
  { name: 'Guwahati', state: 'Assam', lat: 26.1445, lon: 91.7362 },
  { name: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lon: 77.3910 },
  { name: 'Gurugram', state: 'Haryana', lat: 28.4595, lon: 77.0266 },
];

// Find nearest cities to given coordinates
export const findNearestCities = (userLat, userLon, maxDistance = 100, limit = 10) => {
  const citiesWithDistance = indianCities.map(city => ({
    ...city,
    distance: calculateDistance(userLat, userLon, city.lat, city.lon)
  }));

  return citiesWithDistance
    .filter(city => city.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
};

// Get city by name
export const getCityByName = (cityName) => {
  return indianCities.find(city => 
    city.name.toLowerCase() === cityName.toLowerCase()
  );
};

// Format distance for display
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance}km`;
};

// Check if car is within range
export const isCarInRange = (carLat, carLon, userLat, userLon, maxDistance) => {
  const distance = calculateDistance(userLat, userLon, carLat, carLon);
  return distance <= maxDistance;
};

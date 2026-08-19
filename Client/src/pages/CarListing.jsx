import { useState, useEffect, useCallback } from 'react';
import CarCard from '@/components/CarCard';
import { CarCardSkeleton, EmptyState } from '@/components/StateMessage';
import { carAPI } from '@/utils/apiService';
import {
  Search,
  LocateFixed,
  ArrowUpDown,
  MapPin,
  AlertCircleIcon,
  CarFront,
  CheckCircle2Icon
} from 'lucide-react';
import gsap from 'gsap';
import {
  getCurrentLocation,
  calculateDistance,
  indianCities,
  getCityByName,
  findNearestCities
} from '@/utils/locationUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Field, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const filters = [
  { value: 'all', label: 'All Cars' },
  { value: 'rent', label: 'For Rent' },
  { value: 'exchange', label: 'For Exchange' }
];

const ALL_CITIES = '__all__';

const CarListing = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, rent, exchange
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [nearestCity, setNearestCity] = useState(null);
  const [selectedCity, setSelectedCity] = useState(''); // Default to empty string (All Cities)
  const [maxDistance, setMaxDistance] = useState(200); // default 200km
  const [sortBy, setSortBy] = useState('distance'); // distance, price, rating
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    gsap.fromTo(
      '[data-listing-reveal]',
      { y: 12, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.4, ease: 'power2.out' }
    );
  }, []);

  const detectUserLocation = useCallback(async () => {
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      setSelectedCity(null); // Clear city selection when using live location
      setLocationError('');
      // Find nearest city
      const nearestCities = findNearestCities(location.latitude, location.longitude, 200, 1);
      if (nearestCities.length > 0) {
        setNearestCity(nearestCities[0]);
      } else {
        setNearestCity(null);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Unable to get your location. Please try again or select a city manually.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = {};

      // If "All Cities" is selected (empty string), don't add any location filter
      if (selectedCity === '') {
        // Don't add any location parameters
      }
      // If city is manually selected, use city-based search (shows ALL cars in that city)
      else if (selectedCity) {
        params.city = selectedCity;
      }
      // Otherwise, use live location with radius search
      else if (userLocation) {
        params.lat = userLocation.latitude;
        params.lon = userLocation.longitude;
        params.maxDistance = maxDistance;
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

      const response = await carAPI.getAllCars(params);

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
                const distance = calculateDistance(city.lat, city.lon, lat, lon);
                return { ...car, distance };
              }
            }
          }
          return car;
        });

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
    // Don't auto-detect location on mount — the user opts in with the button.
    fetchCars();
  }, [fetchCars]);

  const handleCitySelect = (cityName) => {
    setSelectedCity(cityName === ALL_CITIES ? '' : cityName);
    setUserLocation(null); // Clear live location when selecting a city
    setNearestCity(null); // Clear nearest city
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

  useEffect(() => {
    if (!sortedCars.length) return;
    gsap.fromTo(
      '[data-car-grid] > *',
      { y: 12, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, stagger: 0.04, duration: 0.32, ease: 'power2.out' }
    );
  }, [sortedCars]);

  const scopeLabel =
    selectedCity === ''
      ? 'from all cities'
      : selectedCity
        ? `in ${selectedCity}`
        : `within ${maxDistance}km of your location`;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <header data-listing-reveal>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Browse available cars
        </h1>
        <p className="mt-2 text-muted-foreground">
          Find your perfect ride or exchange cars with fellow enthusiasts.
        </p>
      </header>

      {/* ---------- Location panel ---------- */}
      <Card data-listing-reveal className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-4" />
            Search location
          </CardTitle>
          <CardAction>
            <Button variant="outline" size="sm" onClick={handleUseMyLocation}>
              <LocateFixed data-icon="inline-start" />
              Use my location
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          {locationError && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>{locationError}</AlertTitle>
            </Alert>
          )}

          {userLocation && selectedCity === null && (
            <Alert>
              <CheckCircle2Icon />
              <AlertTitle>
                Using your current location
                {nearestCity && ` near ${nearestCity.name}, ${nearestCity.state}`}
              </AlertTitle>
              <AlertDescription>
                {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                {nearestCity && ` — ${Math.round(nearestCity.distance)}km away`}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="citySelect">Select a city</FieldLabel>
              <Select
                value={selectedCity === null || selectedCity === '' ? ALL_CITIES : selectedCity}
                onValueChange={handleCitySelect}
              >
                <SelectTrigger id="citySelect" className="w-full">
                  <SelectValue placeholder="All cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={ALL_CITIES}>All cities (default)</SelectItem>
                    {indianCities.map(city => (
                      <SelectItem key={city.name} value={city.name}>
                        {city.name}, {city.state}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            {(userLocation || selectedCity) && (
              <Field>
                <FieldLabel htmlFor="distanceRange">
                  Search radius — {maxDistance}km
                </FieldLabel>
                <Slider
                  id="distanceRange"
                  min={5}
                  max={200}
                  step={5}
                  value={[maxDistance]}
                  onValueChange={([value]) => setMaxDistance(value)}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5km</span>
                  <span>200km</span>
                </div>
              </Field>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ---------- Search + filters ---------- */}
      <div data-listing-reveal className="mt-6 flex flex-col gap-4">
        <InputGroup className="h-10">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            type="text"
            placeholder="Search by brand, model, area…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <ToggleGroup
            type="single"
            variant="outline"
            value={filter}
            onValueChange={(value) => value && setFilter(value)}
          >
            {filters.map(({ value, label }) => (
              <ToggleGroupItem key={value} value={value}>
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="size-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger size="sm" aria-label="Sort by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {userLocation && <SelectItem value="distance">Nearest first</SelectItem>}
                  <SelectItem value="price">Price: low to high</SelectItem>
                  <SelectItem value="rating">Highest rated</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ---------- Results ---------- */}
      <p className="mt-6 text-sm text-muted-foreground">
        {loading ? (
          'Searching…'
        ) : (
          <>
            <span className="font-medium text-foreground">{sortedCars.length}</span>{' '}
            {sortedCars.length === 1 ? 'car' : 'cars'} {scopeLabel}
          </>
        )}
      </p>

      <div data-car-grid className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }, (_, i) => <CarCardSkeleton key={i} />)
          : sortedCars.map(car => (
              <CarCard key={car._id || car.id} car={car} userLocation={userLocation} />
            ))}
      </div>

      {!loading && sortedCars.length === 0 && (
        <div className="mt-5">
          <EmptyState
            icon={CarFront}
            title="No cars found"
            description={
              selectedCity === ''
                ? 'There are no cars available right now. Check back soon.'
                : selectedCity
                  ? `Nothing listed in ${selectedCity} yet — try another city or widen your search.`
                  : `Nothing within ${maxDistance}km of your location.`
            }
          >
            {!selectedCity && selectedCity !== '' && maxDistance < 200 && (
              <Button
                variant="outline"
                onClick={() => setMaxDistance(Math.min(maxDistance + 50, 200))}
              >
                Expand to {Math.min(maxDistance + 50, 200)}km
              </Button>
            )}
          </EmptyState>
        </div>
      )}
    </div>
  );
};

export default CarListing;

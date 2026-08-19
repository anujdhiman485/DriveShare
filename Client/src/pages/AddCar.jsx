import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { indianCities, getCityByName, getCurrentLocation, findNearestCities } from '@/utils/locationUtils';
import { carAPI } from '@/utils/apiService';
import { AlertCircleIcon, CheckCircle2Icon, ImagePlus, LocateFixed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const featureOptions = [
  'AC', 'Power Steering', 'ABS', 'Airbags', 'Music System',
  'GPS', 'Bluetooth', 'Sunroof', 'Parking Sensors', 'Reverse Camera'
];

const availabilityOptions = [
  { value: 'rent', title: 'Rent only' },
  { value: 'exchange', title: 'Exchange only' },
  { value: 'both', title: 'Both' }
];

/** Card wrapper for one step of the listing form. */
const Section = ({ step, title, description, children }) => (
  <Card className="[--card-spacing:--spacing(6)]">
    <CardHeader>
      <CardTitle className="flex items-center gap-2.5">
        <span className="flex size-6 items-center justify-center rounded-md bg-muted text-xs font-medium">
          {step}
        </span>
        {title}
      </CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSelect = (name) => (value) => {
    if (name === 'location') {
      // When city is selected, auto-fill coordinates
      const city = getCityByName(value);
      setFormData((current) => ({
        ...current,
        location: value,
        coordinates: city ? { lat: city.lat, lon: city.lon } : { lat: null, lon: null }
      }));
      return;
    }
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const toggleFeature = (feature) => (checked) => {
    setFormData((current) => ({
      ...current,
      features: checked
        ? [...current.features, feature]
        : current.features.filter((f) => f !== feature)
    }));
  };

  const handleUseMyLocation = async () => {
    setDetectingLocation(true);
    setError('');

    try {
      const location = await getCurrentLocation();

      // Find nearest city
      const nearestCities = findNearestCities(location.latitude, location.longitude, 100, 1);

      if (nearestCities.length > 0) {
        const nearest = nearestCities[0];

        setDetectedCity(nearest);
        setFormData((current) => ({
          ...current,
          location: nearest.name,
          coordinates: { lat: location.latitude, lon: location.longitude }
        }));
      } else {
        setFormData((current) => ({
          ...current,
          coordinates: { lat: location.latitude, lon: location.longitude }
        }));
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
    setFormData((current) => ({ ...current, images: files }));
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

      const response = await carAPI.createCar(carData);

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
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <header>
        <p className="text-sm text-muted-foreground">Become a host</p>
        <h1 className="font-heading mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
          List your car
        </h1>
        <p className="mt-2 text-muted-foreground">
          Share your car and earn money, or exchange with fellow enthusiasts.
        </p>
      </header>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircleIcon />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        {/* ---------- Basics ---------- */}
        <Section step="1" title="Basic information" description="Tell us what you're listing.">
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="brand">Brand *</FieldLabel>
                <Input id="brand" name="brand" value={formData.brand} onChange={handleChange}
                  required placeholder="Toyota" />
              </Field>

              <Field>
                <FieldLabel htmlFor="model">Model *</FieldLabel>
                <Input id="model" name="model" value={formData.model} onChange={handleChange}
                  required placeholder="Camry" />
              </Field>

              <Field>
                <FieldLabel htmlFor="year">Year *</FieldLabel>
                <Input type="number" id="year" name="year" value={formData.year}
                  onChange={handleChange} required min="2000"
                  max={new Date().getFullYear() + 1} placeholder="2023" />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="fuelType">Fuel type *</FieldLabel>
                <Select value={formData.fuelType} onValueChange={handleSelect('fuelType')}>
                  <SelectTrigger id="fuelType" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="cng">CNG</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="transmission">Transmission *</FieldLabel>
                <Select value={formData.transmission} onValueChange={handleSelect('transmission')}>
                  <SelectTrigger id="transmission" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="automatic">Automatic</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="seating">Seats *</FieldLabel>
                <Input type="number" id="seating" name="seating" value={formData.seating}
                  onChange={handleChange} required min="2" max="8" placeholder="5" />
              </Field>
            </div>
          </FieldGroup>
        </Section>

        {/* ---------- Location & pricing ---------- */}
        <Section step="2" title="Location & pricing" description="Where the car lives, and what it costs.">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="location">City *</FieldLabel>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select value={formData.location} onValueChange={handleSelect('location')}>
                  <SelectTrigger id="location" className="w-full">
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {indianCities.map(city => (
                        <SelectItem key={city.name} value={city.name}>
                          {city.name}, {city.state}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={handleUseMyLocation}
                  disabled={detectingLocation}
                >
                  {detectingLocation
                    ? <Spinner data-icon="inline-start" />
                    : <LocateFixed data-icon="inline-start" />}
                  {detectingLocation ? 'Detecting…' : 'Use my location'}
                </Button>
              </div>
              <FieldDescription>Select the city where your car is located.</FieldDescription>
            </Field>

            {detectedCity && (
              <Alert>
                <CheckCircle2Icon />
                <AlertTitle>
                  Location detected near {detectedCity.name}, {detectedCity.state}
                </AlertTitle>
                <AlertDescription>{detectedCity.distance.toFixed(1)}km away</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="area">Area / locality *</FieldLabel>
                <Input id="area" name="area" value={formData.area} onChange={handleChange}
                  required placeholder="Andheri West, Koramangala" />
                <FieldDescription>Helps nearby renters find you.</FieldDescription>
              </Field>

              <Field data-disabled={formData.availableFor === 'exchange' ? true : undefined}>
                <FieldLabel htmlFor="pricePerDay">Price per day (₹)</FieldLabel>
                <Input type="number" id="pricePerDay" name="pricePerDay"
                  value={formData.pricePerDay} onChange={handleChange} min="0" placeholder="500"
                  disabled={formData.availableFor === 'exchange'} />
                <FieldDescription>Leave empty if exchange-only.</FieldDescription>
              </Field>
            </div>

            {formData.location && formData.coordinates.lat && (
              <Alert>
                <CheckCircle2Icon />
                <AlertTitle>
                  Coordinates set: {formData.coordinates.lat.toFixed(4)},{' '}
                  {formData.coordinates.lon.toFixed(4)}
                </AlertTitle>
                <AlertDescription>This helps users find cars near them.</AlertDescription>
              </Alert>
            )}
          </FieldGroup>
        </Section>

        {/* ---------- Availability ---------- */}
        <Section step="3" title="Availability" description="How do you want to share this car?">
          <Field>
            <FieldLabel htmlFor="availableFor">Available for *</FieldLabel>
            <ToggleGroup
              id="availableFor"
              type="single"
              variant="outline"
              className="w-full *:flex-1"
              value={formData.availableFor}
              onValueChange={(value) => value && handleSelect('availableFor')(value)}
            >
              {availabilityOptions.map(({ value, title }) => (
                <ToggleGroupItem key={value} value={value}>{title}</ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>
        </Section>

        {/* ---------- Description ---------- */}
        <Section step="4" title="Description" description="Set expectations up front.">
          <Field>
            <FieldLabel htmlFor="description">Car description *</FieldLabel>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe your car, its condition, and any special features…"
              className="min-h-28"
            />
          </Field>
        </Section>

        {/* ---------- Features ---------- */}
        <Section step="5" title="Features" description="Pick everything the car has.">
          <FieldSet>
            <FieldLegend className="sr-only">Features</FieldLegend>
            <div className="grid gap-3 sm:grid-cols-2">
              {featureOptions.map(feature => (
                <FieldLabel key={feature} htmlFor={`feature-${feature}`}>
                  <Field orientation="horizontal">
                    <Checkbox
                      id={`feature-${feature}`}
                      checked={formData.features.includes(feature)}
                      onCheckedChange={toggleFeature(feature)}
                    />
                    <FieldTitle>{feature}</FieldTitle>
                  </Field>
                </FieldLabel>
              ))}
            </div>
          </FieldSet>
        </Section>

        {/* ---------- Images ---------- */}
        <Section step="6" title="Images" description="Listings with photos get far more requests.">
          <FieldLabel
            htmlFor="images"
            className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center transition-colors hover:bg-muted"
          >
            <ImagePlus className="size-6 text-muted-foreground" />
            <span className="font-medium">Click to upload car images</span>
            <span className="text-xs text-muted-foreground">
              PNG or JPG — you can select multiple
            </span>
            <input
              type="file" id="images" name="images"
              multiple accept="image/*"
              onChange={handleImageChange}
              className="sr-only"
            />
          </FieldLabel>

          {formData.images.length > 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              {formData.images.length} image{formData.images.length === 1 ? '' : 's'} selected
            </p>
          )}
        </Section>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Spinner data-icon="inline-start" />}
          {loading ? 'Adding car…' : 'List my car'}
        </Button>
      </form>
    </div>
  );
};

export default AddCar;

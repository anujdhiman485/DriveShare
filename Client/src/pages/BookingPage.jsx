import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { bookingAPI, carAPI } from '@/utils/apiService';
import { carImageSrc, handleImageError } from '@/utils/carImage';
import { PageLoader, PageMessage } from '@/components/StateMessage';
import { AlertCircleIcon, ArrowLeft, CarFront } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';

const BookingPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // location.state is only there when we arrived from the car details page; a refresh
  // or a shared link has to rebuild both the car and the booking type from the URL.
  const [car, setCar] = useState(location.state?.car || null);
  const [carLoading, setCarLoading] = useState(!location.state?.car);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  // Rehydrate the car when we didn't get it through navigation state
  useEffect(() => {
    if (car) return;

    const fetchCar = async () => {
      try {
        const response = await carAPI.getCarById(id);
        if (response.success && response.data) {
          setCar(response.data.car || response.data);
        }
      } catch (err) {
        console.error('Error fetching car:', err);
      } finally {
        setCarLoading(false);
      }
    };
    fetchCar();
  }, [id, car]);

  const handleChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
  };

  const calculateDays = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalPrice = calculateDays() * (car?.pricePerDay || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to create a booking');
      navigate('/login');
      return;
    }

    try {
      const bookingPayload = {
        carId: id,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        message: bookingData.message || ''
      };

      const response = await bookingAPI.createBooking(bookingPayload);

      if (response.success && response.data?._id) {
        navigate(`/booking/${response.data._id}`, {
          replace: true,
          state: { record: response.data }
        });
      } else {
        setError(response.message || 'Failed to create booking');
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (carLoading) {
    return <PageLoader label="Loading booking details…" />;
  }

  if (!car) {
    return (
      <PageMessage
        icon={CarFront}
        title="Invalid booking request"
        description="We couldn't find the car you're trying to book."
      >
        <Button asChild>
          <Link to="/cars">Browse cars</Link>
        </Button>
      </PageMessage>
    );
  }

  const label = `${car.brand} ${car.model}`;
  const days = calculateDays();

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft data-icon="inline-start" />
        Back
      </Button>

      <header>
        <p className="text-sm text-muted-foreground">Rental</p>
        <h1 className="font-heading mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
          Complete your booking
        </h1>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-10">
        {/* ---------- Summary ---------- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <img
              src={carImageSrc(car)}
              alt={label}
              onError={handleImageError(label)}
              className="aspect-16/10 w-full object-cover"
            />

            <CardContent className="flex flex-col gap-1">
              <CardTitle>{label}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {car.year} • {car.location}
              </p>
            </CardContent>

            <CardContent className="flex flex-col gap-3">
                <Separator />
                <p className="text-xs text-muted-foreground">Price details</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    ₹{car.pricePerDay} × {days} {days === 1 ? 'day' : 'days'}
                  </span>
                  <span>₹{totalPrice}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-heading text-2xl font-semibold">₹{totalPrice}</span>
                </div>
                <p className="text-xs text-muted-foreground">Pay the owner directly at pickup.</p>
            </CardContent>
          </Card>
        </aside>

        {/* ---------- Form ---------- */}
        <Card className="[--card-spacing:--spacing(6)]">
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircleIcon />
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="startDate">
                      Start date
                    </FieldLabel>
                    <Input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={bookingData.startDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="endDate">
                      End date
                    </FieldLabel>
                    <Input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={bookingData.endDate}
                      onChange={handleChange}
                      min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="message">Message to owner (optional)</FieldLabel>
                  <Textarea
                    id="message"
                    name="message"
                    value={bookingData.message}
                    onChange={handleChange}
                    placeholder="Any special requests or information…"
                    className="min-h-28"
                  />
                </Field>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading && <Spinner data-icon="inline-start" />}
                  {loading
                    ? 'Processing…'
                    : 'Confirm booking'}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingPage;

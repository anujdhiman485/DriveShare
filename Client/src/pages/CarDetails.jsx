import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { carAPI } from '@/utils/apiService';
import { carImageSrc, handleImageError } from '@/utils/carImage';
import { PageLoader, PageMessage } from '@/components/StateMessage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import {
  ArrowLeft,
  CarFront,
  Check,
  Cog,
  Fuel,
  MapPin,
  Star,
  Users,
  Calendar
} from 'lucide-react';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingType, setBookingType] = useState('rent'); // rent or exchange

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await carAPI.getCarById(id);

        if (response.success && response.data) {
          // Backend returns { car, reviews } in data
          setCar(response.data.car || response.data);
        } else {
          console.error('Failed to fetch car details:', response.message);
          setCar(null);
        }
      } catch (error) {
        console.error('Error fetching car details:', error);
        setCar(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [id]);

  const handleBooking = () => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    // availableFor === 'exchange' cars can only ever be exchanged
    const type =
      car.availableFor === 'exchange' || bookingType === 'exchange' ? 'exchange' : 'rent';

    navigate(`/book/${id}?type=${type}`, { state: { car, type } });
  };

  if (loading) {
    return <PageLoader label="Loading car details…" />;
  }

  if (!car) {
    return (
      <PageMessage
        icon={CarFront}
        title="Car not found"
        description="This listing may have been removed or the link is incorrect."
      >
        <Button asChild>
          <Link to="/cars">Browse cars</Link>
        </Button>
      </PageMessage>
    );
  }

  const label = `${car.brand} ${car.model}`;
  const isExchangeOnly = car.availableFor === 'exchange';
  const ownerName = car.owner?.fullName || 'Car owner';
  const specs = [
    { icon: Fuel, label: 'Fuel type', value: car.fuelType },
    { icon: Cog, label: 'Transmission', value: car.transmission },
    { icon: Users, label: 'Seating', value: `${car.seats} people` }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft data-icon="inline-start" />
        Back
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-10">
        {/* ---------- Left: gallery + content ---------- */}
        <div>
          <img
            src={carImageSrc(car)}
            alt={label}
            onError={handleImageError(label)}
            className="aspect-16/10 w-full rounded-xl object-cover ring-1 ring-foreground/10"
          />

          <div className="mt-7 flex flex-wrap gap-2">
            {(car.availableFor === 'rent' || car.availableFor === 'both') && (
              <Badge variant="secondary">For rent</Badge>
            )}
            {(car.availableFor === 'exchange' || car.availableFor === 'both') && (
              <Badge variant="outline">For exchange</Badge>
            )}
          </div>

          <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {label}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Star className="size-4" />
              {car.rating?.toFixed?.(1) ?? car.rating}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" />
              {car.area ? `${car.area}, ` : ''}{car.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4" />
              {car.year}
            </span>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {specs.map(({ icon: Icon, label: specLabel, value }) => (
              <div key={specLabel} className="rounded-xl border p-4">
                <Icon className="size-4 text-muted-foreground" />
                <p className="mt-3 text-xs text-muted-foreground">{specLabel}</p>
                <p className="mt-1 font-medium capitalize">{value}</p>
              </div>
            ))}
          </div>

          <Separator className="my-9" />

          <section>
            <h2 className="font-heading text-xl font-semibold tracking-tight">About this car</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {car.description || 'The owner hasn’t added a description yet.'}
            </p>
          </section>

          <section className="mt-9">
            <h2 className="font-heading text-xl font-semibold tracking-tight">Features</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {car.features && car.features.length > 0 ? (
                car.features.map((feature, index) => (
                  <Badge key={index} variant="outline">
                    <Check />
                    {feature}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No features listed.</p>
              )}
            </div>
          </section>

          {car.reviews && car.reviews.length > 0 && (
            <section className="mt-9">
              <h2 className="font-heading text-xl font-semibold tracking-tight">Reviews</h2>
              <div className="mt-4 grid gap-3">
                {car.reviews.map((review, index) => (
                  <Item key={index} variant="outline">
                    <ItemContent>
                      <ItemTitle>{review.user}</ItemTitle>
                      <ItemDescription>{review.comment}</ItemDescription>
                    </ItemContent>
                    <Badge variant="secondary">
                      <Star />
                      {review.rating}
                    </Badge>
                  </Item>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ---------- Right: sticky booking panel ---------- */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <Card className="[--card-spacing:--spacing(5)]">
            <CardContent className="flex flex-col gap-5">
              {isExchangeOnly ? (
                <div>
                  <Badge variant="outline">Exchange only</Badge>
                  <p className="mt-3 text-sm text-muted-foreground">
                    This owner is looking to swap keys rather than rent out.
                  </p>
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-4xl font-semibold tracking-tight">
                    ₹{car.pricePerDay}
                  </span>
                  <span className="text-sm text-muted-foreground">per day</span>
                </div>
              )}

              {car.availableFor === 'both' && (
                <ToggleGroup
                  type="single"
                  variant="outline"
                  className="w-full *:flex-1"
                  value={bookingType}
                  onValueChange={(value) => value && setBookingType(value)}
                >
                  <ToggleGroupItem value="rent">Rent</ToggleGroupItem>
                  <ToggleGroupItem value="exchange">Exchange</ToggleGroupItem>
                </ToggleGroup>
              )}

              <Button size="lg" className="w-full" onClick={handleBooking}>
                {isExchangeOnly || bookingType === 'exchange' ? 'Request exchange' : 'Book now'}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                You won&apos;t be charged yet — the owner reviews your request first.
              </p>
            </CardContent>
          </Card>

          <Card className="[--card-spacing:--spacing(5)]">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Owner</CardTitle>
            </CardHeader>
            <CardContent>
              <Item className="px-0">
                <Avatar className="size-10">
                  <AvatarImage src={car.owner?.avatar} alt={ownerName} />
                  <AvatarFallback>{ownerName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <ItemContent>
                  <ItemTitle>{ownerName}</ItemTitle>
                  <ItemDescription>
                    ⭐ {car.owner?.rating || 0} • {car.totalBookings || 0} successful rentals
                  </ItemDescription>
                </ItemContent>
              </Item>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default CarDetails;

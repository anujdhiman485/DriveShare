import { Link } from 'react-router-dom';
import { formatDistance } from '@/utils/locationUtils';
import { carImageSrc, handleImageError } from '@/utils/carImage';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fuel, Gauge, MapPin, Star, UserRound } from 'lucide-react';

const CarCard = ({ car, userLocation }) => {
  const ownerName = car.owner?.fullName || car.owner?.username || 'Unknown';
  const label = `${car.brand} ${car.model}`;
  const showsPrice = car.availableFor === 'rent' || car.availableFor === 'both';

  return (
    <Card className="relative transition-shadow hover:ring-foreground/20">
      <img
        src={carImageSrc(car)}
        alt={label}
        loading="lazy"
        onError={handleImageError(label)}
        className="aspect-16/10 w-full object-cover"
      />

      <CardHeader>
        <CardTitle className="truncate">
          {/* Overlay turns the whole card into one link target. */}
          <Link to={`/cars/${car._id || car.id}`} className="after:absolute after:inset-0">
            {label}
          </Link>
        </CardTitle>

        {showsPrice && (
          <CardAction className="text-right">
            <div className="font-heading text-lg leading-none font-semibold">₹{car.pricePerDay}</div>
            <div className="mt-1 text-xs text-muted-foreground">per day</div>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(car.availableFor === 'rent' || car.availableFor === 'both') && (
            <Badge variant="secondary">Rent</Badge>
          )}
          {(car.availableFor === 'exchange' || car.availableFor === 'both') && (
            <Badge variant="outline">Exchange</Badge>
          )}
          {car.distance !== undefined && userLocation && (
            <Badge variant="outline">
              <MapPin />
              {formatDistance(car.distance)}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Gauge className="size-3.5" />
            {car.year}
          </span>
          <span className="inline-flex items-center gap-1 capitalize">
            <Fuel className="size-3.5" />
            {car.fuelType || 'N/A'}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5" />
            {car.rating?.toFixed(1) || '0.0'}
          </span>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">
            {car.area ? `${car.area}, ` : ''}
            {car.location}
          </span>
        </p>
      </CardContent>

      <CardFooter>
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <UserRound className="size-3.5 shrink-0" />
          <span className="truncate">{ownerName}</span>
        </span>
      </CardFooter>
    </Card>
  );
};

export default CarCard;

import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { bookingAPI, exchangeAPI } from '@/utils/apiService';
import { carImageSrc, handleImageError } from '@/utils/carImage';
import { statusBadgeVariant } from '@/utils/status';
import { PageLoader, PageMessage } from '@/components/StateMessage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import {
  AlertCircleIcon,
  CheckCircle2,
  FileQuestion,
  Lock,
  Mail,
  Phone,
  Send,
  XCircle
} from 'lucide-react';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : '—';

const DetailRow = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-4 py-2.5">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-right text-sm font-medium">{value}</span>
  </div>
);

const BookingConfirmation = ({ kind = 'rent' }) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isExchange = kind === 'exchange';

  // Seed from the record the booking form just created so the page paints instantly,
  // then refetch to pick up the authoritative status.
  const [record, setRecord] = useState(location.state?.record || null);
  const [loading, setLoading] = useState(!location.state?.record);
  const [error, setError] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchRecord = useCallback(async () => {
    try {
      const response = isExchange
        ? await exchangeAPI.getExchangeById(id)
        : await bookingAPI.getBookingById(id);

      if (response.success && response.data) {
        setRecord(response.data);
        setError('');
      } else {
        setError(response.message || 'Could not load this request');
      }
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError(err.message || 'Could not load this request');
    } finally {
      setLoading(false);
    }
  }, [id, isExchange]);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    fetchRecord();
  }, [fetchRecord, navigate]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const response = isExchange
        ? await exchangeAPI.cancelExchange(id, cancelReason)
        : await bookingAPI.cancelBooking(id, cancelReason);

      if (response.success) {
        setShowCancel(false);
        setCancelReason('');
        await fetchRecord();
      } else {
        setError(response.message || 'Failed to cancel');
      }
    } catch (err) {
      console.error('Error cancelling:', err);
      setError(err.message || 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <PageLoader label="Loading your booking…" />;
  }

  if (!record) {
    return (
      <PageMessage
        icon={FileQuestion}
        title="We couldn't find this request"
        description={error || 'It may have been removed, or you may not have access to it.'}
      >
        <Button asChild>
          <Link to="/dashboard">Go to dashboard</Link>
        </Button>
      </PageMessage>
    );
  }

  const car = isExchange ? record.requestedCar : record.car;
  const status = record.status || 'pending';
  const reference = `DS-${String(record._id || id).slice(-8).toUpperCase()}`;
  const canCancel = !['completed', 'cancelled', 'rejected'].includes(status);
  const isLive = ['confirmed', 'accepted', 'ongoing'].includes(status);
  const isNegative = status === 'cancelled' || status === 'rejected';
  const carLabel = `${car?.brand || ''} ${car?.model || ''}`.trim();
  const ownerName = record.owner?.fullName || 'Car owner';

  const headline = () => {
    if (status === 'cancelled') return 'This request was cancelled';
    if (status === 'rejected') return 'The owner declined this request';
    if (isLive) return isExchange ? 'Exchange confirmed' : 'Booking confirmed';
    if (status === 'completed') return isExchange ? 'Exchange completed' : 'Trip completed';
    return isExchange ? 'Exchange request sent' : 'Booking request sent';
  };

  const subline = () => {
    if (status === 'cancelled') return record.cancellationReason || 'No further action is needed.';
    if (status === 'rejected') return record.ownerResponse || 'Try another car or different dates.';
    if (isLive) return `${car?.brand || 'The car'} is reserved for your dates. Contact details are below.`;
    if (status === 'completed') return 'Thanks for using DriveShare. Leave a review to help other renters.';
    return `${record.owner?.fullName || 'The owner'} has been notified and will respond shortly.`;
  };

  const HeroIcon = isNegative ? XCircle : isLive ? CheckCircle2 : Send;

  const steps = [
    {
      title: 'Request sent',
      copy: `The owner received your ${isExchange ? 'exchange request' : 'booking request'}.`,
      state: status !== 'pending' ? 'done' : 'active'
    },
    {
      title: 'Owner responds',
      copy: "You'll see the updated status here and on your dashboard.",
      state: isLive || status === 'completed' ? 'done' : status === 'pending' ? 'active' : 'idle'
    },
    {
      title: isExchange ? 'Swap the cars' : 'Pick up the car',
      copy: `Meet at ${record.pickupLocation || record.exchangeLocation || car?.location || 'the agreed location'} on ${formatDate(record.startDate)}.`,
      state: status === 'completed' ? 'done' : isLive ? 'active' : 'idle'
    }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      {/* ---------- Hero ---------- */}
      <Card>
        <CardContent className="flex flex-col items-center py-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-muted">
            <HeroIcon className="size-6" />
          </span>

          <h1 className="font-heading mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            {headline()}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{subline()}</p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Badge variant={statusBadgeVariant(status)}>{status}</Badge>
            <span className="font-mono text-xs text-muted-foreground">Ref {reference}</span>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircleIcon />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}

      {/* ---------- Detail grid ---------- */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card className="[--card-spacing:--spacing(5)]">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              {isExchange ? 'Car you requested' : 'Your car'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex gap-4">
              <img
                src={carImageSrc(car)}
                alt={carLabel}
                onError={handleImageError(carLabel)}
                className="h-24 w-32 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <p className="font-medium">{carLabel || 'Car'}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {car?.year} • {car?.location}
                </p>
                {car?._id && (
                  <Button variant="link" size="sm" className="mt-1 h-auto px-0" asChild>
                    <Link to={`/cars/${car._id}`}>View listing</Link>
                  </Button>
                )}
              </div>
            </div>

            {isExchange && record.offeredCar && (
              <Item variant="muted">
                <ItemContent>
                  <ItemDescription>Car you offered</ItemDescription>
                  <ItemTitle>
                    {record.offeredCar.brand} {record.offeredCar.model} ({record.offeredCar.year})
                  </ItemTitle>
                </ItemContent>
              </Item>
            )}
          </CardContent>
        </Card>

        <Card className="[--card-spacing:--spacing(5)]">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              {isExchange ? 'Exchange details' : 'Trip details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            <DetailRow
              label={isExchange ? 'Exchange from' : 'Pick up'}
              value={formatDate(record.startDate)}
            />
            <Separator />
            <DetailRow
              label={isExchange ? 'Return by' : 'Drop off'}
              value={formatDate(record.endDate)}
            />
            <Separator />
            <DetailRow
              label="Duration"
              value={`${record.totalDays} ${record.totalDays === 1 ? 'day' : 'days'}`}
            />
            <Separator />
            <DetailRow
              label="Location"
              value={record.pickupLocation || record.exchangeLocation || car?.location || '—'}
            />
            <Separator />
            <DetailRow label="Requested on" value={formatDate(record.createdAt)} />

            {!isExchange && (
              <div className="mt-4 rounded-lg bg-muted/50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    ₹{record.pricePerDay} × {record.totalDays} days
                  </span>
                  <span>₹{record.totalPrice}</span>
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total payable</span>
                  <span className="font-heading text-xl font-semibold">₹{record.totalPrice}</span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Payment status: {record.paymentStatus || 'pending'} — pay the owner directly at
                  pickup.
                </p>
              </div>
            )}

            {record.message && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">Your message</p>
                <p className="mt-2 rounded-lg bg-muted/50 px-4 py-3 text-sm italic">
                  “{record.message}”
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="[--card-spacing:--spacing(5)]">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Owner</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Item className="px-0">
              <Avatar className="size-10">
                <AvatarImage src={record.owner?.avatar} alt={ownerName} />
                <AvatarFallback>{ownerName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <ItemContent>
                <ItemTitle>{ownerName}</ItemTitle>
                {record.owner?.rating != null && (
                  <ItemDescription>⭐ {record.owner.rating}</ItemDescription>
                )}
              </ItemContent>
            </Item>

            {isLive ? (
              <div className="flex flex-col gap-2">
                {record.owner?.phone && (
                  <Button variant="outline" className="justify-start" asChild>
                    <a href={`tel:${record.owner.phone}`}>
                      <Phone data-icon="inline-start" />
                      {record.owner.phone}
                    </a>
                  </Button>
                )}
                {record.owner?.email && (
                  <Button variant="outline" className="justify-start" asChild>
                    <a href={`mailto:${record.owner.email}`}>
                      <Mail data-icon="inline-start" />
                      {record.owner.email}
                    </a>
                  </Button>
                )}
              </div>
            ) : (
              <Alert>
                <Lock />
                <AlertTitle>
                  Contact details unlock once the owner accepts your request.
                </AlertTitle>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="[--card-spacing:--spacing(5)]">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">What happens next</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-5">
              {steps.map(({ title, copy, state }, index) => (
                <li key={title} className="flex gap-3.5">
                  <span
                    className={
                      state === 'done'
                        ? 'flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground'
                        : state === 'active'
                          ? 'flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-primary text-xs font-medium'
                          : 'flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground'
                    }
                  >
                    {state === 'done' ? <CheckCircle2 className="size-3.5" /> : index + 1}
                  </span>
                  <span className={state === 'idle' ? 'opacity-60' : undefined}>
                    <span className="block font-medium">{title}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{copy}</span>
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* ---------- Actions ---------- */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/dashboard" state={{ showTab: 'myBookings' }}>Go to dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/cars">Browse more cars</Link>
        </Button>
        {canCancel && !showCancel && (
          <Button variant="ghost" onClick={() => setShowCancel(true)}>
            Cancel request
          </Button>
        )}
      </div>

      {showCancel && (
        <Card className="mt-5 [--card-spacing:--spacing(5)]">
          <CardHeader>
            <CardTitle>Cancel this {isExchange ? 'exchange request' : 'booking'}?</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              The owner will be notified. This can&apos;t be undone.
            </p>

            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason (optional)"
              className="min-h-24"
            />

            <div className="flex flex-wrap gap-3">
              <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
                {cancelling && <Spinner data-icon="inline-start" />}
                {cancelling ? 'Cancelling…' : 'Yes, cancel it'}
              </Button>
              <Button variant="outline" onClick={() => setShowCancel(false)} disabled={cancelling}>
                Keep it
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BookingConfirmation;

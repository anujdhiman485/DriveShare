import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { carAPI, bookingAPI, exchangeAPI } from '@/utils/apiService';
import { statusBadgeVariant } from '@/utils/status';
import { EmptyState } from '@/components/StateMessage';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle
} from '@/components/ui/item';
import {
  ArrowRight,
  CalendarRange,
  CarFront,
  Check,
  CirclePlus,
  Inbox,
  LogOut,
  Repeat,
  RefreshCw,
  Search,
  X
} from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'myCars', label: 'My Cars' },
  { id: 'myBookings', label: 'My Bookings' },
  { id: 'receivedBookings', label: 'Received' },
  { id: 'exchanges', label: 'Exchanges' }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [myCars, setMyCars] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [receivedBookings, setReceivedBookings] = useState([]);
  const [exchangeRequests, setExchangeRequests] = useState([]);
  const [myExchanges, setMyExchanges] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    setRefreshing(true);
    try {
      const carsResponse = await carAPI.getMyCars();
      if (carsResponse.success) setMyCars(carsResponse.data || []);

      const myBookingsResponse = await bookingAPI.getMyBookings();
      if (myBookingsResponse.success) setMyBookings(myBookingsResponse.data || []);

      const receivedResponse = await bookingAPI.getReceivedBookings();
      if (receivedResponse.success) setReceivedBookings(receivedResponse.data || []);

      const exchangeResponse = await exchangeAPI.getReceivedExchangeRequests();
      if (exchangeResponse.success) setExchangeRequests(exchangeResponse.data || []);

      const myExchangeResponse = await exchangeAPI.getMyExchangeRequests();
      if (myExchangeResponse.success) setMyExchanges(myExchangeResponse.data || []);
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      toast.error('Could not load your dashboard', { description: error.message });
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchDashboardData();

    // Check if coming from AddCar with success and switch to My Cars tab
    if (location.state?.showTab) {
      setActiveTab(location.state.showTab);
      if (location.state.newCarAdded) {
        toast.success('Car added successfully', {
          description: 'You can see it below in My Cars.'
        });
      }
      // Clear state to prevent affecting future navigations
      window.history.replaceState({}, document.title);
    }
  }, [navigate, fetchDashboardData, location.state?.showTab, location.state?.newCarAdded]);

  useEffect(() => {
    gsap.fromTo(
      '[data-dash-reveal]',
      { y: 12, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.4, ease: 'power2.out' }
    );
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      await bookingAPI.updateBookingStatus(bookingId, 'confirmed');
      toast.success('Booking accepted');
      fetchDashboardData();
    } catch (error) {
      console.error('Error accepting booking:', error);
      toast.error('Failed to accept booking', { description: error.message });
    }
  };

  const handleRejectBooking = async (bookingId) => {
    try {
      await bookingAPI.updateBookingStatus(bookingId, 'cancelled');
      toast.success('Booking rejected');
      fetchDashboardData();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast.error('Failed to reject booking', { description: error.message });
    }
  };

  const handleExchangeStatus = async (exchangeId, status) => {
    try {
      await exchangeAPI.updateExchangeStatus(exchangeId, status);
      toast.success(`Exchange request ${status}`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating exchange:', error);
      toast.error('Failed to update exchange request', { description: error.message });
    }
  };

  const formatRange = (start, end) =>
    `${new Date(start).toLocaleDateString()} to ${new Date(end).toLocaleDateString()}`;

  const stats = [
    { icon: CarFront, value: myCars.length, label: 'My cars', tab: 'myCars' },
    { icon: CalendarRange, value: myBookings.length, label: 'My bookings', tab: 'myBookings' },
    { icon: Inbox, value: receivedBookings.length, label: 'Received requests', tab: 'receivedBookings' },
    { icon: Repeat, value: exchangeRequests.length, label: 'Exchange requests', tab: 'exchanges' }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <header data-dash-reveal className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            My dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your cars, bookings, and exchange requests.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={refreshing}>
            <RefreshCw data-icon="inline-start" className={refreshing ? 'animate-spin' : undefined} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut data-icon="inline-start" />
            Logout
          </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8" data-dash-reveal>
        <TabsList className="w-full justify-start overflow-x-auto">
          {tabs.map(({ id, label }) => (
            <TabsTrigger key={id} value={id}>{label}</TabsTrigger>
          ))}
        </TabsList>

        {/* ---------- Overview ---------- */}
        <TabsContent value="overview" className="mt-6 flex flex-col gap-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ icon: Icon, value, label, tab }) => (
              <Card key={label} className="relative">
                <CardHeader>
                  <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-4.5" />
                  </div>
                  <CardTitle className="font-heading text-3xl font-semibold">{value}</CardTitle>
                  <CardDescription>{label}</CardDescription>
                </CardHeader>
                {/* Overlay keeps the whole card clickable without nesting interactive elements. */}
                <button
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  aria-label={`View ${label}`}
                  className="absolute inset-0 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </Card>
            ))}
          </div>

          <section>
            <h2 className="font-heading text-xl font-semibold tracking-tight">Quick actions</h2>
            <ItemGroup className="mt-4 grid gap-4 sm:grid-cols-2">
              <Item variant="outline" asChild>
                <Link to="/add-car">
                  <ItemMedia variant="icon">
                    <CirclePlus />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Add a new car</ItemTitle>
                    <ItemDescription>List a car for rent or exchange</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </ItemActions>
                </Link>
              </Item>

              <Item variant="outline" asChild>
                <Link to="/cars">
                  <ItemMedia variant="icon">
                    <Search />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Browse cars</ItemTitle>
                    <ItemDescription>Find your next ride nearby</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </ItemActions>
                </Link>
              </Item>
            </ItemGroup>
          </section>
        </TabsContent>

        {/* ---------- My cars ---------- */}
        <TabsContent value="myCars" className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-xl font-semibold tracking-tight">My cars</h2>
            <Button size="sm" asChild>
              <Link to="/add-car">
                <CirclePlus data-icon="inline-start" />
                Add new car
              </Link>
            </Button>
          </div>

          <ItemGroup className="mt-5 gap-4">
            {myCars.length > 0 ? (
              myCars.map(car => (
                <Item key={car._id} variant="outline" className="flex-wrap">
                  <ItemContent>
                    <ItemTitle>{car.brand} {car.model}</ItemTitle>
                    <ItemDescription>
                      {car.year} • {car.location}{car.area ? `, ${car.area}` : ''}
                    </ItemDescription>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge variant={car.isAvailable ? 'success' : 'secondary'}>
                        {car.isAvailable ? 'Available' : 'Unavailable'}
                      </Badge>
                      <Badge variant="outline">
                        {car.availableFor === 'both' ? 'Rent & exchange' : car.availableFor}
                      </Badge>
                      <Badge variant="outline">
                        ⭐ {car.rating.toFixed(1)} ({car.totalRatings})
                      </Badge>
                    </div>
                  </ItemContent>

                  <ItemContent className="flex-none text-right">
                    <ItemTitle className="font-heading text-lg font-semibold">
                      ₹{car.pricePerDay}
                      <span className="text-xs font-normal text-muted-foreground">/day</span>
                    </ItemTitle>
                    <ItemDescription>{car.totalBookings || 0} total bookings</ItemDescription>
                  </ItemContent>

                  <ItemActions>
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </ItemActions>
                </Item>
              ))
            ) : (
              <EmptyState
                icon={CarFront}
                title="No cars listed yet"
                description="List your first car and start earning or arranging exchanges."
              >
                <Button asChild>
                  <Link to="/add-car">Add your first car</Link>
                </Button>
              </EmptyState>
            )}
          </ItemGroup>
        </TabsContent>

        {/* ---------- My bookings ---------- */}
        <TabsContent value="myBookings" className="mt-6 flex flex-col gap-10">
          <section>
            <h2 className="font-heading text-xl font-semibold tracking-tight">My bookings</h2>
            <ItemGroup className="mt-5 gap-4">
              {myBookings.length > 0 ? (
                myBookings.map(booking => (
                  <Item key={booking._id} variant="outline" asChild>
                    <Link to={`/booking/${booking._id}`}>
                      <ItemContent>
                        <ItemTitle>{booking.car?.brand} {booking.car?.model}</ItemTitle>
                        <ItemDescription>
                          {formatRange(booking.startDate, booking.endDate)} — ₹{booking.totalPrice}{' '}
                          ({booking.totalDays} days)
                        </ItemDescription>
                        <div className="mt-2">
                          <Badge variant={statusBadgeVariant(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                      </ItemContent>
                      <ItemActions>
                        <ArrowRight className="size-4 text-muted-foreground" />
                      </ItemActions>
                    </Link>
                  </Item>
                ))
              ) : (
                <EmptyState
                  icon={CalendarRange}
                  title="No bookings yet"
                  description="Once you book a car, it'll show up here."
                >
                  <Button asChild>
                    <Link to="/cars">Browse cars</Link>
                  </Button>
                </EmptyState>
              )}
            </ItemGroup>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              My exchange requests
            </h2>
            <ItemGroup className="mt-5 gap-4">
              {myExchanges.length > 0 ? (
                myExchanges.map(exchange => (
                  <Item key={exchange._id} variant="outline" asChild>
                    <Link to={`/exchange/${exchange._id}`}>
                      <ItemContent>
                        <ItemTitle>
                          {exchange.requestedCar?.brand} {exchange.requestedCar?.model}
                        </ItemTitle>
                        <ItemDescription>
                          You offered: {exchange.offeredCar?.brand} {exchange.offeredCar?.model} —{' '}
                          {formatRange(exchange.startDate, exchange.endDate)}
                        </ItemDescription>
                        <div className="mt-2">
                          <Badge variant={statusBadgeVariant(exchange.status)}>
                            {exchange.status}
                          </Badge>
                        </div>
                      </ItemContent>
                      <ItemActions>
                        <ArrowRight className="size-4 text-muted-foreground" />
                      </ItemActions>
                    </Link>
                  </Item>
                ))
              ) : (
                <EmptyState
                  icon={Repeat}
                  title="No exchange requests sent"
                  description="Find a car marked for exchange and offer a swap."
                >
                  <Button variant="outline" asChild>
                    <Link to="/cars">Browse cars</Link>
                  </Button>
                </EmptyState>
              )}
            </ItemGroup>
          </section>
        </TabsContent>

        {/* ---------- Received bookings ---------- */}
        <TabsContent value="receivedBookings" className="mt-6">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Received booking requests
          </h2>
          <ItemGroup className="mt-5 gap-4">
            {receivedBookings.length > 0 ? (
              receivedBookings.map(booking => (
                <Item key={booking._id} variant="outline" className="flex-wrap">
                  <ItemContent>
                    <ItemTitle>{booking.car?.brand} {booking.car?.model}</ItemTitle>
                    <ItemDescription className="flex flex-col gap-0.5">
                      <span>Renter: {booking.renter?.fullName} • {booking.renter?.phone}</span>
                      <span>{formatRange(booking.startDate, booking.endDate)}</span>
                      <span>₹{booking.totalPrice} ({booking.totalDays} days)</span>
                      {booking.message && <span className="italic">“{booking.message}”</span>}
                    </ItemDescription>
                    <div className="mt-2">
                      <Badge variant={statusBadgeVariant(booking.status)}>{booking.status}</Badge>
                    </div>
                  </ItemContent>

                  {booking.status === 'pending' && (
                    <ItemActions>
                      <Button size="sm" onClick={() => handleAcceptBooking(booking._id)}>
                        <Check data-icon="inline-start" />
                        Accept
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectBooking(booking._id)}
                      >
                        <X data-icon="inline-start" />
                        Reject
                      </Button>
                    </ItemActions>
                  )}
                </Item>
              ))
            ) : (
              <EmptyState
                icon={Inbox}
                title="No booking requests"
                description="Requests for your listed cars will appear here."
              />
            )}
          </ItemGroup>
        </TabsContent>

        {/* ---------- Exchange requests ---------- */}
        <TabsContent value="exchanges" className="mt-6">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Car exchange requests
          </h2>
          <ItemGroup className="mt-5 gap-4">
            {exchangeRequests.length > 0 ? (
              exchangeRequests.map(request => (
                <Item key={request._id} variant="outline" className="flex-wrap">
                  <ItemContent>
                    <ItemTitle>
                      Exchange request from {request.requester?.fullName || 'a user'}
                    </ItemTitle>
                    <ItemDescription className="flex flex-col gap-0.5">
                      <span>
                        Your car: {request.requestedCar?.brand} {request.requestedCar?.model}{' '}
                        ({request.requestedCar?.year})
                      </span>
                      <span>
                        Their car: {request.offeredCar?.brand} {request.offeredCar?.model}{' '}
                        ({request.offeredCar?.year})
                      </span>
                      <span>
                        {formatRange(request.startDate, request.endDate)} • {request.totalDays} days
                      </span>
                      {request.requester?.phone && <span>Phone: {request.requester.phone}</span>}
                      {request.message && <span className="italic">“{request.message}”</span>}
                    </ItemDescription>
                    <div className="mt-2">
                      <Badge variant={statusBadgeVariant(request.status)}>{request.status}</Badge>
                    </div>
                  </ItemContent>

                  {request.status === 'pending' && (
                    <ItemActions>
                      <Button size="sm" onClick={() => handleExchangeStatus(request._id, 'accepted')}>
                        <Check data-icon="inline-start" />
                        Accept
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleExchangeStatus(request._id, 'rejected')}
                      >
                        <X data-icon="inline-start" />
                        Reject
                      </Button>
                    </ItemActions>
                  )}
                </Item>
              ))
            ) : (
              <EmptyState
                icon={Repeat}
                title="No exchange requests"
                description="Swap offers for your cars will show up here."
              />
            )}
          </ItemGroup>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

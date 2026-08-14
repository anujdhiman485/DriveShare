import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { bookingAPI, exchangeAPI } from '../utils/apiService';
import './BookingConfirmation.css';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : '—';

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
    return <div className="loading">Loading your booking...</div>;
  }

  if (!record) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-card empty">
          <h2>We couldn&apos;t find this request</h2>
          <p>{error || 'It may have been removed, or you may not have access to it.'}</p>
          <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  const car = isExchange ? record.requestedCar : record.car;
  const status = record.status || 'pending';
  const reference = `DS-${String(record._id || id).slice(-8).toUpperCase()}`;
  const canCancel = !['completed', 'cancelled', 'rejected'].includes(status);
  const isLive = ['confirmed', 'accepted', 'ongoing'].includes(status);

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

  return (
    <div className="confirmation-page">
      <div className={`confirmation-hero status-${status}`}>
        <span className="hero-icon">
          {status === 'cancelled' || status === 'rejected' ? '⚠️' : isLive ? '✅' : '📩'}
        </span>
        <h1>{headline()}</h1>
        <p>{subline()}</p>
        <div className="hero-meta">
          <span className={`status-pill ${status}`}>{status}</span>
          <span className="reference">Reference {reference}</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="confirmation-grid">
        <div className="confirmation-card">
          <h2>{isExchange ? 'Car you requested' : 'Your car'}</h2>
          <div className="confirmation-car">
            <img
              src={car?.images?.[0] || 'https://via.placeholder.com/300x200?text=Car+Image'}
              alt={`${car?.brand || ''} ${car?.model || ''}`}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x200?text=Car+Image';
              }}
            />
            <div>
              <h3>{car?.brand} {car?.model}</h3>
              <p>{car?.year} • {car?.location}</p>
              {car?._id && <Link to={`/cars/${car._id}`} className="inline-link">View listing</Link>}
            </div>
          </div>

          {isExchange && record.offeredCar && (
            <div className="exchange-offer">
              <h3>Car you offered</h3>
              <p>
                {record.offeredCar.brand} {record.offeredCar.model} ({record.offeredCar.year})
              </p>
            </div>
          )}
        </div>

        <div className="confirmation-card">
          <h2>{isExchange ? 'Exchange details' : 'Trip details'}</h2>
          <div className="detail-row">
            <span>{isExchange ? 'Exchange from' : 'Pick up'}</span>
            <strong>{formatDate(record.startDate)}</strong>
          </div>
          <div className="detail-row">
            <span>{isExchange ? 'Return by' : 'Drop off'}</span>
            <strong>{formatDate(record.endDate)}</strong>
          </div>
          <div className="detail-row">
            <span>Duration</span>
            <strong>{record.totalDays} {record.totalDays === 1 ? 'day' : 'days'}</strong>
          </div>
          <div className="detail-row">
            <span>Location</span>
            <strong>{record.pickupLocation || record.exchangeLocation || car?.location || '—'}</strong>
          </div>
          <div className="detail-row">
            <span>Requested on</span>
            <strong>{formatDate(record.createdAt)}</strong>
          </div>

          {!isExchange && (
            <div className="price-summary">
              <div className="detail-row">
                <span>₹{record.pricePerDay} × {record.totalDays} days</span>
                <strong>₹{record.totalPrice}</strong>
              </div>
              <div className="detail-row total">
                <span>Total payable</span>
                <strong>₹{record.totalPrice}</strong>
              </div>
              <p className="payment-note">
                Payment status: <strong>{record.paymentStatus || 'pending'}</strong> — pay the owner
                directly at pickup.
              </p>
            </div>
          )}

          {record.message && (
            <div className="your-message">
              <span>Your message</span>
              <p>{record.message}</p>
            </div>
          )}
        </div>

        <div className="confirmation-card">
          <h2>Owner</h2>
          <div className="owner-block">
            <div className="owner-avatar">
              {record.owner?.avatar ? (
                <img src={record.owner.avatar} alt={record.owner.fullName} />
              ) : (
                '👤'
              )}
            </div>
            <div>
              <p className="owner-name">{record.owner?.fullName || 'Car Owner'}</p>
              {record.owner?.rating != null && <p className="owner-rating">⭐ {record.owner.rating}</p>}
            </div>
          </div>
          {isLive ? (
            <div className="contact-details">
              {record.owner?.phone && <p>📞 {record.owner.phone}</p>}
              {record.owner?.email && <p>✉️ {record.owner.email}</p>}
            </div>
          ) : (
            <p className="contact-locked">
              Contact details unlock once the owner accepts your request.
            </p>
          )}
        </div>

        <div className="confirmation-card">
          <h2>What happens next</h2>
          <ol className="next-steps">
            <li className={status !== 'pending' ? 'done' : 'active'}>
              <strong>Request sent</strong>
              <span>The owner received your {isExchange ? 'exchange request' : 'booking request'}.</span>
            </li>
            <li className={isLive || status === 'completed' ? 'done' : status === 'pending' ? 'active' : ''}>
              <strong>Owner responds</strong>
              <span>You&apos;ll see the updated status here and on your dashboard.</span>
            </li>
            <li className={status === 'completed' ? 'done' : isLive ? 'active' : ''}>
              <strong>{isExchange ? 'Swap the cars' : 'Pick up the car'}</strong>
              <span>
                Meet at {record.pickupLocation || record.exchangeLocation || car?.location || 'the agreed location'} on{' '}
                {formatDate(record.startDate)}.
              </span>
            </li>
          </ol>
        </div>
      </div>

      <div className="confirmation-actions">
        <Link
          to="/dashboard"
          state={{ showTab: 'myBookings' }}
          className="btn btn-primary"
        >
          Go to Dashboard
        </Link>
        <Link to="/cars" className="btn btn-secondary">Browse more cars</Link>
        {canCancel && !showCancel && (
          <button className="btn btn-danger" onClick={() => setShowCancel(true)}>
            Cancel request
          </button>
        )}
      </div>

      {showCancel && (
        <div className="cancel-panel">
          <h3>Cancel this {isExchange ? 'exchange request' : 'booking'}?</h3>
          <p>The owner will be notified. This can&apos;t be undone.</p>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Reason (optional)"
          />
          <div className="cancel-actions">
            <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'Cancelling...' : 'Yes, cancel it'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowCancel(false)}
              disabled={cancelling}
            >
              Keep it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingConfirmation;

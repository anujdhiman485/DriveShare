# 🚗 DriveShare - Complete MERN Stack Car Rental & Exchange Platform

A full-stack web application for renting and exchanging cars with location-based search capabilities.

## 🎯 Project Overview

DriveShare is a modern car rental and exchange platform built with the MERN stack (MongoDB, Express, React, Node.js). Users can list their cars for rent or exchange, browse available cars nearby using geolocation, book cars, request exchanges, and leave reviews.

## ✨ Key Features

### 🔐 Authentication & User Management
- Secure user registration and login with JWT
- Password hashing with bcrypt
- Access & refresh token mechanism
- Protected routes and middleware
- User profile management

### 🚗 Car Management
- Create, read, update, delete car listings
- Upload car details with images support (ready)
- Set availability for rent, exchange, or both
- Toggle car availability status
- View own car listings
- Automatic rating calculations

### 📍 Location-Based Search
- Real-time geolocation detection
- Manual city selection (50+ Indian cities)
- Distance-based filtering (5-200km radius)
- MongoDB geospatial queries ($near)
- Show distance to each car
- Sort by distance, price, or rating

### 📅 Booking System
- Book cars for specific dates
- Automatic price calculation
- Prevent overlapping bookings
- Status tracking (pending → confirmed → ongoing → completed)
- View sent and received bookings
- Cancel bookings with reason

### 🔄 Car Exchange
- Request car exchanges
- Offer your car for another user's car
- Accept/reject exchange requests
- Track exchange status
- View exchange history

### ⭐ Review System
- Rate cars (1-5 stars)
- Write detailed reviews
- Link reviews to bookings
- Automatic rating updates
- View car reviews

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling with gradients and animations
- **Geolocation API** - Browser location detection

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Cookie Parser** - Cookie handling
- **Nodemon** - Development auto-reload

## 📁 Project Structure

```
DriveShare/
├── Client/                      # Frontend React Application
│   ├── src/
│   │   ├── pages/              # Route pages
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── CarListing.jsx
│   │   │   ├── CarDetails.jsx
│   │   │   ├── BookingPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── AddCar.jsx
│   │   ├── components/         # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   └── CarCard.jsx
│   │   ├── utils/              # Utilities
│   │   │   ├── api.js          # Axios instance
│   │   │   ├── apiService.js   # API endpoints
│   │   │   └── locationUtils.js # Location calculations
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── Server/                      # Backend Express Application
│   ├── src/
│   │   ├── models/             # Mongoose models
│   │   │   ├── user.model.js
│   │   │   ├── car.model.js
│   │   │   ├── booking.model.js
│   │   │   ├── exchange.model.js
│   │   │   └── review.model.js
│   │   ├── controllers/        # Route controllers
│   │   │   ├── auth.controller.js
│   │   │   ├── car.controller.js
│   │   │   ├── booking.controller.js
│   │   │   ├── exchange.controller.js
│   │   │   └── review.controller.js
│   │   ├── routes/             # API routes
│   │   │   ├── auth.routes.js
│   │   │   ├── car.routes.js
│   │   │   ├── booking.routes.js
│   │   │   ├── exchange.routes.js
│   │   │   └── review.routes.js
│   │   ├── middlewares/        # Custom middleware
│   │   │   └── auth.middleware.js
│   │   ├── utils/              # Utilities
│   │   │   ├── ApiError.js
│   │   │   ├── ApiResponse.js
│   │   │   ├── asyncHandler.js
│   │   │   └── cloudinary.js
│   │   ├── db/
│   │   │   └── index.js        # MongoDB connection
│   │   ├── app.js              # Express app config
│   │   ├── server.js           # Entry point
│   │   └── constants.js
│   ├── .env
│   └── package.json
│
├── BACKEND_GUIDE.md            # Backend documentation
├── API_TESTING.md              # API testing guide
├── LOCATION_FEATURES.md        # Location features docs
├── PROJECT_OVERVIEW.md         # Project overview
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/driveshare.git
cd driveshare
```

#### 2. Setup Backend
```bash
cd Server
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# PORT=8000
# MONGODB_URI=mongodb://localhost:27017
# CORS_ORIGIN=http://localhost:5173
# ACCESS_TOKEN_SECRET=your-secret-key
# REFRESH_TOKEN_SECRET=your-refresh-secret
```

#### 3. Setup Frontend
```bash
cd ../Client
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env
```

#### 4. Start MongoDB
```bash
# Local MongoDB
mongod

# OR use MongoDB Atlas
# Update MONGODB_URI in Server/.env with your Atlas connection string
```

#### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd Server
npm run dev
```
✅ Backend running at: http://localhost:8000

**Terminal 2 - Frontend:**
```bash
cd Client
npm run dev
```
✅ Frontend running at: http://localhost:5173

## 📱 Using the Application

### 1. Register Account
- Go to http://localhost:5173
- Click "Register"
- Fill in your details
- Submit the form

### 2. Login
- Use your registered credentials
- You'll receive an access token
- Automatically redirected to dashboard

### 3. List Your Car
- Click "List Car" in navigation
- Fill in car details
- Select your city (coordinates auto-assigned)
- Enter area/locality
- Submit the form

### 4. Browse Cars
- Click "Browse Cars"
- Allow location access (or select city)
- Adjust distance slider (5-200km)
- Use filters (type, availability)
- Search by brand/model/area
- Sort by distance/price/rating

### 5. Book a Car
- Click on any car card
- View car details
- Click "Book Now"
- Select dates
- Add message to owner
- Submit booking request

### 6. Manage Bookings
- Go to Dashboard
- View "My Bookings" tab
- See all your booking requests
- Track booking status

### 7. Exchange Cars
- Find a car you like
- Click "Request Exchange"
- Select your car to offer
- Choose dates
- Submit exchange request

## 🌐 API Endpoints

### Base URL: `http://localhost:8000/api/v1`

### Authentication
```
POST   /auth/register        # Register new user
POST   /auth/login           # Login user
POST   /auth/logout          # Logout user
POST   /auth/refresh-token   # Refresh access token
GET    /auth/current-user    # Get current user
PATCH  /auth/update-profile  # Update profile
```

### Cars
```
GET    /cars                 # Get all cars (with filters)
GET    /cars/:id             # Get car by ID
POST   /cars/create          # Create car (Protected)
GET    /cars/my-cars         # Get user's cars (Protected)
PATCH  /cars/:id/update      # Update car (Protected)
DELETE /cars/:id/delete      # Delete car (Protected)
PATCH  /cars/:id/toggle-availability  # Toggle availability (Protected)
```

### Bookings (All Protected)
```
POST   /bookings/create      # Create booking
GET    /bookings/my-bookings # Get user's bookings
GET    /bookings/received    # Get received bookings
GET    /bookings/:id         # Get booking details
PATCH  /bookings/:id/status  # Update booking status
PATCH  /bookings/:id/cancel  # Cancel booking
```

### Exchanges (All Protected)
```
POST   /exchanges/create     # Create exchange request
GET    /exchanges/my-requests # Get user's exchanges
GET    /exchanges/received   # Get received exchanges
GET    /exchanges/:id        # Get exchange details
PATCH  /exchanges/:id/status # Update exchange status
PATCH  /exchanges/:id/cancel # Cancel exchange
```

### Reviews
```
POST   /reviews/create       # Create review (Protected)
GET    /reviews/car/:carId   # Get car reviews
GET    /reviews/my-reviews   # Get user's reviews (Protected)
DELETE /reviews/:id/delete   # Delete review (Protected)
```

## 🔍 Location-Based Search

### How It Works

1. **User Location Detection**
   - Browser asks for location permission
   - If granted: Use GPS coordinates
   - If denied: Fallback to city selection

2. **Distance Calculation**
   - Uses Haversine formula
   - Accurate for Earth's curvature
   - Client-side for instant filtering

3. **Backend Geospatial Query**
   ```javascript
   // MongoDB $near query
   Car.find({
     coordinates: {
       $near: {
         $geometry: {
           type: "Point",
           coordinates: [longitude, latitude]
         },
         $maxDistance: 50000  // 50km in meters
       }
     }
   })
   ```

4. **Frontend Display**
   - Shows distance on each car card
   - "3.2km away" badge
   - Sort by nearest first
   - Adjust search radius with slider

## 🔒 Security

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT access tokens (1 day expiry)
- ✅ JWT refresh tokens (10 days expiry)
- ✅ httpOnly cookies for tokens
- ✅ CORS protection
- ✅ Protected routes with middleware
- ✅ Owner-only operations validation
- ✅ Input validation and sanitization

## 🧪 Testing

### Test the API
See [API_TESTING.md](API_TESTING.md) for detailed testing guide.

Quick test:
```bash
# Health check
curl http://localhost:8000/api/v1/health

# Register user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","username":"testuser","email":"test@example.com","password":"test123","phone":"9876543210"}'
```

### Test the Frontend
1. Open http://localhost:5173
2. Register a new account
3. Login
4. Create a car listing
5. Browse cars
6. Test location features
7. Create a booking

## 📊 Database Schema

### User
- Authentication (email, username, password)
- Profile (fullName, phone, avatar)
- Location (city, coordinates)
- Rating system
- Timestamps

### Car
- Details (brand, model, year, type)
- Pricing (pricePerDay)
- Location (city, area, coordinates)
- Geospatial index (2dsphere)
- Availability (isAvailable, availableFor)
- Owner reference
- Rating and booking count

### Booking
- Car and user references
- Date range (startDate, endDate)
- Pricing (totalDays, totalPrice)
- Status (pending/confirmed/ongoing/completed/cancelled)
- Payment status
- Locations (pickup, drop)

### Exchange
- Car references (requested, offered)
- User references (requester, owner)
- Date range
- Status workflow
- Exchange location

### Review
- Car and reviewer references
- Rating (1-5)
- Comment
- Optional booking link
- Timestamps

## 🎨 Features in Detail

### Dashboard Tabs
1. **Overview** - Statistics and summary
2. **My Cars** - User's car listings
3. **My Bookings** - Booking requests sent
4. **Received Requests** - Bookings received
5. **Exchange Requests** - Exchange tracking

### Car Filters
- Availability: Rent / Exchange / Both
- Type: Sedan / SUV / Hatchback / Luxury / Sports / Electric
- Transmission: Manual / Automatic
- Fuel: Petrol / Diesel / Electric / Hybrid
- Price Range: Custom slider
- Distance: 5-200km radius

### Sorting Options
- Nearest First
- Price: Low to High
- Price: High to Low
- Highest Rated
- Newest First

## 🚧 Future Enhancements

### Phase 1 (Next)
- [ ] Image upload with Cloudinary
- [ ] Email notifications (nodemailer)
- [ ] SMS notifications (Twilio)
- [ ] Password reset functionality
- [ ] Email verification

### Phase 2
- [ ] Payment gateway (Razorpay/Stripe)
- [ ] Real-time chat (Socket.io)
- [ ] Map integration (Google Maps)
- [ ] Advanced search filters
- [ ] Car comparison feature

### Phase 3
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] Mobile app (React Native)
- [ ] AI-powered recommendations
- [ ] Insurance verification

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service
# Windows: net start MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Port Already in Use
```bash
# Change port in .env files
# Server: PORT=8001
# Client: VITE_PORT=5174
```

### CORS Error
- Ensure CORS_ORIGIN in Server/.env matches frontend URL
- Default: `CORS_ORIGIN=http://localhost:5173`

### Token Issues
- Clear browser localStorage
- Register new user
- Ensure "Bearer " prefix in Authorization header

## 📖 Documentation

- [BACKEND_GUIDE.md](BACKEND_GUIDE.md) - Complete backend documentation
- [API_TESTING.md](API_TESTING.md) - API testing guide with examples
- [LOCATION_FEATURES.md](LOCATION_FEATURES.md) - Location features explained
- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Frontend overview

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👤 Author

**Anuj**
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- React team for the amazing library
- MongoDB for the powerful database
- Express team for the web framework
- All open-source contributors

## 📞 Support

For support, email your-email@example.com or open an issue on GitHub.

---

## 🎊 Project Status

### Current Version: 1.0.0

✅ **Backend**: Fully functional with 20+ API endpoints
✅ **Frontend**: Complete with location features
✅ **Database**: MongoDB with geospatial indexing
✅ **Authentication**: JWT-based secure auth
✅ **Location Search**: Real-time nearby car discovery
✅ **Booking System**: Complete workflow
✅ **Exchange System**: Car-to-car exchange
✅ **Review System**: Ratings and feedback

### Servers Running:
- 🟢 Backend: http://localhost:8000
- 🟢 Frontend: http://localhost:5173
- 🟢 Database: MongoDB (DriveShareDB)

---

**Built with ❤️ using the MERN Stack**


# DriveShare - Car Rental & Exchange Platform

## Project Overview

DriveShare is a peer-to-peer car rental and exchange platform that connects car owners with renters and allows car enthusiasts to exchange vehicles. Built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Core Features

### 1. Car Rental System
- **Car Owners** can list their cars and earn money when not in use
- **Renters** can browse and book cars for specific dates
- Flexible pricing set by owners
- Booking management system

### 2. Car Exchange System
- Car enthusiasts can exchange their vehicles with others
- Temporary swaps for experiencing different cars
- Exchange request management
- Dual availability (cars can be listed for both rent and exchange)

### 3. User Dashboard
- Overview of all activities
- Manage listed cars
- Track bookings (made and received)
- Handle exchange requests
- Statistics and earnings

## Frontend Architecture

### Technology Stack
- **React 18** - Modern UI library
- **React Router v6** - Client-side routing
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling with responsive design

### Pages Structure

#### Public Pages:
1. **Home (/)** - Landing page with hero section, features, how it works
2. **Car Listing (/cars)** - Browse all available cars with filters
3. **Car Details (/cars/:id)** - Detailed car information
4. **Login (/login)** - User authentication
5. **Register (/register)** - New user registration

#### Protected Pages (Require Authentication):
1. **Dashboard (/dashboard)** - User dashboard with tabs:
   - Overview - Statistics and quick actions
   - My Cars - Manage your listed cars
   - My Bookings - Bookings you've made
   - Received Requests - Incoming booking requests
   - Exchange Requests - Car exchange management

2. **Add Car (/add-car)** - List a new car with:
   - Basic info (brand, model, year)
   - Specifications (fuel, transmission, seating)
   - Location and pricing
   - Availability type (rent/exchange/both)
   - Description and features
   - Image upload

3. **Booking Page (/book/:id)** - Complete booking or exchange:
   - Date selection
   - Price calculation (for rentals)
   - Car selection (for exchanges)
   - Message to owner

### Components

1. **Navbar** - Responsive navigation with authentication state
2. **CarCard** - Reusable card component for displaying cars
3. More components can be added as needed

### Design Features

- **Gradient Theme**: Purple gradient (667eea to 764ba2)
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean cards, smooth transitions, hover effects
- **Intuitive Navigation**: Clear CTAs and user flows

## Getting Started with Frontend

### Prerequisites
```bash
Node.js v16+
npm or yarn
```

### Installation & Setup

1. **Navigate to Client directory:**
```bash
cd Client
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
# Copy the example file
cp .env.example .env

# Edit .env and set:
VITE_API_URL=http://localhost:5000/api
```

4. **Start development server:**
```bash
npm run dev
```

5. **Access the application:**
```
http://localhost:5173
```

### Available Scripts
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

### API Service Structure
Located in `src/utils/`:
- **api.js** - Axios instance with interceptors
- **apiService.js** - Organized API endpoints:
  - authAPI - Authentication
  - carAPI - Car management
  - bookingAPI - Booking operations
  - exchangeAPI - Exchange requests
  - userAPI - User profile
  - reviewAPI - Reviews and ratings

### Authentication Flow
1. User registers/logs in
2. JWT token stored in localStorage
3. Token added to all API requests via interceptor
4. Automatic logout on token expiration

## Current Status

### ✅ Completed (Frontend)
- [x] Project setup with Vite + React
- [x] React Router configuration
- [x] All main pages created:
  - Home/Landing page
  - Login & Register
  - Car Listing with filters
  - Car Details
  - Booking/Exchange page
  - User Dashboard
  - Add Car form
- [x] Responsive Navbar
- [x] CarCard component
- [x] API service structure
- [x] Authentication UI flows
- [x] Responsive design for all pages

### 🔄 Using Dummy Data (Needs Backend)
- User authentication
- Car listings
- Booking management
- Exchange requests
- User dashboard data
- Image uploads

## Next Steps

### Backend Development (Server/)
1. **Setup Express Server**
   - Initialize Express app
   - Configure middleware (cors, body-parser)
   - Error handling
   - Request logging

2. **Database Setup (MongoDB)**
   - User model (auth, profile)
   - Car model (listings)
   - Booking model
   - Exchange model
   - Review model

3. **Authentication**
   - JWT token generation
   - Password hashing (bcrypt)
   - Auth middleware
   - Protected routes

4. **API Endpoints**
   - Auth: /api/auth (register, login, logout)
   - Cars: /api/cars (CRUD operations)
   - Bookings: /api/bookings
   - Exchanges: /api/exchanges
   - Users: /api/users
   - Reviews: /api/reviews

5. **Additional Features**
   - Image upload (Cloudinary integration)
   - Email notifications
   - Payment integration
   - Search and filtering
   - Availability calendar

6. **Security & Validation**
   - Input validation
   - Rate limiting
   - SQL injection prevention
   - XSS protection

## File Structure

```
DriveShare/
├── Client/                    # Frontend (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Navbar.css
│   │   │   ├── CarCard.jsx
│   │   │   └── CarCard.css
│   │   ├── pages/
│   │   │   ├── Home.jsx/css
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Auth.css
│   │   │   ├── CarListing.jsx/css
│   │   │   ├── CarDetails.jsx/css
│   │   │   ├── BookingPage.jsx/css
│   │   │   ├── Dashboard.jsx/css
│   │   │   └── AddCar.jsx/css
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── apiService.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── FRONTEND_README.md
│
└── Server/                    # Backend (Node.js + Express)
    ├── src/
    │   ├── controllers/       # Route controllers
    │   ├── models/           # Database models
    │   ├── routes/           # API routes
    │   ├── middleware/       # Custom middleware
    │   ├── utils/           # Utilities
    │   ├── db/              # Database config
    │   ├── app.js           # Express app
    │   └── server.js        # Server entry point
    └── package.json

```

## Development Workflow

### Current: Frontend Development ✅
- All pages and components created
- Routing configured
- UI/UX complete with responsive design
- API service structure ready

### Next: Backend Development
1. Set up Express server
2. Connect MongoDB
3. Create database models
4. Implement authentication
5. Build API endpoints
6. Connect frontend to backend
7. Test end-to-end functionality

### Future: Enhancement Features
- Real-time chat between users
- Advanced search with maps
- Calendar availability
- Payment gateway integration
- Mobile app (React Native)
- Rating and review system
- Insurance integration
- Admin panel

## How to Use the Platform (Once Complete)

### As a Car Owner:
1. Register/Login
2. Go to "List Car" in dashboard
3. Fill in car details, set price, upload photos
4. Choose availability (rent/exchange/both)
5. Receive and manage booking/exchange requests
6. Accept/reject requests
7. Track earnings

### As a Renter:
1. Register/Login
2. Browse available cars
3. Filter by location, price, type
4. View car details
5. Select dates and book
6. Wait for owner approval
7. Pick up car and enjoy!

### As a Car Enthusiast (Exchange):
1. List your car for exchange
2. Browse other cars available for exchange
3. Send exchange request
4. Both parties agree on terms
5. Swap cars for agreed duration

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env) - To be created
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/driveshare
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Testing

### Frontend Testing (To be added)
- Unit tests with Vitest
- Component tests with React Testing Library
- E2E tests with Playwright

### Backend Testing (To be added)
- API tests with Jest/Supertest
- Database tests
- Integration tests

## Deployment

### Frontend
- Build: `npm run build`
- Deploy to: Vercel, Netlify, or AWS S3

### Backend
- Deploy to: Heroku, Railway, AWS EC2, or DigitalOcean
- Database: MongoDB Atlas

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

MIT License

## Contact & Support

For questions or support, please open an issue on GitHub.

---

**Status**: Frontend Development Complete ✅ | Backend Development Pending ⏳

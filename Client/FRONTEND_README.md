# DriveShare - Frontend

A modern car rental and exchange platform built with React and Vite.

## Features

### For Car Owners:
- List your car for rent or exchange
- Manage bookings and exchange requests
- Set your own pricing
- View earnings and statistics

### For Renters:
- Browse available cars
- Book cars for specific dates
- Request car exchanges with other enthusiasts
- View car details, reviews, and ratings

### Key Features:
- **Dual Mode**: Rent cars OR exchange cars with fellow enthusiasts
- **User Dashboard**: Manage your cars, bookings, and requests
- **Real-time Updates**: Track booking status and exchange requests
- **Secure Authentication**: JWT-based authentication
- **Responsive Design**: Works on all devices

## Tech Stack

- **React 18** - UI Framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
Client/
├── src/
│   ├── assets/          # Static assets
│   ├── components/      # Reusable components
│   │   ├── Navbar.jsx
│   │   └── CarCard.jsx
│   ├── pages/          # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── CarListing.jsx
│   │   ├── CarDetails.jsx
│   │   ├── BookingPage.jsx
│   │   ├── Dashboard.jsx
│   │   └── AddCar.jsx
│   ├── utils/          # Utilities and API services
│   │   ├── api.js
│   │   └── apiService.js
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── public/             # Public assets
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Pages Overview

### Public Pages:
- **Home** - Landing page with features and how it works
- **Car Listing** - Browse all available cars
- **Car Details** - View detailed information about a car
- **Login/Register** - Authentication pages

### Protected Pages (Require Login):
- **Dashboard** - User dashboard with overview and stats
- **Add Car** - List a new car
- **Booking Page** - Complete booking or exchange request
- **My Cars** - Manage your listed cars
- **My Bookings** - View your booking history
- **Received Requests** - Manage incoming booking/exchange requests

## Features to Implement (Backend Required)

The following features are currently using dummy data and need backend integration:

- [ ] User authentication (register, login, logout)
- [ ] Fetch real car data from API
- [ ] Create and manage car listings
- [ ] Handle booking requests
- [ ] Process exchange requests
- [ ] Upload car images to cloud storage
- [ ] User profile management
- [ ] Reviews and ratings system
- [ ] Payment integration
- [ ] Notifications

## API Integration

All API calls are centralized in `src/utils/apiService.js`. Update these functions to match your backend API endpoints.

Example usage:
```javascript
import { carAPI } from './utils/apiService';

// Get all cars
const cars = await carAPI.getAllCars({ availableFor: 'rent' });

// Get car by ID
const car = await carAPI.getCarById(carId);
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

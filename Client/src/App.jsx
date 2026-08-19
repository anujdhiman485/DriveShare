import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import CarListing from '@/pages/CarListing';
import CarDetails from '@/pages/CarDetails';
import BookingPage from '@/pages/BookingPage';
import BookingConfirmation from '@/pages/BookingConfirmation';
import Dashboard from '@/pages/Dashboard';
import AddCar from '@/pages/AddCar';

const AnimatedRoutes = () => {
  const location = useLocation();
  const routeRef = useRef(null);

  useLayoutEffect(() => {
    if (!routeRef.current) return;

    gsap.fromTo(
      routeRef.current,
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );
  }, [location.pathname]);

  return (
    <main ref={routeRef} className="flex-1">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cars" element={<CarListing />} />
        <Route path="/cars/:id" element={<CarDetails />} />
        <Route path="/book/:id" element={<BookingPage />} />
        <Route path="/booking/:id" element={<BookingConfirmation kind="rent" />} />
        <Route path="/exchange/:id" element={<BookingConfirmation kind="exchange" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-car" element={<AddCar />} />
      </Routes>
    </main>
  );
};

function App() {
  return (
    <Router>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <AnimatedRoutes />
        <Footer />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;

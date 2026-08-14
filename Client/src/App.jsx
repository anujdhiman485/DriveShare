import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CarListing from './pages/CarListing';
import CarDetails from './pages/CarDetails';
import BookingPage from './pages/BookingPage';
import Dashboard from './pages/Dashboard';
import AddCar from './pages/AddCar';
import './App.css';

const AnimatedRoutes = () => {
  const location = useLocation();
  const routeRef = useRef(null);

  useLayoutEffect(() => {
    if (!routeRef.current) return;

    gsap.fromTo(
      routeRef.current,
      { autoAlpha: 0, y: 18, filter: 'blur(8px)' },
      {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.55,
        ease: 'power3.out'
      }
    );
  }, [location.pathname]);

  return (
    <main ref={routeRef} className="route-shell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cars" element={<CarListing />} />
        <Route path="/cars/:id" element={<CarDetails />} />
        <Route path="/book/:id" element={<BookingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-car" element={<AddCar />} />
      </Routes>
    </main>
  );
};

function App() {
  return (
    <Router>
      <div className="app">
        <div className="app-atmosphere" aria-hidden="true" />
        <Navbar />
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;

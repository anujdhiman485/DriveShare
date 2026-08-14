import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Menu, X, CarFront, LayoutDashboard, CirclePlus, LogIn, UserPlus } from 'lucide-react';
import gsap from 'gsap';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  // Check authentication status
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    // Check on mount
    checkAuth();

    // Check on route change
    checkAuth();
  }, [location]);

  useLayoutEffect(() => {
    if (!navRef.current) return;

    gsap.fromTo(
      navRef.current,
      { y: -20, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.55, ease: 'power2.out' }
    );
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen || !navRef.current) return;

    const items = navRef.current.querySelectorAll('.nav-menu .nav-link, .nav-menu .nav-btn');
    gsap.fromTo(
      items,
      { y: -8, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.24, ease: 'power2.out' }
    );
  }, [mobileMenuOpen]);

  useEffect(() => {
    // Listen for storage changes (e.g., login/logout in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab updates
    window.addEventListener('authChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav ref={navRef} className="navbar">
      <div className="nav-container">
        <NavLink to="/" className="nav-logo" onClick={() => setMobileMenuOpen(false)}>
          <span className="logo-icon"><CarFront size={20} /></span>
          <span>DriveShare</span>
        </NavLink>

        <button 
          className="mobile-menu-btn"
          aria-label="Toggle mobile menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>

        <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/cars" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
            Browse Cars
          </NavLink>

          {isLoggedIn ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link nav-link-icon ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                <LayoutDashboard size={15} />
                Dashboard
              </NavLink>
              <NavLink to="/add-car" className={({ isActive }) => `nav-link nav-link-icon ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                <CirclePlus size={15} />
                List Car
              </NavLink>
              <button onClick={handleLogout} className="nav-btn btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `nav-link nav-link-icon ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                <LogIn size={15} />
                Login
              </NavLink>
              <NavLink 
                to="/register" 
                className="nav-btn btn-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserPlus size={15} />
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

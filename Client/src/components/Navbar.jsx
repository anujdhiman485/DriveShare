import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useSyncExternalStore } from 'react';
import { Menu, X, CarFront, LayoutDashboard, CirclePlus, LogIn, UserPlus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import ThemeToggle from './ThemeToggle';

/* Auth lives in localStorage — an external store. `authChange` covers same-tab
   writes, `storage` covers login/logout in another tab. */
const subscribeToAuth = (onChange) => {
  window.addEventListener('storage', onChange);
  window.addEventListener('authChange', onChange);

  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener('authChange', onChange);
  };
};

const getAuthSnapshot = () => !!localStorage.getItem('token');

const navLinkClass = ({ isActive }) =>
  cn(
    'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  );

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = useSyncExternalStore(subscribeToAuth, getAuthSnapshot);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Lock body scroll while the mobile sheet is open.
    if (!mobileMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange'));
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <NavLink to="/" className="inline-flex items-center gap-2.5 text-base font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CarFront className="size-4" />
          </span>
          DriveShare
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={navLinkClass}>Home</NavLink>
          <NavLink to="/cars" className={navLinkClass}>Browse Cars</NavLink>

          {isLoggedIn && (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                <LayoutDashboard className="size-4" />
                Dashboard
              </NavLink>
              <NavLink to="/add-car" className={navLinkClass}>
                <CirclePlus className="size-4" />
                List Car
              </NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <div className="hidden items-center gap-2 md:flex">
            {isLoggedIn ? (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut data-icon="inline-start" />
                Logout
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <NavLink to="/login">
                    <LogIn data-icon="inline-start" />
                    Login
                  </NavLink>
                </Button>
                <Button size="sm" asChild>
                  <NavLink to="/register">
                    <UserPlus data-icon="inline-start" />
                    Sign Up
                  </NavLink>
                </Button>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="flex flex-col gap-1 border-t bg-background px-5 py-4 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <NavLink to="/" className={navLinkClass}>Home</NavLink>
          <NavLink to="/cars" className={navLinkClass}>Browse Cars</NavLink>

          {isLoggedIn ? (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                <LayoutDashboard className="size-4" />
                Dashboard
              </NavLink>
              <NavLink to="/add-car" className={navLinkClass}>
                <CirclePlus className="size-4" />
                List Car
              </NavLink>
              <Separator className="my-2" />
              <Button variant="outline" onClick={handleLogout}>
                <LogOut data-icon="inline-start" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Separator className="my-2" />
              <div className="flex flex-col gap-2">
                <Button variant="outline" asChild>
                  <NavLink to="/login">
                    <LogIn data-icon="inline-start" />
                    Login
                  </NavLink>
                </Button>
                <Button asChild>
                  <NavLink to="/register">
                    <UserPlus data-icon="inline-start" />
                    Sign Up
                  </NavLink>
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

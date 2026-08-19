import { Link } from 'react-router-dom';
import { CarFront } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Footer = () => (
  <footer className="mt-20 border-t">
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-start md:justify-between">
      <div>
        <Link to="/" className="inline-flex items-center gap-2.5 text-base font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CarFront className="size-4" />
          </span>
          DriveShare
        </Link>
        <p className="mt-3 max-w-sm text-sm text-muted-foreground">
          Rent standout cars from nearby owners, or swap keys with fellow enthusiasts.
        </p>
      </div>

      <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <Link to="/cars" className="transition-colors hover:text-foreground">Browse cars</Link>
        <Link to="/add-car" className="transition-colors hover:text-foreground">List your car</Link>
        <Link to="/dashboard" className="transition-colors hover:text-foreground">Dashboard</Link>
      </nav>
    </div>

    <Separator />

    
  </footer>
);

export default Footer;

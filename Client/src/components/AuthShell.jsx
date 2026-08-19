import { Link } from 'react-router-dom';
import { CarFront, ShieldCheck, MapPinned, Repeat } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Item, ItemContent, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item';

const perks = [
  { icon: MapPinned, text: 'Find cars minutes away, not cities away.' },
  { icon: Repeat, text: 'Rent it, or swap keys with another owner.' },
  { icon: ShieldCheck, text: 'Verified profiles before any handoff.' }
];

/** Two-column auth layout: brand story on the left, form card on the right. */
const AuthShell = ({ title, subtitle, children, footer }) => (
  <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-2 lg:gap-20">
    <div className="hidden lg:block">
      <Link to="/" className="inline-flex items-center gap-2.5 text-base font-semibold tracking-tight">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <CarFront className="size-4" />
        </span>
        DriveShare
      </Link>

      <h2 className="font-heading mt-8 text-4xl leading-tight font-semibold tracking-tight text-balance">
        Keys to the city, shared.
      </h2>

      <p className="mt-4 max-w-md text-muted-foreground">
        One account to rent standout cars nearby, list your own, and arrange exchanges with people
        who care about them as much as you do.
      </p>

      <ItemGroup className="mt-10 gap-2">
        {perks.map(({ icon: Icon, text }) => (
          <Item key={text}>
            <ItemMedia variant="icon">
              <Icon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="text-muted-foreground">{text}</ItemTitle>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
    </div>

    <div className="mx-auto w-full max-w-md">
      <Card className="[--card-spacing:--spacing(6)]">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>

      {footer && <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>}
    </div>
  </div>
);

export default AuthShell;

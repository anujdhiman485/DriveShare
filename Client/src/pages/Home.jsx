import { Link } from 'react-router-dom';
import { useLayoutEffect, useRef } from 'react';
import {
  ShieldCheck,
  Wallet,
  Repeat,
  Search,
  MapPinned,
  CalendarCheck2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Item, ItemContent, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item';

const features = [
  {
    icon: Search,
    title: 'Precision Discovery',
    copy: 'Locate options by area, radius, and car type without endless scrolling.'
  },
  {
    icon: Repeat,
    title: 'Easy Exchanges',
    copy: 'Swap vehicles with compatible owners using a single streamlined flow.'
  },
  {
    icon: Wallet,
    title: 'Revenue for Hosts',
    copy: 'Turn idle days into earnings with transparent daily pricing.'
  },
  {
    icon: ShieldCheck,
    title: 'Verified Community',
    copy: 'Profiles and requests are built around trust before keys are exchanged.'
  }
];

const steps = [
  { n: '01', title: 'Sign Up', copy: 'Create your profile and verify your details.' },
  { n: '02', title: 'Browse or Host', copy: 'Find the right car or publish yours in minutes.' },
  { n: '03', title: 'Connect', copy: 'Send booking or exchange requests with clear timelines.' },
  { n: '04', title: 'Drive', copy: 'Finalize handoff and enjoy a smoother driving experience.' }
];

const highlights = [
  { icon: MapPinned, text: 'Hyperlocal car discovery' },
  { icon: CalendarCheck2, text: 'Transparent booking timeline' },
  { icon: ShieldCheck, text: 'Secure identity checks' }
];

const Home = () => {
  const pageRef = useRef(null);

  useLayoutEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-hero]',
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.5, ease: 'power2.out' }
      );

      gsap.fromTo(
        '[data-reveal]',
        { y: 16, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.4, ease: 'power2.out', delay: 0.2 }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef}>
      {/* ---------- Hero ---------- */}
      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pt-14 pb-16 sm:px-8 sm:pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:pb-24">
        <div>
          <Badge data-hero variant="secondary">
            <Sparkles />
            DriveShare Reimagined
          </Badge>

          <h1
            data-hero
            className="font-heading mt-5 text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            City rides with style, trust, and zero friction.
          </h1>

          <p data-hero className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Rent standout cars from nearby owners or swap keys with enthusiasts who match your taste.
            Built for smooth booking, flexible exchanges, and quick handoffs.
          </p>

          <div data-hero className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link to="/cars">
                Explore Cars
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/register">Become a Host</Link>
            </Button>
          </div>

          <div data-hero className="mt-8 flex flex-wrap gap-2">
            {['Fast approvals', 'Trusted owners', 'Flexible exchanges'].map((label) => (
              <Badge key={label} variant="outline">{label}</Badge>
            ))}
          </div>
        </div>

        <Card data-hero>
          <CardHeader>
            <CardTitle>What feels different</CardTitle>
            <CardDescription>
              Smarter location matching, cleaner pricing, and confidence-first profiles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ItemGroup className="gap-2">
              {highlights.map(({ icon: Icon, text }) => (
                <Item key={text} variant="muted">
                  <ItemMedia variant="icon">
                    <Icon />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{text}</ItemTitle>
                  </ItemContent>
                </Item>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>
      </section>

      {/* ---------- Features ---------- */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <div className="max-w-2xl">
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Why Drivers Stay Here
          </h2>
          <p className="mt-3 text-muted-foreground">
            The platform balances value, convenience, and trust for both renters and owners.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, copy }) => (
            <Card key={title} data-reveal>
              <CardHeader>
                <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-4.5" />
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{copy}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* ---------- Flow ---------- */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <div className="max-w-2xl">
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            How It Flows
          </h2>
          <p className="mt-3 text-muted-foreground">From signup to pickup in four clear moves.</p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ n, title, copy }) => (
            <div key={n} data-reveal className="rounded-xl border p-5">
              <span className="font-heading text-2xl font-semibold text-muted-foreground">{n}</span>
              <h3 className="mt-3 font-medium">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-8 sm:px-8">
        <div className="rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Ready to level up your next ride?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm opacity-80 sm:text-base">
            Join a network where every trip feels intentional, local, and easy.
          </p>
          <Button size="lg" variant="secondary" className="mt-8" asChild>
            <Link to="/register">
              Start With DriveShare
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;

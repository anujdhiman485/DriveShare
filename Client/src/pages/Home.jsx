import { Link } from 'react-router-dom';
import { useLayoutEffect, useRef } from 'react';
import { ShieldCheck, Wallet, Repeat, Search, MapPinned, CalendarCheck2, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import './Home.css';

const Home = () => {
  const pageRef = useRef(null);

  useLayoutEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-kicker, .hero-content h1, .hero-copy, .hero-buttons, .hero-highlight-card',
        { y: 28, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.58, ease: 'power3.out' }
      );

      gsap.fromTo(
        '.feature-card, .flow-step, .stat-pill',
        { y: 22, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          stagger: 0.08,
          duration: 0.44,
          ease: 'power2.out',
          delay: 0.26
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="home">
      <section className="home-hero">
        <div className="hero-content">
          <p className="hero-kicker">DriveShare Reimagined</p>
          <h1>City rides with style, trust, and zero friction.</h1>
          <p className="hero-copy">
            Rent standout cars from nearby owners or swap keys with enthusiasts who match your taste.
            Built for smooth booking, flexible exchanges, and quick handoffs.
          </p>
          <div className="hero-buttons">
            <Link to="/cars" className="btn btn-primary">Explore Cars</Link>
            <Link to="/register" className="btn btn-secondary">Become a Host</Link>
          </div>
          <div className="hero-stats">
            <span className="stat-pill">Fast approvals</span>
            <span className="stat-pill">Trusted owners</span>
            <span className="stat-pill">Flexible exchanges</span>
          </div>
        </div>
        <div className="hero-highlight-card">
          <h3><Sparkles size={18} /> What feels different</h3>
          <p>Smarter location matching, cleaner pricing, and confidence-first profiles.</p>
          <ul>
            <li><MapPinned size={15} /> Hyperlocal car discovery</li>
            <li><CalendarCheck2 size={15} /> Transparent booking timeline</li>
            <li><ShieldCheck size={15} /> Secure identity checks</li>
          </ul>
        </div>
      </section>

      <section className="home-features">
        <div className="section-head">
          <h2>Why Drivers Stay Here</h2>
          <p>The platform balances value, convenience, and trust for both renters and owners.</p>
        </div>
        <div className="home-features-grid">
          <div className="feature-card">
            <div className="feature-icon"><Search size={22} /></div>
            <h3>Precision Discovery</h3>
            <p>Locate options by area, radius, and car type without endless scrolling.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Repeat size={22} /></div>
            <h3>Easy Exchanges</h3>
            <p>Swap vehicles with compatible owners using a single streamlined flow.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Wallet size={22} /></div>
            <h3>Revenue for Hosts</h3>
            <p>Turn idle days into earnings with transparent daily pricing.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><ShieldCheck size={22} /></div>
            <h3>Verified Community</h3>
            <p>Profiles and requests are built around trust before keys are exchanged.</p>
          </div>
        </div>
      </section>

      <section className="home-flow">
        <div className="section-head">
          <h2>How It Flows</h2>
          <p>From signup to pickup in four clear moves.</p>
        </div>
        <div className="flow-steps">
          <div className="flow-step">
            <div className="step-number">01</div>
            <h3>Sign Up</h3>
            <p>Create your profile and verify your details.</p>
          </div>
          <div className="flow-step">
            <div className="step-number">02</div>
            <h3>Browse or Host</h3>
            <p>Find the right car or publish yours in minutes.</p>
          </div>
          <div className="flow-step">
            <div className="step-number">03</div>
            <h3>Connect</h3>
            <p>Send booking or exchange requests with clear timelines.</p>
          </div>
          <div className="flow-step">
            <div className="step-number">04</div>
            <h3>Drive</h3>
            <p>Finalize handoff and enjoy a smoother driving experience.</p>
          </div>
        </div>
      </section>

      <section className="home-cta">
        <h2>Ready to level up your next ride?</h2>
        <p>Join a network where every trip feels intentional, local, and easy.</p>
        <Link to="/register" className="btn btn-primary btn-large">Start With DriveShare</Link>
      </section>
    </div>
  );
};

export default Home;

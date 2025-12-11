import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Share Your Car, Drive Your Dreams</h1>
          <p>Rent cars from local owners or exchange your car with fellow enthusiasts</p>
          <div className="hero-buttons">
            <Link to="/cars" className="btn btn-primary">Browse Cars</Link>
            <Link to="/register" className="btn btn-secondary">List Your Car</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose DriveShare?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚗</div>
            <h3>Rent a Car</h3>
            <p>Find the perfect car for your needs from local owners at affordable prices</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Exchange Cars</h3>
            <p>Swap cars with other enthusiasts and experience different vehicles</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Earn Money</h3>
            <p>List your car and earn passive income when you're not using it</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Secure & Safe</h3>
            <p>Verified users and comprehensive insurance for peace of mind</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Sign Up</h3>
            <p>Create your free account in minutes</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>List or Browse</h3>
            <p>List your car or browse available vehicles</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Connect</h3>
            <p>Book a rental or request a car exchange</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Drive</h3>
            <p>Pick up the car and enjoy your ride</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of car owners and renters today</p>
        <Link to="/register" className="btn btn-primary btn-large">Get Started Now</Link>
      </section>
    </div>
  );
};

export default Home;

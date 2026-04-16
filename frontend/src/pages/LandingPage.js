import React from 'react';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaTools, 
  FaCheckCircle, 
  FaSearch, 
  FaHandshake, 
  FaShieldAlt, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaStar, 
  FaArrowRight,
  FaUserCheck,
  FaClock,
  FaRupeeSign,
  FaLeaf
} from 'react-icons/fa';

const LandingPage = () => {
  return (
    /* padding-top ensures the content starts exactly below your 76px high fixed navbar */
    <div className="landing-wrapper" style={{ paddingTop: '76px' }}>
      
      {/* ENHANCED DARKER BLUISH THEME WITH INDIAN CONTEXT */}
      <style>
        {`
          .landing-wrapper {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            overflow-x: hidden;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #e2e8f0;
            min-height: 100vh;
          }
          
          /* Hero Section */
          .hero-section {
            padding: 4rem 0 6rem;
            position: relative;
            overflow: hidden;
          }
          
          .hero-bg-pattern {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: 
              radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(52, 211, 153, 0.1) 0%, transparent 50%);
            pointer-events: none;
          }
          
          .hero-title {
            font-size: 4rem;
            font-weight: 800;
            letter-spacing: -0.03em;
            line-height: 1.2;
            margin-bottom: 1.5rem;
            color: #ffffff;
          }
          
          .hero-title-gradient {
            background: linear-gradient(135deg, #60a5fa 0%, #34d399 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .hero-subtitle {
            font-size: 1.25rem;
            color: #94a3b8;
            margin-bottom: 2.5rem;
            max-width: 650px;
            margin-left: auto;
            margin-right: auto;
            line-height: 1.7;
          }
          
          .hero-stats {
            display: flex;
            justify-content: center;
            gap: 3rem;
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid rgba(59, 130, 246, 0.2);
          }
          
          .stat-item {
            text-align: center;
          }
          
          .stat-number {
            font-size: 2rem;
            font-weight: 800;
            background: linear-gradient(135deg, #60a5fa 0%, #34d399 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            line-height: 1.2;
            margin-bottom: 0.25rem;
          }
          
          .stat-label {
            color: #94a3b8;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          /* Trust Banner */
          .trust-banner {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border-top: 1px solid rgba(59, 130, 246, 0.2);
            border-bottom: 1px solid rgba(59, 130, 246, 0.2);
            padding: 4rem 0;
            margin: 2rem 0;
          }
          
          .trust-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            color: white;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
          
          .trust-banner h5 { color: #f1f5f9; }
          .trust-banner p { color: #94a3b8; }
          
          /* Buttons */
          .btn-primary-gradient {
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            padding: 0.75rem 2rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
          
          .btn-primary-gradient:hover {
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
            color: white;
          }
          
          .btn-success-gradient {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            padding: 0.75rem 2rem;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
          
          .btn-success-gradient:hover {
            background: linear-gradient(135deg, #047857 0%, #059669 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
            color: white;
          }
          
          /* Feature Cards */
          .feature-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 20px;
            padding: 2.5rem 2rem;
            height: 100%;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }
          
          .feature-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(59, 130, 246, 0.15);
            border-color: #3b82f6;
          }
          
          .feature-card h4 { color: #f1f5f9; }
          .feature-card p { color: #94a3b8; }
          
          .icon-box-dark {
            width: 64px; height: 64px; border-radius: 16px;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            display: flex; align-items: center; justify-content: center;
            margin-bottom: 1.5rem; color: #60a5fa; border: 1px solid #334155;
          }
          
          /* How It Works Steps */
          .step-card {
            background: #1e293b; border-radius: 20px; padding: 2rem; position: relative; border: 1px solid #334155; transition: all 0.3s ease;
          }
          
          .step-card:hover { border-color: #3b82f6; box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15); }
          .step-card h4 { color: #f1f5f9; }
          .step-card p { color: #94a3b8; }
          
          .step-number {
            position: absolute; top: -15px; left: 25px; width: 40px; height: 40px;
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
            color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center;
            font-weight: 700; font-size: 1.2rem; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          }
          
          /* Category Pills */
          .category-pill {
            background: #1e293b; border: 1px solid #334155; border-radius: 100px; padding: 0.75rem 1.5rem; color: #60a5fa;
            font-weight: 500; transition: all 0.2s ease; display: inline-block; margin: 0.25rem;
          }
          
          .category-pill:hover {
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); color: white; border-color: #3b82f6;
            transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
          
          /* Testimonial Card */
          .testimonial-card {
            background: #1e293b; border-radius: 20px; padding: 2rem; border: 1px solid #334155; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }
          .testimonial-card p { color: #cbd5e1; }
          
          /* Section Headers */
          .section-title { color: #f1f5f9; }
          .section-subtitle { color: #94a3b8; }
          
          /* CTA Section */
          .cta-section {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border-radius: 32px; padding: 4rem; margin: 4rem 0; color: white; position: relative; overflow: hidden; border: 1px solid #334155;
          }
          
          .cta-pattern {
            position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            opacity: 0.05;
          }
          
          /* Footer */
          .footer {
            background: #0f172a; border-top: 1px solid #1e293b; padding: 3rem 0; margin-top: 4rem;
          }
          
          .footer h6 { color: #f1f5f9; }
          .footer p, .footer a { color: #94a3b8; text-decoration: none;}
          .footer a:hover { color: #60a5fa; }
          
          .badge-custom {
            background: #1e293b; color: #60a5fa; border: 1px solid #334155; font-weight: 500;
          }
          
          .bg-darker { background: #0f172a; }
          .bg-dark-medium { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); }
          
          .text-gradient {
            background: linear-gradient(135deg, #60a5fa 0%, #34d399 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          }
        `}
      </style>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-pattern"></div>
        <Container className="position-relative">
          <div className="text-center">
            <Badge className="mb-4 px-4 py-3 rounded-pill badge-custom">
              <FaLeaf className="me-2" /> 🇮🇳 Proudly Indian • Local Communities • Sustainable Sharing
            </Badge>
            
            <h1 className="hero-title">
              Borrow Tools.<br/>
              <span className="hero-title-gradient">Build India.</span>
            </h1>
            
            <p className="hero-subtitle">
              Access quality tools from trusted neighbors in your city. 
              Save money, reduce waste, and connect with DIY enthusiasts across India.
            </p>
            
            <div className="d-flex justify-content-center gap-3">
              <Link to="/register" className="btn-primary-gradient px-5 py-3 fs-5">
                Start Borrowing <FaArrowRight className="ms-2" />
              </Link>
              {/* Changed from /list-tool to /login for unauthenticated flow */}
              <Link to="/login" className="btn-success-gradient px-5 py-3 fs-5">
                List Your Tools
              </Link>
            </div>
            
            {/* Replaced fake metrics with honest value propositions */}
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">100%</div>
                <div className="stat-label">Verified Members</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">₹0</div>
                <div className="stat-label">Listing Fee</div>
              </div>
              <div className="stat-item">
                <div className="stat-number"><FaMapMarkerAlt size={28} color="#34d399" /></div>
                <div className="stat-label">Hyperlocal Match</div>
              </div>
              <div className="stat-item">
                <div className="stat-number"><FaShieldAlt size={28} color="#60a5fa" /></div>
                <div className="stat-label">Secure Deposits</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Trust Banner with Indian Context */}
      <section className="trust-banner">
        <Container>
          <Row className="g-4 text-center">
            <Col md={3}>
              <div className="trust-icon"><FaUserCheck size={24} /></div>
              <h5 className="fw-bold mb-2">Identity Verified</h5>
              <p className="small mb-0">All members verified for trust & safety</p>
            </Col>
            <Col md={3}>
              <div className="trust-icon"><FaShieldAlt size={24} /></div>
              <h5 className="fw-bold mb-2">Secure UPI Payments</h5>
              <p className="small mb-0">Protected via Indian payment gateways</p>
            </Col>
            <Col md={3}>
              <div className="trust-icon"><FaMapMarkerAlt size={24} /></div>
              <h5 className="fw-bold mb-2">Hyperlocal</h5>
              <p className="small mb-0">Find tools right in your neighborhood</p>
            </Col>
            <Col md={3}>
              <div className="trust-icon"><FaRupeeSign size={24} /></div>
              <h5 className="fw-bold mb-2">Fair Indian Pricing</h5>
              <p className="small mb-0">Save up to 70% vs market rental rates</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Popular Categories */}
      <section className="py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold fs-1 mb-3 section-title">Browse Popular Categories</h2>
            <p className="section-subtitle" style={{ fontSize: '1.1rem' }}>
              Find exactly what you need for your next project
            </p>
          </div>
          <div className="text-center">
            <span className="category-pill">🔨 Power Tools</span>
            <span className="category-pill">🌱 Garden Equipment</span>
            <span className="category-pill">🏠 Home Improvement</span>
            <span className="category-pill">🚗 Automotive</span>
            <span className="category-pill">📸 Photography Gear</span>
            <span className="category-pill">🏕️ Outdoor & Camping</span>
            <span className="category-pill">🎨 Painting</span>
            <span className="category-pill">🔧 Hand Tools</span>
            <span className="category-pill">⚡ Electrical</span>
            <span className="category-pill">🪚 Woodworking</span>
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="py-5 bg-darker">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold fs-1 mb-3 section-title">How ToolShare Works</h2>
            <p className="section-subtitle" style={{ fontSize: '1.1rem' }}>
              Simple, transparent, and community-focused
            </p>
          </div>
          <Row className="g-4">
            <Col lg={3} md={6}>
              <div className="step-card">
                <div className="step-number">1</div>
                <div className="icon-box-dark mb-4"><FaSearch size={28} /></div>
                <h4 className="fw-bold mb-3">Discover</h4>
                <p className="mb-0">Browse tools in your area with real-time availability. Filter by category, price, and distance.</p>
              </div>
            </Col>
            <Col lg={3} md={6}>
              <div className="step-card">
                <div className="step-number">2</div>
                <div className="icon-box-dark mb-4"><FaCalendarAlt size={28} /></div>
                <h4 className="fw-bold mb-3">Request</h4>
                <p className="mb-0">Send a booking request with your desired dates. Owners typically respond within hours.</p>
              </div>
            </Col>
            <Col lg={3} md={6}>
              <div className="step-card">
                <div className="step-number">3</div>
                <div className="icon-box-dark mb-4"><FaHandshake size={28} /></div>
                <h4 className="fw-bold mb-3">Connect</h4>
                <p className="mb-0">Once approved, coordinate pickup details. All communication stays secure on the platform.</p>
              </div>
            </Col>
            <Col lg={3} md={6}>
              <div className="step-card">
                <div className="step-number">4</div>
                <div className="icon-box-dark mb-4"><FaCheckCircle size={28} /></div>
                <h4 className="fw-bold mb-3">Return & Review</h4>
                <p className="mb-0">Return the tool cleanly. Leave a review to help build our Indian community's trust.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Why Choose ToolShare */}
      <section className="py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold fs-1 mb-3 section-title">Why Choose ToolShare?</h2>
            <p className="section-subtitle" style={{ fontSize: '1.1rem' }}>
              Built for Indian communities, designed for trust
            </p>
          </div>
          <Row className="g-4">
            <Col lg={4} md={6}>
              <div className="feature-card">
                <div className="icon-box-dark"><FaClock size={28} /></div>
                <h4 className="fw-bold mb-3">Real-Time Availability</h4>
                <p className="mb-0 lh-lg">See exactly when tools are available with our live calendar system. No double bookings.</p>
              </div>
            </Col>
            <Col lg={4} md={6}>
              <div className="feature-card">
                <div className="icon-box-dark"><FaShieldAlt size={28} /></div>
                <h4 className="fw-bold mb-3">Secure Deposit System</h4>
                <p className="mb-0 lh-lg">Deposits are held securely via UPI and automatically released upon safe return of the tool.</p>
              </div>
            </Col>
            <Col lg={4} md={6}>
              <div className="feature-card">
                <div className="icon-box-dark"><FaStar size={28} /></div>
                <h4 className="fw-bold mb-3">Verified Reviews</h4>
                <p className="mb-0 lh-lg">Only users who complete transactions can leave reviews, ensuring authentic community feedback.</p>
              </div>
            </Col>
            <Col lg={4} md={6}>
              <div className="feature-card">
                <div className="icon-box-dark"><FaMapMarkerAlt size={28} /></div>
                <h4 className="fw-bold mb-3">Hyperlocal Discovery</h4>
                <p className="mb-0 lh-lg">Find tools within your locality. Perfect for Indian neighborhoods and apartment complexes.</p>
              </div>
            </Col>
            <Col lg={4} md={6}>
              <div className="feature-card">
                <div className="icon-box-dark"><FaRupeeSign size={28} /></div>
                <h4 className="fw-bold mb-3">Earn in Rupees</h4>
                <p className="mb-0 lh-lg">List your idle tools and earn passive income. Set your own rates starting from ₹100/day.</p>
              </div>
            </Col>
            <Col lg={4} md={6}>
              <div className="feature-card">
                <div className="icon-box-dark"><FaLeaf size={28} /></div>
                <h4 className="fw-bold mb-3">Sustainable India</h4>
                <p className="mb-0 lh-lg">Join the circular economy movement. Every rental reduces waste and carbon footprint.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-4">
        <Container>
          <div className="cta-section text-center position-relative">
            <div className="cta-pattern"></div>
            <div className="position-relative" style={{ zIndex: 1 }}>
              <h2 className="fw-bold fs-1 mb-4">Ready to Join India's Sharing Economy?</h2>
              <p className="mb-4 fs-5" style={{ opacity: 0.95 }}>
                Create your free account today and start browsing local inventory.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Link to="/register" className="btn btn-light btn-lg px-5 py-3 fw-bold" style={{ color: '#0f172a' }}>
                  Get Started Free
                </Link>
              </div>
              <p className="mt-4 small" style={{ opacity: 0.8 }}>
                <FaCheckCircle className="me-1" /> No credit card required to browse • UPI payments accepted
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="footer">
        <Container>
          <Row className="gy-4">
            <Col md={6}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="icon-box-dark" style={{ width: '32px', height: '32px', margin: 0 }}>
                  <FaTools size={16} />
                </div>
                <span className="fw-bold fs-5 text-gradient">ToolShare India</span>
              </div>
              <p className="small w-75">
                Building stronger Indian communities through shared resources. 
                Join neighbors already saving money and reducing waste.
              </p>
            </Col>
            <Col md={3}>
              <h6 className="fw-bold mb-3">Platform</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><Link to="/login" className="small">Sign In</Link></li>
                <li className="mb-2"><Link to="/register" className="small">Register</Link></li>
              </ul>
            </Col>
            <Col md={3}>
              <h6 className="fw-bold mb-3">Support & Legal</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><span className="small text-muted" style={{ cursor: 'pointer' }}>Help Center</span></li>
                <li className="mb-2"><span className="small text-muted" style={{ cursor: 'pointer' }}>Privacy Policy</span></li>
                <li className="mb-2"><span className="small text-muted" style={{ cursor: 'pointer' }}>Terms of Service</span></li>
              </ul>
            </Col>
          </Row>
          <hr className="my-4" style={{ borderColor: '#1e293b' }} />
          <div className="text-center">
            <p className="small mb-0" style={{ color: '#64748b' }}>
              © {new Date().getFullYear()} ToolShare India. Made with ❤️ for Indian communities.
            </p>
          </div>
        </Container>
      </footer>
      
    </div>
  );
};

export default LandingPage;
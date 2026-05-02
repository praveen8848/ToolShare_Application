import React from "react";
import { Container, Row, Col, Button, Navbar, Nav } from "react-bootstrap";
import {
  FaWrench,
  FaSearch,
  FaCalendarAlt,
  FaHandshake,
  FaMapMarkerAlt,
  FaStar,
  FaCheck,
  FaArrowRight,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const categories = [
  "Power drills", "Circular saws", "Pressure washers", "Ladders", "Sanders",
  "Hedge trimmers", "Tile cutters", "Air compressors", "Welders", "Carpet cleaners",
  "Wheelbarrows", "Nail guns", "Wood routers", "Lawn aerators", "Paint sprayers"
];

const featuredTools = [
  { emoji: "🪛", category: "Power Drill", rating: 4.9, name: "Bosch 12V Drill Kit", owner: "Praveen", distance: "1.2 km", price: 250 },
  { emoji: "🪚", category: "Circular Saw", rating: 4.8, name: "Makita 7¼\" Saw", owner: "Akash", distance: "2.5 km", price: 400 },
  { emoji: "💦", category: "Pressure Washer", rating: 5.0, name: "Karcher K3", owner: "Rohan", distance: "0.8 km", price: 350 },
  { emoji: "🪜", category: "Ladder", rating: 4.7, name: "6ft Aluminium Ladder", owner: "Neha", distance: "3.1 km", price: 100 },
  { emoji: "🌀", category: "Sander", rating: 4.9, name: "Orbital Sander", owner: "Vikram", distance: "1.9 km", price: 200 },
  { emoji: "🧱", category: "Tile Cutter", rating: 4.8, name: "Manual Tile Cutter", owner: "Aarti", distance: "4.0 km", price: 600 },
];

const testimonials = [
  { quote: "Rented a drill for a weekend DIY. Saved ₹3,000 and met my neighbour. Brilliant!", name: "Ananya", city: "Mumbai" },
  { quote: "I've lent my pressure washer 8 times now. Side income is real, and it's so easy.", name: "Rahul", city: "Delhi" },
  { quote: "Found a tile cutter on same-day notice. Community here is incredibly helpful.", name: "Deepika", city: "Bangalore" },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        :root {
          --ts-bg: #121212;
          --ts-surface: #1E1E1E;
          --ts-accent: #10B981;
          --ts-accent-bright: #34D399;
          --ts-accent-10: rgba(16, 185, 129, 0.1);
          --ts-accent-15: rgba(16, 185, 129, 0.15);
          --ts-text: #E5E5E5;
          --ts-text-muted: #A3A3A3;
          --ts-text-dim: #737373;
          --ts-border: #2A2A2A;
          --ts-white: #F5F5F5;
          --ts-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        body {
          font-family: var(--ts-font);
          color: var(--ts-text);
          background: var(--ts-bg);
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }

        h1, h2, h3, h4, h5 { color: var(--ts-white); font-weight: 700; }
        h2 { font-size: 2rem; }
        h3 { font-size: 1.5rem; }

        /* Buttons */
        .ts-btn {
          font-weight: 600;
          padding: 10px 22px;
          font-size: 0.9rem;
          border-radius: 12px;
          transition: all 0.2s;
        }
        .ts-btn-primary {
          background: var(--ts-accent);
          border: 1px solid var(--ts-accent);
          color: #121212;
        }
        .ts-btn-primary:hover {
          background: #059669;
          border-color: #059669;
          color: #121212;
        }
        .ts-btn-outline {
          background: transparent;
          border: 1px solid var(--ts-border);
          color: var(--ts-text);
        }
        .ts-btn-outline:hover {
          border-color: #3A3A3A;
          color: var(--ts-white);
        }
        .ts-btn-ghost {
          background: transparent;
          border: none;
          color: var(--ts-text-muted);
        }
        .ts-btn-ghost:hover { color: var(--ts-text); }

        /* Navbar */
        .ts-navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          background: rgba(18, 18, 18, 0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--ts-border);
          padding: 0.6rem 0;
        }
        .ts-brand-square {
          width: 34px; height: 34px;
          background: var(--ts-accent);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #121212;
          font-size: 1rem;
        }
        .ts-brand-text {
          font-weight: 700;
          font-size: 1.3rem;
          color: var(--ts-white);
          margin-left: 10px;
        }
        .ts-nav-link {
          color: var(--ts-text-muted) !important;
          font-weight: 500;
          font-size: 0.9rem;
          margin: 0 8px;
        }
        .ts-nav-link:hover { color: var(--ts-text) !important; }

        /* Hero */
        .ts-hero {
          padding-top: 140px;
          padding-bottom: 80px;
        }
        .ts-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--ts-accent-10);
          color: var(--ts-accent-bright);
          font-weight: 500;
          padding: 5px 14px;
          border-radius: 8px;
          font-size: 0.85rem;
          border: 1px solid rgba(16, 185, 129, 0.2);
          margin-bottom: 20px;
        }
        .ts-hero-title {
          font-size: 3.2rem;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 20px;
        }
        .ts-hero-title span { color: var(--ts-accent-bright); }
        .ts-hero-lead {
          font-size: 1.1rem;
          color: var(--ts-text-muted);
          margin-bottom: 2rem;
          line-height: 1.6;
          max-width: 480px;
        }
        .ts-hero-cta {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }
        .ts-rating-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--ts-surface);
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 500;
          color: var(--ts-text);
          font-size: 0.85rem;
          border: 1px solid var(--ts-border);
        }

        /* Hero Card */
        .ts-hero-card {
          background: var(--ts-surface);
          border-radius: 14px;
          padding: 20px;
          border: 1px solid var(--ts-border);
          max-width: 380px;
          width: 100%;
        }
        .ts-hero-card-img {
          background: #1A1A1A;
          border-radius: 10px;
          aspect-ratio: 4/3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3.5rem;
          margin-bottom: 14px;
          border: 1px solid var(--ts-border);
        }
        .ts-hero-card-loc {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--ts-accent-10);
          color: var(--ts-accent-bright);
          font-weight: 500;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 0.8rem;
          margin-bottom: 10px;
          width: fit-content;
        }
        .ts-hero-price { font-size: 1.4rem; font-weight: 700; }
        .ts-hero-price small { font-weight: 400; color: var(--ts-text-muted); font-size: 0.9rem; }
        .ts-progress-bar-bg {
          height: 4px;
          background: #2A2A2A;
          border-radius: 4px;
          margin: 10px 0 6px;
        }
        .ts-progress-fill {
          width: 75%; height: 100%;
          background: var(--ts-accent);
          border-radius: 4px;
        }
        .ts-progress-text { font-size: 0.75rem; color: var(--ts-text-muted); }

        /* Marquee */
        .ts-marquee-section {
          background: #0A0A0A;
          padding: 24px 0;
          overflow: hidden;
          white-space: nowrap;
          border-top: 1px solid var(--ts-border);
          border-bottom: 1px solid var(--ts-border);
        }
        .ts-marquee-track {
          display: inline-block;
          animation: ts-marquee 40s linear infinite;
        }
        .ts-marquee-item {
          display: inline-block;
          color: var(--ts-text-muted);
          font-weight: 500;
          font-size: 1rem;
          margin: 0 14px;
        }
        .ts-marquee-dot {
          display: inline-block;
          width: 6px; height: 6px;
          background: var(--ts-accent);
          border-radius: 50%;
          margin: 0 6px;
          vertical-align: middle;
        }
        @keyframes ts-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* Sections */
        .ts-section { padding: 80px 0; }
        .ts-section-title { text-align: center; margin-bottom: 48px; }
        .ts-bg-alt { background: #0A0A0A; }

        /* Step Cards */
        .ts-step-card {
          background: var(--ts-surface);
          border-radius: 14px;
          padding: 32px 28px;
          border: 1px solid var(--ts-border);
          text-align: center;
        }
        .ts-step-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: rgba(16, 185, 129, 0.2);
          margin-bottom: 8px;
        }
        .ts-step-icon {
          font-size: 1.5rem;
          color: var(--ts-accent-bright);
          margin-bottom: 12px;
        }
        .ts-step-title { font-size: 1.1rem; margin-bottom: 6px; }
        .ts-step-card p { color: var(--ts-text-muted); font-size: 0.9rem; }

        /* Tool Cards */
        .ts-tool-card {
          background: var(--ts-surface);
          border-radius: 14px;
          border: 1px solid var(--ts-border);
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .ts-tool-img {
          height: 130px;
          background: #1A1A1A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          border-bottom: 1px solid var(--ts-border);
        }
        .ts-tool-body {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .ts-tool-tag {
          background: var(--ts-accent-10);
          color: var(--ts-accent-bright);
          font-weight: 500;
          padding: 2px 10px;
          border-radius: 6px;
          font-size: 0.7rem;
          width: fit-content;
          margin-bottom: 6px;
        }
        .ts-tool-rating {
          background: #0A0A0A;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          color: var(--ts-text);
        }
        .ts-tool-name { font-size: 1rem; margin-top: 6px; }
        .ts-tool-owner {
          color: var(--ts-text-muted);
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 10px;
        }
        .ts-tool-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }
        .ts-tool-price { font-weight: 700; font-size: 1.1rem; }

        /* Earn Card */
        .ts-earn-card {
          background: var(--ts-surface);
          border-radius: 14px;
          padding: 3rem;
          border: 1px solid var(--ts-border);
        }
        .ts-earn-title { font-size: 1.8rem; font-weight: 700; margin-bottom: 12px; }
        .ts-earn-sub { color: var(--ts-text-muted); font-size: 1.05rem; margin-bottom: 20px; }
        .ts-earn-highlight { color: var(--ts-accent-bright); font-weight: 600; }
        .ts-perk-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          color: var(--ts-text-muted);
          font-size: 0.95rem;
        }
        .ts-perk-check {
          width: 24px; height: 24px;
          background: var(--ts-accent-10);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--ts-accent-bright);
          font-size: 0.7rem;
          flex-shrink: 0;
        }

        /* Stats */
        .ts-stat-box {
          border-left: 3px solid var(--ts-accent);
          padding-left: 16px;
          margin-bottom: 24px;
        }
        .ts-stat-number { font-size: 2rem; font-weight: 700; }
        .ts-stat-label { color: var(--ts-text-muted); font-size: 0.9rem; }

        /* Testimonial Cards */
        .ts-testimonial-card {
          background: var(--ts-surface);
          border-radius: 14px;
          padding: 28px;
          border: 1px solid var(--ts-border);
          height: 100%;
        }
        .ts-quote-mark {
          font-size: 2.5rem;
          color: rgba(16, 185, 129, 0.2);
          line-height: 1;
          margin-bottom: 8px;
        }

        /* Footer */
        .ts-footer {
          background: #0A0A0A;
          color: var(--ts-text-muted);
          padding: 60px 0 30px;
          border-top: 1px solid var(--ts-border);
        }
        .ts-footer a {
          color: var(--ts-text-dim);
          text-decoration: none;
          font-size: 0.9rem;
        }
        .ts-footer a:hover { color: var(--ts-text); }
        .ts-footer h5 { color: var(--ts-white); font-weight: 600; margin-bottom: 14px; }
        .ts-footer-bottom {
          border-top: 1px solid var(--ts-border);
          padding-top: 20px;
          margin-top: 36px;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .ts-hero { padding-top: 120px; padding-bottom: 48px; }
          .ts-section { padding: 56px 0; }
          .ts-hero-title { font-size: 2.2rem; }
          .ts-earn-card { padding: 2rem; }
        }
      `}</style>

      {/* Navbar */}
      <Navbar expand="lg" className="ts-navbar">
        <Container>
          <Navbar.Brand href="#" className="d-flex align-items-center">
            <div className="ts-brand-square"><FaWrench /></div>
            <span className="ts-brand-text">ToolShare</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="mx-auto">
              <Nav.Link className="ts-nav-link" href="#how">How it works</Nav.Link>
              <Nav.Link className="ts-nav-link" href="#browse">Browse Tools</Nav.Link>
              <Nav.Link className="ts-nav-link" href="#community">Community</Nav.Link>
            </Nav>
            <div className="d-flex gap-2">
              <Button className="ts-btn ts-btn-ghost" onClick={() => navigate("/login")}>Sign in</Button>
              <Button className="ts-btn ts-btn-primary" onClick={() => navigate("/register")}>Join free</Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero */}
      <section className="ts-hero">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <div className="ts-eyebrow">Now serving 45+ Indian Cities</div>
              <h1 className="ts-hero-title">
                Borrow the tool.<br /><span>Skip the hardware store.</span>
              </h1>
              <p className="ts-hero-lead">
                Rent drills, saws, ladders & more from neighbours nearby. Affordable daily rates, trusted community.
              </p>
              <div className="ts-hero-cta">
                <Button className="ts-btn ts-btn-primary" size="lg" onClick={() => navigate("/browse")}>
                  Browse tools <FaArrowRight className="ms-2" />
                </Button>
                <Button className="ts-btn ts-btn-outline" size="lg" onClick={() => navigate("/add-tool")}>
                  List your tool
                </Button>
                <div className="ts-rating-badge">
                  <FaStar style={{color:"#FBBF24"}} /> 4.9 from 2,300+ reviews
                </div>
              </div>
            </Col>
            <Col lg={6} className="d-flex justify-content-center">
              <div className="ts-hero-card">
                <div className="ts-hero-card-img">🛠️</div>
                <div className="ts-hero-card-loc">
                  <FaMapMarkerAlt /> Pickup nearby • 0.5 km
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="ts-hero-price">₹150 <small>/ day</small></span>
                  <span className="ts-tool-rating"><FaStar style={{color:"#FBBF24",fontSize:10}} /> 4.9</span>
                </div>
                <div className="ts-progress-bar-bg"><div className="ts-progress-fill"></div></div>
                <div className="ts-progress-text">3 of 4 days booked this week</div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Marquee */}
      <div className="ts-marquee-section">
        <div className="ts-marquee-track">
          {categories.map((cat, i) => (
            <React.Fragment key={i}>
              <span className="ts-marquee-item">{cat}</span>
              <span className="ts-marquee-dot"></span>
            </React.Fragment>
          ))}
          {categories.map((cat, i) => (
            <React.Fragment key={`dup-${i}`}>
              <span className="ts-marquee-item">{cat}</span>
              <span className="ts-marquee-dot"></span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <section id="how" className="ts-section">
        <Container>
          <h2 className="ts-section-title">How ToolShare works</h2>
          <Row className="g-4">
            {[
              { num: "01", icon: <FaSearch />, title: "Find what you need", desc: "Search drills, saws, ladders within 5 km. Filter by price & availability." },
              { num: "02", icon: <FaCalendarAlt />, title: "Book by the day", desc: "Reserve online, pay securely. See real-time calendars of each tool." },
              { num: "03", icon: <FaHandshake />, title: "Pickup, build, return", desc: "Coordinate pickup via chat. Use it, clean it, return it. Simple." },
            ].map((step, i) => (
              <Col md={4} key={i}>
                <div className="ts-step-card">
                  <div className="ts-step-number">{step.num}</div>
                  <div className="ts-step-icon">{step.icon}</div>
                  <h4 className="ts-step-title">{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Featured Tools */}
      <section id="browse" className="ts-section ts-bg-alt">
        <Container>
          <h2 className="ts-section-title">Real tools, from real neighbours.</h2>
          <Row className="g-4">
            {featuredTools.map((tool, idx) => (
              <Col key={idx} md={6} lg={4}>
                <div className="ts-tool-card">
                  <div className="ts-tool-img">{tool.emoji}</div>
                  <div className="ts-tool-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="ts-tool-tag">{tool.category}</span>
                      <span className="ts-tool-rating"><FaStar style={{color:"#FBBF24",fontSize:10}}/> {tool.rating}</span>
                    </div>
                    <h5 className="ts-tool-name">{tool.name}</h5>
                    <div className="ts-tool-owner">
                      <FaMapMarkerAlt size={11} /> {tool.owner} • {tool.distance}
                    </div>
                    <div className="ts-tool-footer">
                      <span className="ts-tool-price">₹{tool.price}<small style={{color:"var(--ts-text-muted)",fontSize:"0.75rem"}}>/day</small></span>
                      <Button className="ts-btn ts-btn-primary" size="sm">Book</Button>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Earn Section */}
      <section className="ts-section">
        <Container>
          <div className="ts-earn-card">
            <Row className="align-items-center">
              <Col lg={6} className="mb-4 mb-lg-0">
                <h3 className="ts-earn-title">Your garage is a side hustle waiting to happen.</h3>
                <p className="ts-earn-sub">
                  The average lender on ToolShare earns <span className="ts-earn-highlight">₹15,000/month</span> renting out tools they already own.
                </p>
                <Button className="ts-btn ts-btn-primary" onClick={() => navigate("/add-tool")}>
                  Start earning <FaArrowRight className="ms-2" />
                </Button>
              </Col>
              <Col lg={6}>
                <div className="ps-lg-4">
                  {["Set your own daily price", "Covered by damage protection", "Flexible pickup & return windows", "Payouts every week"].map((perk, i) => (
                    <div className="ts-perk-item" key={i}>
                      <span className="ts-perk-check"><FaCheck /></span> {perk}
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
          </div>
        </Container>
      </section>

      {/* Community */}
      <section id="community" className="ts-section ts-bg-alt">
        <Container>
          <h2 className="ts-section-title">Trusted by thousands across India</h2>
          <Row className="mb-5">
            {[
              { number: "12.4k", label: "Active members" },
              { number: "38k", label: "Tools listed" },
              { number: "45+", label: "Cities covered" },
              { number: "4.9★", label: "Average rating" },
            ].map((stat, i) => (
              <Col key={i} sm={6} lg={3}>
                <div className="ts-stat-box">
                  <div className="ts-stat-number">{stat.number}</div>
                  <div className="ts-stat-label">{stat.label}</div>
                </div>
              </Col>
            ))}
          </Row>
          <Row className="g-4">
            {testimonials.map((t, i) => (
              <Col key={i} md={4}>
                <div className="ts-testimonial-card">
                  <div className="ts-quote-mark">"</div>
                  <p style={{fontSize:"0.95rem",color:"var(--ts-text)",marginBottom:"16px"}}>{t.quote}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold" style={{color:"var(--ts-white)",fontSize:"0.9rem"}}>{t.name}</span>
                    <span className="ts-tool-tag">{t.city}</span>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA */}
      <section className="ts-section text-center">
        <Container>
          <h2 style={{fontSize:"2.2rem",fontWeight:700,marginBottom:"12px"}}>
            Less stuff. <span style={{color:"var(--ts-accent-bright)"}}>More building.</span>
          </h2>
          <p style={{color:"var(--ts-text-muted)",marginBottom:"28px"}}>Join the neighbourhood sharing economy today.</p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Button className="ts-btn ts-btn-primary" size="lg" onClick={() => navigate("/register")}>Get started free</Button>
            <Button className="ts-btn ts-btn-outline" size="lg" onClick={() => navigate("/browse")}>See tools near you</Button>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="ts-footer">
        <Container>
          <Row>
            <Col lg={4} className="mb-4">
              <div className="d-flex align-items-center mb-3">
                <div className="ts-brand-square"><FaWrench /></div>
                <span className="ts-brand-text" style={{color:"var(--ts-white)"}}>ToolShare</span>
              </div>
              <p style={{color:"var(--ts-text-muted)",fontSize:"0.9rem"}}>Borrow tools from neighbours. Save money, reduce waste, build community.</p>
            </Col>
            <Col lg={4} className="mb-4">
              <h5>Product</h5>
              <ul className="list-unstyled">
                <li><a href="#">How it works</a></li>
                <li><a href="#">Browse tools</a></li>
                <li><a href="#">List a tool</a></li>
                <li><a href="#">Pricing</a></li>
              </ul>
            </Col>
            <Col lg={4} className="mb-4">
              <h5>Community</h5>
              <ul className="list-unstyled">
                <li><a href="#">Trust & Safety</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Help Centre</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </Col>
          </Row>
          <div className="ts-footer-bottom">
            <span>© 2026 ToolShare India. All rights reserved.</span>
            <span>
              <a href="#" className="me-3">Terms</a>
              <a href="#">Privacy</a>
            </span>
          </div>
        </Container>
      </footer>
    </>
  );
};

export default LandingPage;
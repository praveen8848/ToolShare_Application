import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { 
  FaWrench, FaSearch, FaCalendarAlt, FaHandshake, 
  FaMapMarkerAlt, FaStar, FaCheck, FaArrowRight 
} from "react-icons/fa";

/* ----------------------------- Data ----------------------------- */
const categories = [
  "Power drills", "Circular saws", "Pressure washers", "Ladders", "Sanders",
  "Hedge trimmers", "Tile cutters", "Air compressors", "Welders", "Carpet cleaners",
  "Wheelbarrows", "Nail guns", "Wood routers", "Lawn aerators", "Paint sprayers",
];

const steps = [
  { Icon: FaSearch, label: "01", title: "Find what you need", body: "Search by tool, category, or just browse what neighbours are sharing in your city." },
  { Icon: FaCalendarAlt, label: "02", title: "Book by the day", body: "Pick your dates, pay securely. Trust scores and ID checks keep the community safe." },
  { Icon: FaHandshake, label: "03", title: "Pickup, build, return", body: "Meet your neighbour, get the tool, finish the job. Return it and rate the swap." },
];

const tools = [
  { name: "DeWalt 20V Cordless Drill", owner: "Praveen · 1.2 km", price: 150, rating: 4.9, tag: "Power", emoji: "🪛" },
  { name: 'Bosch Circular Saw 7¼"', owner: "Akash · 3.5 km", price: 300, rating: 5.0, tag: "Cutting", emoji: "🪚" },
  { name: "Karcher Pressure Washer", owner: "Rohan · 4.1 km", price: 500, rating: 4.8, tag: "Outdoor", emoji: "💦" },
  { name: "8-ft A-Frame Ladder", owner: "Neha · 2.5 km", price: 100, rating: 4.9, tag: "Access", emoji: "🪜" },
  { name: "Random Orbital Sander", owner: "Vikram · 1.8 km", price: 200, rating: 4.7, tag: "Finishing", emoji: "🌀" },
  { name: 'Tile Wet Saw 10"', owner: "Aarti · 5.4 km", price: 600, rating: 5.0, tag: "Pro", emoji: "🧱" },
];

const perks = [
  "Set your own daily price & availability",
  "Build trust in your local community",
  "Verified neighbour profiles & trust scores",
  "Keep 100% of your earnings",
];

const stats = [
  { value: "12.4k", label: "Active members" },
  { value: "38k", label: "Tools shared" },
  { value: "45+", label: "Indian Cities" },
  { value: "4.9★", label: "Average rating" },
];

const testimonials = [
  { quote: "I was about to drop ₹8,000 on a tile saw for one bathroom. Rented it from three streets over for ₹600. Met a great guy too.", name: "Rahul S.", role: "Borrower · Mumbai" },
  { quote: "My pressure washer used to live in the shed eleven months a year. Now it pays for itself every spring.", name: "Priya M.", role: "Lender · Delhi" },
  { quote: "It's not really about the tools. It's about knowing the people in your society again.", name: "Amit P.", role: "Lender · Bangalore" },
];

/* ----------------------------- Page Component ----------------------------- */
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">
      <style>{`
        .landing-wrapper {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          color: #f8fafc;
          overflow-x: hidden;
        }

        .gradient-text {
          background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .btn-custom-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
          border: none;
          border-radius: 50px;
          padding: 12px 28px;
          color: white;
          font-weight: 600;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-custom-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
          color: white;
        }

        .btn-custom-outline {
          background: transparent;
          border: 1px solid #334155;
          border-radius: 50px;
          padding: 12px 28px;
          color: white;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .btn-custom-outline:hover {
          border-color: #60a5fa;
          background: rgba(59, 130, 246, 0.1);
          color: white;
        }

        .floating-card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 16px;
          padding: 1rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          position: absolute;
          z-index: 10;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float 6s ease-in-out 1.5s infinite; }

        .marquee-container {
          background: #1e293b;
          border-top: 1px solid #334155;
          border-bottom: 1px solid #334155;
          padding: 1.5rem 0;
          overflow: hidden;
          white-space: nowrap;
        }
        .marquee-content {
          display: inline-block;
          animation: marquee 40s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .feature-card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 24px;
          padding: 2rem;
          height: 100%;
          transition: all 0.4s ease;
        }
        .feature-card:hover {
          transform: translateY(-5px);
          border-color: #60a5fa;
          box-shadow: 0 12px 32px rgba(59, 130, 246, 0.15);
        }

        .tool-card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.4s ease;
        }
        .tool-card:hover {
          transform: translateY(-5px);
          border-color: #60a5fa;
          box-shadow: 0 12px 32px rgba(59, 130, 246, 0.15);
        }

        .section-padding {
          padding: 100px 0;
        }
      `}</style>

      {/* NAVBAR */}
      <div className="d-flex justify-content-between align-items-center py-4 px-4 px-md-5 w-100 position-absolute" style={{ zIndex: 100, top: 0 }}>
        <div className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ background: '#3b82f6', color: 'white', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaWrench size={18} />
          </div>
          <h4 className="mb-0 fw-bold text-white">ToolShare</h4>
        </div>
        <div className="d-none d-md-flex gap-4" style={{ fontWeight: 500 }}>
          <a href="#how" style={{ color: '#94a3b8', textDecoration: 'none' }}>How it works</a>
          <Link to="/browse" style={{ color: '#94a3b8', textDecoration: 'none' }}>Browse Tools</Link>
          <a href="#community" style={{ color: '#94a3b8', textDecoration: 'none' }}>Community</a>
        </div>
        <div className="d-flex gap-3">
          <button className="btn-custom-outline d-none d-sm-block" onClick={() => navigate('/login')}>Sign in</button>
          <button className="btn-custom-primary" onClick={() => navigate('/register')}>Join free</button>
        </div>
      </div>

      {/* HERO SECTION */}
      <Container className="position-relative" style={{ paddingTop: '160px', paddingBottom: '100px' }}>
        <Row className="align-items-center g-5">
          <Col lg={7}>
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1 mb-4 rounded-pill" style={{ border: '1px solid #334155', background: 'rgba(30, 41, 59, 0.7)', fontSize: '0.85rem', color: '#94a3b8' }}>
              <span style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></span>
              Now serving 45+ Indian Cities
            </div>
            
            <h1 className="fw-bolder mb-4" style={{ fontSize: 'clamp(3rem, 5vw, 5rem)', lineHeight: 1.1 }}>
              Borrow the tool.<br/>
              <span className="gradient-text font-italic">Skip</span> the hardware store.
            </h1>
            
            <p className="mb-5" style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '600px', lineHeight: 1.6 }}>
              ToolShare is India's community rental marketplace. Rent a drill from down the street, lend out the saw collecting dust in your garage — and earn while you help your neighbours build.
            </p>
            
            <div className="d-flex flex-wrap gap-3 mb-5">
              <button className="btn-custom-primary" onClick={() => navigate('/browse')}>
                Find a tool near you <FaArrowRight size={14} />
              </button>
              <button className="btn-custom-outline" onClick={() => navigate('/add-tool')}>
                List your gear
              </button>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center">
                <FaStar color="#fbbf24" size={20} className="me-2" />
                <span className="fw-bold fs-5 text-white">4.9</span>
              </div>
              <span style={{ color: '#64748b' }}>|</span>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loved by 5,000+ members</span>
            </div>
          </Col>

          <Col lg={5} className="d-none d-lg-block position-relative">
            <div style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
              borderRadius: '2rem',
              border: '1px solid #334155',
              aspectRatio: '4/5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
              🛠️
            </div>
            
            <div className="floating-card animate-float" style={{ top: '10%', left: '-10%', width: '220px' }}>
              <div className="d-flex gap-3 align-items-center">
                <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '12px', borderRadius: '12px', color: '#60a5fa' }}>
                  <FaMapMarkerAlt size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Pickup nearby</div>
                  <div className="text-white" style={{ fontWeight: 'bold' }}>2.4 km away</div>
                </div>
              </div>
            </div>

            <div className="floating-card animate-float-delayed" style={{ bottom: '15%', right: '-10%', width: '240px' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Cordless drill · DeWalt</div>
              <div className="mt-1 d-flex align-items-baseline gap-1">
                <h3 className="mb-0 fw-bold" style={{ color: '#60a5fa' }}>₹150</h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/ day</span>
              </div>
              <div style={{ height: '6px', background: '#334155', borderRadius: '10px', marginTop: '12px' }}>
                <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', borderRadius: '10px' }}></div>
              </div>
              <p className="mb-0 mt-2" style={{ fontSize: '0.7rem', color: '#64748b' }}>3 of 4 days booked this week</p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* MARQUEE */}
      <div className="marquee-container">
        <div className="marquee-content">
          {[...categories, ...categories].map((cat, i) => (
            <span key={i} className="mx-4 text-white opacity-75 fw-bold" style={{ fontSize: '1.5rem' }}>
              {cat} <span style={{ color: '#3b82f6', margin: '0 15px' }}>•</span>
            </span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <Container id="how" className="section-padding">
        <div className="text-center text-md-start mb-5">
          <p className="mb-2 fw-bold text-uppercase" style={{ color: '#60a5fa', letterSpacing: '2px', fontSize: '0.85rem' }}>How it works</p>
          <h2 className="fw-bolder" style={{ fontSize: '2.5rem' }}>
            Three steps from <span className="gradient-text font-italic">"I need it"</span> to "it's done."
          </h2>
        </div>

        <Row className="g-4">
          {steps.map(s => (
            <Col md={4} key={s.label}>
              <div className="feature-card">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 style={{ color: 'rgba(255,255,255,0.1)', fontSize: '3.5rem', margin: 0, fontWeight: 800 }}>{s.label}</h2>
                  <div style={{ background: '#334155', padding: '16px', borderRadius: '16px', color: '#60a5fa' }}>
                    <s.Icon size={24} />
                  </div>
                </div>
                <h4 className="fw-bold text-white mb-3">{s.title}</h4>
                <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>{s.body}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      {/* FEATURED TOOLS */}
      <div style={{ background: 'rgba(51, 65, 85, 0.3)' }} className="section-padding" id="browse">
        <Container>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5">
            <div>
              <p className="mb-2 fw-bold text-uppercase" style={{ color: '#60a5fa', letterSpacing: '2px', fontSize: '0.85rem' }}>Trending nearby</p>
              <h2 className="fw-bolder mb-0" style={{ fontSize: '2.5rem' }}>Real tools, from real neighbours.</h2>
            </div>
            <button className="btn-custom-outline mt-4 mt-md-0" onClick={() => navigate('/browse')}>See all listings</button>
          </div>

          <Row className="g-4">
            {tools.map(t => (
              <Col md={6} lg={4} key={t.name}>
                <div className="tool-card h-100">
                  <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', position: 'relative' }}>
                    {t.emoji}
                    <Badge bg="primary" style={{ position: 'absolute', top: '15px', left: '15px', padding: '6px 12px' }}>{t.tag}</Badge>
                    <Badge bg="dark" style={{ position: 'absolute', top: '15px', right: '15px', padding: '6px 12px', border: '1px solid #334155' }}>
                      <FaStar color="#fbbf24" className="me-1" /> {t.rating}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h5 className="fw-bold text-white mb-2">{t.name}</h5>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FaMapMarkerAlt /> {t.owner}
                    </div>
                    <div className="d-flex justify-content-between align-items-end mt-4 pt-3" style={{ borderTop: '1px solid #334155' }}>
                      <div>
                        <h3 className="mb-0 fw-bold" style={{ color: '#60a5fa' }}>₹{t.price}</h3>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/ day</span>
                      </div>
                      <button className="btn-custom-primary py-2 px-4" onClick={() => navigate('/browse')}>Book</button>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* EARN SECTION */}
      <Container id="earn" className="section-padding">
        <div style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', borderRadius: '2.5rem', border: '1px solid #334155', padding: '4rem 3rem' }}>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <p className="mb-2 fw-bold text-uppercase" style={{ color: '#60a5fa', letterSpacing: '2px', fontSize: '0.85rem' }}>Lend & earn</p>
              <h2 className="fw-bolder mb-4 text-white" style={{ fontSize: '3rem', lineHeight: 1.1 }}>
                Your garage is a <span className="gradient-text font-italic">side hustle</span> waiting to happen.
              </h2>
              <p style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: 1.6 }}>
                The average ToolShare lender earns <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>₹15,000 a month</span> renting out tools they already own — and meets half the block doing it.
              </p>
              <button className="btn-custom-primary mt-4" onClick={() => navigate('/register')}>
                Start lending today <FaArrowRight size={14} />
              </button>
            </Col>
            <Col lg={6}>
              <div className="d-flex flex-column gap-3">
                {perks.map(p => (
                  <div key={p} className="d-flex align-items-center gap-3 p-4" style={{ background: 'rgba(51, 65, 85, 0.3)', border: '1px solid #334155', borderRadius: '16px' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '10px', borderRadius: '50%', color: '#60a5fa' }}>
                      <FaCheck size={16} />
                    </div>
                    <span className="text-white fw-medium">{p}</span>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </div>
      </Container>

      {/* COMMUNITY */}
      <div style={{ background: 'rgba(51, 65, 85, 0.3)' }} className="section-padding" id="community">
        <Container>
          <Row className="g-4 mb-5 pb-5">
            {stats.map(s => (
              <Col md={3} key={s.label}>
                <div style={{ borderLeft: '2px solid #3b82f6', paddingLeft: '20px' }}>
                  <h2 className="fw-bolder mb-1" style={{ color: '#60a5fa', fontSize: '3rem' }}>{s.value}</h2>
                  <p className="text-uppercase mb-0" style={{ color: '#94a3b8', fontSize: '0.8rem', letterSpacing: '1px' }}>{s.label}</p>
                </div>
              </Col>
            ))}
          </Row>

          <div className="mb-5">
            <p className="mb-2 fw-bold text-uppercase" style={{ color: '#60a5fa', letterSpacing: '2px', fontSize: '0.85rem' }}>Community voices</p>
            <h2 className="fw-bolder text-white" style={{ fontSize: '2.5rem' }}>Built on trust, one borrowed drill at a time.</h2>
          </div>

          <Row className="g-4">
            {testimonials.map((t, i) => (
              <Col md={4} key={t.name}>
                <Card className="feature-card h-100" style={{ transform: i === 1 ? 'translateY(20px)' : 'none' }}>
                  <Card.Body className="p-4 d-flex flex-column">
                    <div style={{ color: '#60a5fa', fontSize: '4rem', lineHeight: 0.5, marginBottom: '20px' }}>"</div>
                    <p className="font-italic text-white mb-4" style={{ fontSize: '1.1rem', flex: 1 }}>"{t.quote}"</p>
                    <div className="pt-4" style={{ borderTop: '1px solid #334155' }}>
                      <p className="fw-bold mb-1" style={{ color: '#60a5fa' }}>{t.name}</p>
                      <p className="mb-0" style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{t.role}</p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* CTA */}
      <Container className="text-center section-padding">
        <h2 className="fw-bolder text-white mb-4" style={{ fontSize: 'clamp(2.5rem, 4vw, 4.5rem)' }}>
          Less stuff. More <span className="gradient-text font-italic">building.</span>
        </h2>
        <p className="mx-auto mb-5" style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px' }}>
          Join your local tool library — and turn the gear in your garage into something useful again.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <button className="btn-custom-primary" onClick={() => navigate('/browse')}>
            Find tools nearby <FaArrowRight size={14} />
          </button>
          <button className="btn-custom-outline" onClick={() => navigate('/add-tool')}>List your first tool</button>
        </div>
        <p className="mt-4" style={{ color: '#64748b', fontSize: '0.85rem' }}>Free to join · No fees until you earn</p>
      </Container>

      {/* FOOTER */}
      <footer style={{ background: '#0f172a', borderTop: '1px solid #334155', padding: '60px 0 30px' }}>
        <Container>
          <Row className="g-5 mb-5">
            <Col lg={6}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <div style={{ background: '#3b82f6', color: 'white', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaWrench size={16} />
                </div>
                <h5 className="mb-0 fw-bold text-white">ToolShare</h5>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '300px' }}>
                The neighbourhood rental marketplace for India. Made for builders, fixers, and good neighbours.
              </p>
            </Col>
            <Col lg={3} md={6}>
              <p className="fw-bold mb-3" style={{ color: '#60a5fa' }}>Product</p>
              <ul className="list-unstyled" style={{ gap: '10px', display: 'flex', flexDirection: 'column' }}>
                <li><Link to="/browse" style={{ color: '#94a3b8', textDecoration: 'none' }}>Browse tools</Link></li>
                <li><Link to="/add-tool" style={{ color: '#94a3b8', textDecoration: 'none' }}>List a tool</Link></li>
                <li><a href="#how" style={{ color: '#94a3b8', textDecoration: 'none' }}>How it works</a></li>
              </ul>
            </Col>
            <Col lg={3} md={6}>
              <p className="fw-bold mb-3" style={{ color: '#60a5fa' }}>Community</p>
              <ul className="list-unstyled" style={{ gap: '10px', display: 'flex', flexDirection: 'column' }}>
                <li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Trust & safety</a></li>
                <li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Help center</a></li>
                <li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Guidelines</a></li>
              </ul>
            </Col>
          </Row>
          <div className="d-flex flex-column flex-md-row justify-content-between pt-4" style={{ borderTop: '1px solid #334155', color: '#64748b', fontSize: '0.85rem' }}>
            <p>© {new Date().getFullYear()} ToolShare. Built for the block.</p>
            <div className="d-flex gap-4">
              <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Terms</a>
              <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy</a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;
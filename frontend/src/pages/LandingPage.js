import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Navbar, Nav } from "react-bootstrap";
import {
  FaWrench, FaSearch, FaCalendarAlt, FaHandshake,
  FaMapMarkerAlt, FaStar, FaCheck, FaArrowRight,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

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

/* ----------------------------- Styles ----------------------------- */
const Styles = () => (
  <style>{`
    .ts-page { background:#ffffff; color:#0f172a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    .ts-page p { color:#475569; }
    .ts-muted { color:#64748b; }
    .ts-accent { color:#2563eb; }

    .ts-nav { background:rgba(255,255,255,0.85); backdrop-filter:saturate(180%) blur(12px); border-bottom:1px solid #e2e8f0; position:fixed; top:0; left:0; right:0; z-index:1030; }
    .ts-brand { display:flex; align-items:center; gap:.6rem; cursor:pointer; font-weight:700; font-size:1.25rem; color:#0f172a; }
    .ts-brand-mark { width:36px; height:36px; border-radius:10px; background:#2563eb; color:white; display:inline-flex; align-items:center; justify-content:center; }
    .ts-nav a.nav-link { color:#475569; font-weight:500; }
    .ts-nav a.nav-link:hover { color:#0f172a; }

    .ts-btn-primary { background:#2563eb; border:none; border-radius:999px; padding:.7rem 1.4rem; font-weight:600; }
    .ts-btn-primary:hover { background:#1d4ed8; }
    .ts-btn-outline { background:transparent; border:1px solid #cbd5e1; color:#0f172a; border-radius:999px; padding:.7rem 1.4rem; font-weight:600; }
    .ts-btn-outline:hover { background:#f1f5f9; border-color:#94a3b8; color:#0f172a; }
    .ts-btn-ghost { background:transparent; border:none; color:#475569; font-weight:500; }
    .ts-btn-ghost:hover { color:#0f172a; background:#f1f5f9; }

    .ts-section { padding: 96px 0; }
    .ts-hero { padding: 160px 0 96px; background: radial-gradient(1000px 500px at 80% -10%, #dbeafe 0%, transparent 60%), #ffffff; }
    .ts-eyebrow { display:inline-flex; align-items:center; gap:.5rem; background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; padding:.35rem .8rem; border-radius:999px; font-size:.8rem; font-weight:600; }
    .ts-h1 { font-size: clamp(2.4rem, 5vw, 3.75rem); font-weight:800; letter-spacing:-0.02em; line-height:1.05; color:#0f172a; }
    .ts-h2 { font-size: clamp(1.75rem, 3.5vw, 2.5rem); font-weight:800; letter-spacing:-0.02em; color:#0f172a; }
    .ts-lead { font-size:1.125rem; color:#475569; line-height:1.65; }

    .ts-hero-card { background:#fff; border:1px solid #e2e8f0; border-radius:24px; box-shadow: 0 30px 60px -30px rgba(15,23,42,.18), 0 12px 24px -12px rgba(15,23,42,.08); padding:1.25rem; }
    .ts-hero-img { aspect-ratio: 4/3; background: linear-gradient(135deg,#f1f5f9,#e0e7ff); border-radius:18px; display:flex; align-items:center; justify-content:center; font-size:6rem; }
    .ts-pill { background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:.85rem 1rem; display:flex; align-items:center; gap:.75rem; }
    .ts-pill-icon { width:36px; height:36px; border-radius:10px; background:#dbeafe; color:#1d4ed8; display:inline-flex; align-items:center; justify-content:center; }
    .ts-progress { height:6px; background:#e2e8f0; border-radius:99px; overflow:hidden; }
    .ts-progress > span { display:block; height:100%; width:75%; background:#2563eb; border-radius:99px; }

    .ts-marquee { background:#0f172a; color:#cbd5e1; overflow:hidden; padding:1.25rem 0; }
    .ts-marquee-track { display:inline-block; white-space:nowrap; animation: ts-scroll 40s linear infinite; }
    .ts-marquee-track span { margin: 0 1.5rem; font-weight:600; font-size:1rem; }
    .ts-marquee-track .dot { color:#2563eb; }
    @keyframes ts-scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

    .ts-card { background:#fff; border:1px solid #e2e8f0; border-radius:20px; padding:2rem; height:100%; transition:all .25s ease; }
    .ts-card:hover { transform:translateY(-4px); border-color:#bfdbfe; box-shadow:0 20px 40px -20px rgba(37,99,235,.18); }
    .ts-step-num { font-size:2.25rem; font-weight:800; color:#cbd5e1; }
    .ts-step-icon { width:44px; height:44px; border-radius:12px; background:#eff6ff; color:#2563eb; display:inline-flex; align-items:center; justify-content:center; }

    .ts-tool { background:#fff; border:1px solid #e2e8f0; border-radius:20px; overflow:hidden; transition:all .25s ease; height:100%; }
    .ts-tool:hover { transform:translateY(-4px); box-shadow:0 20px 40px -20px rgba(15,23,42,.15); border-color:#bfdbfe; }
    .ts-tool-img { aspect-ratio: 5/4; background: linear-gradient(135deg,#f8fafc,#eef2ff); display:flex; align-items:center; justify-content:center; font-size:4.5rem; position:relative; }
    .ts-tag { position:absolute; top:14px; left:14px; background:#fff; border:1px solid #e2e8f0; border-radius:999px; padding:.25rem .65rem; font-size:.75rem; font-weight:600; color:#0f172a; }
    .ts-rating { position:absolute; top:14px; right:14px; background:#fff; border:1px solid #e2e8f0; border-radius:999px; padding:.25rem .55rem; font-size:.75rem; font-weight:600; display:inline-flex; align-items:center; gap:.25rem; color:#0f172a; }

    .ts-earn { background: linear-gradient(135deg,#0f172a 0%, #1e293b 100%); color:#e2e8f0; border-radius:32px; padding: 4rem; }
    .ts-earn h2 { color:#fff; }
    .ts-earn p { color:#cbd5e1; }
    .ts-perk { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:14px; padding:1rem 1.1rem; display:flex; align-items:flex-start; gap:.85rem; color:#e2e8f0; }
    .ts-perk-check { width:28px; height:28px; border-radius:999px; background:#2563eb; color:#fff; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; }

    .ts-stat { border-left:3px solid #2563eb; padding-left:1rem; }
    .ts-stat-val { font-size:2.5rem; font-weight:800; color:#0f172a; letter-spacing:-0.02em; }
    .ts-stat-lbl { color:#64748b; font-size:.8rem; text-transform:uppercase; letter-spacing:.1em; font-weight:600; }

    .ts-quote { background:#fff; border:1px solid #e2e8f0; border-radius:20px; padding:2rem; height:100%; }
    .ts-quote-mark { font-size:3rem; line-height:1; color:#2563eb; font-weight:800; }

    .ts-cta { background: linear-gradient(180deg,#f8fafc 0%,#ffffff 100%); }

    .ts-footer { background:#0f172a; color:#cbd5e1; padding: 64px 0 32px; }
    .ts-footer h6 { color:#fff; font-weight:600; margin-bottom:1rem; }
    .ts-footer a { color:#94a3b8; text-decoration:none; display:block; padding:.25rem 0; }
    .ts-footer a:hover { color:#fff; }
    .ts-footer-bottom { border-top:1px solid #1e293b; padding-top:1.5rem; margin-top:3rem; color:#64748b; font-size:.85rem; }

    @media (max-width: 768px) {
      .ts-section { padding: 64px 0; }
      .ts-hero { padding: 130px 0 64px; }
      .ts-earn { padding: 2.5rem 1.5rem; border-radius:24px; }
    }
  `}</style>
);

/* ----------------------------- Page ----------------------------- */
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="ts-page">
      <Styles />

      {/* NAVBAR */}
      <Navbar expand="lg" className="ts-nav">
        <Container>
          <Navbar.Brand onClick={() => navigate("/")} className="p-0">
            <span className="ts-brand">
              <span className="ts-brand-mark"><FaWrench size={16} /></span>
              ToolShare
            </span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="ts-nav" />
          <Navbar.Collapse id="ts-nav">
            <Nav className="mx-auto gap-lg-3">
              <Nav.Link href="#how">How it works</Nav.Link>
              <Nav.Link href="#browse">Browse Tools</Nav.Link>
              <Nav.Link href="#community">Community</Nav.Link>
            </Nav>
            <div className="d-flex gap-2">
              <Button className="ts-btn-ghost" onClick={() => navigate("/login")}>Sign in</Button>
              <Button className="ts-btn-primary" onClick={() => navigate("/register")}>Join free</Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* HERO */}
      <section className="ts-hero">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <span className="ts-eyebrow">
                <span style={{ width: 6, height: 6, borderRadius: 99, background: "#2563eb" }} />
                Now serving 45+ Indian Cities
              </span>
              <h1 className="ts-h1 mt-4">
                Borrow the tool. <br />
                <span className="ts-accent">Skip the hardware store.</span>
              </h1>
              <p className="ts-lead mt-3" style={{ maxWidth: 540 }}>
                ToolShare is India's community rental marketplace. Rent a drill from down the street, lend out the saw collecting dust in your garage — and earn while you help your neighbours build.
              </p>
              <div className="d-flex flex-wrap gap-2 mt-4">
                <Button className="ts-btn-primary" onClick={() => navigate("/browse")}>
                  Find a tool near you <FaArrowRight className="ms-2" size={12} />
                </Button>
                <Button className="ts-btn-outline" onClick={() => navigate("/add-tool")}>
                  List your gear
                </Button>
              </div>
              <div className="d-flex align-items-center gap-3 mt-4 ts-muted" style={{ fontSize: ".9rem" }}>
                <span className="d-inline-flex align-items-center gap-1">
                  <FaStar style={{ color: "#f59e0b" }} /> <strong style={{ color: "#0f172a" }}>4.9</strong>
                </span>
                <span>|</span>
                <span>Loved by 5,000+ members</span>
              </div>
            </Col>

            <Col lg={6}>
              <div className="ts-hero-card">
                <div className="ts-hero-img">🛠️</div>
                <div className="ts-pill mt-3">
                  <span className="ts-pill-icon"><FaMapMarkerAlt size={14} /></span>
                  <div>
                    <div style={{ fontWeight: 600, color: "#0f172a" }}>Pickup nearby</div>
                    <div className="ts-muted" style={{ fontSize: ".85rem" }}>2.4 km away</div>
                  </div>
                </div>
                <div className="mt-3 px-1">
                  <div className="ts-muted" style={{ fontSize: ".8rem" }}>Cordless drill · DeWalt</div>
                  <div className="d-flex align-items-baseline gap-1 mt-1">
                    <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a" }}>₹150</span>
                    <span className="ts-muted">/ day</span>
                  </div>
                  <div className="ts-progress mt-2"><span /></div>
                  <div className="ts-muted mt-2" style={{ fontSize: ".8rem" }}>3 of 4 days booked this week</div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* MARQUEE */}
      <div className="ts-marquee">
        <div className="ts-marquee-track">
          {[...categories, ...categories].map((cat, i) => (
            <span key={i}>{cat} <span className="dot">•</span></span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="ts-section" id="how">
        <Container>
          <div className="text-center mb-5" style={{ maxWidth: 680, margin: "0 auto" }}>
            <span className="ts-eyebrow">How it works</span>
            <h2 className="ts-h2 mt-3">Three steps from "I need it" to "it's done."</h2>
          </div>
          <Row className="g-4">
            {steps.map((s) => (
              <Col md={4} key={s.label}>
                <div className="ts-card">
                  <div className="d-flex justify-content-between align-items-start">
                    <span className="ts-step-num">{s.label}</span>
                    <span className="ts-step-icon"><s.Icon size={18} /></span>
                  </div>
                  <h5 className="mt-4 mb-2" style={{ fontWeight: 700, color: "#0f172a" }}>{s.title}</h5>
                  <p className="mb-0">{s.body}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* FEATURED TOOLS */}
      <section className="ts-section" id="browse" style={{ background: "#f8fafc" }}>
        <Container>
          <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-5">
            <div>
              <span className="ts-eyebrow">Trending nearby</span>
              <h2 className="ts-h2 mt-3 mb-0">Real tools, from real neighbours.</h2>
            </div>
            <Button className="ts-btn-outline" onClick={() => navigate("/browse")}>See all listings</Button>
          </div>
          <Row className="g-4">
            {tools.map((t) => (
              <Col md={6} lg={4} key={t.name}>
                <div className="ts-tool">
                  <div className="ts-tool-img">
                    <span>{t.emoji}</span>
                    <span className="ts-tag">{t.tag}</span>
                    <span className="ts-rating"><FaStar style={{ color: "#f59e0b" }} size={11} /> {t.rating}</span>
                  </div>
                  <div className="p-4">
                    <h6 style={{ fontWeight: 700, color: "#0f172a" }}>{t.name}</h6>
                    <div className="ts-muted d-flex align-items-center gap-1" style={{ fontSize: ".85rem" }}>
                      <FaMapMarkerAlt size={11} /> {t.owner}
                    </div>
                    <div className="d-flex align-items-center justify-content-between mt-3">
                      <div>
                        <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>₹{t.price}</span>
                        <span className="ts-muted"> / day</span>
                      </div>
                      <Button size="sm" className="ts-btn-primary" onClick={() => navigate("/browse")}>Book</Button>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* EARN */}
      <section className="ts-section">
        <Container>
          <div className="ts-earn">
            <Row className="align-items-center g-5">
              <Col lg={6}>
                <span className="ts-eyebrow" style={{ background: "rgba(37,99,235,.15)", borderColor: "rgba(37,99,235,.3)", color: "#93c5fd" }}>Lend & earn</span>
                <h2 className="ts-h2 mt-3">Your garage is a side hustle waiting to happen.</h2>
                <p className="mt-3" style={{ fontSize: "1.05rem" }}>
                  The average ToolShare lender earns <strong style={{ color: "#fff" }}>₹15,000 a month</strong> renting out tools they already own — and meets half the block doing it.
                </p>
                <Button className="ts-btn-primary mt-3" onClick={() => navigate("/register")}>
                  Start lending today <FaArrowRight className="ms-2" size={12} />
                </Button>
              </Col>
              <Col lg={6}>
                <div className="d-flex flex-column gap-3">
                  {perks.map((p) => (
                    <div key={p} className="ts-perk">
                      <span className="ts-perk-check"><FaCheck size={12} /></span>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
          </div>
        </Container>
      </section>

      {/* COMMUNITY */}
      <section className="ts-section" id="community" style={{ background: "#f8fafc" }}>
        <Container>
          <Row className="g-4 mb-5">
            {stats.map((s) => (
              <Col xs={6} md={3} key={s.label}>
                <div className="ts-stat">
                  <div className="ts-stat-val">{s.value}</div>
                  <div className="ts-stat-lbl mt-1">{s.label}</div>
                </div>
              </Col>
            ))}
          </Row>

          <div style={{ maxWidth: 640 }} className="mb-5">
            <span className="ts-eyebrow">Community voices</span>
            <h2 className="ts-h2 mt-3">Built on trust, one borrowed drill at a time.</h2>
          </div>

          <Row className="g-4">
            {testimonials.map((t) => (
              <Col md={4} key={t.name}>
                <div className="ts-quote">
                  <div className="ts-quote-mark">"</div>
                  <p className="mt-2" style={{ fontSize: "1rem", color: "#0f172a", lineHeight: 1.55 }}>{t.quote}</p>
                  <div className="pt-3 mt-3" style={{ borderTop: "1px solid #e2e8f0" }}>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{t.name}</div>
                    <div className="ts-muted" style={{ fontSize: ".85rem" }}>{t.role}</div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA */}
      <section className="ts-section ts-cta text-center">
        <Container style={{ maxWidth: 760 }}>
          <h2 className="ts-h2">Less stuff. <span className="ts-accent">More building.</span></h2>
          <p className="ts-lead mt-3">
            Join your local tool library — and turn the gear in your garage into something useful again.
          </p>
          <div className="d-flex flex-wrap gap-2 justify-content-center mt-4">
            <Button className="ts-btn-primary" onClick={() => navigate("/browse")}>
              Find tools nearby <FaArrowRight className="ms-2" size={12} />
            </Button>
            <Button className="ts-btn-outline" onClick={() => navigate("/add-tool")}>List your first tool</Button>
          </div>
          <div className="ts-muted mt-3" style={{ fontSize: ".85rem" }}>Free to join · No fees until you earn</div>
        </Container>
      </section>

      {/* FOOTER */}
      <footer className="ts-footer">
        <Container>
          <Row className="g-4">
            <Col md={5}>
              <div className="ts-brand" style={{ color: "#fff" }}>
                <span className="ts-brand-mark"><FaWrench size={16} /></span>
                ToolShare
              </div>
              <p className="mt-3" style={{ color: "#94a3b8", maxWidth: 360 }}>
                The neighbourhood rental marketplace for India. Made for builders, fixers, and good neighbours.
              </p>
            </Col>
            <Col xs={6} md={3}>
              <h6>Product</h6>
              <a href="#browse">Browse tools</a>
              <a href="#">List a tool</a>
              <a href="#how">How it works</a>
            </Col>
            <Col xs={6} md={4}>
              <h6>Community</h6>
              <a href="#">Trust & safety</a>
              <a href="#">Help center</a>
              <a href="#">Guidelines</a>
            </Col>
          </Row>
          <div className="ts-footer-bottom d-flex flex-wrap justify-content-between gap-2">
            <span>© {new Date().getFullYear()} ToolShare. Built for the block.</span>
            <div className="d-flex gap-3">
              <a href="#" style={{ display: "inline" }}>Terms</a>
              <a href="#" style={{ display: "inline" }}>Privacy</a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;

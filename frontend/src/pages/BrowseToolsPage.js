import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { 
  FaMapMarkerAlt, 
  FaGlobe, 
  FaTimesCircle, 
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaRupeeSign,
  FaStar,
  FaTools,
  FaCompass
} from 'react-icons/fa';
import { useTools } from '../hooks/useTools';
import ToolGrid from '../components/tools/ToolGrid';
import SearchFilters from '../components/tools/SearchFilters';

const BrowseToolsPage = () => {
  const {
    tools,
    loading,
    filters,
    updateFilters,
    resetFilters,
  } = useTools();

  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [stats, setStats] = useState({ total: 0, nearby: 0 });

  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          handleGetLocation();
        }
      });
    }
  }, []);

  useEffect(() => {
    if (tools) {
      const nearbyCount = filters.lat && filters.lng 
        ? tools.filter(t => t.distance <= (filters.radius || 25)).length 
        : 0;
      setStats({
        total: tools.length,
        nearby: nearbyCount
      });
    }
  }, [tools, filters]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateFilters({
          ...filters,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          radius: filters.radius || 10
        });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Location access denied. Please enable location permissions in your browser settings, or continue browsing all tools across India.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError("Location information is currently unavailable.");
        } else if (err.code === err.TIMEOUT) {
          setLocationError("The request to get user location timed out.");
        } else {
          setLocationError("An unknown error occurred while trying to find your location.");
        }
      },
      { timeout: 10000 }
    );
  };

  const handleClearLocation = () => {
    setLocationError(null);
    updateFilters({ 
      ...filters, 
      lat: null, 
      lng: null,
      radius: null 
    });
  };

  const handleRadiusChange = (e) => {
    updateFilters({ 
      ...filters, 
      radius: Number(e.target.value) 
    });
  };

  const handleReset = () => {
    resetFilters();
    setLocationError(null);
  };

  const isLocationActive = !!(filters.lat && filters.lng);

  return (
    <div className="browse-wrapper">
      <style>
        {`
          .browse-wrapper {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            min-height: 100vh;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #e2e8f0;
            padding-bottom: 3rem;
            padding-top: 76px; /* Fixed: Prevent navbar overlap */
          }
          
          .page-header {
            padding: 0 0 1.5rem;
            border-bottom: 1px solid #334155;
            margin-bottom: 2rem;
          }
          
          .gradient-text {
            background: linear-gradient(135deg, #60a5fa 0%, #34d399 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          /* Location Card - Compact & Professional */
          .location-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 20px;
            overflow: hidden;
            margin-bottom: 1.5rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
          }
          
          .location-card.active {
            border-color: #60a5fa;
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.1);
          }
          
          .location-card .card-body {
            padding: 1.5rem;
          }
          
          .location-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.25rem;
          }
          
          .location-icon {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          
          .location-icon.active {
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
            color: white;
          }
          
          .location-icon.inactive {
            background: linear-gradient(135deg, #475569 0%, #64748b 100%);
            color: white;
          }
          
          .location-title {
            font-weight: 700;
            font-size: 1.1rem;
            margin-bottom: 2px;
          }
          
          .location-subtitle {
            font-size: 0.85rem;
            margin-bottom: 0;
          }
          
          .stats-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 12px;
            color: #94a3b8;
            font-size: 0.9rem;
            margin-right: 0.75rem;
          }
          
          .btn-gradient-primary {
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            padding: 0.7rem 1.5rem;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
            font-size: 0.95rem;
          }
          
          .btn-gradient-primary:hover {
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
            color: white;
          }
          
          .btn-outline-secondary {
            background: transparent;
            color: #94a3b8;
            border: 1px solid #334155;
            border-radius: 12px;
            font-weight: 600;
            padding: 0.7rem 1.5rem;
            transition: all 0.3s ease;
            font-size: 0.95rem;
          }
          
          .btn-outline-secondary:hover {
            background: #1e293b;
            border-color: #60a5fa;
            color: #e2e8f0;
          }
          
          .form-select-dark {
            background: #0f172a;
            border: 1px solid #334155;
            color: #e2e8f0;
            border-radius: 12px;
            padding: 0.7rem 1rem;
            font-weight: 500;
            font-size: 0.95rem;
          }
          
          .form-select-dark:focus {
            border-color: #60a5fa;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
            background: #0f172a;
            color: #e2e8f0;
          }
          
          .form-select-dark:disabled {
            background: #1e293b;
            color: #64748b;
            opacity: 0.7;
          }
          
          .form-label-dark {
            color: #94a3b8;
            font-weight: 600;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 0.5rem;
          }
          
          .alert-warning-dark {
            background: rgba(245, 158, 11, 0.1);
            border: 1px solid rgba(245, 158, 11, 0.3);
            border-radius: 12px;
            color: #fbbf24;
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
          }
          
          /* Filter Section - Clean & Professional */
          .filter-section {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 20px;
            padding: 1.5rem;
            margin-bottom: 2rem;
          }
          
          .filter-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1.25rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #334155;
          }
          
          .filter-header h5 {
            margin: 0;
            color: #f1f5f9;
            font-weight: 700;
            font-size: 1rem;
          }
          
          .results-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.5rem;
          }
          
          .results-count {
            color: #f1f5f9;
            font-weight: 600;
            font-size: 1rem;
          }
          
          .results-count span {
            color: #60a5fa;
          }
          
          .tool-count-badge {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 20px;
            padding: 0.4rem 1rem;
            color: #60a5fa;
            font-weight: 500;
            font-size: 0.85rem;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .location-privacy-note {
            color: #64748b;
            font-size: 0.8rem;
            margin-top: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .footer-note {
            color: #64748b;
            font-size: 0.85rem;
            text-align: center;
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid #334155;
          }
          
          /* Responsive */
          @media (max-width: 768px) {
            .location-header {
              flex-direction: column;
              align-items: flex-start;
              text-align: left;
            }
          }
        `}
      </style>

      <Container className="py-4">
        
        {/* Page Header */}
        <div className="page-header">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="fw-extrabold mb-2" style={{ fontSize: '2.5rem' }}>
                <span className="gradient-text">Browse Tools</span>
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                Find the equipment you need from trusted neighbors across India
              </p>
            </div>
            <div className="d-flex gap-2">
              <div className="stats-badge">
                <FaTools size={14} />
                <span>{stats.total} Tools</span>
              </div>
              {isLocationActive && (
                <div className="stats-badge">
                  <FaMapMarkerAlt size={14} />
                  <span>{stats.nearby} Nearby</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Location Controls - Compact Layout */}
        <Card className={`location-card ${isLocationActive ? 'active' : ''}`}>
          <Card.Body>
            <div className="location-header">
              <div className={`location-icon ${isLocationActive ? 'active' : 'inactive'}`}>
                {isLocationActive ? <FaMapMarkerAlt size={20} /> : <FaGlobe size={20} />}
              </div>
              <div className="flex-grow-1">
                <div className="location-title" style={{ color: isLocationActive ? '#60a5fa' : '#94a3b8' }}>
                  {isLocationActive ? 'Local Search Active' : 'Browsing All India'}
                </div>
                <div className="location-subtitle" style={{ color: '#64748b' }}>
                  {isLocationActive 
                    ? `Showing tools within ${filters.radius || 10}km of your location` 
                    : 'Enable location to find tools near you'}
                </div>
              </div>
            </div>

            <Row className="align-items-end g-3">
              <Col md={4} lg={3}>
                <Form.Group>
                  <Form.Label className="form-label-dark">
                    <FaCompass className="me-1" size={10} />
                    Search Radius
                  </Form.Label>
                  <Form.Select
                    value={filters.radius || 10}
                    onChange={handleRadiusChange}
                    disabled={!isLocationActive}
                    className="form-select-dark"
                  >
                    <option value={5}>Within 5 km</option>
                    <option value={10}>Within 10 km</option>
                    <option value={15}>Within 15 km</option>
                    <option value={25}>Within 25 km</option>
                    <option value={50}>Within 50 km</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={8} lg={9}>
                <div className="d-flex gap-2">
                  <Button
                    className="btn-gradient-primary"
                    style={{ minWidth: '180px' }}
                    onClick={handleGetLocation}
                    disabled={locating}
                  >
                    {locating ? (
                      <><Spinner animation="border" size="sm" className="me-2" /> Locating...</>
                    ) : isLocationActive ? (
                      <><FaMapMarkerAlt className="me-2" /> Update Location</>
                    ) : (
                      <><FaMapMarkerAlt className="me-2" /> Find Tools Near Me</>
                    )}
                  </Button>

                  {isLocationActive && (
                    <Button 
                      className="btn-outline-secondary"
                      onClick={handleClearLocation}
                    >
                      <FaTimesCircle className="me-2" /> Clear
                    </Button>
                  )}
                </div>
              </Col>
            </Row>
            
            {locationError && (
              <Alert className="alert-warning-dark mt-3 mb-0 d-flex align-items-start">
                <FaExclamationTriangle className="me-2 mt-1 flex-shrink-0" />
                <div>{locationError}</div>
              </Alert>
            )}
            
            {isLocationActive && (
              <div className="location-privacy-note">
                <FaMapMarkerAlt size={12} />
                Your location is only used to show nearby tools. We never store your exact location.
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Filters Section - Clean & Professional */}
        <div className="filter-section">
          <div className="filter-header">
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <FaFilter size={14} />
            </div>
            <h5>Filter & Search</h5>
          </div>
          <SearchFilters
            filters={filters}
            onFilterChange={updateFilters}
            onReset={handleReset}
          />
        </div>
        
        {/* Results Header */}
        <div className="results-header">
          <div className="results-count">
            {loading ? (
              <Spinner animation="border" size="sm" style={{ color: '#60a5fa', marginRight: '8px' }} />
            ) : (
              <span>{tools.length}</span>
            )}
            {' '}tool{tools.length !== 1 ? 's' : ''} found
          </div>
          {!loading && tools.length > 0 && (
            <div className="tool-count-badge">
              <FaRupeeSign size={12} />
              <span>Starting from ₹100/day</span>
            </div>
          )}
        </div>
        
        {/* Tools Grid */}
        <ToolGrid 
          tools={tools} 
          loading={loading} 
          isOwnerView={false} 
          onReset={handleReset}
        />
        
        {/* Footer Note */}
        <div className="footer-note">
          <FaMapMarkerAlt className="me-1" size={12} />
          Available in Mumbai, Delhi, Bangalore, Chennai, Kolkata & 45+ Indian cities •
          <FaStar className="mx-2" size={12} color="#fbbf24" />
          Trusted by 5,000+ community members
        </div>

      </Container>
    </div>
  );
};

export default BrowseToolsPage;
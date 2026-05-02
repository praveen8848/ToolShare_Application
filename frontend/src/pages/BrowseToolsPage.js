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
            background: #121212;
            min-height: 100vh;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #E5E5E5;
            padding-bottom: 3rem;
            padding-top: 76px;
          }
          
          .page-header {
            padding: 0 0 1.25rem;
            border-bottom: 1px solid #2A2A2A;
            margin-bottom: 1.5rem;
          }
          
          .page-header h1 {
            color: #F5F5F5;
            font-weight: 700;
          }

          /* Location Card */
          .location-card {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            margin-bottom: 1.25rem;
          }
          
          .location-card.active {
            border-color: rgba(16, 185, 129, 0.3);
          }
          
          .location-card .card-body {
            padding: 1.25rem;
          }
          
          .location-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
          }
          
          .location-icon {
            width: 42px;
            height: 42px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          
          .location-icon.active {
            background: #10B981;
            color: #121212;
          }
          
          .location-icon.inactive {
            background: #2A2A2A;
            color: #737373;
          }
          
          .location-title {
            font-weight: 600;
            font-size: 1rem;
            margin-bottom: 1px;
            color: #F5F5F5;
          }
          
          .location-subtitle {
            font-size: 0.8rem;
            color: #737373;
          }
          
          .stats-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.4rem 0.8rem;
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 8px;
            color: #A3A3A3;
            font-size: 0.8rem;
          }

          .stats-badge span { color: #34D399; }

          /* Buttons */
          .btn-primary-mint {
            background: #10B981;
            color: #121212;
            border: 1px solid #10B981;
            border-radius: 10px;
            font-weight: 600;
            padding: 0.6rem 1.25rem;
            font-size: 0.9rem;
            transition: all 0.2s;
          }
          
          .btn-primary-mint:hover {
            background: #059669;
            border-color: #059669;
            color: #121212;
          }
          
          .btn-outline-mint {
            background: transparent;
            color: #A3A3A3;
            border: 1px solid #2A2A2A;
            border-radius: 10px;
            font-weight: 500;
            padding: 0.6rem 1.25rem;
            font-size: 0.9rem;
            transition: all 0.2s;
          }
          
          .btn-outline-mint:hover {
            border-color: #3A3A3A;
            color: #E5E5E5;
          }
          
          .form-select-dark {
            background: #0A0A0A;
            border: 1px solid #2A2A2A;
            color: #E5E5E5;
            border-radius: 10px;
            padding: 0.6rem 0.9rem;
            font-weight: 500;
            font-size: 0.9rem;
          }
          
          .form-select-dark:focus {
            border-color: #10B981;
            box-shadow: none;
            background: #0A0A0A;
            color: #E5E5E5;
          }
          
          .form-select-dark:disabled {
            background: #1E1E1E;
            color: #737373;
            opacity: 0.6;
          }
          
          .form-label-dark {
            color: #A3A3A3;
            font-weight: 600;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 0.4rem;
          }
          
          .alert-warning-dark {
            background: rgba(245, 158, 11, 0.08);
            border: 1px solid rgba(245, 158, 11, 0.2);
            border-radius: 10px;
            color: #F59E0B;
            padding: 0.6rem 0.9rem;
            font-size: 0.85rem;
          }
          
          /* Filter Section */
          .filter-section {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            padding: 1.25rem;
            margin-bottom: 1.5rem;
          }
          
          .filter-header {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid #2A2A2A;
          }
          
          .filter-header h5 {
            margin: 0;
            color: #F5F5F5;
            font-weight: 600;
            font-size: 0.95rem;
          }

          .filter-icon-box {
            width: 30px;
            height: 30px;
            border-radius: 8px;
            background: #10B981;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #121212;
          }
          
          .results-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.25rem;
          }
          
          .results-count {
            color: #A3A3A3;
            font-weight: 500;
            font-size: 0.9rem;
          }
          
          .results-count span {
            color: #34D399;
            font-weight: 600;
          }
          
          .tool-count-badge {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 8px;
            padding: 0.3rem 0.8rem;
            color: #34D399;
            font-weight: 500;
            font-size: 0.8rem;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
          }
          
          .location-privacy-note {
            color: #737373;
            font-size: 0.75rem;
            margin-top: 0.6rem;
            display: flex;
            align-items: center;
            gap: 0.4rem;
          }
          
          .footer-note {
            color: #737373;
            font-size: 0.8rem;
            text-align: center;
            margin-top: 2.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid #2A2A2A;
          }
          
          @media (max-width: 768px) {
            .location-header {
              flex-direction: column;
              align-items: flex-start;
            }
          }
        `}
      </style>

      <Container className="py-4">
        
        {/* Page Header */}
        <div className="page-header">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 style={{ fontSize: '2rem' }}>
                Browse Tools
              </h1>
              <p style={{ color: '#A3A3A3', fontSize: '1rem' }}>
                Find the equipment you need from trusted neighbors across India
              </p>
            </div>
            <div className="d-flex gap-2">
              <div className="stats-badge">
                <FaTools size={12} />
                <span>{stats.total}</span> Tools
              </div>
              {isLocationActive && (
                <div className="stats-badge">
                  <FaMapMarkerAlt size={12} />
                  <span>{stats.nearby}</span> Nearby
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Location Controls */}
        <Card className={`location-card ${isLocationActive ? 'active' : ''}`}>
          <Card.Body>
            <div className="location-header">
              <div className={`location-icon ${isLocationActive ? 'active' : 'inactive'}`}>
                {isLocationActive ? <FaMapMarkerAlt size={18} /> : <FaGlobe size={18} />}
              </div>
              <div className="flex-grow-1">
                <div className="location-title">
                  {isLocationActive ? 'Local Search Active' : 'Browsing All India'}
                </div>
                <div className="location-subtitle">
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
                    className="btn-primary-mint"
                    style={{ minWidth: '170px' }}
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
                      className="btn-outline-mint"
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
                <FaMapMarkerAlt size={11} />
                Your location is only used to show nearby tools. We never store your exact location.
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Filters Section */}
        <div className="filter-section">
          <div className="filter-header">
            <div className="filter-icon-box">
              <FaFilter size={13} />
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
              <Spinner animation="border" size="sm" style={{ color: '#34D399', marginRight: '6px' }} />
            ) : (
              <span>{tools.length}</span>
            )}
            {' '}tool{tools.length !== 1 ? 's' : ''} found
          </div>
          {!loading && tools.length > 0 && (
            <div className="tool-count-badge">
              <FaRupeeSign size={10} />
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
          <FaMapMarkerAlt className="me-1" size={11} />
          Available in Mumbai, Delhi, Bangalore, Chennai, Kolkata & 45+ Indian cities •
          <FaStar className="mx-2" size={11} color="#FBBF24" />
          Trusted by 5,000+ community members
        </div>

      </Container>
    </div>
  );
};

export default BrowseToolsPage;
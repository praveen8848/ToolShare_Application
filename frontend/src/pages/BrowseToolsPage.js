import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { FaMapMarkerAlt, FaGlobe, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
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

  // UX FIX: Only auto-fetch location IF the user previously granted permission.
  // Otherwise, wait for them to explicitly click the button.
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          handleGetLocation();
        }
      });
    }
  }, []);

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
          radius: filters.radius || 25
        });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        // Provide clear, actionable error messages based on the browser's rejection code
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Location access denied. Please enable location permissions in your browser settings (usually a lock icon in the URL bar), or continue browsing global tools.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError("Location information is currently unavailable.");
        } else if (err.code === err.TIMEOUT) {
          setLocationError("The request to get user location timed out.");
        } else {
          setLocationError("An unknown error occurred while trying to find your location.");
        }
      },
      { timeout: 10000 } // Don't let it hang infinitely
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
    // Note: We deliberately do NOT re-fetch location here, 
    // letting the user start completely fresh with a global search.
  };

  const isLocationActive = !!(filters.lat && filters.lng);

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Browse Tools</h2>
        <p className="text-muted">Find the equipment you need, right in your neighborhood.</p>
      </div>
      
      {/* POLISHED: Spatial Proximity Controls */}
      <Card className="mb-4 shadow-sm border-0 rounded-4 overflow-hidden">
        <Card.Body className={isLocationActive ? "bg-primary bg-opacity-10 p-4" : "bg-light p-4"}>
          
          <div className="d-flex align-items-center mb-3">
            {isLocationActive ? (
              <FaMapMarkerAlt className="text-primary fs-4 me-2" />
            ) : (
              <FaGlobe className="text-secondary fs-4 me-2" />
            )}
            <h5 className="mb-0 fw-bold">
              {isLocationActive ? "Local Area Search Active" : "Global Search Active"}
            </h5>
          </div>

          <Row className="align-items-end g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-muted mb-1">Search Radius</Form.Label>
                <Form.Select
                  value={filters.radius || 25}
                  onChange={handleRadiusChange}
                  disabled={!isLocationActive}
                  className="shadow-sm border-0"
                >
                  <option value={5}>Within 5 km</option>
                  <option value={10}>Within 10 km</option>
                  <option value={25}>Within 25 km</option>
                  <option value={50}>Within 50 km</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={8}>
              <div className="d-flex gap-2">
                <Button
                  variant={isLocationActive ? "primary" : "outline-primary"}
                  className="flex-grow-1 shadow-sm fw-semibold"
                  onClick={handleGetLocation}
                  disabled={locating}
                >
                  {locating ? (
                    <><Spinner animation="border" size="sm" className="me-2" /> Finding you...</>
                  ) : isLocationActive ? (
                    <><FaMapMarkerAlt className="me-2 mb-1" /> Update My Location</>
                  ) : (
                    <><FaMapMarkerAlt className="me-2 mb-1" /> Search Near Me</>
                  )}
                </Button>

                {isLocationActive && (
                  <Button 
                    variant="outline-secondary" 
                    className="shadow-sm fw-semibold px-4"
                    onClick={handleClearLocation}
                  >
                    <FaTimesCircle className="me-2 mb-1" /> Clear Location
                  </Button>
                )}
              </div>
            </Col>
          </Row>
          
          {locationError && (
            <Alert variant="warning" className="mt-3 mb-0 border-0 d-flex align-items-start">
              <FaExclamationTriangle className="me-2 mt-1 flex-shrink-0" />
              <div>{locationError}</div>
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Generic filters (Category, Status, Search Text) */}
      <SearchFilters
        filters={filters}
        onFilterChange={updateFilters}
        onReset={handleReset}
      />
      
      <div className="mt-4">
        <ToolGrid tools={tools} loading={loading} isOwnerView={false} />
      </div>
    </Container>
  );
};

export default BrowseToolsPage;
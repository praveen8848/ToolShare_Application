import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaPlus, FaTools, FaCalendarAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <Container className="py-4">
      <h1 className="mb-4">Welcome back, {user?.name || 'User'}!</h1>
      
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <FaSearch size={40} className="text-primary mb-3" />
              <Card.Title>Find Tools</Card.Title>
              <Card.Text>
                Browse available tools from your community
              </Card.Text>
              <Button as={Link} to="/browse" variant="primary">
                Browse Tools
              </Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-3">
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <FaPlus size={40} className="text-success mb-3" />
              <Card.Title>List a Tool</Card.Title>
              <Card.Text>
                Share your tools and earn money
              </Card.Text>
              <Button as={Link} to="/add-tool" variant="success">
                List Tool
              </Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-3">
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <FaCalendarAlt size={40} className="text-info mb-3" />
              <Card.Title>My Bookings</Card.Title>
              <Card.Text>
                View your upcoming and past bookings
              </Card.Text>
              <Button as={Link} to="/my-bookings" variant="info">
                View Bookings
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header as="h5">Quick Stats</Card.Header>
            <Card.Body>
              <Row>
                <Col sm={6} className="text-center mb-3">
                  <h3>0</h3>
                  <p className="text-muted">Tools Listed</p>
                </Col>
                <Col sm={6} className="text-center mb-3">
                  <h3>0</h3>
                  <p className="text-muted">Active Bookings</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header as="h5">Recent Activity</Card.Header>
            <Card.Body>
              <p className="text-muted text-center">No recent activity</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;
import React, { useState } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { Scanner } from '@yudiel/react-qr-scanner';
import { FaQrcode, FaCamera } from 'react-icons/fa';

const QRScannerComponent = ({ show, onHide, onScanSuccess }) => {
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleScan = async (result) => {
    if (result && !processing) {
      setProcessing(true);
      setScanning(false);
      
      try {
        // @yudiel/react-qr-scanner returns array of results
        const data = result[0]?.rawValue || result;
        console.log('Scanned QR data:', data);
        
        // Parse QR data
        if (data && data.startsWith('BOOKING:')) {
          const parts = data.split(':');
          if (parts.length >= 2) {
            const bookingId = parseInt(parts[1]);
            await onScanSuccess(bookingId, data);
          } else {
            setError('Invalid QR code format');
          }
        } else {
          setError('Invalid QR code. Please scan a valid booking QR code.');
        }
      } catch (err) {
        setError('Failed to process QR code');
        console.error('QR scan error:', err);
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleError = (err) => {
    console.error('QR Scanner error:', err);
    setError('Camera access error. Please check permissions.');
  };

  const resetScanner = () => {
    setError(null);
    setScanning(true);
    setProcessing(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaQrcode className="me-2" />
          Scan QR Code to Return Item
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
            <Button 
              variant="link" 
              className="p-0 ms-2" 
              onClick={resetScanner}
            >
              Try again
            </Button>
          </Alert>
        )}
        
        {scanning && !processing && (
          <div className="text-center">
            <div className="bg-light p-4 rounded mb-3" style={{ minHeight: '300px' }}>
              <Scanner
                onDecode={handleScan}
                onError={handleError}
                constraints={{ facingMode: 'environment' }}
                containerStyle={{ width: '100%', height: '100%' }}
                videoStyle={{ width: '100%', height: 'auto' }}
              />
            </div>
            <p className="text-muted small">
              Position the QR code within the frame to scan
            </p>
          </div>
        )}
        
        {processing && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Processing QR code...</p>
          </div>
        )}
        
        {!scanning && !processing && !error && (
          <div className="text-center py-5">
            <FaCamera size={50} className="text-success mb-3" />
            <p>QR code scanned successfully!</p>
            <Button variant="primary" onClick={resetScanner}>
              Scan Another
            </Button>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default QRScannerComponent;
import React from 'react';
import { Modal, Button, Card } from 'react-bootstrap';
import { QRCodeCanvas } from 'qrcode.react';
import { FaQrcode, FaDownload } from 'react-icons/fa';

const QRCodeDisplay = ({ show, onHide, booking }) => {
  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code-canvas');
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `booking_${booking.id}_qrcode.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  if (!booking) return null;

  const qrData = `BOOKING:${booking.id}:${booking.borrowerId}:${booking.itemId}:${booking.startDate}`;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaQrcode className="me-2" />
          Booking QR Code
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <Card className="border-0">
          <Card.Body>
            <h5>{booking.itemName}</h5>
            <p className="text-muted">
              Booking ID: #{booking.id}
              <br />
              Dates: {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
              <br />
              Borrower: {booking.borrowerName}
            </p>
            
            <div className="bg-light p-4 rounded mb-3">
              <QRCodeCanvas
                id="qr-code-canvas"
                value={qrData}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            
            <p className="small text-muted">
              Show this QR code to the owner when picking up and returning the tool.
            </p>
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={downloadQRCode}>
          <FaDownload className="me-1" />
          Download QR Code
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default QRCodeDisplay;
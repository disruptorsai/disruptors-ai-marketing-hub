import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRScanner } from '@/components/connect/QRScanner';
import { useConnectStore } from '@/lib/connect/store';

export default function ConnectScanner() {
  const navigate = useNavigate();
  const { startSession } = useConnectStore();
  const [scanning, setScanning] = useState(true);

  const handleScan = async (qrCode) => {
    console.log('[Scanner] QR Code detected:', qrCode);
    setScanning(false);

    // Parse QR code and determine action
    try {
      // If it's a check-in URL, extract parameters
      if (qrCode.includes('/eventqr/checkin')) {
        const url = new URL(qrCode);
        const source = url.searchParams.get('source');
        const kioskId = url.searchParams.get('kiosk');

        console.log('[Scanner] Check-in URL detected:', { source, kioskId });

        startSession();
        navigate('/connectqr/checkin', { state: { source, kioskId } });
      }
      // If it's a ticket QR code, lookup the attendee
      else {
        // Call resolve API to find existing RSVP
        const response = await fetch('/.netlify/functions/checkin-resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            qrCode,
            eventId: 'connect-2025-10'
          })
        });

        const data = await response.json();

        if (data.contactId) {
          // Found existing contact, go straight to success
          navigate('/connectqr/success', { state: { contact: data.contact } });
        } else {
          // No match, proceed to intake
          startSession();
          navigate('/connectqr/checkin');
        }
      }
    } catch (error) {
      console.error('[Scanner] Error processing QR code:', error);
      // On error, just proceed to intake
      startSession();
      navigate('/connectqr/checkin');
    }
  };

  const handleClose = () => {
    navigate('/connectqr');
  };

  return scanning ? (
    <QRScanner onScan={handleScan} onClose={handleClose} />
  ) : null;
}

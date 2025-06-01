import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '0.5rem',
};

const DoctorMap = ({ address, lat, lng }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // or use process.env if not using Vite
  const center = { lat, lng };

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
      >
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
};

export default DoctorMap;

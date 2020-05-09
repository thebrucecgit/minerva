import React, { useState, useEffect } from "react";

import {
  GoogleMap,
  LoadScript,
  Autocomplete,
  Marker,
} from "@react-google-maps/api";

import styles from "./styles.module.scss";

const libraries = ["places"];

const Map = ({ location, disabled, update, setUpdate }) => {
  const [autoComplete, setAutoComplete] = useState(null);
  const [zoom, setZoom] = useState(5);

  useEffect(() => {
    if (location.coords.lat) setZoom(17);
  }, [location]);

  const onLocationChange = (e) => {
    e.persist();
    setUpdate((st) => ({
      ...st,
      location: {
        ...st.location,
        address: e.target.value,
      },
    }));
  };

  const onPlaceChanged = () => {
    if (autoComplete !== null) {
      const place = autoComplete.getPlace();

      const coords = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      setUpdate((st) => ({
        ...st,
        location: {
          address: `${place.name}, ${place.formatted_address}`,
          coords,
        },
      }));
    } else {
      console.log("Autocomplete is not loaded yet!");
    }
  };

  const onMapLoad = (instance) => {
    setAutoComplete(instance);
  };

  return (
    <LoadScript
      libraries={libraries}
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
    >
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "400px" }}
        zoom={zoom}
        center={
          location.coords.lat
            ? location.coords
            : {
                lat: -41.69,
                lng: 173.22,
              }
        }
      >
        {location.coords?.lat && <Marker position={location.coords} />}
        {(!disabled || location.address) && (
          <Autocomplete
            onLoad={onMapLoad}
            onPlaceChanged={onPlaceChanged}
            bounds={
              // Bounds around New Zealand
              {
                east: 179.83,
                north: -34.09,
                south: -47.37,
                west: 164.58,
              }
            }
          >
            <input
              type="text"
              className={styles.MapInput}
              disabled={disabled}
              value={(disabled ? location.address : update.address) || ""}
              onChange={onLocationChange}
            />
          </Autocomplete>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;

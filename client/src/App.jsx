import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './App.css';
// import stationData from './CTA_RailStations.geojson';

mapboxgl.accessToken = "pk.eyJ1IjoiY3NreW9zIiwiYSI6ImNscmdwb2R5bjBmajUyam15OTF2N3hkbWoifQ.RTlw7rbFQy8YiAxHRIDiHQ";

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-87.6298);
  const [lat, setLat] = useState(41.8781);
  const [zoom, setZoom] = useState(13);

  const bounds = [
    [-87.9401, 41.6445], // Southwest coordinates (adjusted)
    [-87.5240, 42.0230]  // Northeast coordinates (adjusted)
  ];

  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-87.6298, 41.8781], // Chicago downtown coordinates
        zoom: zoom,
        maxZoom: 28,
        maxBounds: bounds
      });

      map.current.on('load', () => {
        map.current.addSource('cta', {
          type: 'geojson',
          data: './src/assets/CTA_L.geojson', // Update the path
        });

        map.current.addLayer({
          'id': 'lines',
          'type': 'line',
          'source': 'cta',
          'paint': {
            'line-width': 3,
            'line-color': '#FFFFFF'
          },
        })

        map.current.addLayer({
          'id': 'stations',
          'type': 'circle',
          'source': 'cta',
          'paint': {
            'circle-radius': 6,
            'circle-color': [
              'match',
              ['get', 'Lines'],
              'Red', '#C60C30',
              'Green', '#009B3A',
              'Yellow', '#F9E300',
              'Blue', '#00A1DE',
              'Pink', '#E27EA6',
              'Brown', '#62361B',
              'Orange', '#F9461C',
              'Purple', '#522398',
              '#565A5C' // Default color / Transfer Stations
            ]
          },
          'filter': ['==', '$type', 'Point']         
        });
      });

      map.current.on('move', () => {
        setLng(map.current.getCenter().lng.toFixed(4));
        setLat(map.current.getCenter().lat.toFixed(4));
        setZoom(map.current.getZoom().toFixed(2));
      });
    }
  });

  return (
    <div className='w-screen h-screen' ref={mapContainer} />
  );
}
export default App;

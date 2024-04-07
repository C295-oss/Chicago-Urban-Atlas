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
        map.current.addSource('stations', {
          type: 'geojson',
          data: './src/CTA_RailStations.geojson', // Update the path
        });

        map.current.addLayer({
          'id': 'line',
          'type': 'fill',
          'source': {
            type: 'geojson',
            data: './src/CTA_RailLines.geojson', // Update the path
          },
          'paint': {
            'fill-color': [
              'match',
              ['get', 'Rail Line'], // Property to match
              'Red Line', '#c60c30',
              'Green Line', '#009b3a',
              'Green Line (Lake)', '#009b3a',
              'Green Line (Englewood)', '#009b3a',
              'Yellow Line', '#f9e300',
              'Blue Line', '#00a1de',
              'Blue Line (O\'Hare)', '#00a1de',
              'Blue Line (Congress)', '#00a1de',
              'Pink', '#e27ea6',
              'Brown Line', '#62361b',
              'Orange Line', '#f9461c',
              'Purple (Express)', '#522398',
              'Purple Line, Evanston Express', '#522398',
              '#565a5c' // Default color
            ],
            'fill-opacity': 0.5 // Adjust opacity as needed
          }           
      });

        map.current.addLayer({
            'id': 'station-layer',
            'type': 'circle',
            'source': 'stations',
            'paint': {
              'circle-radius': 6,
              'circle-color': [
                'match',
                ['get', 'Rail Line'], // Property to match
                'Red Line', '#c60c30',
                'Green Line', '#009b3a',
                'Green Line (Lake)', '#009b3a',
                'Green Line (Englewood)', '#009b3a',
                'Yellow Line', '#f9e300',
                'Blue Line', '#00a1de',
                'Blue Line (O\'Hare)', '#00a1de',
                'Blue Line (Congress)', '#00a1de',
                'Pink', '#e27ea6',
                'Brown Line', '#62361b',
                'Orange Line', '#f9461c',
                'Purple (Express)', '#522398',
                'Purple Line, Evanston Express', '#522398',
                '#565a5c' // Default color / Transfer Stations
              ]
            }            
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

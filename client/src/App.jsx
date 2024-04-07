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

      map.current.on('style.load', () => {
        // Insert the layer beneath any symbol layer.
        const layers = map.current.getStyle().layers;
        const labelLayerId = layers.find(
            (layer) => layer.type === 'symbol' && layer.layout['text-field']
        ).id;

        // The 'building' layer in the Mapbox Streets
        // vector tileset contains building height data
        // from OpenStreetMap.
        map.current.addLayer(
            {
                'id': 'add-3d-buildings',
                'source': 'composite',
                'source-layer': 'building',
                'filter': ['==', 'extrude', 'true'],
                'type': 'fill-extrusion',
                'minzoom': 15,
                'paint': {
                    'fill-extrusion-color': '#aaa',

                    // Use an 'interpolate' expression to
                    // add a smooth transition effect to
                    // the buildings as the user zooms in.
                    'fill-extrusion-height': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        15,
                        0,
                        15.05,
                        ['get', 'height']
                    ],
                    'fill-extrusion-base': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        15,
                        0,
                        15.05,
                        ['get', 'min_height']
                    ],
                    'fill-extrusion-opacity': 0.6
                }
            },
            labelLayerId
        );
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

      map.current.on('click', 'stations', (e) => {
        // Get the properties of the clicked feature
        const properties = e.features[0].properties;
        
        // Copy coordinates array.
        const coordinates = e.features[0].geometry.coordinates.slice();
        const adaAccessible = properties.ADA === 'ADA Accessible' ? 'Yes' : 'No';
        const parkAndRide = properties['Park and Ride'] ? 'Yes' : 'No';
      
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
      
        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(
            `<h1><b>${properties['Station']}</b></h1>
            <p><strong>Address:</strong> ${properties['Address']}</p>
            <p><strong>Rail Line:</strong> ${properties['Lines']}</p>
            <p><strong>ADA Accessible:</strong> ${adaAccessible}</p>
            <p><strong>Park and Ride:</strong> ${parkAndRide}</p>`
          )
          .addTo(map.current);
      });

      // map.current.on('mouseenter', 'station-layer', () => {
      //   mapContainer.current.style.cursor = 'pointer';
      // });
      
      // map.current.on('mouseleave', 'station-layer', () => {
      //   mapContainer.current.style.cursor = '';
      // });

    }
  });

  return (
    <div className='w-screen h-screen' ref={mapContainer} />
  );
}
export default App;

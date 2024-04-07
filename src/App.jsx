import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './App.css';

mapboxgl.accessToken = "pk.eyJ1IjoiY3NreW9zIiwiYSI6ImNscmdwb2R5bjBmajUyam15OTF2N3hkbWoifQ.RTlw7rbFQy8YiAxHRIDiHQ";

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-87.6298);
  const [lat, setLat] = useState(41.8781);
  const [zoom, setZoom] = useState(12);
  const [isSideBarOpen, setSideBarOpen] = useState(false); // Define sidebarOpen state
  // const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/dark-v11');

  // function handleStyleChange(newStyle) {
  //   setMapStyle(`mapbox://styles/mapbox/${newStyle}-v11`);
  //   if (map.current) {
  //     map.current.setStyle(`mapbox://styles/mapbox/${newStyle}-v11`);
  //   }
  // }

  const bounds = [
    [-87.9401, 41.6445], // Southwest coordinates (adjusted)
    [-87.5240, 42.0230]  // Northeast coordinates (adjusted)
  ];

  function toggleSidebar() {
    setSideBarOpen(!isSideBarOpen); // Toggle the sidebar state
  }

  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-87.6298, 41.8781], // Chicago downtown coordinates
        zoom: zoom,
        maxZoom: 24,
        minZoom: 0,
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
            'id': '3D-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'layout': {
              // Make the layer not visible by default.
              'visibility': 'none'
            },
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

      // function handleStyleChange(newStyle) {
      //   setMapStyle(`mapbox://styles/mapbox/${newStyle}-v11`);
      //   if (map.current) {
      //     map.current.setStyle(`mapbox://styles/mapbox/${newStyle}-v11`);
      //     map.current.once('styledata', addCustomLayers);
      //   }
      // }

      map.current.on('load', () => {
        map.current.addSource('density', {
          type: 'geojson',
          data: './src/assets/points_full_100.geojson'
        });
        
        map.current.addLayer({
          id: 'Population Density',
          type: 'heatmap',
          source: 'density',
          maxzoom: 24, // Adjust as needed
          'layout': {
            // Make the layer not visible by default.
            'visibility': 'none'
          },
          paint: {
            // Increase the heatmap weight based on frequency and property magnitude
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'mag'],
              0,
              0,
              4,
              0.5 // Adjust this value based on your preference
            ],
            // Increase the heatmap color weight weight by zoom level
            // heatmap-intensity is a multiplier on top of heatmap-weight
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0,
              0.01, // Lower intensity at lower zoom levels
              9,
              0.2    // Full intensity at higher zoom levels
            ],
            // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
            // Begin color ramp at 0-stop with a 0-transparency color
            // to create a blur-like effect.
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0,
              'rgba(255, 255, 255, 0)', // Start with a transparent color
              0.1,
              'rgb(255,243,59)',
              0.2,
              'rgb(253,199,12)',
              0.3,
              'rgb(243,144,63)',
              0.4,
              'rgb(237,104,60)',
              0.5,
              'rgb(233,62,58)'
            ],
            // Adjust the heatmap radius by zoom level
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              // Define zoom levels and corresponding heatmap radius values
              0,      // Zoom level 0
              0.1,    // Heatmap radius at zoom level 0
              0.5,    // Zoom level 9
              10      // Heatmap radius at zoom level 9 (make it larger if needed)
            ],
            // Transition from heatmap to circle layer by zoom level
            'heatmap-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0,
              0.5, // Lower opacity at lower zoom levels
              9,
              1    // Full opacity at higher zoom levels
            ]
          }
        });

        map.current.addSource('cta_buses', {
          type: 'geojson',
          data: './src/assets/CTA_bus.geojson',
        });

        map.current.addLayer({
          'id': 'Bus Routes',
          'type': 'line',
          'source': 'cta_buses',
          'paint': {
            'line-width': 1,
            'line-color': '#FFFFFF'
          },
          'layout': {
            // Make the layer not visible by default.
            'visibility': 'none'
          },
        });

        map.current.addSource('cta_L', {
          type: 'geojson',
          data: './src/assets/CTA_L.geojson',
        });

        map.current.addLayer({
          'id': 'L Lines',
          'type': 'line',
          'source': 'cta_L',
          'paint': {
            'line-width': 3,
            'line-color': [
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
              '#FFFFFF' // Default color / Transfer Stations
            ]
          },
          'layout': {
            // Make the layer not visible by default.
            'visibility': 'visible'
          }
        });

        map.current.addLayer({
          'id': 'L Stations',
          'type': 'circle',
          'source': 'cta_L',
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
              '#FFFFFF' // Default color / Transfer Stations
            ]
          },
          'filter': ['==', '$type', 'Point'],
          'layout': {
            // Make the layer not visible by default.
            'visibility': 'visible'
          }  
        });
      });
      
      map.current.on('move', () => {
        setLng(map.current.getCenter().lng.toFixed(4));
        setLat(map.current.getCenter().lat.toFixed(4));
        setZoom(map.current.getZoom().toFixed(2));
      });

      map.current.on('click', 'L Stations', (e) => {
        // Get the properties of the clicked feature
        const properties = e.features[0].properties;
        
        // Copy coordinates array.
        const coordinates = e.features[0].geometry.coordinates.slice();
        const adaAccessible = properties.ADA === 'ADA Accessible' ? 'Yes' : 'No';
        const parkAndRide = properties['Park and Ride'] ? 'Yes' : 'No';
        const spacedLineColors = properties['Lines'].split(',').join(', ');
      
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
            <p><strong>Lines:</strong> ${spacedLineColors}</p>
            <p><strong>ADA Accessible:</strong> ${adaAccessible}</p>
            <p><strong>Park and Ride:</strong> ${parkAndRide}</p>`
          )
          .addTo(map.current);
      });
    }

    map.current.on('idle', () => {
      if ( 
        !map.current.getLayer('L Stations') ||
        !map.current.getLayer('L Lines') ||
        !map.current.getLayer('Bus Routes') ||
        !map.current.getLayer('Population Density') || 
        !map.current.getLayer('3D-buildings') || 
        !map.current.getLayer('Bus Routes')
      ) {
        return;
      }
  
      const toggleableLayerIds = [
        'L Stations',
        'L Lines',
        'Bus Routes',
        'Population Density', 
        '3D-buildings'
      ];
        
      // Set up the corresponding toggle button for each layer.
      for (const id of toggleableLayerIds) {
        // Skip layers that already have a button set up.
        if (document.getElementById(id)) {
          continue;
        }
    
        // Create a link.
        const link = document.createElement('a');
        link.id = id;
        link.href = '#';
        link.textContent = id;
        link.className = 'active';
    
        // Show or hide layer when the toggle is clicked.
        link.onclick = function (e) {
          const clickedLayer = this.textContent;
          e.preventDefault();
          e.stopPropagation();
    
        const visibility = map.current.getLayoutProperty(
          clickedLayer,
          'visibility'
        );
    
        // Toggle layer visibility by changing the layout object's visibility property.
        if (visibility === 'visible') {
          map.current.setLayoutProperty(clickedLayer, 'visibility', 'none');
          this.className = '';
        }  else {
          this.className = 'active';
          map.current.setLayoutProperty(
            clickedLayer,
            'visibility',
            'visible'
          );
        }
      };
        const layers = document.getElementById('menu');
        layers.appendChild(link);
      }
    });
  });

  return (
    <>
      <div className={`sidebar ${isSideBarOpen ? 'open' : ''}`}>
        <h2><b>Display Options</b></h2>
        <div id="menu"></div>
      </div>

      {/* <div id="LightDark">
        <input
          id="light-v11"
          type="radio"
          name="rtoggle"
          value="light"
          onChange={() => handleStyleChange('light')}
          checked={mapStyle === 'mapbox://styles/mapbox/light-v11'}
        />
        <label htmlFor="light-v11">Light</label>
        
        <input
          id="dark-v11"
          type="radio"
          name="rtoggle"
          value="dark"
          onChange={() => handleStyleChange('dark')}
          checked={mapStyle === 'mapbox://styles/mapbox/dark-v11'}
        />
        <label htmlFor="dark-v11">Dark</label>
      </div> */}

      <button className="openbtn px-4 py-2 w-60 text-center" onClick={toggleSidebar}> ☰ Map Settings</button>
      <div className='w-screen h-screen' ref={mapContainer} id="main" />
    </>
  );
}
export default App;
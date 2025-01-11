// Create the map and set the initial view to a specific location
let map = L.map('map').setView([20, 0], 2);

// Add a tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 18
}).addTo(map);

// Function to determine the marker size based on earthquake magnitude
function getMarkerSize(magnitude) {
  return magnitude ? magnitude * 4 : 1;
}

// Function to determine the color based on earthquake depth
function getColor(depth) {
  return depth > 90 ? '#FF0000' :
         depth > 70 ? '#FF4500' :
         depth > 50 ? '#FFA500' :
         depth > 30 ? '#FFD700' :
         depth > 10 ? '#9ACD32' :
                      '#00FF00';
}

// Fetch the GeoJSON data
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(url).then(data => {
  // Add GeoJSON layer to the map
  L.geoJSON(data, {
    // Define how each feature should be represented
    pointToLayer: function (feature, latlng) {
      let magnitude = feature.properties.mag;
      let depth = feature.geometry.coordinates[2];
      
      return L.circleMarker(latlng, {
        radius: getMarkerSize(magnitude),
        fillColor: getColor(depth),
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    },
    // Define the behavior for each feature
    onEachFeature: function (feature, layer) {
      layer.bindPopup(`
        <h3>${feature.properties.title}</h3>
        <p>Magnitude: ${feature.properties.mag}</p>
        <p>Depth: ${feature.geometry.coordinates[2]} km</p>
        <p>Location: ${feature.properties.place}</p>
      `);
    }
  }).addTo(map);

  // Add a legend to the map
  let legend = L.control({ position: 'bottomright' });

  legend.onAdd = function () {
    let div = L.DomUtil.create('div', 'info legend');
    let depths = [-10, 10, 30, 50, 70, 90];
    let colors = ['#00FF00', '#9ACD32', '#FFD700', '#FFA500', '#FF4500', '#FF0000'];

    div.innerHTML += '<strong>Depth (km)</strong><br>';
    for (let i = 0; i < depths.length; i++) {
      div.innerHTML += 
        `<i style="background:${colors[i]}"></i> ${depths[i]}${depths[i + 1] ? `&ndash;${depths[i + 1]}<br>` : '+'}`;
    }

    return div;
  };

  legend.addTo(map);
});

// Initialize the map
var map = L.map('map').setView([0, 0], 2); // Set initial view to [0, 0] (center of the map), zoom level 2

// Add a tile layer to the map (Mapbox Streets tile layer)
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiYWxpY2VoYW5kbGV5IiwiYSI6ImNsbmlheWx0bTBqbnMybnFsaDllNjd6NmwifQ.cAZSrQNS6PtSNIJ84T2e2A'
}).addTo(map);

// Function to check if coordinates are valid
function isValidCoordinates(coordinates) {
    var lon = coordinates[0];
    var lat = coordinates[1];
    return lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90;
}

// URL of the GeoJSON data
var url = 'https://raw.githubusercontent.com/shaylahong/Group1_Project3/main/Resources/output.geojson';

// Fetch the GeoJSON data
fetch(url)
    .then(function(response) {
        // The API call was successful, return the response
        return response.json();
    })
    .then(function(data) {
        // Add GeoJSON features to the map
        L.geoJSON(data, {
            filter: function(feature) {
                // Only include features with valid coordinates
                return isValidCoordinates(feature.geometry.coordinates);
            },
            onEachFeature: function(feature, layer) {
                // For each feature, add a popup with the country, disaster type, year, number of deaths, and total damages
                if (feature.properties && feature.properties.country && feature.properties.disaster_type && feature.properties.year && feature.properties.total_deaths) {
                    var popupText = 
                        'Country: ' + feature.properties.country +
                        '<br>Disaster Type: ' + feature.properties.disaster_type +
                        '<br>Year: ' + feature.properties.year +
                        '<br>Total Deaths: ' + feature.properties.total_deaths;
                    if (feature.properties.total_damages) {
                        popupText += '<br>Total Damages (000 US$): ' + feature.properties.total_damages;
                    }
                    layer.bindPopup(popupText);
                }
            }
        }).addTo(map);
    })
    .catch(function(error) {
        // There was an error with the API call
        console.error('Error:', error);
    });
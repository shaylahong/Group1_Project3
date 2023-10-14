// Fetch data from API
function fetchData(callback) {
    d3.json("http://127.0.0.1:5000/getData/")
    .then(response => {
        if (Array.isArray(response)) {
            callback(response);
        } else if (response.samples) {
            callback(response.samples);
        } else {
            throw new Error("Unexpected data format");
        }
    })
    .catch(error => {
        console.error("Error fetching data:", error);
    });
}


function init() {
fetchData(data => {
    // Calculate the total disasters for each country
    let countryDisasterCounts = {};

    data.forEach(item => {
        if (countryDisasterCounts[item.country]) {
            countryDisasterCounts[item.country] += 1;
        } else {
            countryDisasterCounts[item.country] = 1;
        }
    });

    // Sort countries by their disaster counts in descending order
    let sortedCountries = Object.keys(countryDisasterCounts).sort((a, b) => countryDisasterCounts[b] - countryDisasterCounts[a]);
    let top20Countries = sortedCountries.slice(0, 20);

    // Populate dropdown and lists with top 20 countries
    let ul1 = d3.select("#countryList1");
    let ul2 = d3.select("#countryList2");
    let dropdown = d3.select("#selDataset");
    
    top20Countries.forEach(country => {
        dropdown.append("option").text(country).property("value", country);
    });
    
    top20Countries.forEach((country, index) => {
        if (index < 10) {
            ul1.append("li").text(country);
        } else {
            ul2.append("li").text(country);
        }
    });
    
    // Update plots and map with the data of the first country in the dropdown
    updatePlot(top20Countries[0], data);
    updateBubblePlot(top20Countries[0], data);
    updateMap(data.filter(item => item.country === top20Countries[0]));

    // Add change listener to dropdown
    dropdown.on("change", function() {
        const newCountry = d3.select(this).property("value");
        optionChanged(newCountry);
    });
});
}

function updatePlot(selectedCountry, data) {
    const filteredData = data.filter(item => item.country === selectedCountry);

    let yearlyDisasterCounts = {};

    filteredData.forEach(item => {
        if (!yearlyDisasterCounts[item.year]) {
            yearlyDisasterCounts[item.year] = {};
        }

        if (!yearlyDisasterCounts[item.year][item.disaster_type]) {
            yearlyDisasterCounts[item.year][item.disaster_type] = 0;
        }

        yearlyDisasterCounts[item.year][item.disaster_type]++;
    });

    const years = Object.keys(yearlyDisasterCounts).map(Number);
    const barData = [];

    // Build data for each disaster type dynamically
    let allDisasterTypes = new Set(filteredData.map(item => item.disaster_type));
    
    allDisasterTypes.forEach(disasterType => {
        let yearlyCounts = years.map(year => yearlyDisasterCounts[year][disasterType] || 0);
        barData.push({
            type: 'bar',
            name: disasterType,
            x: years,
            y: yearlyCounts,
            hoverinfo: 'y+name',
        });
    });

    const barLayout = {
        title: `Disaster Counts for ${selectedCountry} in 10 Years`,
        xaxis: {
            title: "Year",
            tickvals: years,
        },
        yaxis: { title: "Number of Disasters" }
    };

    Plotly.newPlot('bar', barData, barLayout);
    }

function updateBubblePlot(selectedCountry, data) {
    const filteredData = data.filter(item => item.country === selectedCountry);


    let totalDeathsByDisaster = {};

    filteredData.forEach(item => {
    if (!totalDeathsByDisaster[item.year]) {
        totalDeathsByDisaster[item.year] = {};
    }

    if (!totalDeathsByDisaster[item.year][item.disaster_type]) {
        totalDeathsByDisaster[item.year][item.disaster_type] = 0;
    }

    totalDeathsByDisaster[item.year][item.disaster_type] += parseFloat(item.total_deaths);
});

const years = Object.keys(totalDeathsByDisaster).sort((a, b) => a - b).map(Number);
const deathsCounts = years.map(year => {
    let sum = 0;
    for (let type in totalDeathsByDisaster[year]) {
        sum += totalDeathsByDisaster[year][type];
    }
    return Math.round(sum);
});

const deathTexts = years.map(year => {
    let texts = [];
    for (let type in totalDeathsByDisaster[year]) {
        texts.push(`${type}: ${totalDeathsByDisaster[year][type]}`);
    }
    return `Year: ${year} | ` + texts.join(", ");
});


    const bubbleData = [{
        type: 'scatter',
        mode: 'markers',
        x: years,
        y: deathsCounts,
        marker: {
        size: deathsCounts.map(deathCount => Math.sqrt(deathCount)*10),
        color: deathsCounts,
        sizemode: 'diameter',
        sizeref: 0.01,
        sizemode: 'area' 
        },
        text: deathTexts,
    }];

    const bubbleLayout = {
        title: `Total Deaths for ${selectedCountry} by Disaster Type`,
        xaxis: {
            title: "Year",
            type: "category"  // Force the x-axis to treat years as categories
        },
        yaxis: { title: "Total Deaths" },
        };


    Plotly.newPlot('bubble', bubbleData, bubbleLayout);
    }

let mymap = L.map('mapid').setView([20, 0], 2); // Initialize map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { // Using OpenStreetMap tiles
    maxZoom: 19,
}).addTo(mymap);

let markers = L.layerGroup().addTo(mymap); // Layer for the disaster markers


function initMap() {
    fetchData(data => {
        const firstCountryData = data.filter(item => item.country === top20Countries[0]);
        initMap(firstCountryData);
    });
}

function isValidCoordinates(coords) {
    if (!Array.isArray(coords)) return false;
    if (coords.length !== 2) return false;
    const [lat, lon] = coords;
    return !isNaN(lat) && isFinite(lat) && !isNaN(lon) && isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}


function updateMap(filteredData) {
    markers.clearLayers(); // Clear previous markers

    filteredData.forEach(item => {
        if (isValidCoordinates([item.latitude, item.longitude])) {
            let marker = L.marker([item.latitude, item.longitude]);
            marker.bindPopup(
                `Country: ${item.country}<br>Disaster Type: ${item.disaster_type}<br>Year: ${item.year}<br>Total Deaths: ${item.total_deaths}<br>Total Damages ('000 US$): ${item.total_damages}`
            );
            marker.addTo(markers);
        }
    });
}

// Function to calculate the bounds of a country based on its coordinates
function calculateCountryBounds(data) {
    const latitudes = data.map(item => item.latitude);
    const longitudes = data.map(item => item.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLon = Math.min(...longitudes);
    const maxLon = Math.max(...longitudes);

    return L.latLngBounds([minLat, minLon], [maxLat, maxLon]);
}
function optionChanged(newSample) {
  fetchData(data => {
      updatePlot(newSample, data);
      updateBubblePlot(newSample, data)

      // Filter data for the selected country
      const filteredMapData = data.filter(item => item.country === newSample);

      // Update map with filtered data
      updateMap(filteredMapData);

      // Calculate bounds for the selected country and set map view
      const bounds = calculateCountryBounds(filteredMapData);
      mymap.fitBounds(bounds);

  });
}

init();


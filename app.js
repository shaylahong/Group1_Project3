// Fetch data from API
function fetchData(callback) {
  d3.json("http://127.0.0.1:5000/getData/").then(response => {
      if (Array.isArray(response)) {
          callback(response);
      } else if (response.samples) {
          callback(response.samples);
      } else {
          console.error("Unexpected data format");
      }
  });
}


function init() {
  fetchData(data => {
      uniqueCountries = [...new Set(data.map(item => item.country))];
      let dropdown = d3.select("#selDataset");
      
      uniqueCountries.forEach(country => {
          dropdown.append("option").text(country).property("value", country);
      });
      
      updatePlot(uniqueCountries[0], data);
      updateBubblePlot(uniqueCountries[0], data);
      
      // Listen to the dropdown change event
      dropdown.on("change", function() {
          const newCountry = d3.select(this).property("value");
          fetchData(data => {
              updatePlot(newCountry, data);
              updateBubblePlot(newCountry, data);
          });
      });
  });
}

function updatePlot(selectedCountry, data) {
const filteredData = data.filter(item => item.country === selectedCountry);

let countryCounts = {};
let disasterTypes = {};

filteredData.forEach(item => {
    if (countryCounts[item.year]) {
        countryCounts[item.year] += 1;
        disasterTypes[item.year].push(item.disaster_type);
    } else {
        countryCounts[item.year] = 1;
        disasterTypes[item.year] = [item.disaster_type];
    }
});

const years = Object.keys(countryCounts).map(Number);
const counts = Object.values(countryCounts);
const disasterTexts = years.map(year => `Disasters: ${disasterTypes[year].join(', ')}`);


const barData = [{
    type: 'bar',
    x: years,
    y: counts,
    text: disasterTexts,
    hoverinfo: 'x+y+text'
}];

const barLayout = {
    title: `Disaster Counts for ${selectedCountry} in 10 Years`,
    xaxis: {
        title: "Year",
        tickvals: years   
    },
    yaxis: { title: "Number of Disasters" }
};

Plotly.newPlot('bar', barData, barLayout);
}

function updateBubblePlot(selectedCountry, data) {
const filteredData = data.filter(item => item.country === selectedCountry);

let countryCounts = {};
let disasterTypes = {};

filteredData.forEach(item => {
    if (countryCounts[item.year]) {
        countryCounts[item.year] += 1;
        disasterTypes[item.year].push(item.disaster_type);
    } else {
        countryCounts[item.year] = 1;
        disasterTypes[item.year] = [item.disaster_type];
    }
});

const years = Object.keys(countryCounts).map(Number);
const counts = Object.values(countryCounts);
const disasterTexts = years.map(year => `Disasters: ${disasterTypes[year].join(', ')}`);

const bubbleData = [{
    type: 'scatter',
    mode: 'markers',
    x: years,
    y: counts,
    marker: {
      size: counts,
      color: counts,
      sizemode: 'diameter',
      sizeref: 0.0001,
      sizemode: 'area' 
    },
    text: disasterTexts,
}];

const bubbleLayout = {
  xaxis: {
      title: "Year",
      type: "category"  // Force the x-axis to treat years as categories
  },
  yaxis: { title: "Number of Disasters" }
};


Plotly.newPlot('bubble', bubbleData, bubbleLayout);
}


function optionChanged(newSample) {
  fetchData(data => {
      updatePlot(newSample, data);
      updateBubblePlot(newSample, data)
  });
}

init();
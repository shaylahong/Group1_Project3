# Project3_Group1
data sourced from: https://www.kaggle.com/datasets/brsdincer/all-natural-disasters-19002021-eosdis/data 

## app.py 

Using the Flask framework to create a REST API for retrieving data from a PostgreSQL database. 

1. Importing Necessary Modules: automap_base, Session, create_engine, func, text from SQLAlchemy, Decimal for handling decimal numbers, and CORS for handling Cross-Origin Resource Sharing.

2. Initializing Flask and Enabling CORS: 
- An instance of the Flask application is created and named app.
- CORS (Cross-Origin Resource Sharing) is enabled for the app, allowing it to handle requests from different origins.

3. Database Configuration: using PostgreSQL database.

4. Reflecting Database Tables:
- SQLAlchemy's automap_base is used to create a base object called Base.
The Base object is prepared to reflect the tables in the database using 
- Base.prepare(engine, reflect=True). This step allows Flask to interact with the database using object-oriented programming.

5. Creating a Database Session:
- A session object named session is created using Session(engine). This session will be used to interact with the database. 

6. Route for the Index Page: used for test the connection. 

7. Route for Getting Data: 
- It executes a SQL query to select all columns from "disasters" table and fetches the result using session.execute(stmt).fetchall(). 
- The data is returned as JSON using Flask's jsonify function.

8. Main Block


## app.js 

1. Fetch Data from API (fetchData Function):
- The fetchData function is responsible for making an HTTP GET request to an API endpoint at "http://127.0.0.1:5000/getData/" using D3.js's d3.json method.

2. Initialize the Application (init Function):
- The init function is called to initialize the application.
- Inside this function: It calls fetchData with a callback function to process the fetched data.
- It calculates the total number of disasters for each country and sorts the countries by the number of disasters in descending order.
- It selects the top 20 countries based on the sorted order.
- It populates a dropdown list (dropdown) and two unordered lists (ul1 and ul2) with the names of the top 20 countries.
- It initializes plots (bar and bubble plots) and a map with data from the first country in the dropdown list.
- It adds a change listener to the dropdown to respond when a different country is selected.

3. Update Plots (updatePlot Function):
- The updatePlot function updates a bar chart with data for a selected country.
- It calculates the number of disasters for each year and each disaster type.
- It calls Plotly.newPlot to create or update the bar chart.
- The updateBubblePlot function updates a bubble plot with data for a selected country.
- It calculates the total deaths by disaster type for each year.
- It calls Plotly.newPlot to create or update the bubble plot.

4. Initialize Leaflet Map (mymap and markers):
- It initializes a Leaflet map (mymap) with a specified view and adds an OpenStreetMap tile layer.
- It creates a layer group (markers) to manage disaster markers on the map.

5. Initialize Map (initMap Function):
- The initMap function is called to initialize the map component.
- It fetches data and initializes the map with data from the first country in the top 20 countries.

6. Update Map (updateMap Function):
- The updateMap function clears previous markers and adds new markers for disaster data that has valid coordinates. Each marker contains information about the disaster.

7. Calculate Country Bounds (calculateCountryBounds Function):
- The calculateCountryBounds function calculates the bounds (bounding box) for a country based on its coordinates. It finds the minimum and maximum latitude and longitude values within the country's data.

8. Option Changed (optionChanged Function):
- The optionChanged function is called when the user selects a different country from the dropdown.
- It updates the bar and bubble plots with data for the selected country.
- It filters the map data for the selected country and updates the map markers.
- It calculates the bounds for the selected country and sets the map view to focus on that country using mymap.fitBounds(bounds).
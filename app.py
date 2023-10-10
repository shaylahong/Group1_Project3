from flask import Flask, jsonify
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
from decimal import Decimal
from sqlalchemy import text
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

# database URL
DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5432/project3"
engine = create_engine(DATABASE_URL)

# Declare the Base object
Base = automap_base()

# Use the Base class to reflect the database tables
Base.prepare(engine, reflect=True)

# Create a session to interact with the database
session = Session(engine)

@app.route('/')
def index():
    
    try:
        engine.connect()
        print(engine.connect())
        return "Connected"
    except Exception as ex:
        print(ex)
        return "Error is: "


@app.route('/getData/')
def getData():
    try:
        # Use the SQLAlchemy session to execute queries
        stmt = text("SELECT * FROM disasters;")
        result = session.execute(stmt).fetchall()
        # Define the column order
        columns_order = ["year", "disaster_type", "country", "iso", "latitude", "longitude", "total_deaths", "total_damages"]

        result_dict_list = []
        for row in result:
            row_as_dict = dict(row)
            serialized_row = {key: (str(row_as_dict[key]) if isinstance(row_as_dict[key], Decimal) else row_as_dict[key]) for key in columns_order}
            result_dict_list.append(serialized_row)

        return jsonify(result_dict_list)
    except Exception as ex:
        print(ex)
        return f"Error fetching data: {str(ex)}"


@app.route('/Country/')
def Country():
    try:
        # Use the SQLAlchemy session to execute queries
        result = session.execute("SELECT * FROM disasters;").fetchall()
        countries_set = [row[2] for row in result]
        countries_list = list(countries_set)
        unique_countries = list(set(countries_list))
        return jsonify({"countries": unique_countries})

        # Convert the result to a list of dictionaries
        return jsonify({"countries": countries_list})
    except Exception as ex:
        print(ex)
        return f"Error fetching data: {str(ex)}"

if __name__ =="__main__":
    app.run(debug=True)
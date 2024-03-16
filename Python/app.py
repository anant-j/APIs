from flask import Flask
from seymour.main import getData
from rentalCar.calculator import total_price_calculator

app = Flask(__name__)
VERSION = "2.0.0"


@app.route("/")
def health():
    return "Healthy @v"+VERSION


@app.route('/rcc')
def rcc():
    return total_price_calculator()


@app.route('/ski')
def ski():
    data = getData("ski")
    final = "No sessions available"
    if len(data):
        final = data
    return final


@app.route('/snowboard')
def snowboard():
    data = getData("snowboard")
    final = "No sessions available"
    if len(data):
        final = data
    return final

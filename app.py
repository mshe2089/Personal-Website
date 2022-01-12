import os
import json
from flask import Flask, render_template, jsonify, request

from urllib.request import urlopen
from random import randint
from waitress import serve

from py.sat import SATsolve

app = Flask(__name__)

@app.route("/")
def landing(name="Fuck you samuel"):

    if request.environ.get('HTTP_X_FORWARDED_FOR') is None:
        url = "https://ipapi.co/" + request.environ['REMOTE_ADDR'] + "/json/"
    else:
        url = "https://ipapi.co/" + request.environ['HTTP_X_FORWARDED_FOR'] + "/json/"

    locdata = json.load(urlopen(url))

    #print(locdata)

    greeting = ""
    if 'error' not in locdata:
        greeting = " Thanks for visiting all the way from " + locdata['city'] + ", " + locdata['country_name'] + " :)"

    return render_template('landing.html', greet=greeting)

@app.route("/index")
def index():
    return render_template('index.html', num = randint(0,100))

@app.route("/SATsolver")
def SATsolver():
    return render_template('SATsolver.html')

@app.route('/SATsolver_script')
def SATsolver_script():
    formula = request.args.get('formula', None, type=str)
    return {"result": SATsolve(formula)}

if __name__ == "__main__":
    print("Running...")
    #app.run('0.0.0.0',port=8000)
    serve(app, host='0.0.0.0', port=8000)

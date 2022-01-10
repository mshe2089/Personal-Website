import os
import json
from flask import Flask, render_template, jsonify, request

from urllib.request import urlopen
from random import randint
from waitress import serve

app = Flask(__name__)

@app.route("/")
def landing(name="Fuck you samuel"):

    if request.environ.get('HTTP_X_FORWARDED_FOR') is None:
        url = "https://ipapi.co/" + request.environ['REMOTE_ADDR'] + "/json/"
    else:
        url = "https://ipapi.co/" + request.environ['HTTP_X_FORWARDED_FOR'] + "/json/"

    response = urlopen(url)
    locdata = json.load(response)

    print(locdata)

    greeting = ""
    if 'error' not in locdata:
        greeting = "\nThanks for visiting all the way from " + locdata['city'] + " , " + locdata['country_name'] + "!"

    return render_template('landing.html', greet=greeting)

@app.route("/index")
def index():
    return render_template('index.html', num = randint(0,100))

if __name__ == "__main__":
    print("Running.")
    #app.run('0.0.0.0',port=8000)
    serve(app, host='0.0.0.0', port=8080)

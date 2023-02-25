import os, sys, json, time, pprint

from flask import Flask, render_template, jsonify, request
from flask_cors import cross_origin

from urllib.parse import unquote
from urllib.error import HTTPError
from urllib.request import urlopen
from random import randint
from waitress import serve

from scripts.sat import SATsolve
from scripts.getmymarks import getmymarks

app = Flask(__name__)

def landing():
    """
    # Prone to errors - move to lazy loading or something later (And put it in a seperate file)
    if request.environ.get('HTTP_X_FORWARDED_FOR') is None:
        url = "https://ipapi.co/" + request.environ['REMOTE_ADDR'] + "/json/"
    else:
        url = "https://ipapi.co/" + request.environ['HTTP_X_FORWARDED_FOR'] + "/json/"
    
    try:
        locdata = json.load(urlopen(url))
    except HTTPError:
        time.sleep(0.1)
        locdata = json.load(urlopen(url))
    """

    """
    if 'error' not in locdata:
        greeting = " Thanks for visiting all the way from " + locdata['city'] + ", " + locdata['country_name'] + " :)"
    """
    return

@app.route('/api/SATsolver_script')
@cross_origin()
def SATsolver_script():
    print("Request: /api/SATsolver_script")
    formula = unquote(request.headers.get('formula', None, type=str))
    return {"result": SATsolve(formula)}

@app.route('/api/USYDmarks_script')
@cross_origin()
def USYDmarks_script():
    print("Request: /api/USYDmarks_script")
    try:
        username = unquote(request.headers.get('username', None, type=str))
        password = unquote(request.headers.get('password', None, type=str))
        units, WAM, GPA = getmymarks(username, password)
        #print(units)
        #print(WAM)
    except:
        return {"units": "", "results": ""}, 400
    return {"units": units, "results": "Your WAM on a 0-100 scale is: " + WAM + "\nEquivalent GPA on a 7.0 scale is: " + GPA}

@app.route("/api/USYDmarks_source")
@cross_origin()
def USYDmarks_source():
    print("Request: /api/USYDmarks_source")
    codefile = open("./scripts/getmymarks.py", "r")
    codetext = codefile.read()
    codefile.close()
    return {"source": codetext}

@app.route("/api")
@cross_origin()
def ping():
    return {"Hello": "World!"}

if __name__ == "__main__":
    app.config.from_object("config.DevelopmentConfig")
    pprint.pprint(app.config)
    app.run(host="127.0.0.1", port=5000)
    #serve(app, host="127.0.0.1", port=5000)


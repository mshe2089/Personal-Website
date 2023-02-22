import os, sys, json, time, pprint

from flask import Flask, render_template, jsonify, request

from urllib.error import HTTPError
from urllib.request import urlopen
from random import randint
from waitress import serve

from dynamic.py.sat import SATsolve
from dynamic.py.getmymarks import getmymarks

app = Flask(__name__)

@app.route("/")
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

    greeting = ""
    """
    if 'error' not in locdata:
        greeting = " Thanks for visiting all the way from " + locdata['city'] + ", " + locdata['country_name'] + " :)"
    """

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


@app.route("/USYDmarks")
def USYDmarks():
    codefile = open("flaskr/dynamic/py/getmymarks.py", "r")
    codetext = codefile.read()
    codefile.close()
    return render_template('USYDmarks.html', code = codetext)

@app.route('/USYDmarks_script')
def USYDmarks_script():
    try:
        username = request.args.get('username', None, type=str)
        password = request.args.get('password', None, type=str)
        units, WAM = getmymarks(username, password)
        print(units)
        print(WAM)
    except:
        return {"units": "Error. Check your credentials.", "WAM": ""}
    return {"units": units, "WAM": "Your WAM is: " + WAM}

if __name__ == "__main__":

    app.config.from_object("config.ProductionConfig")

    for i in sys.argv[1:]:
        if i == "--development":
            app.config.from_object("config.DevelopmentConfig")
        elif i == "--testing":
            app.config.from_object("config.TestingConfig")
    
    print("We are live!")
    print("Config: ", end = "")    
    pprint.pprint(app.config)

    serve(app, host='0.0.0.0', port=80)

import os, sys, json, time, pprint

from flask import Flask, render_template, jsonify, request
from flask_cors import cross_origin

from urllib.parse import unquote
from urllib.error import HTTPError
from urllib.request import urlopen
from random import randint
from waitress import serve

from scripts.sat import SATsolve

app = Flask(__name__)

@app.route('/api/SATsolver_script')
@cross_origin()
def SATsolver_script():
    print("Request: /api/SATsolver_script")
    formula = unquote(request.headers.get('formula', None, type=str))
    return {"result": SATsolve(formula)}

@app.route("/api")
@cross_origin()
def ping():
    return {"status": "online", "message": "Daniel Lab API is running on the Server."}

if __name__ == "__main__":
    app.config.from_object("config.DevelopmentConfig")
    # For production use waitress-serve in docker
    app.run(host="0.0.0.0", port=5000)


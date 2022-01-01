import os
from flask import Flask, render_template
from random import randint


app = Flask(__name__)

@app.route("/")
def landing(name="Fuck you samuel"):
    return render_template('landing.html', name=name)

@app.route("/index")
def index():
    return render_template('index.html', num = randint(0,100))

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000, debug=True)

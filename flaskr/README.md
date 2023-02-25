# Running in dev mode

from flaskr:

```
python3 app.py --development
```

Launch this and reactf in dev mode, then access at http://localhost:3000/landing. Selenium features currently do not work in dev mode.

# Building the image

from flaskr:

```
docker build -f dockerfile.flaskr -t personal-website-api .
```
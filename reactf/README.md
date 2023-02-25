# Running in development mode

from reactf:

```
yarn start
```

Launch this and flaskr in dev mode, then access at http://localhost:3000/landing

# Building image

from reactf:

```
yarn install
docker build -f dockerfile.reactf -t personal-website-client . 
```
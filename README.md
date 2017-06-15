# Tetris

Excercise in javascript and related technologies:
* npm
* webpack with babel to support es6
* jquery
* snap.svg

## Building

You will need a reasonable new verions of nodejs and npm. I have:

```
$ nodejs -v
v6.11.0
$ npm -v
3.10.10
```

Do `npm install`, which will create node_modules directory with
the needed packages.

```
$ npm install
...
```

In `package.json` I added a called "start" which you run using:

```
$ npm run start
```

This will start the webpack-dev-server which:
* creates a mini webserver on localhost:8080.
* watches the sources and compiles automatically, creating an
  in-memory `dist/bundle.js`.
  
  



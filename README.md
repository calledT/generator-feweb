# Front-end web project generator

[Yeoman](http://yeoman.io) generator that scaffolds out a front-end web project.

## Features

* Gulp for tasks runner.
* Preview server with Browsersync.
* Normalize.css.
* Automagically wire up your Bower components with [main-bower-files](#third-party-dependencies).
* Base structure of Scss and automagically compile Scss(Optional).
* Http-proxy to avoid CORS when develop(Optional).
* Awesome Image Optimization (via OptiPNG, pngquant, jpegtran and gifsicle)(Optional).
* Legacy IE support(Optional).
* Reversioning static files for cache busting(Optional).
* Automagically generate sprite image(Optional).

## Getting Started

- Install: `npm i -g yo bower generator-feweb`
- Run: `yo feweb`
- Run `gulp serve` for browse your page. `gulp build` for optimize your files to dist folder. 

## Options

* --skip-install
  Skips the automatic execution of `bower` and `npm` after scaffolding has finished.

## License

[BSD license](http://opensource.org/licenses/bsd-license.php)


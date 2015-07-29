# Front-end web project generator

[Yeoman](http://yeoman.io) generator that scaffolds out a front-end web project.

## Features

* Gulp for tasks runner.
* Preview by [Browsersync](http://www.browsersync.io/).
* [Normalize.css](https://github.com/necolas/normalize.css).
* Automagically wire up your Bower components with [main-bower-files](https://github.com/ck86/main-bower-files).
* Base structure of Scss and automagically compile Scss(Optional).
* Postcss with processer [[autoprefixer](https://github.com/postcss/autoprefixer),[cssgrace](https://github.com/cssdream/cssgrace)].
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

## Update

To keep with lastest version, run `npm i -g generator-feweb`.

## License

[BSD license](http://opensource.org/licenses/bsd-license.php)


'use strict'

var $ = require('gulp-load-plugins')({pattern: ['gulp-*', 'gulp.*'], replaceString: /^gulp(-|\.)/, lazy: true });

var _              = require('lodash');
var del            = require('del');
var gulp           = require('gulp');
var path           = require('path');
var merge          = require('merge-stream');
var runSequence    = require('run-sequence');
var browserSync    = require('browser-sync');
var autoprefixer   = require('autoprefixer-core');
var mainBowerFiles = require('main-bower-files');<% if (useProxy) { %>
var httpProxy      = require('http-proxy');<% } %>
var cssgrace       = require('cssgrace');
var pkg            = require('./package.json');
var processors     = [autoprefixer({browsers: pkg.browsers}), cssgrace];

var SRC = _.mapKeys(pkg.src, function(value, key) {
  value.globpath = path.join(value.dir, '**', '*' + value.ext);
  return key;
});

// CONST
var SOURCE_PATH      = 'src';
var DEST_PATH        = 'dist';
var MANIFEST         = 'manifest.json';

gulp.task('bower', function() {
  var stream = gulp.src(mainBowerFiles())
    .pipe($.if('**/*.js', gulp.dest(path.join(SRC.js.dir, 'lib'))))<% if (useSass) { %>
    .pipe($.if('**/*.{css,scss}', $.rename({prefix: '_', extname: SRC.scss.ext})))
    .pipe($.if('**/_normalize.scss', gulp.dest(path.join(SRC.scss.dir, 'base'))))
    .pipe($.if(['**/*.scss', '!**/_normalize.scss'], gulp.dest(path.join(SRC.scss.dir, 'vendors'))));<% } else {%>
    .pipe($.if('**/*.css', gulp.dest(SRC.css.dir)));<% } %>

  return stream;
});

<% if (useSass) { %>
gulp.task('sass', function() {
	var stream = gulp.src(SRC.scss.globpath)
    .pipe($.sourcemaps.init())
		.pipe($.sass({precision: 8}).on('error', $.sass.logError))
		.pipe($.postcss(processors))
    .pipe($.sourcemaps.write('./maps'))
		.pipe(gulp.dest(SRC.css.dir))
    .pipe($.if(SRC.css.ext, browserSync.stream()));

	return stream;
});<% } else { %>
gulp.task('concatCss', function() {
  var stream = gulp.src([
      'src/css/normalize.css',
      'src/css/normalize-extra.css',
      'src/css/sprite.css',
      'src/css/main.css'
    ])
    .pipe($.concat('concat.css'))
    .pipe(gulp.dest(SRC.css.dir))
    .pipe(browserSync.stream());

  return stream;
})<% } %>

gulp.task('optimize', function() {
	var assets = $.useref.assets();
	<% if (useRev) { %>var manifest = gulp.src(path.json(DEST_PATH, MANIFEST));<% } %>

	var stream = gulp.src(SRC.html.globpath)
		.pipe(assets)
		.pipe($.if(SRC.js.ext, $.uglify()))
    .pipe($.if(SRC.css.ext, $.minifyCss(<% if (legacy) { %>{compatibility: 'ie7'}<% } %>)))<% if (useRev) { %>
    .pipe($.rev())<% } %>
    .pipe(assets.restore())
    .pipe($.if(SRC.html.ext, $.inlineSource()))
		.pipe($.if(SRC.html.ext, $.replace('../img', 'img')))
    .pipe($.base64({
      extensions: [/\.(jpg|png|svg|gif)\?__inline$/i],
      maxImageSize: 8*1024
    }))
    .pipe($.useref())<% if (useRev) { %>
    .pipe($.revReplace({manifest: manifest}))<% } %>
    .pipe($.if(SRC.html.ext, $.htmlmin({
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeEmptyAttributes: true,
      removeComments: true,
      minifyJS: true,
      minifyCSS: true
    })))
		.pipe(gulp.dest(DEST_PATH));

	return stream;
});

gulp.task('imagemin', function(){
	var stream = gulp.src(SRC.img.globpath, {base: SOURCE_PATH})
			.pipe($.imagemin({progressive: true}))<% if (useRev) { %>
      .pipe($.rev())<% } %>
			.pipe(gulp.dest(DEST_PATH))<% if (useRev) { %>
			.pipe($.rev.manifest(MANIFEST))
			.pipe(gulp.dest(DEST_PATH));<% } %>

	return stream;
});

<% if (useSpritesmith) { %>
gulp.task('sprite', function () {
  var spriteData = gulp.src(path.join(SRC.img.dir, 'sprites/*.png')).pipe($.spritesmith({
    padding: 1,
    imgName: 'sprite.png',
    imgPath: '../sprite.png',
    cssName: '<% if (useSass) { %>_sprite.scss<% } else { %>sprite.css<% } %>'
  }));

  var imgStream = spriteData.img
      .pipe($.imagemin())
      .pipe(gulp.dest(SRC.img.dir));

  var cssStream = spriteData.css<% if (useSass) { %>
      .pipe(gulp.dest(path.join(SRC.scss.dir, 'helpers')));<% } else { %>
      .pipe(gulp.dest(SRC.css.dir));<% } %>

  return merge(imgStream, cssStream);
});<% } %>

<% if (useProxy) { %>
var proxy = httpProxy.createProxyServer({
   target: pkg.proxyAddr
 });

var proxyMiddleware = function(req, res, next) {
 if (req.url.indexOf('api') != -1) {
   proxy.web(req, res);
 } else {
   next();
 }
};<% } %>

gulp.task('browserSync', [<% if (useSass) { %>'sass'<% } else { %>'concatCss'<% }%>], function(cb) {
	browserSync.init({
		startPath: 'index.html',
		server: { <% if (useProxy) { %>
    	middleware: proxyMiddleware,<% } %>
      baseDir: SOURCE_PATH
		}
	});

  <% if (useSass) { %>gulp.watch(SRC.scss.globpath, ['sass']);<% } else { %>
  gulp.watch([SRC.css.globpath, '!src/css/concat.css'], ['concatCss']);<% } %>
	gulp.watch(SRC.html.globpath).on('change', browserSync.reload);
  cb();
});


gulp.task('serve', function(cb) {
  runSequence('bower',<% if (useSpritesmith) { %> 'sprite',<% } %> 'browserSync', cb);
});

gulp.task('default', ['serve']);

gulp.task('build', function(cb) {
	runSequence('clean',<% if (useSpritesmith) { %> 'sprite',<% } %><% if (useSass) { %> 'sass',<% } else { %> 'concatCss',<% } %>'imagemin','optimize', cb);
});

gulp.task('clean', function(cb) {
  del(DEST_PATH, cb);
});

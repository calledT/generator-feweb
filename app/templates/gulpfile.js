'use strict'

var $               = require('gulp-load-plugins')({pattern: ['gulp-*', 'gulp.*']});
var _               = require('lodash');
var del             = require('del');
var gulp            = require('gulp');
var path            = require('path');
var merge           = require('merge-stream');
var runSequence     = require('run-sequence');
var browserSync     = require('browser-sync');
var autoprefixer    = require('autoprefixer');<% if (useProxy) { %>
var proxyMiddleware = require('http-proxy-middleware');<% } %>
var pkg             = require('./package.json');

// CONST
var SOURCE_PATH      = 'src';
var DEST_PATH        = 'dist';
var MANIFEST         = 'manifest.json';
var SRC = _.mapKeys(pkg.src, function(value, key) {
  value.globpath = path.join(value.dir, '**', '*' + value.ext);
  if (key === 'img') {
    value.sprite = {};
    value.sprite.dir = path.join(value.dir, 'sprites');
    value.sprite.globpath = path.join(value.sprite.dir, '**', '*' + value.ext);
  }
  return key;
});


gulp.task('sass', function() {
  var processors = [autoprefixer({browsers: pkg.browsers})];

	var stream = gulp.src(SRC.scss.globpath)
    .pipe($.sourcemaps.init())
		.pipe($.sass({precision: 8}).on('error', $.sass.logError))
		.pipe($.postcss(processors))
    .pipe($.sourcemaps.write('./maps'))
		.pipe(gulp.dest(SRC.css.dir))
    .pipe($.if(SRC.css.ext, browserSync.stream()));

	return stream;
});

gulp.task('optimize', function() {
	<% if (useRev) { %>var manifest = gulp.src(path.json(DEST_PATH, MANIFEST));<% } %>

	var stream = gulp.src(SRC.html.globpath)
		.pipe($.useref())
    .pipe($.base64())
    .pipe($.if(SRC.js.ext, $.uglify()))
    .pipe($.if(SRC.css.ext, $.csso()))<% if (useRev) { %>
    .pipe($.rev())<% } %>
    .pipe($.if(SRC.html.ext, $.inlineSource()))
    .pipe($.if(SRC.html.ext, $.replace('../img', 'img')))<% if (useRev) { %>
    .pipe($.revReplace({manifest: manifest}))<% } %>
    .pipe($.if(SRC.html.ext, $.htmlmin(pkg.htmlmin)))
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
  var spriteData = gulp.src(SRC.img.sprite.globpath)
      .pipe($.spritesmith({
        padding: 1,
        imgName: 'sprite.png',
        imgPath: '../sprite.png',
        cssName: '_sprite.scss'
      }));

  var imgStream = spriteData.img
      .pipe(gulp.dest(SRC.img.dir));

  var cssStream = spriteData.css
      .pipe(gulp.dest(path.join(SRC.scss.dir, 'helpers')));

  return merge(imgStream, cssStream);
});<% } %>


gulp.task('browserSync', ['sass'], function(cb) {
	browserSync.init({
    open: 'external',
		server: {
      index: 'index.html',
      baseDir: SOURCE_PATH<% if (useProxy) { %>,
      middleware: [proxyMiddleware(['/api'], {target: pkg.proxyAddr})]<% } %>
		}
	});

  gulp.watch(SRC.scss.globpath, ['sass']);
	gulp.watch(SRC.html.globpath).on('change', browserSync.reload);
  cb();
});

gulp.task('serve', function(cb) {
  runSequence(<% if (useSpritesmith) { %> 'sprite',<% } %> 'browserSync', cb);
});

gulp.task('build', function(cb) {
	runSequence('clean',<% if (useSpritesmith) { %> 'sprite',<% } %>'sass','imagemin','optimize', cb);
});

gulp.task('clean', function(cb) {
  del(DEST_PATH, cb);
});

gulp.task('default', ['serve']);

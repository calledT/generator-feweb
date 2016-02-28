'use strict'

var $               = require('gulp-load-plugins')();
var _               = require('lodash');
var fs              = require('fs');
var del             = require('del');
var gulp            = require('gulp');
var path            = require('path');
var argv            = require('yargs').argv;
var merge           = require('merge-stream');
var runSequence     = require('run-sequence');
var browserSync     = require('browser-sync');
var autoprefixer    = require('autoprefixer');
var proxyMiddleware = require('http-proxy-middleware');
var pkg             = require('./package.json');

// TASK ARGV
var proxyAddr = argv.proxyAddr !== undefined ? argv.proxyAddr : pkg.proxyAddr;
var useRev = argv.rev === 'false' ? false : pkg.useRev;

// CONST
var SOURCE_PATH      = 'src';
var DEST_PATH        = 'dist';
var MANIFEST         = 'manifest.json';
var SRC = _.mapKeys(pkg.src, function(value, key) {
  value.globext = path.join('*' + value.ext);
  value.globpath = path.join(value.dir, '**', value.globext);
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
		.pipe($.sass({includePaths: 'node_modules/found.scss', precision: 8}).on('error', $.sass.logError))
		.pipe($.postcss(processors))
    .pipe($.sourcemaps.write('./maps'))
		.pipe(gulp.dest(SRC.css.dir))
    .pipe($.if(SRC.css.ext, browserSync.stream()));

	return stream;
});

gulp.task('useref', function() {
	var manifest = gulp.src(path.join(DEST_PATH, MANIFEST));

  var condition = function (file) {
    if (!useRev)
      return false;

    if ($.match(file, SRC.html.globext))
      return false;

    return true;
  };

	var stream = gulp.src(SRC.html.globpath)
		.pipe($.useref())
    .pipe($.base64())
    .pipe($.if(SRC.js.globext, $.uglify()))
    .pipe($.if(SRC.css.globext, $.cssnano({zindex: false})))
    .pipe($.if(condition, $.rev(), $.util.noop()))
    .pipe($.if(SRC.html.globext, $.inlineSource({rootpath: SOURCE_PATH})))
    .pipe($.if(SRC.html.globext, $.replace('../img', 'img')))
    .pipe($.if(useRev, $.revReplace({manifest: manifest})))
    .pipe($.if(SRC.html.globext, $.htmlmin(pkg.htmlmin)))
		.pipe(gulp.dest(DEST_PATH));

	return stream;
});

gulp.task('resProcess', function() {
  var imgStream = gulp.src([SRC.img.globpath], {base: SOURCE_PATH})
      .pipe($.ignore.exclude('**/sprites/**'))
      .pipe($.imagemin({progressive: true}));

  var mediaStream = gulp.src(SRC.media.globpath, {base: SOURCE_PATH});
  var iconfontStream = gulp.src(SRC.iconfont.globpath, {base: SOURCE_PATH});

  var stream = merge(imgStream, mediaStream, iconfontStream)
      .pipe($.if(useRev, $.rev(), $.util.noop()))
      .pipe(gulp.dest(DEST_PATH))
      .pipe($.if(useRev, $.rev.manifest(path.join(DEST_PATH, MANIFEST), {base: DEST_PATH, merge: true}), $.util.noop()))
      .pipe($.if(useRev, gulp.dest(DEST_PATH), $.util.noop()));

  return stream;
});

<% if (includeSpritesmith) { %>
gulp.task('sprite', function () {
  var spriteData = gulp.src(SRC.img.sprite.globpath)
      .pipe($.spritesmith({
        padding: 1,
        imgName: 'spritesmith.png',
        imgPath: '../img/spritesmith.png',
        cssName: '_spritesmith.scss'
      }));

  var imgStream = spriteData.img
      .pipe(gulp.dest(SRC.img.dir));

  var cssStream = spriteData.css
      .pipe(gulp.dest(SRC.scss.dir));

  return merge(imgStream, cssStream);
});<% } %>


gulp.task('browserSync', ['sass'], function(cb) {
	browserSync.init({
    open: 'external',
		server: {
      index: 'index.html',
      baseDir: SOURCE_PATH,
      middleware: [proxyMiddleware(['/api'], {target: proxyAddr})]
		}
	});

  gulp.watch(SRC.scss.globpath, ['sass']);
	gulp.watch([SRC.html.globpath, SRC.js.globpath]).on('change', browserSync.reload);
  cb();
});

gulp.task('clean:dest', function() {
  return del(DEST_PATH);
});

gulp.task('serve', function(cb) {
  runSequence(<% if (includeSpritesmith) { %>'sprite', <% } %>'browserSync', cb);
});

gulp.task('build', function(cb) {
  runSequence('clean:dest',<% if (includeSpritesmith) { %> 'sprite',<% } %> 'sass','resProcess','useref', cb);
});

gulp.task('default', ['serve']);

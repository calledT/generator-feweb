'use strict'

var del            = require('del');
var gulp           = require('gulp');
var path           = require('path');
var runSequence    = require('run-sequence');
var browserSync    = require('browser-sync');
var autoprefixer   = require('autoprefixer-core');
var mainBowerFiles = require('main-bower-files');<% if (useProxy) { %>
var httpProxy      = require('http-proxy');<% } %>
var cssgrace       = require('cssgrace');
var pkg            = require('./package.json');
var processors     = [autoprefixer({browsers: pkg.autoprefixer_browsers}), cssgrace];

var $ = require('gulp-load-plugins')({pattern: ['gulp-*', 'gulp.*'], replaceString: /^gulp(-|\.)/, lazy: true });


gulp.task('bower', function() {
  var stream = gulp.src(mainBowerFiles())
    .pipe($.if('**/*.js', gulp.dest('src/js/lib')))<% if (useSass) { %>
    .pipe($.if('**/*.{css,scss}', $.rename({prefix: '_', extname: '.scss'})))
    .pipe($.if('**/_normalize.scss', gulp.dest('src/scss/base')))
    .pipe($.if(['**/*.scss', '!**/_normalize.scss'], gulp.dest('src/scss/vendors')));<% } else {%>
    .pipe($.if('**/*.css', gulp.dest('src/css')));<% } %>

  return stream;
});

<% if (useSass) { %>
gulp.task('sass', function() {
	var stream = gulp.src('src/scss/**/*.scss')
    .pipe($.sourcemaps.init())
		.pipe($.sass({precision: 8}).on('error', $.sass.logError))
		.pipe($.postcss(processors))
    .pipe($.sourcemaps.write('./maps'))
		.pipe(gulp.dest('src/css'))
    .pipe(browserSync.stream({match: '**/*.css'}));

	return stream;
});<% } else { %>
gulp.task('concatCss', function() {
  var stream = gulp.src([
      'src/css/normalize.css',
      'src/css/normalize-extra.css',
      'src/css/**/*.css',
      '!src/css/main.css'
    ])
    .pipe($.concat('main.css'))
    .pipe(gulp.dest('src/css'))
    .pipe(browserSync.stream({match: '**/*.css'}));

  return stream;
})<% } %>

gulp.task('optimize', function() {
	var assets = $.useref.assets();
	<% if (useRev) { %>var manifest = gulp.src('dist/manifest.json');<% } %>

	var stream = gulp.src('src/*.html')
		.pipe(assets)
		.pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.minifyCss(<% if (legacy) { %>{compatibility: 'ie7'}<% } %>)))<% if (useRev) { %>
    .pipe($.rev())<% } %>
    .pipe(assets.restore())
    .pipe($.if('*.html', $.inlineSource()))
		.pipe($.if('*.html', $.replace('../img', 'img')))
    .pipe($.base64({
      extensions: [/\.(jpg|png|svg|gif)\?__inline$/i],
      maxImageSize: 8*1024
    }))
    .pipe($.useref())<% if (useRev) { %>
    .pipe($.revReplace({manifest: manifest}))<% } %>
    .pipe($.if('*.html', $.htmlmin({
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeEmptyAttributes: true,
      removeComments: true,
      minifyJS: true,
      minifyCSS: true
    })))
		.pipe(gulp.dest('dist/'));

	return stream;
});

<% if (useImagemin) { %>
gulp.task('imagemin', function(){
	var stream = gulp.src('src/img/*.{jpg,png,gif,svg}')
			.pipe($.imagemin({
				progressive: true
			}))<% if (useRev) { %>
      .pipe($.rev())<% } %>
			.pipe(gulp.dest('dist/img'))<% if (useRev) { %>
			.pipe($.rev.manifest('manifest.json'))
			.pipe(gulp.dest('dist/'));<% } %>

	return stream;
});<% } %>

<% if (useSpritesmith) { %>
gulp.task('sprite', function () {
  var spriteData = gulp.src('src/img/sprites/*.png').pipe($.spritesmith({
    padding: 1,
    imgName: 'sprite.png',
    imgPath: '../',
    cssName: '<% if (useSass) { %>_sprite.scss<% } else { %>sprite.css<% } %>'
  }));

  return spriteData
    .pipe($.if('*.png', gulp.dest('src/img')))
    <% if (useSass) { %>.pipe($.if('*.scss', gulp.dest('src/scss/helpers')))<% } else { %>.pipe($.if('*.css', gulp.dest('src/css')))<% } %>;
});<% } %>

<% if (useProxy) { %>
var proxy = httpProxy.createProxyServer({
   target: 'http://127.0.0.1:3000'
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
      baseDir: 'src'
		}
	});

  <% if (useSass) { %>gulp.watch('src/scss/**/*.scss', ['sass']);<% } else { %>
  gulp.watch(['src/css/**/*.css', '!src/css/main.css'], ['concatCss']);<% } %>
	gulp.watch(['src/**/*.{js,html,jpg,png,svg,gif}']).on('change', browserSync.reload);
  cb();
});


gulp.task('serve', function(cb) {
  runSequence('bower',<% if (useSpritesmith) { %> 'sprite',<% } %> 'browserSync', cb);
});


gulp.task('default', ['serve']);


gulp.task('build', function(cb) {
	runSequence('clean',<% if (useSpritesmith) { %> 'sprite',<% } %><% if (useSass) { %> 'sass',<% } else { %> 'concatCss',<% } %><% if (useImagemin) { %> 'imagemin',<% } %> 'optimize', cb);
});

gulp.task('clean', function(cb) {
  del('dist', cb);
});

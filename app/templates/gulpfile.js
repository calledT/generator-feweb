
var del            = require('del');
var gulp           = require('gulp');
var path           = require('path');
var runSequence    = require('run-sequence');
var browserSync    = require('browser-sync');
var autoprefixer   = require('autoprefixer-core');
var mainBowerFiles = require('main-bower-files');<% if (useImagemin) { %>
var pngquant       = require('imagemin-pngquant');<% } %><% if (useProxy) { %>
var httpProxy      = require('http-proxy');<% } %>
var reload         = browserSync.reload;

var $ = require('gulp-load-plugins')({pattern: ['gulp-*', 'gulp.*'], replaceString: /^gulp(-|\.)/, lazy: true });

var AUTOPREFIXER_BROWSERS = [
  "Explorer >= 9", /** Internet Explorer **/
  "Firefox >= 24", /**  Mozilla Firefox **/
  "Chrome >= 31", /** Google Chrome **/
  "Safari >= 6", /** desktop Safari **/
  "Opera >= 23", /** Opera **/
  "iOS >= 6", /** iOS Safari **/
  "Android >= 4.0", /** Android WebView **/
  "and_uc >= 9", /** UC for Android **/
  "and_ff >= 30", /** Firefox for Android **/
  "and_chr >= 31", /** Chrome for Android **/
  "ie_mob >= 10", /** Internet Explorer Mobile **/
  "bb >= 10", /** Blackberry browser **/
  "op_mob >= 10" /** Opera Mobile **/
];

var processors = [autoprefixer({browsers: AUTOPREFIXER_BROWSERS})];


gulp.task('cssmin', function() {
  var stream = gulp.src('src/css/**/*.css', {base: 'src'})
      .pipe($.base64({
        extensions: [/\.(jpg|png|svg)\?base64$/i],
        maxImageSize: 8*1024
      }))
      .pipe($.minifyCss(<% if (legacy) { %>{compatibility: 'ie7'}<% } %>))
      .pipe($.postcss(processors))
      .pipe($.rename({suffix: '.min'}))
      .pipe(gulp.dest('dist'));

  return stream;
});


gulp.task('uglifyjs', function() {
  var stream = gulp.src('src/js/**/*.js', {base: 'src'})
      .pipe($.uglify())
      .pipe($.rename({suffix: '.min'}))
      .pipe(gulp.dest('dist'));

  return stream;
})


gulp.task('htmlmin', function() {
  var stream = gulp.src('src/*.html', {base: 'src'})
      .pipe($.inlineSource())
      .pipe($.htmlmin({
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeEmptyAttributes: true,
        removeComments: true,
        minifyJS: true,
        minifyCSS: true
      }))
      .pipe($.replace('../img', 'img'))
      .pipe($.base64({
        extensions: [/\.(jpg|png|svg)\?base64$/i],
        maxImageSize: 8*1024
      }))
      .pipe(gulp.dest('dist'));

  return stream;
})

gulp.task('bower', function() {
  var stream = gulp.src(mainBowerFiles())
    .pipe($.if('*.js', gulp.dest('src/js/lib')))
    .pipe($.if('*.css', gulp.dest('src/css')))
});

<% if (useSass) { %>
gulp.task('sass', function() {
	var stream = gulp.src('src/scss/**/*.scss')
      .pipe($.sourcemaps.init())
			.pipe($.sass({precision: 8}).on('error', $.sass.logError))
			.pipe($.postcss(processors))
      .pipe($.sourcemaps.write('./maps'))
			.pipe(gulp.dest('src/css'));

	return stream;
});
<% } %>

<% if (useRev) { %>
gulp.task('optimize', function() {
	var assets = $.useref.assets();
	var manifest = gulp.src('dist/manifest.json');

	var stream = gulp.src('src/*.html')
			.pipe(assets)
			.pipe($.if('*.js', $.uglify()))
			.pipe($.if('*.css', $.minifyCss()))
			.pipe($.rev())
			.pipe(assets.restore())
			.pipe($.if('*.html', $.inlineSource()))
			.pipe($.useref())
			.pipe($.revReplace({manifest: manifest}))
			.pipe($.if('*.html', $.htmlmin({
				collapseWhitespace: true,
				collapseBooleanAttributes: true,
				removeEmptyAttributes: true,
				removeComments: true,
				minifyJS: true,
				minifyCSS: true
			})))
			.pipe($.if('*.html', $.replace('../img', 'img')))
			.pipe(gulp.dest('dist/'));

	return stream;
});
<% } %>


<% if (useImagemin) { %>
gulp.task('imagemin', function(){
	var stream = gulp.src('src/img/*.{jpg,png,gif}')
			.pipe($.imagemin({
				progressive: true,
				use: [pngquant()]
			}))<% if (useRev) { %>
      .pipe($.rev())<% } %>
			.pipe(gulp.dest('dist/img'))<% if (useRev) { %>
			.pipe($.rev.manifest('manifest.json'))
			.pipe(gulp.dest('dist'));<% } %>

	return stream;
});
<% } %>

<% if (useProxy) { %>
var proxy = httpProxy.createProxyServer({
   target: 'http://127.0.0.1:80'
 });

var proxyMiddleware = function(req, res, next) {
 if (req.url.indexOf('api') != -1) {
   proxy.web(req, res);
 } else {
   next();
 }
};
<% } %>


gulp.task('clean', function(cb) {
  del('dist', cb);
});


gulp.task('serve', ['bower'<% if (useSass) { %>, 'sass'<% } %>], function() {
	browserSync.init({
		startPath: 'index.html',
		server: {
      <% if (useProxy) { %>
    	middleware: proxyMiddleware,
      <% } %>
      baseDir: 'src'
		}
	});

  <% if (useSass) { %>
	gulp.watch('src/scss/**/*.scss', ['sass']);
  <% } %>
	gulp.watch(['src/**/*.{js,css,html,jpg,png,svg}']).on('change', reload);
});

gulp.task('default', ['serve']);

<% if (useRev && useImagemin) { %>
gulp.task('build', function(cb) {
	runSequence('clean', 'sass', 'imagemin', 'optimize');
});
<% } %>






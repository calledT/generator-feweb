'use strict';

var path = require('path');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');

describe('default generator', function() {

  before(function (done) {
    helpers.run(path.join(__dirname, '../app'))
      .withPrompts({features: []})
      .on('end', done);
  });

  it('should create expected files', function () {
    var expectedContent = [
      ['package.json', /"version": "0.0.1"/]
    ];

    var expected = [
      '.gitignore',
      '.editorconfig',
      'src/index.html',
      'src/js/main.js',
      'src/scss/main.scss'
    ];

    assert.file(expected);
    assert.fileContent(expectedContent);
  })

  it('should contain necessary tasks', function () {
    [
      'sass',
      'useref',
      'resProcess',
      'browserSync',
      'clean:dest',
      'serve',
      'default'
    ].forEach(function (task) {
      assert.fileContent('gulpfile.js', 'gulp.task(\'' + task);
    });
  });
});


describe('include spritesmith', function() {
  before(function (done) {
    helpers.run(path.join(__dirname, '../app'))
      .withPrompts({features: ['includeSpritesmith']})
      .on('end', done);
  });

  it('should contain sprite tasks', function () {
    assert.fileContent('package.json', 'gulp.spritesmith');
    assert.fileContent('gulpfile.js', 'gulp.task(\'sprite');
  });

  it('should import spritesmith mixin', function () {
    assert.fileContent('src/scss/main.scss', '@import \'spritesmith\'');
  });
});


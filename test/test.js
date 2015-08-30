'use strict';
var path = require('path');
var helpers = require('yeoman-generator').test;
var assert = require('yeoman-assert');

describe('files', function() {

  before(function (done) {
    helpers.run(path.join(__dirname, '../app'))
      .inDir(path.join(__dirname, '.tmp'))
      .withOptions({'skip-install': true})
      .on('end', done);
  });

  it('create expected files', function () {
    var expectedContent = [
      ['bower.json', /"normalize.css": "~3.0.3"/],
      ['package.json', /"version": "0.1.0"/]
    ];

    var expected = [
      '.gitignore',
      '.bowerrc',
      '.editorconfig',
      'src/index.html',
      'src/js/main.js'
    ];

    assert.file(expected);
    assert.fileContent(expectedContent);
  })
});

describe('sass', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../app'))
      .inDir(path.join(__dirname, '.tmp'))
      .withOptions({'skip-install': true})
      .withPrompts({tasks: [
        'useSass'
      ]})
      .on('end', done);
  });

  it('create scss files', function () {
    assert.file([
      'src/scss/main.scss',
      'src/scss/base/_normalize-extra.scss',
      'src/scss/helpers/_variables.scss',
      'src/scss/helpers/_mixins.scss',
      'src/scss/helpers/mixins/_border-radius.scss',
      'src/scss/helpers/mixins/_clearfix.scss',
      'src/scss/helpers/mixins/_hidden.scss',
      'src/scss/helpers/mixins/_link-text-offscreen.scss',
      'src/scss/helpers/mixins/_media-print.scss',
      'src/scss/helpers/mixins/_onepixel.scss',
      'src/scss/helpers/mixins/_visuallyhidden.scss',
      'src/scss/helpers/_functions.scss',
      'src/scss/helpers/functions/_calc-percent.scss',
      'src/scss/helpers/functions/_px2em.scss',
      'src/scss/helpers/functions/_strip-unit.scss'
    ]);
    assert.noFile('src/css/normalize-extra.css');
  });

  it('adds the Gulp plugin', function () {
    assert.fileContent('package.json', 'gulp-sass');
  });

  it('adds the Gulp task', function () {
    assert.fileContent('gulpfile.js', 'sass');
  });
});

describe('css', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../app'))
      .inDir(path.join(__dirname, '.tmp'))
      .withOptions({'skip-install': true})
      .on('end', done);
  });

  it('create css file', function () {
    assert.file('src/css/normalize-extra.css');
  })

  it('adds the Gulp task', function () {
    assert.fileContent('gulpfile.js', 'concat');
  });
})

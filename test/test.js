'use strict';
var path = require('path');
var helpers = require('yeoman-generator').test;
var assert = require('yeoman-assert');

describe('files', function() {

  before(function (done) {
    helpers.run(path.join(__dirname, '../app'))
      .inDir(path.join(__dirname, '.tmp'))
      .withOptions({'skip-install': true})
      .withPrompts({tasks: ['useSass']})
      .on('end', done);
  });

  it('create expected files', function () {
    var expectedContent = [
      ['package.json', /"version": "0.0.1"/]
    ];

    var expected = [
      '.gitignore',
      '.editorconfig',
      'src/index.html',
      'src/js/main.js',
      'src/scss/main.scss',
      'src/scss/base/_normalize-extra.scss',
      'src/scss/base/_variables.scss',
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
    ];

    assert.file(expected);
    assert.fileContent(expectedContent);
  })
});

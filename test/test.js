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
      'src/scss/main.scss'
    ];

    assert.file(expected);
    assert.fileContent(expectedContent);
  })
});

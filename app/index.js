'use strict';
var generators = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var mkdirp = require('mkdirp');

module.exports = generators.Base.extend({
  constructor: function() {

    generators.Base.apply(this, arguments);

    this.option('skip-welcome-message', {
      desc: 'Skip welcome message',
      type: Boolean,
      defaults: false
    });

    this.option('skip-install', {
      desc: 'Do not install dependencies',
      type: Boolean,
      defaults: false
    });

    this.skipWelcome = this.options['skip-welcome-message'];
    this.skipInstall = this.options['skip-install'];
    this.pkg = require('../package.json');
  },
  prompting: function() {
    var done = this.async();

    var prompts = [{
      type: 'confirm',
      name: 'legacy',
      message: 'Support legacy ie?',
      default: true,
      when: function (answers) {
      }
    }, {
      type: 'checkbox',
      name: 'tasks',
      message: 'What more gulp tasks would you like?',
      choices: [{
        name: 'Sass',
        value: 'useSass',
        checked: true
      }, {
        name: 'Reversioning',
        value: 'useRev',
        checked: true
      }, {
        name: 'Proxyserver',
        value: 'useProxy',
        checked: true
      }, {
        name: 'Imagemin',
        value: 'useImagemin',
        checked: true
      }]
    }, {
      type: 'input',
      name: 'projectname',
      message: 'Your project name',
      default : this.appname // Default to current folder name
    }];

    this.prompt(prompts, function (answers) {
      var tasks = answers.tasks;

      function hasTask(feat) {
        return tasks && tasks.indexOf(feat) !== -1;
      }

      this.useSass = hasTask('useSass');
      this.useRev = hasTask('useRev');
      this.useProxy = hasTask('useProxy');
      this.useImagemin = hasTask('useImagemin');
      this.projectname = answers.projectname;
      this.legacy = answers.legacy;

      done();
    }.bind(this));
  },
  writing: {
    gulpfile: function() {
      this.fs.copyTpl(
        this.templatePath('gulpfile.js'),
        this.destinationPath('gulpfile.js'),
        {
          useSass: this.useSass,
          useProxy: this.useProxy,
          useRev: this.useRev,
          useImagemin: this.useImagemin,
          legacy: this.legacy
        }
      );
    },
    packageJSON: function() {
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'),
        {
          useSass: this.useSass,
          useProxy: this.useProxy,
          useRev: this.useRev,
          useImagemin: this.useImagemin
        }
      )
    },
    html: function() {
      this.fs.copyTpl(
        this.templatePath('index.html'),
        this.destinationPath('index.html'),
        {
          useRev: this.useRev,
          projectname: this.projectname,
          legacy: this.legacy
        }
      )
    },
    css: function() {
      if (!this.useSass) {
        this.fs.copy(
          this.templatePath('normalize.css'),
          this.destinationPath('src/css/main.css')
        );
      }
    },
    sass: function() {
      if (this.useSass) {
        this.fs.copyTpl(
          this.templatePath('_variables.scss'),
          this.destinationPath('src/scss/helpers/_variables.scss'),
          {legacy: this.legacy}
        );
        this.fs.copy(
          this.templatePath('main.scss'),
          this.destinationPath('src/scss/main.scss')
        );
        this.fs.copy(
          this.templatePath('normalize.css'),
          this.destinationPath('src/scss/base/_normalize.scss')
        );
        this.fs.copy(
          this.templatePath('_typo.scss'),
          this.destinationPath('src/scss/base/_typo.scss')
        );
        this.fs.copy(
          this.templatePath('_mixins.scss'),
          this.destinationPath('src/scss/helper/_mixins.scss')
        );
        this.fs.copy(
          this.templatePath('_functions.scss'),
          this.destinationPath('src/scss/helper/_functions.scss')
        );
        this.fs.copy(
          this.templatePath('mixins/*.scss'),
          this.destinationPath('src/scss/helper/mixins')
        );
        this.fs.copy(
          this.templatePath('functions/*.scss'),
          this.destinationPath('src/scss/helper/functions')
        )
      }
    },
    misc: function () {
      mkdirp('src/img');
      mkdirp('src/js');
      mkdirp('src/css');
      if (this.useSass) {
        mkdirp('src/scss/components');
        mkdirp('src/scss/layouts');
        mkdirp('src/scss/pages');
        mkdirp('src/scss/vendors');
      }
    }
  },
  install: function() {

  }
});

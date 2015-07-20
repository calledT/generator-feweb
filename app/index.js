'use strict';

var generators = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var mkdirp = require('mkdirp');

module.exports = generators.Base.extend({
  constructor: function() {
    generators.Base.apply(this, arguments);

    this.option('skip-welcome-message', {
      desc: 'Skips the welcome message',
      type: Boolean
    });

    this.option('skip-install-message', {
      desc: 'Skips the message after the installation of dependencies',
      type: Boolean
    });
  },
  prompting: function() {
    var done = this.async();

    var prompts = [{
      name: 'legacy',
      message: 'Support legacy ie?',
      default: 'Y/n'
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
      type: 'checkbox',
      name: 'features',
      message: 'What more would you like?',
      choices: [{
        name: 'Modernizr',
        value: 'includeModernizr',
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
      var features = answers.features;

      function has(feat, arr) {
        return arr && arr.indexOf(feat) !== -1;
      }

      this.useSass = has('useSass', tasks);
      this.useRev = has('useRev', tasks);
      this.useProxy = has('useProxy', tasks);
      this.useImagemin = has('useImagemin', tasks);
      this.includeModernizr = has('includeModernizr', features);
      this.projectname = answers.projectname;
      this.legacy = (/y/i).test(answers.legacy);

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
    bower: function () {
      var bowerJson = {
        name: this.appname,
        private: true,
        dependencies: {}
      };

      if (this.includeModernizr) {
        bowerJson.dependencies['modernizr'] = '~2.8.3';
      }

      this.fs.writeJSON('bower.json', bowerJson);
      this.fs.copy(
        this.templatePath('bowerrc'),
        this.destinationPath('.bowerrc')
      );
    },
    git: function () {
      this.fs.copy(
        this.templatePath('gitignore'),
        this.destinationPath('.gitignore')
      );
    },
    editorConfig: function () {
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      );
    },
    html: function() {
      this.fs.copyTpl(
        this.templatePath('index.html'),
        this.destinationPath('index.html'),
        {
          useRev: this.useRev,
          includeModernizr: this.includeModernizr,
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
          this.templatePath('scss/_variables.scss'),
          this.destinationPath('src/scss/helpers/_variables.scss'),
          {legacy: this.legacy}
        );
        this.fs.copy(
          this.templatePath('scss/main.scss'),
          this.destinationPath('src/scss/main.scss')
        );
        this.fs.copy(
          this.templatePath('normalize.css'),
          this.destinationPath('src/scss/base/_normalize.scss')
        );
        this.fs.copy(
          this.templatePath('scss/_extra.scss'),
          this.destinationPath('src/scss/base/_normalize-extra.scss')
        );
        this.fs.copy(
          this.templatePath('scss/_mixins.scss'),
          this.destinationPath('src/scss/helper/_mixins.scss')
        );
        this.fs.copy(
          this.templatePath('scss/_functions.scss'),
          this.destinationPath('src/scss/helper/_functions.scss')
        );
        this.fs.copy(
          this.templatePath('scss/mixins/*.scss'),
          this.destinationPath('src/scss/helper/mixins')
        );
        this.fs.copy(
          this.templatePath('scss/functions/*.scss'),
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
  install: function () {
    this.installDependencies({
      skipInstall: this.options['skip-install'],
      skipMessage: this.options['skip-install-message']
    });
  }
});

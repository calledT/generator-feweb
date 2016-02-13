'use strict';

var generators = require('yeoman-generator');
var yosay      = require('yosay');
var chalk      = require('chalk');
var mkdirp     = require('mkdirp');
var path       = require('path');
var _s         = require('underscore.string');

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

    this.option('skip-install', {
      type: Boolean,
      default: false
    });
  },
  prompting: function() {
    var done = this.async();

    if (!this.options['skip-welcome-message']) {
      this.log(yosay('\'Allo \'allo! Out of the box I include HTML5 Boilerplate, and a gulpfile to build your webpage.'));
    }

    var prompts = [{
      name: 'legacy',
      message: 'Support legacy ie?',
      default: 'Y/n'
    }, {
      type: 'checkbox',
      name: 'features',
      message: 'What more would you like?',
      choices: [{
        name: 'JQuery',
        value: 'includeJQuery',
        checked: true
      }]
    }, {
      type: 'checkbox',
      name: 'tasks',
      message: 'What more gulp tasks would you like?',
      choices: [{
        name: 'Static asset revisioning',
        value: 'useRev',
        checked: true
      }, {
        name: 'Proxy server for browserSync',
        value: 'useProxy',
        checked: true
      }, {
        name: 'Convert a set of images into a spritesheet',
        value: 'useSpritesmith',
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

      this.useRev = has('useRev', tasks);
      this.useProxy = has('useProxy', tasks);
      this.useSpritesmith = has('useSpritesmith', tasks);
      this.includeJQuery = has('includeJQuery', features);
      this.projectname = _s.slugify(answers.projectname);
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
          useProxy: this.useProxy,
          useRev: this.useRev,
          useSpritesmith: this.useSpritesmith,
          legacy: this.legacy
        }
      );
    },
    packageJSON: function() {
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'),
        {
          projectname: this.projectname,
          includeJQuery: this.includeJQuery,
          legacy: this.legacy,
          useRev: this.useRev,
          useProxy: this.useProxy,
          useSpritesmith: this.useSpritesmith
        }
      )
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
        this.destinationPath('src/index.html'),
        {
          useRev: this.useRev,
          includeJQuery: this.includeJQuery,
          projectname: this.projectname,
          legacy: this.legacy
        }
      )
    },
    javascript: function() {
      this.fs.copy(
        this.templatePath('main.js'),
        this.destinationPath('src/js/main.js')
      );
    },
    scss: function() {
      this.fs.copyTpl(
        this.templatePath('scss/main.scss'),
        this.destinationPath('src/scss/main.scss'),
        {useSpritesmith: this.useSpritesmith}
      );
      this.fs.copyTpl(
        this.templatePath('scss/_variables.scss'),
        this.destinationPath('src/scss/base/_variables.scss'),
        {legacy: this.legacy}
      );
      this.fs.copyTpl(
        this.templatePath('scss/_normalize-extra.scss'),
        this.destinationPath('src/scss/base/_normalize-extra.scss'),
        {legacy: this.legacy}
      );
      this.fs.copy(
        this.templatePath('scss/_mixins.scss'),
        this.destinationPath('src/scss/helpers/_mixins.scss')
      );
      this.fs.copy(
        this.templatePath('scss/_functions.scss'),
        this.destinationPath('src/scss/helpers/_functions.scss')
      );
      this.fs.copy(
        this.templatePath('scss/mixins/*.scss'),
        this.destinationPath('src/scss/helpers/mixins')
      );
      this.fs.copy(
        this.templatePath('scss/functions/*.scss'),
        this.destinationPath('src/scss/helpers/functions')
      )
    },
    image: function() {
      if (this.useSpritesmith) {
        this.fs.copy(
          this.templatePath('sprites/*.png'),
          this.destinationPath('src/img/sprites')
        );
      }
    },
    misc: function () {
    }
  },
  install: function () {
    this.installDependencies({
      skipInstall: this.options['skip-install'],
      skipMessage: this.options['skip-install-message']
    });
  },
  end: function () {
    var self = this;
    var howToInstall =
      '\nAfter running ' +
      chalk.yellow.bold('npm install') +'.';

    if (this.options['skip-install']) {
      this.log(howToInstall);
      return;
    }
  }
});

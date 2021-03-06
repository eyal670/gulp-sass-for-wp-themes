/*jslint node: true */
"use strict";

var $           = require('gulp-load-plugins')();
var argv        = require('yargs').argv;
var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var merge       = require('merge-stream');
var sequence    = require('run-sequence');
var colors      = require('colors');
var dateFormat  = require('dateformat');

// get or relevant paths
var pwd = __dirname.split("\\").pop();
var themeName = __dirname.split("\\").reverse()[1];
var wordpressDir = __dirname.split("\\wp-content\\").shift();
var wordpressDir = wordpressDir.split("\\www\\").pop();
var themeCSS = "css";
var themeJS = "js";
var themeImages = "images";

// show relevant paths setup
gulp.task("dir", function(){
  var dirSetup = "\n" + "--- directory paths setup ---".bgRed + "\n";
      dirSetup += "*"+"auto generated".yellow;
      dirSetup += " *"+"hard coded".magenta + "\n\n";
      dirSetup += "tool dir = " + (pwd).yellow + "\n";
      dirSetup += "wordpress dir = " + (wordpressDir).yellow + "\n";
      dirSetup += "theme name = " + (themeName).yellow + "\n";
      dirSetup += "theme css folder = " + (themeCSS).magenta + "\n";
      dirSetup += "theme js folder = " + (themeJS).magenta + "\n";
      dirSetup += "theme images folder = " + (themeImages).magenta + "\n";
      dirSetup += "-----------------------------".bgRed + "\n";
  console.log(dirSetup);
});

// Enter URL of your local server here
// Example: 'http://localwebsite.dev'
// setting server url to current wordpress instant
var URL = 'localhost/'+wordpressDir;

// Check for --production flag
var isProduction = !!(argv.production);

// Browsers to target when prefixing CSS.
var COMPATIBILITY = ['last 2 versions', 'ie >= 9'];

// File paths to various assets are defined here.
var PATHS = {
  sass: [
    ''
  ],
  javascript: [
    // Include your own custom scripts (located in the custom folder)
    'js/custom/*.js'
  ],
  pkg: [
    '../**/*',
    '!**/node_modules/**',
    '!**/img/**',
    '!**/packaged/*',
    '!*.*'
  ]
};

// Browsersync task
gulp.task('browser-sync', ['build'], function() {

  var files = [
            '../**/*.php',
            '../images/**/*.{png,jpg,gif}'
          ];

  browserSync.init(files, {
    // Proxy address
    proxy: URL,

    // Port #
    // port: PORT
  });
});

// Compile Sass into CSS
// In production, the CSS is compressed
gulp.task('sass', function() {
  // Minify CSS if run wtih --production flag
  var minifycss = $.if(isProduction, $.minifyCss());

  return gulp.src('scss/native-code.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      includePaths: PATHS.sass
    }))
    .on('error', $.notify.onError({
        message: "<%= error.message %>",
        title: "Sass Error"
    }))
    .pipe($.autoprefixer({
      browsers: COMPATIBILITY
    }))
    .pipe(minifycss)
    .pipe($.if(!isProduction, $.sourcemaps.write('.')))
    .pipe(gulp.dest('../'+themeCSS))
    .pipe(browserSync.stream({match: '**/*.css'}));
});

// Lint all JS files in custom directory
gulp.task('lint', function() {
  return gulp.src('js/custom/*.js')
    .pipe($.jshint())
    .pipe($.notify(function (file) {
      if (file.jshint.success) {
        return false;
      }

      var errors = file.jshint.results.map(function (data) {
        if (data.error) {
          return "(" + data.error.line + ':' + data.error.character + ') ' + data.error.reason;
        }
      }).join("\n");
      return file.relative + " (" + file.jshint.results.length + " errors)\n" + errors;
    }));
});

// Combine JavaScript into one file
// In production, the file is minified
gulp.task('javascript', function() {
  var uglify = $.uglify()
    .on('error', $.notify.onError({
      message: "<%= error.message %>",
      title: "Uglify JS Error"
    }));

  return gulp.src(PATHS.javascript)
    .pipe($.sourcemaps.init())
    .pipe($.concat('native-code.js'))
    .pipe($.if(isProduction, uglify))
    .pipe($.if(!isProduction, $.sourcemaps.write()))
    .pipe(gulp.dest('../'+themeJS))
    .pipe(browserSync.stream());
});

// Copy task
gulp.task('copy', function() {
  // // Motion UI
  // var motionUi = gulp.src('assets/components/motion-ui/**/*.*')
  //   .pipe($.flatten())
  //   .pipe(gulp.dest('assets/javascript/vendor/motion-ui'));

  // What Input
  var img = gulp.src('img/**/*.*')
    //  .pipe($.flatten())
      .pipe(gulp.dest('../'+themeImages));

  // Font Awesome
  // var fonts = gulp.src('/fonts/**/*.*')
  //     .pipe(gulp.dest('../fonts'));

  return merge(img);
});

// Package task
gulp.task('package', ['build'], function() {
  // var fs = require('fs');
  var time = dateFormat(new Date(), "yyyy-mm-dd_HH-MM");
  // var pkg = JSON.parse(fs.readFileSync('./package.json'));
  var title = themeName + '_' + time + '.zip';

  return gulp.src(PATHS.pkg)
    .pipe($.zip(title))
    .pipe(gulp.dest('packaged'));
});

// Build task
// Runs copy then runs sass & javascript in parallel
gulp.task('build', function(done) {
  sequence('copy',
          ['sass', 'javascript', 'lint'],
          done);
});

// PHP Code Beautifier task
gulp.task('phpcbf', function () {
  return gulp.src(['../*.php'])
  .pipe($.phpcbf({
    bin: 'wpcs/vendor/bin/phpcbf',
    standard: './codesniffer.ruleset.xml',
    warningSeverity: 0
  }))
  .on('error', $.util.log)
  .pipe(gulp.dest('.'));
});

// Default gulp task
// Run build task and watch for file changes
gulp.task('default', ['build', 'browser-sync'], function() {
  // Log file changes to console
  function logFileChange(event) {
    var fileName = require('path').relative(__dirname, event.path);
    console.log('[' + 'WATCH'.green + '] ' + fileName.magenta + ' was ' + event.type + ', running tasks...');
  }

  // Sass Watch
  gulp.watch(['scss/**/*.scss'], ['sass'])
    .on('change', function(event) {
      logFileChange(event);
    });

  // JS Watch
  gulp.watch(['js/**/*.js'], ['javascript', 'lint'])
    .on('change', function(event) {
      logFileChange(event);
    });
});

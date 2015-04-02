/* vim: set et sw=2 ts=2: */
/* jshint node: true */
"use strict";

var thresholds = {
  statements: 60,
    branches: 60,
       lines: 60,
   functions: 60
};

var jshint = require('gulp-jshint'),
     mocha = require('gulp-mocha'),
  istanbul = require('gulp-istanbul'),
  enforcer = require('gulp-istanbul-enforcer'),
      gulp = require('gulp');

var sourceFiles = [ '*.js', 'lib/*.js', 'test/*.js' ];

gulp.task('lint', function (done) {
  gulp.src(sourceFiles)
      .pipe(jshint())
      .pipe(jshint.reporter('default'))
      .on('end', done);
});

gulp.task('test', function (done) {
  gulp.src(sourceFiles)
      .pipe(istanbul())
      .pipe(istanbul.hookRequire()) 
      .on('finish', function () {
        gulp.src([ 'test/*.js' ])
            .pipe(mocha())
            .pipe(istanbul.writeReports())
            .pipe(enforcer({
              thresholds: thresholds,
              coverageDirectory: 'coverage',
              rootDirectory: ''
            }))
            .on('end', done);
      });
});

gulp.task('default', [ 'lint', 'test' ]);

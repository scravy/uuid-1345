// vim: set et sw=2 ts=2
(function () { "use strict";

var gulp = require('gulp');

var jshint = require('gulp-jshint');

var sourceFiles = [ '*.js', 'lib/*.js', 'test/*.js' ];

gulp.task('lint', function (done) {
  gulp.src(sourceFiles)
      .pipe(jshint())
      .pipe(jshint.reporter('default'))
      .on('end', done);
});

gulp.task('default', [ 'lint' ]);

}());

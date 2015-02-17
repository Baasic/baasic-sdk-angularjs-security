/* jshint node: true */
'use strict';

var gulp = require('gulp'),
	plugins = require('gulp-load-plugins')(),
	stylish = require('jshint-stylish');
var docgen = require('baasic-javascript-docgen');	

var paths = {
  scripts: ['src/**/*.js']
};

gulp.task('jshint', function () {
  return gulp.src([
    'gulpfile.js'
	]
	.concat(paths.scripts))
    .pipe(plugins.jshint())
	.pipe(plugins.jshint.reporter(stylish));
});

gulp.task('scripts', function() {
  return gulp.src(paths.scripts)
    .pipe(plugins.order(['*.moduleDefinition.js', '*.js']))
	.pipe(plugins.concat('baasic-angular-security.js'))
	.pipe(plugins.header('(function (angular, undefined) {\n'))
	.pipe(plugins.footer('\n})(angular);'))
	.pipe(plugins.beautify())
	.pipe(gulp.dest('dist'))
	.pipe(plugins.uglify())
	.pipe(plugins.rename('baasic-angular-security.min.js'))
	.pipe(gulp.dest('dist'));
});

gulp.task('docs', function() {
  docgen.generateBaasicDocs('src', 'wiki', 'Baasic Dynamic Resource Navigation', ['config.js']);
});

gulp.task('default', ['jshint', 'docs', 'scripts']);

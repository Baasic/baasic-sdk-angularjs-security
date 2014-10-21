var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

var paths = {
  scripts: ['src/**/*.js']
};

gulp.task('scripts', function() {
  return gulp.src(paths.scripts)
    .pipe(plugins.order(["*.moduleDefinition.js", "*.js"]))
	.pipe(plugins.concat('baasic-angular-security.js'))
	.pipe(plugins.header('(function (angular, undefined) {\n'))
	.pipe(plugins.footer('\n})(angular);'))
	.pipe(plugins.beautify())
	.pipe(gulp.dest('dist'))
	.pipe(plugins.uglify())
	.pipe(plugins.rename('baasic-angular-security.min.js'))
	.pipe(gulp.dest('dist'));
});



gulp.task('default', ['scripts']);

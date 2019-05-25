var gulp = require('gulp');
var del = require('del');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var webpack = require('gulp-webpack');
var eslint = require('gulp-eslint');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var sass = require('gulp-sass');
var webpackConfig = require('./webpack.config.js');

gulp.task('clean', function() {
  return del(['dist']);
});

gulp.task('build', function() {
  return gulp.src('./src/script/*.js')
    .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>")
    }))
    .pipe(eslint({useEslintrc: true}))
    .pipe(eslint.format())
    .pipe(eslint.failOnError())
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest('./dist'));
});

gulp.task('sass', function() {
  return gulp.src('./src/sass/*.scss')
    .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>")
    }))
    .pipe(sass())
    .pipe(concat('picotune.css'))
    .pipe(gulp.dest('./dist'))
});

gulp.task('js-minify', function() {
  return gulp.src('./dist/*.js')
    .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>")
    }))
    .pipe(uglify())
    .pipe(concat('application.min.js'))
    .pipe(gulp.dest('./dist/min'));
});

gulp.task('css-minify', function() {
  return gulp.src('./dist/*.css')
    .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>")
    }))
    .pipe(uglify())
    .pipe(concat('bundle.min.css'))
    .pipe(gulp.dest('./dist/min'));
});

gulp.task('watch', function() {
  gulp.watch(['./src/script/**/*.js'], gulp.task('build'));
  gulp.watch(['./src/sass/**/*.scss'], gulp.task('sass'));
});

gulp.task('default', gulp.series('clean', 'build', 'sass', 'watch'));
gulp.task('minify',  gulp.series('js-minify', 'css-minify'));
gulp.task('production',  gulp.series('clean', 'build', 'sass', 'minify'));

const gulp        = require('gulp'),
      browsersync = require('browser-sync').create(),
      less        = require('gulp-less'),
      replace     = require('gulp-replace'),
      cheerio     = require('gulp-cheerio'),
      svgSprite   = require('gulp-svg-sprite'),
      svgmin      = require('gulp-svgmin'),
      sourcemap   = require('gulp-sourcemaps'),
      autopref    = require('gulp-autoprefixer'),
      csscomb     = require('gulp-csscomb'),
      gcmq        = require('gulp-group-css-media-queries'),
      pug         = require('gulp-pug'),
      notify      = require('gulp-notify'),
      tiny        = require('gulp-tinypng'),
      clean       = require('del');

const config = require('./config');

gulp.task('browsersync', function () {
  return browsersync.init({
    server: {
      baseDir: config.product.dest
    },
    browser: "chrome",
  });
});

gulp.task('less', function () {
  return gulp.src([config.less.src])
             .pipe(sourcemap.init())
             .pipe(less())
             .on('error', notify.onError(function(error) {
               return {
                 title: 'LESS',
                 message: error.message
               };
             }))
             .pipe(gcmq())
             .pipe(autopref({
               browsers: ['last 2 versions']
             }))
             .pipe(csscomb())
             .pipe(sourcemap.write())
             .pipe(gulp.dest(config.less.dest))
             .pipe(browsersync.reload({
               stream: true
             }));
});

gulp.task('pug', function () {
  return gulp.src([config.pug.src])
             .pipe(pug({
               pretty: true
             }))
             .on('error', notify.onError(function(error) {
               return {
                 title: 'Pug',
                 message: error.message
               };
             }))
             .pipe(gulp.dest(config.pug.dest))
             .pipe(browsersync.reload({
               stream: true
             }));
});

gulp.task('svg', function () {
  return gulp.src(config.svg.src)
             .pipe(svgmin({
               js2svg: {
                 pretty: true
               }
             }))
             .pipe(cheerio({
               run: function ($) {
                 $('[fill]').removeAttr('fill');
                 $('[stroke]').removeAttr('stroke');
                 $('[style]').removeAttr('style');
               },
               parserOptions: {xmlMode: true}
             }))
             .pipe(replace('&gt;', '>'))
             .pipe(svgSprite({
               mode: {
                 symbol: {
                   sprite: "sprite.svg"
                 }
               }
             }))
             .on('error', notify.onError(function(error) {
               return {
                 title: 'SVG',
                 message: error.message
               };
             }))
             .pipe(gulp.dest(config.svg.dest))
             .pipe(browsersync.reload({
               stream: true
             }));
});

gulp.task('imgMin', function() {
  return gulp.src(config.img.src)
             .pipe(tiny(config.tinypng))
             .pipe(gulp.dest(config.img.dest));
});

gulp.task('fonts', function() {
  return gulp.src(config.fonts.src)
             .pipe(gulp.dest(config.fonts.dest));
});

gulp.task('img', function() {
  return gulp.src(config.img.src)
             .pipe(gulp.dest(config.img.dest));
});

gulp.task('js', function() {
  return gulp.src(config.js.src)
             .pipe(gulp.dest(config.js.dest))
             .pipe(browsersync.reload({
               stream: true
             }));
});

gulp.task('clean', function() {
  return clean([config.product.dest]);
});

gulp.task('watch', function () {
  gulp.watch(config.pug.path + '/**/*.pug', gulp.series('pug'));
  gulp.watch(config.less.path + '/**/*.less', gulp.series('less'));
  gulp.watch(config.js.path + '/**/*.js', gulp.series('js'));
  gulp.watch(config.svg.path, gulp.series('svg'));
  gulp.watch(config.img.path, gulp.series('img'));
  gulp.watch(config.fonts.path, gulp.series('fonts'));
});

gulp.task('dev', gulp.series('clean', gulp.parallel('pug', 'less', 'js', 'svg', 'fonts', 'img')));

gulp.task('default', gulp.series('dev', gulp.parallel('browsersync', 'watch') ));
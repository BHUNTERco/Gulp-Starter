var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var svgmin = require('gulp-svgmin');
var es = require('event-stream');
var browserSync = require('browser-sync').create();
var nunjucksRender = require('gulp-nunjucks-render');

gulp.task('scripts', function () {
  return gulp.src('src/js/*.js')
  .pipe(concat('main.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('app/assets/js'))
  .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('sass', function() {

  // Grab scss files & modules, then auto prefix them
  var sassToCSS = gulp.src('src/scss/**/[^_]*.scss')
  .pipe(sass.sync().on('error', sass.logError))
  .pipe(autoprefixer());

  // Use compiled CSS in-memory and then clean & minify
  var compileCSS = gulp.src('app/assets/css/*.css')
  .pipe(cleanCSS({compatibility: 'ie8'}));

  // merge the two streams and output
  return es.merge(sassToCSS, compileCSS)
  .pipe(gulp.dest('app/assets/css'))
  .pipe(browserSync.reload({
      stream: true
    }));

});

gulp.task('optimize-svg', function () {
  return gulp.src('src/svg/*.svg')
  .pipe(concat('all.min.js'))
  .pipe(svgmin());
});

gulp.task('nunjucks', function() {
  // Gets .html and .nunjucks files in pages
  return gulp.src('src/pages/**/*.+(html|nunjucks)')
  // Renders template with nunjucks
  .pipe(nunjucksRender({
      path: ['src/templates']
    }))
  // output files in app folder
  .pipe(gulp.dest('app'))
});

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'app'
    },
  })
})

// build task
gulp.task('build', [`sass`, `scripts`, `optimize-svg`,], function (){
  console.log('Building files');
})

// main watch task
gulp.task('watch', ['browserSync', 'sass', 'nunjucks'], function (){
 gulp.watch("app/**/*.html").on("change", browserSync.reload);
 gulp.watch('src/**/*.+(html|nunjucks)', ['nunjucks'] ).on("change", browserSync.reload);

});

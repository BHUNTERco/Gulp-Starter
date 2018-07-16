var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var es = require('event-stream');
var browserSync = require('browser-sync').create();
var nunjucksRender = require('gulp-nunjucks-render');
var gutil = require('gulp-util');
var responsive = require('gulp-responsive');
var $ = require('gulp-load-plugins')();

gulp.task('scripts', function() {
	var thirdPartyJavascript = gulp.src('src/js/3rd-party/*.js');
	var customJS = gulp.src('src/js/main.js');
	return es
		.merge(thirdPartyJavascript, customJS)
		.pipe(concat('main.min.js'))
		.pipe(uglify().on('error', gutil.log))
		.pipe(gulp.dest('app/assets/js'))
		.pipe(
			browserSync.reload({
				stream: true
			})
		);
});
gulp.task('sass', function() {
	// Grab scss files & modules, then auto prefix them
	var sassToCSS = gulp
		.src('src/scss/**/*.scss')
		.pipe(sass.sync().on('error', sass.logError))
		.pipe(autoprefixer());

	// Use compiled CSS in-memory and then clean & minify
	var compileCSS = gulp.src('app/assets/css/*.css');

	// merge the two streams and output
	return es
		.merge(sassToCSS, compileCSS)
		.pipe(
			cleanCSS({
				compatibility: 'ie8'
			})
		)
		.pipe(gulp.dest('app/assets/css'))
		.pipe(
			browserSync.reload({
				stream: true
			})
		);
});
gulp.task('nunjucks', function() {
	// Gets .html and .nunjucks files in pages
	return (
		gulp
			.src('src/_pages/**/*.+(html|nunjucks)')
			// Renders template with nunjucks
			.pipe(
				nunjucksRender({
					path: ['src/_templates']
				})
			)
			// output files in app folder
			.pipe(gulp.dest('app'))
	);
});

// Image Resizing
gulp.task('images', function() {
	return gulp
		.src('src/images/*.{jpg,png}')
		.pipe(
			$.responsive({
				// Convert all images to JPEG format
				'*': [
					{
						width: 600,
						withoutEnlargement: false,
						quality: 85,
						rename: {
							suffix: '-small'
						}
					},
					{
						// image-large.jpg is 480 pixels wide
						width: 1200,
						withoutEnlargement: false,
						quality: 85,
						rename: {
							suffix: '-medium'
						}
					},
					{
						// image-extralarge.jpg is 768 pixels wide
						width: 1600,
						withoutEnlargement: false,
						quality: 85,
						rename: {
							suffix: '-large'
						}
					},
					{
						// image-extralarge.jpg is 768 pixels wide
						width: 2048,
						withoutEnlargement: false,
						quality: 85,
						rename: {
							suffix: '-xlarge'
						}
					}
				]
			})
		)
		.pipe(gulp.dest('app/assets/images'));
});

// copy gifs as-are
gulp.task('copy-gifs', function() {
	gulp.src('./src/images/**/*.gif').pipe(gulp.dest('./app/assets/images/'));
});
gulp.task('copy-webfonts', function() {
	gulp.src('./src/webfonts/**/*').pipe(gulp.dest('./app/assets/webfonts/'));
});
// copy videos
gulp.task('copy-videos', function() {
	gulp.src('./src/videos/**/*').pipe(gulp.dest('./app/assets/videos/'));
});
gulp.task('copy-css', function() {
	gulp.src('./src/css/**/*').pipe(gulp.dest('./app/assets/css/'));
});
// build task
gulp.task(
	'build',
	[
		`sass`,
		`scripts`,
		'nunjucks',
		'images',
		'copy-videos',
		'copy-webfonts',
		'copy-css',
		'copy-gifs'
	],
	function() {
		console.log('Building files');
	}
);

// main watch task
gulp.task('watch', ['build'], function() {
	gulp.watch('src/scss/**/*.scss', ['sass']);
	gulp.watch('app/**/*.html').on('change', browserSync.reload);
	gulp.watch('src/**/*.+(html|nunjucks)', ['nunjucks']);
	gulp.watch('src/js/**/*.js', ['scripts']);

	browserSync.init({
		server: {
			baseDir: 'app'
		}
	});
});

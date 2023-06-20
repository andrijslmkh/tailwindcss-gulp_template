const {src, dest, watch, parallel, series} = require('gulp');

// SCSS style
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');

// JS scripts
const uglify = require('gulp-uglify-es').default;

const browserSync = require('browser-sync').create();
const clean = require('gulp-clean');
const include = require('gulp-include');

// Image
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const svgSprite = require('gulp-svg-sprite');

//FONTS
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');

function pages() {
	return src('app/pages/*.html')
		.pipe(include({
			includePaths: 'app/pages/components'
		}))
		.pipe(dest('app'))
		.pipe(browserSync.stream())
}

function fonts() {
	return src('app/fonts/src/*.*')
		.pipe(fonter({
			formats: ['woff', 'ttf']
		}))
		.pipe(src('app/fonts/*.ttf'))
		.pipe(ttf2woff2())
		.pipe(dest('app/fonts'))
}

function images() {
	return src(['app/media/images/src/*.*', '!app/media/images/src/*.svg'])
		.pipe(newer('app/media/images'))
		.pipe(avif({
			quality: 50
		}))
		.pipe(dest('app/media/images'))

		.pipe(src('app/media/images/src/*.*'))
		.pipe(newer('app/media/images'))
		.pipe(webp())
		.pipe(dest('app/media/images'))

		.pipe(src('app/media/images/src/*.*'))
		.pipe(newer('app/media/images'))
		.pipe(imagemin())
		.pipe(dest('app/media/images'))
}

function sprite() {
	return src('app/media/images/*.svg')
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: '../sprite.svg',
					example: true
				}
			}
		}))
		.pipe(dest('app/media/images'))
}

function styles() {
	return src('app/css/main.scss')
		.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
		.pipe(autoprefixer({
			cascade: false,
			overrideBrowserslist: ['last 10 version']
		}))
		.pipe(dest('app/css'))
		.pipe(concat('main.min.css'))
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(dest('app/css'))
		.pipe(browserSync.stream())
};


function scripts() {
	return src([
		// 'node_modules/swiper/swiper-bundle.js', 				// SWIPER
		// 'node_modules/slick-carousel/slick/slick.js',	// SLICK
		'app/js/main.js'
	])
		.pipe(concat('main.min.js'))
		.pipe(uglify())
		.pipe(dest('app/js'))
		.pipe(browserSync.stream())
};

function watching() {
	browserSync.init({
		server: {
			baseDir: "app/",
			directory: true
		}
	});
	watch(['app/scss/*.scss', 'app/css/*.scss'], styles)
	watch(['app/media/images/src'], images)
	watch(['app/js/main.js'], scripts)
	watch(['app/pages'], pages)
	watch(['app/*.html']).on('change', browserSync.reload)
}


function cleanDist() {
	return src('dist')
		.pipe(clean())
}

function building() {
	return src([
		'app/css/**/*.css',
		'app/media/images/*.*',
		'!app/media/images/*.svg',
		'app/media/images/sprite.svg',
		'app/media/video/**/*.*',
		'app/fonts/*.*',
		'app/js/**/*.js',
		'app/**/*.html',
		'!app/media/images/stack/*.html' // sprite stack exemple
	], {base: 'app'})
		.pipe(dest('dist'))
}

// gulp --tasks
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.sprite = sprite;
exports.fonts = fonts;
exports.pages = pages;
exports.building = building;
exports.watching = watching;

exports.build = series(building, cleanDist, building);
exports.watch = parallel(styles, scripts,images, pages, watching);

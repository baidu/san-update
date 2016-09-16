var gulp = require('gulp');
var clean = require('gulp-clean');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task(
    'clean',
    function () {
        return gulp.src(['map', 'update.js', 'chain.js', '*.min.js'], {read: false})
            .pipe(clean());
    }
);

gulp.task(
    'development',
    ['clean'],
    function () {
        process.env.NODE_ENV = 'development';

        return gulp.src('src/*.js')
            .pipe(sourcemaps.init())
            .pipe(babel())
            .pipe(sourcemaps.write('map'))
            .pipe(gulp.dest('.'));
    }
);

gulp.task(
    'production',
    ['development'],
    function () {
        process.env.NODE_ENV = 'production';

        return gulp.src('src/*.js')
            .pipe(sourcemaps.init())
            .pipe(babel())
            .pipe(uglify())
            .pipe(rename({suffix: '.min'}))
            .pipe(sourcemaps.write('map'))
            .pipe(gulp.dest('.'));
    }
);

gulp.task('default', ['production']);

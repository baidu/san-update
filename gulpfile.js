var gulp = require('gulp');
var clean = require('gulp-clean');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var rollup = require('rollup-stream');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var ROLLUP_CONFIG_INDEX = {
    entry: './src/index.js',
    sourceMap: true,
    format: 'umd',
    moduleName: 'sanUpdate',
    useStrict: false,
    plugins: [
        require('rollup-plugin-babel')()
    ]
};

var ROLLUP_CONFIG_FP = {
    entry: './src/fp.js',
    sourceMap: true,
    format: 'umd',
    moduleName: 'sanUpdateFP',
    useStrict: false,
    plugins: [
        require('rollup-plugin-babel')()
    ]
};

var UGLIFY_OPTIONS = {
    mangle: true
};

gulp.task(
    'clean',
    function () {
        return gulp.src(['map', 'index.js', 'fp.js', '*.min.js'], {read: false})
            .pipe(clean());
    }
);

gulp.task(
    'development.index',
    ['clean'],
    function () {
        process.env.NODE_ENV = 'development';

        return rollup(ROLLUP_CONFIG_INDEX)
            .pipe(source('index.js', './src/*'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write('./map'))
            .pipe(gulp.dest('.'));
    }
);

gulp.task(
    'production.index',
    ['development.index'],
    function () {
        process.env.NODE_ENV = 'production';

        return rollup(ROLLUP_CONFIG_INDEX)
            .pipe(source('index.js', './src/*'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify(UGLIFY_OPTIONS))
            .pipe(rename({suffix: '.min'}))
            .pipe(sourcemaps.write('./map'))
            .pipe(gulp.dest('.'));
    }
);

gulp.task(
    'development.fp',
    ['clean'],
    function () {
        process.env.NODE_ENV = 'development';

        return rollup(ROLLUP_CONFIG_FP)
            .pipe(source('fp.js', './src/*'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write('./map'))
            .pipe(gulp.dest('.'));
    }
);

gulp.task(
    'production.fp',
    ['development.fp'],
    function () {
        process.env.NODE_ENV = 'production';

        return rollup(ROLLUP_CONFIG_FP)
            .pipe(source('fp.js', './src/*'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify(UGLIFY_OPTIONS))
            .pipe(rename({suffix: '.min'}))
            .pipe(sourcemaps.write('./map'))
            .pipe(gulp.dest('.'));
    }
);

gulp.task('production', ['production.index', 'production.fp']);

gulp.task('default', ['production']);

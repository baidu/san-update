var gulp = require('gulp');
var clean = require('gulp-clean');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var rollup = require('rollup-stream');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

function merge() {
    var output = {};

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                output[key] = source[key];
            }
        }
    }

    return output;
}

var ROLLUP_CONFIG = {
    sourceMap: true,
    format: 'umd',
    moduleName: 'sanUpdate',
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
        return gulp.src(['map', 'update.js', 'chain.js', 'index.js', '*.min.js'], {read: false})
            .pipe(clean());
    }
);

gulp.task(
    'development',
    ['clean'],
    function () {
        process.env.NODE_ENV = 'development';

        return rollup(merge(ROLLUP_CONFIG, {entry: './src/index.js'}))
            .pipe(source('index.js', './src/*'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write('./map'))
            .pipe(gulp.dest('.'));
    }
);

gulp.task(
    'production',
    ['development'],
    function () {
        process.env.NODE_ENV = 'production';

        return rollup(merge(ROLLUP_CONFIG, {entry: './src/index.js'}))
            .pipe(source('index.js', './src/*'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify(UGLIFY_OPTIONS))
            .pipe(rename({suffix: '.min'}))
            .pipe(sourcemaps.write('./map'))
            .pipe(gulp.dest('.'));
    }
);

gulp.task('default', ['production']);

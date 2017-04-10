let gulp = require('gulp');
let clean = require('gulp-clean');
let sourcemaps = require('gulp-sourcemaps');
let uglify = require('gulp-uglify');
let rename = require('gulp-rename');
let rollup = require('rollup-stream');
let source = require('vinyl-source-stream');
let buffer = require('vinyl-buffer');

let ROLLUP_CONFIG_INDEX = {
    entry: './src/index.js',
    sourceMap: true,
    format: 'umd',
    moduleName: 'sanUpdate',
    useStrict: false,
    plugins: [
        require('rollup-plugin-babel')()
    ]
};

let ROLLUP_CONFIG_FP = {
    entry: './src/fp.js',
    sourceMap: true,
    format: 'umd',
    moduleName: 'sanUpdateFP',
    useStrict: false,
    plugins: [
        require('rollup-plugin-babel')()
    ]
};

let ROLLUP_CONFIG_INDEX_MODULE = {
    entry: './src/index.js',
    format: 'es',
    useStrict: false,
    plugins: [
        require('rollup-plugin-babel')()
    ]
};

let ROLLUP_CONFIG_FP_MODULE = {
    entry: './src/fp.js',
    format: 'es',
    useStrict: false,
    plugins: [
        require('rollup-plugin-babel')()
    ]
};

let UGLIFY_OPTIONS = {
    mangle: true
};

gulp.task(
    'clean',
    () => {
        return gulp.src(['map', 'index.js', 'fp.js', '*.min.js', '*.es.js'], {read: false})
            .pipe(clean());
    }
);

gulp.task(
    'development.index',
    ['clean'],
    () => {
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
    () => {
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
    () => {
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
    () => {
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

gulp.task(
    'module.index',
    ['clean'],
    () => {
        process.env.NODE_ENV = 'development';

        return rollup(ROLLUP_CONFIG_INDEX_MODULE)
            .pipe(source('index.js', './src/*'))
            .pipe(buffer())
            .pipe(rename({suffix: '.es'}))
            .pipe(gulp.dest('.'));
    }
);

gulp.task(
    'module.fp',
    ['clean'],
    () => {
        process.env.NODE_ENV = 'development';

        return rollup(ROLLUP_CONFIG_FP_MODULE)
            .pipe(source('fp.js', './src/*'))
            .pipe(buffer())
            .pipe(rename({suffix: '.es'}))
            .pipe(gulp.dest('.'));
    }
);

gulp.task('production', ['production.index', 'production.fp']);
gulp.task('module', ['module.index', 'module.fp']);

gulp.task('default', ['production', 'module']);

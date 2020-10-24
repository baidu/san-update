const {rollup} = require('rollup');
const {default: babel} = require('@rollup/plugin-babel');
const clear = require('rollup-plugin-clear');
const {terser} = require('rollup-plugin-terser');

const run = (entry, minimize) => {
    const options = {
        context: __dirname,
        input: entry,
        plugins: [
            clear(['map', 'index.js', 'fp.js', '*.min.js', '*.es.js']),
            babel({babelHelpers: 'bundled'}),
        ],
    };

    if (minimize) {
        options.plugins.push(terser());
    }

    return rollup(options);
};

const main = async () => {
    const bundlings = [
        run('src/index.js', false),
        run('src/index.js', true),
        run('src/fp.js', false),
        run('src/fp.js', true),
    ];
    const [index, indexMinimized, fp, fpMinimized] = await Promise.all(bundlings);

    index.write({format: 'umd', name: 'sanUpdate', file: 'index.js', sourcemap: true});
    index.write({format: 'module', file: 'index.es.js', sourcemap: true});
    fp.write({format: 'umd', name: 'sanUpdate', file: 'fp.js', sourcemap: true});
    fp.write({format: 'module', file: 'fp.es.js', sourcemap: true});
    indexMinimized.write({format: 'umd', name: 'sanUpdate', file: 'index.min.js', sourcemap: true});
    fpMinimized.write({format: 'umd', name: 'sanUpdate', file: 'fp.min.js', sourcemap: true});
};

main();

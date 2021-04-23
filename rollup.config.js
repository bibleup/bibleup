import { uglify } from 'rollup-plugin-uglify';
import lessModules from 'rollup-plugin-less-modules';

export default {
    input: './bibleup/js/main.js',
    output: {
        file: './dist/bibleup.min.js',
        format: 'umd',
        name: 'bundle'
    },
    plugins: [
        uglify(),
        lessModules({
            // Does not output the styles to an external file
            // output: false,

            // Outputs the styles to a separate bundle file with the same name as the input file name of the bundle.
            // output: true,

            // Outputs the bundled styles to a custom path
            output: 'dist/app.css'
        })
    ]
}
import { uglify } from 'rollup-plugin-uglify';
import less from 'rollup-plugin-less';

export default {
    input: './bibleup/js/bibleup.js',
    output: {
        file: './dist/bibleup.min.js',
        format: 'es',
        name: 'bundle'
    },
    plugins: [
        uglify(),
        less({
            insert: 'true',
            output: 'dist/bibleup.build.css'
        })
    ]
}
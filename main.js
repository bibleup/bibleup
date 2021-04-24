//import BibleUp from './dist/bibleup.es.min.js';
if (eruda) eruda.init();

let test = document.querySelector('#test');
let testPanel = document.querySelector('#test-panel');
let body = document.querySelector('body')

let bibleup = new BibleUp(testPanel, {linkStyle: 'classic', popup: 'inline', darkTheme: 'u', bu_allow:['H2']});
bibleup.create();











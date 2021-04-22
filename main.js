import BibleUp from './bibleup/js/bibleup.js'
if (eruda) eruda.init();

let testPanel = document.querySelector('#test-panel');
let body = document.querySelector('body')

let bibleup = new BibleUp(body, {linkStyle: 'classic', popup: 'inline', darkTheme: 'u'});
bibleup.create();










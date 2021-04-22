import BibleUp from './bibleup/js/bibleup.js'
if (eruda) eruda.init();

let testPanel = document.querySelector('#test-panel');
let body = document.querySelector('body')

let bibleup = new BibleUp(body, {linkStyle: 'classic', popup: 'classic', darkTheme: 'u'});
bibleup.create();


let extLink = document.querySelector('#ext-link');
extLink.addEventListener('click', e => {
	e.preventDefault();
})










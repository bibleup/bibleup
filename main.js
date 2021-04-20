import BibleUp from './bibleup/js/bibleup.js'
if (eruda) eruda.init();

let testPanel = document.querySelector('#test-panel');

let bibleup = new BibleUp(testPanel, {linkStyle: 'style2', popup: 'inline', darkTheme: true});
bibleup.create();


let extLink = document.querySelector('#ext-link');
extLink.addEventListener('click', e => {
	e.preventDefault();
})










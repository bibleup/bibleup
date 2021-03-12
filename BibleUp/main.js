import { BibleUp } from './bibleup/bibleup.js'


let testPanel = document.querySelector('#test-panel');
let bu = document.querySelector('#bu');
let section2 = document.querySelector('#section2');


let bibleup = new BibleUp(testPanel, {linkStyle: 'classic'});
bibleup.create();

/* let bibleup2 = new BibleUp(section2, {linkStyle: 'style1'});
bibleup2.create(); */


let extLink = document.querySelector('#ext-link');
extLink.addEventListener('click', e => {
	e.preventDefault();
	alert(e.target.outerHTML);
})











bu.addEventListener('click', () => {
	alert(testPanel.innerHTML);
})



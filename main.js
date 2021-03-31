import { BibleUp } from './bibleup/js/bibleup.js'

if (eruda) eruda.init();

let testPanel = document.querySelector('#test-panel');
let bu = document.querySelector('#bu');
let section2 = document.querySelector('#section2');


let bibleup = new BibleUp(testPanel, {linkStyle: 'classic', popup: 'inline'});
bibleup.create();


let extLink = document.querySelector('#ext-link');
extLink.addEventListener('click', e => {
	e.preventDefault();
	alert(e.target.outerHTML);
})











bu.addEventListener('click', () => {
	alert(testPanel.innerHTML);
})



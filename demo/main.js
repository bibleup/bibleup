import BibleUp from '../dist/esm/bibleup.es.min.js';
//import BibleUp from '../bibleup/js/bibleup.js'

let test = document.querySelector('#test');
let testPanel = document.querySelector('#test-panel');
let body = document.querySelector('body')

let bibleup = new BibleUp(body, {
	version: 'kjv',
	popup: 'inline',
	darkTheme: false
})
bibleup.create()
//console.log(bibleup.getOptions)








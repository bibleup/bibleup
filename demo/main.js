//import BibleUp from '../dist/esm/bibleup.es.min.js';
import BibleUp from '../bibleup/js/bibleup.js'

let test = document.querySelector('#test');
let testPanel = document.querySelector('#test-panel');
let body = document.querySelector('body')

let bibleup = new BibleUp(body, {
	linkStyle: 'myStyle'
})
bibleup.create()
//console.log(bibleup.getOptions)










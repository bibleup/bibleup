//import BibleUp from '../dist/esm/bibleup.esm.js';
import BibleUp from '../bibleup/js/bibleup.js'

let test = document.querySelector('#test');
let testPanel = document.querySelector('#test-panel');
let body = document.querySelector('body')

let bibleup = new BibleUp(body, {
	version: 'kjv',
	popup: 'classic',
	darkTheme: false,
	styles: {
		primary: ' #fff',
		secondary: '#d9d9d9',
		tertiary: '#fff',
		headerColor: 'white',
		color: ['#404040','#d9d9d9'],
		borderRadius: '0px',
		boxShadow: '0 0 0 3px #d9d9d9',
		fontSize: '',
	}
})
bibleup.create()
//console.log(bibleup.getOptions)








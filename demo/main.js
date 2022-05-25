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
		primary: ' #192841',
		secondary: '#192841',
		tertiary: '#7e9bcd',
		headerColor: 'white',
		color: ['white', false,'white'],
		borderRadius: '12px',
		boxShadow: '5px 5px #7e9bcd',
		fontSize: '',
	}
})
bibleup.create()
//console.log(bibleup.getOptions)








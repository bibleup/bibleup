//import BibleUp from '../dist/esm/bibleup.esm.js';
import BibleUp from '../bibleup/js/bibleup.js'

let test = document.querySelector('#test');
let testPanel = document.querySelector('#test-panel');
let body = document.querySelector('body')

let bibleup = new BibleUp(body, {
	version: 'kjv',
	popup: 'inline',
	darkTheme: false,
	styles: {
		primary: ' #fff',
		secondary: '#fff',
		tertiary: '#fff',
		headerColor: 'white',
		color: ['#404040', false,'white'],
		borderRadius: '0px',
		boxShadow: '0 0 15px #404040',
		fontSize: '',
	}
})
bibleup.create()
//console.log(bibleup.getOptions)








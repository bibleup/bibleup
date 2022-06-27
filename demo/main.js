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
		tertiary: '#f2f2f2',
		headerColor: '#24292f',
		color: ['#24292f','#24292f'],
		borderRadius: '6px',
		boxShadow: '0 0 0 1px #d0d7de, 0 8px 24px rgba(140,149,159,0.2)',
		fontSize: '',
	}
})
bibleup.create();
//console.log(bibleup.getOptions)

let btn = document.querySelector('#remove')
btn.onclick = () => {
	bibleup.destroy();
}

let btn2 = document.querySelector('#refresh')
btn2.onclick = () => {
	bibleup.refresh({
		version: 'lsv',
		popup: 'wiki',
		darkTheme: false,
		styles: {
			primary: ' #fff',
			secondary: '#fff',
			tertiary: '#f2f2f2',
			headerColor: '#0c0d0e',
			color: ['#0c0d0e','#0c0d0e'],
			borderRadius: '5px',
			boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.06), 0 3px 8px rgba(0,0,0,0.09)'
		}
	})
}

let add = document.querySelector('#add')
add.onclick = () => {
	const para = document.createElement("p");
const textNode = document.createTextNode("Proverbs 6:6");
para.appendChild(textNode);
testPanel.appendChild(para)
}








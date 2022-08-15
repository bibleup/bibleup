// import BibleUp from '../dist/esm/bibleup.esm.js';
import BibleUp from '../bibleup/js/bibleup.js'

const testPanel = document.querySelector('#test-panel')
const body = document.querySelector('body')

/* const bibleup = new BibleUp(body, {
  version: 'kjv',
  popup: 'classic',
  darkTheme: false,
  styles: {
    primary: ' #fff',
    secondary: '#fff',
    tertiary: '#f2f2f2',
    headerColor: '#24292f',
    color: ['#24292f', '#24292f'],
    boxShadow: '0 0 0 1px #d0d7de, 0 8px 24px rgba(140,149,159,0.2)',
    fontSize: ''
  }
}) */

const bibleupp = new BibleUp(body, {
  version: 'kjv',
  popup: 'classic',
  darkTheme: true,
})

bibleupp.create()
// console.log(bibleup.getOptions)

const btn = document.querySelector('#remove')
btn.onclick = () => {
  bibleup.destroy()
}

const btn2 = document.querySelector('#refresh')
btn2.onclick = () => {
  bibleupp.refresh({popup: 'inline', darkTheme: false, styles: {secondary: 'red', color: ['#24292f', '#24292f']}})
}

const add = document.querySelector('#add')
add.onclick = () => {
  const para = document.createElement('p')
  const textNode = document.createTextNode('Proverbs 6:6')
  para.appendChild(textNode)
  testPanel.appendChild(para)
}

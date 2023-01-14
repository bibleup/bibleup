// import BibleUp from '../dist/esm/bibleup.esm.js';
import BibleUp from '../bibleup/js/bibleup.js'

const testPanel = document.querySelector('#test-panel')
const body = document.querySelector('body')
const addBtn = document.querySelector('#add')
const removeBtn = document.querySelector('#remove')
const refreshBtn = document.querySelector('#refresh')

const bibleup = new BibleUp(body, {
  version: 'kjv',
  popup: 'classic',
  darkTheme: false,
  styles: {
    primary: 'linear-gradient(315deg, #f9d976 0%, #f39f86 74%)',
    secondary: 'linear-gradient(315deg, #f9d976 0%, #f39f86 74%)',
    tertiary: '#f2f2f2',
    headerColor: '#fff',
    boxShadow: '0 0 0 1px #d0d7de, 0 8px 24px rgba(140,149,159,0.2)',
    fontSize: ''
  }
})

/* const bibleupp = new BibleUp(body, {
  version: 'kjv',
  popup: 'classic',
  darkTheme: false
}) */

bibleup.create()

removeBtn.onclick = () => {
  bibleup.destroy(false)
}

refreshBtn.onclick = () => {
  //bibleup.refresh({popup: 'classic', bu_ignore: ['BLOCKQUOTE'], bu_id: 'custom1'}, true)
  bibleup.refresh({
    version: 'kjv',
    popup: 'wiki',
    darkTheme: true,
  }, true)
}

addBtn.onclick = () => {
  const para = document.createElement('p')
  const textNode = document.createTextNode('Proverbs 6:6')
  para.appendChild(textNode)
  testPanel?.appendChild(para)
}

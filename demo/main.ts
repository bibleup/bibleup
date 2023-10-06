console.log('BibleUp Demo')
//import BibleUp from '@bibleup/bibleup';
import BibleUp from '../bibleup/bibleup.ts'

const body = document.querySelector('body') as HTMLElement
const addBtn = document.querySelector('#add') as HTMLElement
const removeBtn = document.querySelector('#remove') as HTMLElement
const refreshBtn = document.querySelector('#refresh') as HTMLElement

const bibleup = new BibleUp(body, {
  version: 'ESV',
  popup: 'classic',
  darkTheme: false,
  //bu_ignore: ['I'],
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
  bibleup.refresh({popup: 'classic', bu_ignore: ['BLOCKQUOTE'], bu_id: 'custom1'}, true)
  /* bibleup.refresh({
    version: 'kjv',
    popup: 'wiki',
    darkTheme: true,
  }, true) */
}

addBtn.onclick = () => {
  const para = document.createElement('p')
  const textNode = document.createTextNode('Proverbs 6:6')
  para.appendChild(textNode)
  //testPanel?.appendChild(para)
}
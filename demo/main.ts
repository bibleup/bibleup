console.log('BibleUp Demo')
//import BibleUp from '@bibleup/bibleup';
import BibleUp from '../bibleup/bibleup.ts'

const body = document.querySelector('body') as HTMLElement
const addBtn = document.querySelector('#add') as HTMLElement
const removeBtn = document.querySelector('#remove') as HTMLElement
const refreshBtn = document.querySelector('#refresh') as HTMLElement

const page = new BibleUp(body, {
  version: 'NASB',
  popup: 'classic',
  darkTheme: false,
  bu_ignore: ['I'],
  bu_allow: ['H4'],
  //ignoreCase: true,
  styles: {
    primary: 'linear-gradient(315deg, #f9d976 0%, #f39f86 74%)',
    secondary: 'linear-gradient(315deg, #f9d976 0%, #f39f86 74%)',
    tertiary: '#f2f2f2',
    headerColor: '#fff',
    boxShadow: '0 0 0 1px #d0d7de, 0 8px 24px rgba(140,149,159,0.2)',
    fontSize: ''
  },
})

page.create()

removeBtn.onclick = () => {
  page.destroy(false)
}

refreshBtn.onclick = () => {
  // page.refresh({popup: 'classic', bu_ignore: [], bu_allow: false, buid: 'custom1'}, true)
  page.refresh({
    version: 'KJV',
    popup: 'wiki',
    styles: {
      fontSize: '12px'
    }
  })
}

addBtn.onclick = () => {
  const para = document.createElement('p')
  const textNode = document.createTextNode('Proverbs 6:6')
  para.appendChild(textNode)
  //testPanel?.appendChild(para)
}
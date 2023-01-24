import bibleData from './bible-data.js'

/**
   * extracts bible passages from a string
   * returns array of objects [{<ref>,<book>,<chapter>,<verse>,<verseEnd><apiBook>}]
   */
export const extractPassage = (txt) => {
  txt = txt.trim()
  let result = {}
  const bibleRegex = regex()
  const bible = [...txt.matchAll(bibleRegex)]

  if (bible.length > 0) {
    bible.forEach((bibleRef) => {
      result = structureRef(bibleRef)
    })
  } else {
    result = false
  }

  return result
}

/**
   * @return All bible abbreviations separated by '|'
   * This used in creating bibleRegex
   */
const allAbbreviations = () => {
  let result = ''

  for (const book of bibleData) {
    if (book.id === 66) {
      result += book.book + '|' + book.abbr.join('|')
    } else {
      result += book.book + '|' + book.abbr.join('|') + '|'
    }
  }

  return result
}

/**
   * returns bible regex expression
   * /(john|jn|rom|...)\s?(\d{1,3})(?:(?:\s|\:)(\d{1,3})(?:\-(\d{1,3}))?)?/gi;
   */
const regex = () => {
  const booksAbbr = allAbbreviations()
  const regexVar = `(${booksAbbr})\\s?(\\d{1,3})(?:(?:\\s|\\:|\\:\\s)(\\d{1,3})(?:\\-(\\d{1,3}))?)?`
  const regex = new RegExp(regexVar, 'gi')
  return regex
}

/**
 * Get abbr book for api.bible
 * accepts standard book - 'Psalm'
 * returns abbr book for API/URL - 'PSA'
 * The result is from 'bibleData', so it doesn't send a request to the API
 */
const getAPIBook = (book) => {
  for (const data of bibleData) {
    if (data.book === book) {
      return data.api
    }
  }
}

/**
   * get real standard book name from an abbreviation
   * e.g Jn or jn returns John, gen returns Genesis
   */
const realBook = (abbr) => {
  abbr = abbr.toLowerCase()
  for (const data of bibleData) {
    const abbrList = data.abbr.map(element => element.toLowerCase())
    if (abbrList.includes(abbr) || data.book.toLowerCase() === abbr) {
      return data.book
    }
  }
}

/**
 * accepts bible array like ['rom 2 23',rom,2,23], [jn 3:16 17, jn, 3,16,17]
 * returns object {<ref>,<chapter><verse><verseEnd><...>}
 */
const structureRef = (bibleRef) => {
  const book = realBook(bibleRef[1])
  let apiBook = getAPIBook(book)
  const chapter = parseInt(bibleRef[2])
  let verse = parseInt(bibleRef[3]) || 1
  let verseEnd = parseInt(bibleRef[4]) || undefined

  // swap value of verse and verseEnd
  if (verse > verseEnd) {
    const temp = verse
    verse = verseEnd
    verseEnd = temp
  }

  // complete reference
  let ref
  if (verse === undefined) {
    ref = `${book} ${chapter}`
    apiBook = `${apiBook}.${chapter}`
  } else if (verseEnd === undefined) {
    ref = `${book} ${chapter}:${verse}`
    apiBook = `${apiBook}.${chapter}.${verse}`
  } else {
    ref = `${book} ${chapter}:${verse}-${verseEnd}`
    apiBook = `${apiBook}.${chapter}.${verse}-${apiBook}.${chapter}.${verseEnd}`
  }

  return {
    ref,
    book,
    chapter,
    verse,
    verseEnd,
    apiBook
  }
}

import bibleData from './bible-data.js'
import { BibleData, BibleRef } from './interfaces.js'

/**
 * @return All bible abbreviations separated by '|'
 * This used in creating bibleRegex
 */
export const allAbbreviations = () => {
  const result = []
  const multipart: string[] = []

  for (const book of bibleData) {
    result.push(book.book, ...book.abbr)
    if (book.multipart) {
      multipart.push(book.book, ...book.abbr)
    }
  }

  return {
    all: result.join('|'),
    multipart: multipart.join('|')
  }
}

/**
 * Get abbr book for api.bible
 * accepts standard book - 'Psalm'
 * returns abbr book for API/URL - 'PSA'
 * The result is from 'bibleData', so it doesn't send a request to the API
 */
const getAPIBook = (book: string) => {
  const bible = bibleData.find((bible) => bible.book === book)
  return bible ? bible.api : undefined
}

/**
 * get real standard book name from an abbreviation
 * e.g Jn or jn returns John, gen returns Genesis
 */
const realBook = (abbr: string) => {
  abbr = abbr.toLowerCase()
  for (const data of bibleData) {
    const abbrList = data.abbr.map((element) => element.toLowerCase())
    if (abbrList.includes(abbr) || data.book.toLowerCase() === abbr) {
      return data.book
    }
  }

  return 'undefined'
}

/**
 * extracts full Bible from object Type BibleData
 * returns object Type BibleRef
 */
export const extractPassage = (bibleData: BibleData): BibleRef | false => {
  const book = realBook(bibleData.book)
  let apiBook = getAPIBook(book)
  const chapter = parseInt(bibleData.chapter)
  let verse = parseInt(bibleData.verse) || 1
  let verseEnd = parseInt(bibleData.verseEnd) || undefined

  if (apiBook === undefined) {
    return false
  }

  // swap value of verse and verseEnd
  if (verseEnd !== undefined && verse > verseEnd) {
    [verse, verseEnd] = [verseEnd, verse]
  }

  // complete reference
  let ref
  if (verseEnd === undefined) {
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

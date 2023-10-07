import bibleData from './bible-data.js'
import { BibleData, BibleRef, SupportedVersions } from './interfaces.js'

/**
 * @return All book names and abbreviations separated by '|'
 * - Multipart books include 1st John, 2nd John, etc.
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
 * @returns The book ID for a particular Bible book
 * - accepts standard book - 'Psalm'
 * - returns ID - 19
 */
export const getBookId = (book: string) => {
  const bible = bibleData.find((bible) => bible.book === book)
  return bible ? bible.id : undefined
}

/**
 * Supported Bible versions
 * @property bibleApi - Versions to be fetched through api.bible
 * @property bolls - Versions to be fetched through Bolls
 */
export const supportedVersions: SupportedVersions = {
  bibleApi: ['KJV', 'ASV', 'LSV', 'WEB'],
  bolls: ['ESV', 'NIV', 'MSG', 'NLT'],
  get all() {
    return [...this.bolls, ...this.bibleApi]
  }
}

/**
 * @returns The abbreviated book name recognised by api.bible
 * - accepts standard book - 'Psalm'
 * - returns abbr book for API/URL - 'PSA'
 */
const getAPIBook = (book: string) => {
  const bible = bibleData.find((bible) => bible.book === book)
  return bible ? bible.api : undefined
}

/**
 * @returns The real standard book name from an abbreviation
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
 * Converts object of Type BibleData into a complete Bible props object
 * @Returns BibleRef or false
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
    ;[verse, verseEnd] = [verseEnd, verse]
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

import apiKey from './config.js'
import {
  BibleApiResponse,
  BollsApiResponse,
  BibleFetch,
  BibleRef
} from './interfaces.js'
import { getBookId } from './bible.js'

/**
 * get scripture Text from bible reference
 * - @returns BibleFetch
 * - if text returns null, there was problem fetching the Bible text, else text is an array with Bible texts
 */
export const getScripture = async (bible: BibleRef, version: string) => {
  let text: string[] | null
  const versionId = getVersionId(version)
  const isPassage = bible.verseEnd ? true : false
  if (versionId === version.toUpperCase()) {
    //BOLLS VERSION
    text = await fetchBolls(isPassage, bible, versionId)
  } else {
    text = await fetchBibleApi(isPassage, bible.apiBook, versionId)
  }

  const result: BibleFetch = {
    ref: bible.ref,
    version: version.toUpperCase(),
    refData: {
      book: bible.book,
      chapter: bible.chapter,
      startVerse: bible.verse,
      endVerse: bible.verseEnd
    },
    apiBook: bible.apiBook,
    text
  }

  return result
}

const getVersionId = (version: string) => {
  let id
  const BOLLS_VERSION = ['ESV']

  if (BOLLS_VERSION.includes(version.toUpperCase())) {
    return version.toUpperCase()
  }

  switch (version.toUpperCase()) {
    case 'KJV':
      id = 'de4e12af7f28f599-01'
      break
    case 'ASV':
      id = '06125adad2d5898a-01'
      break
    case 'LSV':
      id = '01b29f4b342acc35-01'
      break
    case 'WEB':
      id = '9879dbb7cfe39e4d-01'
      break
    default:
      id = 'de4e12af7f28f599-01'
  }

  return id
}

const fetchBibleApi = async (
  isPassage: boolean,
  apiBook: string,
  versionId: string
): Promise<string[] | null> => {
  const type = isPassage ? 'passages' : 'verses'
  const typePayload = isPassage
    ? 'include-verse-spans=true'
    : 'include-verse-spans=false'
  const url = `https://api.scripture.api.bible/v1/bibles/${versionId}/${type}/${apiBook}?content-type=html&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&${typePayload}&use-org-id=false`

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'api-key': apiKey
      }
    })

    if (!res.ok) {
      throw new Error('A problem occured while fetching data')
    }

    const content = (await res.json()) as BibleApiResponse
    return processBibleText(content, type)
  } catch (error) {
    return null
  }
}

const fetchBolls = async (
  isPassage: boolean,
  Bible: BibleRef,
  versionId: string
): Promise<string[] | null> => {
  const url = 'https://bolls.life/get-verses/'
  const verses = []

  if (isPassage && Bible.verseEnd) {
    for (let i = Bible.verse; i <= Bible.verseEnd; i++) {
      verses.push(i)
    }
  } else {
    verses.push(Bible.verse)
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify([
        {
          translation: versionId,
          book: getBookId(Bible.book),
          chapter: Bible.chapter,
          verses
        }
      ])
    })

    if (!res.ok) {
      throw new Error('A problem occured while fetching data')
    }

    const content = (await res.json()) as BollsApiResponse
    const text: string[] = []
    for (const obj of content[0]) {
      text.push(obj.text)
    }
    return text
  } catch (error) {
    return null
  }
}

/**
 * parses HTML response from the fetch API and extract the verses.
 * - WARNING: The HTML responses are tricky and had to be parsed based on observations from manual testing
 * - if type is `verses`, it returns array with single value ['Jesus be Glorified']
 * - if type is  `passages`, it returns array of values ['Jesus be Glorified', 'Forever']
 */
const processBibleText = (
  res: BibleApiResponse,
  type: 'verses' | 'passages'
): string[] => {
  const result: string[] = []

  if (type === 'verses') {
    const parser = new DOMParser()
    const doc = parser.parseFromString(res.data.content, 'text/html')
    const p = doc.querySelectorAll('p')
    result.push(
      p[0].textContent || p[1].textContent || 'Unable to process Bible text'
    )
  }

  if (type === 'passages') {
    const parser = new DOMParser()
    const doc = parser.parseFromString(res.data.content, 'text/html')
    const span = doc.getElementsByClassName('verse-span')
    let lastVerse

    for (const verse of span) {
      const currVerse = verse.getAttribute('data-verse-id')
      if (currVerse !== lastVerse) {
        lastVerse = verse.getAttribute('data-verse-id')
        if (verse.textContent) result.push(verse.textContent)
      } else {
        // join 'separated' words in verse
        // result[result.length - 1] += ' ' + verse.textContent;
        if (verse.textContent) {
          result[result.length - 1] = `${result[result.length - 1]} ${
            verse.textContent
          }`
        }
      }
    }
  }

  return result
}

import apiKey from './config.js'
import { ApiResponse, BibleFetch, BibleRef } from './interfaces.js'

/**
 * get scripture Text from bible reference
 * - @returns BibleFetch
 * - if text returns null, there was problem fetching the Bible text, else text is an array with Bible texts
 */
export const getScripture = async (bible: BibleRef, version: string) => {
  let text: string[] | null
  const versionId = getVersionId(version)
  if (bible.verseEnd) {
    text = await getPassage(bible.apiBook, versionId)
  } else {
    text = await getText(bible.apiBook, versionId)
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
  switch (version) {
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

const getText = async (
  ref: string,
  versionId: string
): Promise<string[] | null> => {
  const url = `https://api.scripture.api.bible/v1/bibles/${versionId}/verses/${ref}?content-type=html&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false&use-org-id=false`

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'api-key': apiKey
      },
      cache: 'force-cache'
    })

    if (!res.ok) {
      throw new Error('A problem occured while fetching data')
    }

    const content: ApiResponse = (await res.json()) as ApiResponse
    return processBibleText(content, 'text')
  } catch (error) {
    return null
  }
}

/**
 * Get range of verses - ACT.1.8-ACT.1.10
 **/
const getPassage = async (
  ref: string,
  versionId: string
): Promise<string[] | null> => {
  const url = `https://api.scripture.api.bible/v1/bibles/${versionId}/passages/${ref}?content-type=html&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=true&use-org-id=false`

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'api-key': apiKey
      },
      cache: 'force-cache'
    })

    if (!res.ok) {
      throw new Error('A problem occured while fetching data')
    }

    const content: ApiResponse = (await res.json()) as ApiResponse
    return processBibleText(content, 'passage')
  } catch (error) {
    return null
  }
}

/**
 * parses HTML response from the fetch API and extract the verses.
 * - WARNING: The HTML responses are tricky and had to be parsed based on observations from manual testing
 * - returns array e.g ['Jesus be Glorified', 'Forever'] if type is 'passage'
 */
const processBibleText = (
  res: ApiResponse,
  type: 'text' | 'passage'
): string[] => {
  const result: string[] = []

  if (type === 'text') {
    const parser = new DOMParser()
    const doc = parser.parseFromString(res.data.content, 'text/html')
    const p = doc.querySelectorAll('p')
    result.push(
      p[0].textContent || p[1].textContent || 'Unable to process Bible text'
    )
  }

  if (type === 'passage') {
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

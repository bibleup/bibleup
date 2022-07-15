import apiKey from './config.js'

export default class Search {
  /**
   * get scripture Text from bible reference
   * if text = 404, the Bible reference was INVALID
   */
  static async getScripture (bible, version) {
    let text
    const versionId = this.#getVersionId(version)
    if (bible.verseEnd) {
      text = await this.#getPassage(bible.apiBook, versionId)
    } else {
      text = await this.#getText(bible.apiBook, versionId)
    }

    const result = {
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

  static #getVersionId (version) {
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

  static async #getText (ref, versionId) {
    let result = []
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
        result = null
        return result
      }

      const content = await res.json()
      const text = this.#processBibleText(content, 'text')
      result.push(text)
      return result
    } catch (error) {
      result = null
      return result
    }
  }

  /**
   * Get range of verses - ACT.1.8-ACT.1.10
   **/
  static async #getPassage (ref, versionId) {
    let result = []
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
        result = null
        return result
      }

      const content = await res.json()
      const text = this.#processBibleText(content, 'passage')
      return text
    } catch (error) {
      result = null
      return result
    }
  }

  /**
   * parses HTML response from the fetch API and extract the verses.
   * WARN: The HTML responses are tricky and had to be parsed based on observations from manual testing
   * returns text e.g 'Jesus be Glorified' if type is 'text'
   * returns array e.g ['Jesus be Glorified', 'Forever'] if type is 'passage'
   */
  static #processBibleText (obj, type) {
    if (type === 'text') {
      const content = obj.data.content
      const parser = new DOMParser()
      const doc = parser.parseFromString(content, 'text/html')
      const p = doc.querySelectorAll('p')
      return p[0].textContent || p[1].textContent
    }

    if (type === 'passage') {
      const content = obj.data.content
      const parser = new DOMParser()
      const doc = parser.parseFromString(content, 'text/html')
      const span = doc.getElementsByClassName('verse-span')
      const passage = []
      let lastVerse

      for (const verse of span) {
        const currVerse = verse.getAttribute('data-verse-id')
        if (currVerse !== lastVerse) {
          lastVerse = verse.getAttribute('data-verse-id')
          passage.push(verse.textContent)
        } else {
          // join 'separated' words in verse
          passage[passage.length - 1] += ' ' + verse.textContent
        }
      }

      return passage
    }
  }

  // END CLASS
}

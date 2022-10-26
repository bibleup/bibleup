import bibleData from './helper/bible-data.js'
import Bible from './helper/bible.js'
import ConstructPopup from './construct-popup.js'
import positionPopup from './position-popup.js'
import Search from './helper/search.js'

export default class BibleUp {
  // PRIVATE_FIELD
  #element
  #options
  #defaultOptions
  #regex
  #mouseOnPopup // if mouse is on popup
  #popupTimer
  #loadingTimer
  #currentRef // currently loading bible ref
  #activeLink // unique identifier of last clicked link
  #popup
  #ispopupOpen
  #events
  #buid // unique bibleup instance key

  constructor (element, options) {
    this.#element = element
    this.#defaultOptions = {
      version: 'KJV',
      popup: 'classic',
      darkTheme: false,
      bu_ignore: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'IMG', 'A'],
      bu_allow: [],
      styles: {}
    }

    if (typeof options === 'object' && options !== null) {
      this.#options = { ...this.#defaultOptions, ...options }
    } else {
      this.#options = this.#defaultOptions
    }

    this.#buid = Math.floor(100000 + Math.random() * 999999)
    this.#init(this.#options)
    this.#regex = this.#generateRegex(bibleData)
    this.#mouseOnPopup = false
    this.#ispopupOpen = false

    this.#events = {
      clickHandler: this.#clickHandler.bind(this),
      closePopup: this.#closePopup.bind(this),
      exitPopup: this.#exitPopup.bind(this)
    }
  }

  /**
   * {type} getter
   * {return} all options for present class instance
   */
  get getOptions () {
    return this.#options
  }

  /**
   * {desc} class entry point.
   * create instances for entire app func
   *
   */
  create () {
    this.#searchNode(this.#element, this.#regex.main)
    this.#manageEvents(this.#options)
  }

  /**
   * This method destoys BibleUp creation and removes the links and popup from the page
   * @param force - Specify whether to totally delete bibleup, and refresh() won't work anymore. This will also remove popup
   * container; or to keep popup container and bibleup tagging can be resumed with refresh() method - when set to false
   */
  destroy (force = true) {
    const links = document.querySelectorAll(`.bu-link-${this.#buid}`)
    for (const link of links) {
      const ref = link.closest('cite').getAttribute('bu-ref')
      link.closest('cite').replaceWith(ref)
    }
    if (force === true && this.#popup.container) {
      this.#popup.container.remove()
      this.#buid = undefined
    }
  }

  /**
   * @param options New BibleUp Options
   * @param element The new element to search, if specified; else, the element specified during BibleUp
   * instantiation will be searched again
   * @param force If false, previous BibleUp options will be merged with new options passed to the method on refresh.
   * If force is set to true, the options passed into this method will totally overwrite previous options
   */
  refresh (options = {}, force = false, element = this.#element) {
    if (!this.#buid) {
      this.#error('cannot call refresh() on an uncreated or destroyed BibleUp instance')
    }
    const old = this.#options
    const trigger = { version: false, popup: false, style: false }

    if (force === true) {
      this.#options = { ...this.#defaultOptions, ...options }
    } else {
      this.#options = { ...this.#defaultOptions, ...this.#options, ...options }
    }

    // set trigger version
    if (old.version !== this.#options.version) {
      trigger.version = true
    }

    // set trigger build popup
    if (old.popup !== this.#options.popup || old.darkTheme !== this.#options.darkTheme) {
      this.#popup.container?.remove()
      trigger.popup = true
      trigger.style = true
    }

    // set trigger styles
    if (JSON.stringify(old.styles) !== JSON.stringify(this.#options.styles)) {
      trigger.style = true
    }

    this.#searchNode(element, this.#regex.main)
    if (trigger.version || trigger.popup || trigger.style) {
      this.#init(this.#options, trigger)
    }
    this.#manageEvents(this.#options)
  }

  /**
   * @param {Object} options BibleUp Options
   * @param {*} trigger Optional - define what to trigger init on
   */
  #init (options, trigger = {}) {
    const definetrigger = { version: true, popup: true, style: true }
    trigger = { ...definetrigger, ...trigger }

    if (trigger.version) {
      const versions = ['KJV', 'ASV', 'LSV', 'WEB']
      if (versions.includes(options.version.toUpperCase()) === false) {
        this.#error('The version in BibleUp options is currently not supported. Try with other supported versions')
      }
    }

    if (trigger.popup) {
      const popup = ['classic', 'inline', 'wiki']
      if (popup.includes(options.popup)) {
        ConstructPopup.build(options, this.#buid)
        this.#popup = {
          container: document.getElementById(`bu-popup-${this.#buid}`),
          header: document.querySelector(`#bu-popup-${this.#buid} .bu-popup-header`),
          ref: document.querySelector(`#bu-popup-${this.#buid} .bu-popup-ref`),
          version: document.querySelector(`#bu-popup-${this.#buid} .bu-popup-version`),
          content: document.querySelector(`#bu-popup-${this.#buid} .bu-popup-content`),
          text: document.querySelector(`#bu-popup-${this.#buid} .bu-popup-text`),
          close: document.querySelector(`#bu-popup-${this.#buid} .bu-popup-close`) || false
        }
      } else {
        this.#error("BibleUp was unable to construct popup. Check to see if 'popup' option is correct")
      }
    }

    if (trigger.style) {
      if (this.#options.styles) {
        this.#setStyles(this.#options.styles)
      }
    }
  }

  #setStyles (styles) {
    const real = {
      primary: 'white',
      secondary: '#e6e6e6',
      tertiary: '#f2f2f2',
      headerColor: '#212529',
      fontColor: '#212529',
      versionColor: '#212529',
      closeColor: '#212529',
      borderRadius: '0',
      boxShadow: '0px 0px 3px 0.7px #a6a6a6'
    }

    if (this.#options.popup === 'classic') {
      if (this.#options.darkTheme === true) {
        real.primary = '#595959'
        real.secondary = '#d9d9d9'
        real.fontColor = '#f2f2f2'
        real.headerColor = '#333'
      }
    }

    if (this.#options.popup === 'inline') {
      real.borderRadius = '5px'
      real.boxShadow = '0px 0px 2px 0.5px #ccc'
      if (this.#options.darkTheme === true) {
        real.primary = '#3d4245'
        real.fontColor = '#f2f2f2'
      }
    }

    if (this.#options.popup === 'wiki') {
      real.secondary = 'white'
      if (this.#options.darkTheme === true) {
        real.primary = real.secondary = '#3d4245'
        real.fontColor = real.closeColor = real.headerColor = '#f2f2f2'
        real.versionColor = '#333'
      }
    }

    styles = { ...real, ...styles }
    const { container, header, version, close } = this.#popup

    // popup background and color
    container.style.background = styles.primary
    container.style.color = styles.fontColor
    // header background and color
    if (header) {
      header.style.background = styles.secondary
      header.style.color = styles.headerColor
    }
    // version background and color
    if (version) {
      version.style.background = styles.tertiary
      version.style.color = styles.versionColor
    }
    // close color
    if (close) {
      close.style.color = styles.closeColor
    }
    container.style.borderRadius = styles.borderRadius
    container.style.boxShadow = styles.boxShadow
    container.style.fontSize = styles.fontSize
  }

  /**
   * method: BibleUp Scripture Regex
   * param(refGroup) get all abbreviations and append each with '|' to construct a regex capturing group.
   * This regex is a combination of two regular expressions (standard Bible reference and look-behind Bible reference) using the or '|' operator
   * Contains a total of six capturing groups. 3 for the first regex and the remaining 3 for the look-behind
   * one set of the capturing group returns 'undefined' when the other regex is matched
   * Regex matches: john 3:16-17, 1 Tim 5:2,5&10
   */
  #generateRegex (bibleData) {
    let allBooks = ''
    const versions = 'KJV|ASV|LSV|WEB'
    const allMultipart = []

    for (const book of bibleData) {
      if (book.id === 66) {
        allBooks += book.book + '|' + book.abbr.join('|')
      } else {
        allBooks += book.book + '|' + book.abbr.join('|') + '|'
      }

      if (book.multipart) {
        allMultipart.push(book.book, ...book.abbr)
      }
    }

    const main = `(?:(?:(${allBooks})(?:\\.?)\\s?(\\d{1,3})(?:\\:\\s?(\\d{1,3}(?:\\s?\\-\\s?\\d{1,3})?))?)(?:[a-zA-Z])?(?:\\s(${versions}))?)(?:\\s?(?:\\,|\\;|\\&)\\s?(?!\\s?(?:${allMultipart.join(
      '|'
    )})(?:\\.?)\\b)\\s?(?:\\d{1,3}\\s?\\-\\s?\\d{1,3}|\\d{1,3}\\:\\d{1,3}(?:\\-\\d{1,3})?|\\d{1,3})(?:[a-zA-Z](?![a-zA-Z]))?(?:\\s(${versions}))?)*`
    const verse = `(?:(?:(${allBooks})(?:\\.?)\\s?(\\d{1,3})(?:\\:\\s?(\\d{1,3}(?:\\s?\\-\\s?\\d{1,3})?))?)(?:[a-zA-Z])?(?:\\s(${versions}))?)|(\\d{1,3}\\s?\\-\\s?\\d{1,3}|\\d{1,3}\\:\\d{1,3}(?:\\-\\d{1,3})?|\\d{1,3})(?:[a-zA-Z](?![a-zA-Z]))?(?:\\s(${versions}))?`

    return {
      main: new RegExp(main, 'g'),
      verse: new RegExp(verse, 'g')
    }
  }

  /**
   * This function traverse all nodes and child nodes in the `e` parameter and calls #createLink on all text nodes that matches the Bible regex
   * The function performs a self call on element child nodes until all matches are found
   */
  #searchNode (e, regex) {
    let type = e?.nodeType ?? this.#error('Element does not exist in the DOM')
    const match = e.textContent.match(regex) || false
    let next

    if (type === 3 && match) {
      this.#createLink(e, regex)
    } else if (type === 1 && match) {
      // element node
      if ((e = e.firstChild)) {
        do {
          next = e.nextSibling
          type = e.nodeType
          if (type === 1) {
            if (this.#validateNode(e)) {
              this.#searchNode(e, regex)
            }
          } else {
            this.#searchNode(e, regex)
          }
        } while ((e = next))
      }
    }
  }

  /**
   * {desc} This function validates elements node before running #searchNode() on subsequent child elements
   * Returns true after successful validation else returns false
   */
  #validateNode (e) {
    const forbiddenTags = this.#options.bu_ignore
    const allowedTags = this.#options.bu_allow
    const privateIgnore = [...forbiddenTags, 'SCRIPT', 'STYLE', 'SVG', 'INPUT', 'TEXTAREA', 'SELECT']
    if (privateIgnore.includes(e.tagName) && !allowedTags.includes(e.tagName)) {
      return false
    } else if (e.classList.contains('bu-ignore') === false) {
      return true
    }
  }

  /**
   * {desc} This function returns: appends <cite> on text nodes with a scripture match
   * It replaces 'This text is john 3.16' with 'This text is <cite attr>John 3:16</cite>'
   * param(node) is a text node
   */
  #createLink (node) {
    const newNode = document.createElement('div')
    newNode.innerHTML = node.nodeValue.replace(this.#regex.main, this.#setLinkMarkup.bind(this))

    if (node.nodeValue !== newNode.innerHTML) {
      while (newNode.firstChild) {
        // console.log(newNode.firstChild.textContent);
        node.parentNode.insertBefore(newNode.firstChild, node)
      }
      node.parentNode.removeChild(node)
    }
  }

  /**
   * @param match This is the full match string
   * @param {...args} This is the main reference capture groups (p1-pN) - Check replace() on MDN
   * @returns A complete BibleUp Link
   */
  #setLinkMarkup (match, book, chapter, verse, version) {
    const bible = {
      book,
      chapter,
      verse: verse || '1',
      version
    }

    // reference with only chapter and no verse (Romans 8)
    const isChapterLevel = verse === undefined

    /**
     * Resolves actual chapter and verse number for reference parts
     * References with multiple chapters will overwrite the chapter that will be used for subsequent verses
     * @param verse verse number of main reference
     */
    const vesreContext = (verse) => {
      const result = {}
      if ((verse.includes(':') && verse.includes('-')) || verse.includes(':')) {
        // (in-line chapter with range) or (in-line chapter only)
        result.chapter = verse.slice(0, verse.lastIndexOf(':'))
        result.verse = verse.slice(verse.lastIndexOf(':') + 1)
        bible.chapter = result.chapter
      } else if (isChapterLevel) {
        result.chapter = verse
        result.verse = '1'
      } else {
        result.verse = verse
      }
      return result
    }

    // Get `bible` object of main reference and each reference parts
    const getBible = (args) => {
      const res = {}
      if (args[0] !== undefined) {
        // main reference
        res.book = bible.book
        res.chapter = bible.chapter
        res.verse = bible.verse
        res.version = bible.version || false
      } else {
        // reference parts
        const { chapter, verse } = vesreContext(args[4])
        res.book = bible.book
        res.chapter = chapter || bible.chapter
        res.verse = verse || bible.verse
        res.version = args[5] || false
      }
      return res
    }

    /**
     * @desc This breaks the entire string and matches the main reference and every verse, ranges and parts separately.
     * Each match is wrapped with an anchor element. The match regex is `this.#regex.verse`
     * Invalid chapter/verse is returned as is.
     * Example: Jn 3:16,17 to <a>Jn 3:16</a>,<a>17</a>
     */
    const str = match.replace(this.#regex.verse, (match, ...args) => {
      const bibleData = getBible(args)
      const buData = this.#validateBible(bibleData)
      if (buData === false) {
        // invalid chapter/verse
        return match
      } else {
        return `<a href='#' class='bu-link-${this.#buid}' bu-data='${buData}'>${match}</a>`
      }
    })

    if (str === match) {
      return match
    } else {
      return `<cite class='bu-link' bu-ref='${match}'>${str}</cite>`
    }
  }

  /*
   * @param bible - bible is an object {book, chapter, verse, version}
   * Returns stringified object containing valid, complete reference (bu-data) if reference is valid else returns false
   * The object is in the form - {ref,book,chapter,verse,apiBook}
   */
  #validateBible (bible) {
    let bibleRef = `${bible.book} ${bible.chapter}:${bible.verse.replaceAll(' ', '')}`
    bibleRef = Bible.extractPassage(bibleRef)

    if (bible.version) {
      // add version tagging if present
      bibleRef.version = bible.version
    }

    for (const data of bibleData) {
      if (data.book === bibleRef.book) {
        if (
          bibleRef.chapter <= data.chapters.length &&
          data.chapters[bibleRef.chapter - 1] !== undefined &&
          bibleRef.verse <= data.chapters[bibleRef.chapter - 1]
        ) {
          if (bibleRef.verseEnd === undefined) {
            return JSON.stringify(bibleRef)
          } else if (bibleRef.verseEnd <= data.chapters[bibleRef.chapter - 1]) {
            return JSON.stringify(bibleRef)
          } else {
            return false
          }
        } else {
          return false
        }
      }
    }
  }

  #manageEvents () {
    const bulink = document.querySelectorAll(`.bu-link-${this.#buid}`)
    // link 'anchor' events
    bulink.forEach((link) => {
      link.removeEventListener('mouseenter', this.#events.clickHandler)
      link.removeEventListener('mouseleave', this.#events.closePopup)

      // prevent scroll behaviour
      link.onclick = (e) => {
        e.preventDefault()
        e.stopPropagation()
      }

      link.addEventListener('mouseenter', this.#events.clickHandler)
      link.addEventListener('mouseleave', this.#events.closePopup)
    })

    this.#popup.container.onmouseenter = () => {
      this.#mouseOnPopup = true
    }

    this.#popup.container.onmouseleave = (e) => {
      this.#mouseOnPopup = false
      this.#closePopup(e)
    }

    // close popup events
    if (this.#popup.close) {
      this.#popup.close.removeEventListener('click', this.#events.exitPopup)
      this.#popup.close.addEventListener('click', this.#events.exitPopup)
    }

    window.onkeydown = (e) => {
      if (e.key === 'Escape') {
        if (this.#ispopupOpen) {
          this.#exitPopup()
        }
      }
    }
  }

  /**
   * {type} Event Handler for mouseEnter and click events
   * calls series of methods and updates popup
   */

  async #clickHandler (e) {
    this.#clearTimer()

    const getPosition = (el) => {
      const top = el.getBoundingClientRect().top
      const left = el.getBoundingClientRect().left
      return top + left
    }

    // only update popup if popup is already hidden or different link is clicked than the one active
    if (this.#ispopupOpen === false || this.#activeLink !== getPosition(e.currentTarget)) {
      this.#activeLink = getPosition(e.currentTarget)
      let bibleRef = e.currentTarget.getAttribute('bu-data')
      bibleRef = JSON.parse(bibleRef)

      // add delay before popup 'loading' - to allow fetch return cache if it exists
      this.#loadingTimer = setTimeout(() => {
        this.#updatePopup(bibleRef, true)
        positionPopup(e, this.#options.popup, this.#popup.container)
        this.#openPopup()
      }, 100)

      // call to fetch bible text
      this.#currentRef = bibleRef.ref
      const res = await Search.getScripture(bibleRef, bibleRef.version ?? this.#options.version)

      if (this.#currentRef === res.ref) {
        // only when cursor is still on same link
        this.#updatePopup(res, false)
        positionPopup(e, this.#options.popup, this.#popup.container)
        if (this.#loadingTimer) {
          this.#openPopup()
          clearTimeout(this.#loadingTimer)
        }
      }
    }
  }

  /**
   * @param res contains bu-data content of a link, and the full text (if isLoading is false)
   * @param isLoading a boolean that makes popup show 'loading' before the bible text is updated
   * @param res res.ref, res.text, res.chapter, res.verse, res.version - a complete res object
   * (description) update popup data
   */
  #updatePopup (res, isLoading) {
    if (isLoading) {
      if (this.#popup.ref) {
        this.#popup.ref.textContent = res.ref
      }

      if (this.#popup.version) {
        this.#popup.version.textContent = res.version ?? this.#options.version.toUpperCase()
      }

      this.#popup.text.textContent = 'Loading...'
    } else {
      if (this.#popup.ref) {
        this.#popup.ref.textContent = res.ref
        // REF Accessibility
        this.#popup.container.setAttribute('aria-label', `${res.ref}`)
      }

      if (this.#popup.version) {
        this.#popup.version.textContent = res.version
      }

      this.#popup.text.setAttribute('start', res.refData.startVerse)

      if (res.text == null) {
        this.#popup.text.textContent = 'Cannot load bible reference at the moment.'
      } else {
        this.#popup.text.innerHTML = ''
        res.text.forEach((verse) => {
          this.#popup.text.innerHTML += `<li>${verse}</li>`
        })
      }
    }
  }

  #openPopup () {
    if (!this.#ispopupOpen) {
      this.#popup.container.classList.remove('bu-popup-hide')
      if (this.#popup.close) {
        this.#popup.close.focus()
      }
      this.#ispopupOpen = true
    }
  }

  /**
   * closePopup() is for mouse events which needs timeout
   */
  #closePopup (e) {
    if (!this.#popupTimer) {
      this.#popupTimer = setTimeout(() => {
        if (!this.#mouseOnPopup) {
          const mouseFrom = e.relatedTarget
          if (!mouseFrom || mouseFrom.classList.contains(`bu-link-${this.#buid}`) === false) {
            this.#exitPopup()
          }
        }
        this.#clearTimer()
      }, 100)
    }
  }

  #exitPopup () {
    this.#popup.container.classList.add('bu-popup-hide')
    this.#mouseOnPopup = false
    this.#ispopupOpen = false
  }

  #clearTimer () {
    clearTimeout(this.#loadingTimer)
    clearTimeout(this.#popupTimer)
    this.#loadingTimer = undefined
    this.#popupTimer = undefined
  }

  #error (msg) {
    throw new Error(msg)
  }
}

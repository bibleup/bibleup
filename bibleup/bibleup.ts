import bibleData from './helper/bible-data'
import * as Bible from './helper/bible'
import * as constructPopup from './construct-popup'
import { positionPopup } from './position-popup'
import * as Search from './helper/search'
import {
  BibleData,
  BibleFetch,
  BibleRef,
  Options,
  Popup,
  Regex,
  Styles,
  Trigger
} from './helper/interfaces'

export default class BibleUp {
  // PRIVATE_FIELD
  #element: HTMLElement
  #options: Options
  #defaultOptions: Options
  #regex
  #mouseOnPopup // if mouse is on popup
  #popupTimer: NodeJS.Timeout | undefined
  #loadingTimer: NodeJS.Timeout | undefined
  #currentRef: string | undefined // currently loading bible ref
  #activeLink: number | undefined // unique identifier of last clicked link
  #popup!: Popup

  #ispopupOpen: boolean
  #events
  #initKey: string // unique bibleup instance key

  constructor(element: HTMLElement, options: Partial<Options>) {
    this.#element = element
    this.#defaultOptions = {
      version: 'KJV',
      popup: 'classic',
      darkTheme: false,
      bu_ignore: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'A'],
      bu_allow: [],
      buid: '',
      ignoreCase: false,
      styles: {}
    }

    if (typeof options === 'object' && options !== null) {
      this.#options = {
        ...this.#defaultOptions,
        ...options
      }
    } else {
      this.#options = this.#defaultOptions
    }

    this.#initKey = Math.floor(
      Math.random() * (999999 - 100000) + 100000
    ).toString()
    this.#init(this.#options)
    this.#regex = this.#generateRegex()
    this.#mouseOnPopup = false
    this.#ispopupOpen = false

    this.#events = {
      clickHandler: this.#clickHandler.bind(this),
      closePopup: this.#closePopup.bind(this),
      exitPopup: this.#exitPopup.bind(this)
    }
  }

  /**
   * Returns BibleUp Options for present class instance
   * @returns {Options}
   */
  get getOptions() {
    return this.#options
  }

  /**
   * Returns buid for a BibleUp Instance. This can either be the buid specified in Options or private initKey of instance
   * @returns {string}
   */
  get #buid(): string {
    return this.#options.buid || this.#initKey
  }

  /**
   * Activates a BibleUp instance.
   */
  create() {
    this.#searchNode(this.#element, this.#regex.main)
    this.#manageEvents()
  }

  /**
   * This method destoys BibleUp instance and removes the links and popup from the page
   * @param force - Specify whether to totally destroy bibleup instance, and refresh() won't work anymore. when set to false, this will preserve popup container and bibleup tagging can be resumed with refresh() method
   */
  destroy(force = true) {
    const links = document.querySelectorAll(`.bu-link-${this.#buid}`)
    for (const link of links) {
      const cite = link.closest('cite')
      if (cite) {
        const ref = cite.getAttribute('bu-ref')
        if (ref) cite.replaceWith(ref)
      }
    }

    if (force === true && this.#popup.container) {
      this.#popup.container.remove()
      this.#initKey = ''
    }
  }

  /**
   * Returns a new merged BibleUp Options
   * @param {*} force - If force is true, it merges defaultOptions and newOptions to form a new BibleUp.options Object,
   * else it updates BibleUp.options with any changes in newOptions.
   * @param {*} defaultOptions
   * @param {*} new0ptions
   */
  #mergeOptions(
    force: boolean,
    defaultOptions: Options,
    new0ptions: Partial<Options>
  ) {
    if (force === true) {
      return { ...defaultOptions, ...new0ptions }
    } else {
      const merge: Options = { ...this.#options, ...new0ptions }
      for (const [key, value] of Object.entries(new0ptions)) {
        const k = key as keyof Options
        if (Array.isArray(value)) {
          ;(merge[k] as string[]) = [
            ...(this.#options[k] as string[]),
            ...value
          ]
        } else if (value && typeof value === 'object') {
          ;(merge[k] as Partial<Styles>) = {
            ...(this.#options[k] as Partial<Styles>),
            ...value
          }
        } else {
          ;(merge[k] as string | boolean) = value
        }
      }

      return merge
    }
  }

  /**
   * Modifies the options of a BibleUp instance
   * @param options New BibleUp Options
   * @param element The new element to search, if specified; else, the element specified during BibleUp
   * instantiation will be searched again
   * @param force If false, previous BibleUp options will be merged with new options passed.
   * If force is set to true, the options passed into this method will totally overwrite previous options
   */
  refresh(
    options: Partial<Options> = {},
    force = false,
    element = this.#element
  ) {
    if (!this.#initKey) {
      this.#error(
        'cannot call refresh on an uncreated or destroyed BibleUp instance'
      )
    }

    const old = this.#options
    const trigger = { version: false, popup: false, style: false }
    this.#options = this.#mergeOptions(force, this.#defaultOptions, options)

    // trigger version
    if (old.version !== this.#options.version) {
      trigger.version = true
    }

    // trigger build popup
    if (
      old.popup !== this.#options.popup ||
      old.darkTheme !== this.#options.darkTheme ||
      old.buid !== this.#options.buid
    ) {
      this.#popup.container?.remove()
      trigger.popup = true
      trigger.style = true
    }

    // change link class if buid changes
    if (old.buid !== this.#options.buid) {
      const oldKey = old.buid || this.#initKey
      const bulink = document.querySelectorAll(`.bu-link-${oldKey}`)
      bulink.forEach((link) => {
        link.classList.replace(`bu-link-${oldKey}`, `bu-link-${this.#buid}`)
      })
    }

    // trigger styles
    if (JSON.stringify(old.styles) !== JSON.stringify(this.#options.styles)) {
      trigger.style = true
    }

    // change this.#regex if ignoreCase changes
    if (old.ignoreCase !== this.#options.ignoreCase) {
      this.#regex = this.#generateRegex()
    }

    this.#searchNode(element, this.#regex.main)
    // call init() for changes
    if (force) {
      this.#popup.container?.remove()
      this.#init(this.#options)
    } else if (trigger.version || trigger.popup || trigger.style) {
      this.#init(this.#options, trigger)
    }
    this.#manageEvents()
  }

  /**
   * @param {Object} options BibleUp Options
   * @param {*} trigger Optional - define what to trigger init on
   */
  #init(
    options: Options,
    trigger: Trigger = { version: true, popup: true, style: true }
  ) {
    if (trigger.version && options.version) {
      const versions = Bible.supportedVersions.all as readonly string[]
      if (versions.includes(options.version.toUpperCase()) === false) {
        this.#error(
          'The version in BibleUp options is currently not supported. Try with other supported versions'
        )
      }
    }

    if (trigger.popup && options.popup) {
      const popup = ['classic', 'inline', 'wiki']
      if (popup.includes(options.popup)) {
        this.#popup = constructPopup.build(options, this.#buid)
      } else {
        this.#error(
          "BibleUp was unable to construct popup. Check to see if 'popup' option is correct"
        )
      }
    }

    if (
      trigger.style &&
      this.#options.styles &&
      Object.keys(this.#options.styles).length !== 0
    ) {
      this.#setStyles(this.#options.styles)
    }
  }

  #setStyles(styles: Partial<Styles>) {
    const { container, header, version, close } = this.#popup
    const props = ['borderRadius', 'boxShadow', 'fontSize'] as const

    for (const prop of props) {
      const value = styles[prop]
      if (value) {
        container.style[prop] = value
      }
    }

    if (styles.primary) {
      container.style.background = styles.primary
    }

    if (styles.fontColor) {
      container.style.color = styles.fontColor
    }

    if (header) {
      if (styles.secondary) {
        header.style.background = styles.secondary
      }

      if (styles.headerColor) {
        header.style.color = styles.headerColor
      }
    }

    if (version) {
      if (styles.tertiary) {
        version.style.background = styles.tertiary
      }

      if (styles.versionColor) {
        version.style.color = styles.versionColor
      }
    }

    if (close && styles.closeColor) {
      close.style.color = styles.closeColor
    }
  }

  /**
   * @returns Object of Type `Regex` containing main regex and standalone verse regex
   */
  #generateRegex(): Regex {
    const versions = Bible.supportedVersions.all.join('|')
    const bookNames = Bible.allAbbreviations()

    const main = `(?:(?:(${bookNames.all})(?:\\.?)\\s?(\\d{1,3})(?:\\:\\s?(\\d{1,3}(?:\\s?\\-\\s?\\d{1,3})?))?)(?:[a-zA-Z])?(?:\\s(${versions}))?)(?:\\s?(?:\\,|\\;|\\&)\\s?(?!\\s?(?:${bookNames.multipart})(?:\\.?)\\b)\\s?(?:\\d{1,3}\\s?\\-\\s?\\d{1,3}|\\d{1,3}\\:\\d{1,3}(?:\\-\\d{1,3})?|\\d{1,3})(?:[a-zA-Z](?![a-zA-Z]))?(?:\\s(${versions}))?)*`
    const verse = `(?:(?:(${bookNames.all})(?:\\.?)\\s?(\\d{1,3})(?:\\:\\s?(\\d{1,3}(?:\\s?\\-\\s?\\d{1,3})?))?)(?:[a-zA-Z])?(?:\\s(${versions}))?)|(\\d{1,3}\\s?\\-\\s?\\d{1,3}|\\d{1,3}\\:\\d{1,3}(?:\\-\\d{1,3})?|\\d{1,3})(?:[a-zA-Z](?![a-zA-Z]))?(?:\\s(${versions}))?`

    const flags = this.#options.ignoreCase ? 'gi' : 'g'
    return {
      main: new RegExp(main, flags),
      verse: new RegExp(verse, flags)
    }
  }

  /**
   * This function traverse all nodes and child nodes in the `e` parameter
   * - It calls `#createLink()` on all text nodes descendants that matches the Bible regex
   * - The function performs a self call on element child nodes until all matches are found
   */
  #searchNode(e: Element, regex: RegExp) {
    if (!e) {
      this.#error('Element does not exist in the DOM')
    }

    const childNodes = Array.from(e.childNodes)

    childNodes.forEach((node) => {
      const type = node.nodeType
      const match = node.textContent?.match(regex) || false

      if (type === 3 && match) {
        this.#createLink(node)
      } else if (type === 1 && match) {
        // element node
        if (this.#validateNode(node as HTMLElement)) {
          this.#searchNode(node as Element, regex)
        }
      }
    })
  }

  /**
   * This function validates elements node.
   * Returns true after successful validation else returns false
   */
  #validateNode(e: HTMLElement): boolean {
    const { bu_ignore: buIgnore, bu_allow: allowedTags } = this.#options
    const forbiddenTags = [
      ...buIgnore,
      'SCRIPT',
      'STYLE',
      'SVG',
      'IMG',
      'INPUT',
      'TEXTAREA',
      'SELECT'
    ]

    if (forbiddenTags.includes(e.tagName) && !allowedTags.includes(e.tagName)) {
      return false
    } else if (e.classList.contains('bu-ignore')) {
      return false
    } else {
      return true
    }
  }

  /**
   * Wraps text nodes which matches scripture Regex with `<cite>` element
   * - It replaces 'This text is john 3.16' with 'This text is `<cite>John 3:16</cite>`'
   * @param node - text node
   */
  #createLink(node: Node) {
    const newNode = document.createElement('div')
    const frag = document.createDocumentFragment()
    if (node.nodeValue) {
      newNode.innerHTML = node.nodeValue.replace(
        this.#regex.main,
        this.#setLinkMarkup.bind(this)
      )
    }

    if (node.nodeValue !== newNode.innerHTML) {
      const parent = node.parentNode
      while (newNode.firstChild) {
        frag.appendChild(newNode.firstChild)
      }
      parent?.replaceChild(frag, node)
    }
  }

  /**
   * converts regex match (main) into cite element and regex verse into anchor links
   * Note that the args of this function is from all matches captured by the regex and named accordingly
   * @param {...args} This is the main reference capture groups (p1-pN) - Check replace() on MDN
   * @returns A complete BibleUp Link
   */
  #setLinkMarkup(
    match: string,
    book: string,
    chapter: string,
    verse: string,
    version: string
  ) {
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
    const vesreContext = (verse: string) => {
      const result: { [key: string]: string } = {}

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

    /**
     * Returns `bible` object of main reference and each reference parts
     */
    const getBible = (args: string[]): BibleData => {
      const res = {} as BibleData

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

      const splitedVerse: string[] = res.verse
        .split('-')
        .map((item) => item.trim())
      return {
        ...res,
        verse: splitedVerse[0],
        verseEnd: splitedVerse[1]
      }
    }

    /**
     * @desc This breaks the entire string and matches the main reference and every verse, ranges and parts separately.
     * Each match is wrapped with an anchor element. The match regex is `this.#regex.verse`
     * Invalid chapter/verse is returned as is.
     * Example: Jn 3:16,17 to <a>Jn 3:16</a>,<a>17</a>
     */
    const str = match.replace(this.#regex.verse, (match, ...args: string[]) => {
      const bibleData = getBible(args)
      const buData = this.#validateBible(bibleData)
      return buData === false
        ? match
        : `<a href='#' class='bu-link-${this.#buid}' bu-data='${buData}'>${match}</a>`
    })

    if (str === match) {
      return match
    } else {
      return `<cite class='bu-link bu-ignore' bu-ref='${match}'>${str}</cite>`
    }
  }

  /**
   * Returns stringified object Type BibleRef, if reference is valid else returns false
   * @param bible - bible is an object {book, chapter, verse, version}
   * The object is in the form - {ref,book,chapter,verse,apiBook}
   */
  #validateBible(bible: BibleData): string | false {
    const bibleRef = Bible.extractPassage(bible)
    if (!bibleRef) {
      return false
    }

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
          if (
            bibleRef.verseEnd === undefined ||
            bibleRef.verseEnd <= data.chapters[bibleRef.chapter - 1]
          ) {
            return JSON.stringify(bibleRef)
          }
        }
      }
    }

    //console.log('falsee')
    return false
  }

  /**
   * Handles Event listener logic on popup
   */
  #manageEvents() {
    const bulink: NodeListOf<HTMLElement> = document.querySelectorAll(
      `.bu-link-${this.#buid}`
    )
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

    this.#popup.container.onmouseleave = (e: MouseEvent) => {
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
   * Executes event Handler for mouseEnter and click events
   */
  async #clickHandler(e: MouseEvent) {
    this.#clearTimer()
    const currentTarget = e.currentTarget as HTMLElement

    const getPosition = (el: HTMLElement): number => {
      const top = el.getBoundingClientRect().top
      const left = el.getBoundingClientRect().left
      return top + left
    }

    // only update popup if popup is already hidden or different link is clicked than the one active
    if (
      this.#ispopupOpen === false ||
      this.#activeLink !== getPosition(currentTarget)
    ) {
      this.#activeLink = getPosition(currentTarget)
      const linkData = currentTarget.getAttribute('bu-data') as string
      const bibleRef: BibleRef = JSON.parse(linkData) as BibleRef

      // add delay before popup 'loading' - to allow fetch return cache if it exists
      this.#loadingTimer = setTimeout(() => {
        this.#updatePopup(bibleRef, true)
        positionPopup(e, this.#options.popup, this.#popup.container)
        this.#openPopup()
      }, 100)

      // call to fetch bible text
      this.#currentRef = bibleRef.ref
      const res = await Search.getScripture(
        bibleRef,
        bibleRef.version ?? this.#options.version
      )

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
   * Updates popup texts and content
   * @param res Can either be Type BibleRef or BibleFetch depending on isLoading
   * @param isLoading a boolean that makes popup show 'loading' before the bible text is updated. if false, res is Type BibleRef, else, res is Type BibleFetch
   */
  #updatePopup(...args: [BibleRef, true] | [BibleFetch, false]) {
    const [res, isLoading] = args
    if (isLoading) {
      if (this.#popup.ref) {
        this.#popup.ref.textContent = res.ref
      }

      if (this.#popup.version) {
        this.#popup.version.textContent =
          res.version ?? this.#options.version.toUpperCase()
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

      this.#popup.text.setAttribute('start', res.refData.startVerse.toString())

      if (res.text == null) {
        this.#popup.text.textContent =
          'Cannot load bible reference at the moment.'
      } else {
        this.#popup.text.innerHTML = ''
        res.text.forEach((verse: string) => {
          this.#popup.text.innerHTML += `<li>${verse}</li>`
        })
      }
    }
  }

  #openPopup() {
    if (!this.#ispopupOpen) {
      this.#popup.container.classList.remove('bu-popup-hide')
      this.#popup.close?.focus()
      this.#ispopupOpen = true
    }
  }

  /**
   * This attaches a timeout before closing popup
   */
  #closePopup(e: MouseEvent) {
    if (!this.#popupTimer) {
      this.#popupTimer = setTimeout(() => {
        if (!this.#mouseOnPopup) {
          const mouseFrom = e.relatedTarget as Element
          if (
            !mouseFrom ||
            mouseFrom?.classList.contains(`bu-link-${this.#buid}`) === false
          ) {
            this.#exitPopup()
          }
        }
        this.#clearTimer()
      }, 100)
    }
  }

  /**
   * This closes a popup without a timer
   */
  #exitPopup() {
    this.#popup.container.classList.add('bu-popup-hide')
    this.#mouseOnPopup = false
    this.#ispopupOpen = false
  }

  #clearTimer() {
    clearTimeout(this.#loadingTimer)
    clearTimeout(this.#popupTimer)
    this.#loadingTimer = undefined
    this.#popupTimer = undefined
  }

  #error(msg: string) {
    throw new Error(msg)
  }
}

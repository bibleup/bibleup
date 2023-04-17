import bibleData from './helper/bible-data';
import * as Bible from './helper/bible';
import * as ConstructPopup from './construct-popup';
import { positionPopup } from './position-popup';
import * as Search from './helper/search';
import { BibleData, BibleFetch, BibleRef, Options, Popup, Regex, Styles } from './helper/interfaces';

export default class BibleUp {
  // PRIVATE_FIELD
  #element: HTMLElement;
  #options: Options;
  #defaultOptions: Options;
  #regex;
  #mouseOnPopup; // if mouse is on popup
  #popupTimer: NodeJS.Timeout | undefined;
  #loadingTimer: NodeJS.Timeout | undefined;
  #currentRef: string | undefined; // currently loading bible ref
  #activeLink: number | undefined; // unique identifier of last clicked link
  #popup!: Popup;

  #ispopupOpen: boolean;
  #events;
  #initKey: string; // unique bibleup instance key

  constructor(element: HTMLElement, options: Partial<Options>) {
    this.#element = element;
    this.#defaultOptions = {
      version: 'KJV',
      popup: 'classic',
      darkTheme: false,
      bu_ignore: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'A'],
      bu_allow: [],
      buid: '',
      ignoreCase: false,
      styles: {},
    };

    if (typeof options === 'object' && options !== null) {
      this.#options = this.#DEPRECATE_bu_id({ ...this.#defaultOptions, ...options });
    } else {
      this.#options = this.#defaultOptions;
    }

    this.#initKey = Math.floor(100000 + Math.random() * 999999).toString();
    this.#init(this.#options);
    this.#regex = this.#generateRegex();
    this.#mouseOnPopup = false;
    this.#ispopupOpen = false;

    this.#events = {
      clickHandler: this.#clickHandler.bind(this),
      closePopup: this.#closePopup.bind(this),
      exitPopup: this.#exitPopup.bind(this),
    };
  }

  /**
   * {type} getter
   * {return} all options for present class instance
   */
  get getOptions() {
    return this.#options;
  }

  get #buid(): string {
    return this.#options.buid || this.#initKey;
  }

  /**
   * The method removes the `bu_id` property and replaces it with `buid` to match documentation.
   * DEPRECATES `bu_id` and Enforces `buid`
   * @param {*} options - BibleUp Options
   * @returns 0bject
   */
  #DEPRECATE_bu_id(options: Options): Options {
    if (Object.prototype.hasOwnProperty.call(options, 'bu_id') && options.bu_id) {
      options.buid = options.bu_id;
      delete options.bu_id;
    }
    return options;
  }

  /**
   * {desc} class entry point.
   * create instances for entire app func
   *
   */
  create() {
    this.#searchNode(this.#element, this.#regex.main);
    this.#manageEvents();
  }

  /**
   * This method destoys BibleUp creation and removes the links and popup from the page
   * @param force - Specify whether to totally delete bibleup, and refresh() won't work anymore. This will also remove popup
   * container; or to keep popup container and bibleup tagging can be resumed with refresh() method - when set to false
   */
  destroy(force = true) {
    const links = document.querySelectorAll(`.bu-link-${this.#buid}`);
    for (const link of links) {
      const cite = link.closest('cite');
      if (cite) {
        const ref = cite.getAttribute('bu-ref');
        if (ref) cite.replaceWith(ref);
      }
    }

    if (force === true && this.#popup.container) {
      this.#popup.container.remove();
      this.#initKey = '';
    }
  }

  /**
   * If force is true, it merges defaultOptions and newOptions to form a new BibleUp.options Object,
   * else it updates BibleUp.options with any changes in newOptions.
   * @param {*} force
   * @param {*} defaultOptions
   * @param {*} new0ptions
   * @returns new BibleUp.#options
   */
  #mergeOptions(force: boolean, defaultOptions: Options, new0ptions: Partial<Options>) {
    if (force === true) {
      return this.#DEPRECATE_bu_id({ ...defaultOptions, ...new0ptions });
    } else {
      const merge: Options = { ...this.#options, ...new0ptions };
      for (const [key, value] of Object.entries(new0ptions)) {
        const k = key as keyof Options;
        if (Array.isArray(value)) {
          (merge[k] as string[]) = [...(this.#options[k] as string[]), ...value];
        } else if (value && typeof value === 'object') {
          (merge[k] as Partial<Styles>) = { ...(this.#options[k] as Partial<Styles>), ...value };
        } else {
          (merge[k] as string | boolean) = value;
        }
      }

      return this.#DEPRECATE_bu_id(merge);
    }
  }

  /**
   * @param options New BibleUp Options
   * @param element The new element to search, if specified; else, the element specified during BibleUp
   * instantiation will be searched again
   * @param force If false, previous BibleUp options will be merged with new options passed.
   * If force is set to true, the options passed into this method will totally overwrite previous options
   */
  refresh(options: Partial<Options> = {}, force = false, element = this.#element) {
    if (!this.#initKey) {
      this.#error('cannot call refresh on an uncreated or destroyed BibleUp instance');
    }

    const old = this.#options;
    const trigger = { version: false, popup: false, style: false };
    this.#options = this.#mergeOptions(force, this.#defaultOptions, options);

    // trigger version
    if (old.version !== this.#options.version) {
      trigger.version = true;
    }

    // trigger build popup
    if (
      old.popup !== this.#options.popup ||
      old.darkTheme !== this.#options.darkTheme ||
      old.buid !== this.#options.buid
    ) {
      this.#popup.container?.remove();
      trigger.popup = true;
      trigger.style = true;
    }

    // change link class if buid changes
    if (old.buid !== this.#options.buid) {
      const oldKey = old.buid || this.#initKey;
      const bulink = document.querySelectorAll(`.bu-link-${oldKey}`);
      bulink.forEach((link) => {
        link.classList.replace(`bu-link-${oldKey}`, `bu-link-${this.#options.buid}`);
      });
    }

    // trigger styles
    if (JSON.stringify(old.styles) !== JSON.stringify(this.#options.styles)) {
      trigger.style = true;
    }

    // change this.#regex if ignoreCase changes
    if (JSON.stringify(old.ignoreCase) !== JSON.stringify(this.#options.ignoreCase)) {
      this.#regex = this.#generateRegex();
    }

    this.#searchNode(element, this.#regex.main);
    // call init() for changes
    if (force) {
      this.#popup.container?.remove();
      this.#init(this.#options);
    } else if (trigger.version || trigger.popup || trigger.style) {
      this.#init(this.#options, trigger);
    }
    this.#manageEvents();
  }

  /**
   * @param {Object} options BibleUp Options
   * @param {*} trigger Optional - define what to trigger init on
   */
  #init(options: Options, trigger: Partial<{ version: boolean; popup: boolean; style: boolean }> = {}) {
    const initTrigger = { version: true, popup: true, style: true };
    trigger = { ...initTrigger, ...trigger };

    if (trigger.version && options.version) {
      const versions = ['KJV', 'ASV', 'LSV', 'WEB'];
      if (versions.includes(options.version.toUpperCase()) === false) {
        this.#error('The version in BibleUp options is currently not supported. Try with other supported versions');
      }
    }

    if (trigger.popup && options.popup) {
      const popup = ['classic', 'inline', 'wiki'];
      if (popup.includes(options.popup)) {
        ConstructPopup.build(options, this.#buid);
        this.#popup = {
          container: document.getElementById(`bu-popup-${this.#buid}`) as HTMLElement,
          header: document.querySelector(`#bu-popup-${this.#buid} .bu-popup-header`),
          ref: document.querySelector(`#bu-popup-${this.#buid} .bu-popup-ref`),
          version: document.querySelector(`#bu-popup-${this.#buid} .bu-popup-version`),
          content: document.querySelector(`#bu-popup-${this.#buid} .bu-popup-content`),
          text: document.querySelector(`#bu-popup-${this.#buid} .bu-popup-text`) as HTMLElement,
          close: document.querySelector(`#bu-popup-${this.#buid} .bu-popup-close`) || null,
        };
      } else {
        this.#error("BibleUp was unable to construct popup. Check to see if 'popup' option is correct");
      }
    }

    if (trigger.style) {
      if (this.#options.styles && Object.keys(this.#options.styles).length !== 0) {
        this.#setStyles(this.#options.styles);
      }
    }
  }

  #setStyles(styles: Partial<Styles>) {
    const { container, header, version, close } = this.#popup;
    const props: ['borderRadius', 'boxShadow', 'fontSize'] = ['borderRadius', 'boxShadow', 'fontSize'];

    for (const prop of props) {
      const value = styles[prop];
      if (value) {
        container.style[prop] = value;
      }
    }

    if (styles.primary) {
      container.style.background = styles.primary;
    }

    if (styles.fontColor) {
      container.style.color = styles.fontColor;
    }

    if (header) {
      if (styles.secondary) {
        header.style.background = styles.secondary;
      }

      if (styles.headerColor) {
        header.style.color = styles.headerColor;
      }
    }

    if (version) {
      if (styles.tertiary) {
        version.style.background = styles.tertiary;
      }

      if (styles.versionColor) {
        version.style.color = styles.versionColor;
      }
    }

    if (close && styles.closeColor) {
      close.style.color = styles.closeColor;
    }
  }

  /**

   * method: BibleUp Scripture Regex
   * @param {Object} bibleData containing bible books data
   * This regex is a combination of two regular expressions: standard Bible reference and reference parts
   * Regex matches: john 3:16-17, 1 Tim 5:2,5&10
   */
  #generateRegex(): Regex {
    let allBooks = '';
    const versions = 'KJV|ASV|LSV|WEB';
    const allMultipart = [];

    for (const book of bibleData) {
      if (book.id === 66) {
        allBooks += book.book + '|' + book.abbr.join('|');
      } else {
        allBooks += book.book + '|' + book.abbr.join('|') + '|';
      }

      if (book.multipart) {
        allMultipart.push(book.book, ...book.abbr);
      }
    }

    const main = `(?:(?:(${allBooks})(?:\\.?)\\s?(\\d{1,3})(?:\\:\\s?(\\d{1,3}(?:\\s?\\-\\s?\\d{1,3})?))?)(?:[a-zA-Z])?(?:\\s(${versions}))?)(?:\\s?(?:\\,|\\;|\\&)\\s?(?!\\s?(?:${allMultipart.join(
      '|'
    )})(?:\\.?)\\b)\\s?(?:\\d{1,3}\\s?\\-\\s?\\d{1,3}|\\d{1,3}\\:\\d{1,3}(?:\\-\\d{1,3})?|\\d{1,3})(?:[a-zA-Z](?![a-zA-Z]))?(?:\\s(${versions}))?)*`;
    const verse = `(?:(?:(${allBooks})(?:\\.?)\\s?(\\d{1,3})(?:\\:\\s?(\\d{1,3}(?:\\s?\\-\\s?\\d{1,3})?))?)(?:[a-zA-Z])?(?:\\s(${versions}))?)|(\\d{1,3}\\s?\\-\\s?\\d{1,3}|\\d{1,3}\\:\\d{1,3}(?:\\-\\d{1,3})?|\\d{1,3})(?:[a-zA-Z](?![a-zA-Z]))?(?:\\s(${versions}))?`;

    if (this.#options.ignoreCase === true) {
      return {
        main: new RegExp(main, 'gi'),
        verse: new RegExp(verse, 'gi'),
      };
    }

    return {
      main: new RegExp(main, 'g'),
      verse: new RegExp(verse, 'g'),
    };
  }

  /**
   * This function traverse all nodes and child nodes in the `e` parameter and calls #createLink on all text nodes that matches the Bible regex
   * The function performs a self call on element child nodes until all matches are found
   */
  #searchNode(e: Node, regex: RegExp) {
    if (!e) {
      this.#error('Element does not exist in the DOM');
    }
    let type = e.nodeType;
    const match = e.textContent?.match(regex) || false;
    let next: ChildNode | null;

    if (type === 3 && match) {
      this.#createLink(e);
    } else if (type === 1 && match) {
      // element node
      let reE = e.firstChild; // (e = e.firstChild) // ok baba, ok mama -> type 3
      if (reE) {
        do {
          next = reE.nextSibling; // (e = next) breks if next is null; else e is assigned
          type = reE.nodeType;

          if (type === 1) {
            if (this.#validateNode(reE as HTMLElement)) {
              this.#searchNode(reE, regex);
            }
          } else {
            this.#searchNode(reE, regex);
          }

          reE = next;
        } while (reE);
      }
    }
  }

  /**
   * {desc} This function validates elements node before running #searchNode() on subsequent child elements
   * Returns true after successful validation else returns false
   */
  #validateNode(e: HTMLElement): boolean {
    const forbiddenTags = this.#options.bu_ignore;
    const allowedTags = this.#options.bu_allow;
    const privateIgnore = [...forbiddenTags, 'SCRIPT', 'STYLE', 'SVG', 'IMG', 'INPUT', 'TEXTAREA', 'SELECT'];
    if (privateIgnore.includes(e.tagName) && !allowedTags.includes(e.tagName)) {
      return false;
    } else if (e.classList.contains('bu-ignore') === false) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * {desc} This function returns: appends <cite> on text nodes with a scripture match
   * It replaces 'This text is john 3.16' with 'This text is <cite attr>John 3:16</cite>'
   * param(node) is a text node
   */
  #createLink(node: Node) {
    const newNode = document.createElement('div');
    if (node.nodeValue) {
      newNode.innerHTML = node.nodeValue.replace(this.#regex.main, this.#setLinkMarkup.bind(this));
    }

    if (node.nodeValue !== newNode.innerHTML) {
      const parent = node.parentNode;
      while (newNode.firstChild) {
        // console.log(newNode.firstChild.textContent);
        if (parent) {
          parent.insertBefore(newNode.firstChild, node);
        }
      }
      if (parent) {
        parent.removeChild(node);
      }
    }
  }

  /**
   * @param match This is the full match string
   * @param {...args} This is the main reference capture groups (p1-pN) - Check replace() on MDN
   * @returns A complete BibleUp Link
   */
  #setLinkMarkup(match: string, book: string, chapter: string, verse: string, version: string) {
    const bible = {
      book,
      chapter,
      verse: verse || '1',
      version,
    };

    // reference with only chapter and no verse (Romans 8)
    const isChapterLevel = verse === undefined;

    /**
     * Resolves actual chapter and verse number for reference parts
     * References with multiple chapters will overwrite the chapter that will be used for subsequent verses
     * @param verse verse number of main reference
     */
    const vesreContext = (verse: string) => {
      const result: { [key: string]: string } = {};

      if ((verse.includes(':') && verse.includes('-')) || verse.includes(':')) {
        // (in-line chapter with range) or (in-line chapter only)
        result.chapter = verse.slice(0, verse.lastIndexOf(':'));
        result.verse = verse.slice(verse.lastIndexOf(':') + 1);
        bible.chapter = result.chapter;
      } else if (isChapterLevel) {
        result.chapter = verse;
        result.verse = '1';
      } else {
        result.verse = verse;
      }
      return result;
    };

    // Get `bible` object of main reference and each reference parts
    const getBible = (args: string[]): BibleData => {
      const res = {} as BibleData;

      if (args[0] !== undefined) {
        // main reference
        res.book = bible.book;
        res.chapter = bible.chapter;
        res.verse = bible.verse;
        res.version = bible.version || false;
      } else {
        // reference parts
        const { chapter, verse } = vesreContext(args[4]);
        res.book = bible.book;
        res.chapter = chapter || bible.chapter;
        res.verse = verse || bible.verse;
        res.version = args[5] || false;
      }
      return res;
    };

    /**
     * @desc This breaks the entire string and matches the main reference and every verse, ranges and parts separately.
     * Each match is wrapped with an anchor element. The match regex is `this.#regex.verse`
     * Invalid chapter/verse is returned as is.
     * Example: Jn 3:16,17 to <a>Jn 3:16</a>,<a>17</a>
     */
    const str = match.replace(this.#regex.verse, (match, ...args: string[]) => {
      const bibleData = getBible(args);
      const buData = this.#validateBible(bibleData);
      if (buData === false) {
        // invalid chapter/verse
        return match;
      } else {
        return `<a href='#' class='bu-link-${this.#buid}' bu-data='${buData}'>${match}</a>`;
      }
    });

    if (str === match) {
      return match;
    } else {
      return `<cite class='bu-link' bu-ref='${match}'>${str}</cite>`;
    }
  }

  /*
   * @param bible - bible is an object {book, chapter, verse, version}
   * Returns stringified object containing valid, complete reference (bu-data) if reference is valid else returns false
   * The object is in the form - {ref,book,chapter,verse,apiBook}
   */
  #validateBible(bible: BibleData): string | false {
    const bibleStr = `${bible.book} ${bible.chapter}:${bible.verse.replaceAll(' ', '')}`;
    const bibleRef = Bible.extractPassage(bibleStr);
    if (!bibleRef) {
      return false;
    }

    if (bible.version) {
      // add version tagging if present
      bibleRef.version = bible.version;
    }

    for (const data of bibleData) {
      if (data.book === bibleRef.book) {
        if (
          bibleRef.chapter <= data.chapters.length &&
          data.chapters[bibleRef.chapter - 1] !== undefined &&
          bibleRef.verse <= data.chapters[bibleRef.chapter - 1]
        ) {
          if (bibleRef.verseEnd === undefined) {
            return JSON.stringify(bibleRef);
          } else if (bibleRef.verseEnd <= data.chapters[bibleRef.chapter - 1]) {
            return JSON.stringify(bibleRef);
          } else {
            return false;
          }
        } else {
          return false;
        }
      }
    }

    return 'safeguard';
  }

  #manageEvents() {
    const bulink: NodeListOf<HTMLElement> = document.querySelectorAll(`.bu-link-${this.#buid}`);
    // link 'anchor' events
    bulink.forEach((link) => {
      link.removeEventListener('mouseenter', this.#events.clickHandler);
      link.removeEventListener('mouseleave', this.#events.closePopup);

      // prevent scroll behaviour
      link.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
      };

      link.addEventListener('mouseenter', this.#events.clickHandler);
      link.addEventListener('mouseleave', this.#events.closePopup);
    });

    this.#popup.container.onmouseenter = () => {
      this.#mouseOnPopup = true;
    };

    this.#popup.container.onmouseleave = (e: MouseEvent) => {
      this.#mouseOnPopup = false;
      this.#closePopup(e);
    };

    // close popup events
    if (this.#popup.close) {
      this.#popup.close.removeEventListener('click', this.#events.exitPopup);
      this.#popup.close.addEventListener('click', this.#events.exitPopup);
    }

    window.onkeydown = (e) => {
      if (e.key === 'Escape') {
        if (this.#ispopupOpen) {
          this.#exitPopup();
        }
      }
    };
  }

  /**
   * {type} Event Handler for mouseEnter and click events
   * calls series of methods and updates popup
   */

  async #clickHandler(e: MouseEvent) {
    this.#clearTimer();
    const currentTarget = e.currentTarget as HTMLElement;

    const getPosition = (el: HTMLElement): number => {
      const top = el.getBoundingClientRect().top;
      const left = el.getBoundingClientRect().left;
      return top + left;
    };

    // only update popup if popup is already hidden or different link is clicked than the one active
    if (this.#ispopupOpen === false || this.#activeLink !== getPosition(currentTarget)) {
      this.#activeLink = getPosition(currentTarget);
      const linkData = currentTarget.getAttribute('bu-data') as string;
      const bibleRef: BibleRef = JSON.parse(linkData) as BibleRef;

      // add delay before popup 'loading' - to allow fetch return cache if it exists
      this.#loadingTimer = setTimeout(() => {
        this.#updatePopup(bibleRef, true);
        positionPopup(e, this.#options.popup, this.#popup.container);
        this.#openPopup();
      }, 100);

      // call to fetch bible text
      this.#currentRef = bibleRef.ref;
      const res = await Search.getScripture(bibleRef, bibleRef.version ?? this.#options.version);

      if (this.#currentRef === res.ref) {
        // only when cursor is still on same link
        this.#updatePopup(res, false);
        positionPopup(e, this.#options.popup, this.#popup.container);
        if (this.#loadingTimer) {
          this.#openPopup();
          clearTimeout(this.#loadingTimer);
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
  #updatePopup (...args: [BibleRef, true] | [BibleFetch, false]) {
    const [res, isLoading] = args;
    if (isLoading) {
      if (this.#popup.ref) {
        this.#popup.ref.textContent = res.ref;
      }

      if (this.#popup.version) {
        this.#popup.version.textContent = res.version ?? this.#options.version.toUpperCase();
      }

      this.#popup.text.textContent = 'Loading...';
    } else {
      if (this.#popup.ref) {
        this.#popup.ref.textContent = res.ref;
        // REF Accessibility
        this.#popup.container.setAttribute('aria-label', `${res.ref}`);
      }

      if (this.#popup.version) {
        this.#popup.version.textContent = res.version;
      }

      this.#popup.text.setAttribute('start', res.refData.startVerse.toString());

      if (res.text == null) {
        this.#popup.text.textContent = 'Cannot load bible reference at the moment.';
      } else {
        this.#popup.text.innerHTML = '';
        res.text.forEach((verse: string) => {
          this.#popup.text.innerHTML += `<li>${verse}</li>`;
        });
      }
    }
  }

  #openPopup() {
    if (!this.#ispopupOpen) {
      this.#popup.container.classList.remove('bu-popup-hide');
      if (this.#popup.close) {
        this.#popup.close.focus();
      }
      this.#ispopupOpen = true;
    }
  }

  /**
   * closePopup() is for mouse events which needs timeout
   */
  #closePopup(e: MouseEvent) {
    if (!this.#popupTimer) {
      this.#popupTimer = setTimeout(() => {
        if (!this.#mouseOnPopup) {
          const mouseFrom = e.relatedTarget as Element;
          if (!mouseFrom || mouseFrom?.classList.contains(`bu-link-${this.#buid}`) === false) {
            this.#exitPopup();
          }
        }
        this.#clearTimer();
      }, 100);
    }
  }

  #exitPopup() {
    this.#popup.container.classList.add('bu-popup-hide');
    this.#mouseOnPopup = false;
    this.#ispopupOpen = false;
  }

  #clearTimer() {
    clearTimeout(this.#loadingTimer);
    clearTimeout(this.#popupTimer);
    this.#loadingTimer = undefined;
    this.#popupTimer = undefined;
  }

  #error(msg: string) {
    throw new Error(msg);
  }
}

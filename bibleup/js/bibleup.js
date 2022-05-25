import bibleData from "./helper/bible-data.js";
import Bible from "./helper/bible.js";
import ConstructPopup from "./construct-popup.js";
import positionPopup from "./position-popup.js";
import Search from "./helper/search.js";

export default class BibleUp {
  // PRIVATE_FIELD
  #element;
  #options;
  #defaultOptions;
  #regex;
  #mouseOnPopup; //if mouse is on popup
  #popupTimer;
  #currentRef; //currently loading bible ref
  #activeLink; //unique identifier of last clicked link
  #popup;
  #ispopupOpen;

  constructor(element, options) {
    this.#element = element;
    this.#defaultOptions = {
      version: "KJV",
      popup: "classic",
      darkTheme: false,
      bu_ignore: ["H1", "H2", "H3", "H4", "H5", "H6", "IMG", "A"],
      bu_allow: [],
      styles: undefined,
    };

    if (typeof options === "object" && options !== null) {
      this.#options = { ...this.#defaultOptions, ...options };
    } else {
      this.#options = this.#defaultOptions;
    }

    this.#validateOptions(this.#options);
    this.#regex = this.#generateRegex(bibleData);
    this.#mouseOnPopup = false;
    this.#ispopupOpen = false;
    this.#popup = {
      container: document.querySelector("#bu-popup"),
      ref: document.querySelector("#bu-popup-ref"),
      version: document.querySelector("#bu-popup-version"),
      content: document.querySelector("#bu-popup-content"),
      text: document.querySelector("#bu-popup-text"),
      close: document.querySelector("#bu-popup-close") || false,
    };
  }

  /**
   * {type} getter
   * {return} all options for present class instance
   */
  get getOptions() {
    return this.#options;
  }

  #validateOptions(options) {
    let versions = ["KJV", "ASV", "LSV", "WEB"];
    options.version = options.version.toUpperCase(); //opt version to uppercase
    if (versions.includes(options.version) == false) {
      this.#error(
        "The version in BibleUp options is currently not supported. Try with other supported versions"
      );
    }

    let popup = ["classic", "inline", "wiki"];
    if (popup.includes(options.popup)) {
      ConstructPopup.build(options);
    } else {
      this.#error(
        "BibleUp was unable to construct popup. Check to see if 'popup' option is correct"
      );
    }

    if (this.#options.styles) {
      this.#setStyles(this.#options.styles);
    }
  }

  #setStyles(styles) {
    const elExists = (id) => {
      if (document.getElementById(id)) {
        return true;
      }
    };

    for (let prop in styles) {
      if (prop && styles[prop]) {
        if (prop == "primary") {
          document.getElementById("bu-popup").style.background = styles[prop];
        }

        if (prop == "secondary" && elExists("bu-popup-header")) {
          document.getElementById("bu-popup-header").style.background =
            styles[prop];
        }

        if (prop == "tertiary" && elExists("bu-popup-version")) {
          document.getElementById("bu-popup-version").style.background =
            styles[prop];
        }

        if (prop == "headerColor" && elExists("bu-popup-header")) {
          document.getElementById("bu-popup-header").style.color = styles[prop];
        }

        if (prop == "color") {
          //font color
          document.getElementById("bu-popup").style.color = styles.color[0];
          //version color
          if (elExists("bu-popup-version"))
            document.getElementById("bu-popup-version").style.color =
              styles.color[1];
          //close color
          if (elExists("bu-popup-close"))
            document.getElementById("bu-popup-close").style.color =
              styles.color[2];
        }

        if (
          prop == "borderRadius" ||
          prop == "boxShadow" ||
          prop == "fontSize"
        ) {
          document.getElementById("bu-popup").style[prop] = styles[prop];
        }
      }
    }
  }

  /**
   * method: BibleUp Scripture Regex
   * param(refGroup) get all abbreviations and append each with '|' to construct a regex capturing group.
   * This regex is a combination of two regular expressions (standard Bible reference and look-behind Bible reference) using the or '|' operator
   * Contains a total of six capturing groups. 3 for the first regex and the remaining 3 for the look-behind
   * one set of the capturing group returns 'undefined' when the other regex is matched
   * Regex matches: john 3:16-17, 1 Tim 5:2,5&10
   */
  #generateRegex(bibleData) {
    let refGroup = "";
    let versions = 'KJV|ASV|LSV|WEB'

    for (const book of bibleData) {
      if (book.id == 66) {
        refGroup += book.book + "|" + book.abbr.join("|");
      } else {
        refGroup += book.book + "|" + book.abbr.join("|") + "|";
      }
    }

    let regex_literal = `(?:(?:(${refGroup})\\s?(\\d{1,3}))(?:(?=\\:)\\:\\s?(\\d{1,3}(?:\\s?\\-\\s?\\d{1,3})?)|)(?:\\s(${versions}))?)|(?<=(?:(${refGroup})\\s?(\\d{1,3}))\\:\\s?\\d{1,3}(?:\\s?\\-\\s?\\d{1,3})?(?:\\,|\\;|\\&)\\s?(?:\\d{1,3}(?:\\,|\\;|\\&)\\s?|\\s?\\d{1,3}\\s?\\-\\s?\\d{1,3}(?:\\,|\\;|\\&))*)(\\s?\\d{1,3}\\s?\\-\\s?\\d{1,3}|\\s?\\d{1,3}(?!\\d|\\:\\d))`;

    let bible_regex = new RegExp(regex_literal, 'g');
    return bible_regex;
  }

  /**
   * {desc} class entry point.
   * create instances for entire app func
   *
   */
  create() {
    this.#searchNode(this.#element, this.#regex);
    this.#manageEvents(this.#options);
  }

  /**
   * This function traverse all nodes and child nodes in the `e` parameter and calls #createLink on all text nodes that matches the Bible regex
   * The function performs a self call on element child nodes until all matches are found
   */
  #searchNode(e, regex) {
    let type = e.nodeType;
    let match = e.textContent.match(regex) || false;
    let next;

    if (type == 3 && match) {
      this.#createLink(e, regex);
    } else if (type == 1 && match) {
      //element node
      if ((e = e.firstChild)) {
        do {
          next = e.nextSibling;
          type = e.nodeType;
          if (type == 1) {
            if (this.#validateNode(e)) {
              this.#searchNode(e, regex);
            }
          } else {
            this.#searchNode(e, regex);
          }
        } while ((e = next));
      }
    }
  }

  /**
   * {desc} This function validates elements node before running #searchNode() on subsequent child elements
   * Returns true after successful validation else returns false
   */
  #validateNode(e) {
    let forbidden_tags = this.#options.bu_ignore;
    let allowed_tags = this.#options.bu_allow;
    if (forbidden_tags.includes(e.tagName) && !allowed_tags.includes(e.tagName))
      return false;
    if (e.classList.contains("bu-ignore") == false) return true;
  }

  /**
   * {desc} This function returns appends <cite> on text nodes with a scripture match
   * It replace 'This text is john 3.16' with 'This text is <cite attr>John 3:16</cite>'
   * param(node) is a text node
   */
  #createLink(node, regex) {
    let newNode = document.createElement("div");
    newNode.innerHTML = node.nodeValue.replace(
      regex,
      this.#setLinkMarkup.bind(this)
    );

    while (newNode.firstChild) {
      //console.log(newNode.firstChild.textContent);
      node.parentNode.insertBefore(newNode.firstChild, node);
    }
    node.parentNode.removeChild(node);
  }

  /**
   * param(match) is the actual matched string. Check replace() on MDN
   * param(p1) is value of first capturing group. Pn is the capturing group for 'n'. Check replace() on MDN
   * The first three capturing groups (p1 - p3) matches a standard Bible reference (Romans 3:23-25)
   * p4 matches verse-level references for only single references
   * The remaining three capturing groups matches the look-behind Bible reference (John 3:16,27,3-5 = matches 27 and 3-5)
   * returns <cite[data-*]>john 3:16</cite>
   */
  #setLinkMarkup(match, p1, p2, p3, p4, p5, p6, p7) {
    let bible = {
      book: undefined,
      chapter: undefined,
      verse: undefined,
      version: undefined
    };

    if (p1 != undefined) {
      //standard Bible regex
      bible["book"] = p1;
      bible["chapter"] = p2;
      bible["verse"] = p3 || "1";
      if (p4 != undefined) {
        bible['version'] = p4
      }
    } else {
      //look-behind Bible regex
      bible["book"] = p5;
      bible["chapter"] = p6;
      bible["verse"] = p7;
    }

    let buData = this.#validateBible(bible);
    
    if (buData == false) {
      return match;
    }

    console.log(buData)

    let result = `
		<cite>
		<a href='#' class='bu-link' bu-data='${buData}'>${match}</a>
		</cite>`;

    return result;
  }

  /*
   * @param match - match is an object with reference breakdown
   * Returns stringified object containing valid, complete reference (bu-data) if reference is valid else returns false
   * The object is in the form - {ref,book,chapter,verse,apiBook}
   */
  #validateBible(bible) {
    let bibleRef = `${bible["book"]} ${bible["chapter"]}:${bible["verse"]}`;
    bibleRef = Bible.extractPassage(bibleRef);

    for (const data of bibleData) {
      if (data.book == bibleRef.book) {
        if (
          bibleRef.chapter <= data.chapters.length &&
          data.chapters[bibleRef.chapter - 1] != undefined &&
          bibleRef.verse <= data.chapters[bibleRef.chapter - 1]
        ) {
          if (bibleRef.verseEnd == undefined) {
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
  }

  #manageEvents(options) {
    let bulink = document.querySelectorAll(".bu-link");

    // link 'anchor' events
    bulink.forEach((link) => {
      link.addEventListener("click", (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
      });

      link.addEventListener("mouseenter", this.#clickHandler.bind(this));
      link.addEventListener("mouseleave", this.#closePopup.bind(this));
    });

    // mouse events inside popup
    this.#popup.container.addEventListener("mouseenter", () => {
      this.#mouseOnPopup = true;
    });

    this.#popup.container.addEventListener("mouseleave", (e) => {
      this.#mouseOnPopup = false;
      this.#closePopup(e);
    });

    // close popup events
    if (this.#popup.close) {
      this.#popup.close.addEventListener("click", this.#exitPopup.bind(this));
    }

    window.onkeydown = (e) => {
      if (e.key == "Escape") {
        this.#exitPopup();
      }
    };
  }

  /**
   * {type} Event Handler for mouseEnter and click events
   * calls series of methods and updates popup
   */

  async #clickHandler(e) {
    this.#clearTimer();

    // only update popup if popup is already hidden or different link is clicked from the one active
    if (this.#ispopupOpen == false || this.#activeLink != e.currentTarget.getBoundingClientRect().x) {
		this.#activeLink = e.currentTarget.getBoundingClientRect().x
		let bibleRef = e.currentTarget.getAttribute("bu-data");
		bibleRef = JSON.parse(bibleRef);

		let loading;
		loading = setTimeout(() => {
			this.#updatePopup(bibleRef, true);
			positionPopup(e, this.#options.popup);
			this.#openPopup();
		}, 200)

    console.log(bibleRef)
      // call to fetch bible text
      let res = await Search.getScripture(bibleRef, this.#options.version);
      this.#currentRef = bibleRef.ref;

      if (this.#currentRef == res.ref) {
        this.#updatePopup(res, false);
        positionPopup(e, this.#options.popup);
		    clearTimeout(loading)
		    this.#openPopup();
      }
    }
  }

  /**
   * @param res either contains real reference of verse clicked or the final response of bible text look up with the text
   * @param isLoading is a boolean that makes popup show 'loading' before the bible text is updated
   * @param res contains: res.ref, res.text, res.chapter, res.verse, res.version - if it is the final response with bible text
   * (description) update popup data
   */
  #updatePopup(res, isLoading) {
    if (isLoading) {
      if (this.#popup.ref) {
        this.#popup.ref.textContent = res.ref;
      }

      if (this.#popup.version) {
        this.#popup.version.textContent = this.#options.version;
      }

      this.#popup.text.textContent = "Loading...";
    } else {
      if (this.#popup.ref) {
        this.#popup.ref.textContent = res.ref;
        //REF Accessibility
        this.#popup.container.setAttribute("aria-label", "bu-popup-ref");
      }

      if (this.#popup.version) {
        this.#popup.version.textContent = res.version;
      }

      this.#popup.text.setAttribute("start", res.refData.startVerse);

      if (res.text == null) {
        this.#popup.text.textContent =
          "Cannot load bible reference at the moment.";
      } else {
        let text = res.text;
        this.#popup.text.innerHTML = "";
        text.forEach((verse) => {
          this.#popup.text.innerHTML += `<li>${verse} </li>`;
        });
      }
    }
  }

  #openPopup() {
    if (this.#popup.container.classList.contains("bu-popup-hide")) {
      this.#popup.container.classList.remove("bu-popup-hide");
      if (this.#popup.close) {
        this.#popup.close.focus();
      }
      this.#ispopupOpen = true;
    }
  }

  /**
   * closePopup() is for mouse events which needs timeout
   */
  #closePopup(e) {
    if (!this.#popupTimer) {
      this.#popupTimer = setTimeout(() => {
        if (!this.#mouseOnPopup) {
          let mouseFrom = e.relatedTarget;
          if (mouseFrom.classList.contains("bu-link") == false) {
            this.#exitPopup();
          }
        }
        this.#popupTimer = undefined;
      }, 150);
    }
  }

  #exitPopup() {
    this.#popup.container.classList.add("bu-popup-hide");
    this.#mouseOnPopup = false;
    this.#ispopupOpen = false;
  }

  #clearTimer() {
    if (this.#popupTimer) clearTimeout(this.#popupTimer);
    this.#popupTimer = undefined;
  }

  #error(msg) {
    throw new Error(msg);
  }
}

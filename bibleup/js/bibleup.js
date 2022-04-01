import bibleData from './helper/bible-data.js'
import Bible from "./helper/bible.js";
import ConstructPopup from './construct_popup.js'
import positionPopup from './position_popup.js'
import Search from './helper/search.js';
console.log("BibleUP 📖💡");



export default class BibleUp {
	constructor(element, options) {
		this.element = element;
		this.defaultOptions = {
			version: 'KJV',
			linkStyle: 'classic',
			popup: 'classic',
			darkTheme: false,
			bu_ignore: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'IMG', 'A'],
			bu_allow: []
		}

		if (typeof options === 'object' && options !== null) {
			this.options = { ...this.defaultOptions, ...options };
		} else {
			this.options = this.defaultOptions;
		}

		this.#validateOptions(this.options)
		this.regex = this.#scriptureRegex(bibleData);
		this.mouseOnPopup = false; //if mouse is on popup
		this.popupTimer;
		this.loadingRef;
	}


	/**
		* {type} getter
		* {return} all options for present class instance
		*/
	get getOptions() {
		return this.options;
	}


	#validateOptions(options) {
		let versions = ['KJV', 'ASV', 'LSV', 'WEB']
		options.version = options.version.toUpperCase() //opt version to uppercase
		if (versions.includes(options.version) == false) {
			this.#error("The version in BibleUp options is currently not supported. Try with other supported versions");
		}

		let popup = ['classic', 'inline', 'wiki']
		if (popup.includes(options.popup)) {
			ConstructPopup.build(options);
		} else {
			this.#error("BibleUp was unable to construct popup. Check to see if 'popup' option is correct");
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
	#scriptureRegex(bibleData) {
		let refGroup = '';

		for (const book of bibleData) {
			if (book.id == 66) {
				refGroup += book.book + '|' + book.abbr.join('|')
			} else {
				refGroup += book.book + '|' + book.abbr.join('|') + '|'
			}
		}

		let regex_literal = `(?:(?:(${refGroup})\\.?\\s?(\\d{1,3}))(?:(?=\\:)\\:\\s?(\\d{1,3}(?:\\s?\\-\\s?\\d{1,3})?)|))|(?<=(?:(${refGroup})\\.?\\s?(\\d{1,3}))\\:\\s?\\d{1,3}(?:\\s?\\-\\s?\\d{1,3})?(?:\\,|\\&)\\s?(?:\\d{1,3}(?:\\,|\\&)\\s?|\\d{1,3}\\s?\\-\\s?\\d{1,3}(?:\\,|\\&))*)(\\d{1,3}(?!\\s?\\-\\s?)|\\d{1,3}\\s?\\-\\s?\\d{1,3})`;

		let bible_regex = new RegExp(regex_literal, 'g');
		return bible_regex;
	}


	/**
	 * {desc} class entry point.
	 * create instances for entire app func
	 * 
	 */
	create() {
		this.#transverseTextNodes(this.element, this.regex);
		this.#setStage(this.options);
	}


	/*
	This function is currently not in use. Intended use is to check whether bibleup element contains scripture references or not. Then output an error if negative but if positive proceeds to #transverseTextNodes()
	
	This function is already being handled by #transverseTextNodes() without displaying error
	*/
	searchScripInstances(e, regex) {
		let eContent = e.textContent;
		let matches = eContent.match(regex) || false;

		if (matches !== false) {
			let matchesLength = matches.length;
			this.#transverseTextNodes(e, regex);
			//console.log(matches);
		} else {
			this.#error("No scripture reference found in selector's text");
		}
	}


	#transverseTextNodes(e, regex) {
		let type = e.nodeType;
		let match = e.textContent.match(regex) || false;
		let next;

		if (type == 3 && match != false) {
			this.#setScriptureLink(e, regex);
		} else if (type == 1) {
			//element node
			if (e = e.firstChild) {
				do {
					next = e.nextSibling;
					type = e.nodeType;
					if (type == 1) {
						if (e.classList.contains('bu-link')) {
							this.#modifyLink(e);
						} else if (this.#validateEl(e)) {
							this.#transverseTextNodes(e, regex);
						}
					} else {
						this.#transverseTextNodes(e, regex);
					}
				} while (e = next);
			}
		}
	}


	/**
	 * description: This function validates elements node before running #transverseTextNodes() on subsequent child elements
	 * Returns true after successful validation else returns false 
	 */
	#validateEl(e) {
		let forbidden_tags = this.options.bu_ignore;
		let allowed_tags = this.options.bu_allow;
		if (forbidden_tags.includes(e.tagName) && !allowed_tags.includes(e.tagName)) return false
		if (e.classList.contains('bu-ignore') == false)
			return true;
	}


	/**
	 * description: If element node is contains 'bu-link' class, then this function helps modify/change it styles rather than running #transverseTextNodes() a second time
	 * returns same element data but with a new modified style
	 */
	#modifyLink(e) {
		e.className = `bu-link ${this.options.linkStyle}`
	}



	/**
	 * description: This function returns appends <cite> on text nodes with a scripture match
	 * It replace 'This text is john 3.16' with 'This text is <cite attr>John 3:16</cite>'
	 * param(node) is a text node
	 */
	#setScriptureLink(node, regex) {
		let newNode = document.createElement('div');
		newNode.innerHTML = node.nodeValue.replace(regex, this.#setLinkStyle.bind(this));
		//console.log(node.nodeValue)

		while (newNode.firstChild) {
			//console.log(newNode.firstChild.textContent);
			node.parentNode.insertBefore(newNode.firstChild, node);
		}
		node.parentNode.removeChild(node);
	}



	/**
		* param(style): linkStyle from options
		* param(match) is the actual matched string. Check replace() on MDN
		* param(p1) is value of first capturing group. Pn is the capturing group for 'n'. Check replace() on MDN
		* The first three capturing groups (p1 - p3) matches a standard Bible reference (Romans 3:23-25)
		* The remaining three capturing groups matches the look-behind Bible reference (John 3:16,27,3-5 = matches 27 and 3-5)
		* returns <cite[data-*]>john 3:16</cite>
		*/
	#setLinkStyle(match, p1, p2, p3, p4, p5, p6) {
		let linkStyle = this.options.linkStyle;
		let full_match = {
			'book': undefined,
			'chapter': undefined,
			'verse': undefined
		};

		if (p1 != undefined) {
			//standard Bible regex
			full_match['book'] = p1;
			full_match['chapter'] = p2;
			full_match['verse'] = p3 || '1';
		} else {
			//look-behind Bible regex
			full_match['book'] = p4;
			full_match['chapter'] = p5;
			full_match['verse'] = p6;
		}

		let validRef = this.#filterBooks(full_match)
		if (validRef == false) {
			return match
		}

		let result = `
		<cite>
		<a href='#' id='bu-link-all' class='bu-link ${linkStyle}' bu-data='${validRef}'>${match}</a>
		</cite>`;

		return result;
	}

	/* 
	* @param match - match is an object with reference breakdown
	* Returns the valid complete reference if it is valid else returns false
	*/
	#filterBooks(match) {
		let bibleRef = `${match['book']} ${match['chapter']}:${match['verse']}`;
		let bible = Bible.extractPassage(bibleRef) //valid

		for (const data of bibleData) {
			if (data.book == bible.book) {
				if (bible.chapter <= data.chapters.length && 
					data.chapters[bible.chapter - 1] != undefined &&
					bible.verse <= data.chapters[bible.chapter - 1]) {
						if (bible.verseEnd == undefined) {
							return JSON.stringify(bible)
						} else if (bible.verseEnd <= data.chapters[bible.chapter - 1]) {
							return JSON.stringify(bible)
						} else {
							return false
						}
				} else {
					return false
				}
			}
		}
	}


	#setStage(options) {
		let bulink = document.querySelectorAll('.bu-link');
		let popup = document.getElementById('bu-popup');

		bulink.forEach(link => {
			link.addEventListener('click', evt => {
				evt.preventDefault();
				evt.stopPropagation();
			});
			link.addEventListener('mouseenter', this.#clickb.bind(this));
			link.addEventListener('mouseleave', this.#closePopup.bind(this))
		});

		popup.addEventListener('mouseenter', () => {
			this.mouseOnPopup = true;
		});

		popup.addEventListener('mouseleave', (e) => {
			this.mouseOnPopup = false;
			this.#closePopup(e);
		});

		let closeBtn = document.querySelector('#bu-popup .close') || false;
		if (closeBtn) {
			closeBtn.addEventListener('click', this.#exitPopup.bind(this))
		}
	}


	async #clickb(e) {
		//clear all popupTimer;
		this.#clearTimer();
		let bibleRef = e.currentTarget.getAttribute('bu-data');
		bibleRef = JSON.parse(bibleRef)

		positionPopup(e, this.options.popup);
		this.#updatePopup(bibleRef, true)
		positionPopup(e, this.options.popup);
		this.#openPopup();

		this.loadingRef = bibleRef.ref
		let res = await Search.getScripture(bibleRef, this.options.version)

		if (this.loadingRef == res.ref) {
			this.#updatePopup(res, false);
			positionPopup(e, this.options.popup);
		}
	}



	/**
	 * @param res either contains real reference of verse clicked or the final response of bible text look up with the text
	 * @param isLoading is a boolean that makes popup show 'loading' before the bible text is updated
	 * @param res contains: res.ref, res.text, res.chapter, res.verse, res.version - if it is the final response with bible text
	 * (description) update popup data
	*/
	#updatePopup(res, isLoading) {
		let popupRef = document.querySelector('#bu-popup .ref');
		let popupVersion = document.querySelector('#bu-popup .version');
		let popupContent = document.querySelector('.content')
		let popupText = popupContent.querySelector('.text');
		/* console.log(JSON.stringify(res)) */

		if (isLoading) {
			if (popupRef) {
				popupRef.textContent = res.ref;
			}

			if (popupVersion) {
				popupVersion.textContent = this.options.version
			}
			
			popupText.textContent = 'Loading...'
		} else {
			if (popupRef) {
				popupRef.textContent = res.ref;
			}

			if (popupVersion) {
				popupVersion.textContent = res.version
			}

			popupText.setAttribute('start', res.refData.startVerse);
	
			if (res.text == null) {
				popupText.textContent = 'Cannot load bible reference at the moment.';
			} else {
				let text = res.text
				popupText.innerHTML = '';
				text.forEach(verse => {
					popupText.innerHTML += `<li>${verse} </li>`
				})
			}
		}

	}


	#openPopup() {
		let popup = document.getElementById('bu-popup');
		if (popup.classList.contains('bu-popup-hide')) {
			popup.classList.remove('bu-popup-hide');
		}
	}


	#closePopup(e) {
		this.popupTimer = setTimeout(() => {
			if (!this.mouseOnPopup) {
				let mouseFrom = e.relatedTarget;
				if (mouseFrom.classList.contains('bu-link') == false) {
					let popup = document.getElementById('bu-popup');
					popup.classList.add('bu-popup-hide');
					this.mouseOnPopup = false;
				}
			}
		}, 50)
	}


	#exitPopup() {
		let popup = document.getElementById('bu-popup');
		popup.classList.add('bu-popup-hide');
		this.mouseOnPopup = false;
	}

	#clearTimer() {
		if (this.popupTimer)
			clearTimeout(this.popupTimer);
	}























	#error(msg) {
		//console.log(msg);
		//return false;
		throw new Error(msg);
	}
}

import {bible_abbr} from './key_abbreviations_english.js'
import {constructPopup} from './construct_popup.js'
import fetchData from './fetch_data.js'

console.log("BibleUP 📖💡");



export class BibleUp {
	constructor(element, options) {
		this.element = element;
		this.defaultOptions = {
			version: 'kjv', 
			linkStyle: 'classic',
			popup: 'inline',
			dark: false,
			bu_ignore: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'IMG', 'A']
		}
		
		if (typeof options === 'object' && options !== null) {
			this.options = {...this.defaultOptions, ...options};
		} else {
			this.options = this.defaultOptions;
		}
		
		this.regex = this.scriptureRegex(bible_abbr);
	}
	
	
	/**
		* {type} getter
		* {return} all options for present class instance
		*/
	get getOptions() {
		return JSON.stringify(this.options);
	}
	
	
	/**
	 * method: BibleUp Scripture Regex
	 * param(refGroup) get all abbreviations and append each with '|' to construct a regex capturing group.
	 * This regex is a combination of two regular expressions (standard Bible reference and look-behind Bible reference) using the or '|' operator
	 * Contains a total of six capturing groups. 3 for the first regex and the remaining 3 for the look-behind
	 * one set of the capturing group returns 'undefined' when the other regex is matched
	 * Regex matches: john 3:16-17, 1 Tim 5:2,5&10
	 */
	scriptureRegex(bible_abbr) {
		let refGroup = '';
	 for (let i = 0; i < bible_abbr.length; i++) {
	 	if (i == bible_abbr.length - 1) {
	 		refGroup += bible_abbr[i].a;
	 	} else {
	 		//append '|' after each abbr.
	 		refGroup += bible_abbr[i].a + '|';
	 	}
	 }
	 
	 let regex_literal = `(?:(?:(${refGroup})\\s?(\\d{1,3}))(?:(?=\\:)\\:\\s?(\\d{1,3}(?:\\s?\\-\\s?\\d{1,3})?)|))|(?<=(?:(${refGroup})\\s?(\\d{1,3}))\\:\\s?\\d{1,3}(?:\\s?\\-\\s?\\d{1,3})?(?:\\,|\\&)\\s?(?:\\d{1,3}(?:\\,|\\&)\\s?|\\d{1,3}\\s?\\-\\s?\\d{1,3}(?:\\,|\\&))*)(\\d{1,3}(?!\\s?\\-\\s?)|\\d{1,3}\\s?\\-\\s?\\d{1,3})`;
	 
	 let bible_regex = new RegExp(regex_literal, 'g');
	 return bible_regex;
	}
	
	
	/**
	 * {desc} class entry point.
	 * create instances for entire app func
	 * 
	 */
	create() {
		this.transverseTextNodes(this.element, this.regex);
		this.setStage(this.element, this.options);
	}
	
	
	/*
	This function is currently not in use. Intended use is to check whether bibleup element contains scripture references or not. Then output an error if negative but if positive proceeds to transverseTextNodes()
	
	This function is already being handled by transverseTextNodes() without displaying error
	*/
	searchScripInstances(e, regex) {
		let eContent = e.textContent;
		let matches = eContent.match(regex) || false;
		
		if (matches !== false) {
			let matchesLength = matches.length;
			this.transverseTextNodes(e, regex);
			console.log(matches);
		} else {
			this.error('warning', "No scripture reference found in selector's text");
		}
	}
	
	
	transverseTextNodes(e, regex) {
		let type = e.nodeType;
		let match = e.textContent .match(regex) || false;
		let next;
	
		if (type == 3 && match != false) {
	 	 this.setScriptureLink(e, regex);
		} else if (type == 1) {
			//element node
			if (e = e.firstChild) {
	  	do {
	  	 next = e.nextSibling;
	  	 type = e.nodeType;
	  	 if (type == 1) {
	  	 	if (e.classList.contains('bu-link')) {
	  	 		this.modifyLink(e);
	  	 	} else if (this.validateEl(e)) {
	 	  	this.transverseTextNodes(e, regex);
	  	 	}
	  	 } else {
	  	 	this.transverseTextNodes(e, regex);
	  	 }
	  	} while (e = next);
		 }
		}
	}
	
	
	/**
	 * description: This function validates elements node before running transverseTextNodes() on subsequent child elements
	 * Returns true after successful validation else returns false 
	 */
	validateEl(e) {
		let forbidden_tags = this.options.bu_ignore;
		if (forbidden_tags.includes(e.tagName)) return false
		if (e.classList.contains('bu-ignore') == false)
		return true;
	}
	
	
	/**
	 * description: If element node is contains 'bu-link' class, then this function helps modify/change it styles rather than running transverseTextNodes() a second time
	 * returns same element data but with a new modified style
	 */
	modifyLink(e) {
		e.className = `bu-link ${this.options.linkStyle}`
	}
	
	
	
	/**
	 * description: This function returns appends <cite> on text nodes with a scripture match
	 * It replace 'This text is john 3.16' with 'This text is <cite attr>John 3:16</cite>'
	 * param(node) is a text node
	 */
	setScriptureLink(node, regex) {
	 let newNode = document.createElement('div');
	 newNode.innerHTML = node.nodeValue.replace(regex, this.setLinkStyle.bind(this));
	 
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
	setLinkStyle(match, p1, p2, p3, p4, p5, p6) {
		
		let linkStyle = this.options.linkStyle;
		let full_match = {
			'book':undefined,
			'chapter':undefined,
			'verse' :undefined
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
		
		let result = `
		<cite>
		<a href='#' id='bu-link-all' class='bu-link ${linkStyle}' bu-data='${JSON.stringify(full_match)}'>${match}</a>
		</cite>`;
		
		return result;
	}
	
	
	
	setStage(element, options) {
		constructPopup(options);
		let bulink = document.querySelectorAll('.bu-link');
		let popup = document.getElementById('bu-popup');
		
		bulink.forEach(link => {
			link.addEventListener('click', evt => {
				evt.preventDefault();
				evt.stopPropagation();
			});
			
			link.addEventListener('mouseenter', this.clickb.bind(this));
		});
		
		['mouseenter', ''].forEach(event => {
				document.documentElement.addEventListener(event, this.closePopup.bind(this), true)
			});
	}
	
	
async clickb(e) {
	let bibleRef = e.currentTarget.getAttribute('bu-data');
	bibleRef = JSON.parse(bibleRef);
	
	let res = await fetchData(bibleRef, this.options.version);
	
	this.updatePopupData(res);
	if (!(this.options.popup == 'wiki')) {
		this.positionPopup(e);
	}
	this.openPopup();
}



positionPopup(e) {
	let height = window.innerHeight;
	let width = window.innerWidth;
	let popup = document.getElementById('bu-popup')
	let popWidth = popup.offsetWidth; //360px
	let popHeight = popup.offsetHeight; //149
	
	//link element rect
	let rect = e.target.getBoundingClientRect();
	let rectX = Math.round(rect.x);
	let rectY = rect.y;
	let rectTop = rect.top;
	let rectBottom = rect.bottom;
	let rectLeft = Math.round(rect.left);
	let rectRight = Math.floor(rect.right);
	
	//position of link from overall page with scroll
	let realTop = window.scrollY+rectTop;
	let realBottom = window.pageYOffset+rectBottom;
	let realLeft = window.scrollX+rectLeft;
	
	popup.style.top = `${realTop + 25 +'px'}`
	
	//Adjust popup to left or right of click
	let remainingSpace = width - rectLeft
	
	if (remainingSpace > popWidth) {
		//enough space
		popup.style.left = `${rectLeft + 'px'}`;
	} else {
		let offsetBy = popWidth - remainingSpace;
		let adjust = rectLeft - offsetBy
		popup.style.left = `${adjust + 'px'}`;
	}
	
	
	//adjust popup to bottom or top of link according to space remaining
	let remainingSpace_bottom = height - rectBottom;

	if (!(remainingSpace_bottom > popHeight + 100)) {
		//alert('real Bottom ' + realBottom);
		//alert('remainingSpace_bottom ' + remainingSpace_bottom);
		let offsetBy = popHeight - remainingSpace_bottom;
		let adjust = realBottom - offsetBy;
		let popTop = height - popHeight;
		let ad2 = popTop + window.scrollY - remainingSpace_bottom;
		popup.style.top = `${ad2 - 25 +'px'}`
	}
}




/**
 * (res) @param is fetch response object from php
 * @param res contains: res.ref, res.text, res.chapter, res.verse, res.version
 * (description) update popup data
*/
updatePopupData(res) {
	let popupRef = document.querySelector('#bu-popup .ref');
	let popupVersion = document.querySelector('#bu-popup .version');
	let popupText = document.querySelector('#bu-popup .text');
	
	//update
	popupRef.textContent = res.ref;
	popupVersion.textContent = res.version.toUpperCase();
	//alert(Array.isArray(res.text));
	popupText.setAttribute('start', res.verse);
	if (res.text == null) {
		popupText.textContent = 'This bible reference cannot be loaded.';
	} else {
		let text = res.text
		popupText.innerHTML = '';
		text.forEach(verse => {
			popupText.innerHTML += `<li>${verse} </li>`
		})
	}
}
	
	
openPopup() {
	let popup = document.getElementById('bu-popup');
	if (popup.classList.contains('bu-popup-hide')) {
		popup.classList.remove('bu-popup-hide');}
}


closePopup(e) {
	
	let targetId = e.target.id;
	if (targetId != 'bu-popup') {
		alert(targetId);
		//e.stopPropagation;
	}

	//e.stopImmediatePropagation();
	
	/*let mouseFrom = e.relatedTarget;
	let curr = e.currentTarget;
	let t = e.target.id;
	
	//alert(mouseFrom.className);
	let x = e.clientX, y = e.clientY, 
	element = document.elementFromPoint(x,y)
	alert(element.id);
	
	if (!mouseFrom.classList.contains('bu-link')) {
	}
		*/
}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	error(msg) {
		console.warn(msg);
		return;
	}
}
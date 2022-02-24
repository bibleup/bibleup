import bibleData from './bible-data.js';


export default class Bible {
	
	/**
	 * returns all bible abbreviations separated by '|'
	 * to be used in creating bibleReg>ex
	 */
	static allAbbreviations() {
		let result = '';
		bibleData.forEach((obj,index) => {
			if (index == bibleData.length - 1) {
				result += obj.a;
			} else {
				result += obj.a + '|';
			}
		})
		return result;
	}
	
	
	/**
	 * returns bible regex expression
	 * /(john|jn|rom|...)\s?(\d{1,3})(?:(?:\s|\:)(\d{1,3})(?:\-(\d{1,3}))?)?/gi;
	*/
	static regex() {
		let booksAbbr = this.allAbbreviations();
		let regexVar = `(${booksAbbr})\\s?(\\d{1,3})(?:(?:\\s|\\:|\\:\\s)(\\d{1,3})(?:\\-(\\d{1,3}))?)?`;
		let regex = new RegExp(regexVar, 'gi');
		return regex;
	}
	
	/**
	 * Get abbr book for api.bible
	 * accepts standard book - 'Psalm'
	 * returns abbr book for API/URL - 'PSA'
	 * The result is from 'bibleData', so it doesn't send a request to the API
	 */
	static apiBook(book) {
		for (let i = 0; i < bibleData.length; i++) {
			let currBook = bibleData[i].a
			let p = bibleData[i].p
			if (book == currBook && p == 2) {
				let apiBook = bibleData[i].api;
				return apiBook;
			}
		}
	}
	
	/**
	 * get real standard book name from an abbreviation
	 * e.g Jn or jn returns John, gen returns Genesis
	*/
	static realBook(book) {
		let result;
		for (let i = 0; i < bibleData.length; i++) {
			let a = bibleData[i].a;
			if (a.toUpperCase() == book.toUpperCase()) {
				result = this.getBookFromId(bibleData[i].b);
				
				return result;
			}
		}
	}
	
	
	/**
	 * get book name from book id - 1 to 66
	 * id 1 returns Genesis, 66 returns Revelation
	*/
	static getBookFromId(id) {
		for (let i = 0; i < bibleData.length; i++) {
			let bookId = bibleData[i].b;
			let primary = bibleData[i].p;
			if (bookId == id && primary == 2) {
				return bibleData[i].a;
			}
		}
	}
	
	
	
	/**
	 * extracts bible passages from a string
	 * returns array of objects [{<ref>,<book>,<chapter>,<verse>,<verseEnd><apiBook>}]
	*/
	static extractPassage(txt) {
		txt = txt.trim();
 		let result = [];
		let bibleRegex = this.regex();
		let bible = [...txt.matchAll(bibleRegex)];
	
		if (bible.length > 0) {
			bible.forEach((bibleRef) => {
		 	result.push(this._structureRef(bibleRef));
			})
		} else {
			result = false;
		}
		
		return result;
	}
	
	
	
	/**
	 * accepts bible array like ['rom 2 23',rom,2,23], [jn 3:16 17, jn, 3,16,17]
	 * returns object {<ref>,<chapter><verse><verseEnd><...>}
	*/
	static _structureRef(bibleRef) {
		let book = this.realBook(bibleRef[1]);
		let apiBook = this.apiBook(book);
		let chapter = parseInt(bibleRef[2]);
		let verse = parseInt(bibleRef[3])||1;
		let verseEnd = parseInt(bibleRef[4])||undefined;
	
	
		//switch verse and verseEnd
		if (verse > verseEnd) {
			let temp = verse;
			verse = verseEnd;
			verseEnd = temp;
		}
	
		// complete reference
		let ref;
		if (verse == undefined) {
			ref = `${book} ${chapter}`;
			apiBook = `${apiBook}.${chapter}`;
		} else if (verseEnd == undefined) {
			ref = `${book} ${chapter}:${verse}`;
			apiBook = `${apiBook}.${chapter}.${verse}`;
		} else {
			ref = `${book} ${chapter}:${verse}-${verseEnd}`;
			apiBook = `${apiBook}.${chapter}.${verse}-${apiBook}.${chapter}.${verseEnd}`;
		}
		
		let result = {
			'ref':ref,
			'book': book, 
			'chapter':chapter,
			'verse': verse,
			'verseEnd': verseEnd,
			'apiBook': apiBook
		};
		
		
		return result;
	}


















}

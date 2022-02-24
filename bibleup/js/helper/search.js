import Bible from './bible.js'

export default class Search {
	
	
	/**
	 * extracts bible references from plain strings and returns result in array
	 * returns array {'ref':<str>, 'version': {obj}, 'text': <str> ...}
	 */
	static async getBibleData(input, version) {
		let result = [];
		let bible = Bible.extractPassage(input);
		let r = await this.getScripture(bible, version)
		console.log(bible)
		return r
		
		// BELOW IS ONLY MEANT FOR STRINGS WITH MULTIPLE BIBLE REFERENCES
		/* if (bible != false) {
			for (let bibleRef of bible) {
				let r = await this.getScripture(bibleRef, version)
				if (r.text != 404) {
					//push only valid scriptures
					result.push(r)
				}
			}
		} */
	
		return result;
	}
	
	
	
	/**
 * get scripture Text from bible reference
 * if text = 404, the Bible reference was INVALID
 */
static async getScripture(bible, version) {
	let text;
	//console.log(JSON.stringify(bible.chapter))
	if (bible.verseEnd) {
		text = await this.getPassage(bible.apiBook, version.id)
		} else {
		text = await this.getText(bible.apiBook, version.id)
	}
	
	let result = {
		ref: bible.ref,
		version: version.abbreviation,
		refData: {
			book: bible.book,
			chapter: bible.chapter, 
			startVerse: bible.verse, 
			endVerse: bible.verseEnd,
		},
		apiBook: bible.apiBook,
		text: text
	};
	return result
}
	
	
	static async getText(ref, version) {
	let result = '';
	let bibleId = 'de4e12af7f28f599-01';
	let url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/verses/${ref}?content-type=html&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false&use-org-id=false`;
	
	try {
		let res = await fetch(url, {
			method: 'GET',
			headers: {
				"api-key": "f3aa9d8a78fc43aaa708fb5032042f4b",
			}
		})
		
		if (!res.ok) {
		 let err = `An error has occurred: ${res.status}`;
		 if (res.status == 404) {
		 	result.push(404)
		 } else {
		 	result.push('Cannot load passage at the moment')
		 }
		 throw new Error(err);
		}
		
		let content = await res.json();
		result = this.processBibleText(content, 'text')
		return result;
		
	} catch(error) {
		//console.log(error);
		return result;
	}
}
	
	
	/**
	 * Get range of verses - ACT.1.8-ACT.1.10
	 **/
	static async getPassage(ref, version) {
		let result = [];
		let bibleId = 'de4e12af7f28f599-01';
		let url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/passages/${ref}?content-type=html&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=true&use-org-id=false`;
	
		try {
			let res = await fetch(url, {
				method: 'GET',
				headers: {
					"api-key": "1f52dfac1bbd400ebb653227547f4912",
				}
			})
	
			if (!res.ok) {
				let err = `An error has occurred: ${res.status}`;
				if (res.status == 404) {
					result.push(404)
				} else {
					result.push('Cannot load passage at the moment')
				}
				throw new Error(err);
			}
	
			let content = await res.json();
			let text = this.processBibleText(content, 'passage')
			return text;
	
		} catch (error) {
			//console.log(error);
			return result;
		}
	}
	
	
	/**
	 * parses HTML response from the fetch API and extract the verses.
	 * WARN: The HTML responses are tricky and had to be parsed based on observations from manual testing
	 * returns text e.g 'Jesus be Glorified' if type is 'text'
	 * returns array e.g ['Jesus be Glorified', 'Forever'] if type is 'passage'
	 */
	static processBibleText(obj, type) {
	if (type == 'text') {
		let content = obj['data']['content']
		let parser = new DOMParser();
		let doc = parser.parseFromString(content, 'text/html');
		let p = doc.querySelector('p');
		return p.textContent;
	}
	
	if (type == 'passage') {
		let content = obj['data']['content']
		let parser = new DOMParser();
		let doc = parser.parseFromString(content, 'text/html');
		let p = doc.querySelector('.p');
		let span = doc.getElementsByClassName('verse-span');
		let passage = 	[];
		let lastVerse;
		
		for (let verse of span) {
			let currVerse = verse.getAttribute('data-verse-id');
			if (currVerse != lastVerse) {
				lastVerse = verse.getAttribute('data-verse-id');
				passage.push(verse.textContent)
			} else {
				//join 'separated' words in verse
				let add = passage[passage.length - 1] += ' '+ verse.textContent;
			}
		}
		
		return passage;
	}
}
	
	
	// END CLASS
}

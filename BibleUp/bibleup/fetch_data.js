/*BIBLEUP 📖💡 - fetchData
	* fetch json from api
	* api endpoint - web/getscripture.php
*/

export default class fetchData {
	
	constructor(bibleRef, version) {
		this.book = bibleRef['book'];
		this.chapter = this.trimAll(bibleRef['chapter']);
		this.verse = this.trimAll(bibleRef['verse']);
		this.version = version;
	}
	
	
	trimAll(ref) {
		if (ref != undefined) {
			let result = ref.replace(/\s/g, '')
			return result
		}
		return null;
	}
	
	
	async getText() {
		
		let a = JSON.stringify({
		 book:this.book,
		 chapter:this.chapter,
		 verse:this.verse, 
		 version:this.version
		});
		
		let form = new FormData();
		form.append('json', a);
		
		try {
		 const response = await fetch('bibleup/web/getscripture.php', {
		 	method: 'POST', 
		 	body: form,
		 	mode: "same-origin",
		 	cache: 'no-cache'
		 });
		
		 if (!response.ok) {
		  let err = (`An error has occurred: ${response.status}`);
		  throw new Error(err);
		 }
		
		 const text = await response.json();
		 return text;
		 
		} catch(error) {
		 return error;
		}
	}
	

}
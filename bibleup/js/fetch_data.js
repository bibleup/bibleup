/*BIBLEUP 📖💡 - fetchData
	* fetch json from api
	* api endpoint - web/getscripture.php
*/



let trimAll = (data) => {
	if (data != undefined) {
		let result = data.replace(/\s/g, '')
		return result;
	}
	return null;
}
	
	
/**
* get json data through XMLHttpRequest
* api endpoint - script/getscripture.php
*/
let fetchData = async (bibleRef, version) => {
  console.log(bibleRef)
	let book = bibleRef['book'];
	let chapter = trimAll(bibleRef['chapter']);
	let verse = trimAll(bibleRef['verse']);
		
	let a = JSON.stringify({
		book:book, 
		chapter:chapter, 
		verse:verse, 
		version:version
	});
		
	let form = new FormData();
	form.append('json', a);
	
	/*
	try {
		const response = await fetch('../bibleup/script/getscripture.php', {
		 method: 'POST',
		 body: form,
		 mode: "cors",
		 cache: 'force-cache'
		});
		//fetch url is mapped to work for demo/index.html
		//when serving bibleup.js from dist/
		
		if (!response.ok) {
		 let err = (`An error has occurred: ${response.status}`);
		 throw new Error(err);
		}
		
		const text = await response.json();
		return text;
		
	} catch (error) {
		return error;
	}
	
	*/
}
	
export default fetchData;

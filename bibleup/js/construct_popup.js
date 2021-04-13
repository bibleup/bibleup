export default class ConstructPopup {
	
	static build(options) {
		const popup = document.createElement('div');
		popup.setAttribute('id', 'bu-popup');
		/*let popup = options.popup;
		let dark = options.dark*/
		
		switch (options.popup) {
			case 'inline':
				popup.classList.add('classic', 'bu-popup-hide');
				if (options.dark) {
					popup.classList.add('dark');
				}
				popup.innerHTML = this.inline();
				document.body.appendChild(popup);
				break;
		
				//wiki-style
			case 'wiki':
				popup.classList.add('wiki-style', 'bu-popup-hide');
				if (options.dark) {
					popup.classList.add('dark');
				}
				popup.innerHTML = this.wikiStyle();
				document.body.appendChild(popup);
				break;
		
			default:
				return false;
		}
	}
	
	
	static inline() {
		const markup = `
		<div class="header">
		<p class='ref'></p>
		<p class="version">...</p>
		</div>
		
		<div class="content">
			<ol class='text'>
				<li>Loading..</li>
			</ol>
		</div>
		
		<div class="footer">
			<p>BibleUp 📖💡</p>
		</div>
		`
	return markup;
	}
	
	
	static wiki() {
		const markup = `
	 <div class="header">
	  <p class='ref'></p>
	  <span class='version'></span>
	  <p id="close">&#x2715</p>
	 </div> 
	 
	 <div class = "content">
	 	<ol class='text'>
	   <li>Loading..</li>
	  </ol> 
	 </div>
	  
	 	<div class="footer">
	 	<p>BibleUp 📖💡</p> 
	 	</div>
	 	`
	 return markup;
	}
}
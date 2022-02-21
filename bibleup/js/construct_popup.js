export default class ConstructPopup {
	
	static build(options) {
		const popup = document.createElement('div');
		popup.setAttribute('id', 'bu-popup');
		let popupStyle = options.popup;
		let darkTheme = options.darkTheme;
		
		switch (popupStyle) {
			case 'classic':
				popup.classList.add('classic', 'bu-popup-hide');
				if (darkTheme == true) {
					popup.classList.add('darkTheme');
				}
				popup.innerHTML = this.classic();
				document.body.appendChild(popup);
				break;
		
			//wiki-style
			case 'wiki':
				popup.classList.add('wiki', 'bu-popup-hide');
				if (darkTheme == true) {
					popup.classList.add('darkTheme');
				}
				popup.innerHTML = this.wiki();
				document.body.appendChild(popup);
				break;
				
			//inline
			case 'inline': 
				popup.classList.add('inline', 'bu-popup-hide');
				if (darkTheme == true) {
					popup.classList.add('darkTheme');
				}
				popup.innerHTML = this.inline();
				document.body.appendChild(popup);
				break;
				
			default:
				return false;
		}
	}
	
	
	static classic() {
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
	  <p class="close">&#x2715</p>
	 </div> 
	 
	 <div class = "content">
	 	<ol class='text'>
	   <li>Loading..</li>
	  </ol> 
	 </div>
	  
	 	<div class="footer">
	 	<p>BibleUp📖💡</p> 
	 	</div>
	 	`
	 return markup;
	}
	
	
	static inline() {
		const markup = `
		<div class="content">
  	<ol class="text">
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

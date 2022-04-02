export default class ConstructPopup {

  static build(options) {
    const popup = document.createElement("div");
    popup.setAttribute("id", "bu-popup");
    popup.classList.add("bu-popup-hide");
    let popupStyle = options.popup;
    let darkTheme = options.darkTheme;

	if (popupStyle == 'classic') {
        popup.classList.add("classic");
        popup.innerHTML = this.classic();
	}

	if (popupStyle == 'inline') {
        popup.classList.add("inline");
        popup.innerHTML = this.inline();
	}

	if (popupStyle == 'wiki') {
        popup.classList.add("wiki");
        popup.innerHTML = this.wiki();
	}
	
	if (darkTheme == true) {
		popup.classList.add("darkTheme");
	}
    document.body.appendChild(popup);
  }

  static classic() {
    const markup = `
		<div class="header">
		<p class='ref'></p>
		<p class="version"></p>
		</div>
		
		<div class="content">
			<ol class='text'></ol>
		</div>
		
		<div class="footer">
			<p>BibleUp 📖💡</p>
		</div>
		`;
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
	 	<ol class='text'></ol> 
	 </div>
	  
	 <div class="footer">
	 	<p>BibleUp 📖💡</p> 
	 </div>`

    return markup;
  }

  static inline() {
    const markup = `
		<div class="content">
  			<ol class="text"></ol>
  		</div>
 
 		<div class="footer">
  			<p>BibleUp 📖💡</p>
 		</div>`

    return markup;
  }
}

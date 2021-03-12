

export function constructPopup($options) {
	switch ($options.popup) {
		case 'inline':
			const popup = document.createElement('div');
			popup.setAttribute('id', 'bu-popup');
			popup.classList.add('classic', 'bu-popup-hide');
			popup.innerHTML = inline();
			document.body.appendChild(popup);
			break;
	 case 'wiki':
	 	break;
	}
}
	
	
function inline() {
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
		
	<div class="footer"><p>BibleUp 📖💡</p></div>
		`
		return markup
}
	
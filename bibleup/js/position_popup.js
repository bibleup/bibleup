

let positionPopup = (e, popup) => {
	if(popup == 'classic') {
		return classic(e);
	}
	
	if (popup == 'inline') {
		return inline(e);
	}
	
	
	return false;
}




let classic = (e) => {
	//get window dimensions
	let height = window.innerHeight;
	let width = document.documentElement.clientWidth;
	let popup = document.getElementById('bu-popup');
	let popWidth = popup.offsetWidth;
	let popHeight = popup.offsetHeight;
	
	//get bu-link rect (onClick)
	let rect = e.target.getBoundingClientRect();
	let rectTop = rect.top;
	let rectBottom = rect.bottom;
	let rectLeft = Math.round(rect.left);

	//get position of bu-link from window with scroll
	let realTop = window.scrollY + rectTop;
	let realBottom = window.pageYOffset + rectBottom;
	let realLeft = window.scrollX + rectLeft;
	
	
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
		alert('adjusted')
	}
	
	//adjust popup to bottom or top of link according to space remaining
	let remainingSpace_bottom = height - rectBottom;
	if (!(remainingSpace_bottom > popHeight + 100)) {
		let offsetBy = popHeight - remainingSpace_bottom;
		let adjust = realBottom - offsetBy;
		let popTop = height - popHeight;
		let ad2 = popTop + window.scrollY - remainingSpace_bottom;
		popup.style.top = `${ad2 - 25 +'px'}`
	}
}



//INLINE 
let inline = (e) => {
	//get window dimensions
	let height = window.innerHeight;
	let width = document.documentElement.clientWidth;
	let popup = document.getElementById('bu-popup');
	let popWidth = popup.offsetWidth + 25;
	let popHeight = popup.offsetHeight;
	
	//get bu-link rect (onClick)
	let rect = e.target.getBoundingClientRect();
	let rectTop = rect.top;
	let rectBottom = rect.bottom;
	let rectLeft = Math.round(rect.left);
	let rectRight = Math.floor(rect.right);
	
	//get position of bu-link from window with scroll
	let realTop = window.scrollY + rectTop;
	let realBottom = window.pageYOffset + rectBottom;
	let realLeft = window.scrollX + rectLeft;
	
	
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
		let offsetBy = popHeight - remainingSpace_bottom;
		let adjust = realBottom - offsetBy;
		let popTop = height - popHeight;
		let ad2 = popTop + window.scrollY - remainingSpace_bottom;
		popup.style.top = `${ad2 - 25 +'px'}`
	}
}

export default positionPopup;
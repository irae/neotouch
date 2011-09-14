(function(){
	var screenHeight = window.innerHeight + 10;
	for(var i=0; i<=document.querySelectorAll('.areas section').length; i++){
		document.querySelectorAll('.areas section')[i].style.minHeight = screenHeight+'px';
	}
})();

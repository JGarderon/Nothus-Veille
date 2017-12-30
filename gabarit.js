
window.addEventListener( 
	"load", 
	(evt) => { 
		document.querySelectorAll("header")[0].querySelectorAll("a").forEach(
			(element) => { 
				element.addEventListener(
					"click", 
					Page_traiterlien 
				)
			} 
		); 
		Chargement(false); 
	} 
); 
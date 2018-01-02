

function __chargement__() { 

	document.querySelectorAll("div.titraille").forEach( 
		(elP) => { 
			var elB = elP.querySelector("span.interrogation"); 
			var elTxt = elP.querySelector("span.texte"); 
			elB.addEventListener( 
				"click", 
				(evt) => { 
					elTxt.style.display = (elTxt.style.display=="block")?"none":"block"; 
				}
			)
		}
	); 
	
	Chargement(false); 
}

if (document.readyState=="loading") { 
	window.addEventListener( 
		"load", 
		__chargement__ 
	); 
} else { 
	__chargement__(); 
} 

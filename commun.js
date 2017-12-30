
function Chargement(visible) { 
	document.getElementById("chargement").style.display = (visible)?
		"flex" 
	: 
		"none" 
	; 
} 


function Gabarit_retrouver(nom) { 
	var Gabs = document.getElementsByTagName("style"); 
	for(var i=0; i<Gabs.length; i++) { 
		if (Gabs[i].getAttribute("gabarit")==nom) 
			return Gabs[i]; 
	} 
	return false; 
}

function Gabarit(gabElP,remplacements, fct) { 
	var gabEl = document.createElement("span"); 
	if (!gabElP.hasAttribute("gabarit")) 
		gabElP.setAttribute("gabarit", ""); 
	gabEl.setAttribute( 
		"class", 
		gabElP.getAttribute(
			"gabarit" 
		) 
	); 
	var tmp = gabElP.innerHTML; 
	for(var cle in remplacements) { 
		var r = "{{"+cle+"}}"; 
		while (tmp.indexOf(r)!=-1) { 
			tmp = tmp.replace( 
				r, 
				remplacements[cle] 
			); 
		} 
	} 
	gabEl.innerHTML = tmp; 
	if (typeof fct=="undefined" & gabElP.getAttribute("reference")!="") 
		fct = window[gabElP.getAttribute("reference")]; 
	if (typeof fct=="function") 
		gabEl = fct(gabEl); 
	return gabEl; 
} 

window.Pages = {}; 
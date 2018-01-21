
window.BDD_version = 3; 

window.ENCOURS = true; 
window.addEventListener("beforeunload", (evt) => { 
	if (!window.ENCOURS) 
		return false; 
	var m = "Une opération est en cours sur la base de données ; êtes-vous sûr de vouloir continuer ? Des informations pourraient être perdues.";
	(evt || window.event).returnValue = m; 
	return m; 
});
function Chargement(visible) { 
	window.ENCOURS = (visible)?true:false; 
	document.getElementById("chargement").style.display = (visible)?
		"flex" 
	: 
		"none" 
	; 
} 

function ERREURGENERALE(m) { 
	try { 
		window.db.close(); 
	} catch(e) {} 
	var c = document.querySelector("#chargement"); 
	var t = c.querySelector(".message p"); 
	HTML_nettoyer( 
		t 
	); 
	t.appendChild(
		document.createTextNode( 
			"ERREUR IRRECUPERABLE" 
		) 
	); 
	c.setAttribute( 
		"class", 
		"erreurG" 
	); 
	alert( 
		m || "Le module va tenter une récupération. Si elle échoue, merci de le réinstaller."
	); 
	setTimeout( 
		() => { 
			document.location.href = "./gabarit.html"; 
		}, 
		10000 
	); 
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
	if (typeof gabElP=="string") 
		gabElP = Gabarit_retrouver( 
			gabElP 
		); 
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

function HTML_nettoyer(el) { 
	while (el.firstChild) 
		el.removeChild( 
			el.firstChild 
		); 
}

function HTML_titrailleAction(evt) { 
	evt.preventDefault(); 
	var elP = evt.target.parentElement.parentElement; 
	var elTxt = elP.querySelector("span.texte"); 
	elTxt.style.display = (elTxt.style.display=="block")?"none":"block";  
}
function HTML_titraille() { 
	document.querySelectorAll("div.titraille").forEach( 
		(elP) => { 
			elP.querySelector("span.interrogation").addEventListener( 
				"click", 
				HTML_titrailleAction 
			)
		}
	); 
} 

function HTML_textareaLignes(evt) { 
	var r = evt.target.value.match(/(\n|\r\n|\r)/g); 
	evt.target.setAttribute( 
		"rows", 
		(r==null)?1:r.length-1 
	); 
} 

function BDD_ouvrir(_SuiteOk) { 
	var r = self.indexedDB.open("Nothus-RSS"); 
	r.onsuccess = (evtBDD) => { 
		window.db = evtBDD.target.result; 
		_SuiteOk(); 
	}; 
} 
function __auto__() { 
	BDD_ouvrir(() => {
		if (document.readyState=="loading") { 
			window.addEventListener( 
				"load", 
				__chargement__ 
			); 
		} else { 
			__chargement__(); 
		} 
	}); 
}

window.Pages = {}; 

if (self.localStorage.getItem("RSS.flux.temporaires")==null) 
	self.localStorage.setItem("RSS.flux.temporaires", JSON.stringify({})); 

if (self.localStorage.getItem("RSS.statistiques")==null) 
	self.localStorage.setItem("RSS.statistiques", JSON.stringify({})); 

function __chargement_commun__() { 
	
	/*--- gestion du titre de la page -> renvoi vers le gabarit initial ---*/ 
	document.querySelector("header h1").addEventListener( 
		"click", 
		(evt) => { 
			window.location.search = "";  
			window.location.href = window.location.origin+window.location.pathname; 
		} 
	); 
	
	/*--- gestion de la titraille ---*/ 
	HTML_titraille(); 

}

if (document.readyState=="loading") { 
	window.addEventListener( 
		"load", 
		__chargement_commun__ 
	); 
} else { 
	__chargement_commun__(); 
} 
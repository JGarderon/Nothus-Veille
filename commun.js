
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

/*---*/ 

function DEBUG_etat(etat) { 
	window.DEBUG_el = document.querySelector("#debug"); 
	window.DEBUG_el.setAttribute(
		"debug", 
		(etat=="1")? 
			"ouvert" 
		: 
			"ferme" 
	); 
} 
function DEBUG_ajouter(message) { 
	var elP = window.DEBUG_el.querySelector("section.messages"); 
	var p = document.createElement( 
		"p" 
	); 
	p.appendChild( 
		document.createTextNode( 
			String(message) 
		) 
	); 
	if (elP.firstChild!=null) { 
		elP.insertBefore( 
			p, 
			elP.firstChild 
		); 
	} else { 
		elP.appendChild( 
			p 
		); 
	} 
} 

browser.runtime.onMessage.addListener( 
	(message, expediteur, destinataire) => { 
		if ( 
			typeof message=="object" 
		& 
			message["type"]=="debugMessage" 
		& 
			window.localStorage.getItem( 
				"RSS.DEBUG" 
			)=="1" 
		) 
			DEBUG_ajouter( 
				message["contenu"] 
			); 
	} 
); 

/*---*/ 

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

window.ImagesBlog = {}; 

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
	try { 
		var r = evt.target.value.match(/(\n|\r\n|\r)/g); 
		evt.target.setAttribute( 
			"rows", 
			(r==null)?5:((r.length-1)<5)?5:r.length-1 
		); 
	} catch(e) {} 
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

/*---*/ 

function itemMiseAJour( 
	table, 
	itemId, 
	objetMaJ, 
	_SuiteOk, 
	_SuiteKo 
) { 
	itemExtraire( 
		table, 
		itemId, 
		(item) => { 
			for(var cle in objetMaJ) { 
				item[cle] = objetMaJ[cle]; 
			} 
			if ("version" in item) 
				item["version"]++; 
			itemEnregistrer( 
				table, 
				false, 
				item, 
				_SuiteOk, 
				_SuiteKo 
			); 
		}, 
		_SuiteKo 
	); 
} 

function itemActionner( 
	table, 
	action, 
	objet, 
	_SuiteOk, 
	_SuiteKo  
) { 
	try { 
		var objS = window.db.transaction( 
			table, 
			"readwrite"
		).objectStore( 
			table  
		); 
		var r = objS[action]( 
			objet 
		); 
		r.onsuccess = (evtBDD) => { 
			evtBDD.preventDefault(); 
			if ( 
				action!="delete" 
			& 
				typeof evtBDD.target.result=="undefined" 
			) 
				return _SuiteKo( 
					evtBDD.target 
				); 
			if (typeof _SuiteOk=="function") 
				return _SuiteOk( 
					evtBDD.target.result 
				); 
		}; 
		r.onerror = (evtBDD) => { 
			evtBDD.preventDefault(); 
			if (typeof _SuiteKo=="function") 
				_SuiteKo( 
					evtBDD.target 
				); 
		}; 
	} catch(e) { 
		_SuiteKo( 
			e 
		); 
	} 
} 

function itemsVider( 
	table, 
	action, 
	_SuiteOk, 
	_SuiteKo  
) { 
	try { 
		var r = window.db.transaction( 
			table, 
			"readwrite"
		).objectStore( 
			table  
		).clear(); 
		r.onsuccess = (evtBDD) => { 
			evtBDD.preventDefault(); 
			if (typeof _SuiteOk=="function") 
				return _SuiteOk( 
					evtBDD.target.result 
				); 
		}; 
		r.onerror = (evtBDD) => { 
			evtBDD.preventDefault(); 
			if (typeof _SuiteKo=="function") 
				_SuiteKo( 
					evtBDD.target 
				); 
		}; 
	} catch(e) { 
		_SuiteKo( 
			e 
		); 
	} 
} 

function itemEnregistrer( 
	table, 
	nouveau, 
	objet, 
	_SuiteOk, 
	_SuiteKo  
) { 
	itemActionner( 
		table, 
		(nouveau)?"add":"put", 
		objet, 
		_SuiteOk, 
		_SuiteKo 
	); 
} 

function itemExtraire( 
	table, 
	itemId, 
	_SuiteOk, 
	_SuiteKo 
) { 
	itemActionner( 
		table, 
		"get", 
		itemId, 
		_SuiteOk, 
		_SuiteKo 
	); 
} 

function itemsExtraire( 
	table, 
	params, 
	_SuiteOk, 
	_SuiteKo 
) { 
	var objS = window.db.transaction( 
		table, 
		"readonly" 
	).objectStore( 
		table 
	); 
	if ("index" in params) { 
		objS = objS.index( 
			params["index"] 
		); 
	}  
	var r = objS.openCursor(
		("bornes" in params)?params["bornes"]:null, 
		("sens" in params)?params["sens"]:"next" 
	); 
	r.onsuccess = _SuiteOk; 
	r.onerror = _SuiteKo; 
} 

/*---*/ 

window.Pages = {}; 

if (window.localStorage.getItem("RSS.flux.temporaires")==null) 
	window.localStorage.setItem("RSS.flux.temporaires", JSON.stringify({})); 

if (window.localStorage.getItem("RSS.statistiques")==null) 
	window.localStorage.setItem("RSS.statistiques", JSON.stringify({})); 

if (window.localStorage.getItem("RSS.gabarits")==null) 
	window.localStorage.setItem("RSS.gabarits", JSON.stringify({ 
		"notes": {"style":"", "contenu": "", "variables": {}}, 
		"rapports": {"style":"", "contenu": "", "variables": {}, "notes": []} 
	})); 

function __chargement_commun__() { 

	DEBUG_etat( 
		window.localStorage.getItem("RSS.DEBUG") 
	); 
	
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
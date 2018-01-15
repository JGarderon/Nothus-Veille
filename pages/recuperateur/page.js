
function FluxMaJ(URL,objFlux) { 
	var fluxTmpTous = JSON.parse( 
		window.localStorage.getItem( 
			"RSS.flux.temporaires" 
		) 
	); 
	fluxTmpTous[URL] = objFlux; 
	window.localStorage.setItem( 
		"RSS.flux.temporaires", 
		JSON.stringify( 
			fluxTmpTous 
		) 
	); 
} 

function FluxExtraire(URL) { 
	var fluxTmpTous = JSON.parse( 
		window.localStorage.getItem( 
			"RSS.flux.temporaires" 
		) 
	); 
	if (URL!=undefined) 
		return fluxTmpTous[URL]; 
	return fluxTmpTous; 
} 

function FluxAjouter(objHTML, objFlux) { 
	var _suiteFct = (objHTML) => {
		objFlux.dejaAjoute = true; 
		FluxMaJ( 
			objFlux.url, 
			objFlux 
		); 
		var elP = objHTML.parentElement.parentElement; 
		elP.removeChild( 
			objHTML.parentElement  
		); 
		FluxAucun(); 
	}; 
	var t = window.db.transaction(
		"flux", 
		"readwrite" 
	); 
	t.onerror = (evtBDD) => { 
		evtBDD.preventDefault(); 
		if (evtBDD.target.error.name=="ConstraintError") 
			_suiteFct(objHTML); 
	}; 
	var r = t.objectStore( 
		"flux" 
	).add( 
		objFlux 
	); 
	r.onerror = () => { 
		_suiteFct(objHTML); 
	}; 
	r.onsuccess = () => { 
		_suiteFct(objHTML); 
	}; 
}

function FluxAucun() { 
	if (
		document.querySelector("#liste_fluxRecuperation").children.length>0 
	) 
		return; 
	var txtNode = document.createTextNode( 
		"Aucun flux encore découvert : ne vous inquiétez pas, cette liste sera mise à jour toute seule." 
	); 
	var p = document.createElement("p"); 
	p.appendChild( 
		txtNode 
	); 
	p.setAttribute( 
		"etat", 
		"aucunFlux" 
	); 
	document.querySelector("#liste_fluxRecuperation").appendChild( 
		p 
	); 
} 

function FluxOublier(evt) { 
	evt.preventDefault(); 
	var url = evt.target.getAttribute("url"); 
	var objFlux = FluxExtraire(
		url 
	); 
	objFlux.dejaAjoute = true; 
	FluxMaJ(
		url, 
		objFlux 
	); 
	var elP = evt.target.parentElement.parentElement; 
	elP.parentElement.removeChild( 
		elP 
	); 
} 

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

	var r = self.indexedDB.open("Nothus-RSS"); 
	r.onsuccess = (evtBDD) => { 
		window.db = evtBDD.target.result; 
		Chargement(false); 
	} 

	var elGab = Gabarit_retrouver("confirmerFlux"); 
	var elP = document.querySelector("#liste_fluxRecuperation"); 

	var fluxTmpTous = JSON.parse( 
		window.localStorage.getItem( 
			"RSS.flux.temporaires" 
		) 
	); 
	var nbre = 0; 
	for (var url in fluxTmpTous) { 
		if (!fluxTmpTous[url].dejaAjoute) { 
			nbre++; 
			elP.appendChild( 
				Gabarit( 
					elGab, 
					fluxTmpTous[url], 
					(element) => { 
						element.querySelector("input[type=button]").addEventListener(
							"click", 
							FluxOublier 
						); 
						element.querySelector("form").addEventListener(
							"submit", 
							(evtForm) => { 
								evtForm.preventDefault(); 
								evtForm.target.setAttribute("etat", "attente"); 
								FluxAjouter( 
									evtForm.target, 
									{ 
										"site": evtForm.target[1].value, 
										"url": evtForm.target[3].value, 
										"actif": true, 
										"etat": "HTTP-200" 
									} 
								)
							}
						)
						return element; 
					} 
				) 
			);  
		} 
	}
	if (nbre==0) {
		FluxAucun(); 
	}
} 

if (document.readyState=="loading") { 
	window.addEventListener( 
		"load", 
		__chargement__ 
	); 
} else { 
	__chargement__(); 
} 


function FluxTrier(URL) { 
	var fluxTmpTous = JSON.parse( 
		window.localStorage.getItem( 
			"RSS.flux.temporaires" 
		) 
	); 
	delete fluxTmpTous[URL]; 
	window.localStorage.setItem( 
		"RSS.flux.temporaires", 
		JSON.stringify( 
			fluxTmpTous 
		) 
	) 
}

function FluxAjouter(objFlux, _SuiteOk, _SuiteKo) { 
	var r = window.db.transaction(
		"flux", 
		"readwrite" 
	).objectStore( 
		"flux"
	).add( 
		objFlux 
	); 
	if (typeof _SuiteOk=="function") 
		r.onsuccess = _SuiteOk; 
	if (typeof _SuiteKo=="function") 
		r.onerror = _SuiteKo; 
}


function __chargement__() { 


	var r = self.indexedDB.open("Nothus-RSS"); 
	r.onsuccess = (evtBDD) => { 
		window.db = evtBDD.target.result; 
		Chargement(false); 
	} 

	var elGab = Gabarit_retrouver("confirmerFlux"); 
	var elP = document.querySelector("#liste_flux"); 

	var fluxTmpTous = JSON.parse( 
		window.localStorage.getItem( 
			"RSS.flux.temporaires" 
		) 
	); 
	var nbre = 0; 
	for (var url in fluxTmpTous) { 
		nbre++; 
		elP.appendChild( 
			Gabarit( 
				elGab, 
				fluxTmpTous[url], 
				(element) => { 
					element.querySelector("form").addEventListener(
						"submit", 
						(evtForm) => { 
							evtForm.preventDefault(); 
							evtForm.target.setAttribute("etat", "attente"); 
							FluxAjouter( 
								{ 
									"site": evtForm.target[1].value, 
									"url": evtForm.target[3].value, 
									"actif": true, 
									"etat": "HTTP-200" 
								},
								() => { 
									FluxTrier( 
										evtForm.target[3].value 
									)
									evtForm.target.parentElement.removeChild( 
										evtForm.target 
									)
								}
							)
						}
					)
					return element; 
				} 
			) 
		); 
	}
	if (nbre==0) {
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
		elP.appendChild( 
			p 
		); 
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

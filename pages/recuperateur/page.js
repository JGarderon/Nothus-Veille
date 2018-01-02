
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

window.racinePathCorrection = /^\/\//; 
window.racinePath = /^\/[^\/]/; 
window.racineHTTP = /^http/; 

function FluxCorriger(URL, objFlux) { 
	var MaJ = false; 
	if (window.racinePathCorrection.test( 
		objFlux.url 
	)) { 
		MaJ = true; 
		objFlux._url = objFlux.url; 
		objFlux.url = "http:"+objFlux.url; 
	} 
	if (
		racinePath.test( 
			objFlux.url 
		)
		|| 
		!racineHTTP.test( 
			objFlux.url 
		)
	) { 
		MaJ = true; 
		objFlux._url = objFlux.url; 
		var racine = objFlux.origine.split("/"); 
		if (objFlux.url[0]=="/") 
			objFlux.url.subString(1); 
		objFlux.url = [ 
			racine[0], 
			racine[1], 
			racine[2], 
			objFlux.url
		].join("/"); 
	} 
	if (MaJ) 
		FluxMaJ(URL, objFlux); 
}

function FluxAjouter(objHTML, objFlux) { 
	var _suiteFct = (objHTML) => { 
		objFlux.dejaAjoute = true; 
		FluxMaJ( 
			objFlux._url, 
			objFlux 
		); 
		var elP = objHTML.parentElement; 
		elP.parentElement.removeChild( 
			elP 
		); 
		console.log(document.querySelector("#liste_fluxRecuperation").children.length); 
		if (document.querySelector("#liste_fluxRecuperation").children.length==0) 
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
	if (typeof _SuiteOk=="function") 
		r.onsuccess = () => { 
			_suiteFct(objHTML); 
		} 
}

function FluxAucun() { 
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

function ImportOPML_Message(message, etat) { 
	var elP = document.querySelector("#liste_fluxOutil_resultats"); 
	while (elP.childNodes.length>0) { 
		elP.childNodes[0].remove(); 
	} 
	var txt = document.createTextNode( 
		message 
	); 
	elP.appendChild(txt); 
	return elP.setAttribute("etat", etat); 
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

		// Importer OPML
		document.querySelector("#liste_fluxOutil_Import").addEventListener( 
			"submit", 
			(evtForm) => { 
				evtForm.preventDefault(); 
				if (evtForm.target[1].files.length==0) { 
					ImportOPML_Message( 
						"Aucun fichier n'a été sélectionné.", 
						"incorrect"
					); 
					return; 
				} 
				Chargement(true); 
				var r = new FileReader(); 
				r.onload = (evt) => { 
					window.ImporterOPML( 
						evt.target.result, 
						window.db, 
						(
							resultats 
						) => { 
							ImportOPML_Message( 
								"Vous avez "+resultats.nbreOk.toString()+" flux ajouté(s), "+resultats.nbreDoublons.toString()+" doublons non-ajoutés, sur "+resultats.nbreTotal.toString()+" trouvé(s).", 
								"correct"
							); 
							Chargement(false);  
						} , 
						(
							erreur  
						) => { 
							ImportOPML_Message( 
								"Le fichier que vous avez sélectionné n'est pas valide ou n'est pas au format OPML.", 
								"incorrect"
							); 
							Chargement(false);  
						} 
					); 
				}
				r.readAsBinaryString( 
					evtForm.target[1].files[0] 
				); 
			} 
		); 

		// Exporter OPML
		document.querySelector("#liste_fluxOutil_Export").addEventListener( 
			"submit", 
			(evtForm) => { 
				evtForm.preventDefault(); 
				Chargement(true); 
				ExporterOPML( 
					window.db, 
					() => { 
						Chargement(false); 
					} 
				); 
			} 
		); 

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
			FluxCorriger( 
				url, fluxTmpTous[url] 
			); 
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
									evtForm.target, 
									{ 
										"site": evtForm.target[1].value, 
										"url": evtForm.target[3].value, 
										"_url": evtForm.target[6].value, 
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

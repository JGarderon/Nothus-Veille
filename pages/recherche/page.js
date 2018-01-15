
/*
	"vueTitre": "Vue normale", 
	"vueDateDebut": null, 
	"vueDateFin": null, 
	"vueDateInverse": true, 
	"vueExp": null, 
	"vueExpReg": false, 
	"vueExpRegIns": false, 
	"vueSecteurs": [] 
*/ 

function Vue_messageResultat(m, etat) { 
	window.location.hash = "formulaire"; 
	var elR = document.querySelector( 
		"#formulaire form span.resultat" 
	); 
	HTML_nettoyer( 
		elR 
	); 
	elR.setAttribute( 
		"etat", 
		etat
	); 
	elR.appendChild( 
		document.createTextNode(
			m 
		) 
	); 
} 

function Vue_formulaireChamps(
	objHTML 
) { 
	var objHTML = document.querySelector("#formulaire form"); 
	return { 
		"vueId": objHTML.querySelector("*[name=vueId]"), 
		"vueTitre": objHTML.querySelector("*[name=vueTitre]"), 
		"vueDateDebut": objHTML.querySelector("*[name=vueDateDebut]"), 
		"vueDateFin": objHTML.querySelector("*[name=vueDateFin]"), 
		"vueDateInverse": objHTML.querySelector("*[name=vueDateInverse]"), 
		"vueExp": objHTML.querySelector("*[name=vueExp]"), 
		"vueExpReg": objHTML.querySelector("*[name=vueExpReg]"), 
		"vueExpRegIns": objHTML.querySelector("*[name=vueExpRegIns]"), 
		"listeSecteurs": objHTML.querySelector("#listeSecteurs"), 
		"_apercu": objHTML.querySelector("input[type=submit]"), 
		"_enregistrement": objHTML.querySelector("input[type=button]") 
	}
} 

function Vue_MaZ(_SuiteOk) { 
	var vueEls = Vue_formulaireChamps(); 
	vueEls.vueId.value = "nouveau"; 
	vueEls.vueTitre.value = ""; 
	vueEls.vueDateDebut.value = ""; 
	vueEls.vueDateFin.value = ""; 
	vueEls.vueDateInverse.checked = true; 
	vueEls.vueExp.value = ""; 
	vueEls.vueExpReg.checked = false; 
	vueEls.vueExpRegIns.checked = false; 
	Vue_jonctionsExtraire(
		"nouveau", 
		[], 
		() => { 
			_SuiteOk = _SuiteOk; 
			HTML_nettoyer( 
				document.querySelector("#resultats") 
			); 
			var el = document.querySelector("#formulaire span.vueSuppression"); 
			if (el!=null)
				el.parentElement.removeChild( 
					el 
				); 
			Vues_MaJ(
				() => { 
					if (typeof _SuiteOk=="function") 
						_SuiteOk(); 
				} 
			); 
		} 
	); 
} 

function Vue_enregistrer( 
	evtForm 
) { 
	evtForm.preventDefault(); 
	Chargement(true); 
	var champs = Vue_formulaireChamps(); 
	if (champs.vueTitre.value=="") { 
		Chargement(false); 
		return Vue_messageResultat( 
			"Un titre de vue est obligatoire.",  
			"incorrect"
		); 
	} 
	var objStockage = window.db.transaction( 
		"vues", 
		"readwrite" 
	).objectStore( 
		"vues" 
	); 
	var vue = { 
		"titre": champs.vueTitre.value, 
		"dateDebut": (champs.vueDateDebut.value=="")?null:champs.vueDateDebut.value, 
		"dateFin": (champs.vueDateFin.value=="")?null:champs.vueDateFin.value, 
		"dateInverse": (champs.vueDateInverse.checked)?true:false, 
		"exp": champs.vueExp.value, 
		"expReg": champs.vueExpReg.checked, 
		"expRegIns": champs.vueExpRegIns.checked, 
		"secteurs": [], 
	}; 
	champs.listeSecteurs.querySelectorAll( 
		"a" 
	).forEach( 
		(element) => { 
			if (element.getAttribute("jonction")=="oui") 
				vue.secteurs.push( 
					parseInt( 
						element.getAttribute( 
							"secteurId" 
						) 
					) 
				); 
		} 
	); 
	if (champs.vueId.value=="nouveau") { 
		var r = objStockage.add( 
			vue 
		); 
	} else { 
		vue.id = parseInt( 
			champs.vueId.value 
		); 
		var r = objStockage.put( 
			vue 
		); 
	}
	r.onsuccess = (evtBDD) => { 
		Vue_messageResultat( 
			"La vue a bien été enregistrée.", 
			"correct" 
		); 
		Vue_MaZ( 
			() => { 
				Vues_MaJ( 
					() => { 
						Chargement(false); 
					}
				)
			} 
		); 
	}; 
	r.onerror = (evtBDD) => { 
		Vue_messageResultat( 
			"Une erreur est survenue lors de l'enregistrement de la vue.", 
			"incorrect"
		); 
	}; 
} 

function Vue_suppression( 
	evtForm 
) { 
	evtForm.preventDefault(); 
	Chargement(true); 
	var vueId = parseInt( 
		evtForm.target.querySelector("input[name=vueId").value 
	); 
	var elR = evtForm.target.querySelector("span.resultat"); 
	HTML_nettoyer( 
		elR 
	); 
	var _fct = (m, etat) => { 
		elR.appendChild( 
			document.createTextNode( 
				m 
			) 
		); 
		elR.setAttribute( 
			"etat", 
			etat 
		); 
	} 
	var r = window.db.transaction( 
		"vues", 
		"readwrite" 
	).objectStore( 
		"vues" 
	).delete( 
		vueId 
	); 
	r.onsuccess = (evtBDD) => { 
		Vue_MaZ( 
			() => { 
				Vues_MaJ( 
					() => { 
						Chargement(false); 
					}
				)
			} 
		); 
	}; 
	r.onerror = (evtBDD) => { 
		_fct( 
			`Une erreur est survenue lors la suppression de la vue.`, 
			"correct" 
		); 
	}; 
} 

function Vue_apercu(
	evt 
) { 
	evt.preventDefault(); 
	Chargement(true); 
	try { 
		var champs = Vue_formulaireChamps(); 
		var dateFin = (champs.vueDateFin.value!="")?new Date( 
			champs.vueDateFin.value 
		):null; 
		if (dateFin==null) 
			dateFin = new Date(); 
		var dateDebut = (champs.vueDateDebut.value!="")?new Date( 
			champs.vueDateDebut.value 
		):null; 
		if (dateDebut==null) { 
			dateDebut = new Date(); 
			dateDebut.setDate( 
				dateFin.getDate()-365 
			); 
		} 
		var dateInverse = champs.vueDateInverse.checked; 
		var exp = champs.vueExp.value; 
		var expReg = champs.vueExpReg.checked; 
		var expIns = champs.vueExpRegIns.checked; 
		if (champs.vueExpReg.checked) { 
			exp = new RegExp( 
				exp, 
				(expIns)?"i":""  
			); 
		} 
		var secteurs = []; 
		champs.listeSecteurs.querySelectorAll("a").forEach(
			(element) => { 
				if (element.getAttribute("jonction")=="oui") 
					secteurs.push( 
						parseInt( 
							element.getAttribute("secteurId") 
						) 
					); 
			} 
		); 
	} catch(e) { 
		Vue_messageResultat( 
			"Le formulaire n'est pas correctement rempli.", 
			"incorrect" 
		); 
		return Chargement(false); 
	} 
	if (secteurs.length==0) { 
			Vue_apercu_etape2( 
				true, 
				dateDebut, 
				dateFin, 
				dateInverse, 
				exp, 
				expReg
			); 
	} else { 
		window.db.transaction(
			"secteurs", 
			"readonly"
		).objectStore( 
			"secteurs"
		).getAll().onsuccess = (evtBDD) => { 
			var secteursPossibles = evtBDD.target.result; 
			var flux = []; 
			secteursPossibles.forEach( 
				(secteur) => { 
					if (secteurs.indexOf( 
						secteur.id 
					)>-1) 
						flux = flux.concat( 
							secteur.flux 
						); 
				}
			); 
			Vue_apercu_etape2( 
				flux, 
				dateDebut, 
				dateFin, 
				dateInverse, 
				exp, 
				expReg
			); 
		}
	} 
} 

function Vue_apercu_etape2( 
	flux, 
	dateDebut, 
	dateFin, 
	dateInverse, 
	exp, 
	expReg 
) { 
	var elR = document.querySelector("#resultats"); 
	HTML_nettoyer( 
		elR 
	); 
	var liste = document.createElement( 
		"ul" 
	); 
	var _nbre = 0; 
	window.db.transaction(
		"articles", 
		"readonly"
	).objectStore( 
		"articles"
	).index( 
		"articleDate" 
	).openCursor( 
		IDBKeyRange.bound( 
			dateDebut.getTime(), 
			dateFin.getTime() 
		), 
		(dateInverse)?"prev":"next" 
	).onsuccess = (evtBDD) => { 
		var curseur = evtBDD.target.result; 
		_fct = () => { 
			_nbre++; 
			var li = document.createElement( 
				"li" 
			); 
			li.appendChild( 
				document.createTextNode( 
					"articleId°"+curseur.value.id 
					+" ("+curseur.value["flux.titre"]+", " 
					+" "+(new Date(curseur.value.articleDate).toISOString())+") "
					+" : "+((curseur.value.articleTitre=="")?"aucun titre":curseur.value.articleTitre) 
				) 
			); 
			liste.appendChild( 
				li 
			); 
		}; 
		if (curseur) { 
			if (typeof flux!="boolean") 
				if (flux.indexOf(curseur.value.fluxId)<0) 
					return curseur.continue(); 
			if (expReg) { 
				var oui = false; 
				if (exp.test(curseur.value.articleTitre)) 
					oui = oui || true; 
				if (exp.test(curseur.value.articleDescription)) 
					oui = oui || true; 
				if (oui) 
					_fct(); 
			} else { 
				if (exp=="") { 
					_fct(); 
				} else { 
					var oui = false; 
					if (curseur.value.articleTitre.match(exp)!=null) 
						oui = oui || true; 
					if (curseur.value.articleDescription.match(exp)!=null) 
						oui = oui || true; 
					if (oui) 
						_fct(); 
				}
			}
			if (_nbre<15) 
				curseur.continue(); 
		} 
		if (_nbre>=15 || !curseur) 
			Gabarit( 
				"vueTest", 
				{ 
					"nbre": _nbre 
				}, 
				(elG) => { 
					var legend = elG.querySelector("legend"); 
					legend.after( 
						liste 
					); 
					elR.appendChild( 
						elG 
					); 
					Chargement(false); 
				} 
			); 
	}; 	
} 

function Vue_jonctionPrevoir( 
	evt 
) { 
	evt.preventDefault(); 
	var jonction = (evt.target.getAttribute( 
		"jonction" 
	)=="oui")?true:false; 
	evt.target.setAttribute(
		"jonction", 
		(jonction)?"non":"oui"
	); 
} 

function Vue_jonctionEnregistrer( 
	evt 
) { 
	evt.preventDefault(); 
	Chargement(true); 
	var el = evt.target; 
	el.setAttribute( 
		"encours", 
		"oui" 
	); 
	var vueId = parseInt(el.getAttribute( 
		"vueId" 
	)); 
	var secteurId = parseInt(el.getAttribute( 
		"secteurId" 
	)); 
	var jonction = (el.getAttribute( 
		"jonction" 
	)=="oui")?true:false; 
	var objStockage = window.db.transaction( 
		"vues", 
		"readwrite" 
	).objectStore( 
		"vues" 
	); 
	objStockage.get( 
		vueId 
	).onsuccess = (evtBDD) => { 
		var vue = evtBDD.target.result; 
		if (jonction) { 
			delete vue.secteurs[vue.secteurs.indexOf(
				secteurId
			)]; 
			vue.secteurs = vue.secteurs.filter( 
				(element) => { 
					return (element!=undefined); 
				} 
			); 
		} else { 
			vue.secteurs.push( 
				secteurId 
			); 
		} 
		var r = objStockage.put( 
			vue
		)
		r.onsuccess = (ssevtBDD) => { 
			el.setAttribute(
				"jonction", 
				(jonction)?"non":"oui"
			); 
			el.setAttribute(
				"etat", 
				(jonction)?"":"correct"
			); 
			el.setAttribute( 
				"encours", 
				"non" 
			); 
			Chargement(false); 
		}; 
		r.onerror = (ssevtBDD) => { console.log("err", ssevtBDD.target); }; 
	}; 			
} 

function Vue_jonctionsExtraire( 
	vueId,
	jonctions, 
	_SuiteOk 
) { 
	var elP = document.querySelector("#listeSecteurs"); 
	HTML_nettoyer( 
		elP
	); 
	var t = window.db.transaction( 
		"secteurs", 
		"readonly" 
	); 
	jonctions = jonctions; 
	t.oncomplete = _SuiteOk(); 
	t.objectStore( 
		"secteurs" 
	).index( 
		"titre" 
	).openCursor().onsuccess = (evtBDD) => { 
		var curseur = evtBDD.target.result; 
		if (curseur) { 
			Gabarit( 
				"jonction", 
				{ 
					"vueId": vueId, 
					"secteurId": curseur.value.id, 
					"secteurTitre": curseur.value.titre 
				}, 
				(element) => { 
					var el = elP.appendChild( 
						element
					).querySelector("a"); 
					el.setAttribute(
						"etat", 
						(jonctions.indexOf(
							curseur.value.id 
						)>-1)?"correct":""
					); 
					el.setAttribute(
						"jonction", 
						(jonctions.indexOf(
							curseur.value.id 
						)>-1)?"oui":"non"
					); 
					el.addEventListener( 
						"click", 
						(vueId=="nouveau")?Vue_jonctionPrevoir:Vue_jonctionEnregistrer 
					); 
				} 
			); 
			curseur.continue(); 
		} 
	}; 
} 

function Vue_charger(
	vueId 
) { 
	Chargement(true); 
	var elP = document.querySelector("#formulaire form"); 
	var _fct = (m, etat) => { 
		window.location.hash = "formulaire"; 
		var elR = elP.querySelector( 
			"span.resultat" 
		); 
		HTML_nettoyer( 
			elR 
		); 
		elR.setAttribute(
			"etat", 
			etat
		); 
		elR.appendChild( 
			document.createTextNode(
				m 
			) 
		); 
		Chargement(false); 
	} 
	var champs = Vue_formulaireChamps( 
		elP 
	); 
	var r = window.db.transaction( 
		"vues", 
		"readonly" 
	).objectStore( 
		"vues" 
	).get( 
		vueId  
	); 
	r.onsuccess = (evtBDD) => { 
		var vue = evtBDD.target.result || false; 
		if (vue==false) 
			return _fct( 
				`Cet identifiant de vue n'a pas 
				été trouvé (la vue a été supprimée 
				entre temps ?).` , 
				"incorrect" 
			); 
		champs.vueId.value = vue.id; 
		champs.vueTitre.value = vue.titre; 
		champs.vueDateDebut.value = vue.dateDebut; 
		champs.vueDateFin.value = vue.dateFin; 
		champs.vueDateFin.value = vue.dateFin; 
		champs.vueDateInverse.checked = vue.dateInverse; 
		champs.vueExp.value = vue.exp; 
		champs.vueExpReg.checked = vue.expReg; 
		champs.vueExpRegIns.checked = vue.expRegIns; 
		Vue_jonctionsExtraire( 
			vue.id, 
			vue.secteurs, 
			() => { 
				Gabarit( 
					"vueSuppression", 
					{ 
						"vueId": vue.id 
					}, 
					(element) => { 
						element.querySelector("form").addEventListener( 
							"submit", 
							Vue_suppression 
						); 
						elP.after( 
							element 
						); 
						Vue_messageResultat( 
							`La vue a bien été chargée.` , 
							"correct" 
						); 
						Chargement(false); 
					}
				); 
			}
		); 
	}; 
	r.onerror = (evtBDD) => { 
		Vue_messageResultat( 
			`L'extraction de la vue 
			a rencontré une erreur.` , 
			"incorrect" 
		); 
		Chargement(false); 
	}; 
	
}

function Vues_MaJ(
	_SuiteOk 
) { 
	var elP = document.querySelector("#vuesEnregistrees"); 
	HTML_nettoyer( 
		elP 
	); 
	var t = window.db.transaction( 
		"vues", 
		"readonly" 
	); 
	t.oncomplete = (evtBDD) => { 
		if (typeof _SuiteOk=="function") 
			_SuiteOk(); 
	}; 
	t.objectStore( 
		"vues" 
	).index( 
		"titre" 
	).openCursor().onsuccess = (evtBDD) => { 
		var curseur = evtBDD.target.result; 
		if (curseur) { 
			curseur.value.vueId = curseur.value.id; 
			Gabarit( 
				"vueItem", 
				curseur.value, 
				(element) => { 
					element.addEventListener( 
						"click", 
						(evt) => { 
							evt.preventDefault(); 
							Vue_charger( 
								parseInt( 
									evt.target.getAttribute("vueId") 
								) 
							); 
						}
					)
					elP.appendChild( 
						element 
					); 
				} 
			); 
			curseur.continue(); 
		} 
	}; 
}


/*--- Détection et lancement de la page si celle-ci est demandée comme un module ---*/ 
__chargement__ = function() { 
	var r = self.indexedDB.open("Nothus-RSS"); 
	r.onsuccess = (evtBDD) => { 
		window.db = evtBDD.target.result; 
		HTML_titraille(); 
		document.querySelector("#formulaire form.edition input[type=button]").addEventListener( 
			"click", 
			Vue_enregistrer 
		); 
		document.querySelector("#formulaire form.edition").addEventListener( 
			"submit", 
			Vue_apercu 
		); 
		Vues_MaJ(
			() => { 
				Vue_jonctionsExtraire( 
					"nouveau", 
					[], 
					() => { 
						Chargement(false); 
					}
				); 
			}
		); 
	}; 
}

if (document.readyState=="loading") { 
	window.addEventListener( 
		"load", 
		__chargement__ 
	); 
} else { 
	__chargement__(); 
} 


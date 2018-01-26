
function noteMessage( 
	m, 
	etat 
) { 
	var el = document.querySelector( 
		"#note span.resultat" 
	); 
	HTML_nettoyer( 
		el 
	); 
	el.appendChild( 
		document.createTextNode(
			m 
		) 
	); 
	el.setAttribute( 
		"etat", 
		etat 
	); 
} 

function noteTraiter( 
	evtForm 
) { 
	evtForm.preventDefault(); 
	Chargement(true); 
	var form = evtForm.target; 
	var noteId = form.elements.noteId.value; 
	var noteTitre = form.elements.noteTitre.value; 
	var noteContenu = form.elements.noteContenu.value; 
	if ( 
		noteTitre=="" 
	|| 
		noteContenu=="" 
	) { 
		noteMessage( 
			"Le titre ou le contenu ne peuvent rester vierges.", 
			"incorrect" 
		); 
		Chargement(false); 
		return; 
	} 
	if(noteId=="nouveau") { 
		itemEnregistrer( 
			"notes", 
			true, 
			{ 
				"titre": noteTitre, 
				"contenu": noteContenu, 
				"dateCreation": Date.now(), 
				"dateMaJ": Date.now(), 
				"version": 1 
			}, 
			(noteId) => { 
				noteMessage(
					`La note (Id n°${noteId}) a bien été créée.`, 
					"correct" 
				); 
				listeNotes(); 
				suppressionFormNote( 
					noteId, 
					() => { 
						Chargement(false); 
					}
				); 
				form.elements.noteId.value = noteId; 
			}, 
			() => { 
				noteMessage(
					"Impossible de créer la note (un doublon dans les titres ?).", 
					"incorrect" 
				); 
				Chargement(false); 
			}
		); 
	} else { 
		itemMiseAJour( 
			"notes", 
			parseInt(noteId), 
			{ 
				"titre" : noteTitre, 
				"contenu" : noteContenu, 
				"dateMaJ" : Date.now() 
			}, 
			() => { 
				noteMessage(
					"La note a bien été mise à jour.", 
					"correct"  
				); 
				listeNotes(); 
				Chargement(false); 
			}, 
			() => { 
				noteMessage(
					"Impossible de mettre à jour la note (a-t-elle été supprimée depuis ?).", 
					"incorrect" 
				); 
				Chargement(false); 
			}
		); 
	} 
} 

function noteSupprimer( 
	noteId, 
	_SuiteOk, 
	_SuiteKo 
) { 
	itemActionner( 
		"notes", 
		"delete", 
		noteId, 
		_SuiteOk, 
		_SuiteKo 
	); 
} 

function noteAfficher( 
	_args, 
	_SuiteOk 
) { 
	var _argsDefaut = { 
		"id": "nouveau", 
		"dateCreation": Date.now(), 
		"dateMaJ": Date.now(), 
		"titre": "Nouvelle note", 
		"contenu": "", 
	}; 
	for(var cle in _argsDefaut) { 
		_args[cle] = (cle in _args)?_args[cle]:_argsDefaut[cle]; 
	} 
	_args["titre"] = _args["titre"].replace(/"/g, '&#x22;'); 
	_args["contenu"] = _args["contenu"].replace(/"/g, '&#x22;'); 
	_args["dateCreation"] = new Date(_args["dateCreation"]).toISOString(); 
	_args["dateMaJ"] = new Date(_args["dateMaJ"]).toISOString(); 
	Gabarit( 
		"formulaireNote", 
		_args, 
		(element) => { 
			element.querySelector( 
				"textarea" 
			).addEventListener( 
				"change", 
				HTML_textareaLignes
			); 
			element.querySelector("form").addEventListener( 
				"submit", 
				noteTraiter  
			); 
			var elP = document.querySelector("#note"); 
			HTML_nettoyer( 
				elP 
			); 
			elP.appendChild( 
				element 
			); 
			if (_args["id"]!="nouveau") 
				suppressionFormNote( 
					_args["id"] 
				); 
			HTML_titraille(); 
			if (typeof _SuiteOk=="function") 
				_SuiteOk(); 
		}
	); 
} 

function suppressionFormNote( 
	noteId, 
	_SuiteOk, 
	_SuiteKo 
) { 
	var el = document.querySelector( 
		"#noteSuppression" 
	); 
	if (el!=null) { 
		el.setAttribute( 
			"noteId", 
			noteId 
		); 
		return (typeof _SuiteOk=="function")?_SuiteOk():null; 
	} 
	Gabarit( 
		"formulaireSuppressionNote", 
		{ 
			"noteId": noteId 
		}, 
		(element) => { 
			element.addEventListener( 
				"submit", 
				(evtForm) => { 
					evtForm.preventDefault(); 
					Chargement(true); 
					var noteId = parseInt( 
						evtForm.target.getAttribute( 
							"noteId" 
						) 
					); 
					noteSupprimer( 
						noteId, 
						() => { 
							document.querySelector("#noteId").value = "nouveau"; 
							noteMessage( 
								`La note a été supprimée. Son contenu 
								vous est proposé sous la forme d'une 
								nouvelle note prête à l'enregistrement.`, 
								"correct" 
							); 
							listeNotes(); 
							Chargement(false); 
						}, 
						(e) => { 
							noteMessage( 
								`La note n'a pas pu être correctemement 
								supprimée (inaccessible ?).`, 
								"incorrect" 
							); 
							Chargement(false); 
						}
					); 
				} 
			); 
			document.querySelector("#note").appendChild( 
				element 
			); 
			if (typeof _SuiteOk=="function") 
				_SuiteOk(); 
		} 
	); 
}

function lireNote(_args) { 
	var elP = document.querySelector("#note"); 
	HTML_nettoyer( 
		elP 
	); 
	var elE = document.createElement(
		"p"
	); 
	itemExtraire( 
		"notes", 
		parseInt(_args["noteId"]) || false, 
		(note) => { 
			console.log(note); 
			noteAfficher( 
				note, 
				() => { 
					Chargement(false); 
				}
			); 
		}, 
		(erreur) => { 
			elE.setAttribute( 
				"etat", 
				"incorrect" 
			); 
			elE.appendChild( 
				document.createTextNode( 
					`Cette note n'existe pas, 
					n'a pas été trouvé ou aucun 
					identifiant valide n'a été 
					fourni.`  
				) 
			); 
			elP.appendChild( 
				elE 
			); 
			Chargement(false); 
		}  
	); 
}

function nouvelleNote(_args) { 
	Chargement(true); 
	if ("articleId" in _args) { 
		itemExtraire( 
			"articles", 
			parseInt(_args["articleId"]), 
			(article) => { 
				var date = new Date(article.articleDate).toISOString(); 
				var fluxTitre = article["flux.titre"]; 
				nouvelleNote({
					"titre": article.articleTitre, 
					"contenu": [ 
						date, 
						" - ", 
						fluxTitre, 
						"\n", 
						article.articleLien, 
						"\n\n", 
						article.articleDescription 
					].join("") 
				}); 
			}, 
			(erreur) => { 
				nouvelleNote( 
					{} 
				); 
			} 
		); 
		return; 
	} 
	noteAfficher( 
		_args, 
		() => { 
			Chargement(false); 
		} 
	); 
}

function __actions_locales__(
	possibilites, 
	_SuiteOk, 
	_SuiteKo 
) { 
	_SuiteKo = (typeof _SuiteKo=="function")?_SuiteKo:(
		erreur 
	) => {
		console.error("Actions locales automatiques : ", erreur); 
	}; 
	if (document.location.hash=="") 
		return _SuiteKo( 
			"rien à traiter" 
		); 
	var r = document.location.hash.match( 
		/^\#([a-z0-9\_\-\.]+)(\/(.*))?$/i
	); 
	if (r==null) 
		return _SuiteKo("chaîne incorrecte"); 
	if (r[1] in possibilites) { 
		var _tab = {}; 
		if (r[3]!=undefined) { 
			var args = r[3].split(","); 
			args.forEach(
				(element, i, tab) => { 
					tab[i] = element.split(":"); 
				} 
			); 
			try { 
				for(var i=0; i<args.length; i++) { 
					if (!(args instanceof Array)) 
						throw "arguments donnés invalides"; 
					_tab[args[i][0]] = args[i][1]; 
				} 
			} catch(e) { 
				return _SuiteKo(e); 
			} 
		} 
		return _SuiteOk( 
			possibilites[r[1]], 
			_tab 
		); 
	}
	return _SuiteKo( 
		"aucune solution trouvée" 
	); 
} 

function listeNotes() { 
	var elP = document.querySelector( 
		"#listeNotes span.contenuMenu" 
	); 
	HTML_nettoyer( 
		elP 
	); 
	var _fct = (m) => { 
		var el = document.createElement( 
			"p" 
		); 
		el.appendChild( 
			document.createTextNode( 
				`Aucune note n'est enregistrée 
				ou disponible.` 
			) 
		); 
		elP.appendChild( 
			el 
		); 
	}; 
	var nettoyer = false; 
	itemsExtraire( 
		"notes", 
		{ 
			"index": "dateMaJ", 
			"bornes": null, 
			"sens": "prev" 
		}, 
		(evtBDD) => { 
			var c = evtBDD.target.result; 
			if (c) { 
				if (!nettoyer) { 
					nettoyer = true; 
				} 
				c.value.titre = c.value.titre.replace(/"/g, '&#x22;'); 
				c.value.contenu = c.value.contenu.replace(/"/g, '&#x22;'); 
				c.value.dateCreation = new Date(c.value.dateCreation).toISOString(); 
				c.value.dateMaJ = new Date(c.value.dateMaJ).toISOString(); 
				Gabarit( 
					"itemMenu", 
					c.value, 
					(element) => { 
						elP.appendChild( 
							element 
						); 
					} 
				)
				c.continue(); 
			} else { 
				if(!nettoyer) { 
					_fct( 
						`Aucune note n'est enregistrée 
							ou disponible.` 
					); 
				}
			}
		}, 
		(evtBDD) => { 
			_fct( 
				`Impossible d'extraire les notes.` 
			); 
		}
	)
} 

function gabaritsAcceder( 
	nom, 
	cle, 
	valeur  
) { 
	var gabarits = JSON.parse( 
		self.localStorage.getItem("RSS.gabarits") 
	); 
	gabarits[nom] = gabarits[nom] || {}; 
	if (cle==undefined) 
		return gabarits[nom]; 
	gabarits[nom][cle] = valeur; 
	self.localStorage.setItem( 
		"RSS.gabarits", 
		JSON.stringify( 
			gabarits  
		) 
	); 
}

function enregistrerGabarit(
	evtForm 
) { 
	evtForm.preventDefault(); 
	var type = evtForm.target.getAttribute( 
		"gabaritType" 
	); 
	var g = gabaritsAcceder( 
		type, 
		"style", 
		evtForm.target.gabaritStyle.value 
	); 
	if (type=="rapports") { 
		var g = gabaritsAcceder( 
			type, 
			"contenu", 
			evtForm.target.gabaritResume.value 
		); 
	}
	noteMessage( 
		"Le style a été sauvegardé.", 
		"correct" 
	); 
} 

function gabariser(_args) { 
	var type = _args["type"] || "notes"; 
	var g = gabaritsAcceder( 
		type 
	); 
	var textes = { 
		"notes": { 
			"gabaritStyle": g["style"], 
			"type": "notes", 
			"titre": "Styliser la note", 
			"texte": `<p> 
				Lorsque vous exporterez une de vos notes, 
				la feuille de style ci-dessous sera ajouté 
				au fichier généré. Vous pouvez donc choisir 
				les polices, couleurs et certaines conditions 
				grâce aux sélecteurs universelles. 
			</p> 
			<p> 
				<b>Attention</b> : le style CSS définit 
				ci-dessous écrase les valeurs par défaut. 
				Si vous retirez un élément de votre personnalisation, 
				c'est le style par défaut qui sera gardé pour 
				l'affichage. 
			</p>` 
		}, 
		"rapports": {
			"gabaritStyle": g["style"], 
			"type": "rapports", 
			"titre": "Styliser le rapport", 
			"texte": `<p> 
				Lorsque vous générez un rapport, la feuille de style ci-dessous sera ajouté au fichier généré. Vous pouvez donc choisir les polices, couleurs et certaines conditions grâce aux sélecteurs universelles. 
			</p> 
			<p> 
				<b>Attention</b> : le style CSS définit ci-dessous écrase les valeurs par défaut. Si vous retirez un élément de votre personnalisation, c'est le style par défaut qui sera gardé pour l'affichage.<br /> 
				Le style des notes est inséré entre les valeurs par défaut du rapport et le style personnalisé du rapport (soit <i>défaut < note < rapport</i>). 
			</p>` 
		} 
	}; 
	var elAjout = (type!="rapports")? 
		false 
	: 
		Gabarit( 
			"formulaireGabarit_ajout", 
			{ 
				"gabaritResume": g["contenu"] 
			} 
		) 
	; 
	Gabarit( 
		"formulaireGabarit", 
		textes[type] || textes["notes"], 
		(element) => { 
			var elP = document.querySelector( 
				"#note" 
			); 
			HTML_nettoyer( 
				elP 
			); 
			elP.appendChild( 
				element 
			); 
			var form = element.querySelector( 
				"form" 
			); 
			if (elAjout!=false) 
				form.insertBefore( 
					elAjout, 
					form.lastElementChild 
				); 
			form.addEventListener( 
				"submit", 
				enregistrerGabarit 
			); 
			HTML_titraille(); 
			Chargement(false); 
		} 
	); 
} 

function traiterRapport( 
	evtForm 
) { 
	evtForm.preventDefault(); 
	Chargement(true); 
	var notes = []; 
	var champs = evtForm.target.querySelectorAll( 
		'input[type="checkbox"]' 
	).forEach( 
		(element) => { 
			if (element.checked) 
				notes.push(
					parseInt(element.value) 
				); 
		} 
	); 
	gabaritsAcceder( 
		"rapports", 
		"notes", 
		notes 
	); 
	gabaritsAcceder( 
		"rapports", 
		"contenu", 
		evtForm.target.rapportResume.value 
	); 
	publierRapport( 
		notes 
	); 
} 

function publierRapport(
	notes 
) { 
	Chargement(true); 
	var gabR = gabaritsAcceder( 
		"rapports" 
	); 
	if (notes==false) { 
		var elP = Gabarit( 
			"formulaireChoixNotes", 
			gabR, 
			(element) => { 
				return element; 
			}
		); 
		var elListe = elP.querySelector( 
			"#listeNotesRapport" 
		); 
		itemsExtraire( 
			"notes", 
			{ 
				"index": "dateMaJ", 
				"bornes": null, 
				"sens": "prev" 
			}, 
			(evtBDD) => { 
				var c = evtBDD.target.result; 
				if (c) { 
					Gabarit( 
						"formulaireChoixNotes_item", 
						c.value, 
						(element) => { 
							element.querySelector("input").checked = (
								gabR["notes"].indexOf( 
									c.value.id 
								)>-1 
							)? 
								true 
							: 
								false 
							; 
							elListe.appendChild( 
								element 
							); 
						}
					); 
					c.continue(); 
				} else { 
					var elSuperP = document.querySelector( 
						"#note" 
					); 
					HTML_nettoyer( 
						elSuperP 
					); 
					elP.addEventListener( 
						"submit", 
						traiterRapport 
					); 
					elSuperP.appendChild( 
						elP 
					); 
					Chargement(false); 
				} 
				HTML_titraille(); 
			} 
		); 
	} else { 
		window.Export.exporterRapport(
			() => { 
				Chargement(false); 
			}, 
			() => { 
				alert("La génération du rapport a échouée."); 
				Chargement(false); 
			}
		); 
	} 
}

function publierNote( 
	noteId 
) { 
	alert("Fonction encore en cours de développement"); 
	console.log("publier note", noteId); 
} 

function publier(
	_args 
) { 
	var type = _args["type"] || "rapport"; 
	switch(type) { 
		default: 
		case "rapport": 
			publierRapport( 
				false 
			); 
			break; 
		case "note": 
			if (!("noteId" in _args)) {
				window.location.hash = "#publier/type=rapport"; 
			} else { 
				publierNote( 
					parseInt(_args["noteId"]) 
				); 
			} 
			break; 
	} 
	Chargement(false); 
}

function choixLocal() { 
	__actions_locales__( 
		{ 
			"nouvelleNote" : nouvelleNote,
			"lireNote" : lireNote,
			"publier" : publier, 
			"gabariser" : gabariser  
		}, 
		(fct, args) => { 
			fct(args); 
		}, 
		(m) => { 
			HTML_nettoyer( 
				document.querySelector("#note") 
			); 
			Chargement(false); 
		} 
	); 
}

function __chargement__() { 
	window.addEventListener( 
		"hashchange", 
		(evt) => { 
			choixLocal(); 
		}, 
		false 
	); 
	document.querySelector( 
		"#listeNotes .menu" 
	).addEventListener( 
		"click", 
		(evt) => { 
			evt.preventDefault(); 
			var el = document.querySelector( 
				"#listeNotes .contenuMenu" 
			); 
			evt.target.setAttribute( 
				"ouvert", 
				(el.style.display!="flex")?"oui":"non" 
			); 
			el.style.display = (el.style.display!="flex")? 
				"flex" 
			: 
				"none" 
			; 
		} 
	); 
	BDD_ouvrir( 
		() => { 
			listeNotes(); 
			choixLocal(); 
		} 
	); 
}

if (document.readyState=="loading") { 
	window.addEventListener( 
		"load", 
		__chargement__ 
	); 
} else { 
	__chargement__(); 
} 

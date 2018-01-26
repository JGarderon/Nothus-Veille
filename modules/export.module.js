
window.Export = {

	"gabaritRecuperer" : ( 
		URL, 
		_suitePartielle, 
		_SuiteOk 
	) => { 
		var xhr = new XMLHttpRequest(); 
		xhr.onreadystatechange = (evt) => {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				if (xhr.status === 200) { 
					var doc = new DOMParser().parseFromString( 
						xhr.responseText, 
						"text/html" 
					);
					_suitePartielle( 
						doc, 
						_SuiteOk 
					); 
				} else { 
					throw "Impossible de récupérer le gabarit HTML source."; 
				} 
			} 
		} 
		xhr.open( 
			"GET", 
			URL 
		);
		xhr.send(); 
	}, 
	"_lignes" : (txt) => { 
		var elP = document.createElement( 
			"p" 
		); 
		var _tab = txt.split("\n"); 
		_tab.forEach( 
			(element, n, tab) => { 
				elP.appendChild( 
					document.createTextNode( 
						element 
					) 
				); 
				if (n<(_tab.length-1))  
					elP.appendChild( 
						document.createElement( 
							"br" 
						) 
					); 
			} 
		); 
		return elP; 
	}, 
	"remplirNotes" : ( 
		doc, 
		_SuiteOk 
	) => { 
		var gabR = gabaritsAcceder( 
			"rapports" 
		); 
		var _gabR = gabaritsAcceder( 
			"note" 
		); 
		var valeurs = { 
			"#personnalisation" : _gabR["style"]+" "+gabR["style"], 
			"#informations .resume": window.Export._lignes( 
				gabR["contenu"] 
			), 
			"#informations .date": `Crée le ${new Date().toISOString()}` 
		}; 
		for(var cle in valeurs) { 
			var el = doc.querySelector( 
				cle 
			); 
			if (typeof valeurs[cle]=="string") { 
				el.appendChild( 
					doc.createTextNode( 
						valeurs[cle] 
					) 
				); 
			} else { 
				el.appendChild( 
					valeurs[cle] 
				); 
			} 
		} 
		var elP = doc.body.querySelector( 
			"#notes" 
		); 
		var elG = elP.firstElementChild; 
		elG = elG.parentElement.removeChild(
			elG 
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
					var _elG = elG.cloneNode( 
						true 
					); 
					if (
						gabR["notes"].indexOf( 
							c.value.id 
						)==-1
					) 
						return c.continue(); 
					_elG.setAttribute( 
						"noteId", 
						c.value.id 
					); 
					var _tab = { 
						".titre": c.value.titre, 
						".informations": `Crée le ${new Date(c.value.dateMaJ).toISOString()}`, 
						".contenu": window.Export._lignes( 
							c.value.contenu 
						) 
					}; 
					for(var cle in _tab) {
						if (typeof _tab[cle]=="string") { 
							_elG.querySelector( 
								cle 
							).appendChild( 
								doc.createTextNode( 
									_tab[cle] 
								) 
							); 
						} else { 
							_elG.querySelector( 
								cle 
							).appendChild( 
								_tab[cle] 
							); 
						} 
					} 
					elP.appendChild( 
						_elG 
					); 
					c.continue(); 
				} else { 
					window.Export.generer( 
						doc 
					); 
					_SuiteOk(); 
				}
			}, 
			(e) => { 
				throw "Erreur irrécupérable lors de l'extraction des notes :"+e; 
			}
		); 
	}, 
	"generer": (doc) => { 
		( 
			(typeof browser=="undefined")?chrome:browser 
		).downloads.download( 
			{ 
				"url" : window.URL.createObjectURL(
					new Blob( 
						[ 
							new XMLSerializer().serializeToString( 
								doc 
							) 
						], 
						{ 
							"type" : "text/html" 
						}
					) 
				), 
				"filename": `rapport-${new Date().toISOString()}.html` 
			} 
		); 
	}, 
	"exporterRapport" : ( 
		_SuiteOk, 
		_SuiteKo 
	) => { 
		try { 
			window.Export.gabaritRecuperer( 
				"./modules/rapport.export.page.html", 
				window.Export.remplirNotes, 
				_SuiteOk 
			); 
		} catch(e) { 
			if (typeof _SuiteKo=="function") 
				_SuiteKo( 
					e 
				); 
		} 
	} 

}; 

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

function CSV_Inserer(type, formulaire) { 
	Chargement(true); 
	var t = window.db.transaction(
		(type=="flux")?"flux":"secteurs", 
		"readwrite" 
	); 
	var resultats = []; 
	t.onerror = (evtBDD) => { 
		evtBDD.preventDefault(); 
	}; 
	t.oncomplete = (evtBDD) => { 
		var liste = document.createElement( 
			"ul" 
		); 
		resultats.forEach( 
			(element) => { 
				var li = document.createElement( 
					"li" 
				); 
				li.appendChild( 
					document.createTextNode( 
						element[0][0] 
					) 
				); 
				li.setAttribute( 
					"etat", 
					(element[1])?"correct":"incorrect" 
				) 
				liste.appendChild( 
					li 
				); 
			} 
		); 
		var span = formulaire.querySelector( 
			"span.resultat" 
		); 
		HTML_nettoyer( 
			span 
		); 
		span.appendChild( 
			liste  
		); 
		Chargement(false); 
	}; 
	var urlTest = /^http/i; 
	var objStockage = t.objectStore( 
		(type=="flux")?"flux":"secteurs" 
	); 
	formulaire.querySelector("textarea").value.split("\n").forEach(
		(element) => { 
			element = element.trim().split( 
				"\t" 
			); 
			var succes = (evtBDD) => { 
				resultats.push( 
					[element,true] 
				); 
			} 
			var echec = (evtBDD) => { 
				resultats.push( 
					[element, false] 
				); 
			} 
			if (type=="flux") { 
				if (element.length!=4) 
					return echec(false); 
				if (element[0]=="" || element[1]=="") 
					return echec(false); 
				if (!urlTest.test(element[1])) 
					return echec(false); 
				try { 
					element[2] = ((parseInt(element[2]) || 0)==1)? 
						true 
					: 
						false 
					; 
				} catch(e) { 
					element[2] = false; 
				} 
				var ajout = { 
					"site": element[0], 
					"url": element[1], 
					"actif": element[2], 
					"etat": element[3] 
				}; 
			} else { 
				if (element[0]=="") 
					return echec(false); 
				var ajout = {
					"titre": element[0], 
					"flux": [] 
				}; 
			}
			var r = objStockage.add( 
				ajout 
			); 
			r.onsuccess = succes; 
			r.onerror = echec; 
		} 
	); 
} 


function __chargement__() { 

	HTML_titraille(); 

	var r = self.indexedDB.open("Nothus-RSS"); 
	r.onsuccess = (evtBDD) => { 
		window.db = evtBDD.target.result; 

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

		document.querySelector("#CSV_insertion_flux form textarea").addEventListener( 
			"change", 
			HTML_textareaLignes 
		); 

		document.querySelector("#CSV_insertion_flux form").addEventListener( 
			"submit", 
			(evtForm) => { 
				evtForm.preventDefault(); 
				Chargement(true); 
				CSV_Inserer( 
					"flux", 
					evtForm.target 
				); 
			} 
		); 

		document.querySelector("#CSV_insertion_secteurs form textarea").addEventListener( 
			"change", 
			HTML_textareaLignes 
		); 

		document.querySelector("#CSV_insertion_secteurs form").addEventListener( 
			"submit", 
			(evtForm) => { 
				evtForm.preventDefault(); 
				Chargement(true); 
				CSV_Inserer( 
					"secteurs", 
					evtForm.target 
				); 
			} 
		); 
		
		Chargement(false); 

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

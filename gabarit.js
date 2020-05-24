
window.MaJ_page = null; 
function Statistiques_MaJ_Page() { 
	if (window.MaJ_page==null) {
		window.MaJ_page = setInterval(
			Statistiques_MaJ_Page, 
			10000 
		); 
	} 
	var stats = JSON.parse( 
		window.localStorage.getItem( 
			"RSS.statistiques"  
		) 
	); 
	if (stats==null) 
		return; 
	var tab = { 
		"#nbre_flux": "nbreFlux", 
		"#nbre_fluxAttente": "nbreFluxAttente", 
		"#nbre_articles": "nbreArticles", 
	}; 
	for (var cle in tab) { 
		var elP = document.querySelector(cle); 
		if (elP!=null) { 
			while (elP.childNodes.length>0) { 
				elP.childNodes[0].remove(); 
			} 
			var txt = document.createTextNode( 
				(typeof stats[tab[cle]]=="undefined")?"?":stats[tab[cle]] 
			); 
			elP.appendChild(txt); 
		} 
	} 
} 

/*---*/ 

function ExtraireContenuPertinent(doc) { 
	var priorites = [ 
		[ 
			"getElementsByTagName",
			(element) => { return (element.length>0)?true:false; }
		],
		[ 
			"#id",
			(element) => { return (element!=null)?true:false; }
		],
		[ 
			"getElementsByClassName",
			(element) => { return (element.length>0)?true:false; }
		] 
	]; 
	var determinants = {
		"getElementsByTagName": ["article", "content"], 
		"#id": ["page", "blog", "story", "content", "page-root", "page_root"], 
		"getElementsByClassName": ["story", "blog", "article", "content", "contenu", "content", "page_content", "page_article", "page_root", "post"] 
	} 
	var r = {}; 
	for(var fct in determinants) { 
		items = determinants[fct]; 
		r[fct] = items.map( 
			(el_cherche, index, els_cherche) => { 
				if (fct!="#id") { 
					return doc.body[fct](el_cherche); 
				} else { 
					return doc.getElementById(el_cherche); 
				} 
			} 
		); 
	} 
	for (var i=0; i<priorites.length; i++) { 
		var _r = r[priorites[i][0]].filter( 
			priorites[i][1] 
		); 
		if (_r.length>0) 
			return _r; 
	} 
	return false; 
}; 

/*var elC = ExtraireContenuPertinent(); 
if (elC!=false) 
	console.log( 
		elC
	); */

/*---*/ 

function Article_extrait(evt) { 
	Chargement(true); 
	var xhr = new XMLHttpRequest(); 
	xhr.onreadystatechange = () => { 
		if (xhr.readyState === XMLHttpRequest.DONE) { 
			if (xhr.status==200) { 
				try { 
					console.log(xhr.response); 
					var extraits = ExtraireContenuPertinent( 
						new DOMParser().parseFromString( 
							xhr.response, 
							"text/html" 
						) 
					); 
					document.querySelector("#extrait").innerText = extraits[0][0].innerText; 
					console.log(extraits[0][0].outerHTML); 
					document.querySelector("#extrait").style.display = "flex"; 
				} catch(e) { 
					alert("La ressource distante n'a pas pu être traitée correctement."); 
				}
				Chargement(false); 
			} else { 
				alert("La ressource distante n'est pas disponible."); 
				Chargement(false); 
			} 
		} 
	} 
	xhr.open( 
		"GET", 
		evt.target.getAttribute("articleLien") 
	);
	xhr.send(); 
} 

function Article_affichage_lancer() { 
	if (window.Article_intervale==null)
		window.Article_intervale = setInterval( 
			Article_afficher, 
			250 
		); 
}

function Article_affichage_arreter() { 
	clearInterval( 
		window.Article_intervale 
	); 
	window.Article_intervale = null; 
} 

function Articles_ajouter() { 
	Chargement(true); 
	var nbre_max = 50; 
	var _fct_Suite = () => { 
		Article_affichage_lancer(); 
		Chargement(false); 
		window.Article_elA.style.display = "flex"; 
	}; 
	var _fct_Fin = () => { 
		Article_affichage_lancer(); 
		Chargement(false); 
		if (window.Articles.nbreExtrait==0) 
			document.querySelector("#vueActuelle").appendChild( 
				document.createTextNode( 
					": aucun article disponible pour l'instant à l'affichage" 
				) 
			); 
		window.Article_elA.style.display = "none"; 
	}; 
	if (window.vueId!=null) { 
		window.Articles.vueExtraire( 
			vueData = window.vueData, 
			nbre_max = nbre_max, 
			_Suite = _fct_Suite, 
			_Fin = _fct_Fin 
		); 
	} else { 
		window.Articles.extraire( 
			date_debut = null, 
			date_fin = null, 
			date_inverse = true, 
			sources = null, 
			objExp = null, 
			nbre_max = nbre_max, 
			_Suite = _fct_Suite, 
			_Fin = _fct_Fin 
		); 
	}
}

function Article_afficher_preparation(objArticle) { 
	if ( 
		objArticle.articleImageBlob!=="" 
	& 
		objArticle.articleImageBlob!==false 
	) { 
		var blobURL = window.URL.createObjectURL( 
			objArticle.articleImageBlob 
		); 
		objArticle.articleImage = blobURL; 
		window.ImagesBlog[blobURL] = objArticle.articleImageBlob; 
	}; 
	objArticle.infoVues = (objArticle.articleVues.toString()+" vue"+((objArticle.articleVues>1)?"s":"")); 
	objArticle.fluxTitre = objArticle["flux.titre"]; 
	objArticle.articleSuiviEtat = (objArticle.articleSuivi)?"oui":"non"; 
	if (objArticle.articleDescription.length>300) { 
		var txt = objArticle.articleDescription.substr(0,299); 
		txt = txt.replace(/\s+$/g, ''); 
		objArticle.articleDescription = txt+((txt[txt.length-1]==".")?"..":"..."); 
	} else if (objArticle.articleDescription.length==0) { 
		objArticle.articleDescription = "Pas de description."; 
	} 
	objArticle.articleDateAff = new Date(
		objArticle.articleDate 
	).toISOString(); 
	return objArticle; 
} 

function Article_afficher_evenement(objHTML) { 
	try { 
		objHTML.querySelector(".extrait").addEventListener( 
			"click", 
			Article_extrait 
		); 
	} catch(e) {} 
	objHTML.querySelector(".suivi").addEventListener( 
		"click", 
		(evt) => { 
			evt.preventDefault(); 
			evt.target.setAttribute("encours","oui"); 
			var objStockageArticles = window.db.transaction(
				"articles", 
				"readwrite" 
			).objectStore( 
				"articles" 
			); 
			objStockageArticles.get(
				parseInt(evt.target.getAttribute("articleId")) 
			).onsuccess = (evtBDD) => { 
				var objArticle = evtBDD.target.result; 
				objArticle.articleSuivi = (objArticle.articleSuivi)?false:true; 
				objStockageArticles.put( 
					objArticle
				); 
				evt.target.setAttribute(
					"encours", 
					"non" 
				); 
				evt.target.setAttribute(
					"suivi", 
					(objArticle.articleSuivi)?"oui":"non" 
				); 
			} 
		} 
	); 
	objHTML.querySelector("a.note").addEventListener( 
		"click", 
		(evt) => { 
			evt.preventDefault(); 
			window.location.href = evt.target.getAttribute("href"); 
		} 
	); 
	objHTML.querySelector(".titre").querySelector("a.titre").addEventListener( 
		"click", 
		(evt) => { 
			evt.preventDefault(); 
		 	( 
		 		(typeof browser=="undefined")?chrome:browser 
		 	).tabs.create({
				url: evt.target.getAttribute("href") 
			}); 
			var objStockageArticles = window.db.transaction(
				"articles", 
				"readwrite" 
			).objectStore( 
				"articles" 
			); 
			objStockageArticles.get(
				parseInt(evt.target.getAttribute("articleId")) 
			).onsuccess = (evtBDD) => { 
				var objArticle = evtBDD.target.result; 
				objArticle.articleVues = objArticle.articleVues || 0; 
				objArticle.articleVues++; 
				objStockageArticles.put( 
					objArticle
				); 
				objHTML.querySelector(".vues").innerHTML = (objArticle.articleVues.toString()+" vue"+((objArticle.articleVues>1)?"s":"")); 
			} 
		}
	)
	return objHTML; 
}

function Article_afficher() { 
	var objArticle = window.Articles.liste.shift(); 
	if (objArticle==undefined)
		return Article_affichage_arreter(); 
	window.Articles_date_debut = objArticle.articleDate-1000; 
	Gabarit( 
		window.Article_gabarit, 
		Article_afficher_preparation( 
			objArticle 
		), 
		(element) => { 
			window.Article_elP.appendChild( 
				Article_afficher_evenement( 
					element 
				) 
			); 
		} 
	); 
} 

function Vues_choixAfficher() { 
	Chargement(true); 
	var elP = document.querySelector("#choixVue"); 
	var elR = document.querySelector("#choixVue span"); 
	var _fct = (id, titre) => { 
		var lien = document.createElement("a"); 
		lien.appendChild( 
			document.createTextNode( 
				titre 
			) 
		);  
		lien.setAttribute( 
			"href", 
			(id==null)?"./gabarit.html":"?vue="+id 
		); 
		elR.appendChild( 
			lien 
		); 
	}; 
	_fct( 
		null, 
		"(aucune vue)"
	); 
	window.db.transaction( 
		"vues", 
		"readwrite" 
	).objectStore( 
		"vues" 
	).openCursor().onsuccess = (evtBDD) => { 
		var curseur = evtBDD.target.result; 
		if (curseur) { 
			_fct( 
				curseur.value.id, 
				curseur.value.titre 
			); 
			curseur.continue(); 
		} else { 
			elP.style.display = "flex"; 
			Chargement(false); 
		} 
	} 
} 

function Vue_preparer(
	_SuiteOk 
) { 
	if (window.vueId!=null) { 
		var r = window.db.transaction( 
			"vues", 
			"readonly" 
		).objectStore( 
			"vues" 
		).get( 
			window.vueId 
		); 
		r.onsuccess = (evtBDD) => { 
			window.vueData = evtBDD.target.result; 
			var el = document.querySelector("#vueActuelle"); 
			HTML_nettoyer( 
				el 
			); 
			el.appendChild( 
				document.createTextNode( 
					`"${window.vueData.titre}"` 
				) 
			); 
			_SuiteOk(); 
		}; 
		r.onerror = (evtBDD) => { 
			ERREURGENERALE(); 
		}; 
	} else { 
		_SuiteOk(); 
	}
}

function __chargement_gabarit__(evt) { 

	window.vueId = null; 
	window.vueData = null; 

	if (window.location.search!="") { 
		var tab = window.location.search.substr(1).split("&"); 
		for(var i=0; i<tab.length; i++) { 
			var _tab = tab[i].split("="); 
			switch(_tab[0]) { 
				case "vue": 
					window.vueId = parseInt( 
						_tab[1] 
					); 
					break; 
				case "page": 
					return Page_auto( 
						_tab[1] 
					); 
			} 
		} 
	} 

	document.querySelector("#articlesListe article a").addEventListener( 
		"click", 
		(evt) => { 
			evt.preventDefault(); 
			Vues_choixAfficher(); 
		} 
	); 

	document.querySelector("#extrait span.action a").addEventListener( 
		"click", 
		(evt) => { 
			document.querySelector("#extrait").style.display = "none"; 
		} 
	); 

	window.Articles_date_debut = 0; 
	window.Articles_date_fin = null; 

	window.Article_intervale = null; 
	window.Article_elP = document.querySelector("#articlesListe"); 
	window.Article_elA = document.querySelector("#ajout"); 
	window.Article_elA.addEventListener( 
		"click", 
		Articles_ajouter 
	); 
	window.Article_elA.style.display = "none"; 
	window.Article_gabarit = Gabarit_retrouver("article"); 
	var r = window.indexedDB.open(
		"Nothus-RSS" 
	); 
	r.onupgradeneeded = (evtBDD) => { 
		console.log("besoin"); 
	}; 
	r.onerror = (evtBDD) => { 
		console.log("erreur"); 
	}; 
	r.onblocked = (evtBDD) => { 
		console.log("bloqué"); 
	}; 
	r.onsuccess = (evtBDD) => { 
		window.db = evtBDD.target.result; 
		Statistiques_MaJ_Page(); 
		Vue_preparer( 
			() => { 
				Articles_ajouter(); 
			}
		); 
	} 
		
	document.querySelectorAll("header")[0].querySelectorAll("a").forEach(
		(element) => { 
			element.addEventListener(
				"click", 
				Page_traiterlien 
			)
		} 
	); 
}

if (document.readyState=="loading") { 
	window.addEventListener( 
		"load", 
		__chargement_gabarit__ 
	); 
} else { 
	__chargement_gabarit__(); 
} 

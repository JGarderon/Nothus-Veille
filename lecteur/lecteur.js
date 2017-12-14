console.log("ok lecteur.js"); 
console.log("le résultat peut prendre du temps sur un grand jeu de données"); 

window.NbreItemsStockes = 0; 
window.Resultats = []; 

window.Sources = {}; 
function Sources_Maj(_SuiteOk) { 
	window.db.transaction(
		"flux", 
		"readonly"
	).objectStore( 
		"flux"
	).getAll().onsuccess = (evtBDD) => { 
		var sources = evtBDD.target.result; 
		for(var i=0; i<sources.length; i++) { 
			window.Sources[sources[i].id] = sources[i]; 
		} 
		if (typeof _SuiteOk=="function") 
			_SuiteOk(); 
	}; 
}



function Message(message, classe) { 
	while (window.elEtat.firstChild) { 
		window.elEtat.removeChild(window.elEtat.firstChild); 
	} 
	var el = document.createElement("p"); 
	el.innerHTML = message; 
	el.setAttribute( 
		"class", 
		classe 
	); 
	window.elEtat.appendChild( 
		el 
	); 
} 

function Vider(el) { 
	while (el.firstChild) { 
		el.removeChild(
			el.firstChild 
		); 
	} 
	return el; 
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

function Rechercher_test( 
	expression, 
	expression_reguliere, 
	articleTitre, 
	articleDescription, 
	fluxId, 
	flux_restreindre 
) { 
	Message( 
		"recherche en cours...", 
		"recherche" 
	); 
	if (typeof flux_restreindre=="object") 
		if (flux_restreindre.indexOf( 
			fluxId 
		)<0) 
			return false; 
	if (expression_reguliere) { 
		if ( 
			expression.test(articleTitre) 
			|| 
			expression.test(articleDescription)  
		) 
			return true; 
	} else {
		if (
			articleTitre.indexOf(expression)!=-1
			|| 
			articleDescription.indexOf(expression)!=-1
		) 
			return true; 
	} 
} 

function Rechercher_trier(
	date_debut, 
	date_fin 
) { 
	Message( 
		"trie des réponses en cours...", 
		"recherche" 
	); 
	if (date_debut!=null) 
		date_debut = new Date(date_debut); 
	if (date_fin!=null) 
		date_fin = new Date(date_fin); 
	window.Resultats = window.Resultats.filter( 
		(article, index, tableau) => { 
			var r = true; 
			if (date_debut!=null) 
				if (article.article.pubDate-date_debut<0) 
					r = r & false; 
			if (date_fin!=null) 
				if (article.article.pubDate-date_fin>0) 
					r = r & false; 
			return r; 
		}
	); 
	window.Resultats.sort(
		 (a, b) => { 
			return b.article.pubDate - a.article.pubDate; 
		} 
	); 
} 

function Rechercher_afficher( 
	nbreMax 
) { 
	nbreMax = nbreMax || 5; 
	nbreMax = parseInt(nbreMax); 
	if (nbreMax<1) 
		nbreMax = 5; 
	if (nbreMax>window.Resultats.length) 
		nbreMax = window.Resultats.length; 
	var elResultats = document.getElementById("resultats"); 
	elResultats = elResultats.parentElement.removeChild( 
		elResultats 
	); 
	var elGab = Gabarit_retrouver("article"); 
	var i = 0; 
	while (
		(objArticle = window.Resultats.shift())!="undefined" 
		&& 
		i<nbreMax 
	) { 
		var date = (objArticle.article.pubDate!="")?objArticle.article.pubDate.toLocaleString():""; 
		var remplacements = { 
			"infos" : '{{source}}{{date}}{{description}}', 
			"image" : "", 
			"titre": (objArticle.articleTitre!="")?objArticle.articleTitre:"(pas de titre)", 
			"lien": objArticle.article.lienPermanent, 
			"description": (objArticle.articleDescription!="")?'<span class="description">'+objArticle.articleDescription+'</span>':"", 
			"date": (date!="")?'<span class="date">'+date+'</span>':"", 
			"ordre": "" 
		}; 
		if (objArticle.article.image!="") {
			remplacements["image"] = '<span class="image" style="background-image:url({{imageURL}})"></span>'; 
			remplacements["imageURL"] = objArticle.article.image; 
		} 
		if (window.Sources[objArticle["flux.id"]]!=undefined) { 
			remplacements["source"] = '<span class="source"><a href="{{sourceURL}}" target="_blank">{{sourceSite}}</a></span>'; 
			remplacements["sourceSite"] = window.Sources[objArticle["flux.id"]].site; 
			remplacements["sourceURL"] = window.Sources[objArticle["flux.id"]].url; 
		} else { 
			remplacements["source"] = "source inconnue"; 
		} 
		elResultats.appendChild( 
			Gabarit( 
				elGab, 
				remplacements, 
				(element) => { 
					return element; 
				} 
			) 
		); 
		i++; 
	} 
	var elAjouter = document.getElementById("ajouter"); 
	elAjouter.parentElement.insertBefore( 
		elResultats, 
		elAjouter 
	); 
	return i; 
} 

function Rechercher(
	date_debut, 
	date_fin, 
	expression, 
	expression_reguliere, 
	expression_reguliereIM, 
	flux_restreindre 
) { 
	Chargement(true); 
	window.NbreItemsStockes = 0; 
	window.Resultats = []; 
	window.elAjouter.style.display = "none"; 
	var elResultats = document.getElementById("resultats"); 
	while (elResultats.firstChild) { 
		elResultats.removeChild( 
			elResultats.firstChild 
		); 
	} 
	date_debut = date_debut || null; 
	date_fin = date_fin || null; 
	expression = expression || ""; 
	expression_reguliere = expression_reguliere || false; 
	expression_reguliereIM = expression_reguliereIM || false; 
	flux_restreindre = flux_restreindre || false; 
	if (expression_reguliere) 
		expression = new RegExp( 
			expression, 
			(expression_reguliereIM)?"im":"" 
		); 
	var rTitres = window.db.transaction(
		"articles", 
		"readwrite"
	).objectStore( 
		"articles"
	).openCursor().onsuccess = (evtBDD) => { 
		var curseur = evtBDD.target.result; 
		if (curseur) { 
			window.NbreItemsStockes++; 
			if (Rechercher_test(
				expression, 
				expression_reguliere, 
				curseur.value.articleTitre, 
				curseur.value.articleDescription, 
				curseur.value["flux.id"], 
				flux_restreindre 
			)) { 
				curseur.value.article.pubDate = new Date(  
					curseur.value.article.pubDate
				); 
				window.Resultats.push( 
					curseur.value 
				); 
			}
			curseur.continue(); 
		} else { 
			Rechercher_trier( 
				date_debut, 
				date_fin 
			); 
			var i = Rechercher_afficher( 
				10 
			); 
			window.elAjouter.style.display = (i<1)?"none":"block"; 
			Message( 
				Gabarit(
					Gabarit_retrouver("formatResultatsNbre"), 
					{
						"nbreResultats": window.Resultats.length.toString()+" article(s) trouvé(s)" 
					}, 
					(element) => {
						return element; 
					}
				).innerHTML, 
				"resultats" 
			); 
			Chargement(false); 
		}
	}; 

} 

function gerer_bouton_Ajouter(el) { 
	var form = el.getElementsByTagName("form")[0]; 
	form.addEventListener(
		"submit", 
		(evt) => { 
			evt.preventDefault(); 
			Rechercher_afficher(10); 
			el.style.display = ( 
				window.Resultats.length>0 
			)?
				"block" 
			: 
				"none" 
			; 
		} 
	); 
	el.style.display = "none"; 
} 

function gerer_bouton_Sources(el, _SuiteOk) { 
	var Sources = []; 
	window.db.transaction(
		"flux", 
		"readonly"
	).objectStore( 
		"flux"
	).openCursor().onsuccess = (evtBDD) => { 
		var curseur = evtBDD.target.result; 
		if (curseur) { 
			Sources.push(curseur.value); 
			curseur.continue(); 
		} else { 
			Sources.sort((a,b) => {return b.site<a.site; }); 
			for(var i=0; i<Sources.length; i++) { 
				var opt = document.createElement("option"); 
				opt.innerHTML = "("+Sources[i].id+") "+Sources[i].site; 
				opt.setAttribute("value", Sources[i].id); 
				opt.setAttribute("selected",""); 
				el.appendChild(opt); 
			} 
			_SuiteOk(); 
		}
	} 
}

function gerer_formulaire_Recherche(el) { 
	el.addEventListener( 
		"submit", 
		(evtForm) => { 
			evtForm.preventDefault(); 
			if (evtForm.target[6].checked) { 
				var options = evtForm.target[7].options; 
				var options_garde = []; 
				for(var i = 0; i<evtForm.target[7].options.length; i++) { 
					if (options[i].selected) 
						options_garde.push(
							parseInt(options[i].value) 
						) 
				} 
			} else { 
				var options_garde = false; 
			} 
			Rechercher( 
				(evtForm.target[1].value=="")?null:evtForm.target[1].value, 
				(evtForm.target[2].value=="")?null:evtForm.target[2].value, 
				evtForm.target[3].value, 
				evtForm.target[4].checked, 
				evtForm.target[5].checked, 
				options_garde  
			); 
		} 
	);
} 

function gerer_ajouterFlux(evtForm) { 
	evtForm.preventDefault(); 
	var formulaire = evtForm.target
	var elR = formulaire.getElementsByTagName("span")[0]; 
	if (formulaire[0].value=="" || formulaire[1].value=="") { 
		elR.innerHTML = 'Les champs "nom" et "url" ne peuvent pas rester vides.'; 
		elR.setAttribute("etat","erreur"); 
		return; 
	} 
	try { 
		var c = window.db.transaction(
			"flux", 
			"readwrite"
		).objectStore( 
			"flux"
		).put({
			"site": formulaire[0].value, 
	        "url": formulaire[1].value, 
	        "actif": true 
		}); 
		c.onsuccess = (evt) => { 
			Sources_Maj( 
				() => {
					elR.innerHTML = "Le flux a bien été enregistré."; 
					elR.setAttribute("etat","reussite"); 
					formulaire[0].value = ""; 
					formulaire[1].value = ""; 
					elR.setAttribute("etat","erreur"); 
				} 
			); 
		}; 
		c.onerror = (evt) => { 
			elR.innerHTML = (evt.target.error.name=="ConstraintError")? 
				"Cette URL est déjà inscrite dans la base." 
			: 
				"Une erreur est survenue, peut-être vos espace disque est plein." 
			; 
			elR.setAttribute("etat","erreur"); 
		}; 
	} catch(e) { 
		elR.innerHTML = (e.name="DataCloneError")? 
			"Cette URL est déjà inscrite dans la base." 
		: 
			"Une erreur est survenue : "+e.name 
		; 
		elR.setAttribute("etat","erreur"); 
	}
} 

function gerer_modifierFlux(evtForm) { 
	evtForm.preventDefault(); 
	var form = evtForm.target; 
	form.style.opacity = 0.25; 
	var articleId = parseInt(form[0].value); 
	var articleSupp = (form[4].checked)?true:false; 
	if (articleSupp) { 
		var r = window.db.transaction(
			"flux", 
			"readwrite"
		).objectStore( 
			"flux"
		).delete(articleId); 
		r.onsuccess = (evtBDD) => { 
			form.parentElement.removeChild( 
				form 
			); 
		} 
		r.onerror = (evtBDD) => {  
			form.style.opacity = 1; 
			form.getElementsByTagName("span")[0].innerHTML = "Une erreur inconnue est arrivée durant la supression du flux."; 
		} 
	} else { 
		var articleSite = form[1].value; 
		var articleURL = form[2].value; 
		var articleActif = (form[3].checked)?true:false; 
		var r = window.db.transaction(
			"flux", 
			"readwrite"
		).objectStore( 
			"flux"
		).put({
			"id": articleId, 
			"site": articleSite, 
			"url": articleURL, 
			"actif": articleActif 
		}); 
		r.onsuccess = (evtBDD) => { 
			form.style.opacity = 1; 
			form.getElementsByTagName("span")[0].innerHTML = "Le flux a bien été mis à jour."; 
		} 
		r.onerror = (evtBDD) => {  
			form.style.opacity = 1; 
			form.getElementsByTagName("span")[0].innerHTML = "Une erreur inconnue est arrivée durant la mise à jour du flux."; 
		} 
	} 
} 

function gerer_lien_fluxModifier() { 
	Chargement(true); 
	Vider( 
		document.getElementById("resultats_etat")
	); 
	window.elAjouter.style.display = "none"; 
	var elR = Vider( 
		document.getElementById("resultats") 
	); 
	elR.appendChild( 
		Gabarit( 
			Gabarit_retrouver("optionsFlux"), 
			{}, 
			(element) => { 
				var sections = element.getElementsByTagName("section"); 
				var section_ajouterFlux = sections[0]; 
				var form_ajouterFlux = section_ajouterFlux.getElementsByTagName("form")[0]; 
				form_ajouterFlux.addEventListener( 
					"submit", 
					gerer_ajouterFlux 
				)
				return element; 
			} 
		) 
	); 
	var elR_modif = document.getElementById("modifierFlux").getElementsByTagName("div")[0]; 
	window.db.transaction(
		"flux", 
		"readonly" 
	).objectStore( 
		"flux"
	).openCursor().onsuccess = (evtBDD) => { 
		var curseur = evtBDD.target.result; 
		if (curseur) { 
			elR_modif.appendChild( 
				Gabarit( 
					Gabarit_retrouver("modifierFlux"), 
					{
						"id": curseur.value.id, 
						"nom": curseur.value.site, 
						"url": curseur.value.url, 
						"actif": (curseur.value.actif)?"checked":"" 
					}, 
					(element) => { 
						element.getElementsByTagName("form")[0].addEventListener( 
							"submit", 
							gerer_modifierFlux 
						)
						return element; 
					} 
				) 
			); 
			curseur.continue(); 
		} else { 
			Chargement(false); 
		} 
	}; 
} 

function gerer_lien_fluxNettoyer() { 
	if (!confirm("Tous les article non-suivis seront supprimés : êtes-vous sûr de vouloir poursuivre le nettoyage ?")) 
		return; 
	Chargement(true); 
	var y = 0; 
	var objStockage = self.db.transaction("articles", "readwrite").objectStore("articles")
	var r = objStockage.getAll(); 
	r.onsuccess = (evt) => { 
		var articles = evt.target.result; 
		for(var i=0; i<articles.length; i++) { 
			if (!articles[i].suivi) {
				objStockage.delete(articles[i].id); 
				y++; 
			} 
		} 
		objStockage.transaction.oncomplete = function(evtBDD) { 
			window.location.reload(); 
		}; 
	}; 
} 

function gerer_lien_recuperateurEtat() { 
	Chargement(true); 
	browser.runtime.getBackgroundPage().then( 
		(arriereplan) => { 
			Chargement(false); 
			var etat = arriereplan.Poursuite(); 
			if (confirm(
				(etat)? 
					"Poursuite autorisée : la désactiver ?" 
				: 
					"Poursuite non-autorisée : l'activer ?" 
			)) 
				arriereplan.Poursuite( 
					(etat)?false:true 
				); 
		} 
	); 
} 

function gerer_lien_fluxMaJ() { 
	browser.runtime.getBackgroundPage().then( 
		(arriereplan) => { 
			if (confirm("Récupérer des articles peut prendre du temps sans résultat immédiatement visible, confirmez-vous vouloir lancer la procédure ? Celle est normalement automatique.")) 
				arriereplan.Lancer(); 

		} 
	); 
}

function gerer_liens_MenuG() { 
	var liens = document.getElementsByTagName("header")[0].getElementsByTagName("a"); 
	for(var i=0; i<liens.length; i++) { 
		liens[i].addEventListener( 
			"click", 
			(evt) => { 
				evt.preventDefault(); 
				if (evt.target.hasAttribute("action")) { 
					var fct = window[evt.target.getAttribute("action")] || null; 
					if (typeof fct=="function") 
						return fct(); 
				} 
				alert("Cette fonctionnalité n'est pas encore disponible."); 
			} 
		); 
	} 
} 

function Chargement(visible) { 
	document.getElementById("chargement").style.display = (visible)?
		"flex" 
	: 
		"none" 
	; 
} 

window.addEventListener( 
	"load", 
	function() { 
		var r = self.indexedDB.open("Nothus-RSS"); 
		r.onsuccess = (evtBDD) => { 
			window.db = evtBDD.target.result; 
			console.log("!log: base de données ouverte"); 
			Sources_Maj(
				() => { 
					console.log(window.Sources); 
					gerer_liens_MenuG(); 
					window.elEtat = document.getElementById("resultats_etat"); 
					window.elAjouter = document.getElementById("ajouter"); 
					gerer_bouton_Ajouter( 
						window.elAjouter 
					); 
					gerer_bouton_Sources( 
						document.getElementById("recherche").getElementsByTagName("select")[0], 
						function() { 
							gerer_formulaire_Recherche( 
								document.getElementById("recherche").getElementsByTagName("form")[0]
							); 
						} 
					); 
					Rechercher(); 
					Chargement(false); 
				} 
			); 
		};  
	}
); 


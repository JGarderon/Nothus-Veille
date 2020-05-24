
function messageRetour(q, m, params) { 
	var p = document.createElement( 
		"p" 
	); 
	p.appendChild( 
		document.createTextNode(m) 
	); 
	var elP = document.querySelector( 
		q 
	); 
	if (params.etat || false) 
		elP.setAttribute( 
			"etat", 
			params.etat 
		); 
	if (params.nettoyage || false) 
		HTML_nettoyer( 
			elP 
		); 
	elP.appendChild( 
		p 
	); 
} 

function action_ItemsSupprimer(
	evtForm 
) { 
	evtForm.preventDefault(); 
	if (!confirm(
		"Êtes-vous sûr de supprimer tous les items de ce type ?" 
	)) 
		return; 
	var type = evtForm.target.type.value; 
	switch(type) { 
		case "fluxEnregistres": 
			itemsVider(  
				"flux", 
				"clear", 
				(r) => { 
					messageRetour( 
						"#suppressionItems span.reponse", 
						`Plus aucun flux n'existe dans la base.`, 
						{ 
							"etat": "correct", 
							"nettoyage": true 
						} 
					); 
				}, 
				(err) => { 
					messageRetour( 
						"#suppressionItems span.reponse", 
						`Une erreur est survenue lors de la suppression des flux dans la base.`, 
						{ 
							"etat": "incorrect", 
							"nettoyage": true 
						} 
					); 
				} 
			); 
			break; 
		case "articles": 
			itemsVider(  
				"articles", 
				"clear", 
				(r) => { 
					messageRetour( 
						"#suppressionItems span.reponse", 
						`Plus aucun article n'existe dans la base.`, 
						{ 
							"etat": "correct", 
							"nettoyage": true 
						} 
					); 
				}, 
				(err) => { 
					messageRetour( 
						"#suppressionItems span.reponse", 
						`Une erreur est survenue lors de la suppression des articles dans la base.`, 
						{ 
							"etat": "incorrect", 
							"nettoyage": true 
						} 
					); 
				} 
			); 
			break; 
		case "fluxEnAttente": 
			window.localStorage.setItem("RSS.flux.temporaires", {}); 
			messageRetour( 
				"#suppressionItems span.reponse", 
				`Plus aucun flux en attente de validation ou "oublier" n'a été gardé.`, 
				{ 
					"etat": "correct", 
					"nettoyage": true 
				} 
			); 
			break; 

	}
} 

function action_EtatArticles(
	evtForm 
) { 
	evtForm.preventDefault(); 
	if (!confirm(
		"Êtes-vous sûr d'ajouter +1 vue à tous vos articles ?" 
	)) 
		return; 
	var a = 0; 
	var b = 0; 
	var c = 0; 
	var _fct = () => { 
		if (b!=c) 
			return; 
		messageRetour( 
			"#etatArticles span.reponse", 
			(a==b)? 
				`L'opération a intégralement réussie.` 
			: 
				`Une ou plusieurs erreurs sont survenues.` 
			, 
			{ 
				"etat": (a==b)?"correct":"incorrect", 
				"nettoyage": true 
			} 
		); 
	}; 
	messageRetour( 
		"#etatArticles span.reponse", 
		`En cours de réalisation....`, 
		{ 
			"etat": "attente", 
			"nettoyage": true 
		} 
	); 
	BDD_ouvrir( 
		() => { 
			itemsExtraire( 
				"articles", 
				{}, 
				(evt) => { 
					var curseur = evt.target.result; 
					if (curseur) { 
						b++; 
						curseur.value.articleVues++; 
						itemEnregistrer( 
							"articles", 
							false, 
							curseur.value, 
							() => { 
								c++; 
								a++; 
								_fct(); 
							}, 
							() => { 
								c++ 
								_fct(); 
							}
						); 
						curseur.continue(); 
					} 
				}, 
				(err) => { 
					messageRetour( 
						"#etatArticles span.reponse", 
						`Une erreur est survenue : ${err}`, 
						{ 
							"etat": "correct", 
							"nettoyage": true 
						} 
					); 
				} 
			); 
		} 
	); 
} 


function action_EtatFlux(
	evtForm 
) { 
	evtForm.preventDefault(); 
	if (!confirm(
		"Confirmez-vous rendre actif tous vos flux ?" 
	)) 
		return; 
	var a = 0; 
	var b = 0; 
	var c = 0; 
	var _fct = () => { 
		if (b!=c) 
			return; 
		messageRetour( 
			"#etatFlux span.reponse", 
			(a==b)? 
				`L'opération a intégralement réussie.` 
			: 
				`Une ou plusieurs erreurs sont survenues.` 
			, 
			{ 
				"etat": (a==b)?"correct":"incorrect", 
				"nettoyage": true 
			} 
		); 
	}; 
	messageRetour( 
		"#etatFlux span.reponse", 
		`En cours de réalisation....`, 
		{ 
			"etat": "attente", 
			"nettoyage": true 
		} 
	); 
	BDD_ouvrir( 
		() => { 
			itemsExtraire( 
				"flux", 
				{}, 
				(evt) => { 
					var curseur = evt.target.result; 
					if (curseur) { 
						b++; 
						curseur.value.actif = true; 
						itemEnregistrer( 
							"flux", 
							false, 
							curseur.value, 
							() => { 
								c++; 
								a++; 
								_fct(); 
							}, 
							() => { 
								c++ 
								_fct(); 
							}
						); 
						curseur.continue(); 
					} 
				}, 
				(err) => { 
					messageRetour( 
						"#etatFlux span.reponse", 
						`Une erreur est survenue : ${err}`, 
						{ 
							"etat": "correct", 
							"nettoyage": true 
						} 
					); 
				} 
			); 
		} 
	); 
} 

function action_PerteConnexion(r) { 
	alert( 
		"La connexion avec le module a été perdue" 
	); 
} 

function action_RelanceModule(
	evtForm 
) { 
	evtForm.preventDefault(); 
	if (!confirm(
		"Êtes-vous sûr de confirmer la relance ?" 
	)) 
		return; 
	browser.runtime.sendMessage( 
		{
			"type": "relanceModule" 
		} 
	); 
} 

function action_Debug(
	evtForm 
) { 
	evtForm.preventDefault(); 
	if (!confirm(
		"Confirmez-vous l'inversion de l'état du débug ?" 
	)) 
		return; 
	browser.runtime.sendMessage( 
		{
			"type": "debug" 
		} 
	).then( 
		(e) => { 
			DEBUG_etat(
				e.debug 
			); 
			messageRetour( 
				"#accesDebug span.reponse", 
				`Le débug est désormais en état "${e.debug}"`, 
				{ 
					"etat": "correct", 
					"nettoyage": true 
				} 
			); 
		}, 
		action_PerteConnexion 
	); 
} 

function action_FluxExtraire(
	evtForm 
) { 
	evtForm.preventDefault(); 
	if (!confirm(
		"Cnfirmez-vous la récupération forcée des flux ?" 
	)) 
		return; 
	browser.runtime.sendMessage( 
		{
			"type": "flux_extraire" 
		} 
	).then( 
		(e) => { 
			messageRetour( 
				"#recuperationManuelle span.reponse", 
				(e.reponse)? 
					"Les flux ont été récupérés" 
				: 
					"Une erreur interne a été détectée ; vous devriez réinstaller le module" 
				,  
				{ 
					"etat": (e.reponse)?"correct":"incorrect", 
					"nettoyage": true 
				} 
			); 
		}, 
		action_PerteConnexion 
	); 
}

function __chargement__() { 

	HTML_titraille(); 

	document.querySelector("#etatArticles form").addEventListener( 
		"submit", 
		action_EtatArticles 
	); 

	document.querySelector("#etatFlux form").addEventListener( 
		"submit", 
		action_EtatFlux 
	); 

	document.querySelector("#suppressionItems form").addEventListener( 
		"submit", 
		action_ItemsSupprimer 
	); 

	document.querySelector("#recuperationManuelle form").addEventListener( 
		"submit", 
		action_FluxExtraire 
	); 

	document.querySelector("#relanceModule form").addEventListener( 
		"submit", 
		action_RelanceModule 
	); 

	document.querySelector("#accesDebug form").addEventListener( 
		"submit", 
		action_Debug 
	); 

	Chargement(false); 
}

if (document.readyState=="loading") { 
	window.addEventListener( 
		"load", 
		__chargement__ 
	); 
} else { 
	__chargement__(); 
} 

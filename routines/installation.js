
self.Installation = {}; 

self.Installation.Stockages = { 
	"articles": { 
		"_options" : { 
			keyPath: "id", 
			autoIncrement : true 
		}, 
		"_index" : { 
			"flux.id" : { unique: false },
			"fluxId" : { unique: false }, 
			"articleDate" : { unique: false }, 
			"articleId" : { unique: true }, 
			"articleTitre" : { unique: false }, 
			"articleDescription" : { unique: false } 
		}, 
		"_entrees" : [] 
	}, 
	"flux": { 
		"_options" : { 
			keyPath: "id", 
			autoIncrement : true 
		} , 
		"_index" : {
			"site": { unique: false }, 
			"url" : { unique: true }, 
		}, 
		"_entrees" : [ 
			{ 
				"site" : "Le Monde",
				"url" : "http://www.lemonde.fr/rss/une.xml", 
				"actif" : true, 
				"etat" : "HTTP-200" 
			}, 
			{ 
				"site" : "Le Figaro",
				"url" : "http://www.lefigaro.fr/rss/figaro_actualites.xml", 
				"actif" : true, 
				"etat" : "HTTP-200" 
			}, 
			{ 
				"site" : "FranceTV - Informations",
				"url" : "https://www.francetvinfo.fr/titres.rss", 
				"actif" : true, 
				"etat" : "HTTP-200" 
			},  
			{ 
				"site" : "Developpez.com",
				"url" : "https://www.developpez.com/index/rss", 
				"actif" : true, 
				"etat" : "HTTP-200" 
			}, 
			{ 
				"site" : "ZATAZ.com",
				"url" : "https://www.zataz.com/rss/zataz-news.rss", 
				"actif" : true, 
				"etat" : "HTTP-200" 
			} 
		]
	}, 
	"secteurs": {
		"_options" : { 
			keyPath: "id", 
			autoIncrement : true 
		} , 
		"_index" : {
			"titre": { unique: true } 
		}, 
		"_entrees" : [
			{
				"titre" : "Jeu de flux par défaut", 
				"flux" : [1, 2, 3, 4, 5] 
			}, 
			{
				"titre" : "Exemple - Le Monde", 
				"flux" : [1] 
			} 
		] 
	}, 
	"vues": { 
		"_options" : { 
			keyPath: "id", 
			autoIncrement : true 
		} , 
		"_index" : {
			"titre" : { unique: true } 
		}, 
		"_entrees" : [ 
			{ 
				"titre": "Vue d'exemple - Le Monde seul", 
				"dateDebut": null, 
				"dateFin": null, 
				"dateInverse": true, 
				"exp": null, 
				"expReg": false, 
				"expRegIns": false, 
				"secteurs": [2]  
			}
		] 
	}, 
	"journal": {
		"_options" : { 
			keyPath: "id", 
			autoIncrement : true 
		}, 
		"_index" : {}, 
		"_entrees" : [] 
	}, 
	"options": { 
		"_options" : { 
		} , 
		"_index" : {}, 
		"_entrees" : [] 
	}, 
	"ressources": { 
		"_options" : { 
            keyPath: "id", 
            autoIncrement : true 
		} , 
		"_index" : { 
			"fichierNom" : { unique: false },
			"fichierTaille" : { unique: false }, 
			"fichierTypeMIME" : { unique: false }, 
			"fichierFormat" : { unique: false }, 
        	"fichierOrigine" : { unique: true }, 
        	"fichierPath" : { unique: false }, 
       		"fichierDateAjout" : { unique: false }, 
        	"fichierDateModification" : { unique: false } 
		}, 
		"_entrees" : []  
	}, 
	"notes": { 
		"_options" : { 
            keyPath: "id", 
            autoIncrement : true 
		} , 
		"_index" : { 
			"titre" : { unique: true },
			"version" : { unique: false }, 
			"contenu" : { unique: false }, 
			"dateCreation" : { unique: false }, 
			"dateMaJ" : { unique: false } 
		}, 
		"_entrees" : []  
	} 
}; 


self.Installation.demarrage = new (function (nom_bdd) { 
	
	this.nom_bdd = nom_bdd; 

	this.version = undefined; 

	this.installer = (db) => { 
		self.DEBUG_log( 
			"installation.js", 
			"installation" 
		); 
		for (var stockageNom in self.Installation.Stockages) { 
			self.DEBUG_log( 
				"installation.js", 
				`Installation:demande:: ${stockageNom}`
			); 
			var stockageObj = self.Installation.Stockages[stockageNom]; 
			try { 
				var objS = db.createObjectStore( 
					stockageNom, 
					stockageObj._options 
				); 
				if (typeof objS.transaction.oncomplete!="function") 
					objS.transaction.oncomplete = (evtBDD) => { 
						for (var stockageNom in self.Installation.Stockages) { 
							var stockageObj = self.Installation.Stockages[stockageNom]; 
							var _objS = db.transaction( 
								stockageNom, 
								"readwrite" 
							).objectStore( 
								stockageNom 
							); 
							var _entrees = stockageObj._entrees; 
							if (_entrees.length>0) { 
								_entrees.forEach( 
									(entree) => { 
										self.DEBUG_log( 
											"installation.js", 
											`Installation: ${stockageNom} ::entree:: ${entree}`
										); 
										var ajout = _objS.add( 
											entree 
										); 
										ajout.onerror = (evt) => { console.log("erreur", evt); }; 
									} 
								); 
							}; 
						} 
					}; 
					for(var indexNom in stockageObj._index) { 
						try { 
							self.DEBUG_log( 
								"installation.js", 
								`Installation: ${stockageNom} ::index:: ${indexNom}` 
							); 
							var indexOjb = stockageObj._index[indexNom]; 
							objS.createIndex( 
								indexNom, 
								indexNom, 
								indexOjb 
							); 
						} catch(e) { 
							self.DEBUG_log( 
								"installation.js", 
								`Erreur lors de la création d'un index ; err = `, e 
							); 
						}
					} 
			} catch(e) { 
				self.DEBUG_log( 
					"installation.js", 
					`Erreur lors de la création d'une table ; err = `, e 
				); 
			} 
		} 
	}; 

	this.poursuivre = (db) => { 
		try { 
			for(var table in self.Installation.Stockages) { 
				db.transaction(table, "readonly"); 
			} 
			self.DEBUG_log( 
				"installation.js", 
				`le schéma est correct ; 
				poursuite de l'ouverture de la base` 
			); 
			this._SuiteOk( 
				db 
			); 
		} catch(e) { 
			self.DEBUG_log( 
				"installation.js", 
				`le schéma n'est pas correct ; 
				 tentative de mise à jour`
			); 
			db.close(); 
			this.version++; 
			setTimeout( 
				this.ouvrir 
			); 
		} 
	}; 

	this.ouvrir = () => { 
			self.DEBUG_log( 
				"installation.js", 
				`requête d'ouverture ; 
				version ${self.Installation.demarrage.version}` 
			); 
		r = window.indexedDB.open( 
	      self.Installation.demarrage.nom_bdd, 
	      self.Installation.demarrage.version 
	    ); 
	    r.onerror = (evt) => {
	      console.log("erreur"); 
	    }; 
		r.onupgradeneeded = (evt) => { 
			self.DEBUG_log( 
				"installation.js", 
				`besoin de mise à jour détectée ; en cours` 
			); 
			self.Installation.demarrage.installer( 
       			evt.target.result 
     		); 
		}; 
		r.onblocked = (evt) => { 
			self.DEBUG_log( 
				"installation.js", 
				`Une mise à jour de la base est nécessaire 
					pour utiliser cette fonctionnalité. Vous 
					devez fermer toutes les pages ouvertes du module et redémarrer votre 
					navigateur. Si le problème persiste, vous devriez réinstaller le module.` 
			); 
			if (window.db) { 
				try {
					window.db.close(); 
				} catch(e) {} 
			} 
			self.Installation.demarrage.version++; 
			setTimeout( 
				self.Installation.demarrage.ouvrir 
			); 
			self.Installation.demarrage._SuiteKo(); 
		}; 
		r.onsuccess = (evt) => { 
			self.DEBUG_log( 
				"installation.js", 
				"base ouverte et mise à jour" 
			); 
			self.Installation.demarrage.version = parseInt(evt.target.result.version); 
			return self.Installation.demarrage.poursuivre( 
				evt.target.result
			); 
		}; 
	}; 

	this._SuiteOk = () => {}; 

	this._SuiteKo = () => {}; 

})( 
	"Nothus-RSS" 	
); 

self.Installation.BDD_maj = { 
	
	
	"date": Date.now() 
	
	
}; 

self.Installation.objStockage = (nom, mode) => { 
	return self.BDD.transaction( 
		nom, 
		mode
	).objectStore( 
		nom 
	); 
}; 

/*---*/ 

self.Installation.Alarmes = () => { 
	browser.alarms.create( 
		"Recuperation", 
		{ 
		  "delayInMinutes" : 0, 
		  "periodInMinutes" : 1 
		} 
	); 
	browser.alarms.create( 
		"Optimisations", 
		{ 
		  "delayInMinutes" : 0, 
		  "periodInMinutes" : 0.25 
		} 
	); 
}; 

/*---*/ 

self.Installation.demarrage._SuiteOk = (db) => { 

	self.BDD = db; 
	self.DEBUG_log( 
		"installation.js", 
		`base ouverte ; poursuite du démarrage des scripts` 
	); 

	if (self.localStorage.getItem(
		"RSS.statistiques" 
	)==null) { 
		self.localStorage.setItem( 
			"RSS.statistiques", 
			JSON.stringify({}) 
		); 
		self.DEBUG_log( 
			"installation.js", 
			`stockage local pour les statistiques créés ; poursuite du démarrage des scripts` 
		); 
	} 

	self.Installation.Journaliser = (type, niveau, code, message) => { 
		type = type || "inconnu"; 
		niveau = niveau || 0; 
		niveau = parseInt(niveau); 
		code = code || "evenement"; 
		message = message || "Aucun message associé."; 
		date = new Date().toUTCString(); 
		self.Installation.objStockage( 
			"journal", 
			"readwrite" 
		).add({
			"type": type, 
			"niveau": niveau, 
			"code": code, 
			"message": message, 
			"date": date 
		}); 
	}; 

	try { 
		self.Installation.objStockage( 
			"flux",
			"readonly" 
		).openCursor().onsuccess = (evtBDD) => { 
			var curseur = evtBDD.target.result; 
			if (curseur) { 
				var flux = curseur.value; 
				flux.etat = "attente"; 
				flux.actif = true; 
				flux.debug = true; 
				self.Installation.objStockage( 
					"flux",
					"readwrite" 
				).put(
					flux
				); 
				curseur.continue(); 
			} else { 
				self.DEBUG_log( 
					"installation.js", 
					`fonction de débug des versions précédentes terminée` 
				); 
				Flux_extraire(); 
			} 
		}; 
		self.DEBUG_log( 
			"installation.js", 
			`fonction de débug des versions précédentes lancée` 
		); 
	} catch(e) { 
		self.DEBUG_log( 
			"installation.js", 
			`fonction de débug des versions précédentes en erreur`, 
			e 
		); 
	}

	self.Installation.Alarmes(); 
	self.DEBUG_log( 
		"installation.js", 
		`les alarmes sont désormais lancées` 
	); 

}; 

/*---*/ 

self.Installation.demarrage.ouvrir(); 


self.Installation = {}; 
self.Installation.pret = false; 
self.Installation.DEBUG = true; 

self.Installation.Stockages = { 
	"articles": { 
		"_options" : { 
			keyPath: "id", 
			autoIncrement : true 
		} , 
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
				"site" : "LeMonde.fr",
				"url" : "http://www.lemonde.fr/rss/une.xml", 
				"actif" : true, 
				"etat" : "HTTP-200" 
			}, 
			{ 
				"site" : "LeFigaro.fr",
				"url" : "http://www.lefigaro.fr/rss/figaro_actualites.xml", 
				"actif" : true, 
				"etat" : "HTTP-200" 
			}, 
			{ 
				"site" : "BFMTV.com",
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
	} 
}


self.Installation.__installation__ = (_db) => { 
	for (var stockageNom in self.Installation.Stockages) { 
		(self.Installation.DEBUG)?console.log(  
			"Installation:demande::", stockageNom 
		):null; 
		var stockageObj = self.Installation.Stockages[stockageNom]; 
		var objS = _db.createObjectStore( 
			stockageNom, 
			stockageObj._options 
		); 
		if (typeof objS.transaction.oncomplete!="function") 
			objS.transaction.oncomplete = (evtBDD) => { 
				for (var stockageNom in self.Installation.Stockages) { 
					var stockageObj = self.Installation.Stockages[stockageNom]; 
					var _objS = _db.transaction( 
						stockageNom, 
						"readwrite" 
					).objectStore( 
						stockageNom 
					); 
					var _entrees = stockageObj._entrees; 
					if (_entrees.length>0) { 
						_entrees.forEach( 
							(entree) => { 
								(self.Installation.DEBUG)?console.log(  
									"Installation:", stockageNom, "::entree::", entree 
								):null; 
								_objS.add( 
									entree 
								); 
							} 
						); 
					}; 
				} 
			}; 
		for(var indexNom in stockageObj._index) { 
			(self.Installation.DEBUG)?console.log( 
				"Installation:", stockageNom, "::index::", indexNom 
			):null; 
			var indexOjb = stockageObj._index[indexNom]; 
			objS.createIndex( 
				indexNom, 
				indexNom, 
				indexOjb 
			); 
		} 
	}  
}; 

// version inférieure à 1.1 : aucun
// version 1.1 : 2 
self.indexedDB.open("Nothus-RSS", 2).onupgradeneeded = (evtBDD) => { 
	self.Installation.__installation__( 
		evtBDD.target.result 
	); 
}; 
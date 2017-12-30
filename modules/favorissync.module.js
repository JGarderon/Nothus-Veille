
self.FavorisSync = { 
	"BDD": null, 
	"etat": false, 
	"dossiersFavoris": { 
		"racine": ["Nothus-Veille Sync", null], 
		"racine-flux": ["Nothus-Veille Sync/Flux", null, undefined], 
		"racine-articles": ["Nothus-Veille Sync/Articles", null, undefined] 
	}, 
	"favFlux": {}, 
	"favInitier_etape2": function() { 
		console.log(self.FavorisSync.dossiersFavoris); 
		browser.bookmarks.getChildren( 
			self.FavorisSync.dossiersFavoris["racine-flux"][1].id 
		).then(
			(flux) => { 
				var fluxUrls = {}; 
				for (var i=0; i<flux.length; i++) { 
					if (flux[i].type=="bookmark") 
						fluxUrls[flux[i].url] = flux[i].title; 
				} 
				self.FavorisSync.BDD.transaction( 
					"flux", 
					"readonly" 
				).objectStore( 
					"flux" 
				).getAll().onsuccess = (evt) => { 
					var fluxBDD = evt.target.result; 
					var fluxUrlsBDD = {}; 	
					for (var i=0; i<fluxBDD.length; i++) { 
						fluxUrlsBDD[fluxBDD[i].url] = fluxBDD[i]; 
					} 
					console.log(fluxUrlsBDD); 
					for (var cle in fluxUrls) { 
						if (typeof fluxUrlsBDD[cle]=="undefined") 
							self.FavorisSync.BDD.transaction( 
								"flux", 
								"readwrite" 
							).objectStore( 
								"flux" 
							).add({
								"site": fluxUrls[cle], 
								"url": cle, 
								"actif": true, 
								"etat": "HTTP-200" 
							}); 
					}  
				}; 
			} 
		); 
	}, 
	"favInitier": function(_) { 
		if ( 
			self.FavorisSync.dossiersFavoris["racine-flux"][1]!==null 
			&& 
			self.FavorisSync.dossiersFavoris["racine-articles"][1]!==null 
		) { 
			if (self.FavorisSync.etat) 
				return; 
			self.FavorisSync.etat = true; 
			if (typeof self.FavorisSync.favInitier_etape2!="function") 
				return; 
			self.FavorisSync.favInitier_etape2(); 
		} 
		self.FavorisSync.favDossierTrouver( 
			self.FavorisSync.dossiersFavoris["racine"][0], 
			(r) => { 
				self.FavorisSync.dossiersFavoris["racine"][1] = r[0]; 
				self.FavorisSync.dossiersFavoris["racine-flux"][2] = r[0]; 
				self.FavorisSync.favDossierTrouver( 
					self.FavorisSync.dossiersFavoris["racine-flux"][0], 
					(r_flux) => {
						self.FavorisSync.dossiersFavoris["racine-flux"][1] = r_flux[0]; 
						return self.FavorisSync.favInitier(); 
					}, 
					() => { 
						self.FavorisSync.favDossierCreer( 
							self.FavorisSync.dossiersFavoris["racine-flux"][0], 
							self.FavorisSync.dossiersFavoris["racine-flux"][2].id, 
							self.FavorisSync.favInitier 
						); 
					}
				); 
				self.FavorisSync.dossiersFavoris["racine-articles"][2] = r[0]; 
				self.FavorisSync.favDossierTrouver( 
					self.FavorisSync.dossiersFavoris["racine-articles"][0], 
					(r_articles) => {
						self.FavorisSync.dossiersFavoris["racine-articles"][1] = r_articles[0]; 
						return self.FavorisSync.favInitier(); 
					}, 
					() => { 
						self.FavorisSync.favDossierCreer( 
							self.FavorisSync.dossiersFavoris["racine-articles"][0], 
							self.FavorisSync.dossiersFavoris["racine-articles"][2].id, 
							self.FavorisSync.favInitier 
						); 
					}
				); 
			}, 
			() => { 
				self.FavorisSync.favDossierCreer( 
					self.FavorisSync.dossiersFavoris["racine"][0], 
					self.FavorisSync.dossiersFavoris["racine"][1], 
					self.FavorisSync.favInitier 
				) 
			} 
		); 
	}, 
	"favDossierCreer": function (nom, parentId, _SuiteOk) { 
		browser.bookmarks.create({ 
			"title": nom, 
			"type": "folder", 
			"parentId": parentId 
		}).then(
			_SuiteOk 
		); 
	}, 
	"favDossierTrouver": function(nom, _SuiteOk, _SuiteKo) { 
		browser.bookmarks.search({ 
			"title": nom 
		}).then( 
			(evt) => { 
				if (evt.length>0) 
					return _SuiteOk(evt); 
				return _SuiteKo(); 
			} 
		); 
	}, 
	"favTester": function(url, _SuiteOk, _SuiteKo) { 
		browser.bookmarks.search({ 
			"url": url 
		}).then( 
			_SuiteOk, 
			_SuiteKo 
		); 
	}, 
	"favAjouter": function(titre, url, typeRacine, _SuiteOk) { 
		browser.bookmarks.create({ 
			"type": "bookmark", 
			"parentId": self.FavorisSync.dossiersFavoris[typeRacine][1].id, 
			"index": 0, 
			"titre": titre, 
			"url": url 
		}).then( 
			_SuiteOk 
		); 
	} 
}; 



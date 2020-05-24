
self.Optimisations = {}; 

self.Optimisations.Taches = []; 

self.Optimisations.alarmeContinuer = true; 

self.Optimisations.alarmeExecuter = (evtAlarme) => { 
	if (
		self.Optimisations.Taches.length>1
	) 
		(
			(fct, delais, date) => { 
				try { 
					self.DEBUG_log( 
						"optimisations.js / tentative de lancement d'une tâche", 
						fct 
					); 
					if (Date.now()-date>delais) {
						fct(); 
						date = Date.now(); 
					}
				} catch(e) { 
					self.DEBUG_log( 
						"optimisations.js / erreur dans l'exécution d'une tâche", 
						[
							fct, 
							e 
						] 
					); 
					/*self.Installation.Journaliser( 
						type, 
						niveau, 
						code, 
						message
					); */ 
				} finally {
					self.Optimisations.Taches.push([ 
						fct, 
						delais, 
						date 
					]); 
				} 
			} 
		)( 
			...self.Optimisations.Taches.shift() 
		); 
} 

self.Optimisations.alarme = (evtAlarme) => { 
	if ( 
		evtAlarme.name=="Optimisations" 
	& 
		self.Optimisations.alarmeContinuer 
	) { 
		self.DEBUG_log( 
			"optimisations.js", 
			"l'alarme s'est déclenchée" 
		); 
		self.Optimisations.alarmeExecuter(); 
	}
} 

browser.alarms.onAlarm.addListener( 
	self.Optimisations.alarme 
); 

/*---*/ 

self.Optimisations.MaJ_Cache = function (cle, valeur) { 
	var stats = JSON.parse( 
		self.localStorage.getItem( 
			"RSS.statistiques" 
		) 
	); 
	if (stats==null) 
		stats = {}; 
	stats[cle] = valeur; 
	self.localStorage.setItem( 
		"RSS.statistiques", 
		JSON.stringify( 
			stats  
		) 
	); 
}; 

self.Optimisations.nbreFlux = function () { 
	var objS = self.Installation.objStockage( 
		"flux", 
		"readonly" 
	); 
	objS.transaction.oncomplete = (evt) => { 
		self.DEBUG_log( 
			`Optimisations / tâche "nbreFlux" terminée.` 
		); 
	}; 
	objS.count().onsuccess = (evtBDD) => {
		self.Optimisations.MaJ_Cache( 
			"nbreFlux", 
			parseInt(evtBDD.target.result) 
		); 
	}; 
} 
self.Optimisations.Taches.push( 
	[ 
		self.Optimisations.nbreFlux, 
		15000, 
		Date.now() 
	] 
); 

self.Optimisations.nbreArticles = function () { 
	var objS = self.Installation.objStockage( 
		"articles", 
		"readonly" 
	); 
	objS.transaction.oncomplete = (evt) => { 
		self.DEBUG_log( 
			`Optimisations / tâche "nbreArticles" terminée.` 
		); 
	}; 
	objS.count().onsuccess = (evtBDD) => {
		self.Optimisations.MaJ_Cache( 
			"nbreArticles", 
			parseInt(evtBDD.target.result) 
		); 
	}; 
} 
self.Optimisations.Taches.push( 
	[ 
		self.Optimisations.nbreArticles, 
		15000, 
		Date.now() 
	] 
); 

self.Optimisations.nbreFluxAttentes = function () { 
	var nbre = 0; 
	var fluxTmpTous = JSON.parse( 
		self.localStorage.getItem( 
			"RSS.flux.temporaires" 
		) 
	); 
	for (var cle in fluxTmpTous) { 
		if ( 
			!fluxTmpTous[cle].dejaAjoute 
		) 
			nbre++; 
	} 
	self.Optimisations.MaJ_Cache( 
		"nbreFluxAttente", 
		nbre 
	); 
	self.DEBUG_log( 
		`Optimisations / tâche "nbreFluxAttentes" terminée.` 
	); 
} 
self.Optimisations.Taches.push( 
	[ 
		self.Optimisations.nbreFluxAttentes, 
		15000, 
		Date.now() 
	] 
); 

self.Optimisations.Flux = {}; 
self.Optimisations.fluxExtraire = function () { 
	var objS = self.Installation.objStockage( 
		"flux", 
		"readwrite" 
	); 
	objS.transaction.oncomplete = (evt) => { 
		self.DEBUG_log( 
			`Optimisations / tâche "fluxExtraire" terminée.` 
		); 
	}; 
	objS.openCursor().onsuccess = (evtBDD) => {
		var curseur = evtBDD.target.result; 
		if (curseur) { 
			self.Optimisations.Flux[curseur.value.id] = curseur.value.site; 
			curseur.continue(); 
		} 
	}; 
} 
self.Optimisations.Taches.push( 
	[ 
		self.Optimisations.fluxExtraire, 
		59000, 
		Date.now() 
	] 
); 

self.Optimisations.articleFluxTitre = function () { 
	var objS = self.Installation.objStockage( 
		"articles", 
		"readwrite" 
	); 
	objS.transaction.oncomplete = (evt) => { 
		self.DEBUG_log( 
			`Optimisations / tâche "articleFluxTitre" terminée.` 
		); 
	}; 
	objS.openCursor().onsuccess = (evtBDD) => { 
		var curseur = evtBDD.target.result; 
		if (curseur) { 
			var titre = self.Optimisations.Flux[
				curseur.value["flux.id"]
			]; 
			if (titre!=curseur.value["flux.titre"]) { 
				curseur.value["flux.titre"] = titre; 
				self.DEBUG_log( 
					`Optimisations / tâche "articleFluxTitre" :`, 
					curseur.value["flux.titre"],
					titre 
				); 
				objS.put( 
					curseur.value
				); 
			} 
			curseur.continue(); 
		} 
	}; 
} 
self.Optimisations.Taches.push( 
	[ 
		self.Optimisations.articleFluxTitre, 
		59000, 
		Date.now() 
	] 
); 

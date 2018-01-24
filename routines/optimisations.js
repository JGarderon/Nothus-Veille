
self.Optimisations = {}; 

self.Optimisations.Taches = []; 
self.Optimisations.Taches_i = 0; 
self.Optimisations.Taches_realisation = function() { 
	var tab = self.Optimisations.Taches; 
	var i = self.Optimisations.Taches_i; 
	if (typeof tab[i]!="undefined") {
		try { 
			tab[i](); 
		} catch(e) { 
			console.log( 
				`Optimisations / Erreur rencontrée !`, 
				e 
			); 
		} 
		self.Optimisations.Taches_i++; 
	} else { 
		self.Optimisations.Taches_i = 0; 
		setTimeout( 
			self.Optimisations.Taches_realisation, 
			360000 
		); 
	}
}; 


self.Optimisations.Flux = {}; 
self.Optimisations.fluxExtraire = function () { 
	var t = self.Optimisations.db.transaction(
		"flux", 
		"readwrite" 
	); 
	t.oncomplete = (evt) => { 
		self.Optimisations.Taches_realisation(); 
	}; 
	console.log( 
		`Optimisations / tâche "fluxExtraire" terminée.` 
	); 
	t.objectStore( 
		"flux" 
	).openCursor().onsuccess = (evtBDD) => {
		var curseur = evtBDD.target.result; 
		if (curseur) { 
			self.Optimisations.Flux[curseur.value.id] = curseur.value.site; 
			curseur.continue(); 
		} 
	}; 
} 
self.Optimisations.Taches.push(
	self.Optimisations.fluxExtraire 
); 

self.Optimisations.articleFluxTitre = function () { 
	var t = self.Optimisations.db.transaction(
		"articles", 
		"readwrite" 
	); 
	t.oncomplete = (evt) => { 
		console.log( 
			`Optimisations / tâche "articleFluxTitre" terminée.` 
		); 
		self.Optimisations.Taches_realisation(); 
	}; 
	t.objectStore( 
		"articles" 
	).openCursor().onsuccess = (evtBDD) => { 
		var curseur = evtBDD.target.result; 
		if (curseur) { 
			var titre = self.Optimisations.Flux[
				curseur.value["flux.id"]
			]; 
			if (titre!=curseur.value["flux.titre"]) { 
				curseur.value["flux.titre"] = titre; 
				console.log( 
					`Optimisations / tâche "articleFluxTitre" :`, 
					curseur.value["flux.titre"],
					titre 
				); 
				t.objectStore( 
					"articles" 
				).put( 
					curseur.value
				); 
			} 
			curseur.continue(); 
		} 
	}; 
} 
self.Optimisations.Taches.push(
	self.Optimisations.articleFluxTitre 
); 


self.Optimisations.__chargement__ = function () { 
	var r = self.indexedDB.open( 
		"Nothus-RSS", 
		self.BDD_version 
	); 
	r.onsuccess = (event) => {
		self.Optimisations.db = event.target.result; 
		self.Optimisations.Taches_realisation(); 
	}; 
	r.onerror = (event) => { 
		console.log( 
			`Optimisations / La base n'est pas encore prête pour 
			la récupération des flux ; nouvelle tentative dans 
			10 secondes.` 
		); 
		setTimeout( 
			self.Optimisations.__chargement__, 
			10000 
		); 
	}
} 

self.Optimisations.__chargement__(); 

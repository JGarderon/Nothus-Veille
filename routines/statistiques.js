
/*--- Statistiques ---*/ 
self._local_statistique = {}; 

self._local_statistique.DEBUG = true; 

self._local_statistique.MaJ_Cache = function (cle, valeur) { 
	var stats = JSON.parse( 
		self.localStorage.getItem( 
			self._local_statistique.stockageId 
		) 
	); 
	if (stats==null) 
		stats = {}; 
	stats[cle] = valeur; 
	self.localStorage.setItem( 
		self._local_statistique.stockageId, 
		JSON.stringify( 
			stats  
		) 
	); 
} 

self._local_statistique.MaJ_NbreFlux = function (objTache) { 
	self._local_statistique.db.transaction(
		"flux", 
		"readonly" 
	).objectStore( 
		"flux" 
	).count().onsuccess = (evtBDD) => { 
		(self._local_statistique.DEBUG)?console.log( 
			"Statistiques:MaJ_NbreFlux", evtBDD.target.result 
		):null; 
		self._local_statistique.MaJ_Cache( 
			"nbreFlux", 
			parseInt(evtBDD.target.result) 
		); 
	}
} 

self._local_statistique.MaJ_NbreFluxAttente = function (objTache) { 
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
	(self._local_statistique.DEBUG)?console.log( 
		"Statistiques:MaJ_NbreFluxAttente", nbre 
	):null; 
	self._local_statistique.MaJ_Cache( 
		"nbreFluxAttente", 
		nbre 
	); 
} 

self._local_statistique.MaJ_NbreArticles = function(objTache) { 
	self._local_statistique.db.transaction(
		"articles", 
		"readonly" 
	).objectStore( 
		"articles" 
	).count().onsuccess = (evtBDD) => { 
		(self._local_statistique.DEBUG)?console.log( 
			"Statistiques:MaJ_NbreArticles", evtBDD.target.result 
		):null; 
		self._local_statistique.MaJ_Cache( 
			"nbreArticles", 
			parseInt(evtBDD.target.result) 
		); 
	} 
} 

self._local_statistique.Taches_parcourir = function() { 
	self._local_statistique.Taches.forEach(
		(valeur, cle, tab) => { 
			(self._local_statistique.DEBUG)?console.log( 
				"Statistiques:Taches_parcourir", valeur 
			):null; 
			try { 
				if (typeof valeur=="function") 
					valeur({
						"valeur": valeur, 
						"cle": cle, 
						"tab": tab 
					}); 
			} catch(e) {}
		}
	); 
} 

self._local_statistique.MaJ_stats = null; 
self._local_statistique.Taches = []; 
self._local_statistique.stockageId = "RSS.statistiques"; 

if (self.localStorage.getItem(
	self._local_statistique.stockageId 
)==null) 
	self.localStorage.setItem( 
		self._local_statistique.stockageId, 
		JSON.stringify({}) 
	); 

self._local_statistique.Taches.push( 
	self._local_statistique.MaJ_NbreFlux 
); 
self._local_statistique.Taches.push( 
	self._local_statistique.MaJ_NbreFluxAttente 
); 
self._local_statistique.Taches.push( 
	self._local_statistique.MaJ_NbreArticles 
); 

self._local_statistique.__chargement__ = function() { 
	var r = self.indexedDB.open( 
		"Nothus-RSS", 
		self.BDD_version 
	); 
	r.onsuccess = (evtBDD) => { 
		self._local_statistique.db = evtBDD.target.result; 
		self._local_statistique.Taches_parcourir(); 
		if (self._local_statistique.MaJ_stats==null) { 
			self._local_statistique.MaJ_stats = setInterval( 
				self._local_statistique.Taches_parcourir, 
				60000 
			); 
		} 
	} 
	r.onerror = (evtBDD) => { 
		setTimeout(
			self._local_statistique.__chargement__, 
			1000 
		); 
	}
}

self._local_statistique.__chargement__(); 

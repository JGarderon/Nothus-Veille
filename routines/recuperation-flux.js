
self.DEBUG = false; 

self.TravailleurArticleBlob = new Worker( 
	browser.extension.getURL( 
		"./routines/articleBlob.travailleur.js" 
	) 
); 

function objStockage(nom, mode) { 
	return self.db.transaction( 
		nom, 
		mode
	).objectStore( 
		nom 
	); 
} 

function Article_extraire(fluxId, fluxTitre, article) { 
	var lien = detecter_cdata( 
		article.getElementsByTagName("link")[0].innerHTML 
	); 
	var titre = detecter_cdata( 
		article.getElementsByTagName("title")[0].innerHTML 
	); 
	var description = detecter_cdata( 
		article.getElementsByTagName("description")[0].innerHTML 
	); 
	var pubDate = article.getElementsByTagName("pubDate")[0].innerHTML; 
	try { 
		var lienPermanent = detecter_cdata( 
			article.getElementsByTagName("guid")[0].innerHTML
		); 
	} catch(e) { 
		var lienPermanent = lien; 
	} 
	try {
		var image = article.getElementsByTagName("enclosure")[0].getAttribute("url"); 
	} catch(e) { 
		var image = ""; 
	} 
	try {
		var auteur = article.getElementsByTagName("author")[0].getAttribute("url"); 
	} catch(e) { 
		var auteur = ""; 
	} 
	try { 
		articleDate = new Date( 
			pubDate
		).getTime(); 
	} catch(e) { 
		articleDate = null; 
	} 
	var objArticle = { 
		"flux.id": fluxId, 
		"fluxId": fluxId, 
		"flux.titre": fluxTitre, 
		"articleId" : lienPermanent, 
		"articleLien" : lienPermanent, 
		"articleDate" : articleDate, 
		"articleTitre" : titre, 
		"articleDescription" : description, 
		"articleImage": image, 
		"articleImageBlob": "", 
		"articleSuivi": false, 
		"articleVues": 0 
	}; 
	return objArticle; 
} 

function Articles_extraire(fluxId, fluxTitre, doc) { 
	var objArticle = objStockage( 
		"articles", 
		"readwrite" 
	); 
	objArticle.transaction.onerror = (evtBDD) => { 
		evtBDD.preventDefault(); 
		(self.DEBUG)?console.log(
			"Articles:extraire[erreur(1)]->", evtBDD.target  
		):null; 
	}
	doc.querySelectorAll("item").forEach(
		(item) => { 
			try { 
				(self.DEBUG)?console.log(
					"Articles:extraire->", item 
				):null; 
				objArticle.add( 
					Article_extraire( 
						fluxId, 
						fluxTitre, 
						item 
					) 
				).onerror = (evtBDD) => { 
					evtBDD.preventDefault(); 
					(self.DEBUG)?console.log(
						"Articles:extraire[erreur(2)]->", evtBDD.target  
					):null; 
				}; 
			} catch(e) {} 
		} 
	); 
} 

function Flux_recuperer(objFlux, StockageArticles) { 

	var xhr = new XMLHttpRequest(); 
	xhr.onreadystatechange = (evt) => {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if (xhr.status === 200) { 
				(self.DEBUG)?console.log(
					"Flux:recuperer->", objFlux.id 
				):null; 
				Articles_extraire( 
					objFlux.id, 
					objFlux.site, 
					xhr.responseXML 
				); 
			} else { 
				objFlux.actif = false; 
			} 
			objFlux.etat = "HTTP-"+xhr.status.toString(); 
			objStockage( 
				"flux", 
				"readwrite"
			).put( 
				objFlux 
			); 
		} 
	} 
	xhr.open( 
		"GET", 
		objFlux.url 
	);
	xhr.send(); 
}

function Flux_extraire() { 
	if (self.VerrouFlux) 
		return; 
	(self.DEBUG)?console.log(
		"Flux:extraire->démarrage" 
	):null; 
	self.VerrouFlux = true; 
	objStockage( 
		"flux", 
		"readwrite"
	).openCursor().onsuccess = (evt) => { 
		var curseur = evt.target.result;
      	if(curseur) { 
      		try { 
				(self.DEBUG)?console.log(
					"Flux:extraire->", curseur.value 
				):null; 
      			if (curseur.value.actif==true)
	      			Flux_recuperer( 
		      			curseur.value 
		      		); 
	      	} catch(e) { 
	      		console.log("err 1 recuperation-flux.js", e); 
	      	}
      		curseur.continue(); 
      	} else { 
      		self.VerrouFlux = false; 
      	}
	}; 
} 

function Article_blob() { 
	if (self.VerrouArticles) 
		return; 
	(self.DEBUG)?console.log(
		"Article:blob->démarrage" 
	):null; 
	self.VerrouArticles = true; 
	objStockage( 
		"articles", 
		"readonly"
	).openCursor().onsuccess = (evt) => { 
		var curseur = evt.target.result;
		(self.DEBUG)?console.log(
			"Article:blob->", curseur.value 
		):null;
      	if(curseur) { 
      		try { 
      			if (curseur.value.articleImage==="") 
      				return; 
  				if (curseur.value.articleImageBlob==="") 
	      			self.TravailleurArticleBlob.postMessage(
	      				curseur.value 
	      			); 
	      	} catch(e) { 
	      		console.log("err 2 recuperation-flux.js", e); 
	      	}
      		curseur.continue(); 
      	} else { 
      		self.VerrouArticles = false; 
      	}
	}; 
}

function Taches() { 
	Flux_extraire(); 
	Article_blob(); 
}

self.VerrouFlux = false; 
self.VerrouArticles = false; 
self.IntervalDuree = 60000; 
self.IntervalId = null; 

function __chargement_recuperationflux__() { 
	var r = self.indexedDB.open( 
		"Nothus-RSS" 
	); 
	r.onsuccess = (event) => {
		self.db = event.target.result; 
		Flux_extraire(); 
		self.IntervalId = setInterval( 
			Taches, 
			self.IntervalDuree 
		); 
	}; 
	r.onerror = (event) => { 
		console.log("La base n'est pas encore prête pour la récupération des flux ; nouvelle tentative dans 10 secondes."); 
		setTimeout( 
			__chargement_recuperationflux__, 
			10000 
		); 
	}
} 

__chargement_recuperationflux__(); 

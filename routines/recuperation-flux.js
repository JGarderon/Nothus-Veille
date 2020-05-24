

self.Recuperation = {}; 

self.Recuperation.Taches = []; 

self.Recuperation.alarmeContinuer = true; 

self.Recuperation.alarmeExecuter = (evtAlarme) => { 
	if (
		self.Recuperation.Taches.length>1
	) 
		(
			(fct, delais, date) => { 
				try { 
					self.DEBUG_log( 
						"recuperation-flux.js / tentative de lancement d'une tâche", 
						fct 
					); 
					if (Date.now()-date>delais) {
						fct(); 
						date = Date.now(); 
					}
				} catch(e) { 
					self.DEBUG_log( 
						"recuperation-flux.js / erreur dans l'exécution d'une tâche", 
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
					self.Recuperation.Taches.push([ 
						fct, 
						delais, 
						date 
					]); 
				} 
			} 
		)( 
			...self.Recuperation.Taches.shift() 
		); 
} 

self.Recuperation.alarme = (evtAlarme) => { 
	if ( 
		evtAlarme.name=="Recuperation" 
	& 
		self.Recuperation.alarmeContinuer 
	) { 
		self.DEBUG_log( 
			"recuperation-flux.js", 
			"l'alarme s'est déclenchée" 
		); 
		self.Recuperation.alarmeExecuter(); 
	}
} 

browser.alarms.onAlarm.addListener( 
	self.Recuperation.alarme 
); 

/*---*/ 

self.Recuperation.Travailleurs = { 
	"travailleurArticleBlob" : new Worker( 
		(
			(typeof browser=="undefined")?chrome:browser 
		).extension.getURL( 
			"./routines/articleBlob.travailleur.js" 
		) 
	) 
}; 

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
	var objArticle = self.Installation.objStockage( 
		"articles", 
		"readwrite" 
	); 
	objArticle.transaction.onerror = (evtBDD) => { 
		evtBDD.preventDefault(); 
		self.DEBUG_log( 
			"Articles:extraire[erreur(1)]->", evtBDD.target  
		); 
	}
	doc.querySelectorAll("item").forEach(
		(item) => { 
			try { 
				self.DEBUG_log(
					"Articles:extraire->", item 
				); 
				objArticle.add( 
					Article_extraire( 
						fluxId, 
						fluxTitre, 
						item 
					) 
				).onerror = (evtBDD) => { 
					evtBDD.preventDefault(); 
					self.DEBUG_log(
						"Articles:extraire[erreur(2)]->", evtBDD.target  
					); 
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
				self.DEBUG_log(
					"Flux:recuperer->", objFlux.id 
				); 
				Articles_extraire( 
					objFlux.id, 
					objFlux.site, 
					xhr.responseXML 
				); 
			} 
			objFlux.etat = "HTTP-"+xhr.status.toString(); 
			self.Installation.objStockage( 
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
	self.DEBUG_log(
		"Flux:extraire->démarrage" 
	); 
	self.VerrouFlux = true; 
	self.Installation.objStockage( 
		"flux", 
		"readwrite"
	).openCursor().onsuccess = (evt) => { 
		var curseur = evt.target.result;
      	if(curseur) { 
      		try { 
				self.DEBUG_log( 
					"Flux:extraire->", curseur.value 
				); 
      			if (curseur.value.actif==true)
	      			Flux_recuperer( 
		      			curseur.value 
		      		); 
	      	} catch(e) { 
				self.DEBUG_log(
		  			"recuperation-flux.js / Flux_extraire -> erreur", 
		  			e 
	  			); 
	      	}
      		curseur.continue(); 
      	} 
	}; 
} 

self.Recuperation.XHR = []; 
self.Recuperation.XHR_purge = () => { 
	self.Recuperation.XHR = self.Recuperation.XHR.filter( 
		(xhr) => { 
			if (xhr.readyState === XMLHttpRequest.DONE) 
				return false; 
			return true; 
		} 
	); 
}; 

function Article_blob() { 
	self.DEBUG_log( 
		"recuperation-flux.js", 
		"Article:blob-> démarrage" 
	); 
	self.Recuperation.XHR_purge(); 
	self.DEBUG_log( 
		"recuperation-flux.js", 
		"Article:blob-> purge des anciennes requêtes XHR" 
	); 
	self.URL_test = new RegExp(/^http/); 
	self.Installation.objStockage( 
		"articles", 
		"readonly"
	).openCursor().onsuccess = (evt) => { 
		var curseur = evt.target.result;
		self.DEBUG_log( 
			"recuperation-flux.js", 
			"Article:blob-> traitement d'articleId = ", curseur.value.id 
		); 
      	if(curseur) { 
      		var article = curseur.value; 
      		try { 
      			if (article.articleImage==="") 
      				return; 
      			if (typeof article["articleImageBlob"]=="undefined") 
      				article.articleImageBlob = ""; 
  				if ( 
  					article.articleImageBlob==""
  				& 
  					article.articleImageBlob!==false
  				) {
  					var xhr = new XMLHttpRequest(); 
					xhr.responseType = "blob"; 
					xhr.onreadystatechange = () => { 
						if (xhr.readyState === XMLHttpRequest.DONE) { 
							article.articleImageBlob = (xhr.status==200)? 
								xhr.response 
							: 
								false 
							; 
							self.Installation.objStockage( 
								"articles", 
								"readwrite"
							).put( 
								article 
							).onsuccess = () => { 
								self.DEBUG_log( 
									"recuperation-flux.js", 
									"Article:blob-> enregistrement d'articleId = ", article.id 
								); 
							}; 
						} 
					} 
					xhr.open( 
						"GET", 
						article.articleImage  
					);
					xhr.send(); 
					self.Recuperation.XHR.push( 
						xhr 
					); 
					self.DEBUG_log( 
						"recuperation-flux.js", 
						"Article:blob-> XHR enregistré pour l'articleId = ", article.id 
					); 
  				} 
	      	} catch(e) { 
				self.DEBUG_log(
		  			"recuperation-flux.js / Article_blob -> erreur", 
		  			e 
	  			); 
	      	}
      		curseur.continue(); 
      	} 
	}; 
}

/*---*/ 

self.Recuperation.Taches.push( 
	[ 
		Flux_extraire, 
		600000, 
		Date.now() 
	] 
); 

self.Recuperation.Taches.push( 
	[ 
		Article_blob, 
		180000, 
		Date.now() 
	] 
); 

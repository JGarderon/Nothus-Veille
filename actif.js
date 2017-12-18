
browser.browserAction.onClicked.addListener(() =>{ 
	browser.tabs.create({
		url: "./lecteur/lecteur.html"
	});
});

self.fluxInitiaux = [
	{
		"site":"lemonde.fr",
		"url":"http://www.lemonde.fr/rss/une.xml", 
		"actif": true 
	}, 
	{
		"site":"lefigaro.fr",
		"url":"http://www.lefigaro.fr/rss/figaro_actualites.xml", 
		"actif": true 
	}, 
	{
		"site":"bfmtv.com",
		"url":"https://www.francetvinfo.fr/titres.rss", 
		"actif": true 
	}
]; 

self.Taches = []; 

self.Interval = localStorage.getItem("interval") || 60000; 
self.IntervalId = 0; 

self.EnCours = false; 
self.Poursuivre = true; 

function CleSecurite(nbre_pair) { 
	return ( 
		" ".repeat(parseInt(nbre_pair)).split("").map( 
			(element) => { 
				return Math.floor( 
					(1 + Math.random()) * 0x10000
				).toString(16); 
			}
		)
	).join("-"); 
} 

/*--- Gestion des formats Blob d'image ---*/ 
/**/ self.articleBlobEnCours = false; 
/**/ self.articleBlobTravailleur_pret = false; 
/**/ function article_image_blob() { 
/**/     if (typeof self.articleBlobTravailleur=="undefined") { 
/**/        self.articleBlobTravailleur = new Worker( 
/**/            "./articleBlob.travailleur.js" 
/**/        ); 
/**/        self.articleBlobTravailleur.onmessage = (m) => { 
/**/            if (m.data==true) 
/**/                return self.articleBlobTravailleur_pret = true; 
/**/            console.log(m.data); 
/**/        }; 
/**/     } 
/**/     if (self.articleBlobEnCours) 
/**/         return ; 
/**/     self.articleBlobEnCours = true; 
/**/     window.db.transaction( 
/**/         "articles", 
/**/         "readwrite"
/**/     ).objectStore( 
/**/         "articles"
/**/     ).openCursor().onsuccess = (evtBDD) => { 
/**/         var curseur = evtBDD.target.result; 
/**/         if (curseur) { 
/**/             try { 
/**/                 if (typeof curseur.value.article["imageBlob"]=="undefined") 
/**/                     articleBlobTravailleur.postMessage( 
/**/                         curseur.value 
/**/                     ); 
/**/             } catch(e) {
/**/                 return ; 
/**/             }
/**/             curseur.continue(); 
/**/         } else { 
/**/             self.articleBlobEnCours = false; 
/**/         }
/**/     }; 
/**/ } 
/**/ self.Taches.push(
/**/     article_image_blob 
/**/ ); 
/*---*/ 

function Creer(evt) { 
	var db = evt.target.result;
	var objStockage_journal = db.createObjectStore( 
		"journal", 
		{ 
			keyPath: "id", 
			autoIncrement : true 
		}
	); 
	objStockage_journal.add({
		"type": "information",	
		"niveau": 9, 
		"code": "module.installation", 
		"message": "Installation d'une version et lancement initial du module", 
		"date": new Date().toUTCString() 
	}); 
	var objStockage_options = db.createObjectStore( 
		"options", 
		{ 
			keyPath: "id", 
			autoIncrement : true 
		}
	); 
	objStockage_options.add({ 
		"id": "general", 
		"interval": 60000 
	}); 
	var objStockage_flux = db.createObjectStore( 
		"flux", 
		{ 
			keyPath: "id", 
			autoIncrement : true 
		}
	);
	objStockage_flux.createIndex( 
		"site", 
		"site", 
		{ unique: false } 
	); 
	objStockage_flux.createIndex( 
		"url", 
		"url", 
		{ unique: true } 
	);
	objStockage_flux.transaction.oncomplete = function(event) { 
		var objStockage_flux_ajout = db.transaction("flux", "readwrite").objectStore("flux");
		for (var i=0; i<self.fluxInitiaux.length; i++) {
			objStockage_flux_ajout.add( 
				self.fluxInitiaux[i] 
			); 
		}
	} 
    var objStockage_ressources = db.createObjectStore( 
        "ressources", 
        { 
            keyPath: "id", 
            autoIncrement : true 
        }
    );
    objStockage_ressources.createIndex( 
        "fichierNom", 
        "fichierNom", 
        { unique: false } 
    ); 
    objStockage_ressources.createIndex( 
        "fichierTaille", 
        "fichierTaille", 
        { unique: false } 
    ); 
    objStockage_ressources.createIndex( 
        "fichierTypeMIME", 
        "fichierTypeMIME", 
        { unique: false } 
    ); 
    objStockage_ressources.createIndex( 
        "fichierFormat", 
        "fichierFormat", 
        { unique: false } 
    ); 
    objStockage_ressources.createIndex( 
        "fichierOrigine", 
        "fichierOrigine", 
        { unique: true } 
    ); 
    objStockage_ressources.createIndex( 
        "fichierPath", 
        "fichierPath", 
        { unique: false } 
    ); 
    objStockage_ressources.createIndex( 
        "fichierDateAjout", 
        "fichierDateAjout", 
        { unique: false } 
    ); 
    objStockage_ressources.createIndex( 
        "fichierDateModification", 
        "fichierDateModification", 
        { unique: false } 
    ); 
	var objStockage_articles = db.createObjectStore( 
		"articles", 
		{ 
			keyPath: "id", 
			autoIncrement : true 
		}
	);
	objStockage_articles.createIndex( 
		"flux.id", 
		"flux.id", 
		{ unique: false } 
	); 
	objStockage_articles.createIndex( 
		"articleId", 
		"articleId", 
		{ unique: true } 
	); 
	objStockage_articles.createIndex( 
		"articleTitre", 
		"articleTitre", 
		{ unique: false } 
	); 
	objStockage_articles.createIndex( 
		"articleDescription", 
		"articleDescription", 
		{ unique: false } 
	); 
	objStockage_articles.createIndex( 
		"article", 
		"article", 
		{ unique: false } 
	); 
}

/*--- Journal de bord ---*/ 

self.Journal = null; 
function Journal_ouvrir() { 
	self.Journal = self.db.transaction( 
		"journal", 
		"readwrite" 
	).objectStore( 
		"journal" 
	); 
}

function Journaliser(type, niveau, code, message) { 
	type = type || "inconnu"; 
	niveau = niveau || 0; 
	niveau = parseInt(niveau); 
	code = code || "evenement"; 
	message = message || "Aucun message associé."; 
	date = new Date().toUTCString(); 
	self.Journal.add({
		"type": type, 
		"niveau": niveau, 
		"code": code, 
		"message": message, 
		"date": date 
	}); 
} 

/*---*/ 

function realiserTaches() { 
    for(var i=0; i<self.Taches.length; i++) { 
        try { 
            self.Taches[i](); 
        } catch(e) { 
            console.log( 
                "!err: tache n°"+i.toString()+" : "+e.message 
            ); 
        } 
    } 
}

var r = self.indexedDB.open("Nothus-RSS"); 
r.onupgradeneeded = Creer; 
r.onsuccess = function(event) {
	self.db = event.target.result; 
	Journal_ouvrir(); 
	Journaliser("information", 0, "module.demarrage", "Démarrage du script d'arrière plan"); 
	var r_options = self.db.transaction( 
		"options", 
		"readwrite"
	).objectStore( 
		"options" 
	).get("general"); 
	r_options.onsuccess = function(evtBDD) { 
		var optionsG = evtBDD.target.result; 
		self.EnCours = false; 
		self.Taches.push(
			self.Lancer 
		); 
        realiserTaches(); 
		self.IntervalId = setInterval(
			realiserTaches, 
			self.Interval 
		);	
	} 
	r_options.onerror = function() { 
		Journaliser("erreur fatale", 9, "module.demarrage", "Les options générales n'ont pas pu être chargée"); 
		alert("Erreur fatale : merci de réinstaller le module, sa configuration est défectueuse"); 
		console.log("Erreur fatale : merci de réinstaller le module, sa configuration est défectueuse"); 
	}; 
}; 

/*---*/ 

function Poursuite(etat) { 
	if (typeof etat!="undefined") 
		self.Poursuivre = (etat)?true:false; 
	return self.Poursuivre; 
} 

function detecter_cdata(texte) { 
	var r = new RegExp(/^\<\!\[CDATA\[(.*)\]\]\>$/i).exec(texte); 
	r = (r!=null)?r[1]:texte; 
	return r.replace( 
		"&lt;",
		"<" 
	).replace( 
		"&gt;", 
		">" 
	).replace( 
		/<[^>]*>/g,
		"" 
	); 
}

function Article_recuperer_RSS(article) { 
	var lien = article.getElementsByTagName("link")[0].innerHTML; 
	var titre = detecter_cdata( 
		article.getElementsByTagName("title")[0].innerHTML 
	); 
	var description = detecter_cdata( 
		article.getElementsByTagName("description")[0].innerHTML 
	); 
	var pubDate = article.getElementsByTagName("pubDate")[0].innerHTML; 
	try { 
		var lienPermanent = article.getElementsByTagName("guid")[0].innerHTML; 
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
	return { 
		"lien": lien, 
		"titre": titre, 
		"description": description, 
		"pubDate": pubDate, 
		"lienPermanent": lienPermanent, 
		"image": image 
	}; 
}


self.Lancer = function () {
	if (self.EnCours) 
		return ; 
	if (self.Poursuivre!==true) 
		return ; 
	self.EnCours = true; 
	var r = self.db.transaction("flux", "readonly").objectStore("flux").getAll(); 
	r.onerror = (event) => {} 
	r.onsuccess = function(event) { 
		event.target.result.forEach(
			(element) => { 
				if (element["actif"] !== true) 
					return; 
				var xhr = new XMLHttpRequest(); 
				xhr.onreadystatechange = (evt) => {
				if (xhr.readyState === XMLHttpRequest.DONE) {
					if (xhr.status === 200) { 
						var bdd_articles = self.db.transaction("articles", "readwrite").objectStore("articles"); 
						var objArticles = {}; 
						//console.log(xhr.responseXML); 
						var articles = xhr.responseXML.getElementsByTagName("item"); 
						for (var i=0; i<articles.length; i++) { 
							try { 
								var article = Article_recuperer_RSS( 
									articles[i] 
								); 
								objArticles[article["lienPermanent"]] = { 
									"flux.id": element["id"], 
									"articleId" : article["lienPermanent"], 
									"articleTitre" : article["titre"], 
									"articleDescription" : article["description"], 
									"article": {
										"lien": article["lien"], 
										"titre": article["titre"], 
										"description" : article["description"], 
										"pubDate": article["pubDate"], 
										"lienPermanent": article["lienPermanent"], 
										"image": article["image"], 
										"suivi" : false 
									} 
								}; 
							} catch(e) { console.log("récup item flux ko : ", e.message); }
						} 
						var objStockArticles = self.db.transaction( 
							"articles", 
							"readwrite" 
						).objectStore( 
							"articles" 
						); 
						objStockArticles.index( 
							"articleId" 
						).openCursor().onsuccess = (evt) => { 
							var c = evt.target.result; 
							if (c) { 
								if (typeof objArticles[c.value.articleId]!=undefined) 
									delete objArticles[c.value.articleId]; 
								c.continue(); 
							} else { 
								for (var a in objArticles) { 
									objStockArticles.put(objArticles[a]); 
								} 
							}
						}; 
					} else { 
						element["actif"] = false; 
					} 
					element["etat"] = "HTTP-"+xhr.status.toString(); 
					self.db.transaction("flux", "readwrite").objectStore("flux").put(element); 
				} 
				self.EnCours = false; 
			}; 
			xhr.open("GET", element["url"]);
			xhr.send(); 
			}
		); 
	}; 
}; 
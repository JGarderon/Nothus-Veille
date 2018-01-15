

/*function ExtraireContenuPertinent() { 
	var priorites = [ 
		[ 
			"getElementsByTagName",
			(element) => { return (element.length>0)?true:false; }
		],
		[ 
			"#id",
			(element) => { return (element!=null)?true:false; }
		],
		[ 
			"getElementsByClassName",
			(element) => { return (element.length>0)?true:false; }
		] 
	]; 
	var determinants = {
		"getElementsByTagName": ["article", "content"], 
		"#id": ["page", "blog", "story", "content", "page-root", "page_root"], 
		"getElementsByClassName": ["story", "blog", "article", "content", "contenu", "content", "page_content", "page_article", "page_root", "post"] 
	}
	var r = {}; 
	for(var fct in determinants) { 
		items = determinants[fct]; 
		r[fct] = items.map( 
			(el_cherche, index, els_cherche) => { 
				if (fct!="#id") { 
					return document.body[fct](el_cherche); 
				} else { 
					return document.getElementById(el_cherche); 
				} 
			} 
		); 
	} 
	for (var i=0; i<priorites.length; i++) { 
		var _r = r[priorites[i][0]].filter( 
			priorites[i][1] 
		); 
		if (_r.length>0) 
			return _r; 
	} 
	return false; 
}; 

var elC = ExtraireContenuPertinent(); 
if (elC!=false) 
	console.log( 
		elC
	); */

/*---*/ 

self.Taches_actifs = []; 

self.Interval = localStorage.getItem("interval") || 60000; 
self.IntervalId = 0; 

self.EnCours = false; 
self.Poursuivre = true; 


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
/**/ self.Taches_actifs.push(
/**/     article_image_blob 
/**/ ); 
/*---*/ 

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
    for(var i=0; i<self.Taches_actifs.length; i++) { 
        try { 
            self.Taches_actifs[i](); 
        } catch(e) { 
            console.log( 
                "!err: tache n°"+i.toString()+" : "+e.message 
            ); 
        } 
    } 
}

var r = self.indexedDB.open("Nothus-RSS"); 
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
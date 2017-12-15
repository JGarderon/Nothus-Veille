
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

function Creer(evt) { 
  var db = evt.target.result;
  var objStockage_journal = db.createObjectStore( 
    "journal", 
    { 
      keyPath: "id", 
      autoIncrement : true 
    }
  ); 
  var objStockage_options = db.createObjectStore( 
    "options", 
    { 
      keyPath: "id", 
      autoIncrement : true 
    }
  ); 
  objStockage_options.transaction.oncomplete = function(event) { 
    var objStockage_options = db.transaction( 
      "options", 
      "readwrite"
    ).objectStore( 
      "options" 
    );
    objStockage_flux_ajout.add({ 
      "id": "general", 
      "interval": 60000 
    }); 
  } 
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

var r = self.indexedDB.open("Nothus-RSS"); 
r.onupgradeneeded = Creer; 
r.onsuccess = function(event) {
  self.db = event.target.result; 
  var r_options = self.db.transaction( 
    "options", 
    "readwrite"
  ).objectStore( 
    "options" 
  ).get("general"); 
  r_options.onsuccess = function(evtBDD) { 
    var optionsG = evtBDD.target.result; 
    self.EnCours = false; 
    self.Lancer(); 
    self.IntervalId = setInterval(
      self.Lancer, 
      self.Interval 
    );  
  } 
  r_options.onerror = function() { 
    alert("Erreur fatale : merci de réinstaller le module, sa configuration est défectueuse"); 
    console.log("Erreur fatale : merci de réinstaller le module, sa configuration est défectueuse"); 
  }; 
}; 

function Poursuite(etat) { 
  if (typeof etat!="undefined") 
    self.Poursuivre = (etat)?true:false; 
  return self.Poursuivre; 
} 

function detecter_cdata(texte) { 
  var r = new RegExp(/^\<\!\[CDATA\[(.*)\]\]\>$/i).exec(texte); 
  r = (r!=null)?r[1]:texte; 
  return r.replace(/<[^>]*>/g,""); 
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
          self.db.transaction("flux", "readonly").objectStore("flux").put(element); 
				} 
				self.EnCours = false; 
			}; 
			xhr.open("GET", element["url"]);
			xhr.send(); 
	  	}
		); 
	}; 
}; 
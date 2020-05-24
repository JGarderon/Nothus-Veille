

if (self.localStorage.getItem("RSS.DEBUG")==null) 
	self.localStorage.setItem( 
		"RSS.DEBUG", 
		"0" 
	); 

self.DEBUG = self.localStorage.getItem("RSS.DEBUG"); 
self.DEBUG_log = (...args) => { 
	if (self.DEBUG=="1") { 
		browser.runtime.sendMessage({ 
			"type": "debugMessage", 
			"contenu" : args 
		}); 
		console.log(...args); 
	} 
} 

/*---*/ 

self.BDD = null; 

/*---*/ 

self.__CHARGEMENTS__ = []; 

/*---*/ 

self.relanceModule = (delais) => { 
	console.log( 
		"communes.js", 
		"(!) AMORCE DU REDEMARRAGE DU MODULE" 
	); 
	var _fct = (tabs) => { 
		var racine = browser.extension.getURL("./"); 
		tabs.forEach( 
			(tab) => { 
				browser.tabs.get(tab.id).then(
					(infos) => { 
						if (infos.url.indexOf(racine)==0) 
							browser.tabs.sendMessage(
						      infos.id,
						      {
						      	"action" : "alerte", 
						      	"message" : "Attention : une relance est programmée et le module va être prochainement redémarré. La connexion à la base de données va être temporairement perdue." 
						      }
						    ); 
					}
				); 
			} 
		); 
	}; 
	browser.tabs.query( 
		{ 
			currentWindow: true 
		} 
	).then(
		_fct 
	); 
	setTimeout(
		() => { 
			console.log( 
				"communes.js", 
				"(!) REDEMARRAGE IMMEDIAT DU MODULE" 
			); 
			browser.alarms.clearAll(); 
			self.BDD.close(); 
			browser.runtime.reload(); 
		}, 
		delais
	); 
}

/*---*/ 

self.browser = (typeof self.browser=="undefined")?
	self.chrome
: 
	self.browser 
; 

browser.runtime.onInstalled.addListener( 
	(evt) => { 
		browser.tabs.create( 
			{ 
				"url": browser.runtime.getURL( 
					"./bienvenue.html" 
				) 
			} 
		); 
		notifier( 
			`Nothus-Veille : module installé ou mis à jour`, 
			`Votre module a été mis à jour. Les informations mettront peut-être quelques instants à s'afficher.`
		); 
	}
); 

browser.runtime.onUpdateAvailable.addListener(
	(details) => { 
		notifier( 
			`Nothus-Veille : mise à jour urgente - version ${details.version}`, 
			`Une mise à jour du module sera installée d'ici 1 minute. Votre module va être relancé.`
		); 
		relanceModule( 
			60000 
		); 
	}
); 

/*---*/ 

browser.browserAction.onClicked.addListener(() =>{ 
	browser.tabs.create({ 
		url: "/gabarit.html"
	});
});

/*---*/ 

if (self.localStorage.getItem("RSS.flux.temporaires")==null) 
	self.localStorage.setItem("RSS.flux.temporaires", JSON.stringify({})); 

/*---*/ 

function notifier(titre, message) { 
    ( 
    	(typeof browser=="undefined")?chrome:browser 
    ).notifications.create({
        "type": "basic",
        "iconUrl": ( 
        	(typeof browser=="undefined")?chrome:browser 
        ).extension.getURL("/logo.png"),
        "title": titre,
        "message": message 
    });
} 

function TEMPORAIRE_envoi_debug(item) { 
	// pour triage ; cf màj automatique pour OPML 
	// à supprimer pour la version publique 
	xhr = new XMLHttpRequest(); 
	xhr.onreadystatechange  = () => {}; 
	xhr.open( 
		"POST", 
		"http://veille.nothus.fr", 
		true 
	); 
	xhr.setRequestHeader( 
		"Content-Type", 
		"application/x-www-form-urlencoded" 
	); 
	xhr.send( 
		"item="+encodeURIComponent( 
			JSON.stringify( 
				item 
			) 
		) 
	); 
} 

function gerer_action_fluxTmpAjouter(items) { 
	var nbre = 0; 
	var fluxTmpTous = JSON.parse(self.localStorage.getItem( 
		"RSS.flux.temporaires" 
	)); 
	for(var i=0; i<items.length; i++) { 
		var flux = items[i]; 
		if (typeof fluxTmpTous[flux.url]=="undefined") { 
			fluxTmpTous[flux.url] = flux; 
			nbre++; 
		} 
		try { 
			TEMPORAIRE_envoi_debug( 
				items[i]
			); 
		} catch(e) { 
			console.log("TEMPORAIRE_envoi_debug", e); 
		} 
	} 
	self.localStorage.setItem( 
		"RSS.flux.temporaires", 
		JSON.stringify(fluxTmpTous) 
	); 
	return nbre; 
} 

/*---*/ 

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

/*---*/ 

function detecter_cdata(texte) { 
	var r = new RegExp(/\<\!\[CDATA\[(.*)\]\]\>/i).exec(texte); 
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

/*---*/ 

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

/*---*/ 



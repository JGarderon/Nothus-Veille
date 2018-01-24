
// version inférieure à 1.1 : aucun 
// version 1.1 / 1.1.1 : 2 
// version 1.1.2 : 3 
self.BDD_version = 3; 
/*---*/ 

( 
	(typeof browser=="undefined")?chrome:browser 
).browserAction.onClicked.addListener(() =>{ 
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

(
	(typeof browser=="undefined")?chrome:browser 
).runtime.onMessage.addListener((message) => { 
    if (typeof message=="object") 
        switch(message["type"]) { 
            default: 
                break; 
            case "flux_ajouter": 
            	var nbre = gerer_action_fluxTmpAjouter(message["items"]); 
            	if (nbre>0) 
	                return notifier( 
	                    "Nothus-Veille - information", 
	                    (
	                    	(nbre>1)?nbre.toString():"Un"
	                    )+" nouveau"+( 
	                    	(nbre>1)?"x":"" 
	                    )+" flux RSS découverts !" 
	                ); 
                break; 
        }  
}); 

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


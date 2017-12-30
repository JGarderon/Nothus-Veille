console.log( 
	"recherche-flux.js", 
	self 
); 

try { 
	var flux = []; 
	document.querySelectorAll(
		'link[rel~=feed], link[rel~=alternate]:not([rel~=stylesheet])'
	).forEach((element) => { 
		if (element.getAttribute("type")=="application/rss+xml") 
			flux.push({ 
				"titre": [document.title, "-", element.title].join(" "), 
				"url": element.getAttribute("href"), 
				"origine": document.location.href 
			}); 
	}); 
	if (flux.length>0)
		browser.runtime.sendMessage({ 
			"type": "flux_ajouter", 
			"items": flux 
		}); 
} catch(e) { 
	console.log( 
		"recherche-flux.js", 
		"Une erreur a été récupérée", 
		e
	); 
}


console.log( 
	"recherche-flux.js", 
	"fin" 
); 
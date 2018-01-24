
try { 
	var flux = []; 
	document.querySelectorAll(
		'link[rel~=feed], link[rel~=alternate]:not([rel~=stylesheet])'
	).forEach((element) => { 
		if (element.getAttribute("type")=="application/rss+xml") { 
			var url = element.getAttribute("href"); 
			if (/^\/\//.test(url)) { 
				url = "http:"+url; 
			} 
			if (/^\/[^\/]/.test(url)) { 
				var racine = document.location.href.split("/"); 
				url = url.subString(1); 
				url = [ 
					racine[0], 
					racine[1], 
					racine[2], 
					url 
				].join("/"); 
			} 
			flux.push({ 
				"titre": [document.title, "-", element.title].join(" "), 
				"url": url, 
				"origine": document.location.href, 
				"dejaAjoute": false 
			}); 
		} 
	}); 
	if (flux.length>0)
		(
			(typeof browser=="undefined")?chrome:browser 
		).runtime.sendMessage({ 
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

function ImporterOPML(BDD) { 


} 


function ExporterOPML(BDD) { 
	Chargement(true); 
	var doc = document.implementation.createDocument( 
		"", 
		"", 
		null 
	); 
	var contenu = doc.createElement( 
		"opml" 
	); 
	contenu.setAttribute( 
		"version", 
		"2.0" 
	); 
	var entetes = doc.createElement( 
		"head" 
	); 
	_entetes = { 
		"title": "Nothus-Veille - mes flux", 
		"date": new Date().toUTCString() 
	}; 
	for(var cle in _entetes) { 
		var el = document.createElement(cle); 
		el.innerHTML = _entetes[cle]; 
		entetes.appendChild(el); 
	} 
	contenu.appendChild(entetes); 
	var corps = doc.createElement("body"); 
	var _fct = (flux) => { 
		var el = doc.createElement("outline"); 
		el.setAttribute("text",flux.titre); 
		el.setAttribute("description",""); 
		el.setAttribute("htmlUrl",""); 
		el.setAttribute("language",""); 
		el.setAttribute("title",flux.titre); 
		el.setAttribute("type","RSS"); 
		el.setAttribute("version","RSS2"); 
		el.setAttribute("xmlUrl",flux.url); 
		corps.appendChild(el); 
	}; 
	BDD.transaction( 
		"flux", 
		"readonly" 
	).objectStore( 
		"flux" 
	).openCursor().onsuccess = (evt) => { 
		var c = evt.target.result; 
		if (c) { 
			_fct(c.value); 
			c.continue(); 
		} else { 
			contenu.appendChild(corps); 
			doc.appendChild(contenu); 
			browser.downloads.download({ 
				"url": URL.createObjectURL(
					new Blob( 
						[new XMLSerializer().serializeToString(doc)], 
						{type : 'text/opml'} 
					) 
				), 
				"filename" : "Nothus-Veille.opml", 
				"saveAs": true  
			}); 
			Chargement(false); 
		} 
	}; 
}

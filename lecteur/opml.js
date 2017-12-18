
function ImporterOPML(texte, BDD) { 
	var _fct = (elP, flux) => { 
		flux = flux || []; 
		for (var i=0; i<elP.children.length; i++) { 
			if (elP.children[i].hasAttribute("xmlUrl")) { 
				var attributs = elP.children[i].attributes; 
				var atts = { 
					"$type": "flux", 
				}; 
				for(var i=0; i<attributs.length; i++) { 
					atts[attributs[i].name] = attributs[i].value; 
				} 
				flux.push(atts); 
			} 
			if (elP.children[i].children.length>0) 
				ParcoursSimple(elP.children[i], flux); 
		} 
		return flux; 
	}; 
	var doc = new window.DOMParser().parseFromString( 
		texte, 
		"text/xml" 
	);
	var flux = _fct( 
		doc.getElementsByTagName("body")[0] 
	); 
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


/*function ParcoursSimple(elP, flux) { 
	flux = flux || []; 
	for (var i=0; i<elP.children.length; i++) { 
		if (elP.children[i].hasAttribute("xmlUrl"))
			flux.push( 
				{ 
					"_type": "flux", 
					"type": elP.children[i].getAttribute("type"), 
					"titre": elP.children[i].getAttribute("title"), 
					"description": elP.children[i].getAttribute("description"), 
					"version": elP.children[i].getAttribute("version"), 
					"langue": elP.children[i].getAttribute("language"), 
					"siteUrl": elP.children[i].getAttribute("htmlUrl"), 
					"url": elP.children[i].getAttribute("xmlUrl"), 
					"texte": elP.children[i].getAttribute("text") 
				} 
			); 
		if (elP.children[i].children.length>0) 
			ParcoursSimple(elP.children[i], flux); 
	} 
	return flux; 
}

function ParcoursComplexe(elP, hierarchie) { 
	hierarchie = hierarchie || []; 
	for (var i=0; i<elP.children.length; i++) { 
		var item = (elP.children[i].hasAttribute("xmlUrl"))?{ 
			"_type": "flux", 
			"type": elP.children[i].getAttribute("type"), 
			"titre": elP.children[i].getAttribute("title"), 
			"description": elP.children[i].getAttribute("description"), 
			"version": elP.children[i].getAttribute("version"), 
			"langue": elP.children[i].getAttribute("language"), 
			"siteUrl": elP.children[i].getAttribute("htmlUrl"), 
			"url": elP.children[i].getAttribute("xmlUrl"), 
			"texte": elP.children[i].getAttribute("text") 
		}:{ 
			"_type": "categorie", 
			"texte": elP.children[i].getAttribute("text") 
		}; 
		if (elP.children[i].children.length>0) 
			item["_enfants"] = ParcoursComplexe( 
				elP.children[i] 
			); 
		hierarchie.push(
			item 
		); 
	} 
	return hierarchie; 
} */

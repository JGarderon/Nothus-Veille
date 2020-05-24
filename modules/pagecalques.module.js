
function Page_charger(pId, _SuiteOk) { 
	var xhr = new XMLHttpRequest(); 
	xhr.overrideMimeType('text'); 
	xhr.onreadystatechange = (evt) => {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if (xhr.status === 200) { 
				_SuiteOk( 
					new DOMParser().parseFromString( 
						evt.target.responseText, 
						"text/html" 
					) 
				); 
			} else { 
				alert("Cette page n'existe pas !"); 
				window.location.href = "./gabarit.html"; 
			}
		} 
	} 
	xhr.open("GET", "./pages/"+pId+"/index.gabarit.html");
	xhr.send(); 
} 

function Page_traiterlien(evt) { 
	evt.preventDefault(); 
	Page_auto( 
		evt.target.getAttribute("page") 
	); 
}

function Page_traiterentetes(pId) { 
	var doc = self.Pages[pId]; 
	document.title = doc.title; 
	var commun = /commun\.css$/; 
	document.querySelectorAll("link[rel=stylesheet]").forEach( 
		(elementCSS) => { 
			if (commun.test( 
				elementCSS.getAttribute("href") 
			)!=true) 
				elementCSS.parentElement.removeChild( 
					elementCSS 
				); 
		}
	); 
	doc.querySelectorAll("link[rel=stylesheet]").forEach( 
		(elementCSS) => { 
			var elScriptCSS = document.createElement("link"); 
			elScriptCSS.setAttribute( 
				"href", 
				elementCSS.getAttribute("href") 
			); 
			elScriptCSS.setAttribute( 
				"rel", 
				"stylesheet" 
			); 
			document.head.appendChild(elScriptCSS); 
		}
	); 
	var commun = /commun\.js$/; 
	document.querySelectorAll("script[type$=javascript]").forEach( 
		(elementJS) => { 
			if (commun.test( 
				elementJS.getAttribute("src") 
			)!=true) 
				elementJS.parentElement.removeChild( 
					elementJS 
				); 
		}
	); 
	doc.querySelectorAll("script[type$=javascript]").forEach( 
		(elementJS) => { 
			var elScriptJS = document.createElement("script"); 
			elScriptJS.setAttribute( 
				"src", 
				elementJS.getAttribute("src") 
			); 
			elScriptJS.setAttribute( 
				"type", 
				"text/javascript" 
			); 
			document.head.appendChild(
				elScriptJS 
			); 
		}
	); 
	return true; 
} 

function Page_traitercorps(pId) { 
	var doc = self.Pages[pId]; 
	var el_av = document.getElementById("page"); 
	el_av.parentNode.replaceChild(
		doc.getElementById("page").cloneNode(true), 
		page 
	); 
	doc.querySelectorAll("style[type$=html]").forEach( 
		(elementStyleHTML) => { 
			document.body.appendChild( 
				elementStyleHTML 
			); 
		} 
	); 
	return true; 
} 

function Page_auto(pId, _SuiteOk) { 
	Chargement(true); 
	var fct = (pId) => { 
		if (
			Page_traitercorps( 
				pId 
			) 
		&& 
			Page_traiterentetes( 
				pId 
			) 
		) { 
			var event = document.createEvent('UIEvent');
			event.initEvent('pageChargee', true, false);
			setTimeout(() => { window.dispatchEvent(event); }, 100); 
		} 
		if (typeof _SuiteOk=="function") 
			_SuiteOk(); 
	}; 
	if (typeof self.Pages[pId]=="undefined") { 
		Page_charger( 
			pId, 
			(doc) => { 
				self.Pages[pId] = doc; 
				fct(pId); 
			} 
		); 
	} else { 
		fct(pId); 
	}
}
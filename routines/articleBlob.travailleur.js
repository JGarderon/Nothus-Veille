
self.DEBUG = true; 

self.RessourceSauvegarde = false; 

self.Demandes = []; 
self.Interval = 1000; 
self.IntervalId = null; 
self.Requetes = []; 
self.articleUrl_test = new RegExp(/^http/); 

function objStockage(nom, mode) { 
	return self.db.transaction( 
		nom, 
		mode
	).objectStore( 
		nom 
	); 
} 

function articleBlob_enregistrer( 
	objArticle, 
	xhr 
) { 
	objArticle.articleImageBlob = (xhr!=false)? 
		((xhr.status!==200)? 
			false 
		: 
			xhr.response 
		) 
	: 
		false; 
	objStockage( 
		"articles", 
		"readwrite" 
	).put(
		objArticle 
	).onerror = () => {}; 
	try {
		delete self.Requetes[ 
			self.Requetes.indexOf( 
				xhr 
			) 
		]; 
	} catch(e) {} 
	if (xhr.status!==200) 
		return ; 
	if (!self.RessourceSauvegarde) 
		return ; 
	var date = new Date().toUTCString(); 
	self.db.transaction( 
		"ressources", 
		"readwrite" 
	).objectStore( 
		"ressources" 
	).add({ 
		"fichierNom": false, 
		"fichierTaille": xhr.getResponseHeader("content-length"), 
		"fichierTypeMIME": xhr.getResponseHeader("content-type"), 
		"fichierFormat": xhr.response.type, 
		"fichierOrigine": xhr.responseURL, 
		"fichierPath": "/articlesBlob", 
		"fichierDateAjout": date, 
		"fichierDateModification": date, 
		"fichierBlob": xhr.response 
	}); 
} 

function articleBlob_gerer( 
	objArticle  
) { 
	(self.DEBUG)?console.log(
		"ArticleBlob:gerer->", objArticle  
	):null; 
	if (!self.articleUrl_test.test( 
		objArticle.articleImage 
	)) 
		return articleBlob_enregistrer( 
			objArticle, 
			false 
		); 

	var xhr = new XMLHttpRequest(); 
	xhr.responseType = "blob"; 
	xhr.onreadystatechange = () => { 
		if (xhr.readyState === XMLHttpRequest.DONE) {
			articleBlob_enregistrer( 
				objArticle, 
				xhr 
			); 
		} 
	} 
	xhr.open( 
		"GET", 
		objArticle.articleImage  
	);
	xhr.send(); 

	self.Requetes.push( 
		xhr 
	); 

}

self.onmessage = (m) => { 
	self.Demandes.push( 
		m.data 
	); 
}; 

var r = self.indexedDB.open( 
	"Nothus-RSS" 
); 
r.onsuccess = function(event) {
	self.db = event.target.result; 
	self.IntervalId = setInterval( 
		() => { 
			if (self.Demandes.length>0) 
				articleBlob_gerer( 
					self.Demandes.shift()
				); 
		}, 
		self.Interval 
	); 
}; 

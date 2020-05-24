
self.Dialogues = {}; 

self.Dialogues.relanceModule = (
	message, 
	expediteur, 
	destinataire 
) => { 
	self.relanceModule( 
		0 
	); 
}; 

self.Dialogues.Debug = (
	message, 
	expediteur, 
	destinataire 
) => { 
	self.DEBUG = (self.DEBUG=="1")?"0":"1"; 
	self.localStorage.setItem( 
		"RSS.DEBUG", 
		self.DEBUG 
	); 
	destinataire({ 
		"debug": self.DEBUG 
	}); 
}; 

self.Dialogues.FluxExtraire = (
	message, 
	expediteur, 
	destinataire 
) => { 
	try { 
		Flux_extraire(); 
		var r = true; 
	} catch(e) { 
		var r = false; 
	} 
	destinataire({ 
		"reponse": r 
	}); 
}; 

browser.runtime.onMessage.addListener( 
	(message, expediteur, destinataire) => { 
		if (typeof message=="object") 
			switch(message["type"]) { 
				case "relanceModule": 
					self.Dialogues.relanceModule( 
						message, 
						expediteur, 
						destinataire 
					); 
					break; 
				case "debug": 
					self.Dialogues.Debug( 
						message, 
						expediteur, 
						destinataire 
					); 
					break; 
				case "flux_extraire": 
					self.Dialogues.FluxExtraire( 
						message, 
						expediteur, 
						destinataire 
					); 
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
	} 
); 


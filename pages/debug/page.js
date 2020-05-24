function OuvertureSure(nom_bdd) { 
	this._log = (m) => { 
		console.log(m); 
	}; 
	this.schema_bdd = {}; 
	this.nom_bdd = nom_bdd; 
	this.version = undefined; 
	this.installer = (db) => { console.log("installation"); 
		for(var table in this.schema_bdd) { 
			this._log(`création de ${table}`); 
			var objS = db.createObjectStore(table, this.schema_bdd[table]); 
objS.createIndex( 
				"dateMaJ", 
				"dateMaJ", 
				{ unique: false } 
			); 
		} 
	}; 
	this.poursuivre = (db) => { console.log("poursuivre"); 
		try { 
			for(var table in this.schema_bdd) { 
				db.transaction(table, "readonly"); 
			} 
			this._SuiteOk( 
				db 
			); 
		} catch(e) { 
			console.log( 
				`le schéma n'est pas correct ; 
				 tentative de mise à jour`
			); 
			db.close(); 
			this.version++; 
			setTimeout( 
				this.ouvrir 
			); 
		} 
	}; 
	this.ouvrir = () => { 
    console.log("ouvrir"); 
		this.r = window.indexedDB.open( 
      this.nom_bdd, 
      this.version 
    ); 
    this.r.onerror = (evt) => {
      console.log("erreur"); 
    }; 
		this.r.onupgradeneeded = (evt) => { 
      console.log("besoin de màj"); 
			this.installer( 
        evt.target.result 
      ); 
		}; 
		this.r.onblocked = (evt) => { 
      console.log(evt.target); 
			console.log( 
				`Une mise à jour de la base est nécessaire 
					pour utiliser cette fonctionnalité. Vous 
					devez fermer toutes les pages ouvertes du module et redémarrer votre 
					navigateur. Si le problème persiste, vous devriez réinstaller le module.` 
			); 
			if (window.db) { 
				try {
					window.db.close(); 
					this.version++; 
					setTimeout( 
						this.ouvrir 
					); 
				} catch(e) { 
					this._SuiteKo(); 
				} 
			} else { 
          this._SuiteKo(); 
      }
		}; 
		this.r.onsuccess = (evt) => { 
			console.log("ouverture ok"); 
			this.version =	parseInt(evt.target.result.version); 
			return this.poursuivre( 
				evt.target.result
			); 
		}; 
    console.log("ouvrir - fin", this.r); 
	}; 
	this._SuiteOk = () => {}; 
	this._SuiteKo = () => {}; 
}; 

window.objR = new OuvertureSure(
	"Nothus-RSS"
); 

window.objR._SuiteKo = (db) => { 
	console.log("impossible de résoudre autrement"); 
  Chargement(false); 
} 

window.objR._SuiteOk = (db) => { 
	window.db = db; 
	Chargement(false); 
} 

window.objR.schema_bdd = { 
	"notes2" : { 
		keyPath: "id", 
		autoIncrement : true 
	} 
}; 
 
window.objR.ouvrir();
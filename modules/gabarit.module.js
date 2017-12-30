Gabarit = function (sourceObjHTML, datas, fct) { 
	this.sourceObjHTML = sourceObjHTML; 
	this.resultatObjHTML = null; 
	this.execution = null; 
	this.datas = datas; 
	this.remplacement = true; 
	this.erreur = function(e) { 
		console.log("!err :", e); 
	}; 
	this.lancer = (_SuiteOk,..._) => { 
		var t = this.sourceObjHTML.innerHTML.replace(/([\r\n|\r|\t|\n]+)/g," ").replace( 
			/\<\%(\=)?(.+?)\1\%\>/g,  
			function(...args) { 
				return "'); "+( 
					(args[1]=="=")? 
						"r.push(`${"+(args[2].trim())+"}`); "
					: 
						r = args[2] 
				)+"r.push('"; 
			}
		); 
		try { 
			this.execution = "r = []; r.push('"+t+"'); return r.join(' ');"; 
			var tmp = Function( 
				this.sourceObjHTML.getAttribute("variable") || "datas", 
				this.execution 
			)( 
				this.datas 
			); 
			if (!this.remplacement) 
				return tmp; 
			this.resultatObjHTML = document.createElement("span"); 
			this.resultatObjHTML.innerHTML = tmp; 
			if (typeof fct=="function") 
				return fct(this.sourceObjHTML); 
			/*this.sourceObjHTML.parentNode.replaceChild( 
				this.resultatObjHTML, 
				this.sourceObjHTML 
			);*/
			return this.sourceObjHTML;  
		} catch(e) { 
			this.erreur(e); 
		}
	}; 
}; 
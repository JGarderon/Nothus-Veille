
window.Articles = { 
	"liste": [], 
	"extraction": {}, 
	"vueExtraire": ( 
		vueData, 
		nbre_max, 
		_Suite, 
		_Fin 
	) => { 
		var flux = []; 
		window.db.transaction(
			"secteurs", 
			"readonly"
		).objectStore( 
			"secteurs"
		).openCursor().onsuccess = (evtBDD) => { 
			var curseur = evtBDD.target.result; 
			if (curseur) {
				if ( 
					vueData.secteurs.indexOf( 
						curseur.value.id 
					)>-1 
				) 
					flux = flux.concat( 
						curseur.value.flux 
					); 
				curseur.continue(); 
			} else { 
				window.Articles.extraire( 
					date_debut = (vueData.dateDebut=="")?null:vueData.dateDebut, 
					date_fin = (vueData.dateFin=="")?null:vueData.dateFin, 
					date_inverse = (vueData.dateInverse)?true:false, 
					sources = flux, 
					objExp = { 
						"exp" : vueData.exp, 
						"expReg" : vueData.expReg, 
						"expRegIns" : vueData.expRegIns 
					}, 
					nbre_max = nbre_max, 
					_Suite = _Suite, 
					_Fin = _Fin 
				); 
			}
		} 
	}, 
	"extraire": ( 
		date_debut, 
		date_fin, 
		date_inverse, 
		sources, 
		objExp, 
		nbre_max, 
		_Suite, 
		_Fin 
	) => { 
		// dictionnaire des sources possibles 
		sources = (sources==undefined)?null:sources; 
		// nombre d'article à retrouver 
		nbre_max = (nbre_max==undefined)?10:parseInt(nbre_max); 
		
		// recherche d'une expression (régulière ou non) 
		if (objExp!=null && objExp.expReg) 
			objExp.exp = new RegExp( 
				objExp.exp, 
				(objExp.expRegIns)?"i":"" 
			); 

		if ( 
			date_debut==null 
		&& 
			date_fin==null 
		) { 
			var intervalle = IDBKeyRange.upperBound( 
				new Date().getTime() 
			); 
		} else if ( 
			date_debut!=null 
		&& 
			date_fin==null 
		) { 
			var intervalle = IDBKeyRange.upperBound( 
				new Date( 
					date_debut 
				).getTime() 
			); 
		} else if ( 
			date_debut==null 
		&& 
			date_fin!=null 
		) { 
			var intervalle = IDBKeyRange.lowerBound( 
				undefined, 
				new Date( 
					date_fin 
				).getTime() 
			); 
		} else if ( 
			date_debut!=null 
		&& 
			date_fin!=null 
		) { 
			var intervalle = IDBKeyRange.bound( 
				new Date( 
					date_debut 
				).getTime(), 
				new Date( 
					date_fin 
				).getTime() 
			); 
		} 
		
		var trouve = 0; 
		var listeTmp = []; 
		window.db.transaction(
			"articles", 
			"readonly"
		).objectStore( 
			"articles"
		).index( 
			"articleDate" 
		).openCursor().onsuccess = (evtBDD) => { 
			var curseur = evtBDD.target.result; 
			if (curseur) { 
				var i = 1; 
				if (intervalle.includes( 
					curseur.value.articleDate 
				)) 
					i *= 2; 
				if (sources==null) { 
					i *= 3; 
				} else { 
					if ( 
						sources.indexOf( 
							curseur.value["flux.id"] 
						)>-1 
					) 
						i *= 3; 
				} 
				if (
					!( 
						curseur.value.id in window.Articles.extraction 
					) 
				) 
					i *= 5; 
				if (
					objExp==null 
				) { 
					i *= 7; 
				} else { 
					var txt = curseur.value.articleTitre+" "+curseur.value.Description; 
					if (objExp.expReg) { 
						if ( 
							objExp.exp.test(txt) 
						) 
							i *= 7; 
					} else { 
						if ( 
							objExp.exp!=null
							|| 
							objExp.exp!="" 
							|| 
							txt.match( 
								objExp.exp
							)!=null 
						)
							i *= 7; 
					}
				} 
				if ( 
					i==210
				) { 
					trouve++; 
					listeTmp.push(
						curseur.value
					); 
					listeTmp.sort( 
						(a,b) => { 
							return (date_inverse)?(
								b.articleDate-a.articleDate 
							):(
								a.articleDate-b.articleDate 
							) 
						} 
					); 
					if (listeTmp.length>=nbre_max) 
						listeTmp = listeTmp.slice(
							0, 
							nbre_max 
						); 
				} 
				curseur.continue(); 
			} else { 
				listeTmp.forEach( 
					(article) => { 
						window.Articles.extraction[article.id] = article.articleId; 
						window.Articles.liste.push(
							article 
						); 
					}
				); 
				if (trouve>nbre_max) { 
					_Suite(); 
				} else { 
					_Fin(); 
				}
			}
		} 
	} 
} 

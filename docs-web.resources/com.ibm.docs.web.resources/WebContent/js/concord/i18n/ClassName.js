dojo.provide("concord.i18n.ClassName");

dojo.declare("concord.i18n.ClassName", null, {
	classname : {
		'ca'	: "lotusCA",
		'da'	: "lotusDA",
		'de'	: "lotusDE",
		'el'	: "lotusEL",
		'en'	: "lotusEN",
		'es'	: "lotusES",
		'fi'	: "lotusFI",
		'fr'	: "lotusFR",
		'it'	: "lotusIT",
		'ja'	: "lotusJapanese",
		'ko'	: "lotusKorean",
		'nl'	: "lotusNL",
		'no'	: "lotusNO",
		'pl'	: "lotusPL",
		'pt-br'	: "lotusPTBR",
		'pt'	: "lotusPT",
		'ro'	: "lotusRO",
		'ru'	: "lotusRU",
		'sv'	: "lotusSV",
		'th'	: "lotusTH",
		'tr'	: "lotusTR",
		'zh-cn'	: "lotusZHCN",
		'zh-tw' : "lotusZHTW",
		'zh'	: "lotusZH"
	},
	
	getLangClass : function() {
		var gLocale = g_locale || navigator.userLanguage || navigator.language;
		var parts = gLocale.toLowerCase().match( /([a-z]+)(?:-([a-z]+))?/ );
		var lang = parts[1];
		var locale = parts[2];
		if ( this.classname[ lang + '-' + locale ] )
			return this.classname[ lang + '-' + locale ];
		else if ( this.classname[ lang ] )
			return this.classname[ lang ];
		else
			return null;
	},
	
	getAllLangClass : function(){
		var allLangClassArray = [];
		for(var i in this.classname){
			allLangClassArray.push(this.classname[i]);
		}
		return allLangClassArray;
	}
});
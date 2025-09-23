dojo.provide("concord.i18n.locale");

// Localization methods for Date.   Honor local customs using locale-dependent dojo.cldr data.

dojo.require("dojo.date.locale");
dojo.require("dojo.date");
dojo.require("dojo.cldr.supplemental");
dojo.require("dojo.regexp");
dojo.require("dojo.string");
dojo.require("dojo.i18n");

// Load the bundles containin localization information for
// names and formats
dojo.requireLocalization("dojo.cldr", "gregorian");

//NOTE: Everything in this module assumes Gregorian calendars.
// Other calendars will be implemented in separate modules.

(function(){
	
concord.i18n.locale.getFormatPatten = function(/*dojo.date.locale.__FormatOptions?*/options){

	options = options || {};
	var locale = dojo.i18n.normalizeLocale(options.locale),
		formatLength = options.formatLength || 'short',
		bundle = dojo.date.locale._getGregorianBundle(locale),
		tmpPatten = [];
		
	if(options.selector == "year"){
		return (bundle["dateFormatItem-yyyy"] || "yyyy" );
	}

	if(options.selector != "date"){
		tmpPatten.push( bundle[options.timeCategory] || options.timePattern || bundle["timeFormat-"+formatLength] );
	}
	if(options.selector != "time"){
		tmpPatten.push(bundle[options.dateCategory] || options.datePattern || bundle["dateFormat-"+formatLength]);
	}
	
	return tmpPatten.length == 1 ? tmpPatten[0]:bundle["dateTimeFormat-"+formatLength].replace(/\{(\d+)\}/g,
		function(match, key){ return tmpPatten[key]; });
}

})();
dojo.provide("concord.i18n.Collation");
dojo.declare("concord.i18n.Collation", null, {

});

//collation: German
concord.i18n.Collation.compare_de = function(s1, s2) {
	//first level comparison: ignore case and replace U+00DF with 'ss'
	var val1 = s1.replace(/\u00DF/g, 'ss');
	var val2 = s2.replace(/\u00DF/g, 'ss');
	val1 = val1.toLocaleLowerCase();
	val2 = val2.toLocaleLowerCase();
	var rlt = val1.localeCompare(val2); 
	if(rlt != 0)
		return rlt > 0 ? 1 : -1;
	
	// if no difference for the first round comparison, 
	// second level comparison must be used
	// for second level comparison, replace U+00DF with double
	// letters which greater than 'ss', such as 'tt'
	
	val1 = s1.replace(/\u00DF/g, 'tt');
	val2 = s2.replace(/\u00DF/g, 'tt');
	val1 = val1.toLocaleLowerCase();
	val2 = val2.toLocaleLowerCase();
	rlt = val1.localeCompare(val2);
	if(rlt != 0)
		return rlt > 0 ? 1 : -1;
		
	// if still no difference, third level comparison will 
	// return the result of localeCompare
	rlt = s1.localeCompare(s2);
	if(rlt != 0)
		return rlt > 0 ? 1 : -1;
	else
		return 0;
	
};
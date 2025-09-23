dojo.provide("concord.i18n.utf");
dojo.declare("concord.i18n.utf", null, {

});

/**
 * Is this code point a surrogate (U+d800..U+dfff)?
 * @param c 32-bit code point
 * @return TRUE or FALSE
 */
concord.i18n.utf.U16_IS_SURROGATE = function(c) 
{
	return (((c)&0xfffff800)==0xd800);
};

/**
 * Assuming c is a surrogate code point (U16_IS_SURROGATE(c)),
 * is it a lead surrogate?
 * @param c 16-bit code unit
 * @return TRUE or FALSE
 */
concord.i18n.utf.U16_IS_SURROGATE_LEAD = function(c) 
{
	return (((c)&0x400)==0);
};

/**
 * Get a supplementary code point value (U+10000..U+10ffff)
 * from its lead and trail surrogates.
 * The result is undefined if the input values are not
 * lead and trail surrogates.
 *
 * @param lead lead surrogate (U+d800..U+dbff)
 * @param trail trail surrogate (U+dc00..U+dfff)
 * @return supplementary code point (U+10000..U+10ffff)
 */
concord.i18n.utf.U16_GET_SUPPLEMENTARY = function(lead, trail) 
{
	return (lead<<10) + trail - ((0xd800<<10) + 0xdc00-0x10000);
};

concord.i18n.utf.getCharCode = function(str, i) 
{
	if(i<0 || i>=str.length)
		return 0;
	var c = str.charCodeAt(i);
	if(concord.i18n.utf.U16_IS_SURROGATE(c))
	{
		if(concord.i18n.utf.U16_IS_SURROGATE_LEAD(c))
			c = concord.i18n.utf.U16_GET_SUPPLEMENTARY(c,str.charCodeAt(i+1));
		else
			c = concord.i18n.utf.U16_GET_SUPPLEMENTARY(str.charCodeAt(i-1),c);
	}
	return c;
};
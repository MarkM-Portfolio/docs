/**
 * utils to get a char code category
 */
dojo.provide("concord.i18n.CharCategory");

dojo.declare("concord.i18n.CharCategory", null, {

});

concord.i18n.CharCategory.isCJK = function(code) {
	// 1. standard CJK word
	if(code >= 0x3400 && code <= 0x4DB5)
		return true; //CJK Unified Ideographs Extension A 3.0				
	if(code >= 0x4E00 && code <=0x9FA5)
		return true; //CJK Unified Ideographs 1.1
	if(code >= 0x9FA6 && code <= 0x9FBB)
		return true; //CJK Unified Ideographs 4.1
	if(code >= 0xF900 && code <= 0xFA2D)
		return true; //CJK Compatibility Ideographs 1.1
	if(code >= 0xFA30 && code <= 0xFA6A)
		return true; //CJK Compatibility Ideographs 3.2			
	if(code >= 0xFA70 && code <= 0xFAD9)
		return true; //CJK Compatibility Ideographs 4.1
	if(code >= 0x20000 && code <= 0x2A6D6)
		return true; //CJK Unified Ideographs Extension B 3.1			
	if(code >= 0x2F800 && code <= 0x2FA1D)
		return true; //CJK Compatibility Supplement	3.1			
	// 2. CJK 2 -- QuanJiao, BanKuan ...
	if(code >= 0xFF00 && code <= 0xFFEF)
		return true;
	// 3. CJK 3 -- BuShou ext
	if(code >= 0x2E80 && code <= 0x2EFF)
		return true;
	// 4. CJK 4 -- Commo
	if(code >= 0x3000 && code <= 0x303F)
		return true;
	// 5. CJK 5 -- BiHua
	if(code >= 0x31C0 && code <= 0x31EF)
		return true;
	// 6. Bopomofo based on GB 2312
	if(code >= 0x3105 && code <=0x3129)
		return true;
	
	// 7. Japanese 1 -- PingJiaMing
	if(code >= 0x3040 && code <= 0x309F)
		return true;
	// 8. Japanese 2 -- PianJiaMing
	if(code >= 0x30A0 && code <= 0x30FF)
		return true;
	// 9. Japanese 2 -- JiaMing/PinYin ext
	if(code >= 0x31F0 && code <= 0x31FF)
		return true;
	// 10. Kanbun
	if(code >= 0x3192 && code <= 0x319F)
		return true;
	
	// 11. Korea 1 -- PinYin
	if(code >= 0xAC00 && code <= 0xD7AF)
		return true;
	// 12. Korea 2 -- Characters
	if(code >= 0x1100 && code <= 0x11FF)
		return true;
	// 13. Korea3 -- Others
	if(code >= 0x3130 && code <= 0x318F)
		return true;
	
	// 14. Private Use Area
	if(code >= 0xE000 && code <= 0xF8FF)
		return true;
	// 15. Enclosed CJK Letters and Months
	if(code >= 0x3200 && code <= 0x32FF)
		return true;
	
	return false;			
};

concord.i18n.CharCategory.isLatin = function(code) {
	// TODO
};

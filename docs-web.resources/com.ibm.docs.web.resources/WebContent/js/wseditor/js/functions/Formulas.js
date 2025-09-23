/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.functions.Formulas");

dojo.require("websheet.Constant");
dojo.require("websheet.functions.FormulaBase");
dojo.require("websheet.functions._math");
dojo.require("websheet.functions._countif");
dojo.require("websheet.functions._countifs");
dojo.require("websheet.functions._date");
dojo.require("websheet.functions._datetime");
dojo.require("websheet.functions._percent");
dojo.require("websheet.functions._stdevBase");
dojo.require("websheet.functions._scientific");
dojo.require("websheet.functions._singleargfunc");
dojo.require("websheet.functions._engineering");
dojo.require("websheet.functions.FormulaTranslate");

/*********************************************************************
 ** put the new supported formula js here below **********************
 ** if the formula js, 'B', is the subclass of the formula js, 'A' ***
 ** please make sure the js 'A' is put prior to the js 'B' ***********  
 *********************************************************************
 ********************************************************************/
dojo.require("websheet.functions.n");
dojo.require("websheet.functions.errortype");
dojo.require("websheet.functions.mserrortype");
dojo.require("websheet.functions.isna");
dojo.require("websheet.functions.islogical");
dojo.require("websheet.functions.istext");
dojo.require("websheet.functions.type");
dojo.require("websheet.functions.isnontext");
dojo.require("websheet.functions.isodd");
dojo.require("websheet.functions.iseven");
dojo.require("websheet.functions.average");
dojo.require("websheet.functions.true");
dojo.require("websheet.functions.false");
dojo.require("websheet.functions.na");
dojo.require("websheet.functions.and");
dojo.require("websheet.functions.or");
dojo.require("websheet.functions.not");
dojo.require("websheet.functions.now");
dojo.require("websheet.functions.month");
dojo.require("websheet.functions.isnumber");
dojo.require("websheet.functions.isblank");
dojo.require("websheet.functions.max");
dojo.require("websheet.functions.min");
dojo.require("websheet.functions.isref");
dojo.require("websheet.functions.isformula");
dojo.require("websheet.functions.iserror");
dojo.require("websheet.functions.formula");
dojo.require("websheet.functions.replace");
dojo.require("websheet.functions.search");
dojo.require("websheet.functions.counta");
dojo.require("websheet.functions.power");
dojo.require("websheet.functions.upper");
dojo.require("websheet.functions.lower");
dojo.require("websheet.functions.trunc");
dojo.require("websheet.functions.fact");
dojo.require("websheet.functions.concatenate");
dojo.require("websheet.functions.sum");
dojo.require("websheet.functions.product");
dojo.require("websheet.functions.sumif");
dojo.require("websheet.functions.address");
dojo.require("websheet.functions.countblank");
dojo.require("websheet.functions.ceiling");
dojo.require("websheet.functions.floor");
dojo.require("websheet.functions.randbetween");
dojo.require("websheet.functions.count");
dojo.require("websheet.functions.exact");
dojo.require("websheet.functions.abs");
dojo.require("websheet.functions.even");
dojo.require("websheet.functions.round");
dojo.require("websheet.functions.sheet");
dojo.require("websheet.functions.year");
dojo.require("websheet.functions.row");
dojo.require("websheet.functions.column");
dojo.require("websheet.functions.day");
dojo.require("websheet.functions.index");
dojo.require("websheet.functions.if");
dojo.require("websheet.functions.vlookup");
dojo.require("websheet.functions.hlookup");
dojo.require("websheet.functions.countif");
dojo.require("websheet.functions.iserr");
dojo.require("websheet.functions.len");
dojo.require("websheet.functions.lenb");
dojo.require("websheet.functions.left");
dojo.require("websheet.functions.right");
dojo.require("websheet.functions.rightb");
dojo.require("websheet.functions.proper");
dojo.require("websheet.functions.substitute");
dojo.require("websheet.functions.rept");
dojo.require("websheet.functions.date");
dojo.require("websheet.functions.edate");
dojo.require("websheet.functions.eomonth");
dojo.require("websheet.functions.rounddown");
dojo.require("websheet.functions.roundup");
dojo.require("websheet.functions.sqrt");
dojo.require("websheet.functions.subtotal");
dojo.require("websheet.functions.averagea");
dojo.require("websheet.functions.mmult");
dojo.require("websheet.functions.columns");
dojo.require("websheet.functions.rows");
dojo.require("websheet.functions.rank");
dojo.require("websheet.functions.base");
dojo.require("websheet.functions.trim");
dojo.require("websheet.functions.text");
dojo.require("websheet.functions.asin");
dojo.require("websheet.functions.acos");
dojo.require("websheet.functions.atan");
dojo.require("websheet.functions.datedif");
dojo.require("websheet.functions.days");
dojo.require("websheet.functions.hour");
dojo.require("websheet.functions.time");
dojo.require("websheet.functions.today");
dojo.require("websheet.functions.rand");
dojo.require("websheet.functions.sumproduct");
dojo.require("websheet.functions.exp");
dojo.require("websheet.functions.int");
dojo.require("websheet.functions.ln");
dojo.require("websheet.functions.log");
dojo.require("websheet.functions.mod");
dojo.require("websheet.functions.pi");
dojo.require("websheet.functions.indirect");
dojo.require("websheet.functions.weekday");
dojo.require("websheet.functions.minute");
dojo.require("websheet.functions.second");
dojo.require("websheet.functions.hyperlink");
dojo.require("websheet.functions.small");
dojo.require("websheet.functions.large");
dojo.require("websheet.functions.offset");
dojo.require("websheet.functions.odd");
dojo.require("websheet.functions.frequency");
dojo.require("websheet.functions.convert");
dojo.require("websheet.functions.mid");
dojo.require("websheet.functions.stdev");
dojo.require("websheet.functions.stdevp");
dojo.require("websheet.functions.stdeva");
dojo.require("websheet.functions.stdevpa");
dojo.require("websheet.functions.median");
dojo.require("websheet.functions.char");
dojo.require("websheet.functions.choose");
dojo.require("websheet.functions.weeknum");
dojo.require("websheet.functions.networkdays");
dojo.require("websheet.functions.mode");
dojo.require("websheet.functions.find");
dojo.require("websheet.functions.match");
dojo.require("websheet.functions.sin");
dojo.require("websheet.functions.cos");
dojo.require("websheet.functions.atan2");
dojo.require("websheet.functions.atanh");
dojo.require("websheet.functions.log10");
dojo.require("websheet.functions.radians");
dojo.require("websheet.functions.roman");
dojo.require("websheet.functions.combin");
dojo.require("websheet.functions.sinh");
dojo.require("websheet.functions.cosh");
dojo.require("websheet.functions.code");
dojo.require("websheet.functions.dollar");
dojo.require("websheet.functions.fixed");
dojo.require("websheet.functions.t");
dojo.require("websheet.functions.value");
dojo.require("websheet.functions.var");
dojo.require("websheet.functions.varp");
dojo.require("websheet.functions.vara");
dojo.require("websheet.functions.varpa");
dojo.require("websheet.functions.acosh");
dojo.require("websheet.functions.asinh");
dojo.require("websheet.functions.degrees");
dojo.require("websheet.functions.lookup");
dojo.require("websheet.functions.datevalue");
dojo.require("websheet.functions.days360");
dojo.require("websheet.functions.timevalue");
dojo.require("websheet.functions.workday");
dojo.require("websheet.functions.countifs");
dojo.require("websheet.functions.sumifs");
dojo.require("websheet.functions.averageif");
dojo.require("websheet.functions.averageifs");
dojo.require("websheet.functions.pmt");
dojo.require("websheet.functions.ipmt");
dojo.require("websheet.functions.ppmt");
dojo.require("websheet.functions.iferror");
dojo.require("websheet.functions.ifs");
dojo.require("websheet.functions.ifna");
dojo.require("websheet.functions.acot");
dojo.require("websheet.functions.acoth");
dojo.require("websheet.functions.cot");
dojo.require("websheet.functions.coth");
dojo.require("websheet.functions.tanh");
dojo.require("websheet.functions.tangent");
dojo.require("websheet.functions.gcd");
dojo.require("websheet.functions.lcm");
dojo.require("websheet.functions.factdouble");
dojo.require("websheet.functions.mround");
dojo.require("websheet.functions.multinomial");
dojo.require("websheet.functions.quotient");
dojo.require("websheet.functions.seriessum");
dojo.require("websheet.functions.sign");
dojo.require("websheet.functions.sqrtpi");
dojo.require("websheet.functions.sumsq");
dojo.require("websheet.functions.erfc");
dojo.require("websheet.functions.gammaln");
dojo.require("websheet.functions.pv");
dojo.require("websheet.functions.fv");
dojo.require("websheet.functions.fvschedule");
dojo.require("websheet.functions.npv");
dojo.require("websheet.functions.received");
dojo.require("websheet.functions.xnpv");
dojo.require("websheet.functions.ispmt");
dojo.require("websheet.functions.cumipmt");
dojo.require("websheet.functions.cumprinc");
dojo.require("websheet.functions.disc");
dojo.require("websheet.functions.pricedisc");
dojo.require("websheet.functions.pricemat");
dojo.require("websheet.functions.tbillprice");
//dojo.require("websheet.functions.bin2dec");
//dojo.require("websheet.functions.bin2hex");
//dojo.require("websheet.functions.bin2oct");
//dojo.require("websheet.functions.dec2bin");
//dojo.require("websheet.functions.dec2hex");
//dojo.require("websheet.functions.dec2oct");
//dojo.require("websheet.functions.hex2bin");
//dojo.require("websheet.functions.hex2dec");
//dojo.require("websheet.functions.hex2oct");
//dojo.require("websheet.functions.oct2bin");
//dojo.require("websheet.functions.oct2dec");
//dojo.require("websheet.functions.oct2hex");

websheet.functions.Formulas = {
	init: function() {
		websheet.functions.FormulaList = {
			_countif : new websheet.functions._countif(),
			_countifs : new websheet.functions._countifs(),
			_scientific : new websheet.functions._scientific(),
			_math : new websheet.functions._math(),
			_singleargfunc : new websheet.functions._singleargfunc(),
			_percent : new websheet.functions._percent(),
			abs : new websheet.functions.abs(),
			acos : new websheet.functions.acos(),
			address : new websheet.functions.address(),
			and : new websheet.functions.and(),
			asin : new websheet.functions.asin(),
			atan : new websheet.functions.atan(),
			average : new websheet.functions.average(),
			averageif : new websheet.functions.averageif(),
			averageifs : new websheet.functions.averageifs(),
			ceiling : new websheet.functions.ceiling(),
			"char" : new websheet.functions["char"](),
			choose : new websheet.functions.choose(),
			column : new websheet.functions.column(),
			convert: new websheet.functions.convert(),
			concatenate : new websheet.functions.concatenate(),
			count : new websheet.functions.count(),
			counta : new websheet.functions.counta(),
			countblank : new websheet.functions.countblank(),
			countif : new websheet.functions.countif(),
			countifs : new websheet.functions.countifs(),
			date : new websheet.functions.date(),		
			hyperlink : new websheet.functions.hyperlink(),
			datedif: new websheet.functions.datedif(),
			day : new websheet.functions.day(),
			days : new websheet.functions.days(),
			weekday : new websheet.functions.weekday(),		
			indirect : new websheet.functions.indirect(),
			second : new websheet.functions.second(),
			median: new websheet.functions.median(),
			minute : new websheet.functions.minute(),
			errortype : new websheet.functions.errortype(),
			mserrortype : new websheet.functions.mserrortype(),
			edate : new websheet.functions.edate(),
			eomonth : new websheet.functions.eomonth(),
			even : new websheet.functions.even(),
			exact : new websheet.functions.exact(),
			exp : new websheet.functions.exp(),
			fact : new websheet.functions.fact(),
			'false' : new websheet.functions["false"](),
			floor : new websheet.functions.floor(),
			formula : new websheet.functions.formula(),
			frequency : new websheet.functions.frequency(),
			hlookup : new websheet.functions.hlookup(),
			hour : new websheet.functions.hour(),
			'if' : new websheet.functions["if"](),
			ifs : new websheet.functions.ifs(),
			iferror : new websheet.functions.iferror(),
			ifna : new websheet.functions.ifna(),
			index : new websheet.functions.index(),
			'int' : new websheet.functions["int"](),
			ipmt: new websheet.functions.ipmt(),
			isblank : new websheet.functions.isblank(),
			iserr : new websheet.functions.iserr(),
			iserror : new websheet.functions.iserror(),
			iseven : new websheet.functions.iseven(),
			isformula : new websheet.functions.isformula(),
			islogical : new websheet.functions.islogical(),
			isna : new websheet.functions.isna(),
			isnontext : new websheet.functions.isnontext(),
			isnumber : new websheet.functions.isnumber(),
			isodd : new websheet.functions.isodd(),
			isref : new websheet.functions.isref(),
			istext : new websheet.functions.istext(),
			large : new websheet.functions.large(),
			left : new websheet.functions.left(),
			right : new websheet.functions.right(),
			rightb : new websheet.functions.rightb(),
			len : new websheet.functions.len(),
			lenb : new websheet.functions.lenb(),
			ln : new websheet.functions.ln(),
			log : new websheet.functions.log(),
			lower : new websheet.functions.lower(),
			max : new websheet.functions.max(),
			mid : new websheet.functions.mid(),
			min : new websheet.functions.min(),
			mod : new websheet.functions.mod(),
			month : new websheet.functions.month(),
			n : new websheet.functions.n(),
			na : new websheet.functions.na(),
			not : new websheet.functions.not(),
			now : new websheet.functions.now(),
			odd : new websheet.functions.odd(),
			offset: new websheet.functions.offset(),
			or : new websheet.functions.or(),
			pi : new websheet.functions.pi(),
			pmt: new websheet.functions.pmt(),
			power : new websheet.functions.power(),
			ppmt: new websheet.functions.ppmt(),
			product : new websheet.functions.product(),
			proper : new websheet.functions.proper(),
			rand : new websheet.functions.rand(),
			randbetween : new websheet.functions.randbetween(),
			rept : new websheet.functions.rept(),
			replace : new websheet.functions.replace(),
			round : new websheet.functions.round(),
			row : new websheet.functions.row(),
			search : new websheet.functions.search(),
			find : new websheet.functions.find(),
		    match: new websheet.functions.match(),
			sheet : new websheet.functions.sheet(),
			small : new websheet.functions.small(),
			substitute : new websheet.functions.substitute(),
			sum : new websheet.functions.sum(),
			sumproduct : new websheet.functions.sumproduct(),
			sumif : new websheet.functions.sumif(),
			sumifs : new websheet.functions.sumifs(),
			time : new websheet.functions.time(),
			today : new websheet.functions.today(),
			text : new websheet.functions.text(),
			trim : new websheet.functions.trim(),
			'true' : new websheet.functions["true"](),
			trunc : new websheet.functions.trunc(),
			type : new websheet.functions.type(),
			upper : new websheet.functions.upper(),
			vlookup : new websheet.functions.vlookup(),
			rounddown : new websheet.functions.rounddown(),
			roundup : new websheet.functions.roundup(),
			sqrt : new websheet.functions.sqrt(),
			subtotal : new websheet.functions.subtotal(),
			averagea : new websheet.functions.averagea(),
			mmult : new websheet.functions.mmult(),
			columns : new websheet.functions.columns(),
			rows : new websheet.functions.rows(),
			rank : new websheet.functions.rank(),
			base : new websheet.functions.base(),
			year : new websheet.functions.year(),
			mode : new websheet.functions.mode(),
			networkdays : new websheet.functions.networkdays(),
			weeknum : new websheet.functions.weeknum(),
			stdev: new websheet.functions.stdev(),
			stdevp: new websheet.functions.stdevp(),
			stdeva: new websheet.functions.stdeva(),
			stdevpa: new websheet.functions.stdevpa(),
		    code : new websheet.functions.code(),
		    dollar : new websheet.functions.dollar(),
		    fixed : new websheet.functions.fixed(),
		    t : new websheet.functions.t(),
		    value : new websheet.functions.value(),
	    	'var' : new websheet.functions["var"](),
			'varp' : new websheet.functions["varp"](),
			vara : new websheet.functions.vara(),
			varpa : new websheet.functions.varpa(),
		    acosh : new websheet.functions.acosh(),
		    asinh : new websheet.functions.asinh(),
		    degrees : new websheet.functions.degrees(),
		    sin: new websheet.functions.sin(),
		    cos: new websheet.functions.cos(),
		    atan2: new websheet.functions.atan2(),
		    atanh: new websheet.functions.atanh(),
		    log10: new websheet.functions.log10(),
		    radians: new websheet.functions.radians(),
		    roman: new websheet.functions.roman(),
		    combin: new websheet.functions.combin(),
		    sinh: new websheet.functions.sinh(),
		    cosh: new websheet.functions.cosh(),
		    lookup: new websheet.functions.lookup(),
		    datevalue : new websheet.functions.datevalue(),
	    	timevalue: new websheet.functions.timevalue(),
	    	days360: new websheet.functions.days360(),
	    	workday: new websheet.functions.workday(),
	    	bin2dec: new websheet.functions.bin2dec(),
	    	bin2hex: new websheet.functions.bin2hex(),
	    	bin2oct: new websheet.functions.bin2oct(),
	    	dec2bin: new websheet.functions.dec2bin(),
	    	dec2hex: new websheet.functions.dec2hex(),
	    	dec2oct: new websheet.functions.dec2oct(),
	    	hex2bin: new websheet.functions.hex2bin(),
	    	hex2dec: new websheet.functions.hex2dec(),
	    	hex2oct: new websheet.functions.hex2oct(),
	    	oct2bin: new websheet.functions.oct2bin(),
	    	oct2dec: new websheet.functions.oct2dec(),
	    	oct2hex: new websheet.functions.oct2hex(),
	    	acot: new websheet.functions.acot(),
	    	acoth: new websheet.functions.acoth(),
	    	cot: new websheet.functions.cot(),
	    	coth: new websheet.functions.coth(),
	    	tanh: new websheet.functions.tanh(),
	    	tangent: new websheet.functions.tangent(),
	    	gcd: new websheet.functions.gcd(),
	    	lcm: new websheet.functions.lcm(),
	    	factdouble: new websheet.functions.factdouble(),
	    	mround: new websheet.functions.mround(),
	    	multinomial: new websheet.functions.multinomial(),
	    	quotient: new websheet.functions.quotient(),
			seriessum: new websheet.functions.seriessum(),
			sign: new websheet.functions.sign(),
			sqrtpi: new websheet.functions.sqrtpi(),
			sumsq: new websheet.functions.sumsq(),
			erfc: new websheet.functions.erfc(),
			gammaln: new websheet.functions.gammaln(),
			pv: new websheet.functions.pv(),
			fv: new websheet.functions.fv(),
			fvschedule: new websheet.functions.fvschedule(),
			npv: new websheet.functions.npv(),
			received: new websheet.functions.received(),
			xnpv: new websheet.functions.xnpv(),
			ispmt: new websheet.functions.ispmt(),
			cumipmt: new websheet.functions.cumipmt(),
			cumprinc: new websheet.functions.cumprinc(),
			disc: new websheet.functions.disc(),
			pricedisc: new websheet.functions.pricedisc(),
			pricemat: new websheet.functions.pricemat(),
			tbillprice: new websheet.functions.tbillprice()
		};
		
		websheet.functions.errMsg = {
			DIV : websheet.Constant.ERRORCODE["532"].message.toUpperCase(),//#DIV/0
			NAME : websheet.Constant.ERRORCODE["525"].message.toUpperCase(),//#NAME?
			VALUE : websheet.Constant.ERRORCODE["519"].message.toUpperCase(),//#VALUE!
			NUL : websheet.Constant.ERRORCODE["533"].message.toUpperCase(),//#NULL!
			NUM : websheet.Constant.ERRORCODE["504"].message.toUpperCase(),//#NUM!
			REF : websheet.Constant.ERRORCODE["524"].message.toUpperCase(),//#REF!
			NA : websheet.Constant.ERRORCODE["7"].message.toUpperCase()//#N/A
//			GETDATA : websheet.Constant.ERRORCODE["7"].message.toUpperCase()//#GETTING_DATA
		}
	},
	
	getFuncObj:function(name){
		var method = name.toLowerCase();
		if(method=="error.type"){
			method="mserrortype";//error.type in ms excel
		}
		
		//The file for TAN formula is named with 'tangent.js' instead of 'tan.js', because 'tan.js' can not be loaded
		//translate name here
		if(method=="tan")
			method="tangent";
		
		var formulaClassName = websheet.functions[method];
		if (!formulaClassName) {
			var bSupport = websheet.functions.FormulaTranslate.isSupportedFormula(method);
			if(bSupport){
				e =  websheet.Constant.ERRORCODE["1001"];
				e.message = method.toUpperCase(); // store the English formual.
				throw e;
			}else{
				e = websheet.Constant.ERRORCODE["525"];
				throw e;
			}
		}
		var formulaObj = websheet.functions.FormulaList[method];
		return formulaObj;
	},
	
	getFunc: function(name, context) {
		var formulaObj = this.getFuncObj(name);
		if(!context)
			context = {};
		return dojo.hitch(formulaObj, formulaObj._calc, context);
	}
};
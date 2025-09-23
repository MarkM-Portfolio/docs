dojo.provide("websheet.functions.networkdays");

dojo.declare("websheet.functions.networkdays",  websheet.functions._date, {
	
	startSN:null,
	endSN:null,
	holidayObj:null,
	
	constructor: function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 3;			
	},
	
	/*int*/calc: function(context) {		
		var values= this.args;
		var sdate, edate, holidays;	
		
		this.startSN = Math.floor(this.getNumValue(values[0]));
		this.endSN = Math.floor(this.getNumValue(values[1]));
		
		if(values.length==3){
			holidays = values[2];
		}		sdate=new Date(this.getMSWithSerialNumber(this.startSN));
		websheet.Helper.setTimezoneOffset(sdate);
		
		edate=new Date(this.getMSWithSerialNumber(this.endSN));
		websheet.Helper.setTimezoneOffset(edate);
		
		// dojo.date.difference will use eDate's MS minus sDate's MS, then convert to Day by Round,
		// so set eDate hour bigger than sDate(eDate>sDate) or set sDate hour bigger than eDate(sDate>eDate) can get correct value
		if(edate.getTime() >=sdate.getTime())
			edate.setHours(23);
		else
			sdate.setHours(23);		
		var count =0;
		if(holidays){
			context.count = count;
			this.holidayObj=new Object();
			this.iterate(holidays, context);
			count = context.count;
		}		
		var days = Math.round(dojo.date.difference(sdate, edate, "day"));
		var weeks = parseInt(dojo.date.difference(sdate, edate, "week"));
		var mod = Math.abs(days % 7);			
		sdate.setDate(sdate.getDate()+(weeks*7));
		var adj = 0;
		var dayMark = sdate.getDay();
		if(dayMark==0|| dayMark==6)
			adj-=1;
		for(var i=1;i<mod;i++){
			if(days > 0)
				sdate.setDate(sdate.getDate()+1);
			else 
			 	sdate.setDate(sdate.getDate()-1);
			dayMark = sdate.getDay();
			if(dayMark==0|| dayMark==6)
				adj-=1;
		}
		if(days > 0)
			days += adj;
		else
		 	days -= adj;
		days -= (weeks*2);			
		return days - count;		
	},	

	_operatorSingleValue:function(context,item,index,type){
		var bObj = this.Object.isCell(item);
		var curObj = bObj ? item.getComputeValue():item;
		// not support boolean
		if (typeof curObj == "boolean")
			throw websheet.Constant.ERRORCODE["519"];
		if(type == this.tokenType.RANGEREF_TOKEN || type == this.tokenType.NAME){
			if(curObj === ""){
				return;
			}
			if(bObj&& !item.isNumber())
			 	throw websheet.Constant.ERRORCODE["519"];
		}
		//pass ignoreArrayformula=true, or return 0 for parse text in the array {"2001-2-2"}			
		var sn = Math.floor(this.getValue(curObj,type,this.LOCALE_NUM, true));
		if(this.holidayObj[sn] != undefined){
			return;
		}
		this.holidayObj[sn]=sn;
		if( sn<this.startSN || sn>this.endSN)
			return;			
		
		var d=new Date(this.getMSWithSerialNumber(sn));
		websheet.Helper.setTimezoneOffset(d);
		var w = d.getDay();
		if(w != 0 && w!=6){
			context.count +=1;
		}
		
	}
});
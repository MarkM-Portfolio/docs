dojo.provide("websheet.functions.weeknum");

dojo.declare("websheet.functions.weeknum",  websheet.functions._date, {
	
	constructor: function() {
		
		this.maxNumOfArgs = 2;			
	},
	
	/*int*/calc: function() {	
		var values= this.args;
		var returntype=1;
		var sn = this.getNumValue(values[0]);
		var values = this.args;
		if(values.length==2){
			returntype=this.getNumValue(values[1]);
			returntype=Math.floor(returntype);
			if(values[1]._calculateValue == null && values[1]._name == "")
				returntype = 1;
			if(returntype != 1 && returntype != 2){
				throw  websheet.Constant.ERRORCODE["504"];
			}
		}		var d=new Date(this.getMSWithSerialNumber(Math.floor(sn)));
		websheet.Helper.setTimezoneOffset(d);
		// dojo.date.difference will use eDate's MS minus sDate's MS, then convert to Day by Round,
		// so set d hour bigger than baseDate can get correct value
		d.setHours(23);
		var baseDate = new Date(d.getFullYear(),0,1);
		
		if(returntype==1){
			baseDate = dojo.date.add(baseDate, "day", -baseDate.getDay());
		}else{
			var delta = baseDate.getDay()==0? -6:  1-baseDate.getDay();
			baseDate = dojo.date.add(baseDate, "day",delta);
			// for cases like =WEEKNUM("1995-01-01",2),  1995-01-01 is sunday
			if(baseDate.getTime() > d.getTime())
				return 1;
		}
	
		return  Math.ceil(dojo.date.difference(baseDate,d,"day")/7);
	}
});
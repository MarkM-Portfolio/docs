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

dojo.provide("websheet.functions.datedif");
dojo.require("dojo.date");
dojo.declare("websheet.functions.datedif", websheet.functions._date, {
	
	constructor: function() {
		this.minNumOfArgs = 3;
		this.maxNumOfArgs = 3;		
	},
	
	/*int*/calc: function() {
		var date1,date2;
		var format;	
		dojo.forEach(this.args,function(item,i){
			var type = item.getTokenType();			
			var value=this.fetchScalaResult(this.args[i]);
			if(i==(this.args.length-1))
			{
				format= this.getValue(value,type).toLowerCase();
				if(!("y"==format || "m"==format || "d"==format || "md"==format || "ym"==format || "yd"==format)){
					throw websheet.Constant.ERRORCODE["519"];
				}	
			}else{				
				if(i==0)
					date1=this.getValue(value,type,this.LOCALE_NUM | this.NOT_SUPPORT_ARRAY);
				else
					date2=this.getValue(value,type,this.LOCALE_NUM | this.NOT_SUPPORT_ARRAY);
			}
		},this);
	
		var d1=new Date(this.getMSWithSerialNumber(Math.floor(date1)));
		websheet.Helper.setTimezoneOffset(d1);
		var d2=new Date(this.getMSWithSerialNumber(Math.floor(date2)));
		websheet.Helper.setTimezoneOffset(d2);
		if(dojo.date.compare(d1,d2,"date")>0)
			throw websheet.Constant.ERRORCODE["502"];
		
		var f;
		var daydif;
		daydif=d2.getDate()-d1.getDate();
		d1.setDate(1);
		d2.setDate(1);
		if("m"==format||"ym"==format ||"md"==format){
			if(daydif < 0){
				d2=this.minusMonth(d2);
				daydif+=dojo.date.getDaysInMonth(d2);
			}
		}else{
			while(daydif < 0){
				d2=this.minusMonth(d2);
				daydif+=dojo.date.getDaysInMonth(d2);
			}
		}
		
		if("y"==format){
			if(d2.getMonth()<d1.getMonth()){				
				d2.setFullYear(d2.getFullYear()-1);		
			}
			f="year";
		}else if("m"==format){			
			f="month";
		} else if("d"==format){
			f="day";
		}else if("md"==format){
			return daydif;
		}else if("ym"==format){
			d1.setFullYear(d2.getFullYear());			
			f="month";
		}else if("yd"==format){	
			if(d2.getMonth()<d1.getMonth()){				
				d2.setFullYear(d1.getFullYear()+1);		
			}	else {
				d2.setFullYear(d1.getFullYear());
			}
			f="day";
		}
		
		var dif= dojo.date.difference(d1, d2, f);
		if(dif<0){
			if("ym"==format){
				dif=dif+12;
			}
		}
		
		if("yd"==format||"d"==format){
			dif=dif+daydif;
		}
		
		return dif;
	},
	
	/*date*/ minusMonth:function(date){
		var m=date.getMonth()-1;
		if(m<0){ 
			m=11;
			date.setFullYear(date.getFullYear()-1);
		}
		date.setMonth(m);	
		return date;	
	}
});
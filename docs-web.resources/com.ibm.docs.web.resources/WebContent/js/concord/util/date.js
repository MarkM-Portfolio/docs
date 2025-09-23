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

dojo.provide("concord.util.date");
dojo.require("dojo.i18n");
dojo.require("dojox.date.buddhist.Date");
dojo.requireLocalization("concord.util","date");

//previous implementation failed to take account of i18n 
//re-implement the below two API by leveraging date format
concord.util.date.getTime = function(pattern) {
	var date = new Date();
	if(concord.util.date.isBuddistLocale()){
		date = new dojox.date.buddhist.Date(date);
	}	
	if(!pattern)
		pattern = "short"; 
	return dojo.date.locale.format(date, { 
		selector : "time",
		lengthPattern: "short"
		
	});
	
	//below id original code
	/*
	var nls = dojo.i18n.getLocalization("concord.util","date");
	var date = new Date();
	var hour = date.getHours();
	var min = date.getMinutes();
	
	var AMorPM = "";
	if(hour > 11)
		AMorPM = nls.pm; 
	else
		AMorPM = nls.am; 
	
	if(hour == 0)
		hour = 12;
	if(hour > 12)
		hour = hour - 12;
	
	min = min.toString();
	if(min.length == 1)
		min = "0" + min;
	
	return hour + ":" + min + AMorPM;*/
};

concord.util.date.getDate = function(pattern,dateStr) {
	
	var date = null;
	if(dateStr!=null){
		date = new Date(dateStr);
	}else{
		date = new Date();
	}
	if(concord.util.date.isBuddistLocale()){
		date = new dojox.date.buddhist.Date(date);
	}	
	if(!pattern && date!=null){
		pattern = "medium"; 
		return dojo.date.locale.format(date, { 
			selector : "date",
			lengthPattern: pattern
		});
	}else{
		return null;
	}
	
	//below is the original code
	/*var nls = dojo.i18n.getLocalization("concord.util","date");
	var monthLabel = [nls.jan, nls.feb, nls.mar, nls.apr, nls.may, nls.june, nls.july, nls.aug, nls.sept, nls.oct, nls.nov, nls.dec];
    
    var date = new Date();
	var month = date.getMonth();
	var day = date.getDate();
	var year = date.getFullYear();
	
	return monthLabel[month] + " " + day + ", " + year;*/
};

concord.util.date.getDateTime = function(pattern) {
	var date = new Date();
	if(concord.util.date.isBuddistLocale()){
		date = new dojox.date.buddhist.Date(date);
	}	
	if(!pattern)
		pattern = "medium"; 
	return dojo.date.locale.format(date, { 
		lengthPattern: pattern
		
	});
};

concord.util.date.parseDateTime = function(datestamp, pattern)
{	
	var theDate = new Date(datestamp);
	if(concord.util.date.isBuddistLocale()){
		theDate = new dojox.date.buddhist.Date(theDate);
	} 	
	var lc =  g_locale || navigator.userLanguage || navigator.language;
	if(pe.scene.getLocale)
		lc = pe.scene.getLocale();

	if(!pattern)
		pattern = "medium";
	
	var td = dojo.date.locale.format(theDate, {locale: lc, formatLength: pattern});
	
	if(td)
		return td;	
	return null; 
};

concord.util.date.parseTime = function(datestamp, pattern)
{	
	var theDate = new Date(datestamp);
	if(concord.util.date.isBuddistLocale()){
		theDate = new dojox.date.buddhist.Date(theDate);
	} 	
	var lc =  g_locale || navigator.userLanguage || navigator.language;
	if(pe.scene.getLocale)
		lc = pe.scene.getLocale();
	
	if(!pattern)
		pattern = "medium"; 
	
	var td = dojo.date.locale.format(theDate, {selector: 'time',locale: lc, formatLength: pattern});
	
	if(td)
		return td;	
	return null; 
};

concord.util.date.parseDate = function(datestamp)
{	
	var theDate = new Date(datestamp);
	if(concord.util.date.isBuddistLocale()){
		theDate = new dojox.date.buddhist.Date(theDate);
	} 	
	var lc =  g_locale || navigator.userLanguage || navigator.language;
	if(pe.scene.getLocale)
		lc = pe.scene.getLocale();
	
	var td = dojo.date.locale.format(theDate, {selector: 'date',locale: lc, formatLength: 'medium'});
	
	if(td)
		return td;	
	return null; 
};

concord.util.date.beforeToday = function(datestamp)
{
	var today = new Date();
	today.setHours(0);
	today.setMinutes(0);
	today.setSeconds(0);
	today.setMilliseconds(0);
	
	var theDate = new Date(datestamp);
	return (theDate.getTime() < today.getTime());
};

concord.util.date.isToday = function(datestring)
{
	var today = new Date();
	if(concord.util.date.isBuddistLocale()){
		today = new dojox.date.buddhist.Date(today);
	} 	
	var strToday = dojo.date.locale.format(today, {selector: 'date', formatLength: 'medium'});
	
	if (strToday == datestring)
		return true;
	else
		return false;
};

concord.util.date.isYesterday = function (datestring)
{
	var yesterday = new Date();
	var yesterdayTime = null;
	if(concord.util.date.isBuddistLocale()){
		yesterday = new dojox.date.buddhist.Date(yesterday);
		var toGYesterday = yesterday.toGregorian();
		// buddhist date has no getTime() method
		yesterdayTime = toGYesterday.getTime() - 86400000;
		toGYesterday.setTime(yesterdayTime);
		yesterday = yesterday.fromGregorian(toGYesterday);
	}else{
		yesterdayTime = yesterday.getTime() - 86400000;
		yesterday.setTime(yesterdayTime);		
	} 	

	var strYesterday = dojo.date.locale.format(yesterday, {selector: 'date', formatLength: 'medium'});
	
	if (strYesterday == datestring)
		return true;
	else
		return false;
	
};

concord.util.date.isTomorrow = function (datestring)
{
	var tomorrow = new Date();
	var tomorrowTime = null;
	if(concord.util.date.isBuddistLocale()){
		tomorrow = new dojox.date.buddhist.Date(tomorrow);
		var toGTomorrow = tomorrow.toGregorian();
		// buddhist date has no getTime() method
		tomorrowTime = toGTomorrow.getTime() + 86400000;
		toGTomorrow.setTime(tomorrowTime);
		tomorrow = tomorrow.fromGregorian(toGTomorrow);		
	}else{
		tomorrowTime = tomorrow.getTime() + 86400000;
		tomorrow.setTime(tomorrowTime);		
	} 

	var strTomorrow = dojo.date.locale.format(tomorrow, {selector: 'date', formatLength: 'medium'});
	
	if (strTomorrow == datestring)
		return true;
	else
		return false;
	
};

concord.util.date.isBuddistLocale = function ()
{
	var locale = pe.scene.getLocale();
	if(locale && locale.indexOf("th") > -1)
		return true;
	else
		return false;
};

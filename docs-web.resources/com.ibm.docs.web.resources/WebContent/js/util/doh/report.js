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
/*
 * Create a submit dialog, it appears when click the button of Submit
 */
dojo.require("dijit.Dialog");
var oldNode = document.getElementById("audio");
var submitNode = document.createElement("input");
submitNode.type="hidden";
submitNode.value = "Upload";
submitNode.title = "Upload D.O.H. test results"	
submitNode.style.margin = "0px 5px 0px 5px"	
oldNode.parentNode.insertBefore(submitNode,oldNode);
var nametest = dojo.create("form", {innerHTML: "<hr>&nbsp&nbsp&nbspSubmit report to concord server.<br><br>&nbsp&nbsp&nbspYour testname:&nbsp&nbsp <input name=\"testname\" id=\"testname\"></input><br><br><div align=\"right\"><button style=\"border: 0;background-color:#faf\" type=\"submit\" id=\"ok\">Submit</button><div>"}, dojo.body());
nametest.id = "nametest";
nametest.name = "nametest";
var diag;
var uploadFlag=false;
diag=new dijit.Dialog({title:"Test Name&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp"},nametest);
diag.set("id","dialog");
diag.set("style","font-weight: bold;background: #fff;border: 3px solid #7eabcd;");
submitNode.onclick = function showDia(){   
	if(uploadFlag==false){
		diag.show();
	}else{
		alert("The report has submitted!");
	}

}
dojo.addOnLoad(function(){	  
	/*
	 * Check the request Url does not contain the name parameter
	 * This result decides the button of Submit is displayed
	 */
	var flag=false;
	var url = location.search;
	var name;
	if (url.indexOf("?") != -1) {
		var str = url.substr(1);
		strs = str.split("&");
		for(var i = 0; i < strs.length; i ++) {
			if(strs[i].split("=")[0]=="name"){
				name = strs[i].split("=")[1];
				flag=true;
			}
		}
	}

	/*
	 * Create a form to post report to concord server
	 */
	var servername = "http://concordla.cn.ibm.com:8080/testdashboard";
	//var servername = "http://localhost:8080/testdashboard";
	var fm = dojo.create("form", {innerHTML: "<input name=\"url\" id=\"url\"></input><input name=\"reportXml\" id=\"reportXml\"></input><input name=\"message\" id=\"message\"></input><input name=\"start\" id=\"start\"></input><input name=\"end\" id=\"end\"></input><input name=\"name\" id=\"name\" value=\"\"></input>"}, dojo.body());
	fm.id = "postForm";
	fm.name = "postForm";
	fm.method = "post";
	fm.type = "hidden";
	fm.target = "blank";
	fm.action = servername+"/uploadXml";   
	dojo.attr(dojo.byId('url'), "value", servername);
	var xml = '<testsuite';	
	var testXml='';
	var startTimestamp=Math.round(new Date().getTime());
	dojo.attr(dojo.byId('start'), "value", startTimestamp);
	dojo.attr(dojo.byId('name'), "value", name);

	var buttonNode = dojo.byId("ok");
	buttonNode.onclick = function(){
		diag.hide();
		dojo.attr(dojo.byId('name'), "value", dojo.byId('testname').value);
		document.getElementById("postForm").submit();
		uploadFlag=true;
	}   

	/*
	 * Record result to report when every testcase is finished
	 */
	doh._testFinished = (function(or) {
		return function(group, fixture, success){ 
			var fixname = fixture.name;
			if(fixname!=null && typeof(fixname) != "string")
				fixname = fixname.toString();
			var groupname=group;
			if(typeof(groupname)!="string")
				groupname = groupname.toString();
			if(fixname!=null){
				fixname = fixname.replace(/"/g,"&quot;").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
			}
			if(groupname!=null){
				groupname = groupname.replace(/"/g,"&quot;").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
			}
			testXml += '<testcase classname="" end="'+Math.round(fixture.endTime.getTime())+'" id="" methodname="'+groupname + '.' + fixname +'" start="'+Math.round(fixture.startTime.getTime())+'">';
			if(success==false){
				testXml += '<failure type="true"></failure>';
			}
			if(success==null){
				var errorString = fixture.runTest;
				if(errorString!=null && typeof(errorString) != "string"){
					errorString = errorString.toString().replace(/"/g,"&quot;").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
				}
				testXml += '<error message="ERROR IN:" type="true">'+errorString+'</error>';
			}
			dojo.create();
			testXml += "</testcase>";
			or.apply(doh,arguments);
		}
	})(doh._testFinished);

	/*
	 * Record result when all tests is finished
	 */
	doh._report = (function(or) {
		return function(){	
			var endTimestamp = Math.round(new Date().getTime());
			dojo.attr(dojo.byId('end'), 'value', endTimestamp);
			xml += ' duration="" errors="'+doh._errorCount+'" failures="'+doh._failureCount+'" finished="'+doh._testCount+'" ignored="0" name="Unnamed" passed="'+(doh._testCount-doh._failureCount-doh._errorCount)+'" running="" skipped="0" start="" tests="'+doh._testCount+'">';
			xml += testXml;
			xml +='</testsuite>';
			dojo.attr(dojo.byId('reportXml'), "value", xml);
			var message = ' tests:'+doh._testCount+' failures:'+doh._failureCount+' errors:'+doh._errorCount;
			dojo.attr(dojo.byId('message'), "value", message);	
			if(flag==true){
				document.getElementById("postForm").submit();
				uploadFlag=true;
			}else{
				submitNode.type="button";
			}
			or.apply(doh,arguments);
		}
	})(doh._report);

});




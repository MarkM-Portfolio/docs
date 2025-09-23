<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<%@page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>

<html>
<%-- ***************************************************************** --%>
<%--                                                                   --%>
<%-- IBM Confidential                                                  --%>
<%--                                                                   --%>
<%-- IBM Docs Source Materials                                         --%>
<%--                                                                   --%>
<%-- (c) Copyright IBM Corporation 2012. All Rights Reserved.          --%>
<%--                                                                   --%>
<%-- U.S. Government Users Restricted Rights: Use, duplication or      --%>
<%-- disclosure restricted by GSA ADP Schedule Contract with IBM Corp. --%>
<%--                                                                   --%>
<%-- ***************************************************************** --%>

<head>

<% 	
 	String secureToken=request.getSession().getAttribute("secureToken").toString();
%>



<script src="/concord/js/dojo/dojo.js" djConfig="parseOnLoad: true" type="text/javascript"></script>
<script src="/concord/js/dojo/parser.js" type="text/javascript"></script>

<link href="/concord/js/dojo/resources/dojo.css" type="text/css" rel="stylesheet"></link>
<link href="/concord/js/dijit/themes/tundra/tundra.css" type="text/css" rel="stylesheet"></link>

<script type="text/javascript">
	var contextPath = "/concord";
	var secureToken="<%= secureToken %>";
	
	var djConfig = {
		baseUrl: "./",
		parseOnLoad: true,
		isDebug: false
		};
</script>

<script>
dojo.require("dojo.parser");
dojo.require("dijit.Editor"); 
dojo.require("concord.main.App");
dojo.require("concord.beans.WebClipboard");

loaded=function ()
{	
	var strContent = ""; 
  var webClipboard = new concord.beans.WebClipboard({'app': 'pres'});
  window.webClipboard = webClipboard;
  window.pageLoadCount = 0;
};

set=function ()
{    
  webClipboard.setData(strContent);    
};

get=function ()
{  
  var str = webClipboard.getData();	
  alert(str);
  
};

check=function ()
{  
	var checkbox = document.getElementById("usesServer");
	var checked = checkbox.checked;
  webClipboard.setForceServer(checked);
};

empty=function ()
{
	webClipboard.emptyClipboard();
};

isNULL=function (obj)
{
	if(obj == "null" || obj == "undefined" || (!obj) || isNaN(obj))
	{
		return true;
	}
	else
	{
		return false;
	}
};
	
editor_changed=function ()
{		
	var strOrig = arguments[0];
	//strContent = arguments[0];
  //strOrig = strOrig.replace(/\n/ig, "");
  strOrig = strOrig.replace(/<br \/>/ig, "\n");	  
  
  strContent = strOrig;
};	

</script>
</head>
<body onload="loaded()" class="tundra">
<div dojoType="dijit.Editor" id="myEditor" height="220" onChange="editor_changed">
</div>

<p>
<b>Input valid JSON contents above and click anywhere out side. click "set" "get" and "empty" button to test. The check box indicate if you use serve table or local storage(IE7 and earlier does not support local storage).</b>
</p>
<p>
Use clipboard on server : <input id="usesServer" type="checkbox" onclick="check()" />
</p>
<p>
set Clipboard data: <input type="button" onclick="set()" value="set" />
get Clipboard data: <input type="button" onclick="get()" value="get" />
</p>
<p>
Empty Clipboard data: <input type="button" onclick="empty()" value="empty" />
</p>


</body>
</html>

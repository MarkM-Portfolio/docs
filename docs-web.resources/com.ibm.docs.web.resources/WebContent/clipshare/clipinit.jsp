<!--  
 /* 
 * Licensed Materials - Property of IBM.
 * @clipinit
 * Copyright IBM Corporation 2010. All Rights Reserved.
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
-->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"	%>
<html>
<head>
<title>LotusLive Concord</title>

<%
 	String contextPath = request.getContextPath();
 	String secureToken=request.getSession().getAttribute("secureToken").toString();
%>
	
<script type="text/javascript">
	var contextPath = "<%= contextPath %>";
	var secureToken="<%= secureToken %>";
	var test = "variable Visible";
</script>
<script type="text/javascript">
		/*************************************************************
			This function will get parms from url. The only parm 
			expected is message. This contains a string to display
			to the user example "Successful login". This message
			is sent by the Santorini Plugin when user attampts to 
			login from the plugin.
			If there is no message then Santorini plugin is calling
			this page as a preemptive SAML check.			
		*************************************************************/
		function init(){				
			var searchStr = document.location.search;
			var message= null;
			if 	(searchStr.indexOf('message') >=0){	
				message 		=	decodeURI(searchStr.substring(searchStr.indexOf('message')+8));
				document.getElementById('messageNode').innerHTML = message;
				document.body.test =test;
				document.body.token=secureToken;
			}		
			var SAMLPreemptiveFrame = document.getElementById("SAMLPreemptiveFrame");
			SAMLPreemptiveFrame.style.borderColor="blue";
			
		}
		
		/*************************************************************
			This function will get called when iFrame is done 
			loading
		*************************************************************/
		
		function iframeDoneLoading(){											
			document.getElementById('messageNode').innerHTML = "SAML Preempt completed ???";
		}
		/*************************************************************
			This function will call the callback function stored by 
			the plugin
		*************************************************************/
		function wrapup(){				
			var timerCtr =1;
			var TIMEOUT_VALUE = 10;
			var timer = setInterval(function() {
				try{console.log("cliplogintoconcord.js :: init()"," Checking santorini plugin status... attempt  "+(timerCtr++));}catch(e){}		
			    if ((document.body.santoriniPluginConcordLogin) || (timerCtr >= TIMEOUT_VALUE)) { 
			        if (timerCtr>=TIMEOUT_VALUE){
				        clearInterval(timer);					
			        	timerCtr=1;						
						alert("Error occured");	
			        }else if (document.body.santoriniPluginConcordLogin){			               	
				        clearInterval(timer);																															
					}
			    }
			}, 1000);	
		}
</script>	
</head>
<body  onload="init()">
	<div id="messageNode"></div>
	<iframe id="SAMLPreemptiveFrame" onload="iframeDoneLoading()" width="100%" height="100%"   src ="https://lotuslivelabs.research.ibm.com/l3proxywork/possiblepreemptivesaml" >
		<p>Your browser does not support iframes.</p>
	</iframe>
</body>
</html>

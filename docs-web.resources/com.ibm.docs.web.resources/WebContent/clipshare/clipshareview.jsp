<!--  
 /* 
 * Licensed Materials - Property of IBM.
 * @clipshareview
 * Copyright IBM Corporation 2010. All Rights Reserved.
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
-->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"	%>
<html>
<head>
<title>Lotus Concord Shared Highlights Viewer</title>

<%
 	String contextPath = request.getContextPath();
 	String secureToken=request.getSession().getAttribute("secureToken").toString();
%>
	
<script type="text/javascript">
	var contextPath = "<%= contextPath %>";
	var secureToken="<%= secureToken %>";
	var test = "variable Visible";
</script>
<script type="text/javascript">	var contextPath	=".."; </script>
<script type="text/javascript" src="../js/dojo1/dojo.js"></script>

<script type="text/javascript">
	var userSharing 				=	null;
	var userSharingUUID				= 	null;
	var userViewing 				=	null;
	var urlToLoadInIframe 			=	null;
	var sharedHighlights			= 	null;
	var frameViewerObj				= 	null;
	var highlightBackgroundColor 	= 	"yellow";
	var highlightCommentTracking 	= 	[];
	var commentsListObj				= 	null;
	var clipDisplayArea				= 	null;
	var clipContainerDiv			= 	null;
	var loadingH2Msg				=	null;
	var bannerVisible				=	false;
	var bannerToggler				= 	null;
	var shareVisible				=	true;
	var pluginmessage				=	null;
	var ctr							=	0;
	var TIMEOUT_VALUE				=	10;
	var SHARE_NOT_FOUND_MSG			=	"Sorry. Clip share could not be found or error while retrieving.";
	var SHARE_BY_MSG				=	"Concord highlights shared by";
	var IE_PLUGIN_MSG				= 	"Install Firefox and get plugin here";
	
	
	var djConfig = {
		baseUrl: "../",
		parseOnLoad: true,
		isDebug: false
		};
</script>

<!-- manually include dojo.back, since we need to guarantee it's loaded before rendering body -->

<script type="text/javascript" src="../js/concord/beans/ObjectService.js"></script>
<script type="text/javascript"
	src="../js/concord/widgets/concordComment.js"></script>


<script type="text/javascript" src="../js/concord/main/App.js"></script>
<!-- other stuff -->
<!-- dojo styles -->
<link rel="stylesheet" type="text/css"
	href="../js/dojo1/resources/dojo.css">
<link rel="stylesheet" type="text/css"
	href="../js/dijit/themes/tundra/tundra.css">
<link rel="stylesheet" type="text/css"
	href="../js/dojox1/grid/resources/tundraGrid.css">
<link rel="stylesheet" type="text/css"
	href="../js/dojox1/layout/resources/ExpandoPane.css">
<link rel="stylesheet" type="text/css"
	href="../js/dojox1/layout/resources/ScrollPane.css">
<link rel="stylesheet" type="text/css"
	href="../styles/css/lotuslive/skin.css">
<link rel="stylesheet" type="text/css" href="../styles/css/clipShare.css">

<!-- own styles -->
<link rel="icon" href="../images/ibmdocs_favicon.png" type="image/png" />


<script type="text/javascript">	
		dojo.require("concord.beans.ObjectService");
		dojo.require("dojo.dnd.move");
		dojo.require("dojox.fx.Shadow");
		dojo.require("dojo.fx");		
	</script>
<script type="text/javascript">

		/*************************************************************
			This function retrieves the following information
			1) userSharing
			2) userViewing
			3) urlToLoadInIframe
			
			It should return true if a share id is found
		*************************************************************/
		function getParms(){			
			var searchStr = document.location.search;		
			var clipShare 		=	searchStr.substring(searchStr.indexOf('?clipShare')+11);
			if (clipShare){
				var param = {'share_id':clipShare};
				var shareObj = concord.beans.ObjectService.getRootObjects("shareclip",param);
				
				if ((shareObj) && (shareObj.length>0)){		
					var data = shareObj[0].getData();	
						
					urlToLoadInIframe 	=	decodeURIComponent(data.clip_source);	
					userSharing = data.clip_owner;
					userSharingUUID = data.clip_owner_uuid;
					userViewing = getUserViewing();
					userViewing = (userViewing)? userViewing: "anonymous";
					document.getElementById("doc_title").innerHTML ="<span style='color:#FFFF99'>"+SHARE_BY_MSG+"<b>"+userSharing+"</b></span>";
					 var clipDisplayAreaTitle = dojo.byId("clipDisplayAreaTitle");
						 clipDisplayAreaTitle.innerHTML +=SHARE_BY_MSG+" <b>"+userSharing+"</b>";;						
					return true;
				} else{
					var pluginCheckMsg = dojo.byId("checkingBrowserPlugin");
					pluginCheckMsg.innerHTML="<h2>"+SHARE_NOT_FOUND_MSG+"</h2>";
					return false;
				}			
			}else{

				var pluginCheckMsg = dojo.byId("checkingBrowserPlugin");
					pluginCheckMsg.innerHTML="<h2>"+SHARE_NOT_FOUND_MSG+"</h2>";
				return false;
			}				
		}
		
		/*************************************************************
			This function gets the user who is currently logged in
			and viewing the shared comments
		*************************************************************/
		function getUserViewing (){
			var response, ioArgs;
			url =concord.main.App.appendSecureToken(contextPath +"/api/people/") ;
			dojo.xhrGet({
				url: concord.main.App.appendSecureToken(url),
				handleAs: "json",
				handle: function(r, io) {response = r; ioArgs = io;},
				sync: true,
				noStatus: true
			});
			
			var list = new Array();
			if (response instanceof Error) {
				console.info("response error");
				return null;
			}
				
			if (response){
				return response.email;
			} else
			return null;			
		}		

		/*************************************************************
			This is the first function to run. It gets the needed
			parms and sets the stage for clip retrieval
		*************************************************************/		
		function init(){	
			var pluginCheckMsg = dojo.byId("checkingBrowserPlugin");
			dojo.style(pluginCheckMsg,{
				"display":"none"
			});
			var node =  dojo.byId("mainNode");
	
			//Ler's set up banner toggler	
			bannerToggler = new dojo.fx.Toggler({
			     node: node,
			     showFunc: dojo.fx.wipeIn,
			     hideFunc: dojo.fx.wipeOut,
			     showDuration: 1000,
			     onEnd: dojo.hitch(this,function(){
						//  showShareClips();
						//  dojo.byId('bannerButton').style.display="";
					    })
				});
			frameViewerObj		= 	document.getElementById("shareView");
			frameViewerObj.src	=	urlToLoadInIframe;				
						
		}

		/*************************************************************
			This function displays the clipdisplay area
		*************************************************************/	
		function toggleClipDisplayArea(){
		
			if (shareVisible){
				shareVisible=false;
				hideClipDisplayArea();
			}else{
				shareVisible=true;
				displayClipDisplayArea();
			}

		}	

		/*************************************************************
			This function hides the clipdisplay area
		*************************************************************/	
		function hideClipDisplayArea(){		
			dojo.style(this.clipDisplayArea,{
				"visibility":"hidden"
			});
			dojo.byId('bannerButton').innerHTML="Show shared clips";		
		}
				
		/*************************************************************
			This function displays the clipdisplay area
		*************************************************************/	
		function displayClipDisplayArea(){		
			dojo.style(this.clipDisplayArea,{
				"visibility":""
			});		
			dojo.byId('bannerButton').innerHTML="Hide shared clips";		
		}		
				
		/*************************************************************
			This function shows the clipdisplay area
		*************************************************************/	
		function openClipDisplayArea(){		
			 var clipDisplayAreaTitle = dojo.byId("clipDisplayAreaTitle");
			 var m1 = new dojo.dnd.move.parentConstrainedMoveable(this.clipDisplayArea, {area: "border", within: false, handle: clipDisplayAreaTitle.id});
			var tShadow =null;
			if (navigator.appName.toLowerCase().indexOf('microsoft')<0){ //if not IE
		   		tShadow = new dojox.fx.Shadow({ node:this.clipDisplayArea, shadowThickness: 30, shodowOffset:25}); 
			 	tShadow.startup();
			}
			dojo.style(this.clipDisplayArea,{
				"visibility":"",
				"display":"",
				"position":"absolute"				
			});
			
			if (navigator.appName.toLowerCase().indexOf('microsoft')<0){ //if not IE
			 tShadow.resize();						
			} else{
				dojo.style(clipDisplayAreaTitle,{
					'width' : '100%'
				});
			}
		}		

		/*************************************************************
			This function will retrieve the shared clips
			and also begins the building of the clip display area
		*************************************************************/	
		function showShareClips(){	
			 this.clipDisplayAreaContent = dojo.query(".clipDisplayAreaContent")[0];
			 this.clipDisplayArea = dojo.query(".clipDisplayArea")[0];			

			if (navigator.appName.toLowerCase().indexOf('microsoft')>=0) //if IE
				this.emptyThisNode(this.clipDisplayAreaContent);
			else 
				clipDisplayAreaContent.innerHTML ="";											
			openClipDisplayArea();						
			// Now to retrieve the clips
	 		var params = {'createdBy':userSharingUUID, 'clip_source':urlToLoadInIframe};
			var txtclips = concord.beans.ObjectService.getRootObjects("txtclip",params);
			var imgclips = concord.beans.ObjectService.getRootObjects("imgclip",params);
			clearLoadingMsg();				 			 
			addClipInfo(txtclips);
			addClipInfo(imgclips);			 
		}
		
		/**************************************************************
			Utility to remove child nodes
		*/
	    function emptyThisNode(node){  
	       //emptying node
	       while (node.hasChildNodes()){
	            node.removeChild(node.childNodes[0]);                   
	       }
	        return node;
	    }	
		

		/*************************************************************
			This function builds the clip display area
		*************************************************************/		
		function addClipInfo(highlights){														
			for (var i=0; i < highlights.length; i++){
				var data = highlights[i].getData();
				var clipContainerCellDiv = document.createElement("div");
				dojo.addClass(clipContainerCellDiv,"clipContainerCell");
				if (highlights[i].e.typeId=='txtclip'){
					
					var clipNodePreview = document.createElement("div");
						dojo.addClass(clipNodePreview,"clipNodePreview");
						clipContainerCellDiv.appendChild(clipNodePreview);	
											
							var txtClip = document.createElement("span");
							dojo.addClass(txtClip, "txtClip");
							txtClip.appendChild(document.createTextNode(decodeURIComponent(data.clip_html)));							
							clipNodePreview.appendChild(txtClip);	
																										
				} else if (highlights[i].e.typeId=='imgclip'){

					var tmpDiv = document.createElement('div');
					tmpDiv.innerHTML = decodeURIComponent(data.clip_html);
					
					var clipNodePreview = document.createElement("div");
						dojo.addClass(clipNodePreview,"clipNodePreview");
						clipContainerCellDiv.appendChild(clipNodePreview);								
							var imgClip = document.createElement("img");
							clipNodePreview.appendChild(imgClip);
							imgClip.src= dojo.attr(tmpDiv.firstChild,'src');
							imgClip.style.width = "120px";
							imgClip.style.height="95px";
				}
				//Add comments for this clip
				var params ={'comment_assign_uuid':data.clip_uuid,'comment_assign':'highlight'};
				
				var commentclipsArray = concord.beans.ObjectService.getRootObjects("commentclip",params);
				
				clipContainerCellDiv.appendChild(document.createElement("br"));
				
				var commentSectionDiv = document.createElement("div");
				dojo.addClass(commentSectionDiv,"commentSectionDiv");
				clipContainerCellDiv.appendChild(commentSectionDiv);
				
				for (var j=0; j < commentclipsArray.length; j++){
					var data = commentclipsArray[j].getData();
					var imgComment = document.createElement("img");
						dojo.addClass(imgComment,"imgComment");
						commentSectionDiv.appendChild(imgComment);
						imgComment.src = "js/ckeditor/_source/plugins/messages/images/NoPhoto_Person_48.png";
			         	imgComment.style.widh="25px";
			         	imgComment.style.height="25px";
				 		imgComment.border = "0" ;
				 		
				 	var commentName = document.createElement("span");
				 		dojo.addClass(commentName,"commentName");
				 		commentSectionDiv.appendChild(commentName);
				 		commentName.innerHTML ="<b>"+data.comment_owner+"</b>";
				 						 		
				 	var commentTxt = document.createElement("div");
				 		dojo.addClass(commentTxt,"commentTxt");
				 		commentSectionDiv.appendChild(commentTxt);
				 		commentTxt.appendChild(document.createTextNode(data.comment_txt));				
				}				
				postCellToDisplayArea(clipContainerCellDiv);											
			}						
		}

		function postCellToDisplayArea(cell){
			var clipDisplayAreaContent = document.getElementById("clipDisplayAreaContent");
			clipDisplayAreaContent.appendChild(cell);		
		}

		function clearLoadingMsg(){
				var msg = dojo.byId("loadingMsgDiv");
				if (msg) msg.parentNode.removeChild(msg);
		}

		function loadSharedHighlightsIniFrame()	{
			var txtclips = concord.beans.ObjectService.getRootObjects("txtclip");
			//alert( txtclips.length+ " txtclip highlights found");
			showHighlightsOnPage(txtclips);
			
			var imgclips = concord.beans.ObjectService.getRootObjects("imgclip");			
			//alert( imgclips.length+ " imgclip highlights found");						
			showHighlightsOnPage(imgclips);			
		}
				
		/*************************************************************
			getCommentCallBack is called to retrieve comments from  
			concord.
		*************************************************************/
		function getCommentCallBack(hlID){
			var commentsArray = [];
			var commentClipsItems = concord.beans.ObjectService.getRootObjects("commentclip");
			//The following for loop should be removed once server side can filter query
			for (var i=0; i< commentClipsItems.length; i++){				
				var data = commentClipsItems[i].getData();
				if (data.comment_assign_id ==hlID) {
					commentsArray.push(commentClipsItems[i]);	
				}
			}			
			return commentsArray;
		}		
		
		/*************************************************************
			saveCommentCallBack is called to save comments to  
			concord.
		*************************************************************/		
		function saveCommentCallBack(commentText, assignedToType, hlID,userViewing){
				var postData = {
		            "comment_assign": assignedToType,
		            "comment_assign_id": hlID,
		            "comment_id": "",
		            "comment_owner": userViewing,
		            "comment_txt": commentText,
		            "comment_uuid": ""
				};
				
				concord.beans.ObjectService.addObject("commentclip",postData,null);				
		}	
				
		/*************************************************************
			This function is invoked when the iFrame is done loading
		*************************************************************/		
		function iframeDoneLoading () {				
			if (ctr >= 1){	// For some reason this event is firing twice.... Need to load on second fire
				showConcordBanner();
				//showShareClips();	
			}
			ctr++;
		}


		/*************************************************************
			Display saved highlights on current page
		*************************************************************/
		showHighlightsOnPage = function(highlights) {	
		
			for (var i=0; i < highlights.length; i++){
				var data = highlights[i].getData();
				var location = eval("(" + decodeURIComponent(data.clip_location) + ")");	
				if (location){
						searchAndHighlight(decodeURIComponent(data.clip_html), location);
				} else {
					
					if  (decodeURIComponent(data.clip_html).substring(0,4).toLowerCase()=="<img") {	
					    searchAndHighlightImage(decodeURIComponent(data.clip_html),data.clip_id);
					}						
				}
			}			
		}
		
		/*************************************************************
			Display  or hide Concord Banner
		*************************************************************/		
		showConcordBanner = function(){
		  bannerToggler.show();	
		  //var node =  dojo.byId("mainNode");	
		  showShareClips();
		  dojo.byId('bannerButton').style.display="";					
		}


		/*************************************************************
			Search for image in current window and highlight
		*************************************************************/
		searchAndHighlightImage = function(imgHTML,hlID){
			var tmpNode = document.createElement('div');
			tmpNode.innerHTML = imgHTML;
			var src = tmpNode.firstChild.src;
			var frameDocumentWindow = frameViewerObj.contentWindow ;			
			var targetNode = dojo.query("img[src='"+src+"']",frameDocumentWindow.document.body);
			if (targetNode!=null && targetNode.length>0 && targetNode[0].src==src){
				showHighlightImage(targetNode[0],"highlightImage",hlID);
			}
		}

		/*************************************************************
			Show image highlight in iframe
		*************************************************************/
		showHighlightImage = function(imgNode,id,hlID){
			var frameDocumentWindow = frameViewerObj.contentWindow ;					
			var imgHasLink=false;
			var newTop = imgNode.offsetTop;
		
			if (imgNode.nodeName.toLowerCase() =="img"){
				var div = frameDocumentWindow.document.createElement("div");
				if (imgNode.parentNode.nodeName.toLowerCase()=="a"){
					imgHasLink=true;
					imgNode.parentNode.parentNode.insertBefore(div,imgNode.parentNode);
				} else{		
					imgNode.parentNode.insertBefore(div,imgNode);
				}
						
				if (id){	// If an id is given then this is simply showing existing highlights					
					div.id=id;
					div.setAttribute("ccHighlightID",hlID);
					div.setAttribute("isLink",imgHasLink);
					var divIcons = frameDocumentWindow.document.createElement("div");
					divIcons.id="divIcons";

					var imgComment = frameDocumentWindow.document.createElement("img");
					divIcons.appendChild(imgComment);
					
					imgComment.src = 'data:image/jpeg;base64,R0lGODlhEAAQAOYAAAAAAP////T0/vX1/vf3/vn5/vv7//r6/vz8//v7/v39/+/w/fDx/fP0/vP0/fX2/u3v+/f4/vP0+urt+vn6/vDy+cfP5tfd7tzh8Nvg7uXp9PP1+3eMwHqPwY2fypChzJKjzJqq0LG927O/3bXB3rjD37jD3sjR58XO5M3V6MzU59LZ69HY6dXc7d7j7+js9vT2+3KJvXWLv3WMv3SKvneNv3qQwXyRwnuRwX6Tw3+Uw4GVxISYxoOXxYibx4qdyYmcyI2fyZKkzZOlzZWnzpip0Jipz6Sz1qm32Kq416672bG+27zH4cHL4sLM4sfQ5c/X6NTb6+bq8+/y+ZaoztLa6vz9/9/l8Oft9+bs9uvw+Obt9+rw+env+Pz9/v///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAF8ALAAAAAAQABAAAAekgF+Cg4SFhFgsSSFAPkZJKYZVPTFEFi0XJ0UxOlCDKjEiEgoFEREFCjAlMU9fGTQnCQ0Ls7QOBys0UVQeCrS+tFZFIDdMB7+/BRYzPEcIx74JIjtLMVMPzwsDGzJKWjw4GgoCDAwLDgQKLzk9W19YQTE/FRATFDAYHzE+hFwoQEgGKIyIoc+JoS9dOHgh0aFJloODhgixIQUiIRM1XFgkdCWKxUAAOw==';
					imgComment.id = "hlCommentImg_"+new Date().getTime();
					dojo.style(imgComment,{
						"position":"absolute",
						"opacity":"0.7",
						"right":"30px",
						"top":"7px",
						"width":"15px",
						"height":"15px",
						"cursor":"pointer"		
					});
					
					dojo.connect(imgComment,'onclick', dojo.hitch(this,onCommentClick,imgNode,hlID));
		
					var imgHLDelete = frameDocumentWindow.document.createElement("img");
					divIcons.appendChild(imgHLDelete);
					
					imgHLDelete.src = 'data:image/jpeg;base64,R0lGODlhEAAQANUAAMczNfRxdPRzdPNydPNzddgqL+AsNN8sM8cpMOY2PuU2PsUgK+UwOfJVYPRja/NjavNja/Nka8UYJ8YZKMUZJ8YgLPJUYMUTJfE/UvA/UfJIWPFIWNRldN+cqMpdSc5uXspXRspYRslYRtWIfMlQQ9ymoMlHPslHP8hHP8c9OeBhW/WBfcc9OuNST/WAfvSAfuPExP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAADEALAAAAAAQABAAAAZ8wJhwSCwaj0eYZ1QceWBEWKgVYgpHohYIKiyRXCvSp/QhvcIl4ghFEKhMqkHgZCVyWBHIw/FIcZAACg0NFgkASDEIDBsaGgwISBwVGJSUC39FHBOUBRIFGBkUmEIdF6AXHB0cphkXHUMwFwaoQ6sHF1xCsaNCq7mIwMExQQA7';
					imgHLDelete.id = "imgHLDelete_"+new Date().getTime();
		
					dojo.style(imgHLDelete,{
						"position":"absolute",
						"opacity":"0.7",
						"right":"6px",
						"top":"7px",
						"width":"15px",
						"height":"15px",
						"cursor":"pointer"		
					});
					dojo.connect(imgHLDelete,'onclick', dojo.hitch(this,this.deleteHighlight,hlID,div,divIcons));
		
											
					if (imgHasLink){
						imgNode.parentNode.parentNode.insertBefore(divIcons,div);			
					} else{		
						imgNode.parentNode.insertBefore(divIcons,div);
					}
		
					dojo.connect (imgComment,"onmouseover", dojo.hitch(imgComment, function(thisDojo){thisDojo.style(this,{"opacity":"1","height":"17px","width":"17px"});},dojo));
					dojo.connect (imgComment,"onmouseout", dojo.hitch(imgComment, function(thisDojo){thisDojo.style(this,{"opacity":"0.7","height":"15px","width":"15px"});},dojo));
		
					dojo.connect (imgHLDelete,"onmouseover", dojo.hitch(imgHLDelete, function(thisDojo){thisDojo.style(this,{"opacity":"1","height":"17px","width":"17px"});},dojo));
					dojo.connect (imgHLDelete,"onmouseout", dojo.hitch(imgHLDelete, function(thisDojo){thisDojo.style(this,{"opacity":"0.7","height":"15px","width":"15px"});},dojo));
		
					var pos = dojo.coords(imgNode);
							
					dojo.style (div, {
						"backgroundColor":highlightBackgroundColor,
						"opacity":"0.5",
						"width":imgNode.offsetWidth+"px",
						"height":imgNode.offsetHeight+"px",
						"position":"absolute",
						"top":newTop+"px",
						"zIndex":"99990",
						"left":imgNode.offsetLeft+"px"
					});	
					
					if (imgHasLink){
						dojo.style (div, {
							"cursor":"pointer"
						});	
						var a = frameDocumentWindow.document.createElement("a");
						a.href =imgNode.parentNode.href;
									
						divIcons.appendChild(a);
						imgNode.parentNode.parentNode.insertBefore(a,div);
						a.appendChild(div);			
					}
					
					dojo.style (divIcons, {
						"backgroundColor":"transparent",
						"width":imgNode.offsetWidth+"px",				
						"position":"absolute",
						"top":newTop+"px",
						"zIndex":"99998",
						"left":imgNode.offsetLeft+"px"
					});	
					
					dojo.connect (div,"onmouseover", dojo.hitch(div, function(thisDojo){
										var anim = thisDojo.animateProperty({
												node : this,
												duration: 1000,
												properties : {
																opacity : {start: 0.5, end: 0}
															}
												});								
										anim.play();
										},dojo));
		
					dojo.connect (div,"onmouseout", dojo.hitch(div, function(thisDojo){
										var anim = thisDojo.animateProperty({
												node : this,
												duration: 1000,
												properties : {
																opacity : {start: 0, end: 0.5}
															}
												});								
										anim.play();
										},dojo));
				} else {
					var clipImageNode = frameDocumentWindow.document.getElementById("clipImage");
					if (clipImageNode!=null) clipImageNode.parentNode.removeChild(clipImageNode);		
				
					div.id="clipImage";		
					dojo.style (div, {
						"backgroundColor":this.backgroundColor,
						"opacity":"0.5",
						"width":imgNode.offsetWidth+"px",
						"height":imgNode.offsetHeight+"px",
						"position":"absolute",
						"top":newTop+"px",
						"zIndex":"99990",
						"left":imgNode.offsetLeft+"px"
					});	
					
					dojo.connect(div,"onclick",dojo.hitch(this,this.clipImage,imgNode));
				}						
			}
		}

		/*************************************************************
			Set up conconrd comment. At this point the animation
			opened up the space for the comment. Now need to 
			get concord comment object to fill the space.
		*************************************************************/
		setUpConcordComment= function(ccParentDiv,ccDojo,hlID){
		    var cc = new concordComment({"parentMainDiv":ccParentDiv,"userViewing":userViewing,"userSharing":userSharing,"ccDojo":ccDojo,"hlID":hlID,"saveCommentCallBack":ccDojo.hitch(this,saveCommentCallBack),"getCommentCallBack":ccDojo.hitch(this,getCommentCallBack)});		
		}
		
		/*************************************************************
			Handle Comment Click
		*************************************************************/
		onCommentClick = function(node,hlID){
			var frameDocumentWindow = frameViewerObj.contentWindow ;			
			var mainWindowDoc = frameDocumentWindow.document;	
			
			var args = [];
			args.push({'node':node,'hlID':hlID,'highlightCommentTracking':highlightCommentTracking});
		
			//Call a callback with different 'global' values and context.
			dojo.withDoc(mainWindowDoc, dojo.hitch(this, function(args) {
					var node = args.node;
					var hlID = args.hlID;
					var pos = dojo.coords(node);
					var ccParentDiv = dojo.doc.createElement("div");	
					ccParentDiv.id="ccParentDiv_"+new Date().getTime();
			
					dojo.doc.body.appendChild(ccParentDiv);
					args.highlightCommentTracking.push({"imgNode":node,"ccNode":ccParentDiv,"hlID":hlID});
					
					var tempLeft = pos.x+pos.w+10;
					dojo.style(ccParentDiv,{
						"position":"absolute",
						"left":	tempLeft+"px",
						"top":pos.y+"px",
						"border":"1px solid #7EABCD",
						"background":"#6AA1E4",
						"padding":"0.45em",
						"width":"305px",						
						"zIndex":"99998"
					});	
					var explode = dojo.animateProperty({
							node : ccParentDiv,
							duration: 150,
							properties : {
											height : {start: 0, end: 180},
											width  : {start : 0, end: 305},
											display: {start: "none", end:""}
											//backgroundColor: { start:"#ff0000"}
										}
							});
				  
			  		var slide = dojo.fx.slideTo({
					    node: ccParentDiv,
					    duration: 150,
					    top:pos.y,
					    left:tempLeft
					})
						 		// combine slide and explode
				    var slideexplode = dojo.fx.combine([slide, explode]);
				    dojo.connect(slideexplode,"onEnd",dojo.hitch(this,setUpConcordComment,ccParentDiv,dojo,hlID));			
				    slideexplode.play();	
			}), node,args);	
		}

		/*************************************************************
			Search for text in current window and highlight
		*************************************************************/
		searchAndHighlight = function(searchText, location){
			var startNode = getNodeFromXPath(location.startNode);
			var endNode =  getNodeFromXPath(location.endNode);			
			//alert("startNode "+startNode+"\nendNode "+endNode);
			var frameDocumentWindow = frameViewerObj.contentWindow ;
			
			if ((startNode == null) || (endNode == null))
			{
				searchAndHighlightUsingFind(frameDocumentWindow, searchText);
				return;
			}
			
			if ((location.startOffset > startNode.textContent.length) || (location.endOffset > endNode.textContent.length))
			{
				searchAndHighlightUsingFind(frameDocumentWindow, searchText);
				return;
			}
			
			var highlightRange = frameDocumentWindow.document.createRange();
				highlightRange.setStart(startNode, location.startOffset);
				highlightRange.setEnd(endNode, location.endOffset);
			
			if (searchText == highlightRange.toString())
				highlightSelection(highlightRange);
			else
			{
				searchAndHighlightUsingFind(frameDocumentWindow, searchText);
			}			
		}

		/*************************************************************
			Search for text in current window and highlight using
			window.find() function
		*************************************************************/
		searchAndHighlightUsingFind = function(thisWindow, searchText){
			if(thisWindow.find(searchText))
		    {
				//alert("searching using windows.find");
				//debugger;
				var selObj = thisWindow.getSelection(); 
				var selRange = selObj.getRangeAt(0);
				var newNode = getHighlightNode();
				selRange.surroundContents(newNode);
				
				
				selObj.removeAllRanges();
				return true;
			}
			else
			{
				//alert("Going down XPCNAtivewrapper route!!!!");
				// BE CAREFUL !!!!!! with tthis code, it looks like it could be optiomized but you may break it
				// I have to copy stuff to new vars to get the value out of the XPCNativeWrapper so I can process it.
				
				var f = thisWindow.document.getElementsByTagName("frame");
				
				if (f==null || f.length < 1)
					return; // no more frames
				
				var uw = null;
				if (f instanceof XPCNativeWrapper)
					uw = f.wrappedJSObject;
				else
					uw = f;
				
				var n = uw[0];
				var l = uw.length;
				
				for (var i = 0; i < l; i++)
				{
					n = uw[i];
					var n1 = n.name;
					var cw = n.contentWindow;
					if (searchAndHighlightUsingFind(cw, searchText))
						return true;
				}
			}
			
			return false;
		}

		/*************************************************************
			Get the DOM node from the specified XPath
		***************************************************************/
		getNodeFromXPath = function(xPath){
			//alert("getXpath for "+xPath);
			var frameDocument = frameViewerObj.contentWindow ;

			if (frameDocument.document == null){
				//alert("iframe.document is null");
				return null;
			}					
			var nodes = frameDocument.document.evaluate(xPath, frameDocument.document, null, XPathResult.ANY_TYPE, null);
			return nodes.iterateNext();
		}

		/*************************************************************
			Highlight selected text given a range
		*************************************************************/
		highlightSelection = function(highlightRange)
		{
			highlightNodeId = "santhighlight";
			if (highlightRange == null)
				highlightRange =  frameViewerObj.contentWindow.content.getSelection().getRangeAt(0);
			
			
			var textNodes = new Array(); //array of all text nodes
			var microformats = new Array(); //array of microformat locations
			
			//find all text nodes within the node
			var filter = {
					acceptNode: function(node)
					{
						var isInsideRange = highlightRange.comparePoint(node, 0);
						if ((isInsideRange == 0) || (highlightRange.startContainer.isSameNode(node)) || (highlightRange.endContainer.isSameNode(node)))
							return NodeFilter.FILTER_ACCEPT;
						else
						{
							this.previousTreeNode = node;
							return NodeFilter.FILTER_SKIP;
						}
					}
				};
			
			var treeWalker = frameViewerObj.contentWindow.document.createTreeWalker(highlightRange.commonAncestorContainer, NodeFilter.SHOW_TEXT, filter, false);
			
			do
			{
				if ((treeWalker.currentNode.nodeType == Node.TEXT_NODE) && (treeWalker.currentNode.parentNode.id != highlightNodeId))
				{
					var startNodeChanged = false;
					var endNodeChanged = false;
					
					//highlight node
					var newRange = frameViewerObj.contentWindow.document.createRange();
					newRange.selectNode(treeWalker.currentNode);
					
					if (treeWalker.currentNode.isSameNode(highlightRange.startContainer))
					{
						newRange.setStart(highlightRange.startContainer, highlightRange.startOffset);
						startNodeChanged = true;
					}
					
					if (treeWalker.currentNode.isSameNode(highlightRange.endContainer))
					{
						newRange.setEnd(highlightRange.endContainer, highlightRange.endOffset);
						endNodeChanged = true;
					}
					
					
					var highlightNode = getHighlightNode();
					newRange.surroundContents(highlightNode);
					
					if (startNodeChanged)
					{
						highlightRange.setStart(highlightNode.firstChild, 0);
					}
					
					if (endNodeChanged)
					{
						highlightRange.setEnd(highlightNode.firstChild, highlightNode.firstChild.textContent.length);
					}
					
					newRange.detach();
					
					if (this.previousTreeNode != null)
						treeWalker.currentNode = this.previousTreeNode;
				}
				else
					this.previousTreeNode = treeWalker.currentNode;
			}
			while (treeWalker.nextNode())

		}

		/*************************************************************
			Create new DOM node that highlights text
		*************************************************************/
		getHighlightNode = function()
		{
			var highlightNode = frameViewerObj.contentWindow.document.createElement("span");
				highlightNode.id = "santhighlight";
				//highlightNode.style.color = this.fontColor;
				highlightNode.style.backgroundColor = highlightBackgroundColor;
			
			return highlightNode;
		}



		dojo.addOnLoad(function() {
			preInit();
			//init();

		});
		
		
		/**************************************************************
			Checking for highlighter plugin
		***************************************************************/
		preInit = function(){
			//debugger;
			if (!getParms())
				return;
			//document.body.santoriniPluginDetection = null;
			var timerCtr =1;
			var timer = setInterval(function() {
				try{console.log("clipShareview.js :: preInit()"," Checking santorini plugin status... attempt  "+(timerCtr++));}catch(e){}	
				if (navigator.appName.toLowerCase().indexOf('microsoft')>=0){ //if  IE	{
					timerCtr=TIMEOUT_VALUE; //IE so force out
					//Also let's set IE specific properties
 					this.clipDisplayAreaContent = dojo.query(".clipDisplayAreaContent")[0];
 					dojo.style(this.clipDisplayAreaContent,{
 						'overflow': 'auto'
 					});		
					this.pluginmessage = dojo.query(".pluginmessage")[0];
	 				this.pluginmessage = this.emptyThisNode(this.pluginmessage);
	 				this.pluginmessage.innerText =this.IE_PLUGIN_MSG;							
				}
			    if ((document.body.santoriniPluginDetection) || (timerCtr >= TIMEOUT_VALUE)) { 
			        if (timerCtr>=TIMEOUT_VALUE){
				        clearInterval(timer);					
			        	timerCtr=1;
						try{console.log("CLIP plugin.js :: preInit()"," Timeout. Santornini plugin not detected");}catch(e){}									
						init();
			        }else if (document.body.santoriniPluginDetection){
				        clearInterval(timer);					
						try{console.log("CLIP plugin.js :: preInit()"," Timeout. Santornini plugin is detected");}catch(e){}	
						document.body.santoriniPluginDetection.initLoadAndShowOtherUserHighlights(urlToLoadInIframe,userSharing,userSharingUUID);
					}
			    }
			}, 1000);
		}				
	</script>

<style type="text/css">
            .divstyle {
                z-index: 100;
                position: absolute;
                background-color: #999999;
            }
		</style>
<style type="text/css">
		
			body {
				margin:auto;
				width:100%			
			}
		
			div.header {
				-moz-border-radius-topleft:10px;
				-moz-border-radius-topright:10px;
				background:url("images/banner_black.gif") repeat-x scroll 0 0 #000000; /* TODO: need to replace this gif*/
				border-color:-moz-use-text-color;
				border-style:none;
				border-width:2px 2px medium;
				padding:5px 10px 0px 10px;
				height:42px;
				color:#FFFF99;
			}				
			
			div.header h1 {
				background:transparent url(images/highlight.png) no-repeat scroll 3px 4px;
				color:#FFFFFF;
				float:left;
				font-size:1.8em;
				font-weight:normal;
				margin:0px 0px 0px 0px;
				padding:3px 0px 6px 50px;
			}
			a:link {
				color: #ffffff;
				text-decoration: none;
			}
			a:visited {
				color: #ffffff;
				text-decoration: none;
			}			
			a:hover {
				color: #ffffff;
				text-decoration: underline;
			}			
		</style>

</head>
<body class="tundra">

	<div id="mainNode" class="wrapper" style= "display:none;">
		<div class="header">
			<h1 id="doc_title">test</h1>
			<div class="clear"></div>
			<div id = "bannerButton" class='bannerButton' onclick="toggleClipDisplayArea();" style= "display:none; color:#FFFF99; cursor:pointer;"> Hide shared clips</div>

			<div align="right" style="color: rgb(255, 255, 153);; position: relative; top: -25px; font-size: 1.2em;">
				For a richer experience
			</div>
			<div  align="right" style="color: white; position: relative; top: -24px; font-size: 1.2em;">
			    <a style="color: rgb(255, 255, 153);" href="http://santorini3.raleigh.ibm.com/spmec/index.html"><span class="pluginmessage">click here to get plugin</span></a>
			</div>
		</div>
	</div>
	<div id ="clipDisplayArea" class ="clipDisplayArea" style= "display:none;"> 
		<div id="clipDisplayAreaTitle" class ="clipDisplayAreaTitle">
			<span onclick="shareVisible=true; toggleClipDisplayArea();">
				<img style="cursor: pointer; position: absolute; top:6px; right:5px; width:15px; height:15px; border:0px" src ="../images/close_sel.gif"/>				
			</span>
		</div>
		<div id="clipDisplayAreaContent" class ="clipDisplayAreaContent">
			<div id ="loadingMsgDiv" class="loadingMsg">
				<img src="images/loading32.gif" style="width:15px; height:15px; border:0px"/>
				<h2 style = "position:relative; top:-37px; left: 20px;"> Loading shared clips...</h2>
			</div>
		
		</div>
	</div>
	<div id='checkingBrowserPlugin' style="font-size:1.5em;"><img src='../images/loading32.gif'/> Checking for IBM Lotus Project Concord Web Clipping plugin...</div>
	<iframe id="shareView" width="100%" height="100%"onload="iframeDoneLoading()" style="border: 0px none;">
		<p>Your browser does not support iframes.</p>
	</iframe>
</body>
</html>

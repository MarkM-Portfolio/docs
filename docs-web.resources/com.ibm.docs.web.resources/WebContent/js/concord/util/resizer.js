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

dojo.provide("concord.util.resizer");

dojo.require("concord.util.events");

concord.util.resizer.slideSorterWidth = 233;//wj
concord.util.resizer.sideBarWidth = 250;
concord.util.resizer.speakerNotesBarHeigth 		= 100;

concord.util.resizer.initPresUI = function() {
	concord.util.resizer.performResizeActions();
};

concord.util.resizer.browserWindowResized = function(e) {
	if (dojo.isIE <9) {
		if (window.pe.scene.validResize) {
			concord.util.resizer.performResizeActions();
			concord.widgets.sidebar.SideBar.resizeSidebar();  
		}
	} else {
		concord.util.resizer.performResizeActions();
		concord.widgets.sidebar.SideBar.resizeSidebar();  
	}
};

concord.util.resizer.performResizeActions = function(w,sw) {
	var winHeight = concord.util.resizer.getBrowserHeight();
	var winWidth = concord.util.resizer.getBrowserWidth();
	
	if(w!=null){
		concord.util.resizer.sideBarWidth = w;
	}
	if(sw!=null){
		concord.util.resizer.slideSorterWidth = sw;
	}
	if(concord.util.browser.isMobile() && concord.util.mobileUtil.useNativeSlideSorter){
		concord.util.resizer.sideBarWidth = 0;
		concord.util.resizer.slideSorterWidth = 700;
	}
	var presEditor = dojo.byId('presEditor');
	var originalPresEditorHeight = parseFloat(presEditor.style.height);
	var speakerNotes = dojo.query('[presentation_class = "notes"]', dojo.byId("slideEditorContainer"))[0];
	var speakerNotesHeight = 0;
	if (speakerNotes) {
		speakerNotesHeight = parseFloat(speakerNotes.style.height);
	}
	var presEditorTbl = dojo.byId('presEditorTbl');
	var slideSorterContainer = dojo.byId('slideSorterContainer');
	var slideEditorContainer = dojo.byId('slideEditorContainer');
	var leftPanel = dojo.byId('leftPanel');
	var rightPanel = dojo.byId('rightPanel');	
	var topTab = dojo.byId('topTabDiv');
	var topTabHeight =0;
	if(topTab!=null){
		var topTabHeight = topTab.offsetHeight;
	}
	if(presEditor!=null){
		var dimData = concord.util.resizer.calcDimensions(presEditor);
		var presEditorWidth = winWidth - dimData.left;
		var presEditorHeight = winHeight - dimData.top; 
		presEditor.style.width = presEditorWidth + 'px';
		presEditor.style.height = presEditorHeight + 'px';
		
		
		if(topTab!=null){
			topTab.style.width = concord.util.resizer.slideSorterWidth + 'px';
		}
		
		leftPanel.style.maxWidth = concord.util.resizer.slideSorterWidth + "px";
		leftPanel.style.width = concord.util.resizer.slideSorterWidth + 'px';
		if (rightPanel){
			rightPanel.style.maxWidth = concord.util.resizer.sideBarWidth + "px";
		} else {
			concord.util.resizer.sideBarWidth = 0;
		}
		
		if(window.pe.scene.sceneInfo.mode =="view"){
			var slidesorterContainerWidthInt =  concord.util.resizer.slideSorterWidth;
			slideSorterContainer.style.width = slidesorterContainerWidthInt*1 + 1;
			slideSorterContainer.style.height = (presEditorHeight - topTabHeight) + 'px';
		}
		else{
			var slideSorterPane = dojo.byId('sidebar_slidesorter_pane');
			if(slideSorterPane!=null){
				slideSorterPane.style.height = (presEditorHeight) + 'px';
				slideSorterPane.style.width = concord.util.resizer.slideSorterWidth + 'px';
				slideSorterPane.style.position = "relative";
				//adjust slideSorterPane
					var slideSorterPaneHeight =dojo.getComputedStyle(slideSorterPane).height;
					var slideSorterPaneHeightInt = concord.util.resizer.getIntPropertyStyleValue(slideSorterPaneHeight);
					var slideSorterPanePaddingTop = dojo.getComputedStyle(slideSorterPane).paddingTop;
					var slideSorterPanePaddingTopInt = concord.util.resizer.getIntPropertyStyleValue(slideSorterPanePaddingTop);
					var slideSorterPanePaddingBottom = dojo.getComputedStyle(slideSorterPane).paddingBottom;
					var slideSorterPanePaddingBottomInt =concord.util.resizer.getIntPropertyStyleValue(slideSorterPanePaddingBottom);
					var slideSorterToolDiv = dojo.byId('id_slidesorter_tool_div');
					var slideSorterToolDivHeightInt = concord.util.resizer.calcAssignmentDivs(slideSorterToolDiv);
					var slideSorterContainerHeight = slideSorterPaneHeightInt - slideSorterToolDivHeightInt; 
					if(slideSorterContainerHeight>0){
						slideSorterContainer.style.height = slideSorterContainerHeight+'px';
					}
			}
			//adjust right comments sideBar
			var commentsSideBar = dojo.byId('ll_sidebar_div');
			if(commentsSideBar!=null){
				commentsSideBar.style.height = (presEditorHeight) + 'px';
				commentsSideBar.style.position = "relative";
			}
		}
		var newW = winWidth - concord.util.resizer.sideBarWidth - concord.util.resizer.slideSorterWidth - 3; 
		var slideEditorContainerDimData = concord.util.resizer.calcDimensions(slideEditorContainer);
		var notesBar = document.getElementById("speakerNotesContainer");
		slideEditorContainer.style.width = newW + 'px';
		slideEditorContainer.style.height = (presEditorHeight - 20) + 'px';
		var slideEditorCell = dojo.byId("slideEditorCell");
		slideEditorCell.style.width = newW + 'px';
		if(dojo.isWebKit){
			var slideSorterCell = dojo.byId('cke_contents_editor1');
			var sidebarEditorsPane = dojo.byId('sidebar_slidesorter_pane');
			if ( slideSorterCell != null && sidebarEditorsPane != null ){
				dojo.style(slideSorterCell,'max-width',dojo.style(sidebarEditorsPane,'width') +'px');
			}
		}
		var eventData = [{'eventName': 'windowResized','presEditorHeight':originalPresEditorHeight,'speakerNotesHeight':speakerNotesHeight}];
		concord.util.events.publish(concord.util.events.presSceneEvents_Resize, eventData);
	}
};

concord.util.resizer.calcAssignmentDivs = function(element) {
	var divHeightInt = 0;
	var divPaddingTopInt = 0;
	var divPaddingBottomInt = 0;				
	if(element && element.style.display != "none"){
		var divHeight =dojo.getComputedStyle(element).height;
		divHeightInt = concord.util.resizer.getIntPropertyStyleValue(divHeight);
		var divPaddingTop = dojo.getComputedStyle(element).paddingTop;
		divPaddingTopInt = concord.util.resizer.getIntPropertyStyleValue(divPaddingTop);
		var divPaddingBottom = dojo.getComputedStyle(element).paddingBottom;
		divPaddingBottomInt =concord.util.resizer.getIntPropertyStyleValue(divPaddingBottom);				
	}
	return divHeightInt = divHeightInt + divPaddingTopInt + divPaddingBottomInt;
};

concord.util.resizer.calcDimensions = function(element) {
	
	var nodePositionX = 0;
	var nodePositionY = 0;
	
	// reference to the dom node
	var tempNode = element;

	// get the actual width and height
	var data = new Object();
	data.width = tempNode.offsetWidth;
	data.height = tempNode.offsetHeight; 
	
	// from current element treverse up and accumulate the top and left offset
	while( tempNode)
	{
		nodePositionX += tempNode.offsetLeft;
		nodePositionY += tempNode.offsetTop;
		tempNode = tempNode.offsetParent;
	}

	data.top = nodePositionY;
	data.left = nodePositionX;
	
	return data;
};

concord.util.resizer.getBrowserWidth = function() {
	return dojo.window.getBox().w;
};

concord.util.resizer.getBrowserHeight = function() {
	return dojo.window.getBox().h;
};

concord.util.resizer.getSlideEditorPosition = function() {
	return dojo.position('slideEditorCell',true);
};

concord.util.resizer.getRatio = function(v1, v2) {
	return v1 / v2;
};

concord.util.resizer.getIntPropertyStyleValue = function(propValStr){
	var intVal = 0;
	if(propValStr !=null){
		var pxIdx = propValStr.indexOf("px");
		if(pxIdx >0){
			intVal = parseFloat(propValStr.substring(0, pxIdx));
		}
	}
	return intVal;
	    
};


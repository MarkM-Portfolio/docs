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

dojo.provide("concord.util.A11YUtil");
dojo.require("dojo.i18n");
dojo.requireLocalization("concord.util", "a11y");

dojo.declare("concord.util.A11YUtil", null, {
	labelMap: null,
	nlsLabels: null,
	PRES_A11Y_ROLES: null,

    constructor: function(data) {
    	this.init(); 
    	
    	// map of presentation class to text box type for aria-labelledby
    	labelMap = {'title': 'P_arialabel_Title', 
    			'subtitle': 'P_arialabel_Subtitle',
    			'outline': 'P_arialabel_Outline'};
    	
    	// map of "id" to translated strings (defined in "nls/a11y.js")
    	nlsLabels = {'P_arialabel_Title': 'aria_slide_title', 
    			'P_arialabel_Subtitle': 'aria_slide_subtitle',
    			'P_arialabel_Outline': 'aria_outline',
    			'P_arialabel_Textbox': 'aria_textbox',
    			'P_arialabel_Speakernotes': 'aria_presentation_notes',
    			'P_arialabel_Table': 'aria_table',
    			'P_arialabel_Image': 'aria_image',
    			'P_arialabel_Shape': 'aria_shape',
    			'P_arialabel_PressEnterToEdit': 'aria_press_enter_to_edit'} ;
    },
         
     init: function(){
    	 this.subscribeToEvents();    	
     },
     
     /**
      * Loads the json str into an object.  This includes the roles and labels
      * for the corresponding nodes specified.
      * 
      * NOTE:  Removed sidebar node as the common team is handling those ARIA labels
      */
     _loadPresRoles: function(){
 	
    	 var a11ySTRINGS = dojo.i18n.getLocalization("concord.util", "a11y");

    	 this.PRES_A11Y_ROLES = {    	 
     		"ariaRoles":
     			[
     				{
     					"nodeId"   : "banner",
     					"attributes":	{
     										"role":"banner",
 											"aria-labelledby":"doc_title_text"
 										 }
     				},
     				{
     					"nodeId"   : "mainNode",
     					"attributes":{
     									"role":"main"
     								  }
     				},
     				{
     					"nodeId"   : "footer",
     					"attributes":{
     									"role":"complementary",
     									"aria-labelledby" :"footer"
     								  }
     				},
     				
     				{
     					"nodeId"   : "menubar",
     					"attributes":{
     									"role":"menubar",
     									"aria-label" : a11ySTRINGS.aria_menubar_label
     								  }
     				},
     				{
     					"nodeId"   : "toolbar",
     					"attributes":{
     									"role":"toolbar",  
     									"aria-label" : a11ySTRINGS.aria_toolbar_label
     								  }
     				},  
 	   				{
     					"nodeId"   : "slideEditorContainer",
     					"attributes":{
     									"role":"region",
         								"aria-label" : a11ySTRINGS.aria_slide_editor_label
     								  }
     				}      
     			]    	 
      };

     },
     
     /**
      * Applies the json object to the presentation scene
      */
     applyPresRoles: function(){
    	 
    	 if (this.PRES_A11Y_ROLES == null) {
    		 this._loadPresRoles();
    	 }
    	 
    	 var roles = this.PRES_A11Y_ROLES.ariaRoles;
    	 
    	 for (var i=0; i < roles.length;i++){
    		 var nodeData = roles[i];
    		 var node = dojo.byId(nodeData.nodeId);
    		 if (!node){
    			 continue;
    		 }
    		 var attrArray = nodeData.attributes;
    		 for (var attrName in attrArray){
    			 dojo.attr(node,attrName,attrArray[attrName]);
    		 }    		 
    	 }
     },

     /**
      *  List of events this utility is listening to
      */
     subscribeToEvents: function(){
    	 concord.util.events.subscribe(concord.util.events.slideSorterEvents, null, dojo.hitch(this,this.handleSubscriptionEventsForSorter));
     },
     /**
      *  Handle events from pub/sub model from Slide Sorter
      */
     handleSubscriptionEventsForSorter: function(data){
		 if (data.eventName==concord.util.events.slideSorterEvents_eventName_slidesLoaded){
			 this.applyPresRoles();
	     }         
     }

});

(function(){
        ACCUtil = new concord.util.A11YUtil();   
})();

//create a11y translated strings in the dom (called from PresDocScene)
concord.util.A11YUtil.createLabels = function(element,doc) {

	var a11ySTRINGS = dojo.i18n.getLocalization("concord.util","a11y");

	if (!doc)
		doc = dojo.doc;

	if(element!=null) {

		var a11yDiv = doc.createElement('div');
		a11yDiv.setAttribute('id', 'P_aria_labels');
		
		// Do not use visibility hidden for these as it reserves space on the page
		// even though it is not visible.  This will cause scroll bars to appear.
		// Instead use style="display:none"
		dojo.style(a11yDiv,'display', 'none');
		element.appendChild(a11yDiv);

		for (var labelID in nlsLabels) {
			var labelElem = doc.createElement('label');
			labelElem.setAttribute('id', labelID);
			dojo.style(labelElem,'display', 'none');
			labelElem.appendChild(doc.createTextNode(a11ySTRINGS[nlsLabels[labelID]]));
			
			a11yDiv.appendChild(labelElem);
		}
	}
};

//map presentation class to NLS label id
concord.util.A11YUtil.getLabel = function(presClass) {
	
	if(presClass!=null) {
		var label = labelMap[presClass.toLowerCase()];
		if (label)
			return label;
		else
			return "";
	}
};


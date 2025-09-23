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

dojo.provide("concord.main.Settings");


dojo.declare("concord.main.Settings", null, {
	TOOLBAR: 'toolbar',
	SIDEBAR: 'sidebar',
	PANEL: 'default_panel',
	ASSIGNMENT: 'show_assignment',
	INDICATOR: 'show_indicator',
	CARRIAGERETURN:'show_carriage_return',
	BOOKMARK:'show_bookmark',
    NAVIPANEL: 'show_navi_panel',
	AUTOCOMPLETE:'auto_complete',
	WIDTH: 'fixed_width',
	FORMULA: 'formula',
	AUTOSPELLCHECK: 'auto_spellcheck',
	SHOWUNSUPPORTEDFEATURE: 'show_unsupported_feature', //same string as in SettingsProperty.java
	SHOWWELCOME: 'show_welcome',
	FILEFORMAT: 'file_format',
	DEFAULT_FILEFORMAT: 'ms',
	
	settings: null,
	prefix: null,
	url: null,
	
	MENUBAR_NONE: 0,
	
	TOOLBAR_NONE: 0,
	TOOLBAR_BASIC: 1,
	TOOLBAR_ADVANCED: 2,
	
//	SIDEBAR_CLOSE: 0,
	SIDEBAR_OPEN: 1,
	SIDEBAR_COLLAPSE: 2,
	SIDEBAR_TC: 3,

	FEATURE_SHOW: 1,
	FEATURE_HIDE: 2,
	
	PANEL_TASK: 0,
	PANEL_SLIDE: 1,
	PANEL_COMMENTS: 2,
	
	UIMODE_FULL: 0,
	UIMODE_LITE: 1,
	
	constructor: function()
	{
		this.settings = window.settings;	
		this.url = contextPath + "/api/people";	
	    
		//override saved settings by query parameters
		var params = concord.util.uri.getRequestParameters();
		if("lite" == params.uimode)
		{
			params.notoolbar = params.nomenu = params.noformula = params.nosidebar = true;
			this.settings.uimode = this.UIMODE_LITE;
		}
		// force to hide side bar when opens in mobile browser
		if (concord.util.browser.isMobileBrowser())
		{
			params.nosidebar = true;
		}
		if (this.settings) {
			if( params.notoolbar )this.settings.toolbar = "hide";
			if( params.nomenu )this.settings.menubar = "hide";
			if( params.noformula )this.settings.formula = "hide";
			if( params.nosidebar )this.settings.sidebar = "collapse";	  
		}
	},
	
	setDocType: function(type)
	{
		this.prefix = type + "_";
	},
	
	  getAutoSpellCheck: function()
	  {
		    if(this.settings)
		    {
		    	return "yes" == this.settings.auto_spellcheck;
		    } 
		    return false;
	  },	

	  getMenubar: function()
	  {
		    if(this.settings)
		    {
		    	return "hide" != this.settings.menubar;
		    } 
		    return true;
	  },

	  getUIMode : function()
	  {
		  if( this.settings.uimode )
			  return this.settings.uimode;
		  return this.UIMODE_FULL;
	  },/**
  * 0 -- None, 1 -- Basic, 2 -- Advanced
  *	TOOLBAR_NONE: 0, TOOLBAR_BASIC: 1, TOOLBAR_ADVANCED: 2,
  */
  getToolbar: function()
  {
    if(this.settings)
    {
    	switch(this.settings.toolbar)
    	{
    		case 'hide':
    		  return this.TOOLBAR_NONE;   
    		case 'advanced':
    		  return this.TOOLBAR_ADVANCED;   
    		case 'basic':
    		  return this.TOOLBAR_BASIC;  
    		default:
    		  break; 
    	}
    } 
    return this.TOOLBAR_BASIC;   
  },
  
  /**
  * 0 -- close, 1 -- open, 2 -- collapse, 3 -- trackChange
  *	SIDEBAR_CLOSE: 0, SIDEBAR_OPEN: 1, 	SIDEBAR_COLLAPSE: 2, SIDEBAR_TC: 3
  */
  getSidebar: function()
  {    
    if(this.settings)
    {
      switch(this.settings.sidebar)
      {      	  
      	case 'tc':
      	  return this.SIDEBAR_TC;
      	case 'collapse': 
      	  return this.SIDEBAR_COLLAPSE;
      	case 'open':  
      	default: 	
      	  return this.SIDEBAR_OPEN;
      }
    }    
    return this.SIDEBAR_OPEN;
  },
  
  /**
   * 1 -- show, 2 -- hide
   * FEATURE_SHOW: 1, FEATURE_HIDE: 2
   * @param fVersion, the format should be feature_133 
   */
   getShowNewFeature: function(fVersion)
   {    
     if(this.settings)
     {
       if(this.settings[fVersion] == undefined) 
    	   return this.FEATURE_SHOW;
       switch(this.settings[fVersion])
       {      	  
       	case 'show': 
       	  return this.FEATURE_SHOW;
       	case 'hide':
       	default: 	
       	  return this.FEATURE_HIDE;
       }
     }    
     return this.FEATURE_SHOW;
   },
  
  /**
  * 0 -- Task Panel, 1 -- Slide Panel, 2 -- Comments Pannel 
  *	PANEL_TASK: 0, PANEL_SLIDE: 1, PANEL_COMMENTS: 2,	
  */
  getDefaultPanel: function()
  {
  	if(pe.scene.docType == "pres")
  	{
  		return this.PANEL_SLIDE;    
  	}
  	
    if(this.settings)
    {
      switch(this.settings.default_panel)
      {      	  
      	case 'task':
      	  return this.PANEL_TASK;
      	case 'slide': 
      	  return this.PANEL_SLIDE;
      	case 'comments':      	    	    
      	  return this.PANEL_COMMENTS;
      	default: 	
      	  break;
      }
    }  
    
    // default panel if no settings    	
    return this.PANEL_TASK;
  },
  
  /**
  * true  -- show assignment, 
  * false -- don't show assignment
  */
  getAssignment: function()
  {
    if(this.settings && this.settings.show_assignment == 'no')
      return false;
    return true;  
  },
  
  /**
   * true -- show Carriage Return
   * false -- don't show Carriage Return
   */
  getCarriageReturn: function()
   {
 	  if(this.settings && this.settings.show_carriage_return == 'yes')
 	  	  return true;
 	  return false;
   },
   /**
    * true -- show Book mark node
    * false -- hide Book mark node
    * @returns
    */
   getShowBookMark: function()
   {
	   if(this.settings && this.settings.show_bookmark == 'yes')
	 	  	 return true;
	   return false;
   },

   /**
    * true -- show navigation panel
    * false -- hide navigation panel
    * @returns
    */
   getShowNaviPanel: function()
   {
	   if(this.settings && this.settings.show_navi_panel == 'yes')
	 	  	 return true;
	   return false;
   },
   
  /**
  * true -- show indicator, 
  * false -- don't show indicator
  */
  getIndicator: function()
  {
	  if(this.settings && this.settings.show_indicator == 'no')
	  	  return false;
	  return true;	  
  },
  
  /**
   * true -- enable auto complete, 
   * false -- disable auto complete
   */
   getAutoComplete: function()
   {
 	  if(this.settings && this.settings.auto_complete == 'yes')
 	  	  return true;
 	  return false; 
   },
  
  /**
  * true  -- use fixed width for page, 
  * false -- don't use fixed width for page
  */
  getFixedWidth: function()
  {
  	if (this.settings && this.settings.fixed_width == 'no')
  	  return false;
  	return true;  
  },
  
  /**
  * true  -- Show Formula Bar
  * false -- Don't Show Formula Bar
  */
  getFormula: function()
  {
    if(this.settings && this.settings.formula == 'hide')
      return false;
    return true;    	
  },
  
/**
  * true  -- show unsupported feature dialog, 
  * false -- don't show unsupported feature dialog
  */
  getShowUnsupportedFeature: function()
  {
    if(this.settings && this.settings[this.SHOWUNSUPPORTEDFEATURE] == 'no')
      return false;
    return true;  
  },
  
/**
  * true  -- show welcome dialog, 
  * false -- don't show welcome dialog
  */
  getShowWelcome: function()
  {
    if(this.settings && this.settings[this.SHOWWELCOME] == 'no')
      return false;
    return true;  
  },
  
  _doGet: function()
  {
	  var url = this.url + "?method=getPreferenceInfo";
      url = url + "&docType=" + pe.scene.docType;
      var response = null;
      dojo.xhrGet({
          url: url,
          handleAs: "json",
          timeout: 30000,
          sync: true,
          preventCache: true,
          handle: function(r, io){
              response = r;
          }
      });      
      if (response instanceof Error) {
          return null;
      }
      return response;
  },  
  
  getFileFormat: function()
  {
	var settings = this._doGet();
	if(settings && settings[this.FILEFORMAT]){
		this.settings[this.FILEFORMAT] = settings[this.FILEFORMAT];
	}
	if(this.settings && this.settings[this.FILEFORMAT])
	  return this.settings[this.FILEFORMAT];
	return this.DEFAULT_FILEFORMAT;  
  },
  
  /////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  _doPost: function(k, v)
  {
 		dojo.xhrPost({
   			url: this.url + "?method=" + k ,
   			handleAs: "text",
   			handle: function(r, io) {},
   			sync: false,
   			preventCache: true,
        contentType: "text/plain; charset=UTF-8",
        putData: v,
        noStatus: true,
        failOk: true
   	});	  	
  },
  
  
  setAutoSpellCheck: function(enable)
  {
	  var check = enable? 'yes': 'no';
	  this.settings.auto_spellcheck = check;
	  this._doPost(this.prefix + this.AUTOSPELLCHECK, check);
  },	
  
  /**
   * 0 -- hide, other number -- show
   */
  setMenubar: function(bar)
  {
	  if(this.MENUBAR_NONE == bar)
		  this.settings.menubar = 'hide';
	  
	  this._doPost(this.prefix + this.MENUBAR, status);
  },
  
  /**
  * 0 -- None, 1 -- Basic, 2 -- Advanced
  *	TOOLBAR_NONE: 0, TOOLBAR_BASIC: 1, TOOLBAR_ADVANCED: 2,
  */
  setToolbar: function(bar)
  {
  	var status = 'basic';
  	switch(bar)
  	{
  		case this.TOOLBAR_NONE:
  		status = 'hide';
  		break;  		
  		case this.TOOLBAR_ADVANCED:
  		status = 'advanced';
  		break;
  		case this.TOOLBAR_BASIC:
  		break;
  		default:
  		break;
  	}
  	this.settings.toolbar = status;
    this._doPost(this.prefix + this.TOOLBAR, status);
  },
  
  /**
  * 0 -- close, 1 -- open, 2 -- collapse
  *	SIDEBAR_CLOSE: 0, SIDEBAR_OPEN: 1, 	SIDEBAR_COLLAPSE: 2,  
  */
  setSidebar: function(bar)
  {
  	var status = 'open';
  	switch(bar)
  	{
  		case this.SIDEBAR_OPEN:
  			break;  		
  		case this.SIDEBAR_COLLAPSE:
	  		status = 'collapse';
	  		break;
  		case this.SIDEBAR_TC:
  			status = 'tc';
  	  		break;
//  		case this.SIDEBAR_CLOSE:
//  		status = 'close';
//  		break;
  		default:
  		break;
  	}
  	this.settings.sidebar = status;
    this._doPost(this.prefix + this.SIDEBAR, status);  	
  },
  /**
   * 1 -- show, 2 -- hide
   * FEATURE_SHOW: 1, FEATURE_HIDE: 2  
   * @param fVersions, the format should be [feature_133, feature_134] 
   */
   setShowNewFeature: function(fStatus, fVersions)
   {
   	var status = 'show';
   	if(fStatus == this.FEATURE_HIDE){
   		status = 'hide';
   	}
   	if(!fVersions) return;
   	for (var i=0; i<fVersions.length; i++) {
   		var feature = this.prefix + fVersions[i];
   		if (this.settings[fVersions[i]] != status) {
   			this.settings[fVersions[i]] = status;
   			this._doPost(feature, status);
   		}
   	}
   }, 
  /**
  * 0 -- Task Panel, 1 -- Slide Panel, 2 -- Comments Pannel 
  *	PANEL_TASK: 0, PANEL_SLIDE: 1, PANEL_COMMENTS: 2,	  
  */
  setDefaultPanel: function(pane)
  {
  	var status = 'task';
  	switch(pane)
  	{
  		case 0:
  		break;
  		case 1:
  		status = 'slide';
  		break;
  		case 2:
  		status = 'comments';
  		default:
  		break;
  	}
  	this._doPost(this.prefix + this.PANEL, status);  	
  },
  
  /**
  * true  -- show assignment, 
  * false -- don't show assignment  
  */
  setAssignment: function(show)
  {
  	var status = 'yes';
  	if(!show) status = 'no';
  	
  	this._doPost(this.prefix + this.ASSIGNMENT, status);  	
  },
  
  /**
   * true -- show Carriage Return, 
   * false -- don't show Carriage Return
   */
   setCarriageReturn: function(show)
   {
   	var status = 'yes';
   	if(!show) status = 'no';
   	
   	this._doPost(this.prefix + this.CARRIAGERETURN, status);
   },
   /**
    * true -- show book mark
    * false -- hide book mark
    * @param show
    */
   setShowBookMark: function( show )
   {
	 	var status = 'yes';
	   	if(!show) status = 'no';
	   	
	   	this._doPost(this.prefix + this.BOOKMARK, status); 
   },
   /**
    * true -- show navigation panel
    * false -- hide navigation panel
    * @param show
    */
   setShowNaviPanel: function( show )
   {
	 	var status = 'yes';
	   	if(!show) status = 'no';
	   	
	   	this._doPost(this.prefix + this.NAVIPANEL, status); 
   },   
  /**
  * true -- show indicator, 
  * false -- don't show indicator  
  */
  setIndicator: function(show)
  {
    dojo.publish("com.ibm.concord.sidebar.colorIndicatorTurning",[!show]);
  	var status = 'yes';
  	if(!show) status = 'no';
  	
  	this._doPost(this.prefix + this.INDICATOR, status);  	  	
  },
  
  
  /**
   * true -- auto complete for cell editing, DEFAULT
   * false -- NO auto complete for cell editing,
   */
   setAutoComplete: function(ac)
   {
   	var status = 'yes';
   	if(!ac) status = 'no';
   	
   	this._doPost(this.prefix + this.AUTOCOMPLETE, status);  	  	
   },
   
  /**
  * true  -- use fixed width for page, 
  * false -- don't use fixed width for page
  */  
  setFixedWidth: function(show)
  {
  	var status = 'yes';
  	if(!show) status = 'no';
  	
  	this._doPost(this.prefix + this.WIDTH, status);  	  	  	
  },
    
  /**
  * true  -- Show Formula Bar
  * false -- Don't Show Formula Bar
  */  
  setFormula: function(show)
  {
  	var status = 'show';
  	if(!show) status = 'hide';
  	
  	this._doPost(this.prefix + this.FORMULA, status);  	 
  },
  
  /**
  * true  -- show unsupported feature dialog, 
  * false -- don't show unsupported feature dialog
  */
  setShowUnsupportedFeature: function(show)
  {
	if (this.getShowUnsupportedFeature() == show) 
		return;
  
  	var status = 'yes';
  	if(!show) status = 'no';
  	
	this.settings && (this.settings[this.SHOWUNSUPPORTEDFEATURE] = status);
	
  	this._doPost(this.SHOWUNSUPPORTEDFEATURE, status);
  },
  
   setShowWelcome: function(show)
  {
	if (this.getShowWelcome() == show) 
		return;
  
  	var status = 'yes';
  	if(!show) status = 'no';
  	
	this.settings && (this.settings[this.SHOWWELCOME] = status);
	
  	this._doPost(this.SHOWWELCOME, status);
  },
  
  setFileFormat: function(format)
  {
	if (this.getFileFormat() == format) 
		return;    	
	this.settings && (this.settings[this.FILEFORMAT] = format);	
  	this._doPost(this.FILEFORMAT, format);
  }  
});

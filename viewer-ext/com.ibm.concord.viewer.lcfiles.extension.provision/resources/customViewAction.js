/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of IBM.                             */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* Copyright IBM Corporation 2012. All Rights Reserved.              */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("viewer.customViewAction");
dojo.require("lconn.files.action.impl.PromptAction");
dojo.require("dojo.i18n");

dojo.declare("viewer.customViewAction", [lconn.files.action.impl.PromptAction], {
   showProgressBar: false,
   isContinueView : true,
   
   //opt for NLS strings.
   constructor: function(app,scene, opt) {
      this.inherited(arguments); 
      //getNls call before in 'inherited', then mixin more here.
      this.nls = dojo.mixin(this.nls, {OK:opt.OK, OkTitle:opt.OkTitle, VIEW_TITLE:opt.VIEW_TITLE});
   },
   
   getNls: function(app) {
      return viewer.global.nls;
   },

   //opt for other options.
   createDialog: function(item,opt,dialog) {
      opt = dojo.mixin(opt, {
         title: this.nls.VIEW_TITLE,
         showProgressBar: this.showProgressBar
      });
      this.dialog = dialog;
      if (typeof(item) != "undefined" && item != null){
         this.file = item;
      }
      this.isContinueView = !!opt.isContinueView;
      
      this.inherited(arguments); 

   },

   renderQuestion: function(d, el, item, opt) {
      var div = d.createElement("div");
      dojo.attr(div, "class", "lotusFormField");
      el.appendChild(div);
      dojo.create('p', {innerHTML:this.sentence1}, div);
      dojo.create('p', {innerHTML:this.sentence2}, div);
   },
  
   onSuccess: function() 
   {
	  if (this.isContinueView) {
	 	  var uri = this.file.getId();
	      var name = uri.replace(/[-\s.@]/g, '_');
	      window.open(glb_viewer_url_wnd_open + "/app/lcfiles/" + file.getId() + "/content", "_blank", "");
   
	  }
   }
});

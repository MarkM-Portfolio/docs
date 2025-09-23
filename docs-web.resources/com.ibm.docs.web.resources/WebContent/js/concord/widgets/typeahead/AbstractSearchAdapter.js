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

/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright IBM Corp. 2010, 2011                                    */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.widgets.typeahead.AbstractSearchAdapter");
//dojo.require("lconn.share.util.text");
//dojo.require("lconn.share.util.html");

//Overwrite _getStore, canCreate, _createTypeAhead, _getDefaultTypeAheadOpt to get a customized search adapter

dojo.declare('concord.widgets.typeahead.AbstractSearchAdapter', null, {
   store: {},
   
   canCreate: function() {
      return false;
   },
   
   _getStore: function(type){
      return null;
   },
   
   _createTypeAhead: function(input, opt){
      return null;
   },
   
   _getDefaultTypeAheadOpt: function(){
      return {};
   },
   
   getStore: function(type){
      var type = type || "default";
      if(this.store[type]) 
         return this.store[type];
      var store = this.store[type] = this._getStore(type);
      return store;
   },
   
   createTypeAhead: function(input, typeAheadOpt, opt) {
      var tOpt = dojo.mixin({}, this._getDefaultTypeAheadOpt(), typeAheadOpt);
      opt = opt || {};
      var type = opt.allowExternal? "external": opt.type;
      if(opt.activeOnly)
         type = type + "_activeOnly";
      tOpt.store = this.getStore(type);
      return this._createTypeAhead(input, tOpt, opt);
   },
   
   getSelected: function(typeAhead, args) {
      // Try getting the item directly from the typeahead first
      var item = typeAhead.item;

      // If the typeahead doesn't have the item, get it from the selection event
      if (!item && args && args[0]) {
         var arg0 = args[0];

         // could be the domNode that was selected, get the item from it
         if (arg0.item)
            item = arg0.item;
            
         // could be the item itself
         if(!item && arg0.id && arg0.title)
            item = arg0;
      }

      if (item && !item.emptyMsg)
         return item;
      return null;
   },
   connectOnSelect: function(typeAhead, obj, method){
      if(typeAhead.onSelect)  // onSelect works in Connections 3.0 / Dojo 1.4.1
         dojo.connect(typeAhead, "onSelect", obj, method);
      else if(typeAhead._doSelect)  // _doSelect works in Connections 2.5 / Dojo 1.2.3
         dojo.connect(typeAhead, "_doSelect", obj, method);
   },
   
   changeTypeAheadOpts: function(typeahead, opt) {
      // this is really only used in live but needs to be available on both adapters
   },
   
   isExternalItem: function(app, item){
      return false;
   },
   
   doSelectUser: function(typeahead) {
   	// really only used by live
   },
   
   // child classes should return true if they want an external "add" button that will allow them to click and enter mid-search
   showAddButton: function() {
      return false;
   }
});

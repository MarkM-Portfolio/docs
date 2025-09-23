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
/* Copyright IBM Corp. 2010, 2012                                    */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.widgets.typeahead.DocsSearchAdapter");
dojo.require("concord.widgets.typeahead.url");
dojo.require("concord.widgets.typeahead.PeopleTypeAhead");
dojo.require("concord.widgets.typeahead.AbstractSearchAdapter");

dojo.declare('concord.widgets.typeahead.DocsSearchAdapter', concord.widgets.typeahead.AbstractSearchAdapter, {
   constructor: function(url) {
      this.url = url;
   },
   
   canCreate: function() {
      return !!this.url;
   },
   
   _getDefaultTypeAheadOpt: function(){
      var p = {
         captureNewContacts: false,
         multi: false, //bhc use multi, while Connections use multipleValues
         noSetValueOnSelect: false,
         url: concord.widgets.typeahead.url.rewrite(this.url, {users: true, internal: false, communities: false})
      };
      
      return p;
   },
   _createTypeAhead: function(input, opt, p) {
      delete opt.store; //We don't need store setting in bhc.PeopleTypeAhead
      var typeAhead = new concord.widgets.typeahead.LSPeopleTypeAhead(opt, input);
      typeAhead.store = typeAhead.newStore();
      typeAhead.setInternalOnly(!p.allowExternal);
      if(opt.hintText)
         typeAhead.updateHintText(opt.hintText);
      return typeAhead;
   },

   getSelected: function(typeAhead, args) {
      if(typeAhead.item){
         var person = typeAhead.item.i;
         if(person) {
            // Hack to remove "u_" prefix from LotusLive ids
            var id = person.i;
            if(id && id.indexOf("u_") == 0)
               id = id.substring(2);
            // contacts do not have a directory id, so e-mail is used instead
            else if(id && id.indexOf("c_") == 0)
               id = null;
            return {id:id, name:person.f, email:person.e, orgId:person.o};
         }
      }
      if (args && args[0]) {
         var arg0 = args[0];

         // could be the domNode that was selected, get the item from it
         if (arg0.email)
            return {id: null, name: arg0.email, email: arg0.email};
      }
      return null;
   },
   
   isUserGuest: function(item) {
      return item && item.person && item.person.email && !item.person.id;
   },
   
   isExternalItem: function(app, item) {
      return this.isUserGuest(item) || !this.isUserInSameOrg(app, item);
   },
   
   isUserInSameOrg: function(app, item) {
      var currentUserOrgId = dojo.getObject("authenticatedUser.orgId", false, app);
      var requestedUserOrgId = dojo.getObject("person.orgId", false, item);
      
      // don't want to return true when both are null
      return (currentUserOrgId && (currentUserOrgId == requestedUserOrgId));
   },
     
   // this will change the search options for the live typeahead feed
   changeTypeAheadOpts: function(typeahead, opt) {           
      if (!typeahead || !typeahead.store)
         return;
      
      var urlOpt = {};
      urlOpt.users = opt.users==undefined? true: opt.users;
      urlOpt.contacts = true;
      urlOpt.communities = opt.communities || false;
      urlOpt.groups = opt.groups==undefined ? false: opt.groups;
      urlOpt.intent = opt.internal ? "internal" : "external";
      urlOpt.all = false;      
      
      var url = lconn.core.url.rewrite(this.url, urlOpt);
      typeahead.store.url = url;
      typeahead.allowEmail = !opt.internal;      
   },
   
   showAddButton: function() {
      return true;
   },
   
   doSelectUser: function(typeahead) {
      typeahead.doSelectUser();
   }
});

dojo.provide("concord.widgets.typeahead.LSPeopleTypeAhead");
dojo.require('dojox.validate');
dojo.declare('concord.widgets.typeahead.LSPeopleTypeAhead', concord.widgets.typeahead.PeopleTypeAhead, {
   allowEmail: false,
   
   postCreate: function(){
      // Certain LotusLive apps use dojo 1.5 which requires that "this.downArrowNode" be set
      if (!this.downArrowNode) {
         this.downArrowNode = this.domNode.appendChild(dojo.create("div", {style:{display: "none"}}));
      }
      
      this.inherited(arguments);
   },
   
   reformat: function(arg){
   	if (this.focusNode.value.indexOf("\n") == -1) return;
   	this.inherited("reformat", arguments);
	},

   //Hack for not setting value onSelect
   onSelectOption: function(){
      if(!this.noSetValueOnSelect)   //explicit setting, not changing bhc.PeopleTypeAhead default action
         this.setValue(this.store.getValue(this.item, this.valueAttr || this.searchAttr), true);
      this._setCaretPos(this.focusNode, this.focusNode.value.length);
      this.onSelect(this.item);
   }, 
   
   //Hack for updateHintText
   _onFocus: function(/*Event*/ evt) {
      this.updateHintText(null, true);
      this.inherited(arguments);
   },
   _onBlur: function(/*Event*/ evt){
      if(this.searchTimer)          
         clearTimeout(this.searchTimer);
      this.inherited(arguments);
      this.updateHintText();
   },
   setValue: function() {
      this.inherited(arguments);
      this.updateHintText();
   },
   updateHintText: function(hint, focus) {
      if (hint){
         this.focusNode.title = this.hintText = hint;
         dijit.setWaiState(this.focusNode, "label", hint);
      }

      if (this.hintText) {
         if(!this._focused && (this.focusNode.value == "" || !this.focusNode.hasInput)) {
            this.focusNode.hasInput = false;
            this.focusNode.style.color = "#aaa";
            this.focusNode.value = this.hintText || "";
         }
         else if (!this.focusNode.hasInput) {
            this.focusNode.hasInput = true;
            this.focusNode.style.color = "#000";
            this.focusNode.value = "";
            if (focus)
               try { dijit.selectInputText(this.focusNode, 0, 0); } catch(e) { }
         }
      }
   }, 
   
   _onKeyPress: function(/*Event*/ evt) {
      /* if we've typed the email address of an existing user, select it on enter */
      var key = evt.charOrCode;
      if (key == dojo.keys.ENTER) {
         this.doSelectUser();
      }
      
      this.inherited("_onKeyPress", arguments);
   },
   
   doSelectUser: function() {
      var hl = null;
      if (this._isShowingNow) {
         var pw = this._popupWidget;
         hl = pw && pw.getHighlightedOption();
      }
      
      var obj = null;
      if (hl) {
         var id = hl.id.substring(3);  // remove li_
         if(id){                       //items like Prev/Next has no id, no need to process the fetch, leave it to parent method
            this.store.fetchItemByIdentity({
               identity: id, 
               onItem: dojo.hitch(this, function(item) {                  
                  this.item = item;
                  obj = [item];
               })
            });
         }
      }
      
      if (!obj && this.allowEmail) {
         var v = this.focusNode.value;
         if (v && dojox.validate.isEmailAddress(v)) {
            obj = [{email: v.toLowerCase()}];
         }
      }
      
      if (obj) {
         this.onSelect.apply(this, obj);
      }
   }
   
});

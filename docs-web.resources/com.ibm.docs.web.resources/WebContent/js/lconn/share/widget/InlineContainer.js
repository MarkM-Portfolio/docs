/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright IBM Corp. 2009, 2010                                    */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

dojo.provide('lconn.share.widget.InlineContainer');
dojo.require("dijit._Widget");

dojo.declare(
   "lconn.share.widget.InlineContainer",
   [dijit._Widget],
	{
      msgRemove: null,
      msgRemoveAlt: null,
      msgEmpty: null,
      
      addedText: null,
      removedText: null,
      
      maxLength: 60,
   
      postMixInProperties: function() {
         this.items = this.items || [];
         this.itemsById = {};
         for (var i=0; i<this.items.length; i++)
            this.itemsById[this.items[i].id] = this.items[i];
      },
      
      buildRendering: function() {
         var d = document;
         var el = this.domNode = this.srcNodeRef;

         var div = this.itemNode = d.createElement("div");
            div.className = "lotusFilters2";
            if (this.wInput)
               div.style.width = this.wInput;
               
            for (var i=0; i<this.items.length; i++) {
               var value = this.items[i];
               this.renderItem(div, value);
            }

         if(this.items.length > 0)
            el.appendChild(div);
         
         if (this.msgEmpty) {
            var span = this.emptyNode = d.createElement("span");
               span.className = "lconnEmpty";
               span.appendChild(d.createTextNode(this.msgEmpty));
            el.appendChild(span);
            this.emptyNode.style.display = (this.items.length == 0) ? "" : "none";
         }
      },

      renderItem: function(div, item) {
         var d = document;
         var a = d.createElement("a");
            a._id = item.id;
            a.className = "lotusFilter";
            a.appendChild(d.createTextNode(lconn.share.util.text.trimToLength(item.name, this.maxLength)));
            a.title = item.name;
            a.href = "javascript:;";

            var info = item.info || [];
            for (var i=0; i<info.length; i++) {
               var span = d.createElement("span");
                  span.className = "qkrInfo";
                  span.appendChild(d.createTextNode(info[i]));
               a.appendChild(span);
            }
            if (!item.locked) {
               var removeText = dojo.string.substitute(this.msgRemove || this.msgRemoveAlt || "", [item.name]);
               a.title = removeText;
               dijit.setWaiRole(a, "button");
               dijit.setWaiState(a, "label", removeText);
               
               var img = d.createElement("img");
                  img.alt = dojo.string.substitute(this.msgRemoveAlt || "", [item.name]);
                  img.className = "lotusDelete";
                  img.src = this._blankGif;
                  dijit.setWaiRole(img, "presentation");
               a.appendChild(img);
               
               var altSpan = d.createElement("span");
                  altSpan.className = "lotusAltText";
                  altSpan.appendChild(d.createTextNode("X"));
               a.appendChild(altSpan);

               dojo.connect(a, "onclick", dojo.hitch(this, this.remove, item.id, true));
            }
         div.appendChild(a);
   
         div.appendChild(d.createTextNode(" "));
      },
      
      add: function(item, e) {
         if (e) dojo.stopEvent(e);

         var added = false;
         var id = item.id;
         if (!this.itemsById[id]) {
            this.itemsById[id] = item;
            this.items.push(item);
            var ul = this.itemNode;
            
            this.renderItem(ul, item);
            if (this.items.length == 1)
               this.onNotEmpty();

            added = true;
         }
         
         if(this.addedText && item.name)
            this.announce(dojo.string.substitute(this.addedText, [item.name]))

         return added;
      },
      
      announce: function(text) {
         var el = this.ariaDiv;
         if (el) {
            while (el.firstChild) el.removeChild(el.firstChild);
            el.appendChild(document.createTextNode(text));
         }
      },

      remove: function(value, refocus, e) {
         if (e) dojo.stopEvent(e);
         var id = (typeof value == "string") ? value : ((typeof value == "object") ? value.id : null);
         var item = this.itemsById[id];
         if (!item || item.locked || this.disabled)
            return false;
         
         var refocusNode = null;
         var itemNode = this.itemNode;
         for (var i=0,child; child=itemNode.childNodes[i]; i++) {
            if (child.nodeType == 1 && child._id == id) {

               // Find the next or previous element to try to focus
               if (refocus) {
                  var refocusNode = child.nextSibling;
                  while (refocusNode && refocusNode.nodeType != 1)
                     refocusNode = refocusNode.nextSibling;
                  if (!refocusNode) {
                     var refocusNode = child.previousSibling;
                     while (refocusNode && refocusNode.nodeType != 1)
                        refocusNode = refocusNode.previousSibling;
                  }
               }
               
               itemNode.removeChild(child);
               break;
            }
         }
         delete this.itemsById[id];
         this.items = dojo.filter(this.items, function(item) {return item.id != id;});

         this.onRemove(item);
         
         if (this.items.length == 0)
            this.onEmpty();

         if(this.removedText)
            this.announce(dojo.string.substitute(this.removedText, [item.name]))

         if (refocus && refocusNode)
            dijit.focus(refocusNode);
         
         return true;
      },
      removeAll: function() {
         var itemNode = this.itemNode;
         this.itemsById = {};
         this.items = [];
         lconn.share.util.html.removeChildren(itemNode);
         this.onEmpty();
      },
      
      hasItems: function() {
         return this.items && this.items.length > 0;
      },   
      getItems: function() {
         return dojo.clone(this.items);
      },
      getItemIds: function() {
         return dojo.clone(this.itemsById);
      },
      
      onNotEmpty: function(items) {
         this.domNode.insertBefore(this.itemNode, this.emptyNode || null);
         if (this.emptyNode)
            this.emptyNode.style.display = "none";
      },
      onEmpty: function() {
         if(this.itemNode.parentNode == this.domNode)
            this.domNode.removeChild(this.itemNode);
         if (this.emptyNode)
            this.emptyNode.style.display = "";
      },
      onRemove: function(item) {}
	}
);

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
/**
 * When the application starts, register the following logic to enable
 * the confidential flag.  Ensure that the Share bootstrap property:
 * 
 *    file.restrictionType.personalFiles[@enabled]=true
 *    
 * is set to true to enable visibility restriction.
 * 
 * All of our code is wrapped in a function so that it is private, and
 * cannot be overwritten or called by other extensions. 
 */
(function() {

   /** 
    * This section defines all the helper functions that actually change the user
    * interface.  At the bottom the helpers are registered to be called when needed
    */
   
   var confidentialColumn = {
      id: "confidential",
      isSortable: false,
      vis: true,
      locked: true,
      name: "",
      tooltip: "",
      wf: 0,
      accessor: "isRestrictedVisibility",
      render: function(b, stream, r, d, el) {
         el.style.cursor = "pointer";
         if (b) {
            var span = d.createElement("span");
               span.className = "ibmConfidential";
               span.appendChild(d.createTextNode("IBM Confidential"));
            el.appendChild(span);
         }
         else
            el.appendChild(d.createTextNode("\u0020"));
      }
   };
   
   /**
    * This function will be invoked whe the list of columns for a scene is requested.  It adds
    * the confidential column right before the context menu, or at the end.
    */
   function addConfidentialFileColumn(columns, s, app, scene, opts) {
      var position = columns.length;
      for (var i=0,c; c=columns[i]; i++)
         if (c.id == "contextMenu") {
            position = i;
            break;
         }
      columns.splice(position, 0, confidentialColumn);
   }
   
   /**
    * A reusable function to add the confidential text into a list.
    */
   function addConfidentialMark(d, el) {
      var span = d.createElement("span");
         span.className = "ibmConfidential";
         span.appendChild(d.createTextNode("IBM Confidential"));
      dojo.place(span, el, "first");
      var divider = d.createElement("span");
         divider.className = "lotusDivider";
         divider.appendChild(d.createTextNode("|"));
      dojo.place(divider, span, "after");
   }   
            
   /**
    * The community file widget on the overview page uses a simple XSL
    * stylesheet to transform the list of community files into HTML.
    * This function is invoked immediately after the XML is converted
    * into HTML, and the caller may alter the rendered HTML.
    */
   function whenCommunityWidgetRendersSimple(app, frag, response) {
      var rows = frag.firstChild.lastChild.childNodes;
      var length = rows.length-1;
      for (var i=1; i<length; i++) { // Skip the first and last rows
         var tr = rows[i];
         var meta = tr.childNodes[1].lastChild;
         var b = dojo.attr(meta, "restricted") == 'true';
         if (b)
            addConfidentialMark(document, meta);
      }
   }
   dojo.subscribe("lconn/files/comm/ref/render/simple", whenCommunityWidgetRendersSimple);
   

   /**
    * This function is executed every time a scene starts.  The first time the scene is available
    * the code that renders the list of files will be extended to add special processing to show
    * the confidential marker.  The function unsubscribes itself so it is only invoked once. 
    */
   function whenFileListLoads(id, scene) {
      if (!dojo.getObject("lconn.share.widget.FileRendererSocial"))
         return;
      dojo.unsubscribe(whenFileListLoads.listener);

      /** 
       * Whenever we display the list of files in the social view with XSLT, add the confidential.
       * mark
       */
      lconn.share.widget.FileRendererSocial.extend({
         postProcessTimestamps: function(rows, nlsDate, sByCls, alternateRows, setTitle) {
            this.inherited(arguments);
            var length = rows.length;
            var increment = alternateRows ? 2 : 1;
            for (var i=0; i<length; i += increment) {
               var tr = rows[i];
               var meta = tr.childNodes[1].lastChild;
               var b = dojo.attr(meta, "restricted") == 'true';
               if (b)
                  addConfidentialMark(document, meta);
            }
         }
      });
      dojo.connect(lconn.share.widget.FileRendererSocial.prototype, "renderItem", function(stream, el, data, file, position, isFirst, isLast, existingTr, existingTrDetails) {
         if (file.isRestrictedVisibility())
            addConfidentialMark(document, existingTr.childNodes[1].lastChild);
      });
   }
   
   /**
    * When a summary page (file, or community) is loaded, add the confidential mark to it.
    */
   function addConfidentialToHeaderDescription(d, el) {
      var file = this.document;
      
      if (file.isRestrictedVisibility())
         addConfidentialMark(document, el);
   }   
   
   /**
    * This function waits until a file summary page is loaded.  Then it extends the scene to
    * add special processing to display the confidential mark.  The function unsubscribes itself
    * so that it is only invoked once.
    */
   function whenFileSummaryLoads(id, scene) {
      if (id != "lconn.files.scenes.FileSummary")
         return;
      dojo.unsubscribe(whenFileSummaryLoads.listener);
      
      dojo.connect(lconn.files.scenes.FileSummary.prototype, "renderHeaderDescription", addConfidentialToHeaderDescription);      
   }
   
    /**
     * This function waits until a community file summary page is loaded.  Then it extends the 
     * scene to add special processing to display the confidential mark.  The function 
     * unsubscribes itself so that it is only invoked once.
     */
    function whenCommunityFileSummaryLoads(id, scene) {
       if (id != "lconn.files.comm.scenes.owned.CommunityFileSummary")
          return;
       dojo.unsubscribe(whenCommunityFileSummaryLoads.listener);
       
       dojo.connect(lconn.files.comm.scenes.owned.CommunityFileSummary.prototype, "renderHeaderDescription", addConfidentialToHeaderDescription);      
    }
    
   
   /**
    * When the edit file or upload file dialogs are created, add a checkbox for the "IBM Confidential" state.
    * The checkbox goes in a row after the filename. 
    */
   function addConfidentialCheckbox(action, contents, item, opt, dialog) {
      // Only the owner of a file or an administrator can change the value of the confidential flag.
      if (item instanceof lconn.share.bean.File && !item.getPermissions().GrantAccess)
         return;
      var d = document;
      try {
      var tr = d.createElement("tr");
         tr.className = "lotusFormFieldRow";
         var td = tr.appendChild(d.createElement("td"));
            td.className = "lotusFormLabel";
         var td = tr.appendChild(d.createElement("td"));
            var input = dialog.confidentialNode = d.createElement("input");
               input.type = "checkbox";
               input.id = dialog.id + "_confidential";
               input.className = "lotusCheckbox";
               input.name = "_confidential";
               input.value = "true";
               input.checked = input.defaultChecked = (item && item.isRestrictedVisibility ? item.isRestrictedVisibility : false);
            td.appendChild(input);
            var label = td.appendChild(d.createElement("label"));
               dojo.attr(label, "for", input.id);
               label.className = "lotusCheckbox";
               label.appendChild(d.createTextNode("This file is IBM Confidential"));
         var td = tr.appendChild(d.createElement("td"));
      var filenameRow = dojo.query("tr input", contents).filter(function(i) {return i.name == "_label";})[0].parentNode.parentNode;
      dojo.place(tr, filenameRow, "after");
      } catch (e) {alert(e); debugger;}
   }
   
   
   /**
    * Dialogs can be reused, so the confidential checkbox must be either set to false (if this is a new item)
    * or set to the value of the current file.
    */
   function clearConfidentialCheckbox(action, item, opt, dialog) {
      if (dialog.confidentialNode)
         dialog.confidentialNode.checked = (item && item.isRestrictedVisibility ? item.isRestrictedVisibility() : false);
   }

    
   /**
    * When a file is uploaded, document properties are sent as multi-part mime-encoded parameters in
    * the formValues map.  Use the checkbox we added earlier to set the value the API expects 
    * (restrictedVisibility).
    */
   function beforeUpload(action, formValues, uploadParams) {
      if (action.dialog.confidentialNode)
         formValues.restrictedVisibility = action.dialog.confidentialNode.checked;
   }

   
   /**
    * When a file is edited, the form values are serialized onto an ATOM XML entry document.  This
    * function will be invoked just before we save
    */
   function beforeEdit(action, doc) {
      if (!action.dialog.confidentialNode)
         return;
      
      var lsud = lconn.share.util.dom;
      var DOCUMENTS_ATOM = lsud.DOCUMENTS_ATOM_NAMESPACE;
      
      var isConfidential = action.dialog.confidentialNode.checked;
      
      var entry = doc.documentElement;
         var label = lsud.createElementNS(doc, "restrictedVisibility", DOCUMENTS_ATOM);
            label.appendChild(doc.createTextNode(isConfidential ? "true" : "false"));
         entry.appendChild(label);
   }   
   
   
   /**
    * To ensure that registration occurs once, and only once (and can be loaded before or
    * after the application is available), we register a function to be executed when the
    * Files community widget is started. 
    */
   function registerWidgetConfidentialExtensions() {
      if (registerWidgetConfidentialExtensions._init) return;
      registerWidgetConfidentialExtensions._init = true;
      
      lconn.core.uiextensions.add("lconn/files/columns/file/communityshared", addConfidentialFileColumn);
      
      whenFileListLoads.listener = dojo.subscribe("lconn/share/scene/begin", whenFileListLoads);
      whenCommunityFileSummaryLoads.listener = dojo.subscribe("lconn/share/scene/begin", whenCommunityFileSummaryLoads);
      
      /** The upload file dialog will notify 3rd parties when opened or updated */
      dojo.subscribe("lconn/files/action/uploadfile/render", addConfidentialCheckbox);
      dojo.subscribe("lconn/files/action/uploadfile/update", clearConfidentialCheckbox);
      dojo.subscribe("lconn/files/action/uploadfile/beforesave", beforeUpload);
      
      /** The edit file dialog will notify 3rd parties when opened or updated */
      dojo.subscribe("lconn/files/action/editfile/render", addConfidentialCheckbox);
      dojo.subscribe("lconn/files/action/editfile/update", clearConfidentialCheckbox);
      dojo.subscribe("lconn/files/action/editfile/beforesave", beforeEdit);
   }
   lconn.core.uiextensions.when("lconn/files/comm/ref/app/start").addCallback(registerWidgetConfidentialExtensions);
   
   
   /**
    * To ensure that registration occurs once, and only once (and can be loaded before or
    * after the application is available), we register a function to be executed when the
    * Files application is started. 
    */
   function registerConfidentialExtensions() {
     if (registerConfidentialExtensions._init) return;
     registerConfidentialExtensions._init = true;
     
     lconn.core.uiextensions.add("lconn/files/columns/file/library", addConfidentialFileColumn);
     lconn.core.uiextensions.add("lconn/files/columns/file/sharedwithme", addConfidentialFileColumn);
     lconn.core.uiextensions.add("lconn/files/columns/file/sharedbyme", addConfidentialFileColumn);
     lconn.core.uiextensions.add("lconn/files/columns/file/public", addConfidentialFileColumn);
     lconn.core.uiextensions.add("lconn/files/columns/file/collection", addConfidentialFileColumn);
     lconn.core.uiextensions.add("lconn/files/columns/file/deleted", addConfidentialFileColumn);
     
     whenFileListLoads.listener = dojo.subscribe("lconn/share/scene/begin", whenFileListLoads);
     whenFileSummaryLoads.listener = dojo.subscribe("lconn/share/scene/begin", whenFileSummaryLoads);
     
     /** The upload file dialog will notify 3rd parties when opened or updated */
     dojo.subscribe("lconn/files/action/uploadfile/render", addConfidentialCheckbox);
     dojo.subscribe("lconn/files/action/uploadfile/update", clearConfidentialCheckbox);
     dojo.subscribe("lconn/files/action/uploadfile/beforesave", beforeUpload);
     
     /** The edit file dialog will notify 3rd parties when opened or updated */
     dojo.subscribe("lconn/files/action/editfile/render", addConfidentialCheckbox);
     dojo.subscribe("lconn/files/action/editfile/update", clearConfidentialCheckbox);
     dojo.subscribe("lconn/files/action/editfile/beforesave", beforeEdit);
   }   
   lconn.core.uiextensions.when("lconn/files/app/start").addCallback(registerConfidentialExtensions);
})();

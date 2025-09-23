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

/*
 * This file demonstrates how to register new tabs into the Files UI. This file will be evaluated after the core Dojo libraries have 
 * been loaded, so most Dojo methods are available.  The Files application will not be completely started.
 */
dojo.require("lconn.core.uiextensions");

/*
 * Register our custom tab for a file
 */
lconn.core.uiextensions.add(
   "lconn/files/tabs/file",
   
   /*
    * Add a new "Custom Tab" to the file summary page.
    */
   function(s, tabs, app, scene) {
      tabs.splice(2, 0, {
      //tabs.push({
         id: "Preview ",
	 htmlId: "Preview",
         /*
          * Generate the name of the tab.  The item being displayed is passed to this method.
          */
         getName: function(app, item) {
            return "Preview";
         },

         /*
          * Called to display the body of the tab.  
          *    d - the HTML document for this tab
          *    el - the container for the contents of the tab
          *    item - the item this tab is related to
          *    section - Equivalent to *this*
          *    opt - Contains references to the app and the scene
          */
         //render:  function(d, el, item, section, opt) {
   	 render: function(d, div, doc, section, opt) {
		section.hidden=true;
	   
	      var extension = doc.getExtension();
	      if (extension && {"cct":1}[extension.toLowerCase()]) {
		div.appendChild(d.createTextNode("Coming soon") );
		var new_iframe = d.createElement("div");
		var iframecnd = d.createElement("iframe");
		iframecnd.id = "concord_preview2";
		iframecnd.style.marginTop = "5px";
		iframecnd.style.marginBottom = "10px";
		iframecnd.style.position = "static";
		iframecnd.style.visibility = "visible";
	 	iframecnd.src="/concord/app/doc/lcfiles/"+doc.getId()+"?mode=view";///files/app/about";
		//iframecnd.src="http://wplccdlvm474.cn.ibm.com:9080/concord/viewpage?uri=01cc328e-eb39-42a4-9fd6-50b623df5eec";///files/app/about";
		iframecnd.width="100%";
		iframecnd.height="400px";
		iframecnd.aligh="midle";
		div.appendChild(iframecnd);
		/*try{
			var new_iframe = d.createElement("iframe");
			new_iframe.id="concord_view_iframe";
			//new_iframe.src="http://www.baidu.com/";
			new_iframe.width="100%";
			new_iframe.aligh="middle";
			//new_iframe.innerHTML="Please wait ... loading document";
			//d.getElementById("concord_view_iframe").contentWindow.document.write("testing");
		} catch (e){
			alert(e.message)
		}*/

		//new_iframe.innerHTML='<iframe id="concord_view_iframe" src="/files/app/about" width="100%" align="middle">Please wait.... Loading document.</iframe>';
		/*try{
			dojo.xhrGet({
			  url:	"/files/app/about",
			  mimetype: "text/plain",
			  load: function(t, txt, e) {
				//alert(t);
				d.getElementById("concord_view_iframe").contentWindow.document.write(t);
				//d.getElementById("concord_view_iframe").innerHTML=t;
			  },
			  error: function(t, e) {
				dojo.console("Error!... " + e.message);
			  }
			});
		} catch (e){
			alert(e.message)
		}*/
	    }else{
		div.appendChild(d.createTextNode("Only valid to preview concord files, extension as ODP, ODS or ODT") );
		//d.getElementById(this.htmlId+"_link").parentNode.style.display="none";
	    }
         }
      });
   }
);

/*
 * Register our custom tab for a collection (folder)
 */
/*
lconn.core.uiextensions.add(
   "lconn/files/tabs/collection",
   
    // Add a new "Custom Tab" to the folder summary page.
   function(s, tabs, app, scene) {
      tabs.splice(2, 0, {
         id: "previewcollectiontab",
          // Generate the name of the tab.  The item being displayed is passed to this method.
         getName: function(app, item) {
            return "Preview Folder Tab";
         },
          * Called to display the body of the tab.  
          *    d - the HTML document for this tab
          *    el - the container for the contents of the tab
          *    item - the item this tab is related to
          *    section - Equivalent to *this*
          *    opt - Contains references to the app and the scene
         render:  function(d, el, item, section, opt) {
            el.appendChild(d.createTextNode("My preview folder tab"));
         }
      });
   }
);
*/


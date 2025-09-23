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
 * This file demonstrates how to register new renderers into the Files UI. This file will be evaluated after the core Dojo libraries have 
 * been loaded, so most Dojo methods are available.  The Files application will not be completely started.
 */
dojo.require("lconn.core.uiextensions");

/*
 * Register our custom renderer for use when showing the file inline.
 */
lconn.core.uiextensions.add(
   "lconn/files/renderers/file/inline",
   
   /*
    * This function uses the HTML IMG element to display files that are GIFs inline in the browser.  The function returns true 
    * only if it can render the current file.
    * 
    * The file object contains a number of methods that provide access to information about the file.
    */
   function(s, htmlDocument, parentNode, file, app, scene) {
      var extension = file.getExtension();
      if (extension && extension.toLowerCase() == "gif") {
         var img = htmlDocument.createElement("img");
         img.src = file.getUrlDownload();
         parentNode.appendChild(img);
         return true;
      }
      return false;
   }
);

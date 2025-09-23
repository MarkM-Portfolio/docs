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
dojo.require("lconn.core.url");

dojo.declare("lconn.files.renderer.images.LoadImage", null, {
   count: 0,
   constructor: function(url, d, parentNode) {
      var a = d.createElement("a");
         a.href = url;
         a.target = "_blank";
         a.title = "Click this image to open in a new window";
         a.style.display = "block";
         a.style.overflow = "hidden";
         
         var img = d.createElement("img");
            img.style.position = "absolute";
            img.style.visibility = "hidden";
            img.style.left = "-99999px";
            img.src = url;
         a.appendChild(img);
         this.image = img;
   
         var img = d.createElement("img");
            img.className = "lotusLoading";
            img.src = dijit._Widget.prototype._blankGif;
         a.appendChild(img);
      parentNode.appendChild(a);
      this.timer = setInterval(dojo.hitch(this, "checkLoaded"), 100);
   },
   checkLoaded: function() {
      var img = this.image;
      if (img.width) {
         var el = img.parentNode;
         var box = dojo.marginBox(el);
         if (img.width > box.w) {
            var factor = box.w / img.width;
            this.dimensions = {w: img.width, h: img.height};
            this.scaled = true;
            img.height = img.height * factor;
            img.width = box.w;
         }
         el.removeChild(img.nextSibling);
         img.style.position = "static";
         img.style.visibility = "visible";
         clearInterval(this.timer);
         delete this.timer;
      }
      if (this.count++ > 100) {
         // display not loaded
         clearInterval(this.timer);
         delete this.timer;
      }
   }
});

/*
 * Register our custom renderer for use when showing the file inline.
 */
lconn.core.uiextensions.add(
   "lconn/files/renderers/file/inline",
   
   /*
    * This function uses the HTML IMG element to display files that are GIFs inline in the browser.  The function returns true 
    * only if it can render the current file.
    */
   function(s, d, parentNode, file, app, scene) {
      var extension = file.getExtension();
      
      if (extension && {"gif":1,"jpg":1,"jpeg":1,"png":1}[extension.toLowerCase()]) {

         var url = lconn.core.url.rewrite(file.getUrlDownload(), {dateModified: file.getUpdated().getTime(), inline: true});
         
         // Reuse the file card that is provided by Lotus Connections
         scene.renderFileCard(d, parentNode);
         
         var div = parentNode.lastChild;
         var table = div.firstChild;
         var tr = table.firstChild.firstChild;
         
         // Remove the file type icon
         var td = tr.firstChild;
         tr.removeChild(td);
         td = tr.firstChild;
         dojo.addClass(td, "lotusFirstCell");
         
         // Create a DIV to contain the image before the rest of the file card
         var divimage = td.insertBefore(d.createElement("div"), td.firstChild);
         divimage.style.marginTop = "5px";
         divimage.style.marginBottom = "10px";
         
         if (file.getSize() > 500*1024) {
            dojo.addClass(divimage, "lotusMessage lotusInfo");
            divimage.appendChild(d.createTextNode("This image is too large to preview. "));
            var a = d.createElement("a");
               a.href = url;
               a.target = "_blank";
               a.appendChild(d.createTextNode("Open Image"));
            divimage.appendChild(a);
         }
         else {  
            new lconn.files.renderer.images.LoadImage(url, d, divimage);
         }
         
         return true;
      }
      return false;
   }
);

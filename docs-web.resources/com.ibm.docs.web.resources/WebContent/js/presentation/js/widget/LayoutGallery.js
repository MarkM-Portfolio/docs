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

dojo.provide("pres.widget.LayoutGallery");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

// The widget is just to provide template string, easy for dojo packaging.

dojo.declare("pres.widget.LayoutGallery", [dijit._Widget, dijit._Templated], {

	templateString: dojo.cache("concord.widgets", "layoutGallery/pageLayoutGalleryContent.html")

});

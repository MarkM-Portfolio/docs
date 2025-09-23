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
define(["dojo/has"], function(has) {

    // FIX edge browser here.
    // Note, use "has('trident')" for IE11
    var ua = navigator.userAgent.toLowerCase();
    has.add("edge", ua.indexOf("edge") > 0, true, true);
    has.add("trackGroup", false);

    //console.info("ie " + has("ie"));
    //console.info("trident " + has("trident"));
    //console.info("edge " + has("edge"));
    var global = {
    	fontResizeState: 1
    };

    return global;
});

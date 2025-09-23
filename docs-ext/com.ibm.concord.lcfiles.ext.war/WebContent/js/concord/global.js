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

dojo.provide("concord.global");
dojo.require("dojo.cookie");

/**
 * For some deployment ENV, we need the hardcoded url like below,
 * when IC3 and IBM Docs are not sharing the same hostname
 * glb_concord_url = "/ajaxProxy/proxy/http/w3.tap.ibm.com/docs";
 * glb_concord_url_wnd_open = "http://w3.tap.ibm.com/docs";
 * 
 * When EntitlementCheck value as true, code need to check if current domain 
 * contains a cookie called "IBMDocsEntitlement" to determine whether show Concord or not
 **/
glb_concord_url = "/docs";
glb_concord_url_wnd_open = "/docs";
EntitlementCheck = false;

concord.global = new function() {
    this.showConcordEntry = function() {
        return !EntitlementCheck || dojo.cookie("IBMDocsEntitlement");
    };
}();
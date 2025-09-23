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

dojo.provide("concord.widgets.PeopleTypeAhead");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("concord.util.emailParser");
dojo.requireLocalization("concord.widgets", "PeopleTypeAhead");

dojo.declare("concord.widgets.PeopleTypeAhead", [dijit.form.FilteringSelect], {
    nls: null,
    invalidMessage: "",
    constructor: function(args){
        this.store = new dojo.data.ItemFileReadStore({
            url: concord.util.uri.getDocUri() + '?method=getUserList&permission=edit',
            clearOnClose: true,
            urlPreventCache: true
        });
        this.nls = dojo.i18n.getLocalization("concord.widgets", "PeopleTypeAhead");
        this.invalidMessage = this.nls.invalidMessage;
        this.selectOnClick = true;
    },
    searchAttr: "name",
    hasDownArrow: false,
    
    getPrincipal: function(){
        if (this.item == null) 
            return this.attr('displayedValue');
        return this.item.value[0];
    },
    isValid: function(){
        var _isValidOld = this.inherited(arguments);
        if (!_isValidOld) {
            var value = this.getDisplayedValue();
            if (!this.isValidEmail(value)) {
                this.invalidMessage = this.nls.invalidMessage;
                return false;
            }
            var theUrl = concord.util.uri.getDocUri() + '/permission?email=' + value;
            var response, ioArgs;
            dojo.xhrGet({
                url: theUrl,
                handle: function(r, io){
                    response = r;
                    ioArgs = io;
                },
                sync: true,
                handleAs: "json",
                preventCache: true
            });
            if (response instanceof Error) {
                this.invalidMessage = this.nls.serverException;
                return false;
            }
            else {
                var result = response.permission;
                if (typeof result == 'undefined') {
                    var error_code = response.error_code;
                    if (error_code && error_code == 1900) {
                        this.invalidMessage = this.nls.invalidEmailMessage;
                    }
                    return false;
                }
                if (result == "EDIT") {
                    return true;
                }
                else {
                    this.invalidMessage = this.nls.noAccessMessage;
                    return false;
                }
            }
        }
        return true;
    },
    isValidEmail: function(email){
        if (email && email.search(/^[_A-Za-z0-9-]+(\.[_A-Za-z0-9-]+)*\@[A-Za-z0-9]+(\.[A-Za-z0-9]+)*(\.[A-Za-z]{2,})$/) != -1) {
            return true;
        }
        return false;
    }
    
});


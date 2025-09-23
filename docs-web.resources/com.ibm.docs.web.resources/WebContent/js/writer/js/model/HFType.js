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
define([
    "dojo/_base/lang",
], function(lang) {

    var HF_TYPE = {
        isValid: function(t) {
            return t >= HF_TYPE.BEGIN && t < HF_TYPE.END;
        },

        INVALID: -1,
        BEGIN: 0,

        FIRST_HEADER: 0,
        FIRST_FOOTER: 1,
        DEFAULT_HEADER: 2,
        DEFAULT_FOOTER: 3,
        EVEN_HEADER: 4,
        EVEN_FOOTER: 5,

        END: 6
    };

    return HF_TYPE;
});

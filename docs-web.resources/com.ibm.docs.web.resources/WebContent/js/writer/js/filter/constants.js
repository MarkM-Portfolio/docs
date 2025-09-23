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
define([], function() {

    var constants = {
        NODE_ELEMENT: 1,
        NODE_TEXT: 3,
        NODE_COMMENT: 8,
        NODE_DOCUMENT: 9,
        NODE_DOCUMENT_FRAGMENT: 11,

        ENTER_P: 1,
        ENTER_BR: 2,
        ENTER_DIV: 3
    };
    return constants;
});

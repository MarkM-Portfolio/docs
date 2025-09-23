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

dojo.provide("pres.utils.helper");
dojo.provide("pres.test.stubs.stubHelper");

pres.utils.helper = {

    isArraySame: function(a, b)
    {
        if (a.length != b.length)
            return false;
        for ( var i = 0; i < a.length; i++)
        {
            if (a[i] != b[i])
                return false;
        }
        return true;
    },
    
    getUUID: function() {
        if (!this.mainId)
        {
            this.mainId = "body_id_";
        }
        var seedA = Math.random().toString(16);
        var seedB = Math.random().toString(16);
        var uuid = seedA + seedB;
        uuid = uuid.replace(/0\./g, "");

        return this.mainId + uuid.substring(0, 12);
    },
    
    createEle: function(name)
    {
        var tmp = document.createElement(name);
        tmp.setAttribute("id", this.getUUID());
        return tmp;
    },
    
    setIDToNode: function(root, cascade)
    {
        root.setAttribute("id", this.getUUID());
        if(cascade){
            dojo.query('div,p,span', root).forEach(function(node){
                node.setAttribute("id", this.getUUID());
            }, this);
        }
        
    },
    
    pxToPercent: function(px, box, useWidth)
    {
        var pxValue = parseFloat(px);
        var parent = {offsetHeight: 1000, offsetWidth: 1000};//box.domNode.parentNode;
        var value = (!useWidth) ? parent.offsetHeight : parent.offsetWidth;
        var result = (pxValue * 100) / value;
        return result;
    }    
};
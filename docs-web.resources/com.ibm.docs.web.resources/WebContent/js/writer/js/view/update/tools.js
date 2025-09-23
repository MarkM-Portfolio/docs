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

    var tools = {};
    tools.updateDOM = function(container, rootNode) {
        this._updataMOM2(container, rootNode);
    };
    tools.updataMOM1 = function(container, rootNode) {
        if (!container)
            return;
        var nodeStr = "";
        var view = container.getFirst();
        while (view) {
            var viewNode = view.render();
            view.clearTag && view.clearTag();
            nodeStr += viewNode.innerHTML;
            view = container.next(view);
        }
        rootNode.innerHTML = nodeStr;
    };
    tools._updataMOM2 = function(container, rootNode) {
        if (!container)
            return;
        if (!rootNode)
            return;
        
        var childNodes = [];
        for (var i = 0; i < rootNode.childNodes.length; i++) {
            childNodes.push(rootNode.childNodes[i]);
        }
        var replaceNodes = [];
        var view = container.getFirst();
        var index = -1;
        while (view) {
            var viewNode = view.render();
            view.clearTag && view.clearTag();
            var indexOf = childNodes.indexOf(viewNode);
            if (indexOf == -1) {
                replaceNodes.push(viewNode);
            } else {
                index++;
                while (index < indexOf) {
                    if (childNodes[index].parentNode)
                        rootNode.removeChild(childNodes[index]);
                    index++;
                }
                for (var i = 0; i < replaceNodes.length; i++) {
                    rootNode.insertBefore(replaceNodes[i], viewNode);
                }
                replaceNodes = [];
                index = indexOf;

            }
            view = container.next(view);
        }
        index++;
        for (var i = index; i < childNodes.length; i++) {
            if (childNodes[i].parentNode)
                rootNode.removeChild(childNodes[i]);
        }
        for (var i = 0; i < replaceNodes.length; i++) {
            rootNode.appendChild(replaceNodes[i]);
        }
    };

    return tools;
});

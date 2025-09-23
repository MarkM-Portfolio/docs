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
    "writer/constants"
], function(constants) {

    var Walker = {
        //must implemented functions
        //  nextSibling: function( element ) { return null },
        //  _getFilterFunction: function( filter ) { ....},
        //  getFirst: funciton( element ) {...},
        //  getParent: function( element ){...}

        getNext: function(element, filter, startFromChild, guard) {
            filter = this._getFilterFunction(filter);

            if (guard && !guard.call) {
                var guardModel = guard;
                guard = function(e) {
                    return e != guardModel;
                };
            }

            var item = (startFromChild && this.firstChild(element)),
                parent;

            if (!item) {
                if (guard && guard(element, true) === false)
                    return null;
                item = this.nextSibling(element);
            }

            //temp code 
            if (element.modelType == constants.MODELTYPE.LINK) {
                var test = 1;
            }

            while (!item && (parent = this.getParent(parent || element))) {
                // The guard check sends the "true" paramenter to indicate that
                // we are moving "out" of the element.
                if (guard && guard(parent, true) === false)
                    return null;

                item = this.nextSibling(parent);
            }

            if (!item)
                return null;

            if (guard && guard(item) === false)
                return null;


            if (!filter(item))
                return this.getNext(item, filter, true, guard);

            return item;
        }

    };
    return Walker;
});

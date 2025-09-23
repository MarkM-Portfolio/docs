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
    "dojo/_base/declare",
    "writer/util/ViewTools"
], function(declare, ViewTools) {

    var CursorContext = declare("writer.controller.CursorContext", null, {
        // Shell
        _shell: null,

        // Paragraph model
        _run: null,

        // Text index
        _index: 0,

        constructor: function(createParam) {
            this._shell = createParam.shell;
        },

        run: function(run) {
            if (run != undefined) {
                this._run = run;
            } else {
                return this._run;
            }
        },

        index: function(i) {
            if (isNaN(i)) {
                return this._index;
            } else {
                this._index = i;
            }
        },

        //  /**
        //   * Get the current cursor style to input node.
        //   * @returns {___anonymous798_799}
        //   */
        //  getStyle: function()
        //  {
        //      var cursorInfo = this.getCursorInfo(this._index);
        //      var line = this._run.getParent();
        //      var lineRect = dojo.position(line._domNode);
        //      
        //      var style = {};
        //      style.css = this._run._css;
        //      style.pos = {"x": lineRect.x, "y": lineRect.y};
        //      style.indent = cursorInfo.position.getRelative(this._run, line).getX();
        //      style.lineWidth = line.h;           
        //      
        //      return style;
        //  },

        getCursorInfo: function() {
            if (!this._run.domNode)
            //Not rendered
                return null;
            var runPos = this._run.getChildPosition(this._index, false, false, true); // For image will get previous run's height.
            var pos = this._shell.logicalToClient(runPos);
            var length = runPos.h || this._run.getHeight();
            return {
                position: pos,
                thickness: 2,
                length: length,
                italic: runPos["italic"],
                bColor: runPos["bColor"]
            };
        },

        moveTo: function(run, index) {
            var moved = false;
            var isLine = run.isLine && run.isLine();
            if (isLine)
            {
                run = run.container.getFirst();
            }
            if (run && index >= 0 && index <= run.len) {
                var vTools = ViewTools;
                try {
                    if (vTools.isAnchor(run)) {
                        ret = vTools.getNeighbourRunByModelOrder(run, index);
                        run = ret.obj;
                        index = ret.index;
                    }
                } catch (e) {
                    console.error("error occured in getNeighbourRunByModelOrder()" + e);
                }
                this._run = run;
                this._index = index;
                if (!this._run.isVisibleInTrack() && !this._run.domNode && this._run._vRun){
                    this._run = this._run._vRun;
                    this._index = 0;
                }
                moved = true;
            }
            return moved;
        }
    });

    return CursorContext;
});

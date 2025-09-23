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

    var CellBorderTools = {

        LINE_WIDTH_ITEMS: [0.25, 0.5, 0.75, 1.0, 1.5, 2.25, 3.0, 4.5, 6.0],
        LINE_WIDTH_LIMITED_ITEMS: [0.25, 0.5, 0.75, 1.5, 2.25, 3.0],

        getItems: function(limited) {
            return limited ? this.LINE_WIDTH_LIMITED_ITEMS : this.LINE_WIDTH_ITEMS;
        },

        getFirst: function(limited) {
            var arr = limited ? this.LINE_WIDTH_LIMITED_ITEMS : this.LINE_WIDTH_ITEMS;
            return arr[0];
        },

        getLast: function(limited) {
            var arr = limited ? this.LINE_WIDTH_LIMITED_ITEMS : this.LINE_WIDTH_ITEMS;
            return arr[arr.length - 1];
        },

        getPrev: function(current, limited) {
            var min = this.getFirst(limited),
                max = this.getLast(limited);
            if (current <= min)
                return this.getLast(limited);
            if (current > max)
                return max;
            var arr = limited ? this.LINE_WIDTH_LIMITED_ITEMS : this.LINE_WIDTH_ITEMS;
            var index = 0,
                len = arr.length;
            while (index < len) {
                var pre = arr[index];
                if (current <= pre)
                    break;
                index++;
            }
            return arr[(index + len - 1) % len];
        },

        getNext: function(current, limited) {
            var min = this.getFirst(limited),
                max = this.getLast(limited);
            if (current < min)
                return min;
            if (current >= max)
                return min;
            var arr = limited ? this.LINE_WIDTH_LIMITED_ITEMS : this.LINE_WIDTH_ITEMS;
            var index = 0,
                len = arr.length;
            while (index < len) {
                var next = arr[len - index - 1];
                if (current >= next)
                    break;
                index++;
            }
            return arr[(len - index) % len];
        },

        getNextValue: function(current, limited, isIncrease) {
            if (isIncrease)
                return this.getNext(current, limited);
            else
                return this.getPrev(current, limited);
        },

    };

    CellBorderTools.Constant = {
        BORDER_STYLE: {
            SOLID: "solid",
            DASHED: "dashed",
            DOTTED: "dotted",
            DOUBLE: "double",
            GROOVE: "groove",
            RIDGE: "ridge",
            INSET: "inset",
            OUTSET: "outset"
        },
        RANGE: {
            CLEAR: "clear",
            ALL: "all",
            INNER: "inner",
            HORIZONTAL: "horizontal",
            VERTICAL: "vertical",
            OUTER: "outer",
            LEFT: "left",
            TOP: "top",
            RIGHT: "right",
            BOTTOM: "bottom"
        }
    };
    return CellBorderTools;
});

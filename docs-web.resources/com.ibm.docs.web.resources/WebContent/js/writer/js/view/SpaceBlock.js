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
    "dojo/dom-construct",
    "writer/util/ViewTools"
], function(domConstruct, ViewTools) {

    var SpaceBlock = function() {};

    SpaceBlock.prototype = {
        _DEBUG: false,
        bodySpace: null,

        occupy: function(space, notAffectSpace) {
            var vTools = ViewTools;
            // if table and header/footer, not wrapping text in textarea.
            if (vTools.isCell(this) || vTools.isHeader(this) || vTools.isFooter(this))
                notAffectSpace = true;

            this.bodySpace.occupyBySpace(space, notAffectSpace);

            if (this._DEBUG) {
                this.bodySpace.printLog("body space");
            }

            // transform pos relative to page
            /*
            var pageX = space.x + this.getLeft();
            var pageY = space.y + this.getTop();
			
            var body = this.page.getFirstBody();
            while (body)
            {
            	if (body != this)
            	{
            		// transform to each body and occupy it except this
            		var x = pageX - body.getLeft();
            		var y = pageY - body.getTop();
            		
            		var newSpace = new writer.common.Space(space.w, space.h, x, y, space.owner);
            		
            		body.bodySpace.occupyBySpace(newSpace);
            	}
			
            	body = this.page.getNextBody(body);
            }
            */
        },
        releaseSpace: function(space) {
            this.bodySpace.releaseSpace(space);

            if (this._DEBUG) {
                this.bodySpace.printLog("body space");
            }

            // transform pos relative to page
            /*
            var pageX = space.x + this.getLeft();
            var pageY = space.y + this.getTop();
			
            var body = this.page.getFirstBody();
            while (body)
            {
            	if (body != this)
            	{
            		// transform to each body and release it except this
            		var x = pageX - body.getLeft();
            		var y = pageY - body.getTop();
            		
            		var newSpace = new writer.common.Space(space.w, space.h, x, y, space.owner);
            		
            		body.bodySpace.releaseSpace(space);
            	}
			
            	body = this.page.getNextBody(body);
            }
            */
        },
        releaseSpaceByModelId: function(id) {
            this.bodySpace.releaseSpaceByModelId(id);
        },
        // get available space
        getSpace: function(y, w, h) {
            return this.bodySpace.mallocSpace(0, y, w, h);
        },

        // release paragraph spaces
        _releaseViewSpace: function(view) {
            var p = view;

            while (p) {
                p.releaseBodySpace && p.releaseBodySpace(this);
                p = this.container.next(p);
            }
        },

        //! get anchor element from point
        //! x, y relative to space body
        _getAnchorElement: function(anchor, x, y, path, options) {
            var vTools = ViewTools;

            if (vTools.isImage(anchor)) {
                path.push(anchor);
            } else if (vTools.isTextBox(anchor) || vTools.isCanvas(anchor)) {
                var parent = anchor.getParent();
                var parentLeft = parent.getLeft();
                var parentTop = parent.getTop();
                var thisLeft = this.getContentLeft();
                var thistop = this.getContentTop();

                var sx = x - (parentLeft - thisLeft);
                var sy = y - (parentTop - thistop);

                path.push(anchor);

                if (anchor.inTextZone(sx, sy)) {
                    anchor.getElementPath(sx, sy, null, path, options);
                }
            }

            return path;
        },

        getSpaceElementPath: function(x, y, path, options) {
            var vx = x;
            var vy = y;

            // try to get the anchor above text content
            var anchoredObj = ViewTools.getOccupiedObjectInSpace(this.bodySpace, x, y);
            if (anchoredObj && !anchoredObj.isBehindDoc() && !(options && options.notAnchor && anchoredObj.isAnchor))
                return this._getAnchorElement(anchoredObj, x, y, path, options);

            // select correct paragraph
            var tarPara = this.container.select(function(para) {
                if (para.h == 0)
                    return false;
                if (vy <= para.h) {
                    return true;
                } else {
                    vy = vy - para.h;
                    return false;
                }
            });

            if (tarPara) {
                // if there's anchor behind paragraph gap. then get anchor element.
                if (anchoredObj && anchoredObj.isBehindDoc()) {
                    if (tarPara.canBePenetrated(vx, vy))
                        return this._getAnchorElement(anchoredObj, x, y, path, options);
                }
            } else {
                if (anchoredObj && anchoredObj.isBehindDoc()) {
                    return this._getAnchorElement(anchoredObj, x, y, path, options);
                }

                tarPara = this.container.getLast();
                if (!tarPara)
                    return;

                vy = tarPara.h;
            }

            path.push(tarPara);
            tarPara.getElementPath(vx, vy, path, options);

            return path;
        },

        //
        drawSpace: function() {
            if (!this._DEBUG)
                return;

            this.drawOcuppiedSpace();
            this.drawContainedSpace();
        },

        _getPaddingLeft: function() {
            var vTools = ViewTools;
            var padding_left = 0;
            if (vTools.isHeader(this) || vTools.isFooter(this)) {
                padding_left = this.getLeft();
            }

            return padding_left;
        },

        // draw all ocuppied spaces for debug
        drawOcuppiedSpace: function() {
            if (this._spaceONode)
                domConstruct.destroy(this._spaceONode);

            this._spaceONode = domConstruct.create("div", {
                "class": "BodyOcuppied"
            }, this.domNode);

            var padding_left = this._getPaddingLeft();

            var callBack = function(space, i, param) {
                domConstruct.create("div", {
                        "style": "position:absolute" +
                            ";opacity:0.5" +
                            ";z-index:-10000" +
                            ";background-color:#B82832" +
                            ";font-size:0" +
                            ";border:0px solid #000000" +
                            ";left:" + (space.x + padding_left) + "px" +
                            ";top:" + space.y + "px" +
                            ";width:" + space.w + "px" +
                            ";height:" + space.h + "px"
                    },
                    param);
            };

            this.bodySpace.forEachOccupied(callBack, this._spaceONode);
        },

        // draw non occupied spaces
        drawContainedSpace: function() {
            if (this._spaceCNode)
                domConstruct.destroy(this._spaceCNode);

            this._spaceCNode = domConstruct.create("div", {
                "class": "BodyContained"
            }, this.domNode);

            var padding_left = this._getPaddingLeft();

            var callBack = function(space, i, param) {
                domConstruct.create("div", {
                        "style": "position:absolute" +
                            ";opacity:0.5" +
                            ";z-index:-10000" +
                            ";background-color:#808080" +
                            ";font-size:0" +
                            ";border:0px solid #000000" +
                            ";left:" + (space.x + padding_left) + "px" +
                            ";top:" + space.y + "px" +
                            ";width:" + space.w + "px" +
                            ";height:" + space.h + "px"
                    },
                    param);
            };

            this.bodySpace.forEachContained(callBack, this._spaceCNode);
        }
    };
    return SpaceBlock;
});

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
    "writer/common/tools",
    "writer/model/Model",
    "writer/model/update/Block_Container"
], function(lang, tools, Model, Block_Container) {

    var TableBase = function() {

    };
    TableBase.prototype = {
        byId: function(id) {
            var retModel = null;
            this.container.forEach(function(child) {
                if (child.id == id) {
                    retModel = child;
                    return false;
                } else {
                    var ret = child.byId && child.byId(id);
                    if (ret) {
                        retModel = ret;
                        return false;
                    }
                }
            });

            return retModel;
        },
        getTableProperty: function() {
            throw "Need implement the  getTableProperty function in model!";
        },
        getProperty: function() {
            throw "Need implement the  getProperty function in model!";
        },
        getConditionStyle: function() {
            var property = this.getProperty();
            if (!property) {
                return [];
            }
            var conditionStyle = property.getConditionStyle();
            return property.mergeConditionStyle(conditionStyle);
        },
        getParegrapphProperty: function() {

        },
        getCSSStyle: function() {
            var property = this.getProperty();
            if (!property) {
                return "";
            }
            var tableProperty = this.getProperty().getTableProperty();
            if (tableProperty) {
                return tableProperty.getCSSStyle(this.getConditionStyle(true));
            } else {
                var property = this.getProperty();
                if (property.getCSSStyle) {
                    return property.getCSSStyle();
                }
                return "";
            }

        },
        getBorder: function() {
            return this._getValue("getBorder");;
        },
        getGridBorder: function() {
            return this._getValue("getGridBorder");
        },
        getCellSpacing: function() {
            var property = this.getProperty();
            if (!property) {
                return 0;
            }
            var cs = property.getCellSpacing();
            var tableProperty = property.getTableProperty();
            if (cs > 0) {
                return cs;
            } else if (tableProperty) {
                return tableProperty.getCellSpacing(this.getConditionStyle());
            }
            return 0;
        },
        getColor: function() {
            var property = this.getProperty();
            if (!property) {
                return null;
            }
            return property.getColor();
        },
        _getValue: function(func) {
            var value = {};
            var property = this.getProperty();
            if (property) {
                property[func] && this._objMerge(value, property[func]());
                var tableProperty = this.getProperty().getTableProperty();
                tableProperty && this._objMerge(value, tableProperty[func](this.getConditionStyle()));
            }
            return value;
        },
        _objMerge: function(obj1, obj2) {
            var o = lang.clone(obj2);
            for (var i in o) {
                if (!obj1[i]) {
                    obj1[i] = o[i];
                }
            }
            return obj1;
        },
        markChangeCSSStyle: function() {
            var allViews = this.getAllViews();
            for (var ownerId in allViews) {
                var viewers = allViews[ownerId];
                var firstView = viewers.getFirst();
                while (firstView) {
                    firstView.changeCSSStyle(true);
                    firstView = viewers.next(firstView);
                }
            }
        },
        delayUpdate: true,
        isAllInsByMe: function() {
            var container = this.container;
            var isAllInsByMe = true;
            if(this.isTrackInsertedByMe(this.ch)){
            	var childNode = container.getFirst();
            	while(childNode){
                	if(childNode.isAllInsByMe && !childNode.isAllInsByMe()){
                		isAllInsByMe = false;
                		break;
                	} else if (!childNode.isTrackInsertedByMe(childNode.ch)){
                		isAllInsByMe = false;
                		break;
                	}
                	childNode = childNode.next();
            	}
            } else {
            	isAllInsByMe = false;
            }
            return isAllInsByMe;
        }
    };
    tools.extend(TableBase.prototype, new Block_Container());
    tools.extend(TableBase.prototype, new Model());
    return TableBase;
});

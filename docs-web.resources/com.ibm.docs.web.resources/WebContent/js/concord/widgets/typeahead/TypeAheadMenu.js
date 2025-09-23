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

/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright IBM Corp. 2011, 2012                                    */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.widgets.typeahead.TypeAheadMenu");
dojo.require("dijit.Menu");

//ComboBoxMenu doesn't allow us to override css classes
//so subclass it and use our own class names
//this allows us to avoid collisions with other menu types (e.g. popup menu)
dojo.declare(
    "concord.widgets.typeahead.TypeAheadMenu",
    [dijit.form._ComboBoxMenu], {

    templateString: "<ul class='dijitMenu typeaheadMenu' dojoAttachEvent='onmousedown:_onMouseDown,onmouseup:_onMouseUp,onmouseover:_onMouseOver,onmouseout:_onMouseOut' tabIndex='-1' style='overflow:\"auto\";'>"
            +"<li class='dijitTypeAheadMenuItem dijitMenuPreviousButton' dojoAttachPoint='previousButton'></li>"
            +"<li class='dijitTypeAheadMenuItem dijitMenuNextButton' dojoAttachPoint='nextButton'></li>"
        +"</ul>",

    createOptions:function(results, dataObject, labelFunc){
        this.previousButton.style.display=dataObject.start==0?"none":"";
        var _this=this;
        dojo.forEach(results, function(item){
            var menuitem=_this._createOption(item, labelFunc);
            menuitem.className = "dijitTypeAheadMenuItem";
            _this.domNode.insertBefore(menuitem, _this.nextButton);
        });

        this.nextButton.style.display = "none";
        this.previousButton.style.display = "none";
    },
        
    _focusOptionNode:function(/*DomNode*/ node){
        if(this._highlighted_option != node){
            this._blurOptionNode();
            this._highlighted_option = node;
            dojo.addClass(this._highlighted_option, "dijitTypeAheadMenuItemHover");
        }
    },

    _blurOptionNode:function(){
        if(this._highlighted_option){
            dojo.removeClass(this._highlighted_option, "dijitTypeAheadMenuItemHover");
            this._highlighted_option = null;
        }
    },

    
    // Don't clear the selection when mouse is out in order to keep the 
    // last selection. (Always need a selection to resolve the enter key)
    _onMouseOut:function(/*Event*/ evt){

    }
});

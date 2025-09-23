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
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/_base/declare",
    "dojo/dom",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/on",
    "dojo/query",
    "concord/util/BidiUtils",
    "concord/widgets/ResizePropDlg",
    "dijit/_base/wai",
    "dijit/form/TextBox",
    "writer/constants",
    "dojo/i18n!writer/ui/dialog/nls/TableProp",
], function (domConstruct, lang, aspect, declare, dom, domAttr, domClass, domStyle, on, query, BidiUtilsModule, ResizePropDlg, wai, TextBox, constants, i18n) {

    return declare("writer.ui.dialog.TableProp", ResizePropDlg, {
        createTextBoxContent: function (headerTbody) {
            // Width label and input
            var headerTR0 = domConstruct.create('tr', null, headerTbody);
            var headerTR0TD1 = domConstruct.create('td', { style: { width: "70px" } }, headerTR0);
            var headerTR1TD1 = domConstruct.create('td', { style: { width: "100px" } }, headerTR0);
            var headerTR1TD2 = domConstruct.create('td', { style: { width: "20px" } }, headerTR0);

            var labelWidthText = domConstruct.create('label', null, headerTR0TD1);
            var widthLabel = this.type == this.TABLECELL ? this.nls.columnWidth : this.nls.width;
            labelWidthText.appendChild(document.createTextNode(widthLabel));
            domAttr.set(labelWidthText, 'for', this.inputWidthID);
            this.widthInput = new TextBox({ value: this.formatLocalizedValue(this.currentWidth), id: this.inputWidthID, intermediateChanges: true });
            domClass.add(this.widthInput.domNode, "inputBox");

            this.widthInput.domNode.style.width = '8em';
            headerTR1TD1.appendChild(this.widthInput.domNode);
            wai.setWaiState(dom.byId(this.inputWidthID), "required", true);

            this.createErrorIcon(headerTR1TD2, this.widthErrorIconId, this.nls.validUnitsWarning);
		
            // Height label and input
            var headerTR2 = headerTR0;
            var headerTR2TD1 = domConstruct.create('td', { style: { width: "70px" } }, headerTR2);
            var headerTR3TD1 = domConstruct.create('td', { style: { width: "100px" } }, headerTR2);
            var headerTR3TD2 = domConstruct.create('td', { style: { width: "20px" } }, headerTR2);

            var labelHeightText = domConstruct.create('label', null, headerTR2TD1);
            var heightLabel = this.type == this.TABLECELL ? this.nls.rowHeight : this.nls.height;
            labelHeightText.appendChild(document.createTextNode(heightLabel));
            domAttr.set(labelHeightText, 'for', this.inputHeightID);
            this.heightInput = new TextBox({ value: this.formatLocalizedValue(this.currentHeight), id: this.inputHeightID, intermediateChanges: true });
            domClass.add(this.heightInput.domNode, "inputBox");

            this.heightInput.domNode.style.width = '8em';
            headerTR3TD1.appendChild(this.heightInput.domNode);
            wai.setWaiState(dom.byId(this.inputHeightID), "required", true);
            this.createErrorIcon(headerTR3TD2, this.heightErrorIconId, this.nls.validUnitsWarning);

            aspect.after(this.widthInput, "onChange", lang.hitch(this, this.widthChanged), true);
            on(this.widthInput.domNode, "keypress", lang.hitch(this, this.onKeyPressed));
            aspect.after(this.heightInput, "onChange", lang.hitch(this, this.heightChanged), true);
            on(this.heightInput.domNode, "keypress", lang.hitch(this, this.onKeyPressed));

            this.createRepeatHeader(headerTbody);
            if (BidiUtils.isBidiOn())
            	this.createChangeDirectionHeader(headerTbody);
        },

        show: function () {
            this.inherited(arguments);
            this.checkRepeatHeadState();
            this.initRhStatus = this.rhCheckBox.checked;
            if (BidiUtils.isBidiOn()) {
            	this.initDirStatus = this.dirCheckBox.checked = (this.focusObj.tableProperty.getDirection() == "rtl");
            }
        },

        checkRepeatHeadState: function () {
            var editor = pe.scene.getEditor();
            var table_plugin = editor.getPlugin("Table");
            var tState = table_plugin && table_plugin.getStateBySel(editor.getSelection());
            if (tState && tState.canRepeat) {
                this.rhCheckBox.disabled = false;
                this.rhCheckBox.checked = tState.repeat;
            }
            else {
                this.rhCheckBox.checked = false;
                this.rhCheckBox.disabled = true;
            }
        },

        createRepeatHeader: function (headerTbody) {
            var headerTR0 = domConstruct.create('tr', null, headerTbody);
            var headerTR0TD1 = domConstruct.create('td', { colSpan: "6", style: { paddingTop: "10px" } }, headerTR0);
            var id = this.inputWidthID + "_repeat_head";
            var checkbox = domConstruct.create('input', {type: "checkbox", id: id,  name: id}, headerTbody);
            headerTR0TD1.appendChild(checkbox);
            checkbox.style.verticalAlign = "middle";
            var label = BidiUtils.isGuiRtl() ? domConstruct.create('label', { style: { paddingRight: "10px" } }, headerTR0TD1) :
            	domConstruct.create('label', { style: { paddingLeft: "10px" } }, headerTR0TD1);

            label.innerHTML = i18n.repeatHeader;
            domAttr.set(label, 'for', checkbox.id);
            this.rhCheckBox = checkbox;
            this.rhRow = headerTR0;
            this.checkRepeatHeadState();
        },

        createChangeDirectionHeader: function (headerTbody) {
            var headerTR0 = domConstruct.create('tr', null, headerTbody);
            var headerTR0TD1 = domConstruct.create('td', { colSpan: "6", style: { paddingTop: "10px" } }, headerTR0);
            var id = this.inputWidthID + "_direction_head";
            var checkbox = domConstruct.create('input', {type: "checkbox", id: id,  name: id}, headerTbody);
            headerTR0TD1.appendChild(checkbox);
            checkbox.style.verticalAlign = "middle";
            var label = BidiUtils.isGuiRtl() ? domConstruct.create('label', { style: { paddingRight: "10px" } }, headerTR0TD1) :
            	domConstruct.create('label', { style: { paddingLeft: "10px" } }, headerTR0TD1);

            label.innerHTML = dojo.i18n.getLocalization("concord.widgets","menubar").formatMenu_Rtl;
            domAttr.set(label, 'for', checkbox.id);
            this.dirCheckBox = checkbox;
        },

        setContentBoxInfo: function () {
            this.inherited(arguments);
            var currentValue = this.rhCheckBox.checked;
            if (currentValue != this.initRhStatus) {
                pe.lotusEditor.execCommand('repeatHeader');
            }
            if (BidiUtils.isBidiOn() && (this.initDirStatus != this.dirCheckBox.checked)) {
                dojo.publish('flipTable',[this.focusObj]);
            }
        }
    })

});
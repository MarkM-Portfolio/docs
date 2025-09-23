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

dojo.provide("concord.widgets.PasteDlg");

dojo.require("dojo.io.iframe");
dojo.require("dijit.form.Button");
dojo.require("concord.widgets.TemplatedDialog");
dojo.require("concord.util.dialogs");
dojo.requireLocalization("concord.widgets","PasteDlg");

(function()
{

	var lockSelection = function( editor, lock )
	{
		if (!editor) 
			return; 
		if ( editor.mode == 'wysiwyg' && CKEDITOR.env.ie )
		{
			var selection = editor.getSelection();
			selection && (lock ? selection.lock() : selection.unlock( true ));
		}
	};

dojo.declare("concord.widgets.PasteDlg", [concord.widgets.TemplatedDialog], {

	_iframe : null,
	html : "",
	callback : null,
	editor : null,
	
	onShow : function(){
		lockSelection(this.editor, true);
		
		this.inherited( arguments );

		var me = this;
		var fieldset = dojo.byId("C_d_PasteDlg_fieldset");
		var iframe = this._iframe = dojo.create( "iframe", null, fieldset );
		var keyPressed = function( e )
		{
			if (dojo.keys.ESCAPE===e.keyCode)
				me.hide();
		};
		
		if( dojo.isIE )
		{
			var doc = iframe.contentWindow.document;
			doc.open();
			dojo.connect( doc, "onkeypress", keyPressed );
			doc.write( "<html><body contentEditable='true'></body></html>");
			doc.close();
			setTimeout( function()
					{
						iframe.contentWindow.focus();
					}, 500 );
		}
		else
		{	
			iframe.onload = function()
			{
				var d = iframe.contentWindow.document;
				dojo.connect( d, "onkeypress", keyPressed );
				d.designMode = "on";
			}
			iframe.src = "javascript:void(0)";
		}

		iframe.style.cssText = "height: 130px; background-color: white; border: 1px solid black;";
	},
	onHide : function()
	{
		//this.editor.origRange = null;
		this.inherited( arguments );
		this.html = this._iframe.contentWindow.document.body.innerHTML;
		//this._iframe.parentNode.removeChild(this._iframe);
		lockSelection(this.editor, false);
		setTimeout( dojo.hitch(this,function()
				{
					this._iframe.parentNode.removeChild(this._iframe);
				}), 500 );
	},
	execute : function()
	{
		var origRange = this.editor.origRange;
		if(origRange && MSGUTIL.isSelectedRangeNotAvailable(origRange,true))
		{
			var nls = dojo.i18n.getLocalization('concord.widgets','toolbar');
			var warningMessage = nls.targetRemovedWhenDialogOpen;
			pe.scene.showWarningMessage(warningMessage,2000);
			this.editor.origRange = null;
			return;
		}
		
		this.callback( this.html );
	}
});


concord.widgets.PasteDlg.show = function( cllbk, editor_obj )
{
	concord.util.dialogs.showDlgFromTmplt( "C_d_Paste", { callback : cllbk, editor : editor_obj },
			dojo.i18n.getLocalization("concord.widgets","PasteDlg") );
};

})();

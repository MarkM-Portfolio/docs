dojo.provide("writer.plugins.InsertImage");
dojo.require("writer.plugins.Plugin");
dojo.require("concord.widgets.InsertImageDlg");
dojo.declare( "writer.plugins.InsertImage", [writer.plugins.Plugin], {
	onSelectionChange: function(){
		var viewTools = writer.util.ViewTools;
		var selection = pe.lotusEditor.getSelection();
		var ranges = selection.getRanges();
		var range = ranges[0];
		if(!range)
			return;
		var startView = range.getStartView();
		var startViewObj = startView && startView.obj;

		// is in Textbox with non-text horizonal align. or in just words
		var bInNonHorizonalTextbox = false;
		var bInJustwordsTextbox = false;
		if (startViewObj)
		{
			var textbox = writer.util.ViewTools.getTextBox(startViewObj);
			if (textbox)
			{
				bInNonHorizonalTextbox = !textbox.model.isHorz();
				bInJustwordsTextbox = textbox.model.isJustWords();
			}
		}

		var toc_plugin = this.editor.getPlugin("Toc");
		var toc_disable = toc_plugin && toc_plugin.getSelectedToc();
		var field_plugin = this.editor.getPlugin("Field");
		var field_disable = field_plugin && field_plugin.ifInField();

		var disable = bInNonHorizonalTextbox || bInJustwordsTextbox || toc_disable || field_disable;
		this.editor.getCommand('insertImage').setState( (!disable) ? writer.TRISTATE_OFF :writer.TRISTATE_DISABLED);
		this.editor.getCommand('uploadimage').setState( (!disable) ? writer.TRISTATE_OFF :writer.TRISTATE_HIDDEN);
	},
	init: function() {
		var lotusEditor = this.editor;
		
		var local_dialog = {
			_uploadUrl : writer.config.config.filebrowserImageUploadUrl,
			editor: lotusEditor,
			onshow_hdl : function()
			{
				//lockSelection( this.editor, true );
//				var input = dojo.byId('C_d_InsertImageInputFile');
//				if(dojo.isMac)
//				{
//					input.setAttribute('size',43);
//				}else
//					input.setAttribute('size',55);
			},
			onhide_hdl : function()
			{
				//lockSelection( this.editor, false );
			},
			
			_callback : function( url, loadingTimer )
			{
				lotusEditor.execCommand("insertImage", [url, loadingTimer]);
			}
		};
		
		var openInsertImageDlgCommand = 
		{
			exec: function()
			{
//				local_dialog._uploadUrl = writer.config.config.filebrowserImageUploadUrl;
				concord.widgets.InsertImageDlg.show(local_dialog);
			}
		};
		
		dojo.subscribe(writer.EVENT.SELECTION_CHANGE, this, this.onSelectionChange);
		
		var insertImage =
		{
			/*
			 * @param args[0]:url
			 * @param args[1]:loadingTimer
			 * @param args[2]:finish callback
			*/
			exec: function(args)
			{
				// 1. Create Image Json
				var url = encodeURI(decodeURI( args[0] ));
				var element = dojo.create('img', {'src': url});
				var selection = pe.lotusEditor.getSelection();
				if (!selection){
					return ;
				}
				var ranges = selection.getRanges();
				if (!ranges){
					return ;
				}
				if(!writer.util.RangeTools.canDo(ranges)){
					/*if the range is crossing more than one footnote/endnote, it can not delete anything.				 */
					return;
				}
				var onLoad = function(event){
//					if( event )
//						event.removeListener();

					var selection = lotusEditor.getSelection();
					var range = selection.getRanges()[0];
					var views = ["page.Body", 'page.Header', 'page.Footer'];
					var bodyView = writer.util.ViewTools.getParentViewByType(range._start.obj, views);
					var bodySize = writer.util.ViewTools.getSize(bodyView);
					
					var width = element.width;
					var scale = 1.0;
					if(bodySize.w < element.width)
					{
						scale = bodySize.w / element.width;
						width = bodySize.w;
					}
					
					var width = ((width*0.75)/72)*2.54 + "cm";
					var height = ((element.height*0.75*scale)/72)*2.54 + "cm";
					
					var imageObj = new writer.model.text.Image();
					imageObj.width = width;
					imageObj.height = height;
					imageObj.url = url;
					imageObj.noChangeAspect = "1";
					
					// 2. Insert to shell
					var cnt = {};
					cnt.c = "\u0001";
					cnt.fmt = [imageObj.toJson()];
					
					lotusEditor.getShell().insertInlineObj(cnt);
					var loadingTimer = args[1];
					if(loadingTimer != null)
					{
						clearTimeout(loadingTimer);
						loadingTimer = null;
					}
					pe.scene.hideErrorMessage();
					
					// 3. finish callback
					var callback = args[2];
					if( callback != null )
						callback();
				};
				
				if( element.width && element.height )
					onLoad(null);
				else
					dojo.connect(element, "load", null, onLoad);
			}
		};
		
		/*
		 * open insertImage dialogue
		*/
		lotusEditor.addCommand("uploadimage", openInsertImageDlgCommand);
		
		/*
		 * @param args[0]:url
		 * @param args[1]:loadingTimer
		*/
		lotusEditor.addCommand("insertImage", insertImage);
	}
});
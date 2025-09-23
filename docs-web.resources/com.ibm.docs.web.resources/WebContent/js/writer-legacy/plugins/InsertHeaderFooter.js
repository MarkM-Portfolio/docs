dojo.provide("writer.plugins.InsertHeaderFooter");
dojo.require("writer.plugins.Plugin");
/**
 * FIXME: not implemented yet
 */
dojo.declare( "writer.plugins.InsertHeaderFooter",
		[writer.plugins.Plugin], {
			init: function(){
				var insertHeaderFooter = function(isHeader){

					console.log("insert header");
					
					// get page
					var page = null;
					var selection = pe.lotusEditor.getSelection();
					if (selection){
						var ranges = selection.getRanges();
						var range = ranges && ranges[0];
						if (range){
							var startView = range.getStartView();
							if (startView.obj){
								startView = startView.obj;
							}
							page = writer.util.ViewTools.getPage(startView);
						}
					}
					
					if (!page)
					{
						var scrollTop = pe.lotusEditor.getScrollPosition();
						page = pe.lotusEditor.layoutEngine.rootView.getScrollPage(scrollTop);
					}

					if (!page){
						console.log("current page is not found!!");
						return;
					}

					writer.util.SectionTools.insertHeaderFooter(page, isHeader);
				};
				var insertHeaderCommand = 
				{
					exec: function()
					{
						insertHeaderFooter(true);
					}
				};
				var insertFooterCommand = 
				{
					exec: function()
					{
						insertHeaderFooter(false);
					}
				};
				
				this.editor.addCommand("insertHeader", insertHeaderCommand);
				this.editor.addCommand("insertFooter", insertFooterCommand);

				dojo.subscribe(writer.EVENT.EDITAREACHANGED, this, this.editModeChangeHandler);
			},

			/*
			 * when leave header/footer, check if it need to delete hader/footer.
			*/
			editModeChangeHandler: function()
			{
				if (pe.lotusEditor.isHeaderFooterEditing())
					return;

				var page = null;
				var selection = pe.lotusEditor.getSelection();
				if (selection){
					var ranges = selection.getRanges();
					var range = ranges && ranges[0];
					if (range){
						var startView = range.getStartView();
						if (startView.obj){
							startView = startView.obj;
						}
						page = writer.util.ViewTools.getPage(startView);
					}
				}

				if (!page)
					return;

				var secTools = writer.util.SectionTools;
				var section = page.section;

				var header = page.getHeader();
				if (header && header.model && header.model.isContentEmpty())
				{
					console.log("delete header!");
					secTools.deleteHeaderFooter(section, header.model.rId, true);
				}

				var footer = page.getFooter();
				if (footer && footer.model && footer.model.isContentEmpty())
				{
					console.log("delete footer!");
					secTools.deleteHeaderFooter(section, footer.model.rId, false);
				}
			}
});
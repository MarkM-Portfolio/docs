dojo.provide("writer.plugins.HeaderFooter");
dojo.require("writer.plugins.Plugin");
dojo.require("writer.util.SectionTools");

dojo.declare( "writer.plugins.HeaderFooter", [writer.plugins.Plugin], {
	// on edit mode change
	onEditModeChange: function(){
		var f = function(hf, isHFEditing)
		{
			hf.broadcast("editModeChange", isHFEditing);
		};

		pe.lotusEditor.relations.forEachHeaderFooter(f, pe.lotusEditor.isHeaderFooterEditing());
	},

	// get header/footer
	getCurrentHeaderFooter: function()
	{
		var viewTools = writer.util.ViewTools;
		var ret = {"header" : null, "footer" : null};
		var selection = pe.lotusEditor.getSelection();
		
		if (selection){
			var ranges = selection.getRanges();
			var range = ranges && ranges[0];
			if (range){
				var startView = range.getStartView();
				if(!startView) return null;
				if (startView.obj){
					startView = startView.obj;
				}
				ret.header = viewTools.getHeader(startView);
				if (!ret.header)
					ret.footer = viewTools.getFooter(startView);
			}
		}
		
		return ret.header || ret.footer;
	},
	
	init: function()
	{
		var editor = this.editor;
		var viewTools = writer.util.ViewTools;
		var secTools = writer.util.SectionTools;
		var getCurrentHeaderFooter = this.getCurrentHeaderFooter;
		// is in first page of section now?
		var isInFirstPage = function()
		{
			var tarView = getCurrentHeaderFooter();
			if (!tarView)
				return false;
		
			var page = writer.util.ViewTools.getPage(tarView);
			return page && page.isFirstPage;
		};
		
		// is in first diff page of section now?
		var isInDiffFirstPage = function()
		{
			var tarView = getCurrentHeaderFooter();
			if (!tarView)
				return false;
		
			var page = writer.util.ViewTools.getPage(tarView);
			return page && page.isDiffFirstPage;
		};
		
		// is in first section now?
		var isInFirstSection = function()
		{
			var tarView = getCurrentHeaderFooter();
			if (!tarView)
				return false;

			var page = writer.util.ViewTools.getPage(tarView);
			var currentSec = page && page.section;
			if (!currentSec)
				return false;
				
			var setting = pe.lotusEditor.setting;
			return setting.getFirstSection() == currentSec;
		};
		
		// is current header/footer is different first page
		var isDiffFirst = function()
		{
			var tarView = getCurrentHeaderFooter();
			if (!tarView)
				return false;
				
			return secTools.isHFDiffFirstPage(tarView);
		};
		
		// is different odd&even pages
		var isDiffOddEven = function()
		{
			return secTools.isHFDiffOddEvenPages();
		};
		
		// is linked to previous section
		var isLinkedToPre = function()
		{
			var tarView = getCurrentHeaderFooter();
			if (!tarView)
				return false;
		
			return secTools.isHFLinkedToPrevious(tarView);
		};
		
		// set different first page
		var SetDiffFirst = function()
		{
			console.log("Header/Footer: set different first page");
			
			var tarView = getCurrentHeaderFooter();
			tarView && secTools.setHFDifferentFirstPage(tarView);
		};
		
		// set different odd & even pages
		var SetDiffOddEven = function()
		{
			console.log("Header/Footer: set different odd & even pages");
			
			var tarView = getCurrentHeaderFooter();
			tarView && secTools.setHFOddEvenPages(tarView, true);
		};
		
		// set link to previous
		var SetLinkToPre = function()
		{
			console.log("Header/Footer: set link to previous");
			
			var tarView = getCurrentHeaderFooter();
			tarView && secTools.setHFLinkToPrevious(tarView);
		};
		
		// Commands
		var commands =
		[
			{
				name: "HeaderFooter",
				exec: function() {}
			},
			{
				name: "DiffFirst",
				exec: function(){
					SetDiffFirst();
				}
			},
			{
				name: "DiffOddEven",
				exec: function(){
					SetDiffOddEven();
				}
			},
			{
				name: "LinkToPre",
				exec: function(){
					SetLinkToPre();
				}
			},
		];
		
		// add Commands
		for (var i in commands){
			this.editor.addCommand(commands[i].name, commands[i]);
		}
		
		// Context Menu
		var nls = dojo.i18n.getLocalization("concord.widgets","menubar");
		var ctx = this.editor.ContextMenu;
		var menuItems =
		[
			{
				name: 'HeaderFooter',
				commandID: 'HeaderFooter',
				label : nls.ctxMenu_HeaderFooter,
				iconClass : 'dijitEditorIcon dijitEditorIconCopy',
				group : 'hdrftr',
				order : 'HeaderFooter',
				disabled : false
			},
			{
				isCheckedMenu : true,
				name: 'DiffFirst',
				commandID: 'DiffFirst',
				label : nls.ctxMenu_HeaderFooter_DiffFirst,
				//iconClass : 'dijitEditorIcon dijitEditorIconCopy',
				group : 'HeaderFooter',
				order : 'DiffFirst',
				disabled : false,
				checked : false
			},
			{
				isCheckedMenu : true,
				name: 'DiffOddEven',
				commandID: 'DiffOddEven',
				label : nls.ctxMenu_HeaderFooter_DiffOddEven,
				//iconClass : 'dijitEditorIcon dijitEditorIconCopy',
				group : 'HeaderFooter',
				order : 'DiffOddEven',
				disabled : false,
				checked : false
			},
			{
				isCheckedMenu : true,
				name: 'LinkToPre',
				commandID: 'LinkToPre',
				label : nls.ctxMenu_HeaderFooter_LinkToPre,
				//iconClass : 'dijitEditorIcon dijitEditorIconCopy',
				group : 'HeaderFooter',
				order : 'LinkToPre',
				disabled : false,
				checked : false
			},
		];
		
		// add menu
		if(ctx && ctx.addMenuItem){
			for (var i in menuItems){
				ctx.addMenuItem(menuItems[i].name, menuItems[i]);
			}
		}
		
		// add listener
		if(ctx && ctx.addListener)
		{
			ctx.addListener(function(target,selection)
			{
				var target = getCurrentHeaderFooter();
				if (!target)
					return {};
			
				var ret = {};
				ret.HeaderFooter =
				{
					checked: false,
					getSubItems: function()
					{
						return {
							DiffFirst:		{disabled: /*!isInFirstPage()*/false,	checked: isDiffFirst()		},
							DiffOddEven:	{disabled: /*isInDiffFirstPage()*/false,	checked: isDiffOddEven()	},
							LinkToPre:		{disabled: isInFirstSection(),	checked: isLinkedToPre()	}
						};
					}
				};
				
				// set command state
				var setCState = function(items)
				{
					for (var id in items)
					{
						var item = items[id];
					
						cmd = pe.lotusEditor.getCommand(id);
						if (cmd)
						{
							if (item.disabled)
								cmd.state = writer.TRISTATE_DISABLED;
							else
								cmd.state = item.checked ? writer.TRISTATE_ON : writer.TRISTATE_OFF;
						}
						
						if (item.getSubItems)
							setCState(item.getSubItems());
					}
				}
				
				setCState(ret);
				
				return ret;
			});
		}

		dojo.subscribe(writer.EVENT.EDITAREACHANGED, this, this.onEditModeChange);
	}
});
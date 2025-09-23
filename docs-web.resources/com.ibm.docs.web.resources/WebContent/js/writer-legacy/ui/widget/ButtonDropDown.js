/**
 * 
 */
dojo.provide("writer.ui.widget.ButtonDropDown");
dojo.require("writer.ui.widget._HasDropDown");
// module:
//		writer.ui.widget.ButtonDropDown
dojo.declare("writer.ui.widget.ButtonDropDown", [dijit.form.Button, dijit._Container, writer.ui.widget._HasDropDown], {
	// summary:
	//		A button with a click event and a drop down
	//
	// example:
	// |	<button data-dojo-type="dijit/form/DropDownButton">
	// |		Hello world
	// |		<div data-dojo-type="dijit/Menu">...</div>
	// |	</button>
	//
	// example:
	// |	var button1 = new ButtonDropDown({ label: "hi", dropDown: new dijit.Menu(...) });
	// |	win.body().appendChild(button1);
	//

//	baseClass : "dijitDropDownButton",

	templateString: dojo.cache("writer.ui.widget", "templates/ButtonDropDown.html"),

	_fillContent: function(){
		// Overrides Button._fillContent().
		//
		// My inner HTML contains both the button contents and a drop down widget, like
		// <DropDownButton>  <span>push me</span>  <Menu> ... </Menu> </DropDownButton>
		// The first node is assumed to be the button content. The widget is the popup.

		if(this.srcNodeRef){ // programatically created buttons might not define srcNodeRef
			//FIXME: figure out how to filter out the widget and use all remaining nodes as button
			//	content, not just nodes[0]
			var nodes = query("*", this.srcNodeRef);
			this.inherited(arguments, [nodes[0]]);

			// save pointer to srcNode so we can grab the drop down widget after it's instantiated
			this.dropDownContainer = this.srcNodeRef;
		}
	},
	postCreate:function(){
		this.inherited(arguments);
		this.iconNode.onmouseover=function(e){
			var t = e.target;
			t && dojo.addClass(t,'buttonDropiconButtonHover');
		};
		this.iconNode.onmouseout=function(e){
			var t = e.target;
			t && dojo.removeClass(t,'buttonDropiconButtonHover');
		};
		this.connect(this.containerNode,"onclick",function(e){
			if(this.disabled || this.readOnly){ return; }
			if(e.currentTarget.id && e.currentTarget.id.indexOf('D_t_BulletList') != -1){
				pe.lotusEditor.execCommand("bullet",{"numbering":"", "onOff":true});
			}
			else if(e.currentTarget.id && e.currentTarget.id.indexOf('D_t_NumberList') != -1){
				pe.lotusEditor.execCommand("numbering", {"numbering":"", "onOff":true});
			}else if(e.currentTarget.id && e.currentTarget.id.indexOf('D_t_AddRow') != -1){
				pe.lotusEditor.execCommand("insertRowBelow");
			}else if(e.currentTarget.id && e.currentTarget.id.indexOf('D_t_AddColumn') != -1){
				pe.lotusEditor.execCommand("insertColAft");
			}else if(e.currentTarget.id && e.currentTarget.id.indexOf('D_t_ColorCell') != -1){
				pe.lotusEditor.execCommand('setTableColor',pe.lotusEditor.dropdwonState["cellColor"]);
			}else if(e.currentTarget.id && e.currentTarget.id.indexOf('D_t_FontColor') != -1){
				pe.lotusEditor.execCommand("ForeColor", pe.lotusEditor.dropdwonState["color"]);
			}else if(e.currentTarget.id && e.currentTarget.id.indexOf('D_t_HighlightColor') != -1){
				pe.lotusEditor.execCommand("HighlightColor", pe.lotusEditor.dropdwonState["backgroundColor"]);
			}else if(e.currentTarget.id && e.currentTarget.id.indexOf('D_t_CellBorder') != -1){
				this.toggleDropDown();
				var dropDown = this.dropDown;
				setTimeout(function(){
					dropDown.focus();
				},2);
			}
		});
		this.connect(this.iconNode,"onclick",function(e){
			if(this.disabled || this.readOnly){ return; }
			if(e.currentTarget.className.indexOf('bullet') != -1){
				pe.lotusEditor.execCommand("bullet",{"numbering":"", "onOff":true});
			}
			else if(e.currentTarget.className.indexOf('number') != -1){
				pe.lotusEditor.execCommand("numbering", {"numbering":"", "onOff":true});
			}else if(e.currentTarget.className.indexOf('addRow') != -1){
				pe.lotusEditor.execCommand("insertRowBelow");
			}else if(e.currentTarget.className.indexOf('addColumn') != -1){
				pe.lotusEditor.execCommand("insertColAft");
			}else if(e.currentTarget.className.indexOf('colorCell') != -1){
				pe.lotusEditor.execCommand('setTableColor',pe.lotusEditor.dropdwonState["cellColor"]);
			}else if(e.currentTarget.className.indexOf('fontColor') != -1){
				pe.lotusEditor.execCommand("ForeColor", pe.lotusEditor.dropdwonState["color"]);
			}else if(e.currentTarget.className.indexOf('highlightColor') != -1){
				pe.lotusEditor.execCommand("HighlightColor", pe.lotusEditor.dropdwonState["backgroundColor"]);
			}else if(e.currentTarget.className.indexOf('cellBorder') != -1){
				this.toggleDropDown();
				var dropDown = this.dropDown;
				setTimeout(function(){
					dropDown.focus();
				},2);
			}
				
		});
		
		this.connect(this._buttonCharNode, "onmousedown", "_onDropDownMouseDown");
		this.connect(this._buttonCharNode, "onclick", "_onDropDownClick");
		this._buttonNode.onmouseover=function(e){
			var t = e.target;
			t && dojo.addClass(t,'iconButton');
		};
		this._buttonNode.onmouseout=function(e){
			var t = e.target;
			t && dojo.removeClass(t,'iconButton');
		};
	},
	toggleDropDown: function(){
		// summary:
		//		Callback when the user presses the down arrow button or presses
		//		the down arrow key to open/close the drop down.
		//		Toggle the drop-down widget; if it is up, close it, if not, open it
		// tags:
		//		protected

		if(this.disabled || this.readOnly){ return; }
		if(!this._opened){			
			// If we aren't loaded, load it first so there isn't a flicker
			if(!this.isLoaded()){
				this.loadDropDown(dojo.hitch(this, "openDropDown"));
				return;
			}else{
				this.openDropDown();
			}
						
			if("D_m_FontColor" == this.dropDown.id){
				if(pe.lotusEditor){
					plugin = pe.lotusEditor.getPlugin && pe.lotusEditor.getPlugin("Font");
					if(plugin){
						var styles = plugin.getStyleBySelection(true);							
						var colorPallete = this.dropDown;						
						if("autoColor" == styles["color"] || styles["color"] == "auto"){
							colorPallete.setFocus(colorPallete.autoNode);
						}else{
							var color = styles["color"].toUpperCase();
							colorPallete._currentColor =color;
							var index = colorPallete.colorMap[styles["color"].toUpperCase()];
							if(index != undefined){
								colorPallete.setFocus(colorPallete._cells[index].node);
							}else{
								colorPallete.setFocus(colorPallete._cells[0].node);
							}
						}						
					}
				}
			}else if("D_m_HighlightColor" == this.dropDown.id){
				if(pe.lotusEditor){
					plugin = pe.lotusEditor.getPlugin && pe.lotusEditor.getPlugin("Font");
					if(plugin){
						var styles = plugin.getStyleBySelection(true);							
						var colorPallete = this.dropDown;
						if("autoColor" == styles["backgroundColor"] || styles["backgroundColor"] == "auto"){
							colorPallete.setFocus(colorPallete.autoNode);
						}else{
							var color = styles["backgroundColor"].toUpperCase();
							colorPallete._currentColor =color;
							var index = colorPallete.colorMap[styles["backgroundColor"].toUpperCase()];
							if(index != undefined){
								colorPallete.setFocus(colorPallete._cells[index].node);
							}else{
								colorPallete.setFocus(colorPallete._cells[0].node);
							}
						}							
					}
				}				
			}else if("D_m_ColorCell" == this.dropDown.id){
				if(pe.lotusEditor) {
					var plugin = pe.lotusEditor.getPlugin && pe.lotusEditor.getPlugin("Table");
					if(plugin){
						var color = plugin.getColor();
						var colorPallete = this.dropDown;
						colorPallete._currentColor = color.toUpperCase();
						if("autoColor" == color || color == "auto"){
							colorPallete.setFocus(colorPallete.autoNode);
						}else{
							var index = colorPallete.colorMap[color.toUpperCase()];
							if(index != undefined){
								colorPallete.setFocus(colorPallete._cells[index].node);
							}else{
								colorPallete.setFocus(colorPallete._cells[0].node);
							}
						}
					}
				}
			}else if ("writer_ui_widget_ListStyle_1" == this.dropDown.id){
				plugin = pe.lotusEditor.getPlugin && pe.lotusEditor.getPlugin("list");
				if(plugin){
					var listStyle = plugin.getListType();					
					var listStylePane = this.dropDown;
					listStylePane._setCurrent(listStylePane.cells[listStylePane.getIndex(listStyle)]);
					listStylePane.focus();
				}				
			}else if ("writer_ui_widget_ListStyle_2" == this.dropDown.id){
				plugin = pe.lotusEditor.getPlugin && pe.lotusEditor.getPlugin("list");
				if(plugin){
					var listStyle = plugin.getListType(true);					
					var listStylePane = this.dropDown;
					listStylePane._setCurrent(listStylePane.cells[listStylePane.getIndex(listStyle, true)]);
					listStylePane.focus();
				}
				
			}
		}else{
			this.closeDropDown();
		}
	},
	startup: function(){
		if(this._started){ return; }

		// the child widget from srcNodeRef is the dropdown widget.  Insert it in the page DOM,
		// make it invisible, and store a reference to pass to the popup code.
		if(!this.dropDown && this.dropDownContainer){
			var dropDownNode = query("[widgetId]", this.dropDownContainer)[0];
			this.dropDown = registry.byNode(dropDownNode);
			delete this.dropDownContainer;
		}
		if(this.dropDown){
			dijit.popup.hide(this.dropDown);
		}

		this.inherited(arguments);
	},

	isLoaded: function(){
		// Returns whether or not we are loaded - if our dropdown has an href,
		// then we want to check that.
		var dropDown = this.dropDown;
		return (!!dropDown && (!dropDown.href || dropDown.isLoaded));
	},

	loadDropDown: function(/*Function*/ callback){
		// Default implementation assumes that drop down already exists,
		// but hasn't loaded it's data (ex: ContentPane w/href).
		// App must override if the drop down is lazy-created.
		var dropDown = this.dropDown;
		var handler = dropDown.on("load", lang.hitch(this, function(){
			handler.remove();
			callback();
		}));
		dropDown.refresh();		// tell it to load
	},

	isFocusable: function(){
		// Overridden so that focus is handled by the _HasDropDown mixin, not by
		// the _FormWidget mixin.
		return this.inherited(arguments) && !this._mouseDown;
	}
});

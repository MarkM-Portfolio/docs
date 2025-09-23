dojo.provide("concord.widgets.headerfooter.toolbar");
dojo.require("dojo.i18n");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.Button");
dojo.require("dijit.ColorPalette");
dojo.require("dijit.Menu");
dojo.require("dijit.form.Select");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("concord.widgets.headerfooter.headerfooter");
dojo.require("concord.widgets.headerfooter.headerfooterUtil");
dojo.require("concord.editor.PopularFonts");
dojo.require("concord.util.BidiUtils");

dojo.requireLocalization("concord.widgets.headerfooter","toolbar");

dojo.declare("concord.widgets.headerfooter.toolbar", null, {
	
	constructor: function ()
	{
		this.nls = dojo.i18n.getLocalization("concord.widgets.headerfooter","toolbar");
		this._toolbar = null;
		this._createTogglebar();
		this._createBackground();
		this._createToolbar();
	},
	_createTogglebar:function()
	{
		var mainNode = dojo.byId('mainNode');
		//for header
		var togglebar=dojo.create('div',null,mainNode);
	    togglebar.id = "togglebar";
	    togglebar.className = 'headerfooter_expand';
	    togglebar.title = this.nls.HeaderCollapse;
	    togglebar.style.display="none";
		dojo.connect(togglebar,'onclick',dojo.hitch(this, this.expandCollapse));
		//for footer
		var togglebar1=dojo.create('div',null,mainNode);
	    togglebar1.id = "togglebar1";
	    togglebar1.className = 'headerfooter_expand1';
	    togglebar1.title = this.nls.FooterCollapse;
	    togglebar1.style.display="none";
		dojo.connect(togglebar1,'onclick',dojo.hitch(this, this.expandCollapse1));
	},
	expandCollapse:function()
	{
		var header=dojo.byId("headerDivCon");
		var toggler=dojo.byId("togglebar");
		if( header.style.display == 'none' )
	    {
	    	pe.scene.headerfooter.showHeader();
			toggler.className = 'headerfooter_expand';
			toggler.title = this.nls.HeaderCollapse;
			dojo.style(toggler, {
				"top":(pe.scene.headerfooter.getHeaderMarginTop()+20)+"px"
			});			
	    }
	    else
	  	{
	    	pe.scene.headerfooter.hideHeader();
			toggler.className = 'headerfooter_collapse';
			toggler.title = this.nls.HeaderExpand;
			dojo.style(toggler, {
				"top":(pe.scene.headerfooter.getHeaderMarginTop()+20)+"px"
			});			
	  	}
	},
	isVisible:function(id){
		var node=dojo.byId(id);
		if(!node){
			return false;
		}
		var visible =dojo.style(node,"display");
		if(visible&&visible=="none"){
			return false;
		}
		return true;
	},
	expandCollapse1:function()
	{
		var footer=dojo.byId("footerDivCon");
		var toggler=dojo.byId("togglebar1");
		if( footer.style.display == 'none' )
	    {
	    	pe.scene.headerfooter.showFooter();
			toggler.className = 'headerfooter_expand1';
			toggler.title = this.nls.FooterCollapse;
	    }
	    else
	  	{
	    	pe.scene.headerfooter.hideFooter();
			toggler.className = 'headerfooter_collapse1';
			toggler.title = this.nls.FooterExpand;
	  	}
	},
	_createBackground:function()
	{
		var mainNode=dojo.byId('mainNode');
		var back=dojo.create('div',null,mainNode);
		dojo.attr(back,"id","back");
		dojo.style(back, {
			"top":"0px",
			"left":"0px",
			"position":"absolute",
			"background":"#666",
			"width":"100%",
			"height":"100%",
			"display":"none",
			"opacity": "0.3"
		});
		
		// for side bar.
		var sideBar = dojo.byId('ll_sidebar_div');
		mainNode=dojo.byId('mainNode');
		back=dojo.create('div',null,mainNode);
		dojo.attr(back,"id","back1");
		dojo.style(back, {
			"top":(sideBar? sideBar.offsetTop : 0)+"px",
			"left":"0px",
			"position":"absolute",
			"background":"#666",
			"width":(sideBar ? sideBar.offsetWidth : 0 )+'px',
			"height":"100%",
			"display":"none",
			"zIndex":1,
			"opacity": "0.3"
		});
		
		this.updateLocation();
	},
	updateLocation:function()
	{
		var backVisible=this.isVisible("back");
		var back1Visible = this.isVisible("back1");
		var h =null;
		if(backVisible||back1Visible){
			var back=dojo.byId('back');
			h = concord.widgets.headerfooter.headerfooterUtil.getAbsDocBottom();
			if(back&&backVisible)
			{
				dojo.style(back, {
					"height":h+"px"
				});
			}
			var back1=dojo.byId('back1');
			if(back1&&back1Visible)
			{
				var sideBar = dojo.byId('ll_sidebar_div');
				sideBar && dojo.style(back1, {
					"top":sideBar.offsetTop+"px",
					"width":sideBar.offsetWidth+"px"
				});
			}
		}
		if(pe.scene.headerfooter && pe.scene.headerfooter.currentArea=="footer")
		{
			var body=pe.scene.CKEditor.document.getBody();
			var frame=dojo.byId('cke_contents_editor1');
			var toolbar=dojo.byId("toolbarCon");
			if(!h){
				h = concord.widgets.headerfooter.headerfooterUtil.getAbsDocBottom();
			}
			if(body.$.clientHeight<frame.clientHeight)
			{
				var marginbottom=frame.clientHeight-body.$.clientHeight-67;
				dojo.style(toolbar, {
					"display":"",
					"bottom":(marginbottom+67)+"px",
					"top":""
				});
			}
			else
			{
				dojo.style(toolbar,"display","");
				var height = toolbar.offsetHeight;
				dojo.style(toolbar,{
					"bottom":"",
					"top":(h-67-height)+"px"
				});
			}
		}	
	},
	_attachdbl:function()
	{
		var back=dojo.byId('back');
		dojo.connect(back,'ondblclick',dojo.hitch(pe.scene.headerfooter, pe.scene.headerfooter.quitEdit));
		var back1=dojo.byId('back1');
		back1 && dojo.connect(back1,'ondblclick',dojo.hitch(pe.scene.headerfooter, pe.scene.headerfooter.quitEdit));
	},
	_createToolbar:function()
	{
		var mainNode = dojo.byId('mainNode');
		var toolbarCon=dojo.create('div',null,mainNode);
		dojo.attr(toolbarCon,"id","toolbarCon");
		dojo.attr(toolbarCon,"class","header_div");
		dojo.style(toolbarCon, {
			"display":"none"
		});
		var toolbar = new dijit.Toolbar({},"toolbar");
		this._toolbar = toolbar;
		toolbar.connect(toolbar,"onKeyDown",function(e){
			var keyCode = e.keyCode;
			switch(keyCode)
			{
				case dojo.keys.ESCAPE:
					pe.scene.headerfooter && pe.scene.headerfooter.setCursor();
					e.preventDefault();
					break;
				case dojo.keys.TAB:
					if( e.shiftKey && !e.ctrlKey )
						toolbar.focusPrev();
					else if( !e.shiftKey && !e.ctrlKey )
						toolbar.focusNext();
					e.preventDefault();
					break;
				default:
					break;
			}
		});
		var seprater0=new dijit.ToolbarSeparator({},"seprater0");
		toolbar.addChild(seprater0);

		// TODO should set default font to header/footer
		var fontOptions = [];
		
		// Get language specific font list 
		var por_font_l = concord.editor.PopularFonts.getLangSpecFont();		
		var names = por_font_l.split( ';' );
		// Create style objects for all fonts.
		for ( var i = 0 ; i < names.length ; i++ )
		{
			var option = {};
			var parts = names[ i ].split( '/' );
			option.label = option.value = parts[0];
			if(i == 0)
				option.selected = true;
			
			fontOptions.push(option);
		}
		
        var fontName = new dijit.form.Select({
             id: "fontnameSelect",
             title:this.nls.FontName,
             name: "fontname",
             options: fontOptions,
             style:"width:150px;margin-right:10px;padding-left:2px;",
             onChange: function(val) {
                 concord.widgets.headerfooter.headerfooterUtil.FontName(val);
             }
         });
        toolbar.addChild(fontName);
	    var fontSize = new dijit.form.Select({
	          id: "fontsizeSelect",
	          name: "fontsize",
	          title:this.nls.FontSize,
	          options: [{
              	label: '8',value:'1'
              },
              {
              	label: '10',value:'2',selected: true
              },
              {
              	label: '12',value:'3'
              },
              {
              	label: '14',value:'4'
              },
              {
              	label: '18',value:'5'
              },
              {
              	label: '24',value:'6'
              },
              {
              	label: '36',value:'7'
              }],
              selected:'10',
	          style:"width:50px;padding-left:2px;",
	          onChange: function(val) {
	               concord.widgets.headerfooter.headerfooterUtil.FontSize(val);
	          }
	      });
	    toolbar.addChild(fontSize);
	    var bbutton = new dijit.form.Button({
	    	id:"bbutton",
	    	label: this.nls.Bold,
            showLabel: false,
            iconClass: "dijitEditorIcon dijitEditorIconBold",
            onClick: function() {
                concord.widgets.headerfooter.headerfooterUtil.Bold();
            }
        });
	    dojo.addClass(bbutton.domNode,"lotusDijitButtonImg");
        toolbar.addChild(bbutton);
        var ibutton = new dijit.form.Button({
        	id:"ibutton",
        	label: this.nls.Italic,
            showLabel: false,
            iconClass: "dijitEditorIcon dijitEditorIconItalic",
            onClick: function() {
                concord.widgets.headerfooter.headerfooterUtil.Italic();
            }
        });
        dojo.addClass(ibutton.domNode,"lotusDijitButtonImg");
        toolbar.addChild(ibutton);
        var ubutton = new dijit.form.Button({
        	id:"ubutton",
        	label: this.nls.Underline,
            showLabel: false,
            iconClass: "dijitEditorIcon dijitEditorIconUnderline",
            onClick: function() {
                concord.widgets.headerfooter.headerfooterUtil.Underline();
            }
        });
        dojo.addClass(ubutton.domNode,"lotusDijitButtonImg");
        toolbar.addChild(ubutton);
        
	    var myPalette = new dijit.ColorPalette({
	    	id:"colorCheck",
	    	palette: "7x10",
            style: "display: none;",
            onChange: function(val) {
                concord.widgets.headerfooter.headerfooterUtil.FontColor(val);
            }
        });
		dojo.addClass( myPalette.domNode, 'headerfooterColorPallette');
			
	    var fontcolor = new dijit.form.DropDownButton({
            iconClass: "dijitEditorIcon dijitEditorIconForeColor",
            name: "fontcolor",
            label: this.nls.FontColor,
            showLabel: false,
            dropDown: myPalette,
            id: "fontcolor"
        });
	    toolbar.addChild(fontcolor);
	    var seprater0=new dijit.ToolbarSeparator({},"seprater0");
		toolbar.addChild(seprater0);

	if(BidiUtils.isBidiOn()){
		dojo.requireLocalization("concord.widgets","toolbar");
		var nls = dojo.i18n.getLocalization("concord.widgets", "toolbar");
		var ltrButton = new dijit.form.Button({
	             label: nls.ltrDirectionTip,
	             showLabel: false,
	             id:"ltrButton",
	             iconClass: "dijitEditorIcon cke_button_bidiltr",
	             onClick: function() {
	                 concord.widgets.headerfooter.headerfooterUtil.setDirection('ltr');
	             }
	         });
		dojo.addClass(ltrButton.domNode,"lotusDijitButtonImg");
		toolbar.addChild(ltrButton);

		var rtlButton = new dijit.form.Button({
	             label:  nls.rtlDirectionTip,
	             showLabel: false,
	             id:"rtlButton",
	             iconClass: "dijitEditorIcon cke_button_bidirtl",
	             onClick: function() {
	                 concord.widgets.headerfooter.headerfooterUtil.setDirection('rtl');
	             }
	         });
		dojo.addClass(rtlButton.domNode,"lotusDijitButtonImg");
		toolbar.addChild(rtlButton);
                 	
		var seprater0=new dijit.ToolbarSeparator({},"seprater0");
		toolbar.addChild(seprater0);
	}		
		 var lbutton = new dijit.form.Button({
             label: this.nls.Left,
             showLabel: false,
             id:"lbutton",
             iconClass: "dijitEditorIcon dijitEditorIconJustifyLeft",
             onClick: function() {
                 concord.widgets.headerfooter.headerfooterUtil.AlignLeft();
             }
         });
		 dojo.addClass(lbutton.domNode,"lotusDijitButtonImg");
         toolbar.addChild(lbutton);
         
         var cbutton = new dijit.form.Button({
             label: this.nls.Center,
             showLabel: false,
             id:"cbutton",
             iconClass: "dijitEditorIcon dijitEditorIconJustifyCenter",
             onClick: function() {
                 concord.widgets.headerfooter.headerfooterUtil.AlignCenter();
             }
         });
         dojo.addClass(cbutton.domNode,"lotusDijitButtonImg");
         toolbar.addChild(cbutton);
         
         var rbutton = new dijit.form.Button({
             label: this.nls.Right,
             id:"rbutton",
             showLabel: false,
             iconClass: "dijitEditorIcon dijitEditorIconJustifyRight",
             onClick: function() {
                 concord.widgets.headerfooter.headerfooterUtil.AlignRight();
             }
         });
         dojo.addClass(rbutton.domNode,"lotusDijitButtonImg");
         toolbar.addChild(rbutton);
         
		var seprater1=new dijit.ToolbarSeparator({},"seprater1");
		toolbar.addChild(seprater1);
	    
		var image = new dijit.form.Button({
            id:"image",
            label: this.nls.Image,
            showLabel: false,
            iconClass: "dijitEditorIcon dijitEditorIconInsertImage",
            onClick: function() {
                concord.widgets.headerfooter.headerfooterUtil.InsertImage();
            }
        });
		dojo.addClass(image.domNode,"lotusDijitButtonImg");
		toolbar.addChild(image);
		
		 var menu = new dijit.Menu({
             id:"fieldmenu",
             style: "display: none;"
         });
         dojo.addClass(menu.domNode,"lotusActionMenu");
         var menuItem1 = new dijit.MenuItem({
             label: this.nls.PageNumber,
             id:"pagenumber",
             onClick: function() {
                 concord.widgets.headerfooter.headerfooterUtil.InsertPageNumber();
             }
         });
         menu.addChild(menuItem1);

         var menuItem2 = new dijit.MenuItem({
             label: this.nls.Time,
             id:"time",
             onClick: function() {
                 concord.widgets.headerfooter.headerfooterUtil.InsertTime();
             }
         });
         menu.addChild(menuItem2);
         
         var menuItem3 = new dijit.MenuItem({
             label: this.nls.Date,
             id:"date",
             onClick: function() {
                 concord.widgets.headerfooter.headerfooterUtil.InsertDate();
             }
         });
         menu.addChild(menuItem3);
         
         var dragbutton = new dijit.form.DropDownButton({
             label: this.nls.Field,
             name: "Field",
             style:"border:1px solid grey;padding:1px;",
             dropDown: menu,
             id: "progButton"
         });
         toolbar.addChild(dragbutton);
		
         var rButton = new dijit.form.Button({
             id:"rButton",
             label: this.nls.Remove,
             style:"border:1px solid grey;padding:1px;",
             onClick: function() {
                 pe.scene.headerfooter.remove();
                 pe.scene.getEditor().focus();
             }
         });
         toolbar.addChild(rButton);
         var dButton = new dijit.form.Button({
             label: this.nls.Done,
             id:"dButton",
             style:"border:1px solid grey;padding:1px;",
             onClick: function() {
                 pe.scene.headerfooter.quitEdit();
                 pe.scene.getEditor().focus();
         	}
         });
        toolbar.addChild(dButton);
		toolbarCon.appendChild(toolbar.domNode);
		
		//for webkit first child focus issue
		var firstFocusItem = dojo.byId('fontnameSelect');
		firstFocusItem && dojo.style(firstFocusItem,{"outline":"none"});	
	},
	_showToolbar:function()
	{
		var toolbar=dojo.byId("toolbarCon");
		dojo.style(toolbar,{
			"width":pe.scene.headerfooter.getHFWidth()+"px",
			"left":pe.scene.headerfooter.getMarginLeft()+"px"
		});
		//TODO reset toolbar.
//		var range=pe.scene.currentRange;
//		pe.scene.currentRange=null;
//		var fontsize=dijit.byId("fontsizeSelect");
//		fontsize.reset();
//		var fontname=dijit.byId("fontnameSelect");
//		fontname.reset();
//		pe.scene.currentRange=range;
		var fontName = dijit.byId('fontnameSelect');
		fontName.dropDown.onExecute = function() {
			setTimeout(function() {
				var val = fontName.attr('value');
				// on change call back will not be invoked here
				val == fontName.get('value') && concord.widgets.headerfooter.headerfooterUtil.FontName(val);
		    }, 0);
		};
		var fontSize = dijit.byId("fontsizeSelect");
		fontSize.dropDown.onExecute = function() {
			setTimeout(function() {
				var val = fontSize.attr('value');
				// on change call back will not be invoked here
				val == fontSize.get('value') && concord.widgets.headerfooter.headerfooterUtil.FontSize(val);
		    }, 0);
		};
	},
	_setLocation:function()
	{
		var toolbar=dojo.byId("toolbarCon");
		if(pe.scene.headerfooter.currentArea=="header")
		{
			dojo.style(toolbar,{
				"display":"",
				"bottom":"",
				"top":(pe.scene.headerfooter.getHeaderMarginTop()+65)+"px"
			});
		}
		else if(pe.scene.headerfooter.currentArea=="footer")
		{
			var h = concord.widgets.headerfooter.headerfooterUtil.getAbsDocBottom();
			dojo.style(toolbar,"display","");
			var height = toolbar.offsetHeight;
			dojo.style(toolbar,{
				"bottom":"",
				"top":(h-67-height)+"px"
			});
		}	
	},
	_hideToolbar:function()
	{
		var toolbar=dojo.byId("toolbarCon");
		dojo.style(toolbar,{"display":"none"});
		this._hideBackground();
	},
	_showBackground:function()
	{
		var back=dojo.byId("back");
		dojo.style(back,{
			"display":""
		});
		var back1=dojo.byId("back1");
		back1 && dojo.style(back1,{
			"display":""
		});
		this.updateLocation();
	},
	_hideBackground:function()
	{
		var back=dojo.byId("back");
		dojo.style(back,{
			"display":"none"
		});
		var back1=dojo.byId("back1");
		back1 && dojo.style(back1,{
			"display":"none"
		});
	}
});


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

dojo.provide("pres.widget.common.LinkPanel");
dojo.require("dijit.form.ComboBox");
dojo.require("pres.widget.common.FilteringSelect");
dojo.require("dijit.form.Select");
dojo.require("dojox.validate.web");
dojo.requireLocalization("concord.widgets", "slideEditor");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("pres", "pres");

dojo.declare("pres.widget.common.LinkPanel", [dijit._Widget, dijit._Templated], {

	widgetsInTemplate: true,
	templateString: dojo.cache("pres", "templates/LinkPanel.html"),
	store: new dojo.store.Memory(),
	enableRemove: false,
	needText: false,

	link: "",
	subject: "",
	type: "website",

	postMixInProperties: function()
	{
		this.inherited(arguments);
		this.strs = dojo.i18n.getLocalization("pres", "pres");
	},

	//link: url/mail/pageinfo
	//enableRemove: modify a existing hyperlink
	//needText : show or hide text input box
	initData: function(hlink, enableRemove, needText)
	{
		function _ParseLinkString(hlinkStr)
		{
			var info = {type:"website",subject:null,link:hlinkStr};

			if(hlinkStr.indexOf(EditorUtil.STR_XLINK) == 0)
			{
				//xlink page action 
				info.type = "slide";
				var str = hlinkStr.replace( EditorUtil.STR_XLINK,"");
				if(str.indexOf("ppaction://hlinkshowjump?jump=") == 0)
				{
					info.link = str.replace("ppaction://hlinkshowjump?jump=","");
				}
				else if(str.indexOf("slideaction://?") == 0)
				{
					info.link = str.replace("slideaction://?","");
				}
				else
				{
					info.link = str;
					info.type = "unknown";
				}	
				
				if(info.link == "")
					info.type = "unknown";
			}
			else 
			{  
				var mailInfo = EditorUtil.extractEmailLinkInfo(hlinkStr);
				if(mailInfo)
				{
					//mail
					info.type = "email";
					//href="mailto:qwe@cn.com?subject=aavv"
					info.link = mailInfo.address;
					info.subject = mailInfo.subject.replace(/%20/g," ");
				}
				else
				{ //webv site
					info.link = decodeURI(info.link);
				}	

			}

			return info;
		}
		
 		var linkInfo = _ParseLinkString(hlink);
 		
		this.type = linkInfo.type || "website"; //type:"website"/"email"/"slide"
		this.link = linkInfo.link || "";
		this.subject = linkInfo.subject || ""; //subject: mail-subject, not use for other case
		
		
		//when user create a new link, the text is the visible text (if empty, it will be the hyperlink string)
		this.needText = needText ? true : false;
		
		this.enableRemove = enableRemove || false;

		this.removeButton.disabled = !this.enableRemove;

		this.linkInput.set('value', "");
		this.slideInput.set('value', "");
		
		this.select.set('value', this.type);
		
		this.errorBox.style.display = "none";
		this.linkBox.style.display = "";
		
		this.doneButton.innerHTML = this.strs.link_done;
		
		if (this.type == "unknown")
		{
			this.doneButton.disabled = false;
			this.gotoButton.disabled = true;
			this.removeButton.disabled = false;
			this.linkBox.style.display = "none";
			this.subjectBox.style.display = "none";
			this.errorBox.style.display = "";
			
			var STRINGS = dojo.i18n.getLocalization("concord.widgets", "slideEditor");
			this.doneButton.innerHTML = STRINGS.ok;
			return;
		}
		
		if (this.type == 'slide')
		{
			if (this.link == "previousslide" || this.link == "nextslide" || this.link == "firstslide" || this.link == "lastslide")  
				this.slideInput.set('value', this.link);
			else
			{
				var setted = false;
				var slideId = this.link;
				if (slideId)
				{
					for ( var i = 0; i < pe.scene.doc.slides.length; i++)
					{
						var slide = pe.scene.doc.slides[i];
						if (slideId == slide.id)
						{
							var inputId = "slide_" + i;
							this.slideInput.set('value', inputId);
							setted = true;
							break;
						}
					}
				}
				if (!setted)
				{
					this.slideInput.attr("placeholder", this.strs.link_slide_placeholder_deleted);
				}
			}
		}
		else
			this.linkInput.set('value', this.link);

		this.textInput.set("value", "");
		this.subjectInput.set("value", this.subject);
		if (BidiUtils.isBidiOn()){
			this.linkInput.focusNode.dir = this.textInput.focusNode.dir = this.subjectInput.focusNode.dir = 'ltr';
		}
		this.textBox.style.display = this.needText ? "" : "none";

		this._updateSlideData();
		
		this.onSelectChange(this.type, true);
		this.onLinkChange();
		var me = this;
		if (this.selectOnChange)
			dojo.disconnect(this.selectOnChange);
		setTimeout(function(){
			me.selectOnChange = dojo.connect(me.select, "onChange", me, me.onSelectChange);
		}, 10);
	},

	isLinkValid: function()
	{
		var value = this.linkInput.getValue();
		if(this.type == "website" && !value)
			return false;
		return (this.type == "website" && true)
				|| (this.type == "email" && dojox.validate.isEmailAddress(value) || (this.type == "slide" && this.slideInput.isValid() && dojo.indexOf(this.slideDataNames, this.slideInput.focusNode.value) >=0 ));
	},

	_getFocusItems: function()
	{
		var elems = dijit._getTabNavigable(this.domNode);
		this._firstFocusItem = elems.lowest || elems.first;
		this._lastFocusItem = elems.last || elems.highest || this._firstFocusItem;
	},

	focus: function()
	{
		if (this.type == "slide")
			this.slideInput.focus();
		else
			this.linkInput.focus();
	},

	_onClick: function(e)
	{
		var target = e.target;
		if (target && (target == this.domNode || target == this.buttons))
			this.closeDropDowns();
	},

	_onKey: function(/* Event */evt)
	{
		if (evt.keyCode == dojo.keys.TAB)
		{
			this._getFocusItems(this.domNode);
			var node = evt.target;
			if (this._firstFocusItem == this._lastFocusItem)
			{
				// don't move focus anywhere, but don't allow browser to move focus off of dialog either
				dojo.stopEvent(evt);
			}
			else if (node == this._firstFocusItem && evt.shiftKey)
			{
				// if we are shift-tabbing from first focusable item in dialog, send focus to last item
				dijit.focus(this._lastFocusItem);
				dojo.stopEvent(evt);
			}
			else if (node == this._lastFocusItem && !evt.shiftKey)
			{
				// if we are tabbing from last focusable item in dialog, send focus to first item
				dijit.focus(this._firstFocusItem);
				dojo.stopEvent(evt);
			}
		}
		else if (evt.keyCode == dojo.keys.ESCAPE)
		{
			this.close();
			dojo.stopEvent(evt);
		}
	},

	onBlur: function()
	{
		// just incase we switch tab/window, it will onblur..
		if (this._focusManager._justMouseDowned)
		{
			if (this.domNode && this.domNode.style.display != "none")
				this.close();
		}
	},
	
	closeDropDowns: function()
	{
		if(this.slideInput && this.slideInput.dropDown)
		{
			this.slideInput.closeDropDown();
		}
		if(this.select && this.select.dropDown)
		{
			this.select.closeDropDown();
		}
	},

	close: function()
	{
		this.onClose();
	},
	
	onClose: function()
	{
		if (this.selectOnChange)
			dojo.disconnect(this.selectOnChange);
	},
	
	_updateSlideData : function()
	{
		var slideData = [];
		slideData.push({
			id: "nextslide",
			name: this.strs.link_slide_next
		});
		slideData.push({
			id: "previousslide",
			name: this.strs.link_slide_prev
		});
		slideData.push({
			id: "firstslide",
			name: this.strs.link_slide_first
		});
		slideData.push({
			id: "lastslide",
			name: this.strs.link_slide_last
		});
		
		var slidesCount = pe.scene.doc ? pe.scene.doc.slides.length : 0;
		for ( var i = 0; i < slidesCount; i++)
		{
			var name = this.formatSlideNum(i+1);
			// TODO, use slide id to reference.
			slideData.push({
				id: "slide_" + i,
				name: name
			});
		}

		this.store.setData(slideData);
		
		this.slideDataNames = [];
		dojo.forEach(slideData, dojo.hitch(this, function(sd){
			this.slideDataNames.push(sd.name);
		}));
		this.slideInput.set('store', this.store);
	},

	formatSlideNum: function(num)
	{
		return dojo.string.substitute(this.strs.link_slide_number, [num + ""]);
	},

	postCreate: function()
	{
		this.inherited(arguments);
		if (BidiUtils.isGuiRtl())
			dojo.addClass(this.domNode, 'rtl');

		var me = this;
		this.slideDataNames = [];
		this.connect(this.domNode, "onkeydown", "_onKey");
		this.connect(this.domNode, "onclick", "_onClick");
		this.linkInput.intermediateChanges = true;
		this.slideInput.intermediateChanges = true;
		//this.slideInput.queryExpr = "*${0}*";
		this.slideInput.displayMessage = function()
		{
		};
		var _s = this.slideInput._startSearch;
		this.slideInput._startSearch = function()
		{
			_s.apply(this, arguments);
			dojo.addClass(this.dropDown.domNode, "linkSlideMenu");
		};

		this.slideInput._startSearchFromInput = function()
		{
			var v = this.focusNode.value;
			if (!v && dojo.isIE && this.focusNode.placeholder)
				// IE placeholder seems trigger onchange event.
				return;
			if (v.length > 0 && dojo.trim(v) == v)
			{
				 var number = parseFloat(v);
				 if (!isNaN(number) && isFinite(number) && number > 0 && number % 1 == 0)
				 {
				 	// a hack to get short cut to slide number.
				 	var name = me.formatSlideNum(number);
				 	this._startSearch(name);
				 	return;
				 }
			}
			this._startSearch(v);
		};
		this.slideInput.highlightMatch = "none";
		this.removeButton.disabled = !this.enableRemove;
		this.doneButton.disabled = true;
		this.gotoButton.disabled = true;

		var me = this;
		var events = ["onfocus", "onclick"];
		dojo.forEach(events, function(event)
		{
			me.connect(me.slideInput.focusNode, event, function(e)
			{
				setTimeout(function()
				{
					if (me.type == "slide" && !me.slideInput.focusNode.value)
					{
						me.slideInput.attr("placeholder", dojo.isIE ? "" : me.strs.link_slide_placeholder);
						me.slideInput._startSearchFromInput();
					}
				}, 0);
			});
		});

		this.slideInput.attr("placeholder", this.strs.link_slide_placeholder);

		var s = new dijit.form.Select({
			baseClass: "dijitSelect dijitValidationTextBox linkSelect",
			ownerDocument: this.ownerDocument,
			_focusManager: this._focusManager,
			dir: (BidiUtils.isGuiRtl() ? 'rtl' : ''),
			onBlur: function()
			{
				this._isLoaded = false;
			},
			options: [{
				label: this.strs.link_website,
				value: "website",
				selected: true
			}, {
				label: this.strs.link_email,
				value: "email"
			},
			{
				label: this.strs.link_slide,
				value: "slide"
			}
			],
			_fillContent: function(){
				this.dropDown = new dijit.form._SelectMenu({ id: this.id + "_menu", parentWidget: this, ownerDocument: this.ownerDocument,
					_focusManager: this._focusManager });
				dojo.addClass(this.dropDown.domNode, this.baseClass.replace(/\s+|$/g, "Menu "));
			},
			_addOptionItem: function(/*_FormSelectWidget.__SelectOption*/ option){
				if(this.dropDown){
					if (!option.selected)
						this.dropDown.addChild(this._getMenuItemForOption(option));
				}
			}
		});
		
		this.select = s;
		this.selectWrapper.appendChild(s.domNode);
		
		this.connect(this.linkInput, "onChange", this.onLinkChange);
		this.connect(this.slideInput, "_handleOnChange", this.onLinkChange);
		
		this.select.startup();
		this.onSelectChange(this.type, true);
	},

	onSubmit: function(e)
	{
		e && dojo.stopEvent(e);
		var valid = this.onLinkChange();
		if (valid)
			this.doneLink();
	},

	onLinkChange: function()
	{
		var valid = this.isLinkValid();
		this.doneButton.disabled = !valid;
		this.gotoButton.disabled = !valid;
		return valid;
	},

	onSelectChange: function(v, noFocus)
	{
		this.type = v;
		this.subjectBox.style.display = (v == "email" ? "" : "none");
		if (v == "slide")
		{
			this.slideInput.domNode.style.display = "";
			if (!noFocus)
			{
				this.slideInput.focus();
			}
			this.linkInput.domNode.style.display = "none";
			this.gotoButton.style.display = "none";
		}
		else
		{
			this.gotoButton.style.display = "";
			this.gotoButton.innerHTML = v == "email" ? this.strs.link_mailto : this.strs.link_goto;
			this.linkInput.domNode.style.display = "";
			if (!noFocus)
			{
				this.linkInput.focus();
			}
			this.slideInput.domNode.style.display = "none";
		}

		this.linkInput.attr("placeholder", v == "email" ? "username@address.com" : "www.example.com");

		var accStr = v == "email" ? this.strs.link_acc_mail_input : this.strs.link_acc_input;
		dojo.attr(this.linkInput.focusNode, "aria-label",  accStr );
		
		this.onLinkChange();
	},

	gotoLink: function(e)
	{
		if (e)
			dojo.stopEvent(e);
		if (this.type == "website")
		{
			EditorUtil.openURLLink(this.linkInput.getValue());
		}
		else if (this.type == "email")
		{
			var hlinkString = "mailto:" + this.linkInput.getValue() + "?subject=" + (this.subjectInput.getValue() || "");
			EditorUtil.openURLLink(hlinkString);
		}
			
	},
	removeLink: function(e)
	{
		if (e)
			dojo.stopEvent(e);
		this.onRemove();
	},
	doneLink: function()
	{
		var data = {
			type: this.type,
			link: this.linkInput.getValue(),
			subject: this.subjectInput.getValue() || "",
			text: this.textInput.getValue() || ""
		};
		if (this.type == "slide")
		{
			data.link = "";
			var v = this.slideInput.getValue();
			
			if (v.indexOf("slide_") == 0)//slide Id
			{
				var count = parseInt(v.substring(6));
				if (pe.scene.doc.slides.length > count)
				{
					data.link = pe.scene.doc.slides[count].id;
				}
			}
			else
				data.link = v;
			
			if(this.needText && data.text == "")
			{
				data.text = this.slideInput.getDisplayedValue();
			}
		}
		this.onDone(data);
	},
	onRemove: function()
	{
	},
	onDone: function(data)
	{
	}

});
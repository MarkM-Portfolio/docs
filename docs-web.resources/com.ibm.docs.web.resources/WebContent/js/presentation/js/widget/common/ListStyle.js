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
dojo.require("concord.util.BidiUtils");
dojo.provide("pres.widget.common.ListStyle");

dojo.declare("pres.widget.common.ListStyle", [dijit._Widget, dijit._Templated], {
	templateString: '',
	cells: null,
	focusNode: null,
	containerNode: null,
	defaultTimeout: 500,
	timeoutChangeRate: 0.90,
	tabIndex: "0",

	step: 7,

	japaneseCounters: {
		j1: [
		// 1 - 5
		'イ' /* \u30A4 */, 'ロ' /* \u30ED */, 'ハ' /* \u30CF */, 'ニ' /* \u30CB */, 'ホ' /* \u30DB */,
		// 6 - 10
		'ヘ' /* \u30D8 */, 'ト' /* \u30C8 */, 'チ' /* \u30C1 */, 'リ' /* \u30EA */, 'ヌ' /* \u30CC */,
		// 11 - 15
		'ル' /* \u30EB */, 'ヲ' /* \u30F2 */, 'ワ' /* \u30EF */, 'カ' /* \u30AB */, 'ヨ' /* \u30E8 */,
		// 16 - 20
		'タ' /* \u30BF */, 'レ' /* \u30EC */, 'ソ' /* \u30BD */, 'ツ' /* \u30C4 */, 'ネ' /* \u30CD */,
		// 21 - 25
		'ナ' /* \u30CA */, 'ラ' /* \u30E9 */, 'ム' /* \u30E0 */, 'ウ' /* \u30A6 */, 'ヰ' /* \u30F0 */,
		// 26 - 30
		'ノ' /* \u30CE */, 'オ' /* \u30AA */, 'ク' /* \u30AF */, 'ヤ' /* \u30E4 */, 'マ' /* \u30DE */,
		// 31 - 35
		'ケ' /* \u30B1 */, 'フ' /* \u30D5 */, 'コ' /* \u30B3 */, 'エ' /* \u30A8 */, 'テ' /* \u30C6 */,
		// 36 - 40
		'ア' /* \u30A2 */, 'サ' /* \u30B5 */, 'キ' /* \u30AD */, 'ユ' /* \u30E6 */, 'メ' /* \u30E1 */,
		// 41 - 45
		'ミ' /* \u30DF */, 'シ' /* \u30B7 */, 'ヱ' /* \u30F1 */, 'ヒ' /* \u30D2 */, 'モ' /* \u30E2 */,
		// 46 - 48
		'セ' /* \u30BB */, 'ス' /* \u30B9 */, 'ン' /* \u30F3 */
		],
		j2: [
		// 1 - 5
		'ア' /* \u30A2 */, 'イ' /* \u30A4 */, 'ウ' /* \u30A6 */, 'エ' /* \u30A8 */, 'オ' /* \u30AA */,
		// 6 - 10
		'カ' /* \u30AB */, 'キ' /* \u30AD */, 'ク' /* \u30AF */, 'ケ' /* \u30B1 */, 'コ' /* \u30B3 */,
		// 11 - 15
		'サ' /* \u30B5 */, 'シ' /* \u30B7 */, 'ス' /* \u30B9 */, 'セ' /* \u30BB */, 'ソ' /* \u30BD */,
		// 16 - 20
		'タ' /* \u30BF */, 'チ' /* \u30C1 */, 'ツ' /* \u30C4 */, 'テ' /* \u30C6 */, 'ト' /* \u30C8 */,
		// 21 - 25
		'ナ' /* \u30CA */, 'ニ' /* \u30CB */, 'ヌ' /* \u30CC */, 'ネ' /* \u30CD */, 'ノ' /* \u30CE */,
		// 26 - 30
		'ハ' /* \u30CF */, 'ヒ' /* \u30D2 */, 'フ' /* \u30D5 */, 'ヘ' /* \u30D8 */, 'ホ' /* \u30DB */,
		// 31 - 35
		'マ' /* \u30DE */, 'ミ' /* \u30DF */, 'ム' /* \u30E0 */, 'メ' /* \u30E1 */, 'モ' /* \u30E2 */,
		// 36 - 40
		'ヤ' /* \u30E4 */, 'ユ' /* \u30E6 */, 'ヨ' /* \u30E8 */, 'ラ' /* \u30E9 */, 'リ' /* \u30EA */,
		// 41 - 45
		'ル' /* \u30EB */, 'レ' /* \u30EC */, 'ロ' /* \u30ED */, 'ワ' /* \u30EF */, 'ヲ' /* \u30F2 */,
		// 46
		'ン' /* \u30F3 */
		]
	},

	getNationalCounter: function(style)
	{
		if (!style)
			return null;

		if (style.indexOf('arabic') > 0) {
			return ['\u0661', '\u0662'];
		} else {
			var cntVar = style.replace(/(I-)?lst-/, '').replace(/\s/g, '').toLowerCase();
			if (!cntVar)
				return null;
			return this.japaneseCounters[cntVar];
		}
	},

	generatePseudoContent: function(className, numberedList, numberOfItems)
	{
		var listElement = numberedList ? 'ol' : 'ul';
		var numItems = numberOfItems ? numberOfItems : (numberedList ? 2 : 1); // tweak default number of items to show
		var ret = '<' + listElement + (className ? ' style=\'counter-reset: ' + className + ';\' class=\'' + className + '\'>' : '>');
		// T10402 - add support for Japanese numbering (J1 and J2)
		var cntVal = this.getNationalCounter(className);
		for ( var i = 0; i < numItems; i++)
		{
			ret += '<li' + (className ? ' class=\'' + className + '\'' : '') + (cntVal ? ' values=\'' + cntVal[i] + '\'' : '') + '>';
			if (numberedList)
				ret += '<span style="text-decoration:line-through;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>';
			else
				ret += '&nbsp;';
			ret += '</li>';
		}
		ret += '</' + listElement + '>';
		return ret;
	},

	onOpen: function()
	{
		if(BidiUtils.isBidiOn()) {
			if(dijit.byId('toolbar_direction').iconClass.indexOf('textDirRtlIcon')!=-1)
				dojo.addClass(this.domNode, 'rtl');
			else
				dojo.removeClass(this.domNode, 'rtl');
		}
		this.inherited(arguments);
	},

	postCreate: function()
	{
		this.inherited(arguments);
		if (!this.containerNode)
			return;
		this.cells = dojo.query("td", this.containerNode).onmouseover(dojo.hitch(this, this.onMouseOver)).onmouseout(
			dojo.hitch(this, this.onMouseOut)).onmousedown(dojo.hitch(this, this.onClick));

		var keyIncrementMap = {
			UP_ARROW: 0 - this.step,
			// The down key the index is increase by the x dimension.
			DOWN_ARROW: this.step,
			// Right and left move the index by 1.
			RIGHT_ARROW: this.isLeftToRight() ? 1 : -1,
			LEFT_ARROW: this.isLeftToRight() ? -1 : 1
		};

		this.connect(this.containerNode, "onkeypress", function(evt)
		{
			var keys = dojo.keys;
			if (evt.charCode == keys.ESCAPE || evt.keyCode == keys.ESCAPE || evt.charCode == keys.TAB || evt.keyCode == keys.TAB)
				return;

			var navKey = false;
			for ( var key in keyIncrementMap)
			{
				var charOrCode = keys[key];
				if (charOrCode == evt.charCode || charOrCode == evt.keyCode)
				{
					var increment = keyIncrementMap[key];
					this._navigateByKey(increment);
					navKey = true;
					break;
				}
			}
			if (!navKey)
			{
				if (evt.charCode == keys.SPACE || evt.keyCode == keys.SPACE || evt.charCode == keys.ENTER || evt.keyCode == keys.ENTER)
				{
					// press space, enter
					this.changeList();
				}
			}

			dojo.stopEvent(evt);
		});
		
		// this._setCurrent(this.cells[0]);
	},
	_navigateByKey: function(increment)
	{
		if (!increment)
			return;
		var focusIndex = this.focusNode ? dojo.indexOf(this.cells, this.focusNode) : 0;
		var newIndex = focusIndex + increment;
		if (newIndex < 0 || newIndex >= this.cells.length)
			return;
		this._setCurrent(this.cells[newIndex]);
		dijit.focus(this.focusNode);
	},
	
	_setCurrent: function(node)
	{
		this.focusNode && this.changeStyle(this.focusNode, true);
		this.focusNode = node;
		if (node)
			this.changeStyle(this.focusNode, false);
		if (node)
			dojo.attr(node, "tabIndex", this.tabIndex);
	},
	
	focus: function()
	{
		if (this.focusNode)
		{	
			this.focusNode.focus();
			this._setCurrent(this.focusNode);
		}
	},
	
	onMouseOver: function(evt)
	{
		this.changeStyle(evt.target, false);
	},
	onMouseOut: function(evt)
	{
		this.changeStyle(evt.target, true);
	},

	onChange: function(className)
	{
		dojo.publish("/command/exec", [this.cmd, this.value]);
		this._onBlur();
	},
	
	onClose: function()
	{
		this.inherited(arguments);
		this._setCurrent(null);
	},

	_onChange: function(targetNode)
	{
		this.value = "";

		var li = targetNode.children[0];
		while (li && li.tagName.toUpperCase() != "LI")
			li = li.children[0];

		if (li)
		{
			var className = dojo.attr(li, "className");
			this.value = className;
		}
		else
		{
			var span = dojo.query("span", targetNode)[0];
			if (span)
			{
				var clazz = span.className;
				if (clazz != "none")
					this.value = clazz;
			}
		}
		this.onChange();
	},
	
	_setValueAttr: function()
	{
		this.setValue.apply(this, arguments);
	},
	
	_getValueAttr: function()
	{
		return this.getValue();
	},

	setValue: function(values)
	{
		var found = false;
		this._setCurrent(null);
		if (values.length == 1 && values[0] == "none")
			this._setCurrent(this.cells[0]);
		else
		{
			outer: for ( var i = 0; i < values.length; i++)
			{
				var value = values[i];
				if (value)
				{
					for ( var j = 0; j < this.cells.length; j++)
					{
						var cell = this.cells[j];
						var li = dojo.query("li", cell)[0];
						if (!li)
							li = dojo.query("span", cell)[0];
						var className = "";
						if (li)
							className = dojo.attr(li, "className");
						if (className.indexOf(value) >= 0)
						{
							this._setCurrent(this.cells[j]);
							found = true;
							break outer;
						}
					}
				}
			}
		}
		// if(!found)
		// this._setCurrent(this.cells[0]);
	},

	getValue: function()
	{
		if (this.focusNode)
		{
			var li = dojo.query("li", this.focusNode)[0];
			if (!li)
				li = dojo.query("span", this.focusNode)[0];
			if (li)
			{
				if (li.className == "none")
					return null;
				return li.className;
			}
			return null;
		}
		return null;
	},

	changeList: function()
	{
		var targetNode = this.focusNode;
		this._onChange(targetNode);
	},

	onClick: function(evt)
	{
		var targetNode = this.getTargetNode(evt.target);
		dojo.stopEvent(evt);
		this._setCurrent(targetNode);
		this._onChange(targetNode);
	},

	changeStyle: function(node, isRemove)
	{
		var target = this.getTargetNode(node), helperLeft = this.getHelperNodeLeft(target), helperTop = this.getHelperNodeTop(target);
		if (isRemove)
		{
			dojo.removeClass(target, 'ItemHover');
			if (helperLeft)
				dojo.removeClass(helperLeft, 'ItemHoverHelperLeft');
			else
				dojo.removeClass(target, 'ItemHoverLeft');
			if (helperTop)
				dojo.removeClass(helperTop, 'ItemHoverHelperTop');
			else
				dojo.removeClass(target, 'ItemHoverTop');
		}
		else
		{
			dojo.addClass(target, 'ItemHover');
			if (helperLeft)
				dojo.addClass(helperLeft, 'ItemHoverHelperLeft');
			else
				dojo.addClass(target, 'ItemHoverLeft');
			if (helperTop)
				dojo.addClass(helperTop, 'ItemHoverHelperTop');
			else
				dojo.addClass(target, 'ItemHoverTop');
		}
	},
	getTargetNode: function(n/* node the mouse over on */)
	{
		while (n && "TD" !== n.tagName.toUpperCase())
		{
			n = n && n.parentNode;
		}
		return n;
	},
	getHelperNodeLeft: function(target/* target td element */)
	{
		if (!target)
			return null;
		var p = target.parentNode;
		var index = dojo.indexOf(p.children, target);
		if (index > 0)
			return p.children[index - 1];
		return null;
	},
	getHelperNodeTop: function(target/* target td element */)
	{
		if (!target)
			return null;
		var p = target.parentNode;
		var pIndex = dojo.indexOf(p.parentNode.children, p);
		var index = dojo.indexOf(p.children, target);

		var pv = p;

		if (pIndex > 0)
		{
			pv = p.parentNode.children[pIndex - 1];
			return pv.children[index];
		}

		return null;
	}
});
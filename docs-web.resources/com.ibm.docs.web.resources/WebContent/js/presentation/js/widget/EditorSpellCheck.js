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

dojo.provide("pres.widget.EditorSpellCheck");

dojo.require("dijit.MenuBar");
dojo.require("dijit.PopupMenuBarItem");
dojo.require("dijit.MenuItem");
dojo.require("dijit.PopupMenuItem");
dojo.require("dijit.MenuSeparator");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("concord.spellcheck", "spellcheckUI");
dojo.requireLocalization("concord.widgets", "toolbar");

dojo.declare("pres.widget.EditorSpellCheck", null, {
	
	detachSpellCheckMenuItems: function(menu)
	{
		dojo.forEach(menu.getChildren(), function(c){
			if(c.forSpell)
			{
				menu.removeChild(c);
				c.destroyRecursive();
			}
		});
	},

	attachSpellCheckMenuItems: function(box, menu)
	{
		var misWord = box.getMisspellWord();
		if (!misWord)
			return;
		// #story 23377, move the suggestions to the top of the context menu
		var c = pres.constants;
		var nls = dojo.i18n.getLocalization("concord.spellcheck", "spellcheckUI");
		var toobarNls = dojo.i18n.getLocalization("concord.widgets", "toolbar");
		
		// remove ignore all,
		// make ignore to ignore all by default.
		
		var m = new dijit.MenuItem({
			label: nls.ignore,
			misWord: misWord,
			forSpell:true,
			cmd: c.CMD_SPELLCHECK_SKIP_ALL,
			onClick: function()
			{
				dojo.publish("/command/exec", [this.cmd, this.misWord]);
			},
			dir: BidiUtils.isGuiRtl() ? 'rtl' : ''
		});
		
		menu.addChild(new dijit.MenuSeparator({forSpell:true}), 0);
		menu.addChild(m, 0);

		var suggestions = box.getSpellSuggestions();
		if (!suggestions)
			return;

		menu.addChild(new dijit.MenuSeparator({forSpell:true}), 0);

		if (suggestions.length == 0)
		{
			var m = new dijit.MenuItem({
				label: nls.noSuggestion,
				forSpell:true,
				dir: BidiUtils.isGuiRtl() ? 'rtl' : ''
			});
			menu.addChild(m, 0);
		}
		else if (suggestions.length > 0)
		{
			for ( var i = suggestions.length - 1; i >= 0; i--)
			{
				var m = new dijit.MenuItem({
					misWord: misWord,
					label: suggestions[i],
					forSpell:true,
					cmd: c.CMD_SPELLCHECK_REPLACE,
					onClick: function()
					{
						dojo.publish("/command/exec", [this.cmd, this.label]);
					},
					dir: BidiUtils.isGuiRtl() ? 'rtl' : ''
				});
				menu.addChild(m, 0);
			}
			/*
			var menu2 = new dijit.Menu();
			var m = new dijit.PopupMenuItem({
				label: nls.correctall,
				popup: menu2,
				forSpell:true
			});

			menu.addChild(m, 0);

			for ( var i = suggestions.length - 1; i >= 0; i--)
			{
				var cm = new dijit.MenuItem({
					label: suggestions[i],
					misWord: misWord,
					forSpell:true,
					cmd: c.CMD_SPELLCHECK_REPLACE_ALL,
					onClick: function()
					{
						dojo.publish("/command/exec", [this.cmd, this.label]);
					}
				});

				menu2.addChild(cm, 0);
			}
			*/
		}
	}

});
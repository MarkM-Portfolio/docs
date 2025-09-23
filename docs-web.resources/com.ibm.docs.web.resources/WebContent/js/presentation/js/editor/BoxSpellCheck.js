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

dojo.provide("pres.editor.BoxSpellCheck");

dojo.declare("pres.editor.BoxSpellCheck", null, {

	// null or word like "Helle" for current selection
	getMisspellWord: function()
	{
		var span = this.editor.mContentModel.getCurEditingSpanModel();
		return span ? span.misspell : null;
	},

	// an array like "[Hello]" for current selection
	getSpellSuggestions: function()
	{
		var span = this.editor.mContentModel.getCurEditingSpanModel();
		return span ? span.spellSuggestions : null;
	},

	// replace Hello with sugg Hello, all indicates all or just current selection word
	replaceWithSuggestion: function(sugg, all)
	{
		if(this.editor.mContentModel.replaceWithSuggestion(sugg, all))
		{
			this.editor.updateView();
			this.notifyUpdate({sync:true});
		}
			
	},

	ignore: function(all)
	{
		var word = this.getMisspellWord();
		if (all && word && window.spellcheckerManager)
		{
			window.spellcheckerManager.addSkipWord(word);
			this.editor.doSpellCheck(true);
		}
	}

});
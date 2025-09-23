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

dojo.provide("concord.spellcheck.SpellCheckDlgHandler");
dojo.require("concord.spellcheck.scaytservice");

dojo.declare("concord.spellcheck.SpellCheckDlgHandler", null, {
	
	contents: null,
	misWords: [],
	beginIndex: [],
	index: 0,
	sepReg: null,
	
	constructor: function()
	{
		if (typeof window.spellcheckerManager == 'undefined')
		{
			console.warn("no spellcheckerManager found");
		}	
	},
	
	checkText: function()
	{		
		this.misWords = [];
		this.beginIndex = [];
		var strText = this.contents;
		if(strText && strText.length)
		{					
			var handler = this;			
			var scRequest = {
					spellChecker : handler
				};
																			
			var request = {						
//					context : scRequest,
					url:  spellcheckerManager.backendServiceURL +"/" + spellcheckerManager.lang,
					content: {
						text: strText,
						suggestions: 0,							
						format: "json"
					},
					handleAs: "json",
					sync: true,
					timeout: 10000, // execute error when timeout
					load : function (data){
						var items = data.items;
						var regMiss = null;
						var sRegMiss = "";
						if (items instanceof Array){							
							if (items.length){
								for (var i in items){
									var word = items[i].word;
									var type = items[i].type;
									var bIndex = items[i].beginIndex;
									
									var wArray = word.split(/\s+/); // the word returned from server contains space?? why? and any other separator?
																			
									if (dojo.isString(wArray)){
										if(wArray.lengh)
										{
											scRequest.spellChecker.misWords.push(wArray); 
											scRequest.spellChecker.beginIndex.push(bIndex);
										}
									}else if (dojo.isArray(wArray)){
										for(var k = 0; k<wArray.length; k++)
										{
											var aWord = wArray[k]; 
											if(aWord.length)
											{
												scRequest.spellChecker.misWords.push(aWord);
												scRequest.spellChecker.beginIndex.push(bIndex);
												bIndex += (aWord.length+1);
											}
										}	
									}																				
								}
							}
						}
					},

					error : function (err, ioargs) {												
						console.log("error happens when do spell check: "+ err);
						if (ioargs.xhr.status == 404){
							console.log("spell check service is unavailable.");
							spellcheckerManager.setServiceAvailable(false);
						}
					}
				};
				request.headers = {"Content-Type":"application/x-www-form-urlencoded;charset=utf-8"};
				dojo.xhrGet(request);			
		}	
	},
	
	isSeparator: function(pos)
	{
		if(pos < 0 || pos >= this.contents.length)
			return true;
		
		var ch = this.contents.substr(pos,1);
		
		if( window.spellcheckerManager.getSeperatorReg().test(ch) )					
			return true;
		
		return false;
	},
	
	setContents: function(contents)
	{
		this.contents = contents;
	},
	
	getContents: function()
	{
		return this.contents;
	},
		
	getMisWords: function()
	{
		return this.misWords;
	},
	
    getCurrentMisWord: function()
	{
		return this.getMisWord(this.index);
	},
	
	getNextMisWord: function()
	{
		this.index++;
		return this.getCurrentMisWord();
	},
	
	getMisWord: function(index)
	{
		if(index < 0 || index >= this.misWords.length )
			return null; 		
		return this.misWords[index];
	},	
		
	getSuggestions: function(misWord)
	{		
		try{
			if(spellcheckerManager)
				return spellcheckerManager.getSuggestions(misWord);
		}
		catch(e){
			console.warn("exception happens when get suggestions: "+e);
			return null;
		}	
		
		return null;
	},		
	
	getMisWordCount: function()
	{
		if(this.misWords)
			return this.misWords.length;
		else
			return 0;
	},
	
	ignoreMisWord: function()
	{
		throw new Error("not implemented");
	},
	
	correctMisWord: function(correctWord)
	{
		throw new Error("not implemented");
	},
	
	correctAllMisWord: function(correctWord)
	{
		throw new Error("not implemented");
	},
	
	commit: function()
	{
		throw new Error("not implemented");
	},
	
	cancel: function()
	{
		throw new Error("not implemented");
	}
});

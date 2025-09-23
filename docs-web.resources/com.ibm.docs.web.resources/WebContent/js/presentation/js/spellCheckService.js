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

dojo.provide("pres.spellCheckService");
dojo.require("concord.spellcheck.scaytservice");

pres.spellCheckService = {
	
	cache : {},
	cacheCount: 0,
	
	checkText: function(strText, suggestionCount, callback)
	{
		var checkedText = null;
		var checker = this;

		if (strText.length)
		{
			var cacheKey = spellcheckerManager.lang + "~@~____________CACHE_____________~@~" + strText;
			var cachedResult = pres.spellCheckService.cache[cacheKey];
			if (cachedResult)
			{
				var result = dojo.clone(cachedResult);
				var arr = [];
				dojo.forEach(result, function(item){
					if(!spellcheckerManager.isSkipWord(item.word))
						arr.push(item);
				});
				setTimeout(function(){
					callback(arr);
				});
			}
			else
			{
				strText = strText.replace(/ /g, "#"); // to avoid repeatedWords
				var request = {
					url: spellcheckerManager.backendServiceURL + "/" + spellcheckerManager.lang,
					content: {
						text: strText,
						suggestions: suggestionCount || 1,
						format: "json"
					},
					headers: {
						"Content-Type":"application/x-www-form-urlencoded;charset=utf-8"
					},
					handleAs: "json",
					timeout: 10000, // execute error when timeout
					load: function(data)
					{
						var myItems = [];
						if (data && data.items)
						{
							dojo.forEach(data.items, function(item)
							{
								if (item.type == 'Spelling' /*'RepeatedWord'*/)
								{
									var word = item.word;
									if (word && word != "?")
									{
										var wArray = word.split(/\s+/);
										if (wArray.length == 1)
										{
											var lastChar = word.charAt(word.length - 1);
											if (lastChar != "?")
											{
												var code = word.charCodeAt(0);
												if (!spellcheckerManager.isWordBoundaryChar(code) && !spellcheckerManager.isSkipWord(word))
												{
													var start = item.beginIndex;
													var end = item.endIndex;
													
													myItems.push({
														start: start,
														end: end,
														word: word,
														suggestions: item.suggestions
													});
												}
											}
										}
									}
								}
							});
						}
						if (callback)
						{
							var me = pres.spellCheckService;
							if (!me.cache[cacheKey])
								me.cacheCount ++;
							
							if (me.cacheCount > 150)
							{
								// clear for memory 
								delete me.cache;
								me.cache = {};
							}
							
							me.cache[cacheKey] = dojo.clone(myItems);
							callback(myItems);
						}
					},
	
					error: function(err, ioargs)
					{
						if (callback)
							callback([]);
					}
				};
				dojo.xhrGet(request);
			}
		}
		else
		{
			if (callback)
				callback([]);
		}

	}
}
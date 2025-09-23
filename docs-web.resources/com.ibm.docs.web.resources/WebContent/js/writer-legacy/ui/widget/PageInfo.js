dojo.provide("writer.ui.widget.PageInfo");
dojo.require("writer.core.Event");
dojo.requireLocalization("writer","lang");
dojo.require("dojo.string");

(
function(){
	var displayNode = null;
	var displayTimer = null;
	var displayFunc = function(curPageNum, totalPageNum)
	{
		if(pe.scene.isHTMLViewMode())
			return;
		
		var nls = dojo.i18n.getLocalization("writer","lang");
		var pageNumberStr = nls.PAGE_NUMBER;
		
		var editorNode = dojo.byId("editorFrame");
		var left = (editorNode.clientWidth - 90 - 30) + "px";
		
		if(displayNode == null)
		{
			var mainNode = dojo.byId('mainNode');
			displayNode = dojo.create('div',null,mainNode);
			displayNode.id = "PageInfo";
			displayNode.className = 'PageInfo';
			dojo.style(displayNode, {
				"position": "absolute",
				"paddingLeft": "5px",
				"left" : left,
				"bottom" : "20px",
				"width" : "90px",
				"background" :"#ffffff",
				"boxShadow": "2px 2px #a0a0a0"
			});
		}
		
		var displayNum = dojo.string.substitute(pageNumberStr, { 'pageNumber' : curPageNum, 'totalPageNumber':totalPageNum });
		displayNode.innerHTML = displayNum;
		dojo.style(displayNode, {"display": "", "left": left});
		
		if(displayTimer)
			clearTimeout(displayTimer);
		
		displayTimer = setTimeout(function(){
			displayTimer = null;
			dojo.style(displayNode, "display", "none");
		}, 2000);
	};
	
	dojo.subscribe(writer.EVENT.SCROLLPAGE, null, displayFunc);
	
})();


dojo.provide("writer.view.selection.Text");

dojo.require("writer.view.selection.Base");
dojo.require("writer.util.ViewTools");

dojo.declare("writer.view.selection.Text",
[writer.view.selection.Base], {
_line: null,
_start: null,
_end: null,
_shell: null,
constructor: function(createParam) {
	var line = createParam.viewItem;
	var start = createParam.start;
	var end = createParam.end;
	var tools = writer.util.ViewTools;
	if( line ){
		var conentLeft = line.getContentLeft();
		this._shell = createParam.shell;
		if( start == null ){
			start = tools.first(line).getLeft(true);
		}
		
		if( end == null ) {
			var lastRun = tools.last(line);
			end = lastRun.getLeft(true) + lastRun.w;
		}
		this._line = line;
		if( start > end ){
			var tmp = start;
			start = end;
			end = tmp;
		}
		var lineDomNode = line.render();
		if(line.isBidiLine()) {
			conentLeft += line.paddingLeft;
			if(line.isRtlDir && line.listOffset)
				conentLeft += line.listOffset;

			this._start = start - conentLeft;
			this._end = end - conentLeft;
		} else {
			var marginLeft = line.getRealPaddingLeft(); //parseInt(dojo.style(lineDomNode,"marginLeft"));
			this._start = start - conentLeft - marginLeft;
			this._end = end - conentLeft - marginLeft;
		}
		var width = this._end-this._start;
		if(width == 0){			
			var r = line.container.getFirst();
			var vTools = writer.util.ViewTools;
			var emptyLine = true;
			while(r)
			{
				if(!vTools.isZeroRun(r)){
					emptyLine = false;
					break;
				}
				r = line.container.next(r);
			}
			if(emptyLine)
				width = 10;
		}			
		
		
		//var top = line.getSelectionTop() + this._shell.baseTop;
		this._domNode = dojo.create("div", null, lineDomNode);
		var top = 0;
		
		dojo.style(this._domNode, "position", "absolute");
		dojo.style(this._domNode,"zIndex", this._selectLayer);
		if(dojo.isFF && dojo.hasClass(dojo.body(), "dijit_a11y"))
			dojo.style(this._domNode,'opacity','0.80');
		else
			dojo.style(this._domNode,'opacity','0.20');
		var focusEffect = 0;
		var height = line.getBoxHeight();
//		var vTools = writer.util.ViewTools;
//		var inCell =vTools.getCell(vTools.first(line));
//		if(inCell){
//			height += inCell.getTopEdge()+ inCell.getBottomEdge();
//		}
		if(createParam.effect)
		{
			focusEffect = 8;
			setTimeout(
					dojo.hitch(this, function(){
						dojo.style(this._domNode,'left',this._start +'px');
						dojo.style(this._domNode,'width',width+'px');
						dojo.style(this._domNode,'top', top +'px');
						dojo.style(this._domNode,'height',height + 'px');
						focusEffect = 0;
					}), 100
			);
		}
		dojo.style(this._domNode,'left',this._start - focusEffect/2 +'px');
		
		dojo.style(this._domNode,'width',width + focusEffect+'px');
		dojo.style(this._domNode,'top', top - focusEffect/2 +'px');
		dojo.style(this._domNode,'height',height + focusEffect+'px');
		this.highLight(createParam.highlightType);
		if( dojo.isIE && dojo.isIE <= 10 ){
			var color = dojo.style(this._domNode,"backgroundColor" );
			this._domNode.innerHTML = "<span style = 'color:"+ color +";'>t</span>";
		}
	}
}
});
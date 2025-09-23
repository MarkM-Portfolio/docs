dojo.provide("writer.controller.CursorContext");

dojo.declare("writer.controller.CursorContext", null, {
	// Shell
	_shell: null,

	// Paragraph model
	_run: null,

	// Text index
	_index: 0,

	constructor: function(createParam) {
		this._shell = createParam.shell;
	},

	run: function(run) {
		if (run != undefined) {
			this._run = run;
		} else {
			return this._run;
		}
	},

	index: function(i) {
		if (isNaN(i)) {
			return this._index;
		} else {
			this._index = i;
		}
	},

//	/**
//	 * Get the current cursor style to input node.
//	 * @returns {___anonymous798_799}
//	 */
//	getStyle: function()
//	{
//		var cursorInfo = this.getCursorInfo(this._index);
//		var line = this._run.getParent();
//		var lineRect = dojo.position(line._domNode);
//		
//		var style = {};
//		style.css = this._run._css;
//		style.pos = {"x": lineRect.x, "y": lineRect.y};
//		style.indent = cursorInfo.position.getRelative(this._run, line).getX();
//		style.lineWidth = line.h;			
//		
//		return style;
//	},
	
	getCursorInfo: function(){
		if( !this._run.domNode )
		//Not rendered
			return null;
		var runPos = this._run.getChildPosition(this._index, false, false, true);	// For image will get previous run's height.
		var pos = this._shell.logicalToClient(runPos);
		return {
			position: pos,
			thickness: 2,
			length: runPos.h || this._run.getHeight(),
			italic: runPos["italic"],
			bColor: runPos["bColor"]
		};
	},

	moveTo: function(run, index) {
		var moved = false;
		if (run && index>=0 && index<= run.len ) {
			var vTools = writer.util.ViewTools;
			try
			{
				if (vTools.isAnchor(run))
				{
					ret = vTools.getNeighbourRunByModelOrder(run, index);
					run = ret.obj;
					index = ret.index;
				}
			}
			catch(e)
			{
				console.error("error occured in getNeighbourRunByModelOrder()" + e);
			}
			this._run = run;
			this._index = index;
			moved = true;
		}
		return moved;
	}
});

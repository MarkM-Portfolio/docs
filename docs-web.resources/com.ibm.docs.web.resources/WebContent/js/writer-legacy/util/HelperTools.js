dojo.provide("writer.util.HelperTools");

writer.util.HelperTools = {

		/**
		 * Check if the run is selected from startPos to endPos
		 * @param run
		 * @param isCollapsed
		 * @param startPos The start position object. It's from range.getStartParaPos()
		 * @param endPos The start position object. It's from range.getEndParaPos()
		 * @returns {Boolean}
		 */
		isInSelection : function(run, isCollapsed, startPos, endPos)
		{
			if(isCollapsed){
				if(run && writer.util.ModelTools.isRun(run))
				{
					var startIdx = startPos.index;
					var runPara = writer.util.ModelTools.getParagraph(run);
					
					// Check start
					if(runPara == startPos.obj && run.start+run.length < startIdx)
						return false;
					// if run.start == index,  think it in selection only if the run is first run in the paragraph, or the run length is 0
					if(runPara == startPos.obj && ((run.start == startPos.index && (startPos.index != 0 && run.length != 0))|| run.start > startPos.index))
						return false;
					//Do not Check end
					return true;
				}
				
			}
			
			if(run && writer.util.ModelTools.isRun(run))
			{
				var startIdx = startPos.index;
				var runPara = writer.util.ModelTools.getParagraph(run);
				
				// Check start
				if(runPara == startPos.obj && (run.start+run.length <= startIdx && run.length != 0 || (run.length == 0 && run.start < startIdx)))
					return false;
				// Check end
				if(runPara == endPos.obj && run.start >= endPos.index)
					return false;
				return true;
			}
			return false;
		},
		
		getSelectedParaOrTable : function(){
			var objs = [];
			var selection = pe.lotusEditor.getSelection();
			if (!selection){
				return objs;
			}
			var ranges = selection.getRanges();
			if (!ranges){
				return objs;
			}
			var indexOf = [].indexOf ?
				    function(arr, item) {
				      return arr.indexOf(item);
				    } :
				    function indexOf(arr, item) {
				      for (var i = 0; i < arr.length; i++) {
				        if (arr[i] === item) {
				          return i;
				        }
				      }
				return -1;
			};
			for (var i = 0; i < ranges.length; i++) {
				var range = ranges[i];
				var it = new writer.common.RangeIterator( range );
				var para = null;
				while ( para = it.nextParagraph()) {
					if(para.modelType == writer.MODELTYPE.PARAGRAPH) {
						var table = writer.util.ModelTools.getRootTable(para);
						if(table) {
							if(objs.indexOf(table)==-1)
								objs.push(table);							
						}
						else
							objs.push(para);
						
					}
				}
			}
			return objs;			
		},

		getSelectedTaskId : function()
		{
			return "";
			
			var objs = pe.lotusEditor.getSelectedParagraph();
			if(objs.length>0){
				var table = writer.util.ModelTools.getRootTable(objs[0]);
				if(table)
					return table.getTaskId();
				else
					return objs[0].getTaskId();				
			}
			else
				return "";
		},
		/**
		 * check if the selection can assign task
		 * return false, if the selection contain a task already
		 * @returns {Boolean}
		 */
		canTaskCreate : function()
		{
			if(!pe.lotusEditor.isContentEditing())
				return false;
			var objs = this.getSelectedParaOrTable();
			for(var i = 0; i < objs.length; i++) {
				if(writer.util.ModelTools.inTextBox(objs[i]))
					return false;
				if(writer.util.ModelTools.isInToc(objs[i]))
					return false;				
				if(objs[i].isTask())
					return false;
			}
			return true;
		},
		/**
		 * check if the selection can be deleted
		 * as it may contain task
		 * @returns {Boolean}
		 */
		canTaskDelete : function()
		{
			return true;
			
			var paras = pe.lotusEditor.getSelectedParagraph();
			if(paras.length==1&&!paras[0].isEmpty())
				return true;

			var firstTask = secondTask = null;
			for(var i = 0; i < paras.length; i++) {
				if(paras[i].isTask()) {
					if(!firstTask) 
						firstTask = paras[i].getTaskId();
					else if(firstTask==paras[i].getTaskId())
						continue;
					else if(!secondTask) 
						secondTask = paras[i].getTaskId();
					else if(secondTask==paras[i].getTaskId())
						continue;
					else 
						return false;
				}
			}
			
			if(!firstTask)
			 return true;	
			var firstObj = writer.util.ModelTools.getRootTable(paras[0]);
			if(firstObj==null)
				firstObj = paras[0];
			var lastObj = writer.util.ModelTools.getRootTable(paras[paras.length-1]);
			if(lastObj==null)
				lastObj = paras[paras.length-1];
			
			var pre_para = writer.util.ModelTools.getPrev(firstObj,writer.util.ModelTools.isParagraph);
			var next_para = writer.util.ModelTools.getNext(lastObj,writer.util.ModelTools.isParagraph);
			if(!pre_para && !next_para)
				return false;
			
			if(secondTask)
				return (pre_para && firstTask == pre_para.getTaskId() && next_para && secondTask == next_para.getTaskId());					
			else
				return (pre_para && firstTask == pre_para.getTaskId()) || (next_para && firstTask == next_para.getTaskId());			
		},
		
		getCursorColor: function(backgroundColor, bCalcCursoColor){
			var color = concord.util.browser.isMobile()? '#426bf2': 'black';
			if(bCalcCursoColor && this.isNeedChangeColor(backgroundColor)){
				color  =  'white';
			}
			return color;
		},
		combineColors:function(bg, color){		
		    var a = color.a;		   
		   var arr =[
		        (1 - a) * bg.r + a * color.r,
		        (1 - a) * bg.g + a * color.g,
		        (1 - a) * bg.b + a * color.b
		   ];
		    return dojo.colorFromArray(arr);
		},
		
		isNeedChangeColor: function(backgroundColor){	
			if(!backgroundColor)
				return false;
			var BgColor;
			// if the color is RGB or GRBA, convert it to Hex
			if(backgroundColor.toLowerCase().indexOf("rgb") == 0){
				var bgColor =dojo.colorFromRgb(backgroundColor);
				BgColor =  this.combineColors(dojo.colorFromHex("#FFFFFF"), bgColor);				
			}else{
				// the color may not start with # or just number
				if(backgroundColor.length == 6)
					backgroundColor ="#" + backgroundColor;
				BgColor = dojo.colorFromHex(backgroundColor);
			}					
			try{
				if( BgColor.a && BgColor.a >= 0.8 )
				//transparent color
					return  false;
				if(BgColor.r <= 38 && BgColor.g <= 38 && BgColor.b <= 38)
					return true;

					
			}catch(e){
			}
			
			return false;
		}
};
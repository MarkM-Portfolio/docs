dojo.provide("writer.view.update.TableViewUpdate");
dojo.require("writer.view.update.BlockView");
dojo.require("writer.view.update.BlockContainerView");
writer.view.update.TableViewUpdate=function(){
	
};
writer.view.update.TableViewUpdate.prototype={
	update:function(){
		if(this.isReseted()){
			this.reset(true);
			return;
		}
		if(!this.changedView||this.changedView.len==0){
			return;
		}
		
		var headChanged = false;
		if (this.changedView && this.changedView.forEach)
		{
			this.changedView.forEach(function(node)
			{
				if(node.model &&(node.model.isTblHeaderRepeat() == true) && writer.util.ModelTools.isInDocTable(node.model))
				{
					headChanged = true;
					return;
				}
			});
		}
		this.getTableMatrix();
		delete this.changedView;
		var h = this.getBoxHeight();
		var w = this.w;
		var top =0;
		var rowWidth = 0;
		var row = this.rows.getFirst();
		var toNotify = false;
		while(row){
			if(row.isResized()){
				toNotify = true;
			}
			row.setContentTop(top);
			if(!row.hasLayouted()){
				row.layout(this);
			}else if(row.changeCSSStyle()){
				row.updateRowCSSStyle();
			}else{
				row.update();
			}
			top+= row.getBoxHeight();	
			rowWidth = Math.max(rowWidth,row.getBoxWidth());
			row = this.rows.next(row);			
		}
		this.h = top+ ((this.getTopEdge()+this.getBottomEdge()+this.marginTop+this.marginBottom));
		this._h = top;
		var h1 = this.getBoxHeight(); 
		this.w = rowWidth;
		if((this.w!=w||h!=h1)&&!this.isDirtyDOM()){
			this.updateDOMSize();
		}
		if(this.isDirtyDOM() || h!=h1 || toNotify || headChanged){
			this.getParent().notifyUpdate([this]);
		}
		if(concord.util.browser.isMobile() && concord.util.mobileUtil.tableResize.tableInfo 
				&& concord.util.mobileUtil.tableResize.tableInfo.tableView.model == this.model)
		{
			concord.util.mobileUtil.tableResize.viewUpdated();
		}
	},
	updateDOMSize:function(){
		this.adjustAlign();
		var node = this.getMainNode();
		if(!node) return;
		dojo.style(node,{"height":this.getContentHeight()+"px","width":this.w+"px","margin-left":this.marginLeft+"px"});
//		this.updateTaskNode();
		dojo.publish(writer.EVENT.TBLDOMCHG,[this]);
	},
	updateTaskNode : function() {
		if (pe.lotusEditor.getTaskHdl())
			pe.lotusEditor.getTaskHdl().updateTaskNode(this);
	},
	deleteView:function(view){
		this.rows.remove(view);
		if(this.rows.length()==0){
			this.deleteSel();
		}
	},
	updatePosition: function(body)
	{
		this.parent = body;
		var oldMarginTop = this.marginTop;
		this.calculateMarginTop();
		if (oldMarginTop != this.marginTop)
		{
			this.h = this.h - oldMarginTop + this.marginTop;
			this._dirtyDOM = true;
		}
	}
};
common.tools.extend(writer.view.update.TableViewUpdate.prototype,new writer.view.update.BlockView());
common.tools.extend(writer.view.update.TableViewUpdate.prototype,new writer.view.update.BlockContainerView());
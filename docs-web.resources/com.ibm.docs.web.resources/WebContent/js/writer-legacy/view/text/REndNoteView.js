dojo.provide("writer.view.text.REndNoteView");
dojo.declare("writer.view.text.REndNoteView",[writer.view.text.RFootNoteView],{
	getViewType:function(){
		return "text.REndNote";
	},
	_getCurrentNotePr:function(parent){
		if(!this.parent){
			var page = writer.util.ViewTools.getPage(parent);
		}else{
			var page = writer.util.ViewTools.getPage(this);
		}
		var sect = page&&page.getSection();
		return sect&&sect.getEndnotePr();
	},
	_getGNotePr:function(){
		return  pe.lotusEditor.setting.getEndnotePr();
	}
});

writer.model.Model.prototype.viewConstructors[writer.MODELTYPE.RENDNOTE]=writer.view.text.REndNoteView;
dojo.provide("writer.view.notes.EndNoteView");
dojo.declare("writer.view.notes.EndNoteView",[writer.view.notes.FootNoteView],{
	getViewType:function(){
		return 'note.endnote';
	},
	_defalutClass:"endnote"
});
writer.model.Model.prototype.viewConstructors[writer.model.notes.EndNote.prototype.modelType]=writer.view.notes.EndNoteView;
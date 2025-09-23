/**
 * 
 */
dojo.provide("writer.model.text.REndNote");
dojo.declare("writer.model.text.REndNote",[writer.model.text.RFootNote],{
	modelType: writer.MODELTYPE.RENDNOTE,
	deleteSel:function(){
		this._referFn&&pe.lotusEditor.relations.notesManager.deleteEndnotesByRefer(this,true);
	},
	_toJsonType:function(){
		return "en";
	}
});

dojo.provide("writer.util.ListTools");
dojo.require("writer.model.numberingDefinition");
writer.util.ListTools = {
	/**
	 * get free num id
	 */
	getFreeNumId : function(){
		var id = 1;
		var numbering = pe.lotusEditor.number;
		var prefix = "" + this._getIdPrefix();
		while (numbering.nums[prefix + id] != undefined) id++;
		return prefix + id;
	},
	/**
	 * get free abstract num id
	 */
	getFreeAbstractNumId: function() {
		var id = 1;
		var numbering = pe.lotusEditor.number;
		var prefix = "" + this._getIdPrefix();
		while (numbering.abstracts[prefix + id] != undefined) id++;
		return prefix + id;
	},
	
	/**
	 * Calculate the sequence by user's id
	 */
	_getIdPrefix: function()
	{
		var editorStore = pe.scene.getEditorStore();
		var allEditors = editorStore.getAllEditors();
		var curId = pe.scene.getCurrUserId(); 
		var seq = 0;
		try{
			for(var i = 0; i < allEditors.items.length; i++)
			{
				if(curId >= allEditors.items[i].userId)
					seq++;
			}	
		}
		catch(e)
		{
			console.log("Exception in ListTools._getIdPrefix: " + e);
			seq = "";
		}
		return seq;
	},

	/**
	 * create list
	 * @param numJson
	 * @param msgs
	 * @param abstractNum
	 * @returns
	 */
	createList: function(numJson, msgs, abstractNum, numId, absId, imgs ){
		numId = numId || this.getFreeNumId();
		absId = absId || this.getFreeAbstractNumId();
		abstractNum = abstractNum || new writer.model.abstractNum(dojo.clone(numJson));
		pe.lotusEditor.number.addList(numId,absId,abstractNum);
		var imgsJson = {};
		if( imgs ){
			dojo.forEach( abstractNum.numDefintions, function(lvl){
				if( lvl.lvlPicBulletId ){
					var img = pe.lotusEditor.number.getImg( lvl.lvlPicBulletId );
					if( !img ){
						imgsJson[lvl.lvlPicBulletId ]= imgs[lvl.lvlPicBulletId];
						pe.lotusEditor.number.addImg( lvl.lvlPicBulletId, imgs[lvl.lvlPicBulletId] );
					}
				}
			});	
		}
		
		var msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.List, [WRITER.MSG.createAddListAct( numId,absId,numJson,imgsJson )],WRITER.MSGCATEGORY.List );
		msgs.push(msg);
		
		return numId;
	}
		
		
		
		
		
};
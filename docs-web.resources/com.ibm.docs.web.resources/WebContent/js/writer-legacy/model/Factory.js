dojo.provide("writer.model.Factory");
dojo.require("writer.model.Paragraph");
dojo.require("writer.model.DocPartObjFactory");
dojo.require("writer.model.table.Table");

dojo.declare("writer.model.Factory", null,{
	docPartObjFactory: new writer.model.DocPartObjFactory(),
	
	createModel: function( json, doc ){
		switch( json.t ){
		case 'p':
//			if( json.pPr && ( json.pPr.styleId== "Header" || json.pPr.styleId== "Footer" ) ) 
//				delete json.pPr.styleId;
			return new writer.model.Paragraph( json, doc, true );
			break;
		case 'tbl':
			return new writer.model.table.Table(json,doc);
			break;
		case "sdt":
			//if it is toc
			return this.docPartObjFactory.createModel( json, doc, this );
			break;
		case "tr":
			return new writer.model.table.Row(json,doc);
		case "tc":
			return new writer.model.table.Cell(json,doc,doc.parent);
			break;
		case "fn":
			return new writer.model.notes.FootNote(json);
			break;
		}
	}	
});

(function(){	
	if(typeof g_modelFactory == "undefined")
		g_modelFactory = new writer.model.Factory();
})();
	
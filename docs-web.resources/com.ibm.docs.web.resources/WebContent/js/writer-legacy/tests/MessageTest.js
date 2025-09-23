dojo.provide("writer.tests.MessageTest");
dojo.require("writer.msg.MessageHelper");
dojo.require("writer.msg.MessageHandler");
dojo.require("writer.msg.Message");

(function(){
	
//	doh.register("MessageTest",[
//	    function modifyMeta(){
//	    	var document = loadSampleDocument( );
//	    	
//	    	var section = document.setting.getFirstSection();
//	    	var path = section.getJSONPath();
//	    	var oldJSON = section.toJson();
//	    	doh.assertEqual( oldJSON.pgSz.h,  "792pt"  );
//	    	
//	    	var newJSON = dojo.clone(oldJSON);
//	    	newJSON.pgSz.h="1234pt";
//	    	var actPair = WRITER.MSG.createModifyMetaAct(path, newJSON, oldJSON);
//			var msg= WRITER.MSG.createMsg(WRITER.MSGTYPE.Element, [actPair], WRITER.MSGCATEGORY.Setting);
//			WRITER.MSG_HANDLER.processMessage(msg.msg);
//			
//			var realNewJson = section.toJson();
//			doh.assertEqual( realNewJson.pgSz.h,  "1234pt"  );
//			
//			var emptyPS = { 
//					'fmt': [], 
//					'pPr': [],
//					't': 'p',
//					'id': WRITER.MSG_HELPER.getUUID(),
//					'c':''};
//			var jsonContent = {
//				t: "hdr",
//				content: [emptyPS]
//			};
//			var actPair = WRITER.MSG.createModifyMetaAct([], {"rId16":jsonContent}, {"rId16":null});
//			var msg= WRITER.MSG.createMsg(WRITER.MSGTYPE.Element, [actPair], WRITER.MSGCATEGORY.Relation);
//			WRITER.MSG_HANDLER.processMessage(msg.msg);
//			newJSON = document.relations.jsonData["rId16"];
//			doh.assertEqual( newJSON,  jsonContent );
//	    }
//	
//	]);
//	
})();
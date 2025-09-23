/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("concord.pres.mobile.mProcMsg");

dojo.require("concord.pres.ProcMsg");
dojo.require("concord.util.mobileUtil");
dojo.declare("concord.pres.mobile.mProcMsg", concord.pres.ProcMsg, {
	
	processMessage : function(message,dom,docKey,fromUndoRedo,stripACF){
		this.inherited(arguments);

		var acts = message.as || message.updates; //Act command list
		var snpashotMgr = this._slideSorter.snapshotMgr;
		var actType = MSGUTIL.actType;
		/**
		 * 	update native slide when the slide changed in co-editing.
		 */
		for( var i=0; i < acts.length; i++ )
		{
			var act = acts[i];
			var sId = act.p_sid;
			var bUpdate = false;
			if((!docKey && SYNCMSG._documents['sorter'] && dom != SYNCMSG._documents['sorter']) || (docKey && docKey != PROCMSG.SORTER_DOC))
			{
				// insert and delete covered in slideEditor
				if(act.t != actType.insertElement && act.t != actType.deleteElement)
					concord.util.mobileUtil.presObject.processMessage(act.tid,act.t);
			}
			
			if(sId){
				switch(act.t)
				{
					case actType.insertElement:
					case actType.deleteElement:{ // editing
						if(act.p_isnasw !== "true" && act.p_isnasw != true)
							bUpdate = true;
						break;
					}
					case actType.setAttributes:{
						if(act.flag) // move,resize
							bUpdate = true;
						else if(act.remoteFlag) // set z-index
							bUpdate = true;
						break;
					}	
					case actType.insertText:
					case actType.deleteText:
					case actType.insertStyleElement:
					case actType.deleteStyleElement:
					case actType.setStyle:
					case actType.removeStyle:
					case actType.removeAttributes:
					case actType.UpdateListValue:
					case actType.ChangeListType:
					{						
						bUpdate = true;
						break;
					}
				}
				if(bUpdate && concord.util.mobileUtil.useNativeSlideSorter){
					var sIdx = this._slideSorter.getIdxbyId(sId);
					if(sIdx>=0){
						snpashotMgr.updateSlide(sIdx,true);
						snpashotMgr.startUptSlideTimer(5000);
					}
				}
			}
		}
	}
});

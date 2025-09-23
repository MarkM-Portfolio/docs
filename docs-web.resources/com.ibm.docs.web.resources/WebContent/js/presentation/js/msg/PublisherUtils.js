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

dojo.provide("pres.msg.PublisherUtils");
dojo.declare("pres.msg.PublisherUtils", null, {
	
	editFlag: "is_edited",
	addMoveFlag: function(msgPairList)
	{
		for ( var i = 0; i < msgPairList.length; i++)
		{
			var msgPair = msgPairList[i];
			var msgPairSize = msgPair.msg.updates.length;
			for ( var j = 0; j < msgPairSize; j++)
			{
				msgPair.msg.updates[j].slideMove = true;
				if (msgPair.rMsg.updates[j] != null)
					msgPair.rMsg.updates[j].slideMove = true;
			}
		}
	},

	setHasInsertDeleteSameElementInMsgListFlag: function(msgPairList, hasInsertDeleteSameElement)
	{
		if (msgPairList != null)
		{
			for ( var i = 0; i < msgPairList.length; i++)
			{
				var msg = msgPairList[i].msg;
				var rMsg = msgPairList[i].rMsg;
				for ( var j = 0; j < msg.updates.length; j++)
				{
					msg.updates[j].has_ie_de_inlist = hasInsertDeleteSameElement;
					rMsg.updates[j] && (rMsg.updates[j].has_ie_de_inlist = hasInsertDeleteSameElement);
				}
			}
		}
	},

	checkEditFlag: function(msgPairList, id, checkChildren)
	{
		var doc = pe.scene.doc;
		var flag = this.editFlag;
		var slideOrElement = doc.find(id);
		if (slideOrElement)
		{
			if (slideOrElement.attrs[flag] !== "true")
			{
				slideOrElement.attrs[flag] = "true";
				this.createAttributeMsgPair(slideOrElement.id, flag, 'true', msgPairList, 'false');
			}
			if (checkChildren && (slideOrElement instanceof pres.model.Slide))
			{
				var children = slideOrElement.getChildren();
				dojo.forEach(children, dojo.hitch(this, function(c)
				{
					if (c && c.attrs[flag] !== "true")
					{
						c.attrs[flag] = "true";
						this.createAttributeMsgPair(c.id, flag, 'true', msgPairList, 'false');
					}
				}));
			}
		}
	},

	// if the message is sent from create slide/create contentbox/change slide layout/set slide transition
	// this method is called by sendMessage
	sendEditFlag: function(msgList, data)
	{
		var doc = pe.scene.doc;
		var flag = this.editFlag;
		for ( var im = 0; im < msgList.length; im++)
		{
			var msg = msgList[im];
			if (msg.asCtrl || msg.isCtrl)
				continue;
			var acts = msg.as || msg.updates;
			if (!acts)
				continue;
			var msgPairList1 = [];
			for ( var ia = 0; ia < acts.length; ia++)
			{
				var act = acts[ia];
				// console.info(msg.type + " : " + act.t + " : " + act.a + " - " + act.p_isnad);
				// when background image is set by CSS, a msg will be sent, do not handle this message
				// old code, should not useful..
				// see slidesorter.js msgPairList = this.checkNcreateBackgroundImageDivFromCss(slideElement, null, msgPairList);
				if (msg.type == "e" && act.t == "ie" && act.s && (act.s.indexOf("backgroundImage") > -1))
					continue;
				// create slide
				if (msg.type == "e" && act.t == "ie" && act.p_isnasw == true)
				{
					// console.info("create slide");
					this.checkEditFlag(msgPairList1, act.p_nid, true);
				}
				else if (msg.type == "rn" && act.t == "ie" && act.p_isnasw == true)
				{
					// console.info("create slide by rn");
					this.checkEditFlag(msgPairList1, act.p_nid, true);
				}
				else if (msg.type == "a" && act.t == "sbt" && act.p_isnad == true)
				{
					// console.info("move box");
					// a message on draw_frame
					// comments message will not go there.
					this.checkEditFlag(msgPairList1, act.tid, false);
					
					var obj = pe.scene.doc.find(act.tid);
					if (obj && obj instanceof pres.model.Element)
					{
						var slide = obj.parent;
						if (slide)
							this.checkEditFlag(msgPairList1, slide.id, false);
					}
				}
				// create contentbox, move/delete table column/lines, change table style
				// edit text, resize, set text style
				else if ((msg.type == "e" || msg.type == "rn") && act.t == "ie" && act.p_isnad == true)
				{
					// console.info("insert contentbox");
					this.checkEditFlag(msgPairList1, act.tid, false);
					this.checkEditFlag(msgPairList1, act.p_nid, false);
				}
				// delete contentbox
				else if ((msg.type == "e" || msg.type == "rn") && act.t == "de" && act.p_isnad == true)
				{
					// console.info("delete contentbox");
					this.checkEditFlag(msgPairList1, act.tid, false);
				}
				// change slide layout, set slide transition
				else if (msg.type == "a" && act.t == "sbt" && act.a && (act.a.hasOwnProperty("presentation_presentation-page-layout-name") || act.a.hasOwnProperty("smil_type")))
				{
					// console.info("slide transition");
					this.checkEditFlag(msgPairList1, act.tid, false);
				}
				// handle spellcheck message
				// no this message in new stream.
				/*
				else if (msg.type == "t" && act.t == "it")
				{
					if (act.tid)
					{
						var element = pres.model.helper.getParentDrawFrame(act.tid);
						if (element)
						{
							var slide = element.parent;
							if (!slide.attrs[flag])
							{
								slide.attrs[flag] = true;
								this.createAttributeMsgPair(slide.id, flag, 'true', msgPairList1, 'false');
							}
							if (!element.attrs[flag])
							{
								element.attrs[flag] = true;
								this.createAttributeMsgPair(element.id, flag, 'true', msgPairList1, 'false');
							}
						}
					}
				}
				*/
			}
			if (msgPairList1.length > 0)
			{
				var msgList1 = [];
				for ( var i = 0; i < msgPairList1.length; i++)
				{
					var msg = msgPairList1[i].msg;
					msgList1.push(msg);
				}
				//console.info("SEND edit message :");
				//console.info(msgList1);
				pe.scene.session.sendMessage(msgList1);
			}
		}
	},

	_isResizingMsg: function(msgList, type)
	{
		for ( var i = 0; i < msgList.length; i++)
		{
			var updatesList = msgList[i].updates;
			if (updatesList != null)
			{
				for ( var j = 0; j < updatesList.length; j++)
				{
					var act = updatesList[j];
					if (act.flag != null && act.flag == type)
					{
						return true;
					}
				}
			}
		}
		return false;
	}
});
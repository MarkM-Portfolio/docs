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

dojo.provide("pres.handler.SlideHandlerTransition");

dojo.require("pres.constants");
dojo.require("concord.widgets.imageGallery");
dojo.require("pres.widget.Dialog");
dojo.require("concord.widgets.slideTransitionGallery");
dojo.requireLocalization("concord.widgets", "slideEditor");

dojo.declare("pres.handler.SlideHandlerTransition", null, {

	openTransitionDialog: function()
	{
		if (!dijit.byId("P_d_SlideTranstions"))
		{
			var dlgLeft = 300;
			var STRINGS = dojo.i18n.getLocalization("concord.widgets", "slideEditor");
			this.openSlideTransitionDialogObj = new pres.widget.Dialog({
				title: STRINGS.ctxMenu_slideTransitionTitle,
				content: "<div id='P_d_SlideTranstions_MainDiv'> </div>",
				style: 'width:680px',
				id: "P_d_SlideTranstions",
				'destroyOnClose': false,
				'presModal': true,
				'presDialogButtons': [{
					'label': STRINGS.ok,
					'action': dojo.hitch(this, function(evt)
					{
						this.applySlideTransitions();
					})
				}, {
					'label': STRINGS.cancel
				}],
				contentNodeId: 'P_d_SlideTranstions_MainDiv'
			});

			this.openSlideTransitionDialogObj.startup();
			this.openSlideTransitionDialogObj.show();
			var dialogHeight = (this.openSlideTransitionDialogObj.domNode.offsetHeight * 1);
			this.slideTransitionDialogContent(dialogHeight);
			if (this.slideTransitionGalleryObj)
				this.slideTransitionGalleryObj.updateDialogHeight();
			this.openSlideTransitionDialogObj._getFocusItems(this.openSlideTransitionDialogObj.domNode);
			this.openSlideTransitionDialogObj._firstFocusItem.focus();
		}
		else
		{
			if (this.slideTransitionGalleryObj != null)
			{ // jmt - D45188
				this.slideTransitionGalleryObj.deSelectAll();
			}
			dijit.byId("P_d_SlideTranstions").show();
		}
	},

	doApplySlideTransitions: function(smil_type, smil_subtype, smil_direction, applyToAll)
	{

		var slides = pe.scene.doc.slides;
		if (!applyToAll)
		{
			var sorter = pe.scene.slideSorter;
			slides = dojo.map(sorter.selectedThumbs, function(t)
			{
				return t.slide;
			});
		}

		var msgActs = [];
		var SYNCMSG = pe.scene.msgPublisher;

		for ( var ms = 0; ms < slides.length; ms++)
		{
			var slide = slides[ms];
			var id = slide.id;
			var attrs = slide.attrs;
			if (smil_type != 'none')
			{
				msgActs.push(SYNCMSG.createAttributeMsgActs(id, "smil_type", attrs.smil_type, smil_type));
				attrs.smil_type = smil_type;

				msgActs.push(SYNCMSG.createAttributeMsgActs(id, "smil_subtype", attrs.smil_subtype, smil_subtype));
				attrs.smil_subtype = smil_subtype;

				msgActs.push(SYNCMSG.createAttributeMsgActs(id, "smil_direction", attrs.smil_direction, smil_direction));
				attrs.smil_direction = smil_direction;

				msgActs.push(SYNCMSG.createAttributeMsgActs(id, "presentation_transition-speed", attrs["presentation_transition-speed"], "none"));
				attrs["presentation_transition-speed"] = "none";

				msgActs.push(SYNCMSG.createAttributeMsgActs(id, "smil_fadeColor", attrs["smil_fadeColor"], "none"));
				attrs["smil_fadeColor"] = "none";

				msgActs.push(SYNCMSG.createAttributeMsgActs(id, "presentation_duration", attrs["presentation_duration"], "none"));
				attrs["presentation_duration"] = "none";
			}
			else
			{
				msgActs.push(SYNCMSG.createAttributeMsgActs(id, "smil_type", attrs.smil_type, "none"));
				attrs.smil_type = "none";

				msgActs.push(SYNCMSG.createAttributeMsgActs(id, "smil_subtype", attrs.smil_subtype, "none"));
				attrs.smil_subtype = "none";

				msgActs.push(SYNCMSG.createAttributeMsgActs(id, "smil_direction", attrs.smil_direction, "none"));
				attrs.smil_direction = "none";

				msgActs.push(SYNCMSG.createAttributeMsgActs(id, "presentation_transition-speed", attrs["presentation_transition-speed"], "none"));
				attrs["presentation_transition-speed"] = "none";

				msgActs.push(SYNCMSG.createAttributeMsgActs(id, "smil_fadeColor", attrs["smil_fadeColor"], "none"));
				attrs["smil_fadeColor"] = "none";

				msgActs.push(SYNCMSG.createAttributeMsgActs(id, "presentation_duration", attrs["presentation_duration"], "none"));
				attrs["presentation_duration"] = "none";

			}
		}
		if (msgActs.length > 0)
		{
			// Just sent one msg for applying slide transition(one or multiple)
			var msgList = [SYNCMSG.createMessage(MSGUTIL.msgType.Attribute, msgActs)];
			SYNCMSG.sendMessage(msgList);
		}

		dojo.forEach(slides, function(slide)
		{
			dojo.publish("/slide/attr/changed", [slide]);
		});
	},

	applySlideTransitions: function()
	{
		var applyToAll = false;
		var radioButtons = dojo.query("input[name='selectedSlide']", "P_d_SlideTranstions");
		if (radioButtons[1].checked)
		{
			applyToAll = true;
		}

		var smil_type = "none";
		var smil_subtype = "none";
		var smil_direction = "none";

		dojo.query(".clipPickerDialogItemSelected", 'P_d_SlideTranstions').forEach(function(node, index, arr)
		{
			if (node.id != "none")
			{
				var split = node.id.split('_');
				smil_type = split[0];
				smil_subtype = split[1];
				smil_direction = split[2];
			}
		});

		this.doApplySlideTransitions(smil_type, smil_subtype, smil_direction, applyToAll);
	},

	slideTransitionDialogContent: function(height)
	{
		// Create Dialog Content
		var STRINGS = dojo.i18n.getLocalization("concord.widgets", "slideEditor");
		var mainSlideTransitionContainer = this.mainSlideTransitionContainer = document.createElement('div');
		mainSlideTransitionContainer.id = "P_d_SlideTranstions_ContentDiv";
		dojo.byId('P_d_SlideTranstions_MainDiv').appendChild(mainSlideTransitionContainer);

		// Load layoutGallery
		this.slideTransitionGalleryObj = new concord.widgets.slideTransitionGallery({
			'mainDiv': mainSlideTransitionContainer,
			'height': height,
			'handleClose': dojo.hitch(this, this.closeDialog, this.openSlideTransitionDialogObj),
			'onSelectCallback': dojo.hitch(this, this.applySlideTransitions),
			'STRINGS': STRINGS.concordGallery,
			'onDblClick': dojo.hitch(this.openSlideTransitionDialogObj, this.openSlideTransitionDialogObj.closeDialog)
		});
	}

})
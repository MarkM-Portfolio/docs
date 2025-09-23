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

dojo.provide("pres.editor.BoxLock");
dojo.require("pres.widget.LockerTooltip");

dojo.declare("pres.editor.BoxLock", null, {

	destroy: function()
	{
		this.inherited(arguments);
		if (this.lockerTooltip)
			this.lockerTooltip.destroy();
	},

	showLock: function(userObj)
	{
		this.updateLockIcon(userObj);
		this.lockedUserId = userObj.getEditorId();
		dojo.addClass(this.domNode, "locker_" + userObj.getEditorId());

		var node = this.element.isNotes ? this.getNotesNode() : this.contentBoxDataNode;
		if (!node)
			node = this.contentBoxDataNode;
		dojo.style(node, "opacity", "0.5");
		dojo.attr(node, "bgcolor", dojo.style(node, "backgroundColor"));
		dojo.style(node, "backgroundColor", "#EEEEEE");

		this.exitSelection();

		if (pe.scene.isMobile)
			concord.util.mobileUtil.presObject.processMessage(this.id, "lock");
	},

	hideLock: function()
	{
		if (this.lockIcon)
			this.lockIcon.style.display = "none";

		if (this.lockedUserId)
			dojo.removeClass(this.domNode, "locker_" + this.lockedUserId);

		this.lockedUserId = "";

		if (this.lockerTooltip)
			this.lockerTooltip.destroy();

		var node = this.element.isNotes ? this.getNotesNode() : this.contentBoxDataNode;
		if (!node)
			node = this.contentBoxDataNode;

		dojo.style(node, "opacity", "1");
		var bgcolor = dojo.attr(node, "bgcolor");
		dojo.style(node, "backgroundColor", "");
		if (bgcolor)
		{
			dojo.style(node, "backgroundColor", bgcolor);
		}

		if (pe.scene.isMobile)
			concord.util.mobileUtil.presObject.processMessage(this.id, "unlock");
	},

	updateLockIcon: function(user)
	{
		var backColor = pe.scene.getEditorStore().getUserCoeditColor(user.getEditorId());
		if (this.lockerTooltip)
			this.lockerTooltip.destroy();
		this.lockerTooltip = new pres.widget.LockerTooltip({
			connectId: [this.domNode],
			label: user.getName(),
			userId: user.getEditorId(),
			forNotes: this.element.isNotes
		});
	},

	lock: function()
	{
		dojo.publish("/box/lock", [this.element]);
	},

	unlock: function()
	{
		dojo.publish("/box/unlock", [this.element]);
	},

	addLockIcon: function(elementId, userId)
	{
		if (pe.authenticatedUser && userId == pe.authenticatedUser.getId())
			return;
		if (this.element.id == elementId)
		{
			this.exitEdit();
			this.showLock(pe.scene.getEditorStore().getEditorById(userId));
		}
	},

	removeLockIcon: function(elementId, userId)
	{
		if (pe.authenticatedUser && userId == pe.authenticatedUser.getId())
			return;
		if (this.element.id == elementId)
		{
			this.hideLock();
		}
	}
});
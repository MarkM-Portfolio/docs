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

dojo.provide("pres.Locker");

dojo.declare("pres.Locker", null, {

	constructor: function(state)
	{
		this.slideLocks = {};
		this.elementLocks = {};
	},

	reset: function()
	{
		this.slideLocks = {};
		this.elementLocks = {};
	},

	init: function(state)
	{
		var ot_context = state.ot_context;
		var participants = state.participants;
		for ( var elemId in ot_context)
		{
			var id = this._getUserId(ot_context[elemId], participants);
			if (!id)
				continue;
			if (!this.elementLocks[elemId])
				this.elementLocks[elemId] = [];
			if (dojo.indexOf(this.elementLocks[elemId], id) == -1)
				this.elementLocks[elemId].push(id);
		}
	},
	
	isSlideOrContentLocked: function(id)
	{
		var slideLock = this.isLockedByOther(id, true);
		if (slideLock)
			return true;
		else
		{
			var me = this;
			var slide = pe.scene.doc.find(id);
			if(slide && slide instanceof pres.model.Slide)
			{
				var eles = slide.getElements();
				return dojo.some(eles, function(ele){
					return me.isLockedByOther(ele.id, false);
				})
			};
			return false;
		}
	},

	isLockedByMe: function(id, forSlide)
	{
		if (!forSlide)
		{
			var users = this.elementLocks[id];
			return users && dojo.indexOf(users, pe.authenticatedUser.getId()) > -1;
		}
		else
		{
			var users = this.slideLocks[id];
			return users && dojo.indexOf(users, pe.authenticatedUser.getId()) > -1;
		}
	},

	isLockedByOther: function(id, forSlide)
	{
		return this.getLockedOtherUsers(id, forSlide, true);
	},

	getMultipleLockedOtherUsers: function(ids, forSlide)
	{
		var arr = [];
		dojo.forEach(ids, dojo.hitch(this, function(id)
		{
			var users = this.getLockedOtherUsers(id, forSlide);
			dojo.forEach(users, function(us)
			{
				if (dojo.indexOf(arr, us) == -1)
					arr.push(us);
			});
		}));
		return arr;
	},

	getLockedOtherUsers: function(id, forSlide, one)
	{
		var locks = forSlide ? this.slideLocks : this.elementLocks;
		var currentUserId = pe.authenticatedUser ? pe.authenticatedUser.getId() : null;
		var users = locks[id];
		var ids = [];
		if (users && users.length > 0)
		{
			var anotherUserId = null;
			for ( var i = 0; i < users.length; i++)
			{
				var userId = users[i];
				if (userId !== currentUserId)
				{
					ids.push(userId);
					if (one)
						return userId;
				}
			}
		}
		if (one)
			return null;
		else
			return ids;
	},

	removeUser: function(userId)
	{
		var slides = [];
		var elements = [];
		var obj = [this.slideLocks, this.elementLocks];
		dojo.forEach(obj, function(o, index)
		{
			for ( var eId in o)
			{
				var arr = o[eId];
				if (arr)
				{
					var found = false;
					for ( var i = arr.length - 1; i >= 0; i--)
					{
						if (arr[i] === userId)
						{
							arr.splice(i, 1);
							found = true;
						}
					}
					if (arr.length == 0)
						delete o[eId];
				}

				if (found)
				{
					var resultArr = index == 0 ? slides : elements;
					resultArr.push(eId);
				}
			}
		});
		dojo.forEach(elements, function(elementId)
		{
			dojo.publish("/lock/element/remove", [elementId, userId]);
		});
		dojo.publish("/lock/slides/updated", [slides]);
		return {
			slides: slides,
			elements: elements
		};

	},

	_getUserId: function(clientId, /* json */participants)
	{
		var pList = participants;
		for ( var i = 0; i < pList.length; i++)
		{
			if (clientId == pList[i].client_id)
				return pList[i].id;
		}

		return null;
	},

	lockElement: function(elementId, userId)
	{
		userId = userId ? userId : pe.authenticatedUser ? pe.authenticatedUser.getId() : null;
		if (!userId)
			return;
		var me = this;
		// remove other element lock if exist... only allow lock one per time.

		for ( var element in this.elementLocks)
		{
			if (element != elementId)
				this.unlockElement(element, userId);
		}

		var users = this.elementLocks[elementId];
		if (!users)
			users = this.elementLocks[elementId] = [];

		if (dojo.indexOf(users, userId) == -1)
		{
			users.push(userId);
			dojo.publish("/lock/element/add", [elementId, userId]);
		}
	},

	unlockElement: function(elementId, userId)
	{
		userId = userId ? userId : pe.authenticatedUser ? pe.authenticatedUser.getId() : null;
		if (!userId)
			return;

		var me = this;
		var users = this.elementLocks[elementId];
		var deleted = false;

		if (users)
		{
			// the user does not select the slide, remove it if exist;
			var index = dojo.indexOf(users, userId);
			if (index > -1)
			{
				users.splice(index, 1);
				deleted = true;
			}
			if (users.length == 0)
				delete this.elementLocks[elementId];
		}

		if (deleted)
			dojo.publish("/lock/element/remove", [elementId, userId]);
	},

	updateLockOnSlideSelected: function(userId, slideIds)
	{
		var me = this;
		var slideLocks = this.slideLocks;
		var changed = false;
		dojo.forEach(slideIds, function(slideId)
		{
			var userList = slideLocks[slideId];
			if (!userList)
				userList = slideLocks[slideId] = [];

			if (dojo.indexOf(userList, userId) == -1)
			{
				userList.push(userId);
				changed = true;
			}
		});

		for ( var slide in slideLocks)
		{
			var users = slideLocks[slide];
			if (users && dojo.indexOf(slideIds, slide) < 0)
			{
				// the user does not select the slide, remove it if exist;
				var index = dojo.indexOf(users, userId);
				if (index > -1)
					users.splice(index, 1);
				if (users.length == 0)
					delete slideLocks[slide];
				changed = true;
			}
		}
		if (changed)
			dojo.publish("/lock/slides/updated", [slideIds]);
	}
});

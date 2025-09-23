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

dojo.provide("concord.util.touchEvents");


concord.util.touchEvents.evtTypes = new Array();
concord.util.touchEvents.evtTypes['touchstart'] = 'mousedown';
concord.util.touchEvents.evtTypes['touchmove'] = 'mousemove';
concord.util.touchEvents.evtTypes['touchend'] = 'mouseup';

concord.util.touchEvents.lastTouch = 0;

concord.util.touchEvents.enableTouchEventsForId = function(id) {
	if(id && dojo.byId(id))
		concord.util.touchEvents.enableTouchEventsForElm(dojo.byId(id));
};


concord.util.touchEvents.enableTouchEventsForClass = function(elmClassName) {

	if (!elmClassName)
		return;
	
	var elms = dojo.query('.' + elmClassName);
	
	for(var i=0; i<elms.length; i++)
		concord.util.touchEvents.enableTouchEventsForElm(elms[i]);
	
};

concord.util.touchEvents.enableTouchEventsForElm = function(element) {

	element.ontouchstart = concord.util.touchEvents.handleTouchEvent;
	element.ontouchmove = concord.util.touchEvents.handleTouchEvent;
	element.ontouchend = concord.util.touchEvents.handleTouchEvent;
};

concord.util.touchEvents.handleTouchEvent = function(evt) {
	
	var evtType = concord.util.touchEvents.evtTypes[evt.type];
	var touch = evt.changedTouches[0];
	var touchTarget = touch.target;
	var boxContainerNode = touchTarget;

	while(!dojo.hasClass(boxContainerNode,'boxContainer'))
	{
		boxContainerNode = boxContainerNode.parentNode;
	}

	var mouseEvt = document.createEvent("MouseEvents");
	mouseEvt.initMouseEvent(
			evtType,true, true, window, 1, 	
			touch.screenX, touch.screenY, touch.clientX, 
			touch.clientY, false, false, false, false, 0, null
	);
	touchTarget.dispatchEvent(mouseEvt);
	
	if(evtType == 'mouseup')
	{
		
		var currTime = new Date().getTime();
		if(!dojo.hasClass(boxContainerNode,'resizableContainerSelected'))
		{
			evtType = 'click';
			mouseEvt = document.createEvent("MouseEvents");		
			mouseEvt.initMouseEvent(
					evtType,true, true, window, 1, 	
					touch.screenX, touch.screenY, touch.clientX, 
					touch.clientY, false, false, false, false, 0, null
			);
			boxContainerNode.dispatchEvent(mouseEvt);
		}
		else
		{
			var timeDiff = currTime - concord.util.touchEvents.lastTouch;
			if (timeDiff > 0 && timeDiff < 500)
			{
				evtType = 'dblclick';
				if(touchTarget.nodeName = '#text')
				{
					var editNode = touchTarget.parentNode;
					mouseEvt = document.createEvent("MouseEvents");
					mouseEvt.initMouseEvent(
							evtType,true, true, window, 1, 	
							touch.screenX, touch.screenY, touch.clientX, 
							touch.clientY, false, false, false, false, 0, null
					);
					editNode.dispatchEvent(mouseEvt);
				}
			}
		}
		concord.util.touchEvents.lastTouch = currTime;
	}
	
	
/*
	if(evtType == 'mousedown')
	{
		
		while(!dojo.hasClass(touchTarget,'boxContainer'))
		{
			touchTarget = touchTarget.parentNode;
		}
			
		if(!dojo.hasClass(touchTarget,'resizableContainerSelected'))
			evtType = 'click';
		
	}
	else if(evtType == 'mouseup')
	{
		var currTime = new Date().getTime();
		var timeDiff = currTime - concord.util.touchEvents.lastTouch;
		if (timeDiff > 0 && timeDiff < 500)
		{
			evtType = 'dblclick';
			if(touchTarget.nodeName = '#text')
				touchTarget = touchTarget.parentNode
		}
		concord.util.touchEvents.lastTouch = currTime;
	}
*/	

	
	
	evt.stopPropagation();
	evt.preventDefault();
	return false;
	
};

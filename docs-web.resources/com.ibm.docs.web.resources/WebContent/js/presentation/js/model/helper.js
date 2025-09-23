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

dojo.provide("pres.model.helper");
pres.model.helper = {

	hasSlidesLockedByOther: function(slides)
	{
		return dojo.some(slides, function(s)
		{
			return s.isLockedByOther();
		});
	},

	getParentElement: function(doc, id)
	{
		var ele = doc.find(id);
		if (!ele || ele instanceof pres.model.Document || ele instanceof pres.model.Slide)
			return null;
		else if (ele instanceof pres.model.Element)
			return ele;
		else if (ele.type == "content")
		{
			return ele.parent;
		}
		return null;
	},

	getParentSlide: function(doc, id)
	{
		var ele = doc.find(id);
		if (!ele || ele instanceof pres.model.Document)
			return null;
		else if (ele instanceof pres.model.Slide)
			return ele;
		else if (ele instanceof pres.model.Element)
			return ele.parent;
		else if (ele.type == "content")
		{
			return ele.parent.parent;
		}
		return null;
	}

}
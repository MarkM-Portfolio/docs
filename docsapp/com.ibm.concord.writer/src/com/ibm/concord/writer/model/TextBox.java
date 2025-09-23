package com.ibm.concord.writer.model;

import com.ibm.concord.writer.TrackChangeCleaner;
import com.ibm.concord.writer.message.MessageUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class TextBox extends Image
{
  TextBox(JSONObject jsonobj)
  {
    super(jsonobj);
  }
  
    @Override
	public boolean checkTrackChange(long time)
	{
	    Object chsObj = this.jsonobj.get("ch");
	    if (chsObj == null || chsObj instanceof String)
	      return false;
	    JSONArray chs = (JSONArray)chsObj;
		boolean deleted = isTrackDeleted(chs, time, false);
		if (deleted)
		  this.jsonobj.remove("ch");
		else
		{
			Object objs = this.jsonobj.get("txbxContent");
			if (objs != null)
			{
				JSONArray arr = (JSONArray)objs;
				TrackChangeCleaner.clean(arr, time);
				if (arr.isEmpty())
				{
					arr.add(createEmptyParagraph());
				}
				this.jsonobj.put("txbxContent", arr);
			}
		    JSONObject txbx = null;

		    Object anchor = this.jsonobj.get("anchor");
		    Object inline = this.jsonobj.get("inline");

		    if (anchor != null && anchor instanceof JSONObject)
		      txbx = (JSONObject) anchor;
		    else if (inline != null && inline instanceof JSONObject)
		      txbx = (JSONObject) inline;
		    
		    if (txbx != null)
		    {
		    	objs = txbx.get("txbxContent");
				if (objs != null)
				{
					JSONArray arr = (JSONArray)objs;
					TrackChangeCleaner.clean(arr, time);
					if (arr.isEmpty())
					{
						arr.add(createEmptyParagraph());
					}
					txbx.put("txbxContent", arr);
				}
		    }
		}
		
		return deleted;
	}

  public void setAttributes(JSONObject atts)
  {
    if (atts.containsKey("ch"))
    {
      Object c = atts.get("ch");
      if (c == null || (c instanceof String))
        jsonobj.remove("ch");
      else
        jsonobj.put("ch", c);
    }

    if (atts.containsKey("rPrCh"))
    {
      Object c = atts.get("rPrCh");
      if (c == null)
        jsonobj.remove("rPrCh");
      else
        jsonobj.put("rPrCh", c);
    }
    
    Object size = atts.get("size");
    if (size == null || !(size instanceof JSONObject))
      return;

    JSONObject jSize = (JSONObject) size;

    JSONObject txbx = null;

    Object anchor = this.jsonobj.get("anchor");
    Object inline = this.jsonobj.get("inline");

    if (anchor != null && anchor instanceof JSONObject)
      txbx = (JSONObject) anchor;
    else if (inline != null && inline instanceof JSONObject)
      txbx = (JSONObject) inline;

    // extent
    Object extent = jSize.get("extent");
    if (extent != null && extent instanceof JSONObject)
    {
      txbx.put("extent", extent);
    }

    // autofit
    JSONArray jArray = new JSONArray();
    jArray.add("graphicData");
    jArray.add("txbx");
    jArray.add("bodyPr");
    JSONObject bodyPr = MessageUtil.getJsonByPath(txbx, jArray);

    if (bodyPr != null)
    {
      // autofit
      Object autofit = jSize.get("spAutoFit");
      if (autofit != null && autofit instanceof JSONObject)
        bodyPr.put("spAutoFit", autofit);
      else
        bodyPr.remove("spAutoFit");

      // autowrap
      Object autowrap = jSize.get("autoWrap");
      if (autowrap != null && autowrap instanceof JSONObject)
        bodyPr.put("wrap", "square");
      else
        bodyPr.put("wrap", "none");
    }
  }
}

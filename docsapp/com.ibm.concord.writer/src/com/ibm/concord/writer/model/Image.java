package com.ibm.concord.writer.model;

import com.ibm.json.java.JSONObject;

public class Image extends Run {
	public Image(JSONObject jsonobj) {
		super(jsonobj);
	}

	public void setStyle(JSONObject styles) {

	}

	public void setAttributes(JSONObject atts) {
		// anchor/inline to inline/anchor
		_transform(atts);
		
		// size
		_setImageSize(atts);

	      // Description
        _setSrc(atts);

		// Description
		_setDescription(atts);
		
		// wrap type
		_setWrapType(atts);
		
		// wrap text
		_setWrapText(atts);
		
		//set link src
		
		_setLinkSrc(atts);
		
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
			if (c == null || (c instanceof String))
				jsonobj.remove("rPrCh");
			else
				jsonobj.put("rPrCh", c);
		}
	}
	
	void _setImageSize(JSONObject atts)
	{
		Object size = atts.get("size");
		if (size == null || !(size instanceof JSONObject))
			return;
		
		Object anchor = this.jsonobj.get("anchor");
		Object inline = this.jsonobj.get("inline");
			
		if (anchor != null && anchor instanceof JSONObject)
			((JSONObject)anchor).put("extent", size);
		else  if (inline != null && inline instanceof JSONObject)
			((JSONObject)inline).put("extent", size);
	}

	JSONObject getDocPr(){
		JSONObject targetObj = null;
		Object anchor = this.jsonobj.get("anchor");
		Object inline = this.jsonobj.get("inline");

		if (anchor != null && anchor instanceof JSONObject)
			targetObj = ((JSONObject) anchor);
		else if (inline != null && inline instanceof JSONObject)
			targetObj = ((JSONObject) inline);
		if (targetObj != null) {
			JSONObject docPr = (JSONObject) targetObj.get("docPr");
			if (docPr == null)
				docPr = new JSONObject();
			targetObj.put("docPr", docPr);
			return docPr;
		}
		return null;
	}
	
	void _setDescription(JSONObject atts)
	{
	  Object descr = atts.get("descr");
      if (descr == null || !(descr instanceof String))
          return;
      
      String description = (String)descr;
      
      JSONObject docPr = this.getDocPr();
      if(docPr != null)
        docPr.put("descr", description);
	}

	void _setSrc(JSONObject atts)
	{
      Object src = atts.get("url");
//      System.out.println("save url to " + src);
      if (src == null || !(src instanceof String))
          return;

      String source = (String)src;

      Object anchor = this.jsonobj.get("anchor");
      if(anchor == null || !(anchor instanceof JSONObject))
        anchor = this.jsonobj.get("inline");

      if (anchor != null && anchor instanceof JSONObject) {
        JSONObject targetObj = ((JSONObject) anchor);        
        JSONObject graphic = (JSONObject) targetObj.get("graphicData");
        if(graphic != null) {
          JSONObject pic = (JSONObject) graphic.get("pic");
          if(pic != null)
            pic.put("src", source);
        }
      }
 	}

	void _setLinkSrc(JSONObject atts )
	{
		  Object src = atts.get("src");
	      if (src == null || !(src instanceof String))
	          return;
	      JSONObject docPr = this.getDocPr();
	      if(docPr != null){
	    	 JSONObject hlinkClick = (JSONObject) docPr.get("hlinkClick");
	    	 String href =  (String)src;
	    	 if( href.equals("")){
	    		 if( hlinkClick != null )
	    			 docPr.remove("hlinkClick");
	    	 }
	    	 else {
	    		 if (hlinkClick == null){
	    			 hlinkClick = new JSONObject();
					 docPr.put("hlinkClick", hlinkClick);
				 }
	    		 hlinkClick.put("src", href);	
	    	 }
	      }
	}
	
	@Override
	public  boolean addComment(String cid, int index, int length, HintList parent) {
		//process the new line case
		if(index==0&&length==0) {
			addComment(cid);
			return true;
		}
		if (index >= getEnd() || (index + length) <= getStart())
			return false;
		else {
			addComment(cid);
		    return true;
		}	  
	}
	  
	void _setWrapText(JSONObject atts)
	{
		Object wrapText = atts.get("wrapText");
		if (wrapText == null)
			return;
		
		String strWrapText = wrapText.toString();
		if (strWrapText == null)
			return;
			
		Object anchor = this.jsonobj.get("anchor");
		if (anchor == null || !(anchor instanceof JSONObject))
			return;
		
		String WRAP[] = {"wrapSquare", "wrapTight", "wrapThrough"};
		
		for (int i = 0; i < WRAP.length; ++i)
		{
			Object wrapSquare = ((JSONObject)anchor).get(WRAP[i]);
			if (wrapSquare != null && (wrapSquare instanceof JSONObject))
				((JSONObject)wrapSquare).put("wrapText", strWrapText);
		}
	}
	
	void _transform(JSONObject atts)
	{
		Object transformObj = atts.get("transform");
		if (transformObj == null)
			return;
		
		Object anchor = ((JSONObject)transformObj).get("anchor");
		Object inline = ((JSONObject)transformObj).get("inline");
		
		if (anchor != null)
		{
			this.jsonobj.remove("inline");
			this.jsonobj.put("anchor", anchor);
		}
		else if (inline != null)
		{
			this.jsonobj.remove("anchor");
			this.jsonobj.put("inline", inline);
		}
	}
	
	void _setWrapType(JSONObject atts)
	{
		Object wrapType = atts.get("wrapType");
		if (wrapType == null)
			return;
		
		Object anchor = this.jsonobj.get("anchor");
		if (anchor == null || !(anchor instanceof JSONObject))
			return;
		
		String WRAP[] = {"wrapNone", "wrapSquare", "wrapTopAndBottom", "wrapTight", "wrapThrough"};
		
		for (int i = 0; i < WRAP.length; ++i)
		{
			Object t = ((JSONObject)anchor).get(WRAP[i]);
			if (t != null)
				((JSONObject)anchor).remove(WRAP[i]);
			
			Object wrap = ((JSONObject)wrapType).get(WRAP[i]);
			if (wrap != null)
				((JSONObject)anchor).put(WRAP[i], wrap);
		}
		
		Object behindDoc = ((JSONObject)wrapType).get("behindDoc");
		String strbehindDoc = behindDoc.toString();
		if (strbehindDoc == null)
			return;
		
		((JSONObject)anchor).put("behindDoc", strbehindDoc);
	}
	
	@Override
	int getLength(){
		return 1;
	}
}

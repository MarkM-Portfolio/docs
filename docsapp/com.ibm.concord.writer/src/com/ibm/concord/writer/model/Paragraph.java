package com.ibm.concord.writer.model;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.writer.LogPurify;
import com.ibm.concord.writer.message.Operation;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class Paragraph extends ModelObject {

	HintList children;
	
	private static final Logger LOG = Logger.getLogger(Paragraph.class.getName());
	
	public Paragraph(JSONObject jsonobj) {
		super(jsonobj);
		this.modelType = "paragraph";
		
		if( jsonobj.containsKey(Operation.FORMAT))
			children = new HintList( (JSONArray) jsonobj.get(Operation.FORMAT) );
		else
			children = new HintList( new JSONArray());
		//valid the children.
		children.checkStartandLength(0, getContent().length());
	}
	
	public List<Run> getFlatRuns()
	{
		List<Run> runs = new ArrayList<Run>();
		
		for(Run run : children)
		{
			if (run instanceof InlineObject)
			{
				runs.addAll(((InlineObject)run).getFlatRuns());
			}
			else
				runs.add(run);
		}
		
		return runs;
	}
	
	public boolean isRPRTrackDeleted(long timeAgo, boolean remove)
	{
		JSONArray rPrCh = (JSONArray) this.jsonobj.get("rPrCh");
		return isTrackDeleted(rPrCh, timeAgo, remove);
	}
	
	public static class Range {

		public int start;
		public int length;
		
		public Range(int s, int l)
		{
			this.start = s;
			this.length = l;
		}
	}
	
	
	@Override
	public boolean checkTrackChange(long timeAgo)
	{
	    JSONArray ch = (JSONArray) this.jsonobj.get("ch");
        if(isTrackDeleted(ch, timeAgo, false))
          return true;

        List<Run> flatRuns = this.getFlatRuns();
		
		Iterator<Run> iterator = flatRuns.iterator();
		List<Range> toDelete = new ArrayList<Range>();
		
		boolean isRPRDeleted = this.isRPRTrackDeleted(timeAgo, false);
		
		while (iterator.hasNext()) {
			Run hint = iterator.next();
			boolean deleteHint = hint.checkTrackChange(timeAgo);
			if (deleteHint)
			{
				toDelete.add(new Range(hint.getStart(),hint.getLength()));
			}
		}
		
		int size = toDelete.size();
		if (size > 0)
		{
			if (size == flatRuns.size())
			{
				children.clear();
				children.json.clear();
				setContent("");
			}
			else
			{
				int deleteCount = 0;
				for(int i = 0 ; i < size; i++)
				{
					Range hintRange = toDelete.get(i);
					deleteText(hintRange.start - deleteCount, hintRange.length);
					deleteCount += hintRange.length;
				}
			}
			children.checkStartandLength(0, getContent().length());
			jsonobj.put( Operation.FORMAT, children.json);
		}
			
		boolean runsAllDeleted = (size > 0 || flatRuns.isEmpty()) && children.isEmpty();

		return isRPRDeleted && runsAllDeleted;
	}
		
	@Override
	public void setStyle(JSONObject styles) {

		String tp = (String) styles.get(TP);
		if (null == tp)
			return;

		Object pPrObj = jsonobj.get(PARAGRAPHPROPERTY);
		if (null == pPrObj || !(pPrObj instanceof JSONObject)) {
			// no idea why sometimes pPrObj is a string
			if (pPrObj != null)
				LOG.log(Level.WARNING, "==Writer Paragraph set style error: pPrObj is not a JSONObject -> "  + LogPurify.purify(jsonobj));
			pPrObj = new JSONObject();
			jsonobj.put(PARAGRAPHPROPERTY, pPrObj);
		}
		
		JSONObject pPr = (JSONObject)pPrObj;
		JSONObject content = normalizeContent(pPr, tp, styles);

		for (Object key : content.keySet()) {
			pPr.remove(key);
			Object value = content.get(key);
			if (value != null && !value.equals("")) {
				pPr.put(key, content.get(key));
			}
		}
		
		// For paragraph's text property
		if(tp.equalsIgnoreCase(PARAGRA_TEXT_PROPERTY_VALUE))
		{
	        jsonobj.remove(PARAGRA_TEXT_PROPERTY_KEY);
	        Object obj = styles.get("s");
	        if(obj != null && obj instanceof JSONObject)
	        {
	          JSONObject textStyle = (JSONObject) obj ;
    	      if(textStyle != null)
    	         jsonobj.put(PARAGRA_TEXT_PROPERTY_KEY, (JSONObject) textStyle);
	        }
		}
	}

	private JSONObject normalizeContent(JSONObject pPr, String tp,
			JSONObject styles) {
		JSONObject content = new JSONObject();
		if (tp.toLowerCase().trim().equals(ALIGN)) {
			String alignment = getAlign(styles);
			content.put(ALIGN, alignment);
		}else if(tp.trim().equals(WIDOWCONTROL))
		{
			String widowControl = getWidowControl(styles);
			if(widowControl != null && !widowControl.equals("none")){
				JSONObject wc = new JSONObject();
				wc.put("val", widowControl.equals("true")  ? "1" : "0");
				content.put(WIDOWCONTROL, wc);
			}
			else 
				pPr.remove(WIDOWCONTROL);
			
		}else if(tp.trim().equals(PAGEBREAKBEFORE))
		{
			String pageBreakBefore = getPageBreakBefore(styles);
			JSONObject wc = new JSONObject();
			if(pageBreakBefore != null && !pageBreakBefore.equals("none")){
				wc.put("val", pageBreakBefore.equals("true") ? "1" : "0");
				content.put(PAGEBREAKBEFORE, wc);
			}
			else 
				pPr.remove(PAGEBREAKBEFORE);
			
		}else if(tp.trim().equals(KEEPLINES))
		{
			String keepLines = getKeepLines(styles);
			if(keepLines!= null && !keepLines.equals("none")){
				JSONObject wc = new JSONObject();
				wc.put("val", keepLines.equals("true")  ? "1" : "0");
				content.put(KEEPLINES, wc);
			}
			else 
				pPr.remove(KEEPLINES);
		}else if (tp.toLowerCase().trim().equals(DIRECTION)) {
			content.put(DIRECTION, ((String) styles.get(DIRECTION)));
		} else if (tp.toLowerCase().trim().equals(LINESPACING)) {
			JSONObject sp = (JSONObject) pPr.get(space);
			if (null == sp)
				sp = new JSONObject();
			else
				sp = (JSONObject) sp.clone();
			String lineRule = getLineRule(styles);
			String line = getLine(styles);
			content.put(space, sp);
			String oldLineRule = (String) sp.get(LINERULE);			
			
			if (null != lineRule ){
			  if("none".equals(lineRule))
			  {
			    sp.remove(LINERULE);
			    sp.remove(LINE);
			  }else{
			    sp.put(LINERULE, lineRule);
			    if(null != line)
			      sp.put(LINE, line);
			  }
			}else{
			    if(null != oldLineRule && null != line)
			      sp.put(LINE, line);
			    else
			    {
    				sp.remove(LINERULE);
    				sp.remove(LINE);
			    }
			}
		} 
		else if( tp.toLowerCase().trim().equals(space)){
			JSONObject sp = (JSONObject) pPr.get(space);
			if (null == sp)
				sp = new JSONObject();
			else
				sp = (JSONObject) sp.clone();

			String spaceAfter = (String) styles.get(AFTER);
			if( spaceAfter != null ){
			  if(spaceAfter.toLowerCase().trim().equals("none"))
			    sp.remove(AFTER);
			  else
				sp.put(AFTER, spaceAfter);
			}

			String spaceBefore = (String) styles.get(BEFORE);
			if( spaceBefore != null ){
              if(spaceBefore.toLowerCase().trim().equals("none"))
                sp.remove(AFTER);
              else			  
				sp.put(BEFORE, spaceBefore);
			}
			content.put(space, sp);
		}
		else if (tp.toLowerCase().trim().equals(BORDER)) {
			Object border = styles.get(BORDER);
			if (border == null)
			{
				pPr.remove(PBDR);
			}
			else if (border instanceof String)
			{
				String str = (String)border;
				if (str.length() == 0 || str.equals("none"))
					pPr.remove(PBDR);
			}
			else
				content.put(PBDR, border);
		} 
		else if (tp.toLowerCase().trim().equals(BACKGROUNDCOLOR.toLowerCase())) {
			Object bg = styles.get(BACKGROUNDCOLOR);
			if (bg == null)
			{
				pPr.remove(PSHD);
			}
			else if (bg instanceof String)
			{
				String str = (String)bg;
				if (str.length() == 0 || str.equals("none"))
					pPr.remove(PSHD);
			}
			else
				content.put(PSHD, bg);
		} else if (tp.toLowerCase().trim().equals(METATYPE)) {
			content = (JSONObject) styles.get(CONTENT);

		} else if (tp.toLowerCase().trim().equals(INDENT)) {

		  JSONObject indentJson = (JSONObject) pPr.get(INDENT);
          if (null == indentJson)
              indentJson = new JSONObject();
          else
              indentJson = (JSONObject) indentJson.clone();
          
          // Indent.left; indent.specialKey, indent.specialVal
			if(null != styles.get("specialkey"))
			{
			  String key = (String)styles.get("specialkey");
              String val = String.valueOf(styles.get("specialvalue"));
              if (val != null && val.equals("none"))
              {
                indentJson.remove("hanging");
                indentJson.remove("firstLine");
              }
              else
                indentJson.put(key, val);
			}
			
			if(null != styles.get("left"))
			{
			  String key = "left";
			  String val = (String)styles.get("left");
			  
			  if (val != null && val.equals("none"))
                indentJson.remove(key);
			  else
                indentJson.put(key, val);
			}
			
			 content.put(INDENT, indentJson);
		}
		else if(tp.equals(INDENT_RIGHT))
		{
		  Object right = styles.get("right");
          right = String.valueOf(right);
          JSONObject indentJson = (JSONObject) pPr.get(INDENT);
          if (null == indentJson)
              indentJson = new JSONObject();
          else
              indentJson = (JSONObject) indentJson.clone();
          if ("none".equals(right))
              indentJson.remove("right");
          else
              indentJson.put("right", right);
          content.put(INDENT, indentJson);
		}
		else if(tp.equals(NUMPR))
		{
			Object numIdVal = styles.get(NUMID);
			Object iLvlVal = styles.get(ILVL);
			JSONObject numPr = (JSONObject)pPr.get(tp);
			if(null == numPr)
				numPr = new JSONObject();
			else
				numPr = (JSONObject)numPr.clone();

			JSONObject numId = (JSONObject)numPr.get(NUMID);
			JSONObject iLvl = (JSONObject)numPr.get(ILVL);
			if(null != numIdVal )
			{
				if( !numIdVal.toString().equals("none"))
				{
					if(null == numId)
					{
						numId = new JSONObject();
						numPr.put(NUMID, numId);
					}
					numId.put(VAL, numIdVal);
				}
				else
					numPr.remove(NUMID);
			}
			if(null != iLvlVal )
			{
				if(!iLvlVal.toString().equals("none")){
					if(null == iLvl)
					{
						iLvl = new JSONObject();
						numPr.put(ILVL, iLvl);
					}
					iLvl.put(VAL, iLvlVal);
				}
				else
					numPr.remove(ILVL);
			}
			content.put(NUMPR, numPr);
		}
		else if(tp.equalsIgnoreCase(SET_STYLE))
		{
		  String styleId = (String) styles.get(STYLEID);
		  if(styleId != null && styleId.length() > 0 && !styleId.equals("none"))
		    pPr.put(STYLEID, styleId);
		  else
		    pPr.remove(STYLEID);
		}
		else if(tp.equalsIgnoreCase(SECTIONID))
		{
			  String secId = (String) styles.get(SECTIONID);
			  if(secId != null && secId.length() > 0)
			    pPr.put(SECTIONID, secId);
			  else
			    pPr.remove(SECTIONID);
		}
		return content;
	}

	private String getLine(JSONObject styles) {
		Object l = styles.get(LINE);
		if (l == null)
			return null;
		String line = l.toString().toLowerCase().trim();
		if (null == line || line.equals("none"))
			line = null;
		return line;
	}

	
	private String getLineRule(JSONObject styles) {
		String lineRule = null;
		if(styles.containsKey(LINERULE))
		{
			lineRule = ((String) styles.get(LINERULE)).toLowerCase()
			.trim();
			if (null == lineRule || lineRule.equals(""))
				lineRule = null;
			else if(lineRule.equals("none"))
			  lineRule = "none";
			else if (lineRule.equals("relative"))
				lineRule = "auto";
			else if (lineRule.equals("absolute"))
				lineRule = "exact";
		}
		return lineRule;
	}

	private String getAlign(JSONObject styles) {
		String alignment = ((String) styles.get(ALIGN)).toLowerCase()
				.trim();
		if (alignment.equals("justified"))
			alignment = "both";
		else if (alignment.equals("centered"))
			alignment = "center";
		else if (alignment.equals("none"))
			alignment = null;
		return alignment;
	}
	
	private String getWidowControl(JSONObject styles) {
		Object obj = styles.get(WIDOWCONTROL);
		if (obj == null)
			return null;
		return obj.toString().trim();
	}
	
	private String getPageBreakBefore(JSONObject styles) {
		Object obj = styles.get(PAGEBREAKBEFORE);
		if (obj == null)
			return null;
		return obj.toString().trim();
	}
	
	private String getKeepLines(JSONObject styles) {
		Object obj = styles.get(KEEPLINES);
		if (obj == null)
			return null;
		return obj.toString().trim();
	}
	
	public final static String TP = "type";
	public final static String PARAGRA_CH="ch";
	public final static String PARAGRA_PROPERTY_CH="pPrCh";
	public final static String PARAGRA_TEXT_PROPERTY_CH="rPrCh";
	public final static String PARAGRAPHPROPERTY="pPr";
	public final static String PARAGRAPHPROPERTY_VALIE="pr";
	public final static String ALIGN = "align";
	public final static String WIDOWCONTROL = "widowControl";
	public final static String PAGEBREAKBEFORE = "pageBreakBefore";
	public final static String KEEPLINES = "keepLines";
	public final static String PBDR = "pBdr";
	public final static String BORDER = "border";
	public final static String PSHD = "shd";
	public final static String BACKGROUNDCOLOR = "backgroundColor";
	public final static String SET_STYLE = "style";
	public final static String INDENT = "indent";
	public final static String INDENT_RIGHT = "indentRight";
	public final static String LINESPACING = "linespacing";
	public final static String space = "space";
	public final static String LINERULE = "lineRule";
	public final static String LINE = "line";
	public final static String METATYPE = "meta";
	public final static String CONTENT = "content";
	public final static String FIRSTLINE = "firstLine";
	public final static String NUMPR = "numPr";
	public final static String NUMID = "numId";
	public final static String ILVL = "ilvl";
	public final static String VAL = "val";
	public final static String STYLEID = "styleId";
	public final static String SECTIONID = "secId";
	public final static String DIRECTION = "direction";
	public final static String AFTER = "after";
	public final static String BEFORE = "before";
	public final static String PARAGRA_TEXT_PROPERTY_KEY = "rPr"; 
	public final static String PARAGRA_TEXT_PROPERTY_VALUE = "pt";  // Set the paragrah's list style
	@Override
	public void setAttributes(JSONObject atts) {
		String tp = (String) atts.get(TP);
		if(tp != null && tp.equalsIgnoreCase(PARAGRA_PROPERTY_CH))
		{
			if (atts.containsKey("ch"))
			{
			    Object chObj = atts.get("ch");
				JSONArray pPrCh = (JSONArray) jsonobj.get(PARAGRA_PROPERTY_CH);
				if (pPrCh == null)
				{
					pPrCh = new JSONArray();
					jsonobj.put(PARAGRA_PROPERTY_CH, pPrCh);
				}
				pPrCh.clear();
				if (chObj != null && (!(chObj instanceof String)))
				  pPrCh.addAll((JSONArray) chObj);
				else
				  jsonobj.remove(PARAGRA_PROPERTY_CH);
			} else if (jsonobj.get(PARAGRA_PROPERTY_CH) != null) {
				jsonobj.remove(PARAGRA_PROPERTY_CH);
			}
		}
		else if(tp != null && tp.equalsIgnoreCase(PARAGRA_CH))
        {
            if (atts.containsKey("ch"))
            {
                Object chObj = atts.get("ch");
                JSONArray ch = (JSONArray) jsonobj.get(PARAGRA_CH);
                if (ch == null)
                {
                    ch = new JSONArray();
                    jsonobj.put(PARAGRA_CH, ch);
                }
                ch.clear();
                if (chObj != null && (!(chObj instanceof String)))
                  ch.addAll((JSONArray) chObj);
                else
                  jsonobj.remove(PARAGRA_CH);
            } else if (jsonobj.get(PARAGRA_CH) != null) {
            	jsonobj.remove(PARAGRA_CH);
            }
        }
		else if(tp != null && tp.equalsIgnoreCase(PARAGRA_TEXT_PROPERTY_CH))
		{
			if (atts.containsKey("ch"))
			{
			    Object chObj = atts.get("ch");
				JSONArray rPrCh = (JSONArray) jsonobj.get(PARAGRA_TEXT_PROPERTY_CH);
				if (rPrCh == null)
				{
					rPrCh = new JSONArray();
					jsonobj.put(PARAGRA_TEXT_PROPERTY_CH, rPrCh);
				}
				rPrCh.clear();
				if (chObj != null && (!(chObj instanceof String)))
					rPrCh.addAll((JSONArray) chObj);
				else
                  jsonobj.remove(PARAGRA_TEXT_PROPERTY_CH);
			} else if(jsonobj.get(PARAGRA_TEXT_PROPERTY_CH) != null){
				jsonobj.remove(PARAGRA_TEXT_PROPERTY_CH);
			}
		}
	}

	public List<Run> getChildren() {
		// TODO Auto-generated method stub
		return children;
	}
	
	public String getContent(){
	  String content = (String) jsonobj.get("c");
	    if (content == null)
	      content = "";
	  return content;
	}
	
	public void setContent( String content){
		jsonobj.put("c", content);
	}
	/**
	 * used for insert text operation
	 * @param text
	 * @param index
	 * @param format
	 */
	public void insertText(String text, int index, JSONArray format) {
    if (index >= 0)
    {
      // Add Text
      String content = getContent();
      if (index > content.length())
      {
        index = content.length();
      }
      
      HintList insertCnt = new HintList(format);
      insertCnt.checkStartandLength(index, text.length());
      children.insertRuns(index, insertCnt);
      
      content = content.substring(0, index) + text + content.substring(index);

      setContent(content);
    }

    jsonobj.put(Operation.FORMAT, children.json);
	}
	/**
	 * get current json 
	 */
	public JSONObject getJson(){
		 jsonobj.put( Operation.FORMAT, children.json);
		 return jsonobj;
	}
	/**
	 * used for delete text operation
	 * @param index
	 * @param length
	 */
	public void deleteText(int index, int length) {
		 if( index >= 0 && length >=0 )
		 {
			 children.remove( index, length );
			 String content = getContent();
			 if(content.length() < index + length)
			 {
			   if(content.length() <= index)
			     index = content.length();
			   length = content.length() - index;
			 }
		     content = content.substring(0, index) + content.substring(index + length);
		     setContent(content);
		     children.checkStartandLength(0, this.getContent().length());
		 }
		 
		 jsonobj.put( Operation.FORMAT, children.json);
	}
	public void setTaskId(String tid) {
		jsonobj.put("taskId", tid);
	}
	public void delComment(String cid) {
		children.delComment(cid);
		jsonobj.put( Operation.FORMAT, children.json);
	}
	
	public void addComment(String cid, int c_t, int index, int length) {
		children.addComment( cid, index, length);
		jsonobj.put( Operation.FORMAT, children.json);
	}
	
	public void appendResponseComment(String cid, String cpid, String rcid) {
		children.appendResponseComment( cid, cpid, rcid);
	}
	
	public void setStyle(int index, int length, JSONObject styles) {
		// TODO Auto-generated method stub
		children.setStyle( index ,length,  styles );
		jsonobj.put( Operation.FORMAT, children.json);
	}
	
	public void setAttribute(int index, int length, JSONObject attrs) {
		// TODO Auto-generated method stub
		children.setAttributes( index ,length, attrs);
		jsonobj.put( Operation.FORMAT, children.json);
	}

	public void removeStyle()
	{
		children.removeStyle();
		jsonobj.put( Operation.FORMAT, children.json);
	}

	public void deleteById(String oid) {
		Run run = children.byId( oid );
		if( run != null )
		{
			children.removeRun(run);
			jsonobj.put( Operation.FORMAT, children.json);
		}
	}
	
	public void merge(Paragraph para)
	{
		int size = this.children.size();
		Run last;
		if (size > 0)
		{
	        last = this.children.get(this.children.size() - 1);
	        // remove the empty run at the last of para
	        if (last.getModelType().equals(Run.TEXT) && last.getLength() == 0) {
	        	this.children.removeRun(last);
	        	if (!this.children.isEmpty())
	        		last = this.children.get(this.children.size() - 1);
	        	else
	        		last = null;
	        }
		}
        
        this.children.checkStartandLength(0, this.getContent().length());
        
		HintList hintList = (HintList) para.getChildren();
		Iterator<Run> iterator = hintList.iterator();
		if (iterator.hasNext())
		{
			Run run = iterator.next();
			if (run instanceof BookMark)
				iterator.remove();
		}
		
		hintList.checkStartandLength(0, para.getContent().length());
		
		this.children.addAllRuns(hintList, true);
		
		this.setContent(this.getContent() + para.getContent());
		
		this.children.checkStartandLength(0, this.getContent().length());
		
		jsonobj.put( Operation.FORMAT, children.json);
		
		jsonobj.put("rPrCh", para.getJson().get("rPrCh"));
		
		
	}

}

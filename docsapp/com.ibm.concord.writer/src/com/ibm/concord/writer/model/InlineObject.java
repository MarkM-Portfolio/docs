package com.ibm.concord.writer.model;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;

import com.ibm.concord.writer.message.Operation;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public abstract class InlineObject extends Run {
	
	HintList children;

	InlineObject(JSONObject jsonobj) {
		super(jsonobj);
		children = new HintList( (JSONArray) jsonobj.get(Operation.FORMAT) );
		
		//check start and length
		if( !children.isEmpty() ){
			Run firstChild = children.get(0);
			int start = getStart();
			if( firstChild.getStart()!= start  ){
				firstChild.setStart(start);
				children.correctStart(0, start);
			}
		}
		children.checkStartandLength(getStart(), getLength());
	}
		
	@Override
	boolean setAttributes(int index, int length, JSONObject styles,
			HintList hintList) {
		if (length <= 0 || index >= getEnd() || (index + length) <= getStart())
			return false;
		else {
			children.setAttributes(index, length, styles);
			jsonobj.put(Operation.FORMAT, children.json);
			return true;
		}
	}

	public String getId(){
		Object id =  jsonobj.get("id") ;
		if( id == null )
			return "";
		else
			return id.toString();
	}
	
	public void setId( String id ){
		jsonobj.put("id", id );
	}
	
	@Override
	public void setStart( int start ){
		int oldStart = getStart();
		if( oldStart != start ){
			jsonobj.put("s", String.valueOf(start) );
			int offset = start - oldStart;
			Iterator<Run > iter = children.iterator();
			while( iter.hasNext())
			{
				Run run = iter.next();
				run.setStart(run.getStart()+offset);
			}
		}
	}

	@Override
	boolean merge(Run run , int index ) {
		if( isSameObject( run ))
		{
			InlineObject other = (InlineObject) run;
			int length = other.getLength();
			if( index == -1 )// append	
				children.addAllRuns( other.getChildren(), true);
			else if ( index == 0 )
				children.addAllRuns( 0,  other.getChildren(), true );
			else
			{
				JSONArray format = (JSONArray) run.getFormats();
				children.insertRuns(index, new HintList( format ));
			}
			
			setLength( getLength() + length );
			jsonobj.put( Operation.FORMAT, children.json);
			return true;
		}
		else
			return false;
	}
	
	@Override
	public void remove(int index, int length) {
		 if( length <=0 )
			 return;
		 children.remove( index, length );
		 
		 super.remove(index, length);
		 jsonobj.put( Operation.FORMAT, children.json);
		 
	}
	@Override
	public  boolean addComment(String cid, int index, int length, HintList parent) {
		if( length <=0 ||index >= getEnd()|| ( index + length )<= getStart() )
			return false;
		else
		{
			children.addComment(cid, index ,length);
			jsonobj.put( Operation.FORMAT, children.json);
			return true;
		}
	}
	
	/* (non-Javadoc)
	 * @see com.ibm.concord.writer.message.impl.Run#setStyle(int, int, com.ibm.json.java.JSONArray, com.ibm.concord.writer.message.impl.HintList)
	 */
	@Override
	public  boolean setStyle(int index, int length, JSONObject styles, HintList parent ) {
		if( length <=0 ||index >= getEnd()|| ( index + length )<= getStart() )
			return false;
		else
		{
			children.setStyle( index ,length,  styles );
			jsonobj.put( Operation.FORMAT, children.json);
			return true;
		}
		
	}
	@Override
	public void removeStyle() {
		children.removeStyle();
		jsonobj.put( Operation.FORMAT, children.json);
	}
	
	public Run split(int index, HintList parent) {
		if( index <= getStart() || index >= getEnd() )
			return null;
		
		InlineObject splited = (InlineObject) ModelObject.createModelObject((JSONObject) jsonobj.clone());
		int len = index - this.getStart();
		int length = this.getLength();
		splited.setChildren( children.split( index, this ) );
		splited.jsonobj.put("s", index);
		splited.jsonobj.put("l",  length - len);
		splited.setLength(  length - len );
		this.setLength(  len );
		jsonobj.put("l",  len);

		jsonobj.put( Operation.FORMAT, children.json);

		 if (parent != null)
		      parent.addRun(parent.indexOf(this) + 1, splited, false);
		return splited;
	}
	
	protected boolean isSameObject(Run obj) {
		
	if ( obj instanceof  InlineObject ) {
		InlineObject other = (InlineObject) obj;
		String runType = getType();
		String otherType = other.getType();
		String id = getId();
		String otherId = other.getId();
		return runType != null && otherType != null && id != null && otherId != null && runType.equalsIgnoreCase(otherType)
				&& id.equals(otherId);
	} else
		return false;
	}

	public void setChildren( HintList children ){
		this.children = children;
		jsonobj.put( Operation.FORMAT, children.json);
	}
	public HintList getChildren() {
		return children;
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
}

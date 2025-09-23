package com.ibm.concord.writer.model;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.ListIterator;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author wangxum
 *
 */
@SuppressWarnings("serial")
public class HintList extends ArrayList<Run> {

	JSONArray json;
	private static final Logger LOG = Logger.getLogger(HintList.class.getName());

	/**
	 * @param attributes
	 */
	HintList(JSONArray attributes ) {
		json = attributes;
		
		if (json == null)
			json = new JSONArray();

		for (int i = 0; i < json.size(); i++) {
			JSONObject attribute = (JSONObject) json.get(i);
			ModelObject obj = ModelObject.createModelObject(attribute);
			if (obj == null)
			{
				json.remove(i);
				i--;
				continue;
			}
			if (!(obj instanceof Run))
				continue;
			Run run = (Run) obj;
			super.add(run);
		}
		
	}
	/**
	 * check start and length 
	 * @param start
	 * @param length
	 */
	void checkStartandLength( int start, int length ){
		if( !isEmpty() ){
			if( length == 0 ){
				for( int i =0 ; i< size(); i++ ){
					Run run = get(i);
					if( !run.isBookMark()){
						removeRun( run );
					}
				}
			}
			else{
				Run firstChild = get(0);
				if( firstChild.getStart()!= start  ){
					firstChild.setStart(start);
					correctStart(0, start );
				}
				Run lastChild = get( size() - 1 );
				int end = lastChild.getEnd();
				int index = lastChild.getStart();
				while( index > start + length ){
					removeRun(lastChild);
					if( isEmpty())
						return;
					else{
						lastChild = get( size() - 1 );
						end = lastChild.getEnd();
						index = lastChild.getStart();
					}
				}
				if( end != start + length ){
					lastChild.setLength( start+ length - lastChild.getStart()  );
				}
				int firstEnd = firstChild.getEnd();
				for( int i = 1 ; i < size(); i++ ){
                  Run run = get(i);
                  if (run.getStart() != firstEnd)
                  {
                    run.setStart(firstEnd);
                    correctStart(i, firstEnd );
                    break;
                  } 
                  firstEnd = run.getEnd();
                }
			}
		}
	}
	
	private int getJsonLocation(int location){	
		int count = -1;
		for (int i = 0; i < json.size(); i++) {
			JSONObject attribute = (JSONObject) json.get(i);
			ModelObject obj = ModelObject.createModelObject(attribute);
			if (obj == null)
				continue;
			if (!(obj instanceof Run))
				continue;
			count++;
			if(count == location)
				return i;
		}		
		return json.size();
	}

	/**
	 * @param list
	 * @param merge
	 */
	public void addAllRuns( HintList list , boolean merge ) {
		addAllRuns( size(), list, merge );
	}

	/**
	 * Merge same styles object in list
	 * @param list
	 * @return
	 */
	private HintList normalizeList(HintList list)
	{
	  if(list.isEmpty())
	    return list;
	  
	  ListIterator<Run> it = list.listIterator();
	  Run curRun = it.next();
	  Run nextRun = null;
	  ArrayList<Run> mergedRun = new ArrayList<Run>();
	  while( curRun != null && it.hasNext())
	  {
	    nextRun = it.next();
	    if(nextRun == null)
	      break;
	    if(curRun.merge(nextRun, 0))
	      mergedRun.add(nextRun);
	    else
	      curRun = nextRun;
	  }
	  
	  it = mergedRun.listIterator();
	  while(it.hasNext())
	  {
	    curRun = it.next();
	    list.removeRun(curRun);
	  }
	  
	  return list;
	}
	
	/**
	 * @param location
	 * @param list
	 * @param merge
	 * @return
	 */
	public boolean addAllRuns(int location, HintList list, boolean merge) {

		if (list.isEmpty())
			return false;
		
		list = normalizeList(list);

		Run preRun = null, nextRun = null;
		if (location > 0)
			preRun = get(location - 1);
		if( location < size() )
			nextRun = get(location);

		Run firstRun = list.get(0);
		boolean isPreMerged = false;
		if (preRun != null && preRun.merge(firstRun, -1)) {
			list.removeRun(firstRun);
			firstRun = preRun;   // Start correct run position 
			isPreMerged = true;
		}

		if (!list.isEmpty()) {
			Run lastRun = list.get( list.size() - 1);
			if (nextRun != null && nextRun.merge(lastRun, 0))
			{
			  list.removeRun(lastRun);
			  if(!isPreMerged && list.isEmpty())
			    firstRun = nextRun;  // Start correct run position 
			}
		}
		if(!list.isEmpty()){
    		super.addAll(location, list);
    		json.addAll(getJsonLocation(location),list.json);
		}
		
		int start = firstRun.getStart();
		if( start < 0  )
			start = 0;
		
		correctStart(location - 1, start);
		return true;
	}
	
	
	/**
	 * @param location : where to insert
	 * @param run :  to be inserted
	 * @param merge: merge previous/next run ?
	 */
	public void addRun(int location, Run run, boolean merge ) {
		
		Run preRun = null, nextRun = null;
		if( merge )
		{
			if (location > 0)
				preRun = this.get(location - 1);
			nextRun = this.get(location);
		}

		if (preRun == null || !preRun.merge(run, -1 )) {
			// not merged in preRun
			if (nextRun == null || !nextRun.merge(run, 0 )) {
				// not merged in nextRun
				// insert to list
				super.add(location, run);
				json.add(getJsonLocation(location), run.getJson());
			}
		}
		correctStart(location - 1,  -1);
	}
	
	/**
	 * @param run
	 * 	to be inserted
	 * @param merge
	 * 	 merge previous/next run ?
	 * @return
	 */
	public void addRun(Run run, boolean merge ) {
		addRun( size(), run, merge );
	}
	
	/**
	 * @param index
	 * @return
	 */
	public Run byIndex(int index) {
		Iterator<Run> iter = this.iterator();
		Run run, ret = null;
		while ((ret == null) && iter.hasNext()) {
			run = iter.next();
			if( run.isBookMark()){
				continue;
			}
			ret = run.byIndex(index);
		}
		return ret;
	}

	/*
	 * Correct children runs's start
	 */
	protected void correctStart(int fromLocation , int defaultStart  ) {
		
		if (this.isEmpty())
			return;
		int start = -1;
		Run preRun, nextRun;
		if (fromLocation < 0)
		{
			fromLocation = -1 ;
			if( defaultStart == -1 )
				defaultStart = get(0).getStart();
		}
		else
		{
			preRun = this.get(fromLocation);
			if (preRun == null)
				return;
			start = preRun.getEnd();
		}
		if( start < 0 )
			start = defaultStart;
	
		int i = fromLocation + 1;
		
		while (i < this.size()) {
			nextRun = this.get(i);
			while( nextRun!= null && nextRun.getLength()<0){
				removeRun(i);
				nextRun = this.get(i);
			}
			if( nextRun == null )
				break;
			nextRun.setStart(start);
			start += nextRun.getLength();
			i++;
		}
	}
	/*
	 * insert runs
	 * will be merged wither previous run or next run if needed
	 * index: the character index 
	 */
	public void insertRuns(int index, HintList runs) {
		Run run = byIndex( index );
 	    if( run == null ){
 	    //append
 	    	addAllRuns( runs, true );
 	    }
 	    else if ( index == run.getStart())
 	    { //insert into before run
 	    	addAllRuns( indexOf(run),runs, true );
 	    }
 	    else 
 	    {
 	    	if( runs.isEmpty())
 	    		return;
 	    	
 	    	Run targetRun = run;
 	    	int len;
 	    	for( int i =0 ; i< runs.size(); i++ ){
 	    		len = runs.get(i).getLength();
 	    		targetRun = addRun( index, targetRun, runs.get(i));
 	    		index += len;
 	    	}
 	    	correctStart( indexOf(run), -1 );
 	    }
	}
	
	private Run addRun( int index, Run run, Run insertRun ){
		
    	if( run.merge( insertRun, index )){
    		return run;
    	}
    	else{
    		Run newRun = run.split( index, this );
	    	if( newRun != null )
	    		run = newRun;
	    	addRun( indexOf( run ), insertRun, false );
	    	return insertRun;
    	}
	}

	public Run removeRun( int location )
	{
		json.remove( get(location).jsonobj);
		return super.remove(location);
	}

	public Run removeRun( Run run )
	{
		json.remove(run.jsonobj);
		super.remove(run);
		return run;
	}

	public HintList split(int index, Run parent) {
		Run run = byIndex( index );
		if( run == null)
			return null;
		HintList split = new HintList( new JSONArray());
		
		if( index != run.getStart()){
			split.addRun(removeRun(run.split(index, this )), false);
			int location = indexOf(run);
			for( int i = location + 1 ;i < this.size(); i++ )
				split.addRun( removeRun(location + 1), false);
		}else{
			int location = indexOf(run);
			int size =  this.size();
			for( int i = location  ;i < size; i++ )
				split.addRun( removeRun(location ), false);
		}
	
		return split;
	}
	
	public void remove(int index, int length) {
		Run startRun =  byIndex( index );
		if (startRun != null)
		{
			if( !startRun.isBookMark() &&  length <= 0 )
				return;
		}
		
		Run endRun = byIndex( index + length );

		int startL = indexOf( startRun );
		int endL = ( endRun != null )? indexOf( endRun ): size();
		
		for( int i= endL-1; i> startL; i-- ){
		//do not remove book mark in the right end
			if( get(i).isBookMark() ){
				if( i== ( size()-1 ) || get( i+1 ).getStart() == (index + length) )
				{
					endL=i;
					continue;
				}
			}
			break;
		}
		
		if (this.size() == 0)
		{
			LOG.log(Level.WARNING, "==HintList remove, but no hint in it -> "  + "index : " + index + " length : " + length);
			return;
		}
		
		int start = get(0).getStart();
		//remove runs
		for( int i = startL+1 ; i < endL; i++ ){
			removeRun( startL+1  );
		}
		
		
		if(startRun != null){
			if( index == startRun.getStart() && length >= startRun.getLength())
			//remove start run
			{
				removeRun( startL );
				correctStart( startL -1 , start );
			}
			else
			{
				startRun.remove( index , length );
				if( endRun != startRun && endRun != null )
					endRun.remove(  index, length );
				correctStart( startL, start );
			}
		}
	}

	public void delComment(String cid) {
		for (int n=json.size()-1;n>=0;n--) {
			JSONObject run = (JSONObject) json.get(n);
			String comment_id = (String) run.get("id");
			if(comment_id!=null) {
				if(comment_id.equals(cid)){
					json.remove(n);
				}
			}
		}
		for( int i =size()-1 ; i>=0; i-- ){
			Run run = get(i);
			JSONArray cl = (JSONArray) run.jsonobj.get("cl");
			if(cl!=null) {
				for(int j=cl.size()-1;j>=0;j--){
					String cl_id = (String) cl.get(j);
					if(cl_id.equals(cid)){
						cl.remove(j);
					} 
						
				}
			}
		}
	}
		
	public void addComment(String cid, int index, int length) {
		for( int i =0 ; i< size(); i++ )
		{
			Run run = get(i);
			run.addComment(cid,index, length, this);
		}
	}
	
	public void appendResponseComment(String cid, String cpid, String rcid) {
		// append reply comment after referred comment id
		if (rcid == null || rcid.length() == 0)
			rcid = cpid;
		for( int i = size() - 1 ; i >= 0; i-- ){
			Run run = get(i);
			JSONArray cl = (JSONArray) run.jsonobj.get("cl");
			if(cl != null) {
				for(int j=cl.size()-1;j>=0;j--){
					String cl_id = (String) cl.get(j);
					if(cl_id.equals(rcid)){
						cl.add(j+1, cid);
						break;
					} 
				}
			}
		}
	}
	
	public void setStyle(int index, int length, JSONObject styles) {
		for( int i =0 ; i< size(); i++ )
		{
			Run run = get(i);
			run.setStyle(index, length, styles, this);
		}
	}

	public void removeStyle() {
		Iterator<Run> iter = this.iterator();
		Run run = null;
		while ( iter.hasNext()) {
			run = iter.next();
			run.removeStyle();
		}
		
	}
	public Run byId(String oid) {
		// TODO Auto-generated method stub
		Iterator<Run> iter = this.iterator();
		Run run, ret = null;
		while ((ret == null) && iter.hasNext()) {
			run = iter.next();
			if( run.getId().equals( oid ) )
				return run;
			ret = run.byId( oid );
		}
		return ret;
	}
	
	public void setAttributes(int index, int length, JSONObject attrs) {
		for( int i =0 ; i< size(); i++ )
		{
			Run run = get(i);
			run.setAttributes(index, length, attrs, this);
		}
	}
}

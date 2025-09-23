/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

//package com.ibm.concord.collaboration.revision;
//
//import java.io.IOException;
//import java.util.ArrayList;
//import java.util.Calendar;
//import java.util.Collection;
//import java.util.Date;
//import java.util.List;
//import java.util.logging.Level;
//import java.util.logging.Logger;
//
//import com.ibm.concord.platform.docsession.DocumentSession;
//import com.ibm.concord.platform.docsession.Participant;
//import com.ibm.concord.platform.document.AbstractDraftDocument;
//import com.ibm.concord.spi.beans.DocumentBean;
//import com.ibm.json.java.JSONArray;
//import com.ibm.json.java.JSONObject;
//
//public class RevisionManager {
//	class Revision {
//
//		int revision;
//		Date date;
//		String[] authors;
//		boolean isMajor;
//		boolean isRestart;
//
//		public JSONObject toJson() {
//			JSONObject json = new JSONObject();
//			json.put("rev", revision);
//			json.put("date", date.toString() );
//			JSONArray jsonAuthors = new JSONArray();
//			for( String author : authors )
//			{
//				jsonAuthors.add(author);
//			}
//			json.put("authors", jsonAuthors);
//			if( isMajor )
//				json.put("major", true);
//			if( isRestart )
//				json.put("restart", true);
//			return json;
//		}
//		public Revision(int rev, Date d, String[] authors, boolean isMajor ) {
//			revision = rev;
//			date = d;
//			this.authors = authors;
//			this.isMajor = isMajor;
//		}
//	}
//
//	private static final Logger LOG = Logger.getLogger(RevisionManager.class.getName());
//
//	private int currentRevision;
//	private JSONArray savedRevisions = null;
//	private List<Revision> unSavedRevisions = new ArrayList<Revision>();
//
//	private DocumentSession docSession;
//	private AbstractDraftDocument draftDoc;
//	private DocumentBean docBean;
//	private String lastEditor;
//
//	public final static String REVISION = "revision";
//	public final static String REVISION_LIST_FILE = REVISION + "/revList.json";
//	public final static String REVISION_COUNTER_FILE = REVISION + "/currentRev.json";
//
//
//	protected RevisionManager( DocumentSession docSession, DocumentBean docBean,
//			AbstractDraftDocument draftDoc) {
//		this.docSession = docSession;
//		this.docBean = docBean;
//		this.draftDoc = draftDoc;
//		
//		currentRevision = loadCurrentRevisionNumber();
//	}
//	synchronized protected int addRevision(JSONArray messageArray, boolean isMajor, boolean isRestart) {
//
//		//Create a JSON object for this revision, append to the un-saved revision list
//		String[] authors = getAllAuthors();
//		if( authors.length == 0 && lastEditor != null )
//			authors = new String[]{ lastEditor };
//		Revision revision = new Revision( ++currentRevision, Calendar.getInstance().getTime(), authors, isMajor );
//		revision.isRestart = isRestart;
//		unSavedRevisions.add( revision );
//
//		//Write the message array to the revision store file, 
//		String path = REVISION + "/" + revision.revision + ".json";
//		try {
//			draftDoc.storeSubFile(path, messageArray.toString().getBytes("UTF-8") );
//		} catch (IOException e) {
//			LOG.log(Level.WARNING, "error saving revision: "
//					+ docBean.getId().toString() , e);
//			e.printStackTrace();
//		}
//
//		//return the next available revision number
//		return currentRevision;
//	}
//	private JSONArray getRevisions( int from, int to )
//	{
//		int nRevisions = to - from + 1;
//		if( nRevisions <= 0 )
//			return null;
//		JSONArray revisions = new JSONArray( nRevisions );
//		for( int revision = from; revision <= to; ++ revision )
//		{
//			revisions.addAll( getRevision(revision) );
//		}
//		return revisions;
//	}
//	private JSONArray getRevision( int revision )
//	{
//		//Write the message array to the revision store file, 
//		String path = REVISION + "/" + revision + ".json";
//		return (JSONArray) draftDoc.loadJsonFromSubFile(path, true); 
//	}
//	synchronized protected JSONArray getRevisionList()
//	{
//		JSONArray saved = loadRevisionList();
//		JSONArray unSaved = getUnsavedRevisions();
//		JSONArray all = new JSONArray();
//		if( saved != null )all.addAll( saved );
//		if( unSaved != null )all.addAll( unSaved );
//		
//		if( all.size() > 0 )
//		{
//			((JSONObject)all.get(0)).put("major", true);
//			((JSONObject)all.get( all.size()-1 )).put("major", true);
//		}
//
//		return all;
//	}
//	synchronized protected JSONObject getResultDocument( int revision, int baseOfDiff )
//	{
//		return getResultDocument( revision, baseOfDiff, true );
//	}
//	private JSONObject getResultDocument( int revision, int baseOfDiff, boolean trackingChange )
//	{
//		JSONObject base = null;
//		if( revision < baseOfDiff )
//		{
//			return null;
//		}
//		else if( baseOfDiff < revision )
//		{
//			int restartRevision = searchRestartRevision( baseOfDiff, revision );
//			if( restartRevision != 0 )
//			{
//				baseOfDiff = restartRevision;
//				base = loadCachedBaseDocument( baseOfDiff ); 
//			}
//		}
//		if( base == null && baseOfDiff > 0 )
//		{
//			base = getResultDocument( baseOfDiff, 0, false );
//		}
//
//		JSONArray changes = getRevisions( baseOfDiff+1, revision );
//		if( changes == null )
//			return base;
//		
//		return draftDoc.getResultDocument( base, changes, trackingChange );
//	}
//
//	synchronized protected void close() {
//		saveRevisionList();
//	}
//	
//	synchronized protected JSONObject restoreRevision(int revId)
//	{
//		//get the result document of the revision restoring to
//		JSONObject ret = getResultDocument(revId, 0);
//		if( ret == null )return null;
//		
//		//add a new revision which has the same result of the revision restoring to
//		int newRevId = addRevision( new JSONArray(0), true, true );
//		if( !saveBaseDocument(newRevId, ret) )return null;
//		
//		//update the draft document to that result document
//		if( !draftDoc.setDocument(ret) )
//			return null;
//		
//		return ret;
//	}
//	protected void setLastEditor()
//	{
//		lastEditor = getAllAuthors()[0];
//	}
//	
//	private int searchRestartRevision( int from, int to )
//	{
//		JSONArray revisions = getRevisionList();
//
//		for( int i = revisions.size()-1; i >= 0; -- i )
//		{
//			JSONObject revision = (JSONObject)revisions.get(i);
//			int rev = Integer.valueOf( revision.get("rev").toString() ).intValue();
//			if( rev > to )continue;
//			if( rev < from )break;
//			if( revision.get("restart") != null )
//			{
//				return rev;
//			}
//		}
//		return 0;
//	}
//	
//	private boolean saveBaseDocument( int revision, JSONObject result )
//	{
//		String path = REVISION + "/result_" + revision + ".json";
//		try {
//			draftDoc.storeSubFile(path, result.toString().getBytes("UTF-8") );
//		} catch (IOException e) {
//			LOG.log(Level.WARNING, "error saving result document: "
//					+ docBean.getId().toString() , e);
//			e.printStackTrace();
//			return false;
//		}
//		return true;
//	}
//	private JSONObject loadCachedBaseDocument( int revision )
//	{
//		return (JSONObject)draftDoc.loadJsonFromSubFile(REVISION + "/result_" + revision + ".json", false );
//	}
//	
//	private String[] getAllAuthors()
//	{
//		int i = 0;
//		Collection<Participant> participants = docSession.getParticipants();
//		String[] authors = new String[ participants.size() ];
//		for (Participant p : participants) {
//			authors[i++] = p.getUserBean().getDisplayName();
//		}
//		return authors;
//	}
//
//
//	private JSONArray getUnsavedRevisions()
//	{
//		if( unSavedRevisions.isEmpty() )return null;
//		JSONArray revisions = new JSONArray( unSavedRevisions.size() );
//		for (Revision revision : unSavedRevisions) {
//			revisions.add(revision.toJson());
//		}
//		return revisions;
//	}
//
//	private JSONArray loadRevisionList() {
//		if( savedRevisions != null )
//			return savedRevisions;
//		
//		savedRevisions = (JSONArray)draftDoc.loadJsonFromSubFile(REVISION_LIST_FILE, true);
//		return savedRevisions;
//	}
//	
//	private void saveRevisionList()
//	{
//		if( unSavedRevisions.isEmpty() )return;
//		
//		JSONArray revisions = getRevisionList();
////		JSONObject lastRevision = (JSONObject)revisions.get(revisions.size()-1);
////		lastRevision.put("major", true);
//
//		try {
//			draftDoc.storeSubFile(REVISION_LIST_FILE, revisions.toString().getBytes("UTF-8"));
//		} catch (IOException e) {
//			LOG.log(Level.WARNING, "error saving revision list file: "
//					+ docBean.getId().toString() , e);
//			e.printStackTrace();
//			return;
//		}
//		revisions.clear();
//		unSavedRevisions.clear();
//		saveCurrentRevisionNumber(currentRevision);
//	}
//	private void saveCurrentRevisionNumber( int currentRevision )
//	{
//		JSONObject json = new JSONObject();
//		json.put( "rev", currentRevision );
//		try {
//			draftDoc.storeSubFile(REVISION_COUNTER_FILE, json.toString().getBytes("UTF-8") );
//		} catch (IOException e) {
//			LOG.log(Level.WARNING, "error saving revision number: "
//					+ docBean.getId().toString() , e);
//			e.printStackTrace();
//		}
//	}
//	private int loadCurrentRevisionNumber()
//	{
//		JSONObject json = (JSONObject)draftDoc.loadJsonFromSubFile(REVISION_COUNTER_FILE, false);
//		if( json == null )return 0;
//		
//		return Long.valueOf( json.get("rev").toString() ).intValue();
//	}
//
//}

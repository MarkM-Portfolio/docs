/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.collaboration.editors;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocumentEditorBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocumentEditorsDAO;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONArray;

public class EditorsList implements List<DocumentEditorBean>
{	
  /**
   * The user who is manipulating this editor list
   */
  private UserBean caller;
  
  /**
   * The document edited
   */
  private IDocumentEntry doc;
  
  /**
   * The internal list to be delegated
   */
  private List<DocumentEditorBean> list = new ArrayList<DocumentEditorBean>();
  
  /**
   * @param caller The user who is manipulating this editor list
   * @param docBean The document edited
   */
  public EditorsList(UserBean caller, IDocumentEntry doc)
  { 
    this.caller = caller;
    this.doc = doc;
    // Query all editors from DB, and add them into internal list
    IDocumentEditorsDAO docEditorsDAO = (IDocumentEditorsDAO)Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(IDocumentEditorsDAO.class);
    List<DocumentEditorBean> editorList = docEditorsDAO.getDocumentEditors(this.doc);
    this.list.addAll(editorList);
    sortList();
  }
   
  /**
   * Convert this list to JSON
   * @return
   */
  public JSONArray toJSON()
  {
    JSONArray json = new JSONArray();
    
    Iterator<DocumentEditorBean> it = this.iterator();
    while (it.hasNext())
    {
      DocumentEditorBean editor = it.next();
      json.add(editor.toJSON());
    }
    
    return json;
  }
  
  public static void addEditorToDB(IDocumentEntry doc, DocumentEditorBean editor) {
    IDocumentEditorsDAO docEditorsDAO = (IDocumentEditorsDAO) Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(
        IDocumentEditorsDAO.class);
    docEditorsDAO.addEditor(doc, editor);    
  }

  synchronized public void add(int location, DocumentEditorBean editor)
  {
      String color = ConcordUtil.colors[this.size() % ConcordUtil.colors.length];

      editor.setColor(color);
      editor.setBorderColor(ConcordUtil.getBorderColor(color));

      this.list.add(location, editor); 
  }
  
  public boolean add(DocumentEditorBean object)
  {
    this.add(this.size(), object);
    return true;
  }

  public boolean addAll(int location, Collection<? extends DocumentEditorBean> collection)
  {
    return false;
  }

  public boolean addAll(Collection<? extends DocumentEditorBean> collection)
  {
    return false;
  }

  public void clear()
  {
    // Clear in DB
    IDocumentEditorsDAO docEditorsDAO = (IDocumentEditorsDAO)Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(IDocumentEditorsDAO.class);
    docEditorsDAO.removeAllEditors(this.doc);
    
    // Clear list
    synchronized (list)
    {
      this.list.clear(); 
    }    
  }

  synchronized public boolean contains(Object object)
  {
      return this.list.contains(object);     
  }

  synchronized public boolean containsAll(Collection<?> collection)
  {   
      return this.list.containsAll(collection);     
  }

  synchronized public DocumentEditorBean get(int location)
  {
      return this.list.get(location); 
  }

  synchronized public int indexOf(Object object)
  {
      return this.list.indexOf(object);  
  }

  synchronized public boolean isEmpty()
  {
      return this.list.isEmpty();   
  }

  synchronized public Iterator<DocumentEditorBean> iterator()
  {
      return this.list.iterator();  
  }

  synchronized public int lastIndexOf(Object object)
  {
    return this.list.lastIndexOf(object);
  }

  synchronized public ListIterator<DocumentEditorBean> listIterator()
  {
    return this.list.listIterator();
  }

  synchronized public ListIterator<DocumentEditorBean> listIterator(int location)
  {
    return this.list.listIterator(location);
  }

  public DocumentEditorBean remove(int location)
  {
    return null;
  }

  public boolean remove(Object object)
  {
    return false;
  }

  public boolean removeAll(Collection<?> collection)
  {
    return false;
  }

  synchronized public boolean retainAll(Collection<?> collection)
  {
    return this.list.retainAll(collection);
  }

  public DocumentEditorBean set(int location, DocumentEditorBean object)
  {
    return null;
  }

  synchronized public int size()
  {
    return this.list.size();
  }
  
  synchronized public DocumentEditorBean getEditorById(String id) {
    if ((this.list != null) && (this.list.size() > 0) ) {
      int listSize = this.list.size();
      //find the caller from this list
      for (int i = 0; i < listSize; i++) 
      {
        DocumentEditorBean bean = list.get(i);
        if(bean.getUserId().equalsIgnoreCase(id))  
          return bean;
        
      }      
    }
    
    return null;
  }

  synchronized public List<DocumentEditorBean> subList(int start, int end)
  {
    return this.list.subList(start, end);
  }

  synchronized public Object[] toArray()
  {
    return this.list.toArray();
  }

  synchronized public <T> T[] toArray(T[] array)
  {
    return this.list.toArray(array);
  }
  
  public void sortList(UserBean user) {
    this.caller = user;
    sortList();
  }
  
  /**
   * sort the list
   * 1. make the caller to be the first one
   * 2. the others are sorted by display name.
   */
  synchronized private void sortList() {
	  
	  if ((this.list != null) && (this.list.size() > 0) && (this.caller != null)) 
	  {
		  int listSize = this.list.size();
		  DocumentEditorBean editorToBeRemoved = null;
		  int editorToBeRemovedPosition = -1;
		  //find the caller from this list
		  for (int i = 0; i < listSize; i++) 
		  {
			  DocumentEditorBean tmpBean = list.get(i);
		    	if ((tmpBean.getUserId().compareTo(caller.getId())) == 0) 
		    	{
		    		editorToBeRemoved = tmpBean;
		    		editorToBeRemovedPosition = i;
					break;
				}			    
		  }
		  
		  //remove the caller and put it to be the first one of the list
		  if (editorToBeRemovedPosition != -1) 
		  {
			  list.remove(editorToBeRemovedPosition);
			  //sorted by display name
			  Collections.sort(list);
			  list.add(0, editorToBeRemoved);
		  } 
	  }
	  else 
	  {
		  /*		
		   //The message is shown in console. Really boring...   
		   if (LOG.isLoggable(Level.INFO))
		    {
		    	LOG.info("The list or caller is null!");
		    }
		  */
	  }
  }
}

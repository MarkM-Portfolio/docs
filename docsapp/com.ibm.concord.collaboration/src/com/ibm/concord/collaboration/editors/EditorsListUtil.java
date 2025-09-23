/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.collaboration.editors;

import java.util.Hashtable;
import java.util.logging.Logger;

import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.directory.beans.UserBean;

public class EditorsListUtil
{
  private static final Logger LOG = Logger.getLogger(EditorsListUtil.class.getName());
  
  private static final Hashtable<String, EditorsList> editorListMap = new Hashtable<String, EditorsList>();
  
  public static EditorsList getEditorsList(UserBean caller, IDocumentEntry doc)
  {
    EditorsList editors = null;
    String key = doc.getDocUri() + "@" + doc.getRepository();
    
    editors = editorListMap.get(key);
    if(editors == null)
    {
      editors = new EditorsList(caller, doc);
      editorListMap.put(key, editors);
    }
      
    return editors;
  }
  
  public static void removeEditorsList(String repoId, String uri)
  {
    String key = uri + "@" + repoId;
    editorListMap.remove(key);
  }
}

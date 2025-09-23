/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */


package com.ibm.docs.repository.external.rest;

import com.ibm.json.java.JSONObject;

public class RestVersionDocumentEntry extends RestDocumentEntry
{

  public RestVersionDocumentEntry(String repoId, String repoType, String repoHomeUrl, JSONObject jsonData)
  {
    super(repoId, repoType, repoHomeUrl, jsonData);
  }

  public String getDocId()
  {
    return versionLabel;
  }
  
  public String getDocUri()
  {
    return docId;
  }  

}

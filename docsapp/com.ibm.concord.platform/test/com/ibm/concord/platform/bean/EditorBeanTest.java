/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.platform.bean;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import java.sql.Timestamp;
import java.util.Date;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.ibm.json.java.JSONObject;

public class EditorBeanTest
{
  private DocumentEditorBean ebean;

  @Before
  public void setUp()
  {
    ebean = new DocumentEditorBean();
    ebean.setBorderColor("#555555");
    ebean.setColor("#666666");
    ebean.setDisplayName("test user 1");
    ebean.setDocId("docsID1");
    ebean.setDocRepoId("concord.storage");
    ebean.setEmail("test@cn.ibm.com");
    ebean.setLeaveSession(null);
    ebean.setOrgId("org1");
    ebean.setUserId("user1");
  }

  @After
  public void tearDown()
  {

  }

  @Test
  public void testToJson()
  {
    JSONObject tojson = ebean.toJSON();
    assertFalse(tojson.containsKey(DocumentEditorBean.LEAVE_SESSION));
    Timestamp ts = new Timestamp((new Date()).getTime());
    ebean.setLeaveSession(ts);
    tojson = ebean.toJSON();
    assertTrue(tojson.containsKey(DocumentEditorBean.LEAVE_SESSION));
  }

  @Test
  public void testFromJson()
  {
    Timestamp ts = new Timestamp((new Date()).getTime());
    String tsv = ts.toString();
    ebean.setLeaveSession(ts);
    JSONObject tojson = ebean.toJSON();
    DocumentEditorBean aBean = DocumentEditorBean.fromJSON(tojson);
    Timestamp ls = aBean.getLeaveSession();
    String newtsv = ls.toString();
    assertEquals(tsv, newtsv);

    ebean.setLeaveSession(null);
    tojson = ebean.toJSON();
    aBean = DocumentEditorBean.fromJSON(tojson);
    ls = aBean.getLeaveSession();
    assertNull(ls);
  }
}

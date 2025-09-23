/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.entitlement;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.powermock.api.mockito.PowerMockito.doReturn;
import static org.powermock.api.mockito.PowerMockito.mock;
import static org.powermock.api.mockito.PowerMockito.spy;
import static org.powermock.api.mockito.PowerMockito.when;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.junit.runner.RunWith;
import org.mockito.Matchers;
import org.mockito.Mockito;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import com.ibm.concord.spi.exception.AccessException;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.entitlement.bean.DocEBean;
import com.ibm.docs.entitlement.bean.OrgEBean;
import com.ibm.docs.entitlement.bean.UserEBean;
import com.ibm.docs.entitlement.dao.IDocEntitlementDAO;
import com.ibm.docs.entitlement.dao.IOrgEntitlementDAO;
import com.ibm.docs.entitlement.dao.IUserEntitlementDAO;
import com.ibm.docs.entitlement.gatekeeper.GateKeeperEntitlement;
import com.ibm.docs.entitlement.gatekeeper.GateKeeperServiceImpl;
import com.ibm.docs.entitlement.gatekeeper.IGateKeeperService;
import com.ibm.json.java.JSONObject;

// mock class: include private method, final class, static method,

@RunWith(PowerMockRunner.class)
@PrepareForTest({ GateKeeperServiceImpl.class, DocEBean.class })
public class EntitlementUnitTest
{

  private JSONObject customizedFont;

  private JSONObject theme;

  private JSONObject features;

  @Before
  public void setUp()
  {
    this.features = new JSONObject();
    JSONObject fvalueObj = new JSONObject();
    fvalueObj.put("featureName", "Customized Fonts");
    fvalueObj.put("featureDetail",
        "Arial/Arial, Helvetica, sans-serif; Times New Roman/Times New Roman, Times, serif; \u5b8b\u4f53; \u4eff\u5b8b");
    fvalueObj.put("featureUrl", "api/font1; api/font2");
    fvalueObj.put("enabled", true);
    JSONObject fObj = new JSONObject();
    fObj.put("CustomizedFonts", fvalueObj);
    this.customizedFont = fObj;
    this.features.put("CustomizedFonts", fvalueObj);

    fvalueObj = new JSONObject();
    fvalueObj.put("featureName", "New Docs theme");
    fvalueObj.put("featureDetail", "colorStyle:green; dialogStyle:rectangle");
    fvalueObj.put("featureUrl", "api/theme1; api/theme2");
    fvalueObj.put("enabled", true);
    fObj = new JSONObject();
    fObj.put("NewTheme", fvalueObj);
    this.theme = fObj;
    this.features.put("NewTheme", fvalueObj);
  }

  @After
  public void tearDown()
  {

  }

  @Test
  public void testQueryGlobalFeatures()
  {
    try
    {
      IDocEntitlementDAO dao = mock(IDocEntitlementDAO.class);
      // partial mock
      GateKeeperServiceImpl service = spy(new GateKeeperServiceImpl());
      // mock private method call
      doReturn(dao).when(service, "getDocEntitlementDAO");

      // Exception branch
      List<DocEBean> beanList = new ArrayList<DocEBean>();
      beanList.add(new DocEBean("LevelName1", customizedFont.toString()));
      beanList.add(new DocEBean("LevelName2", theme.toString()));
      when(dao.getByUniqueName(Mockito.anyString())).thenReturn(beanList);
      assertTrue(service.queryGlobalFeatures().equals("failed"));
      // Null branch
      when(dao.getByUniqueName(Mockito.anyString())).thenReturn(new ArrayList<DocEBean>());
      assertEquals(service.queryGlobalFeatures(), null);
      // Normal branch
      beanList = new ArrayList<DocEBean>();
      beanList.add(new DocEBean("LevelName1", theme.toString()));
      when(dao.getByUniqueName(Mockito.anyString())).thenReturn(beanList);
      GateKeeperEntitlement gbean = service.queryGlobalFeatures();
      assertEquals(gbean.getFeatures(), theme.toString());
    }
    catch (AccessException e)
    {
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
  }

  @Test
  public void testEntitleGlobalFeatures()
  {
    Map<String, String> pMap = new HashMap<String, String>();
    pMap.put("CustomizedFonts", customizedFont.get("CustomizedFonts").toString());
    pMap.put("NewTheme", theme.get("NewTheme").toString());
    try
    {
      IDocEntitlementDAO dao = mock(IDocEntitlementDAO.class);
      // partial mock
      GateKeeperServiceImpl service = spy(new GateKeeperServiceImpl());
      // mock private method call
      doReturn(dao).when(service, "getDocEntitlementDAO");

      when(dao.add(Matchers.any(DocEBean.class))).thenReturn(true);
      when(dao.update(Matchers.any(DocEBean.class))).thenReturn(true);
      // branch for bean is null
      when(dao.getByUniqueName(Mockito.anyString())).thenReturn(new ArrayList<DocEBean>());
      service.entitleGlobalFeatures(pMap);
      Mockito.verify(service).addEntitlementLevel(Mockito.anyString(), Mockito.anyString());
      Mockito.verify(dao, Mockito.never()).update(Matchers.any(DocEBean.class));
      // branch for bean is not null
      List<DocEBean> beanList = new ArrayList<DocEBean>();
      beanList.add(new DocEBean("LevelName", customizedFont.toString()));
      String levelId = beanList.get(0).getLevelid();

      DocEBean mockBean = mock(DocEBean.class);
      PowerMockito.whenNew(DocEBean.class).withArguments(levelId, IGateKeeperService.GLOBAL_LEVEL_NAME, this.features.toString())
          .thenReturn(mockBean);
      when(dao.getByUniqueName(Mockito.anyString())).thenReturn(beanList);
      service.entitleGlobalFeatures(pMap);

      Mockito.verify(dao, Mockito.atLeastOnce()).add(Matchers.any(DocEBean.class));
      Mockito.verify(dao).update(Matchers.any(DocEBean.class));
      PowerMockito.verifyNew(DocEBean.class).withArguments(Mockito.anyString(), Mockito.anyString(), Mockito.anyString());
    }
    catch (AccessException e)
    {

    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
  }

  @Rule
  public ExpectedException thrown = ExpectedException.none();

  @Test
  public void testRemoveGlobalEntitlementFeatures()
  {
    try
    {
      IDocEntitlementDAO dao = mock(IDocEntitlementDAO.class);
      // partial mock
      GateKeeperServiceImpl service = spy(new GateKeeperServiceImpl());
      // mock private method call
      doReturn(dao).when(service, "getDocEntitlementDAO");
      when(dao.deleteByLevelId(Matchers.anyString())).thenReturn(true);
      // Exception branch
      when(dao.getByUniqueName(Mockito.anyString())).thenReturn(new ArrayList<DocEBean>());
      List<String> fids = new ArrayList<String>();
      fids.add("levelName1");
      service.removeGlobalEntitlementFeatures(fids);
      thrown.expect(IllegalArgumentException.class);
    }
    catch (Exception e)
    {
    }
  }

  @Test
  public void testRemoveGlobalEntitlementFeatures2()
  {
    try
    {
      IDocEntitlementDAO dao = mock(IDocEntitlementDAO.class);
      // partial mock
      GateKeeperServiceImpl service = spy(new GateKeeperServiceImpl());
      // mock private method call
      doReturn(dao).when(service, "getDocEntitlementDAO");
      when(dao.deleteByLevelId(Matchers.anyString())).thenReturn(true);
      // Normal branch
      List<DocEBean> beanList = new ArrayList<DocEBean>();
      beanList.add(new DocEBean("levelName1", customizedFont.toString()));
      when(dao.getByUniqueName(Mockito.anyString())).thenReturn(beanList);
      List<String> fids = new ArrayList<String>();
      fids.add("CustomizedFonts");
      service.removeGlobalEntitlementFeatures(fids);
      Mockito.verify(dao).update(Matchers.any(DocEBean.class));
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
  }

  @Test
  public void testGetUserFeatures()
  {
    // prepare organization data
    String orgId = "1000";
    String orgName = "IBM";
    String featureId = "testF1";

    JSONObject fvalueObj = new JSONObject();
    fvalueObj.put("featureName", "TEST F1 Feature");
    fvalueObj.put("featureDetail", "test detailed stuffs");
    fvalueObj.put("featureUrl", "api/test1; api/test2");
    fvalueObj.put("enabled", true);
    String featureValue = fvalueObj.toString();
    JSONObject fObj = new JSONObject();
    fObj.put(featureId, fvalueObj);

    try
    {
      /************************* begin of DAO Mock *****************************/
      IDocEntitlementDAO dao = mock(IDocEntitlementDAO.class);
      // partial mock
      GateKeeperServiceImpl service = spy(new GateKeeperServiceImpl());
      // mock private method call
      doReturn(dao).when(service, "getDocEntitlementDAO");
      when(dao.add(Matchers.any(DocEBean.class))).thenReturn(true);
      when(dao.update(Matchers.any(DocEBean.class))).thenReturn(true);

      IOrgEntitlementDAO orgDAO = mock(IOrgEntitlementDAO.class);
      doReturn(orgDAO).when(service, "getOrgEntitlementDAO");
      when(orgDAO.add(Matchers.any(OrgEBean.class))).thenReturn(true);
      when(orgDAO.update(Matchers.any(OrgEBean.class))).thenReturn(true);

      IUserEntitlementDAO userDAO = mock(IUserEntitlementDAO.class);
      doReturn(userDAO).when(service, "getUserEntitlementDAO");
      when(userDAO.add(Matchers.any(UserEBean.class))).thenReturn(true);
      when(userDAO.update(Matchers.any(UserEBean.class))).thenReturn(true);

      /************************* end of DAO Mock *****************************/
      // Branch for none bean in ORG_ENTITLEMENT
      when(dao.getByOrg(Mockito.anyString())).thenReturn(null);
      service.addNewFeatureToOrg(orgId, orgName, featureId, featureValue);
      Mockito.verify(service).addEntitlementLevel(Mockito.anyString(), Mockito.anyString());
      Mockito.verify(service).addOrgEntitlementLevel(Mockito.anyString(), Mockito.anyString(), Mockito.anyString());

      // Branch for having bean in ORG_ENTITLEMENT
      when(dao.getByOrg(Mockito.anyString())).thenReturn(new DocEBean("LevelName", customizedFont.toString()));
      when(dao.getByUser(Mockito.anyString(), Mockito.anyString())).thenReturn(null);
      // String userId, String orgId, String displayName, String email
      UserBean user = new UserBean("1", orgId, "test1", "test1@cn.ibm.com");
      List<DocEBean> beanList = new ArrayList<DocEBean>();
      beanList.add(new DocEBean("LevelName1", theme.toString()));

      when(dao.getByUniqueName(Mockito.anyString())).thenReturn(beanList);
      when(dao.getByUser(Mockito.anyString(), Mockito.anyString())).thenReturn(new DocEBean("LevelName", fObj.toString()));
      JSONObject result = service.getUserFeatures(user);
      assertTrue(result.containsKey("CustomizedFonts"));
      assertTrue(result.containsKey("NewTheme"));
      assertTrue(result.containsKey("testF1"));
    }
    catch (AccessException e)
    {
      e.printStackTrace();
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
  }
}

package com.ibm.concord.config;

import org.junit.Test;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertFalse;

import java.io.File;
import com.ibm.concord.config.ConcordConfig;

public class ConcordConfigTest
{
  ConcordConfig config = null;
  
  @Test
  public void testIsReloadLog()
  {
    boolean reloadLog = getConfig().isReloadLog();
    assertTrue(reloadLog);   
  }
  
  @Test
  public void testGetBetasStr()
  {
    String beta = getConfig().getBetasStr();
    assertEquals("[assignment]",beta);
  }
  
  @Test 
  public void testIsCloudTypeAhead()
  {
    boolean typeahead = getConfig().isCloudTypeAhead();
    assertFalse(typeahead);
  }

  @Test
  public void testGetTextHelpUrl()
  {
    String url = getConfig().getTextHelpUrl("files", "lcfiles");
    assertEquals("/help/index.jsp?topic=/com.ibm.help.ibmdocs.doc/text/document/documents_frame.html", url);
    url = getConfig().getTextHelpUrl("ecm", "ecm");
    assertEquals("/help/index.jsp?topic=/com.ibm.help.ibmdocs.doc/text/document/documents_frame.html", url);
    
    url = getConfig().getTextHelpUrl("external.cmis", "external.cmis");
    assertEquals("http://www.ibm.com/support/knowledgecenter/SSFHJY_2.0.0/welcome/ibmdocs_2.0.0.html", url);        
    url = getConfig().getTextHelpUrl("external.rest", "external.rest");
    assertEquals("http://www.ibm.com/support/knowledgecenter/SSFHJY_2.0.0/welcome/ibmdocs_2.0.0.html", url);
  }

  @Test
  public void testGetPresHelpUrl()
  {
    String url = getConfig().getPresHelpUrl("files", "lcfiles");
    assertEquals("/help/index.jsp?topic=/com.ibm.help.ibmdocs.doc/text/presentation/presentations_frame.html", url);
    url = getConfig().getPresHelpUrl("ecm", "ecm");
    assertEquals("/help/index.jsp?topic=/com.ibm.help.ibmdocs.doc/text/presentation/presentations_frame.html", url);
    
    url = getConfig().getPresHelpUrl("external.cmis", "external.cmis");
    assertEquals("http://www.ibm.com/support/knowledgecenter/SSFHJY_2.0.0/welcome/ibmdocs_2.0.0.html", url);        
    url = getConfig().getPresHelpUrl("external.rest", "external.rest");
    assertEquals("http://www.ibm.com/support/knowledgecenter/SSFHJY_2.0.0/welcome/ibmdocs_2.0.0.html", url);
  }
  
  @Test
  public void testGetSheetHelpUrl()
  {
    String url = getConfig().getSheetHelpUrl("files", "lcfiles");
    assertEquals("/help/index.jsp?topic=/com.ibm.help.ibmdocs.doc/text/spreadsheet/spreadsheets_frame.html", url);
    url = getConfig().getSheetHelpUrl("ecm", "ecm");
    assertEquals("/help/index.jsp?topic=/com.ibm.help.ibmdocs.doc/text/spreadsheet/spreadsheets_frame.html", url);
    
    url = getConfig().getSheetHelpUrl("external.cmis", "external.cmis");
    assertEquals("http://www.ibm.com/support/knowledgecenter/SSFHJY_2.0.0/welcome/ibmdocs_2.0.0.html", url);        
    url = getConfig().getSheetHelpUrl("external.rest", "external.rest");
    assertEquals("http://www.ibm.com/support/knowledgecenter/SSFHJY_2.0.0/welcome/ibmdocs_2.0.0.html", url);
  }
  
  @Test
  public void testGetECMHelpUrl()
  {    
    String url = getConfig().getECMHelpUrl("ecm", "ecm");
    assertEquals("http://abc.com/kc/SSFHJY_1.0.7", url);  
  }
  
  @Test
  public void testIsCookiesEnforceSecure()
  {
	boolean isSecure = getConfig().isCookiesEnforceSecure();
	assertTrue(isSecure);
  }
  
  private ConcordConfig getConfig() {
    if (config == null)
    {
      //String file = "I:\\RSA85MainMaven\\docsapp\\com.ibm.concord.config\\test\\com\\ibm\\concord\\config\\concord-config-test.json";
      String file = ConcordConfigTest.class.getProtectionDomain().getCodeSource().getLocation().getPath().toString();
      file += "com/ibm/concord/config/concord-config-test.json";
      File configFile = new File(file);      
      
      config = ConcordConfig.getInstance();
      config.init(configFile);
    }
    return config;
  }
  
}

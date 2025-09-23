package com.ibm.docs.installer.common.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.ibm.docs.im.installer.common.util.Util;

import junit.framework.TestCase;

public class UtilTest extends TestCase
{
  public void setUp()
  {
    ;
  }

  public void tearDown()
  {
    ;
  }

  public void testEvalVersion()
  {
    String output = "WASX7209I: Connected to process \"dmgr\" on node localhostCellManager01 using SOAP connector;  The type of process is: DeploymentManager\n'8.0.0.0'";
    Matcher m1 = Pattern.compile(Util.VERSION_PATTERN, Pattern.DOTALL).matcher(output);
    Matcher m2 = Pattern.compile(Util.VERSION_PATTERN, Pattern.DOTALL).matcher("7.0.0.5");
    assertEquals("8.0.0.0", Util.evalVersion(m1));
    assertEquals("7.0.0.5", Util.evalVersion(m2));
  }

  public void test()
  {
    String output = "WASX7209I: Connected to process \"dmgr\" on node localhostCellManager01 using SOAP connector;  The type of process is: DeploymentManager\n'8.0.0.0'";
    Matcher m1 = Pattern.compile(Util.VERSION_PATTERN, Pattern.DOTALL).matcher(output);
    Matcher m2 = Pattern.compile(Util.VERSION_PATTERN, Pattern.DOTALL).matcher("7.0.0.5");
    assertTrue(Util.checkMinimumVersionString(m1, m2));
    assertFalse(Util.checkMinimumVersionString(m2, m1));
  }
}

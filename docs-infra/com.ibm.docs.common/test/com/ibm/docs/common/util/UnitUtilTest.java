/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.common.util;

import org.junit.Test;
import static org.junit.Assert.assertEquals;

public class UnitUtilTest
{

  @Test
  public void testConvertToCMValue()
  {
    String value = "10000XX";
    double result = UnitUtil.convertToCMValue(value);
    assertEquals(10000.0, result, 0);

    value = "10000in";
    result = UnitUtil.convertToCMValue(value);
    double d = toDoubleValue(value);
    assertEquals(d * 2.54, result, 0);

    value = "10000pt";
    result = UnitUtil.convertToCMValue(value);
    d = toDoubleValue(value);
    assertEquals(d * 2.54 / 72, result, 0);

    value = "10000mm";
    result = UnitUtil.convertToCMValue(value);
    d = toDoubleValue(value);
    assertEquals(d / 10, result, 0);

    value = "10000pc";
    result = UnitUtil.convertToCMValue(value);
    d = toDoubleValue(value);
    assertEquals(d * 2.54 / 6, result, 0);
  }

  @Test
  public void testConvertToPTValue()
  {
    String value = "10000XX";
    double result = UnitUtil.convertToPTValue(value);
    assertEquals(10000.0, result, 0);

    value = "10000in";
    result = UnitUtil.convertToPTValue(value);
    double d = toDoubleValue(value);
    assertEquals(d / 72.0, result, 0);

    value = "10000cm";
    result = UnitUtil.convertToPTValue(value);
    d = toDoubleValue(value);
    assertEquals(d * 72.0 / 2.54, result, 0);

    value = "10000mm";
    result = UnitUtil.convertToPTValue(value);
    d = toDoubleValue(value);
    assertEquals(d * 7.2 / 2.54, result, 0);

    value = "10000pc";
    result = UnitUtil.convertToPTValue(value);
    d = toDoubleValue(value);
    assertEquals(d * 12, result, 0);
  }
  
  private double toDoubleValue(String value) {
    return Double.parseDouble(value.substring(0, value.length() - 2));
  }
  
}

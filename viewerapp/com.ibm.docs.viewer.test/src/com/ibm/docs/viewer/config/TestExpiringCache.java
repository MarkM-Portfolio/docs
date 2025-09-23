package com.ibm.docs.viewer.config;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import org.junit.Test;

import com.ibm.concord.viewer.platform.util.ExpiringCache;

public class TestExpiringCache
{
  @Test
  public void testExpiringCache()
  {
    try
    {
      ExpiringCache ec = new ExpiringCache("test");
      assertEquals(ec.getValue(), "test");

      Thread.sleep(4000);

      assertEquals(ec.getValue(), null);
      ec.setValue("test2");
      assertEquals(ec.getValue(), "test2");
      
      ec = new ExpiringCache("test3", 1000);
      Thread.sleep(500);
      assertEquals(ec.getValue(), "test3");
      Thread.sleep(600);
      assertEquals(ec.getValue(), null);
    }
    catch (InterruptedException e)
    {
      fail();
    }
  }
}

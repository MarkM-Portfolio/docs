package com.ibm.docs.viewer.config;

import static org.junit.Assert.*;

import java.io.InputStream;

import org.junit.BeforeClass;
import org.junit.Test;

import com.ibm.concord.viewer.config.ViewerConfig;

public class TestViewerConfig
{
  @BeforeClass
  public static void setup()
  {
  }
  
  @Test
  public void testSnapshotConfig()
  {
    InputStream configIs = TestViewerConfig.class.getResourceAsStream("snapshot-config.json");
    ViewerConfig config = ViewerConfig.getInstance(configIs);
    
    assertTrue(config.isSnapshotMode());
    assertNotNull(config.getSnapshotSrvURL());
    
    configIs = TestViewerConfig.class.getResourceAsStream("snapshot-config2.json");
    config = ViewerConfig.getInstance(configIs);
    
    assertFalse(config.isSnapshotMode());
    assertNull(config.getSnapshotSrvURL());
  }
}

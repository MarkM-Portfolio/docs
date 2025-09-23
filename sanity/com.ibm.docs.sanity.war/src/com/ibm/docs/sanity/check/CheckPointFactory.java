package com.ibm.docs.sanity.check;

import com.ibm.docs.sanity.DeploymentEnvType;
import com.ibm.docs.sanity.check.conv.ConversionConfigJsonCheckPoint;
import com.ibm.docs.sanity.check.conv.ConversionTaskCheckPoint;
import com.ibm.docs.sanity.check.conv.ConversionVersionCheckPoint;
import com.ibm.docs.sanity.check.conv.SofficeProcessCheckPoint;
import com.ibm.docs.sanity.check.conv.SystemFontCheckPoint;
import com.ibm.docs.sanity.check.conv.ThumbnailsCheckPoint;
import com.ibm.docs.sanity.check.docs.BSSProvisionCheckPoint;
import com.ibm.docs.sanity.check.docs.ConversionCheckPoint;
import com.ibm.docs.sanity.check.docs.DatabaseCheckPoint;
import com.ibm.docs.sanity.check.docs.DocsConfigJsonCheckPoint;
import com.ibm.docs.sanity.check.docs.DocsFilesS2SCallCheckPoint;
import com.ibm.docs.sanity.check.docs.DocsVersionCheckPoint;
import com.ibm.docs.sanity.check.docs.RepositoryCheckPoint;
import com.ibm.docs.sanity.check.docs.StorageCheckPoint;
import com.ibm.docs.sanity.util.ServerTypeUtil;

public class CheckPointFactory
{
  public static ISanityCheckPoint[] createAll(String formatMime,int nPort)
  {
    ISanityCheckPoint[] docsCps = create4Docs(formatMime,nPort);
    ISanityCheckPoint[] convCps = create4Conv(formatMime,nPort);
    ISanityCheckPoint[] allCps = new ISanityCheckPoint[docsCps.length + convCps.length];
    System.arraycopy(docsCps, 0, allCps, 0, docsCps.length);
    System.arraycopy(convCps, 0, allCps, docsCps.length, convCps.length);
    return allCps;
  }

  public static ISanityCheckPoint[] create4Docs(String formatMime,int nPort)
  {
    if (ServerTypeUtil.getDeploymentEnvType()==DeploymentEnvType.CLOUD)
    {
      return new ISanityCheckPoint[] { new DocsConfigJsonCheckPoint(formatMime),new DocsVersionCheckPoint(formatMime,nPort),
          /*new DocsFilesS2SCallCheckPoint(formatMime),*/new StorageCheckPoint(formatMime), new DatabaseCheckPoint(formatMime),
          new BSSProvisionCheckPoint(formatMime), new RepositoryCheckPoint(formatMime), new ConversionCheckPoint(formatMime)};
    }else if (ServerTypeUtil.getDeploymentEnvType()==DeploymentEnvType.ONPREMISE)
    {
      return new ISanityCheckPoint[] { new DocsConfigJsonCheckPoint(formatMime),new DocsVersionCheckPoint(formatMime,nPort),
          //new DocsFilesS2SCallCheckPoint(formatMime),new StorageCheckPoint(formatMime), new DatabaseCheckPoint(formatMime),
          new DocsFilesS2SCallCheckPoint(formatMime),new StorageCheckPoint(formatMime),
          new RepositoryCheckPoint(formatMime), new ConversionCheckPoint(formatMime)};
    }else
    {
      return new ISanityCheckPoint[] {};
    }
  }

  public static ISanityCheckPoint[] create4Conv(String formatMime,int nPort)
  {
    if (ServerTypeUtil.getDeploymentEnvType() == DeploymentEnvType.ONPREMISE)
    {
      return new ISanityCheckPoint[] { 
          new ConversionVersionCheckPoint(formatMime,nPort),
          new ConversionConfigJsonCheckPoint(formatMime),        
          new SofficeProcessCheckPoint(formatMime),
          new ConversionTaskCheckPoint(formatMime,nPort),
          new ThumbnailsCheckPoint(formatMime)
      };
    }
    else
    {
      return new ISanityCheckPoint[] { 
          new ConversionVersionCheckPoint(formatMime,nPort),
          new ConversionConfigJsonCheckPoint(formatMime),        
          new SofficeProcessCheckPoint(formatMime),
          //Remove System Font check point on Linux Conversion server
          //new SystemFontCheckPoint(formatMime), 
          new ConversionTaskCheckPoint(formatMime,nPort),
          new ThumbnailsCheckPoint(formatMime)
      };
    }
  }
}

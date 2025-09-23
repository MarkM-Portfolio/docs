package com.ibm.docs.sanity.check.conv;

import java.io.File;
import java.util.Properties;
import java.util.Vector;
import java.util.logging.Logger;

import com.ibm.docs.sanity.bean.SanityCheckPointItem;
import com.ibm.docs.sanity.bean.SanityCheckPointItem.CheckResult;
import com.ibm.docs.sanity.check.AbstractCheckPoint;
import com.ibm.docs.sanity.exception.SanityCheckException;

public class SystemFontCheckPoint extends AbstractCheckPoint
{
  private static final Logger LOG = Logger.getLogger(SystemFontCheckPoint.class.getName());

  private static final Properties messages;

  private static final Vector<String> fontNames;

  private static final String SYSTEM_FONT_DIR = "c:\\Windows\\Fonts";

  static
  {
    String className = SystemFontCheckPoint.class.getSimpleName();
    messages = new Properties();

    messages.put(className + "@setUp@1", "");
    messages.put(className + "@setUp@2", "");
    messages.put(className + "@setUp@3", "");

    messages.put(className + "@doCheck@1", "The expected system font {0} for conversion service is not found.");
    messages.put(className + "@doCheck@2", "The valid system font directory at {0} is not found.");
    messages.put(className + "@doCheck@3", "Detected database overflow, needs reorg and runstats. {0}");

    messages.put(className + "@tearDown@1", "");
    messages.put(className + "@tearDown@2", "");
    messages.put(className + "@tearDown@3", "");

    fontNames = new Vector<String>();

    fontNames.add("HGRGE.TTC");
    fontNames.add("HGRGY.TTC");
    fontNames.add("HGRPP1.TTC");
    fontNames.add("HGRSGU.TTC");
    fontNames.add("HGRSMP.TTF");
  }

  private final SanityCheckPointItem cpItem = new SanityCheckPointItem(SystemFontCheckPoint.class.getSimpleName(),
      "This checkpoint is sanity check for the system fonts for conversion service.", messages);

  public SystemFontCheckPoint(String formatMime)
  {
    super(formatMime);
  }

  public void doCheck() throws SanityCheckException
  {
    LOG.entering(SystemFontCheckPoint.class.getName(), "doCheck");
    File fontDir = new File(SYSTEM_FONT_DIR);
    if (fontDir.exists() && fontDir.isDirectory())
    {
      for (int i = 0; i < fontNames.size(); i++)
      {
        File fontFile = new File(fontDir, fontNames.get(i));
        if (!fontFile.exists() || !fontFile.isFile())
        {
          String sPath = fontFile.getPath();
          Properties prop = System.getProperties();
          String os = prop.getProperty("os.name");
          if (os.startsWith("win") || os.startsWith("Win"))
             sPath = sPath.replaceAll("\\\\", "\\\\\\\\");
          throw new SanityCheckException(this, cpItem, SystemFontCheckPoint.class, "doCheck", 1, new Object[] { sPath });
        }
      }
      cpItem.setResult(CheckResult.RESULT_SUCCESS(this.getFormatMime()));
    }
    else
    {
      String sPath = fontDir.getPath();
      Properties prop = System.getProperties();
      String os = prop.getProperty("os.name");
      if (os.startsWith("win") || os.startsWith("Win"))
        sPath = sPath.replaceAll("\\\\", "\\\\\\\\");      
      throw new SanityCheckException(this, cpItem, SystemFontCheckPoint.class, "doCheck", 2, new Object[] { sPath });
    }
    LOG.exiting(SystemFontCheckPoint.class.getName(), "doCheck");
  }

  public SanityCheckPointItem report()
  {
    LOG.entering(SystemFontCheckPoint.class.getName(), "report");

    prepare(cpItem);

    LOG.exiting(SystemFontCheckPoint.class.getName(), "report", cpItem.getResult().isSanity());
    return cpItem;
  }
}

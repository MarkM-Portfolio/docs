/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.journal.subscriber.sample;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.logging.Formatter;
import java.util.logging.LogRecord;

/**
 * <code>SimpleJournalFormatter</code> can be used to print a summary of the information contained in a <code>LogRecord</code> object in a
 * human readable format.
 */
public class SimpleJournalFormatter extends Formatter
{
  /**
   * Constructs a <code>SimpleJournalFormatter</code> object.
   */
  public SimpleJournalFormatter()
  {
    super();
  }

  @Override
  public String format(LogRecord r)
  {
    StringBuilder sb = new StringBuilder();
    sb.append(formatMessage(r)).append(System.getProperty("line.separator"));
    if (null != r.getThrown())
    {
      sb.append("Throwable occurred: "); //$NON-NLS-1$
      Throwable t = r.getThrown();
      PrintWriter pw = null;
      try
      {
        StringWriter sw = new StringWriter();
        pw = new PrintWriter(sw);
        t.printStackTrace(pw);
        sb.append(sw.toString());
      }
      finally
      {
        if (pw != null)
        {
          try
          {
            pw.close();
          }
          catch (Exception e)
          {
            // ignore
          }
        }
      }
    }
    return sb.toString();
  }
}

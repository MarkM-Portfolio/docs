package com.ibm.docs.sanity.bean;

import java.text.MessageFormat;
import java.util.Properties;
import java.util.logging.Logger;

import com.ibm.docs.sanity.Constants;
import com.ibm.docs.sanity.util.FileUtil;

public class SanityCheckPointItem
{
  private static final Logger LOG = Logger.getLogger(SanityCheckPointItem.class.getName());

  private String name;

  private String description;

  private Properties messages;

  private CheckResult result;

  public CheckResult getResult()
  {
    return result;
  }

  public void setResult(CheckResult result)
  {
    this.result = result;
  }

  public String getName()
  {
    return name;
  }

  public String getDescription()
  {
    return description;
  }

  public void setDescription(String description)
  {
    this.description = description;
  }

  public String getErrorMessage(Class<?> type, String phrase, int index, Object[] params)
  {
    LOG.entering(SanityCheckPointItem.class.getName(), "getErrorMessage", new Object[] { type.getName(), phrase, index, params });

    String msgKey = type.getSimpleName() + "@" + phrase + "@" + index;
    String errMsg = messages.getProperty(msgKey, msgKey);
    if (errMsg != null && params != null)
    {
      errMsg = MessageFormat.format(errMsg, params);
    }

    LOG.exiting(SanityCheckPointItem.class.getName(), "getErrorMessage", errMsg);
    return errMsg;
  }

  public SanityCheckPointItem(String name, String description, Properties messages)
  {
    this.name = name == null ? "" : name;
    this.description = description == null ? "" : description;
    this.messages = messages == null ? new Properties() : messages;
  }

  public static abstract class CheckResult
  {
    private static final Logger LOG = Logger.getLogger(CheckResult.class.getName());

    public static CheckResult RESULT_SUCCESS(String formatMime)
    {
      return CheckResult_SUCCESS.create(formatMime);
    }

    public static CheckResult RESULT_FAILED(String formatMime)
    {
      return CheckResult_FAILED.create(formatMime);
    }

    public static CheckResult RESULT_NULL(String formatMime)
    {
      return CheckResult_NULL.create(formatMime);
    }

    private String resultString;

    private CheckResult(String resultString)
    {
      this.resultString = resultString;
    }

    public CheckResult compile(String reason)
    {
      LOG.entering(CheckResult.class.getName(), "compile", reason);

      if (this instanceof CheckResult_FAILED)
      {
        reason = FileUtil.escapeForJson(reason);
        resultString = resultString.replaceAll("\\{1\\}", reason);
      }

      LOG.exiting(CheckResult.class.getName(), "compile", this.resultString);
      return this;
    }

    public CheckResult duration(long duration)
    {
      LOG.entering(CheckResult.class.getName(), "duration", duration);

      resultString = resultString.replaceAll("\\{0\\}", String.valueOf(duration));

      LOG.exiting(CheckResult.class.getName(), "duration", this.resultString);
      return this;
    }

    public boolean isSanity()
    {
      return this instanceof CheckResult_SUCCESS;
    }

    public String toString()
    {
      return resultString;
    }

    private static class CheckResult_FAILED extends CheckResult
    {
      private static CheckResult create(String formatMime)
      {
        if (Constants.ACCEPT_HEADER_JSON.equals(formatMime))
        {
          return new CheckResult_FAILED("{ \"result\": \"Failed\", \"duration\": {0}, \"reason\": \"{1}\" }");
        }
        else if (Constants.ACCEPT_HEADER_XML.equals(formatMime))
        {
          return new CheckResult_FAILED("<result>Failed</result><duration>{0}</duration><reason>{1}</reason>");
        }
        else if (Constants.ACCEPT_HEADER_HTML.equals(formatMime))
        {
          return new CheckResult_FAILED(
              "<td bgcolor=\"#F0F0F0\">{1}</td><td bgcolor=\"#F0F0F0\">{0}</td><td align=\"center\" bgcolor=\"#FF0000\">FAIL</td>");
        }
        else
        {
          return new CheckResult_FAILED("<result>Failed</result><duration>{0}</duration><reason>{1}</reason>");
        }
      }

      private CheckResult_FAILED(String resultString)
      {
        super(resultString);
      }
    }

    private static class CheckResult_SUCCESS extends CheckResult
    {
      private static CheckResult create(String formatMime)
      {
        if (Constants.ACCEPT_HEADER_JSON.equals(formatMime))
        {
          return new CheckResult_SUCCESS("{ \"result\": \"Success\", \"reason\":\"\",\"duration\": {0} }");
        }
        else if (Constants.ACCEPT_HEADER_XML.equals(formatMime))
        {
          return new CheckResult_SUCCESS("<result>Success</result><duration>{0}</duration>");
        }
        else if (Constants.ACCEPT_HEADER_HTML.equals(formatMime))
        {
          return new CheckResult_SUCCESS(
              "<td bgcolor=\"#F0F0F0\"></td><td bgcolor=\"#F0F0F0\">{0}</td><td align=\"center\" bgcolor=\"#00FF00\">OK</td>");
        }
        else
        {
          return new CheckResult_SUCCESS("<result>Success</result><duration>{0}</duration>");
        }
      }

      private CheckResult_SUCCESS(String resultString)
      {
        super(resultString);
      }
    }

    private static class CheckResult_NULL extends CheckResult
    {
      private static CheckResult create(String formatMime)
      {
        if (Constants.ACCEPT_HEADER_JSON.equals(formatMime))
        {
          return new CheckResult_NULL("{ \"result\": \"None\", \"duration\": {0} }");
        }
        else if (Constants.ACCEPT_HEADER_XML.equals(formatMime))
        {
          return new CheckResult_NULL("<result>None</result><duration>{0}</duration>");
        }
        else if (Constants.ACCEPT_HEADER_HTML.equals(formatMime))
        {
          return new CheckResult_NULL(
              "<td bgcolor=\"#F0F0F0\">Unknown</td><td bgcolor=\"#F0F0F0\">{0}</td><td align=\"center\" bgcolor=\"#FFA500\">WARNING</td>");
        }
        else
        {
          return new CheckResult_NULL("<result>None</result><duration>{0}</duration>");
        }
      }

      private CheckResult_NULL(String resultString)
      {
        super(resultString);
      }
    }
  }
}

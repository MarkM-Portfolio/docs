package com.ibm.concord.viewer.platform;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.platform.conversionResult.ConversionConstants;
import com.ibm.concord.viewer.platform.conversionResult.ConversionResult;
import com.ibm.concord.viewer.platform.conversionResult.ConversionWarning;
import com.ibm.concord.viewer.platform.util.Constant;
import com.ibm.concord.viewer.platform.util.NFSFileUtil;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class ConversionUtils
{
  private static final Logger LOG = Logger.getLogger(ConversionUtils.class.getName());

  public static final String STATUS_CODE = "statusCode"; //$NON-NLS-1$

  private static final String JOB_RESULT_FILE_NAME = "result.json";

  private static final String FILE_PATH = "filePath"; //$NON-NLS-1$

  public final static String ENCRYPTION_DONE = "encryption.done";

  public static JSONObject getConversionResult(String path)
  {
    JSONObject convertResult = new JSONObject();
    ConversionResult result = new ConversionResult();
    String content = null;
    try
    {
      String resultPath = path + File.separator + JOB_RESULT_FILE_NAME;
      File f = new File(resultPath);
      if (f.exists())
      {
        content = NFSFileUtil.nfs_readFileAsString(new File(resultPath), NFSFileUtil.NFS_RETRY_SECONDS);
      }
      else
      {
        LOG.log(Level.FINE, "The file result.json does not exist.  Will try to open the file stream");

        FileInputStream fis = null;
        try
        {
          /*
           * For NFS volume, when actime is not set 0, the directory is always out of sync for a while, at viewer side list the directory
           * helps to force the directory synchronized, so the result.json can be read.
           */
          File resultfolder = new File(path);
          resultfolder.listFiles();

          fis = new FileInputStream(f);
          content = NFSFileUtil.nfs_readFileAsString(new File(resultPath), NFSFileUtil.NFS_RETRY_SECONDS);
          LOG.log(Level.FINE, "Read file content by openning stream");
        }
        catch (Exception e)
        {
          LOG.log(Level.FINE, "Error happened trying to open the file stream");
        }
        finally
        {
          if (fis != null)
          {
            try
            {
              fis.close();
            }
            catch (Exception e)
            {
              LOG.log(Level.FINE, "close stream IOException: " + f.getAbsolutePath(), e);
            }
          }
        }
        if (content == null)
        {
          convertResult.put(STATUS_CODE, HttpServletResponse.SC_ACCEPTED);
          return convertResult;
        }
      }
      JSONObject convRes = JSONObject.parse(content);
      result.setSucceed((Boolean) convRes.get("isSuccess"));
      result.setMimeType((String) convRes.get("mimeType"));
      result.setConvertedFilePath((String) convRes.get("targetFilePath"));

      List convWarnings = new ArrayList<ConversionWarning>();
      JSONArray errCodes = (JSONArray) convRes.get("errCodes");
      String correctType = null;
      long conv_errcode = 0;
      if (errCodes != null)
      {
        for (int i = 0; i < errCodes.size(); i++)
        {
          JSONObject warningObj = (JSONObject) errCodes.get(i);
          ConversionWarning convWarning = new ConversionWarning();
          convWarning.setFetureID((String) warningObj.get("id"));
          convWarning.setPreserved((Boolean) warningObj.get("isPreserved"));
          convWarning.setLocation((String) warningObj.get("location"));
          convWarning.setDescription((String) warningObj.get("description"));
          JSONObject paramObj = (JSONObject) warningObj.get("parameters");
          if (paramObj != null)
          {
            correctType = (String) paramObj.get("correctSourceMIMEType");
            Object o = paramObj.get("conv_err_code");
            if (o != null)
            {
              if (o instanceof Long)
              {
                conv_errcode = (Long) o;
              }
              else if (o instanceof String)
              {
                conv_errcode = Integer.parseInt((String) o);
              }
            }
          }
          result.addWarning(convWarning);
        }
      }

      if (!result.isSucceed())
      {
        String msg = null;
        if (result.getWarnings().size() > 0)
        {
          if (conv_errcode > 0)
            convertResult.put(Constant.CONV_ERR_CODE, conv_errcode);

          // Get error feature ID and error message
          ConversionWarning warning = result.getWarnings().get(result.getWarnings().size() - 1);

          msg = warning.getDescription();
          if (ConversionConstants.ERROR_FILE_IS_TOO_LARGE.equals(warning.getFetureID()))
          {
            convertResult.put(STATUS_CODE, Integer.valueOf(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE));
            return convertResult;
          }
          else if (ConversionConstants.ERROR_INVALID_FILE_PASSWORD.equals(warning.getFetureID()))
          {
            convertResult.put(STATUS_CODE, Integer.valueOf(ConversionConstants.ERROR_INVALID_FILE_PASSWORD));
            return convertResult;
          }
          else if (ConversionConstants.ERROR_UNSUPPORT_FILE_PASSWORD.equals(warning.getFetureID()))
          {
            convertResult.put(STATUS_CODE, Integer.valueOf(ConversionConstants.ERROR_UNSUPPORT_FILE_PASSWORD));
            return convertResult;
          }
          else if (ConversionConstants.ERROR_WORK_MANAGER_OVERTIME.equals(warning.getFetureID())
              || ConversionConstants.ERROR_SYM_JOB_OVERTIME.equals(warning.getFetureID()))
          {
            convertResult.put(STATUS_CODE, Integer.valueOf(ConversionConstants.ERROR_WORK_MANAGER_OVERTIME));
            return convertResult;
          }
          else if (ConversionConstants.ERROR_OUT_OF_QUEUE_SIZE.equals(warning.getFetureID()))
          {
            convertResult.put(STATUS_CODE, Integer.valueOf(ConversionConstants.ERROR_OUT_OF_QUEUE_SIZE));
            return convertResult;
          }
          else if (ConversionConstants.ERROR_SYM_CONNECTION_UNAVAILABLE.equals(warning.getFetureID()))
          {
            convertResult.put(STATUS_CODE, Integer.valueOf(ConversionConstants.ERROR_SYM_CONNECTION_UNAVAILABLE));
            return convertResult;
          }
          else if (ConversionConstants.ERROR_IO_EXCEPTION.equals(warning.getFetureID()))
          {
            convertResult.put(STATUS_CODE, Integer.valueOf(ConversionConstants.ERROR_IO_EXCEPTION));
            return convertResult;
          }
          else if (ConversionConstants.ERROR_SINGLE_PAGE_OVERTIME.equals(warning.getFetureID()))
          {
            convertResult.put(STATUS_CODE, Integer.valueOf(ConversionConstants.ERROR_SINGLE_PAGE_OVERTIME));
            return convertResult;
          }
          else if (ConversionConstants.ERROR_DOWNSIZE_ERROR.equals(warning.getFetureID()))
          {
            convertResult.put(STATUS_CODE, Integer.valueOf(ConversionConstants.ERROR_DOWNSIZE_ERROR));
            return convertResult;
          }
          else if (ConversionConstants.ERROR_EMPTY_FILE_ERROR.equals(warning.getFetureID()))
          {
            convertResult.put(STATUS_CODE, Integer.valueOf(ConversionConstants.ERROR_EMPTY_FILE_ERROR));
            return convertResult;
          }
          else if (ConversionConstants.ERROR_CORRUPTED_FILE_ERROR.equals(warning.getFetureID()))
          {
            convertResult.put(STATUS_CODE, Integer.valueOf(ConversionConstants.ERROR_CORRUPTED_FILE_ERROR));
            return convertResult;
          }
          else if (ConversionConstants.ERROR_INVALID_FILE_MIME_TYPE.equals(warning.getFetureID()))
          {
            convertResult.put(STATUS_CODE, Integer.valueOf(ConversionConstants.ERROR_INVALID_FILE_MIME_TYPE));
            convertResult.put("asFormat", correctType);
            if (correctType != null)
            {
              f.delete();
            }
            return convertResult;
          }
          else if (Integer.parseInt(warning.getFetureID()) == RepositoryAccessException.EC_REPO_NOPERMISSION)
          {
            convertResult.put(STATUS_CODE, RepositoryAccessException.EC_REPO_NOPERMISSION);
            return convertResult;
          }
          else if (Integer.parseInt(warning.getFetureID()) == RepositoryAccessException.EC_REPO_NOVIEWPERMISSION)
          {
            convertResult.put(STATUS_CODE, RepositoryAccessException.EC_REPO_NOVIEWPERMISSION);
            return convertResult;
          }
          else if (Integer.parseInt(warning.getFetureID()) == RepositoryAccessException.EC_REPO_NOEDITPERMISSION)
          {
            convertResult.put(STATUS_CODE, RepositoryAccessException.EC_REPO_NOEDITPERMISSION);
            return convertResult;
          }
          else if (Integer.parseInt(warning.getFetureID()) == RepositoryAccessException.EC_REPO_NOTFOUNDDOC)
          {
            convertResult.put(STATUS_CODE, RepositoryAccessException.EC_REPO_NOTFOUNDDOC);
            return convertResult;
          }
          else if (Integer.parseInt(warning.getFetureID()) == RepositoryAccessException.EC_REPO_CANNOT_FILES)
          {
            convertResult.put(STATUS_CODE, RepositoryAccessException.EC_REPO_CANNOT_FILES);
            return convertResult;
          }
          else if (Integer.parseInt(warning.getFetureID()) == RepositoryAccessException.EC_REPO_OUT_OF_SPACE)
          {
            convertResult.put(STATUS_CODE, RepositoryAccessException.EC_REPO_OUT_OF_SPACE);
            return convertResult;
          }
          else if (Integer.parseInt(warning.getFetureID()) == RepositoryAccessException.EC_REPO_CANNOT_EDIT_LOCKED_DOC)
          {
            convertResult.put(STATUS_CODE, RepositoryAccessException.EC_REPO_CANNOT_EDIT_LOCKED_DOC);
            return convertResult;
          }
          else if (Integer.parseInt(warning.getFetureID()) == ConversionConstants.SNAPSHOT_DRAFTSTORAGE_ACCESS_ERROR)
          {
            convertResult.put(STATUS_CODE, ConversionConstants.SNAPSHOT_DRAFTSTORAGE_ACCESS_ERROR);
            return convertResult;
          }
          else if (Integer.parseInt(warning.getFetureID()) == ConversionConstants.SNAPSHOT_DRAFTDATA_ACCESS_ERROR)
          {
            convertResult.put(STATUS_CODE, ConversionConstants.SNAPSHOT_DRAFTDATA_ACCESS_ERROR);
            return convertResult;
          }
        }
        else
        {
          try
          {
            Object errorCode = convRes.get("id");
            if (errorCode != null)
            {
              Long errorLongCode = (Long) errorCode;
              convertResult.put(STATUS_CODE, errorLongCode.intValue());
              return convertResult;
            }
          }
          catch (Exception e)
          {
            LOG.log(Level.WARNING, "Failed to get id property from result.json.");
          }
        }

        convertResult.put(STATUS_CODE, Integer.valueOf(ConversionConstants.HTTP_RESPONSE_UNKNOWN_CONVERSION_ERROR));
        return convertResult;
      }
      String fileName = "";
      String convertedFilePath = result.getConvertedFilePath();
      if (convertedFilePath.indexOf("\\") >= 0)
      {
        fileName = convertedFilePath.substring(convertedFilePath.lastIndexOf("\\") + 1);
      }
      else
      {
        fileName = convertedFilePath.substring(convertedFilePath.lastIndexOf("/") + 1);
      }
      String resultFilePath = path + File.separator + fileName;
      convertResult.put(FILE_PATH, resultFilePath);
      convertResult.put(STATUS_CODE, HttpServletResponse.SC_OK);
      return convertResult;
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "The result.json cannot be parsed as json. Path:" + path + File.separator + JOB_RESULT_FILE_NAME);

      convertResult.put(STATUS_CODE, Integer.valueOf(ConversionConstants.HTTP_RESPONSE_UNKNOWN_CONVERSION_ERROR));
      return convertResult;
    }
  }
}

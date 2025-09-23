package com.ibm.concord.viewer.serviceability;

/**
 * 
 * @author Yin Dali The serviceability log message are defined here. Message code 0 - 399, information. 400 - 699, warning. 700 - 999 severe
 *         error message.
 */

public class ServiceCode
{
  // view a document from Connections Files
  public final static int INFO_VIEW_FROM_FILES = 1;

  public final static String S_INFO_VIEW_FROM_FILES = "View document from Lotus Connection Files.";

  // view a document from Community
  public final static int INFO_VIEW_FROM_COMMUNITY = 2;

  public final static String S_INFO_VIEW_FROM_COMMUNITY = "View document from Lotus Connection Community.";

  // view a document from iNotes
  public final static int INFO_VIEW_FROM_INOTES = 3;

  public final static String S_INFO_VIEW_FROM_INOTES = "View document from iNotes.";

  // no view perssion
  public final static int INFO_NO_VIEW_PERMISSION = 4;

  public final static String S_INFO_NO_VIEW_PERMISSION = "There is no view permission.";

  // document is encrypted
  public final static int INFO_DOCUMENT_ENCRYPTED = 5;

  public final static String S_INFO_DOCUMENT_ENCRYPTED = "The document is encrypted.";

  // Conversion cache exists.
  public final static int INFO_CONVERSION_NOT_NEEDED = 6;

  public final static String S_INFO_CONVERSION_NOT_NEEDED = "The cache exists. Conversion is not needed.";

  // Need start a conversion.
  public final static int INFO_CONVERSION_NEEDED = 7;

  public final static String S_INFO_CONVERSION_NEEDED = "Need to start a new conversion.";

  // Get document from EJB server
  public final static int INFO_GET_EJB_DOCUMENT = 8;

  public final static String S_INFO_GET_EJB_DOCUMENT = "Get document from repository by EJB. ";

  public final static int INFO_EDIT_AUTHORIZATION = 9;

  public final static String S_INFO_EDIT_AUTHORIZATION = "The user is not authorized as an Editor";

  // File existed and no need to move.
  public final static int INFO_FILE_EXISTED = 10;

  public final static String S_INFO_FILE_EXISTED = "File existed and no need to move.";

  // Principal is empty and will redirect to login page.
  public final static int INFO_PRINCIPAL_EMPTY = 11;

  public final static String S_INFO_PRINCIPAL_EMPTY = "The principal is empty and will redirect to login page.";

  // Cachelize
  public final static int INFO_CONVERSION_CACHELIZE = 12;

  public final static String S_INFO_CONVERSION_CACHELIZE = "Need to cachelize upload results.";

  // view a document from CCM
  public final static int INFO_VIEW_FROM_CCM = 13;

  public final static String S_INFO_VIEW_FROM_CCM = "View document from CCM.";

  // view a document from Verse
  public final static int INFO_VIEW_FROM_VERSE = 14;

  public final static String S_INFO_VIEW_FROM_VERSE = "View document from Verse.";

  // no view perssion
  public final static int ERROR_ACESS_REPOSITORY = 400;

  public final static String S_ERROR_ACCESS_REPOSITORY = "Can't access the document repository.";

  // Can't get document meta information
  public final static int ERROR_GET_DOC_ENTRY = 401;

  public final static String S_ERROR_GET_DOC_ENTRY = "Document is not found.";

  // The mime type is not supported
  public final static int ERROR_UNSUPPORTTED_MIME = 402;

  public final static String S_ERROR_UNSUPPORTTED_MIME = "Unsupported MIME type.";

  // Can't get the cluster which hosts the Files
  public final static int ERROR_FILES_CLUSTER = 403;

  public final static String S_ERROR_FILES_CLUSTER = "The Lotus Connections Files is not installed on a websphere cluster";

  // Lotus Connections Files configuration file doesn't exist
  public final static int ERROR_LOTUS_CONNECTIONS_CONFIGURATION = 404;

  public final static String S_ERROR_LOTUS_CONNECTIONS_CONFIGURATION = "The Lotus Connections config file doesn't exists.";

  // Not an authenticated user
  public final static int ERROR_NOT_AUTHENTICATED_USER = 405;

  public final static String S_ERROR_NOT_AUTHENTICATED_USER = "The user is not authenticated.";

  // The request jobId is invalid
  public final static int ERROR_INVALID_JOBID = 406;

  public final static String S_ERROR_INVALID_JOBID = "The request jobID is invalid.";

  // The Journal is not configured successfully
  public final static int ERROR_JOURNAL_CONFIG_ERROR = 407;

  public final static String S_ERROR_JOURNAL_CONFIG_ERROR = "The Journal is not configured successfully.";

  // The worker failed to start
  public final static int ERROR_WORK_UNABLE_START = 408;

  public final static String S_ERROR_WORK_UNABLE_START = "WorkManager failed to start work.";

  // Conversion error occurred
  public final static int ERROR_CONVERSION_EXCEPTION = 409;

  public final static String S_ERROR_CONVERSION_EXCEPTION = "Conversion error occurred.";

  // No access to operate on the cache directory
  public final static int ERROR_ACESS_CACHE_DATA = 410;

  public final static String S_ERROR_ACESS_CACHE_DATA = "Can't access cache directory.";

  // Moving image file failed.
  public final static int ERROR_MOVE_FILE_FAILED = 411;

  public final static String S_ERROR_MOVE_FILE_FAILED = "Moving file failed.";

  // The file is corrupted.
  public final static int ERROR_FILE_CORRUPTED = 412;

  public final static String S_ERROR_FILE_CORRUPTED = "The file is corrupted.";

  // the request URL is malformed
  public final static int SEVERE_MALFORMED_URL = 700;

  public final static String S_SEVERE_MALFORMED_URL = "Malformed requested URL.";

  // Connections isn't correct
  public final static int SEVERE_CONNECTIONS_NOT_CONNECTED = 701;

  public final static String S_SEVERE_CONNECTIONS_NOT_CONNECTED = "Connections is not connected.";

  // The media size exceeds limitation
  public final static int SEVERE_MEDIA_SIZE_EXCEEDS = 702;

  public final static String S_SEVERE_MEDIA_SIZE_EXCEEDS = "The document size exceeds the limitation.";

  // Error when download the document file.
  public final static int SEVERE_GET_DOCUMENT_FILE_ERROR = 703;

  public final static String S_SEVERE_GET_DOCUMENT_FILE_ERROR = "Get download document file.";

  // Get EJB document error
  public final static int SEVERE_GET_EJB_DOCUMENT_ERROR = 704;

  public final static String S_SEVERE_GET_EJB_DOCUMENT_ERROR = "Get download document file.";

  // NFS storage is full
  public final static int SEVERE_STORAGE_FULL = 705;

  public final static String S_SEVERE_STORAGE_FULL = "Unable to write a file with content.";

  // Unknown error
  public final static int SEVERE_UNKNOWN_ERROR = 706;

  public final static String S_SEVERE_UNKNOWN_ERROR = "Unkown error occurred when importing document.";

  public static final String HOUSEKEEPING_INFO = "CLFAF010I";

  public static final String HOUSEKEEPING_WARNING = "CLFAF010W";
}

package com.ibm.docs.viewer.automation.action;

public class EventInfo {
	  public static final String USERNAME = "userid";

	   public static final String DOCUMENT = "docId";

	   public static final String EXTENSION = "extension";

	   public static final String DISPLAYNAME = "displayname";

	   public static final String EMAIL = "email";

	   public static final String RELATIVEPATH = "relativepath";

	   public static final String MODIFIED = "modified";

	   public static final String MIMETYPE = "mimetype";

	   public static final String TITLE = "title";

	   public static final String VERSION = "version";

	   public static final String FILESIZE = "fileSize";

	   public static final String REQUEST = "request";

	   public static final String REPOSITORY = "repository";

	public enum EventType {
		PURGE_CACHE, GENERATE_THUMBNAIL, UPLOAD_CONVERSION, UPLOAD_FILE;
	}

	public String actorId;

	public String actorEmail;

	public String actorName;

	public String extention;

	public String docId;

	public String relativePath;

	public String modified;

	public String minetype;

	public String title;

	public String version;

	public String fileSize;

	public EventType request;

	public String repoId;

}

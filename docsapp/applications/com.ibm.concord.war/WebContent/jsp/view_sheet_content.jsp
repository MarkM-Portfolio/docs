<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@page import="java.io.File,
	org.apache.commons.io.FileUtils,
	org.apache.commons.io.IOUtils,
	java.io.BufferedReader,
	java.io.InputStream,
	java.io.FileReader,
	java.io.BufferedInputStream,
	java.io.Reader,
	java.io.InputStreamReader,
	java.nio.charset.Charset"%><div id="sheetContainer"></div><%--
	request.setCharacterEncoding("utf-8");
	String cacheDir = request.getParameter("cacheDir");
	// security risk here when getParameter, check defect 14394.
	
	File contentFile = new File(cacheDir, "content.html");
	InputStream fileIn = null;
	try
	{
		fileIn = FileUtils.openInputStream(contentFile);
		Reader reader = new BufferedReader(new InputStreamReader(new BufferedInputStream(fileIn), Charset.forName("utf-8")));
		char[] buf = new char[1024];
		int n;
		while ((n = reader.read(buf)) != -1)
		{
		  out.write(buf, 0, n);
		}
		reader.close();
	}
	finally
	{
	  if (fileIn != null)
	  {
	    IOUtils.closeQuietly(fileIn);
	  }
	}
--%>

<%-- ***************************************************************** --%>
<%--                                                                   --%>
<%-- IBM Confidential                                                  --%>
<%--                                                                   --%>
<%-- IBM Docs Source Materials                                         --%>
<%--                                                                   --%>
<%-- (c) Copyright IBM Corporation 2012. All Rights Reserved.          --%>
<%--                                                                   --%>
<%-- U.S. Government Users Restricted Rights: Use, duplication or      --%>
<%-- disclosure restricted by GSA ADP Schedule Contract with IBM Corp. --%>
<%--                                                                   --%>
<%-- ***************************************************************** --%>


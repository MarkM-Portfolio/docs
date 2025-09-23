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

<!--
 * @view page mode
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
-->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<%@page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
	
<%@ page import="java.io.*" %>
<%@ page import="java.net.*" %>
<%@ page import="java.util.UUID" %>

<%

String secureToken=request.getSession().getAttribute("secureToken").toString();
String absolutePath = getServletContext().getRealPath("/");
String currentDocId = "08a59ac7-501a-42f0-92ed-488b0ede5851";
String docIdToReplace = request.getParameter("docId");
String srcFileName = absolutePath + "/sampleDoc/ipadDemoConcordDoc2/content.html";
String dstFileName = "C:/Concord Data/draft/"+docIdToReplace+"/content.html";
String cacheSrcFileName = absolutePath + "/sampleDoc/ipadDemoConcordDoc2/"+currentDocId ;
String cacheDstFileName = "C:/Concord Data/cache/"+docIdToReplace;

try {
/*
	//release the cache, deleting the cache file
	DocumentStateCache.release(UUID.fromString(docIdToReplace));
	
	//delete the cache file again just in case the above statement fails.
	File f = new File(cacheFileName);
	boolean deleteSuccess = f.delete();
	System.out.println("deleteSuccess:"+deleteSuccess);
	//if delete success is false meaning the file does not exist.
*/
	int i = 0;
	while (i<2) { //do this twice, first for content html, then second for cache file
		//reset the content of the content.html in draft folder
		if(i == 1) {
			srcFileName = cacheSrcFileName;
			dstFileName = cacheDstFileName;
		}
	  	System.out.println("srcFileName:"+srcFileName);
		File srcFile = new File(srcFileName);
		System.out.println("srcFile:"+srcFile);
		System.out.println("srcFile.exists:"+srcFile.exists());
		File dstFile = new File(dstFileName);
		if (!srcFile.exists()) {
			throw new IOException("No source file: " + srcFileName);
		}
		if (dstFile.exists()) {
			if (!dstFile.canWrite()) {
				throw new IOException("Destination read-only: " + dstFileName);
			}
		}
		else {
			//throw new IOException("Destination not created: " + dstFileName);
			 dstFile.createNewFile();
		}
		BufferedReader reader = new BufferedReader(new FileReader(srcFile));
		FileWriter writer = new FileWriter(dstFile);
		String line = "";
		while((line = reader.readLine()) != null)
	    {
	        //oldtext += line + "\r\n";
	        //replace currentdocId with docIdToReplace
	        String newtext = line.replaceAll(currentDocId, docIdToReplace);
	        writer.write(newtext);
	    }
	    reader.close();
	    writer.close();
	    i++;
    }//end outer while
    %>
    <strong style="color: blue; background-color:gold;">The document <%=docIdToReplace %> has been reset.</strong>
    <% 
}
catch (MalformedURLException me){ %>
<strong style="color: red; background-color:gold;">
Malformed URL Exception<br>
<%=me.getMessage()%> 
</strong>
<%
  
  }
catch (IOException ex) { %>
<strong style="color: red; background-color:gold;">
IO Exception<br>
<%=ex.getMessage()%>
</strong>
<% }
 
%>
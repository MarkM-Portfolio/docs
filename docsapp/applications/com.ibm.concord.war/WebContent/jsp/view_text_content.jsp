<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@page import="java.io.File,
	org.apache.commons.io.FileUtils,
	org.apache.commons.io.LineIterator,
	java.util.regex.Matcher,
	java.util.regex.Pattern"%>
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

	<div id="textContainer"></div>
<%!	

	String bodyClass = "";
	String bodyWidth = "";
	String bodyBGColor = "";
/*
//Comment it for #defect 14395. The file is not used.	
	public String getProperty(String property,String s) {
		String result = "";
		int start = s.indexOf(property);
		if(start < 0 )
			return result;
			
		start = s.indexOf(":", start);
		int end = s.indexOf(";", start);
		if(end < 0)
		{
			end = s.indexOf("!important", start);
			if(end < 0)
				end = s.length();
		}
		else
		{
			// !important
			int end2 = s.indexOf("!important", start);
			if(end2 > 0 && end2 < end)
			  end = end2;
		}
		
		if(start > 0 )
		{
			result = s.substring(start + 1, end);
		}
		return result;
	}
	public String doReg(String src, String reg) {
		Pattern p = Pattern.compile(reg);
		Matcher m = p.matcher(src);
		boolean hasClass = false;
		
		StringBuilder sb = new StringBuilder();
		while (m.find()) {
			String s = m.group(1);
			if (!s.startsWith("style"))
				sb.append(s + " ");
			else
			{
				bodyWidth = getProperty("width",s);
				bodyBGColor = getProperty("background-color",s);
			}

			if(s.startsWith("class")){
				bodyClass = s.split("\"|'")[1];
				hasClass = true;
			}
		}
		if(!hasClass){
			bodyClass = "";
		}
		return sb.toString();
	}
	
	public String doContentEditable(String src, String reg){
		Pattern p = Pattern.compile(reg);
		Matcher m = p.matcher(src);
		
		StringBuilder sb = new StringBuilder();
		while (m.find()) {
			String s = m.group(1);
			if(s.indexOf("contenteditable") >= 0){
				s = " contenteditable='false' ";
			}
			sb.append(s);
		}
		
		return sb.toString();
	}
	*/
%>
<%
	/*
	request.setCharacterEncoding("utf-8");
	String cacheDir = (String)request.getParameter("cacheDir");
	File contentFile = new File(cacheDir, "content.html");
	LineIterator iter = FileUtils.lineIterator(contentFile, "utf-8");
	while (iter.hasNext())
	{
	  String s = iter.nextLine();
	  if(s.startsWith("<body")){//when converting from odt, remove the body style
	  		String regex_2 = "([a-z]+\\s*=\\s*\"[^\"|\\\"]*\")[\\s+|>]";
			String regex_3 = "([a-z]+\\s*=\\s*\'[^\']*\')[\\s+|>]";
			
			StringBuilder sb = new StringBuilder();
			sb.append("<body ");
		
			sb.append(doReg(s, regex_3)).append(" ");
			sb.append(doReg(s, regex_2)).append(" ");

			sb.append(">");
			s = sb.toString();
	  }
	  if(s.indexOf("contenteditable") >= 0){

	  		s = s.replaceAll("contenteditable\\d*=\\d*(\"|\')true\\d*(\"|\')","contenteditable=\"false\"");
	  }
	  
	  out.write(s);
	}
	iter.close(); 
	*/
%>
<script type="text/javascript">
	var bodyClass = "<%=bodyClass %>";
	var bodyWidth = "<%= bodyWidth %>";
	var bodyBGColor = "<%=bodyBGColor%>";
</script>

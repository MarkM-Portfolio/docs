<%@ page language="java" contentType="text/html; charset=UTF-8"
  pageEncoding="UTF-8"
  import="com.ibm.json.java.JSONArray,
  com.ibm.json.java.JSONObject,
  java.util.HashMap"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Sanity Report</title>
<%
  JSONObject resultJSON = (JSONObject) request.getAttribute("reportData");  
  String messageString = request.getAttribute("Messages").toString();
  HashMap<String, String> bgColorMap = new HashMap<String, String>();
  bgColorMap.put("OK", "#00FF00");
  bgColorMap.put("FAIL", "#FF0000");
  bgColorMap.put("WARNING", "#FFA500");
%>
<style>
	.messagebox {
	  padding: 5px;
	  margin-top: 5px;
	  background-color:#f2dede;
	  border-color:#ebccd1;
	  border: 1px solid;
	  border-radius: 4px;
	  color:#a94442;
	}
</style>
</head>
<body>

<table border="0" bgcolor="darkGray">
  <tr>
    <th aligh="left"><font color="#FFFFFF">SANITY CHECK REPORT - IBM DOCS & CONVERSION</font></th>
  </tr>
  <tr>
    <td>
    <table border="0">
      <tr bgcolor="#FFFFFF">
        <th>Hostname</th>
        <th>Test</th>
        <th>Details</th>
        <th>Status</th>
        <th>Duration</th>
        <th>Result</th>
      </tr>
        <%
        JSONObject checkPoint = null;
        JSONObject checkPointResults = null;
        String details = null;    
        String duration = null;    
        String name = null;    
        String reason = null;    
        String result= null;    
        for (Object hostName : resultJSON.keySet())
        {      
          JSONArray checkPoints = (JSONArray) resultJSON.get(hostName);  
          int cpCount = checkPoints.size();
          for (int i = 0; i < cpCount; i++) 
          {
            checkPoint = (JSONObject) checkPoints.get(i);
            checkPointResults = (JSONObject) checkPoint.get("checkpoint");
            details = checkPointResults.get("details").toString();
            duration = checkPointResults.get("duration").toString();
            name = checkPointResults.get("name").toString();
            reason = checkPointResults.get("reason").toString();
            result = checkPointResults.get("result").toString();
            if( "Success".equalsIgnoreCase(result) )
            {
              result = "OK";
            }
            else if( "Failed".equalsIgnoreCase(result) )
            {
              result = "FAIL";
            }
            else if( "None".equalsIgnoreCase(result) )
            {
              result = "WARNING";
            }            
            %>
            <tr>
              <% if( i == 0 ) {%>
              <td rowspan=<%= cpCount%> style="white-space: nowrap" bgcolor="#F0F0F0"><%= hostName %></td>
              <%} %>
              <td bgcolor="#F0F0F0"><%= name %></td>
              <td bgcolor="#F0F0F0"><%= details %></td>
              <td bgcolor="#F0F0F0"><%= reason %></td>
              <td bgcolor="#F0F0F0"><%= duration %></td>
              <td align="center" bgcolor="<%=bgColorMap.get(result) %>"><%=result %></td>
            </tr>   
            <%          
          }
        }
        %>
    </table>
    </td>
  </tr>
</table>
<%if( messageString.length() > 0 ) { %>
<div class="messagebox"><b>Warning!</b><br/><%=messageString.toString() %></div>
<%} %>
</body>
</html>
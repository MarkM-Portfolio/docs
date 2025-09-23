package com.ibm.concord.document.common.pres;

import com.ibm.json.java.JSONObject;

public class TaskContainer extends Model
{

  private String content;

  public String getHTML()
  {
    String div = this.gartherAttrs(null);
    div += this.content;
    div += "</div>";
    return div;
  }

  public static TaskContainer fromJson(JSONObject obj)
  {
    TaskContainer tc = new TaskContainer();

    tc.id = obj.get("id").toString();

    if (obj.containsKey("content"))
      tc.content = obj.get("content").toString();

    if (obj.containsKey("attrs"))
    {
      tc.attrs = (JSONObject) obj.get("attrs");
    }
    return tc;
  }

  public String getContent()
  {
    return content;
  }

  public void setContent(String content)
  {
    this.content = content;
  }

}

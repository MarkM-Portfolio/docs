package com.ibm.concord.document.common.pres;

import com.ibm.json.java.JSONObject;

public class ShapeProp extends Model
{
  private String type;

  private String content;

  public String getType()
  {
    return this.type;
  }

  public String getContent()
  {
    return this.content;
  }

  public ShapeProp(JSONObject json)
  {
    if (!json.isEmpty())
    {
      this.id = json.get("id").toString();
      if (json.containsKey("attrs"))
        this.attrs = (JSONObject) json.get("attrs");
      this.type = json.get("type").toString();
      this.content = json.get("content").toString();
    }
  }

  public String getHTML()
  {
    String html = this.gartherAttrs(this.type);
    html += this.content;
    html += "</" + this.type + ">";

    return html;
  }

}

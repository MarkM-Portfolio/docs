package com.ibm.concord.document.common.pres;

import com.ibm.json.java.JSONObject;

public class ShapeFill extends Model
{
  private String type;

  public String getType()
  {
    return this.type;
  }

  public ShapeFill(JSONObject json)
  {
    if (!json.isEmpty())
    {
      this.id = json.get("id").toString();
      if (json.containsKey("attrs"))
        this.attrs = (JSONObject) json.get("attrs");
      this.type = json.get("type").toString();
    }
  }

  public String getHTML()
  {
    String html = this.gartherAttrs(this.type);
    html += "</" + this.type + ">";
    return html;
  }

}

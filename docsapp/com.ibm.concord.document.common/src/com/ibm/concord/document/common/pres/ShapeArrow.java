package com.ibm.concord.document.common.pres;

import com.ibm.json.java.JSONObject;

public class ShapeArrow extends Model
{
  private String path;
  private byte circle;

  public String getPath()
  {
    return this.path;
  }

  public ShapeArrow(JSONObject json)
  {
    if (!json.isEmpty())
    {
      this.id = json.get("id").toString();
      if (json.containsKey("attrs"))
        this.attrs = (JSONObject) json.get("attrs");
      if (json.containsKey("path"))
        this.path = json.get("path").toString();
      else if (json.containsKey("circle"))
        this.circle = Byte.parseByte(json.get("circle").toString());
    }
  }

  public String getHTML()
  {
    if (this.path != null)
      this.attrs.put("d", this.path);

    String tag = "path";
    if (this.circle == 1)
      tag = "circle";
    String html = this.gartherAttrs(tag);
    html += "</" + tag + ">";

    return html;
  }

}

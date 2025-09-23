package com.ibm.concord.document.common.pres;

import com.ibm.json.java.JSONObject;

public class ShapeLine extends Model
{
  private ShapeSvg parent;

  public ShapeLine(JSONObject json, ShapeSvg parent)
  {
    if (!json.isEmpty())
    {
      this.id = json.get("id").toString();
      if (json.containsKey("attrs"))
        this.attrs = (JSONObject) json.get("attrs");

      this.parent = parent;
    }
  }

  public String getHTML()
  {
    this.attrs.put("d", this.parent.getPath());

    String tag = "path";
    String html = this.gartherAttrs(tag);
    html += "</" + tag + ">";

    return html;
  }

}

package com.ibm.concord.document.common.pres;

import java.util.Iterator;
import java.util.Map;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class ShapeImg extends Model
{
  private String divId;

  public ShapeImg(JSONObject json)
  {
    if (!json.isEmpty())
    {
      this.id = json.get("id").toString();
      if (json.containsKey("attrs"))
        this.attrs = (JSONObject) json.get("attrs");
      this.divId = json.get("divId").toString();
    }
  }

  public String getHTML()
  {
    return null;
  }

  public String getDivId()
  {
    return this.divId;
  }

  public String getHTML(JSONArray others)
  {
    String html = "<div";
    html += " id=\"" + this.divId + "\"";
    // TODO: maybe boxId need be added
    html += " class=\"g_draw_frame bc\" style=\"position:absolute;left:0%;top:0%;width:100%;height:100%;\" presentation_class=\"graphic\" text_anchor-type=\"paragraph\" draw_layer=\"layout\" tabindex=\"0\"";
    html += ">";

    String tag = "img";
    html += this.gartherAttrs(tag);
    html += "</" + tag + ">";

    if (others != null)
    {
      for (int i = 0; i < others.size(); i++)
      {
        JSONObject other = (JSONObject) others.get(i);
        String tagName = (String) other.get("tagName");
        String otherHtml = "<" + tagName;
        JSONObject attrs = (JSONObject) other.get("attrs");
        if (attrs != null)
        {
          Iterator it = attrs.entrySet().iterator();
          while (it.hasNext())
          {
            Map.Entry pairs = (Map.Entry) it.next();
            String key = pairs.getKey().toString();
            String value = pairs.getValue().toString();
            String span = " " + key + "=\"" + value + "\"";
            otherHtml += span;
          }
        }
        otherHtml += ">";
        otherHtml += (String) other.get("content");
        otherHtml += "</" + tagName + ">";
        html += otherHtml;
      }
    }

    html += "</div>";
    return html;
  }

}

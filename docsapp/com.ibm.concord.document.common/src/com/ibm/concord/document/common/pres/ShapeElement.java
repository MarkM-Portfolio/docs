package com.ibm.concord.document.common.pres;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class ShapeElement extends Element
{
  private String dataId;

  private Element txtBox;

  private ShapeImg img;

  private ShapeSvg svg;

  private JSONArray others;

  public ShapeElement(JSONObject json)
  {
    if (!json.isEmpty())
    {
      if (json.containsKey("dataId"))
        this.dataId = json.get("dataId").toString();
      if (json.containsKey("txtBox"))
        this.txtBox = ShapeElement.fromJson((JSONObject) json.get("txtBox"));
      if (json.containsKey("img"))
        this.img = new ShapeImg((JSONObject) json.get("img"));
      if (json.containsKey("svg"))
        this.svg = new ShapeSvg((JSONObject) json.get("svg"));
      if (json.containsKey("others"))
      {
        this.others = (JSONArray) json.get("others");
      }
    }
  }

  public String getDataId()
  {
    return this.dataId;
  }

  public Element getTxtBox()
  {
    return this.txtBox;
  }

  public ShapeImg getImg()
  {
    return this.img;
  }

  public ShapeSvg getSvg()
  {
    return this.svg;
  }

  public String getHTML()
  {
    // main node
    String html = this.gartherAttrs("div");

    // data node
    html += "<div";
    html += " id=\"" + this.dataId + "\"";
    html += " class=\"contentBoxDataNode\" style=\"position:relative;left:0%;top:0%;height:100%;width:100%;\" tabindex=\"0\"";
    if (this.svg != null)
      html += " aria-labelledby=\"" + this.svg.getId() + "\"";
    html += ">";

    // IMG or SVG
    if (this.img != null)
    {
      html += this.img.getHTML(this.others);
    }
    else if (this.svg != null)
    {
      html += this.svg.getHTML(this.others);
    }

    // Text content box
    if (this.txtBox != null)
      html += this.txtBox.getHTML();

    html += "</div></div>"; // data node and main node

    return html;
  }

}

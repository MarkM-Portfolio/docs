package com.ibm.concord.document.common.pres;

import com.ibm.json.java.JSONObject;

public class Element extends Model
{

  private String content;

  private boolean isNotes;

  private float w, h, t, l;

  private int z;

  private float slideH, slideW;


  public String getHTML()
  {
    String div = this.gartherAttrs(null);
    div += this.content;
    div += "</div>";
    return div;
  }

  public static Element fromJson(JSONObject obj)
  {
    Element element = null;
    String family = obj.get("family").toString();
    if (family.equalsIgnoreCase("table"))
    {
      element = new TableElement();
      Table table = new Table((JSONObject) obj.get("table"));
      ((TableElement) element).setTable(table);
    }
    else if (family.equalsIgnoreCase("group"))
    {
      element = new ShapeElement(obj);
    }
    else
      element = new Element();

    element.id = obj.get("id").toString();
    element.w = Float.parseFloat(obj.get("w").toString());
    element.h = Float.parseFloat(obj.get("h").toString());
    element.t = Float.parseFloat(obj.get("t").toString());
    element.l = Float.parseFloat(obj.get("l").toString());
    element.z = Integer.parseInt(obj.get("z").toString());

    if (obj.containsKey("content"))
      element.content = obj.get("content").toString();

    if (obj.containsKey("isNotes"))
    {
      element.isNotes = (Boolean) obj.get("isNotes");
    }

    if (obj.containsKey("attrs"))
    {
      element.attrs = (JSONObject) obj.get("attrs");
    }

    if (obj.containsKey("slideH"))
    {
      element.slideH = Float.parseFloat(obj.get("slideH").toString());
    }
    if (obj.containsKey("slideW"))
    {
      element.slideW = Float.parseFloat(obj.get("slideW").toString());
    }

    return element;
  }

  public String getContent()
  {
    return content;
  }

  public void setContent(String content)
  {
    this.content = content;
  }

  public boolean isNotes()
  {
    return isNotes;
  }

  public void setNotes(boolean isNotes)
  {
    this.isNotes = isNotes;
  }

  public float getW()
  {
    return w;
  }

  public void setW(float w)
  {
    this.w = w;
  }

  public float getH()
  {
    return h;
  }

  public void setH(float h)
  {
    this.h = h;
  }

  public float getT()
  {
    return t;
  }

  public void setT(float t)
  {
    this.t = t;
  }

  public float getL()
  {
    return l;
  }

  public void setL(float l)
  {
    this.l = l;
  }

  public int getZ()
  {
    return z;
  }

  public void setZ(int z)
  {
    this.z = z;
  }

}

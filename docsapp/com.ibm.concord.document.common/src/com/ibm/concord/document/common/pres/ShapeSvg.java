package com.ibm.concord.document.common.pres;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class ShapeSvg extends Model
{
  private String divId;
  
  private String shapeVersion;

  private JSONObject frm;

  private String path;

  private ArrayList<String> cpath;

  private JSONObject gap;

  private JSONObject av;

  private HashMap<String, Object> prop;

  private ShapeFill fill;

  private ShapeLine line;

  private ArrayList<ShapeArrow> arrows;

  private String title;
  
  private byte dir;  // line shape dir

  public String getDivId()
  {
    return this.divId;
  }

  public JSONObject getFrm()
  {
    return this.frm;
  }

  public String getPath()
  {
    return this.path;
  }

  public ArrayList<String> getCPath()
  {
    return this.cpath;
  }

  public JSONObject getGap()
  {
    return this.gap;
  }

  public JSONObject getAv()
  {
    return this.av;
  }

  public HashMap<String, Object> getProp()
  {
    return this.prop;
  }

  public ShapeFill getFill()
  {
    return this.fill;
  }

  public ShapeLine getLine()
  {
    return this.line;
  }

  public ArrayList<ShapeArrow> getArrows()
  {
    return this.arrows;
  }

  public String getTitle()
  {
    return this.title;
  }
  
  public byte getDir()
  {
    return this.dir;
  }

  public ShapeSvg(JSONObject json)
  {
    if (!json.isEmpty())
    {
      this.id = json.get("id").toString();
      this.divId = json.get("divId").toString();
      
      String shapeVersion = (String) json.get("shapeVersion");
      if(shapeVersion!=null && shapeVersion.length()>0)
    	  this.shapeVersion = shapeVersion;
      else
    	  this.shapeVersion = "1.5";
    	  
      this.frm = (JSONObject) json.get("frm");
      this.path = json.get("path").toString();
      if (json.containsKey("cpath"))
      {
        JSONArray arrayCPaths = (JSONArray) json.get("cpath");
        int len = arrayCPaths.size();
        if (len > 0)
        {
          this.cpath = new ArrayList<String>();
          for (int i = 0; i < len; i++)
          {
            String cpath = arrayCPaths.get(i).toString();
            this.cpath.add(cpath);
          }
        }
      }
      this.gap = (JSONObject) json.get("gap");
      if (json.containsKey("dir"))
        this.dir = Byte.parseByte(json.get("dir").toString());
      else
        this.dir = -1;

      if (json.containsKey("av"))
        this.av = (JSONObject) json.get("av");

      if (json.containsKey("prop"))
      {
        JSONObject jsonProp = (JSONObject) json.get("prop");
        this.prop = new HashMap<String, Object>();

        // Clip path including clip rule and id
        if (jsonProp.containsKey("cp"))
          this.prop.put("cp", jsonProp.get("cp"));
        // Gradients
        if (jsonProp.containsKey("grads"))
        {
          JSONArray arrayGrads = (JSONArray) jsonProp.get("grads");
          int len = arrayGrads.size();
          if (len > 0)
          {
            ArrayList<ShapeProp> grads = new ArrayList<ShapeProp>();
            this.prop.put("grads", grads);
            for (int i = 0; i < len; i++)
            {
              ShapeProp prop = new ShapeProp((JSONObject) arrayGrads.get(i));
              grads.add(prop);
            }
          }
        }
        // Pattern
        if (jsonProp.containsKey("ptn"))
        {
          JSONObject jsonPtn = (JSONObject) jsonProp.get("ptn");
          ShapeProp prop = new ShapeProp(jsonPtn);
          this.prop.put("ptn", prop);
        }
      }

      // Fill
      if (json.containsKey("fill"))
      {
        JSONObject jsonFill = (JSONObject) json.get("fill");
        this.fill = new ShapeFill(jsonFill);
      }
      // Line
      JSONObject jsonLine = (JSONObject) json.get("line");
      this.line = new ShapeLine(jsonLine, this);
      // Arrow
      if (json.containsKey("arrows"))
      {
        JSONArray arrArrow = (JSONArray) json.get("arrows");
        int len = arrArrow.size();
        if (len > 0)
        {
          this.arrows = new ArrayList<ShapeArrow>();
          for (int i = 0; i < len; i++)
          {
            ShapeArrow arrow = new ShapeArrow((JSONObject) arrArrow.get(i));
            this.arrows.add(arrow);
          }
        }
      }

      // Title
      if (json.containsKey("title"))
      {
        this.title = json.get("title").toString();
      }
    }
  }

  public String getHTML()
  {
    return null;
  }

  public String getHTML(JSONArray others)
  {
    // DIV node
    String html = "<div";
    html += " id=\"" + this.divId + "\"";
    html += " class=\"g_draw_frame\" style=\"position:absolute;left:0%;top:0%;width:100%;height:100%;\" draw_layer=\"layout\" presentation_class=\"graphic\" shape_node=\"svg.on.shape\" text_anchor-type=\"paragraph\" tabindex=\"0\"";
    html += ">";

    // SVG node
    html += "<svg";
    html += " id=\"" + this.id + "\"";
    html += " contentScriptType=\"text/ecmascript\" style=\"position:relative;width:100%;height:100%\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" draw_layer=\"layout\" xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" preserveAspectRatio=\"none\" contentStyleType=\"text/css\"";
    html += " shape-version=\""+ this.shapeVersion +"\"";
    // Update frame and display box size
    double l = Double.valueOf(this.frm.get("l").toString());
    double t = Double.valueOf(this.frm.get("t").toString());
    double w = Double.valueOf(this.frm.get("w").toString());
    double h = Double.valueOf(this.frm.get("h").toString());
    double gapL = Double.valueOf(this.gap.get("l").toString());
    double gapT = Double.valueOf(this.gap.get("t").toString());
    double gapR = Double.valueOf(this.gap.get("r").toString());
    double gapB = Double.valueOf(this.gap.get("b").toString());
    double dspL = l - gapL;
    double dspT = t - gapT;
    double dspW = w + gapL + gapR;
    double dspH = h + gapT + gapB;
    html += " preserve0=\"" + "dsp_x:" + dspL + ";dsp_y:" + dspT + ";dsp_width:" + dspW + ";dsp_height:" + dspH + ";frm_x:" + l + ";frm_y:"
        + t + ";frm_width:" + w + ";frm_height:" + h + ";";
 
    if (this.frm.containsKey("rot"))
    {
      html += ("rot_degree:" + this.frm.get("rot").toString() + ";");
    }

    if (this.dir != -1)
    {
      html += ("dir:" + this.dir + ";");
    }

    if (this.av != null)
    {
      Iterator it = this.av.entrySet().iterator();
      while (it.hasNext())
      {
        Map.Entry pairs = (Map.Entry) it.next();
        String key = pairs.getKey().toString();
        String value = pairs.getValue().toString();
        html += (key + ":" + value + ";");
      }
    }

    html += "\">";

    // defs
    if (this.prop != null)
    {
      html += "<g groupfor=\"defs\">";
      // clip path
      if (this.prop.containsKey("cp") && this.cpath != null)
      {
        JSONObject cpObj = (JSONObject) this.prop.get("cp");
        html += "<defs><clipPath";
        html += " id=\"" + cpObj.get("id") + "\"";
        if (cpObj.containsKey("clipRule"))
          html += " clip-rule=\"" + cpObj.get("clipRule") + "\"";
        html += ">";

        // Fix chrome 38 issue
        // all cpaths should be connected together and set into a path
        html += "<path d=\"";
        for (int i = 0, len = this.cpath.size(); i < len; i++)
        {
          html += this.cpath.get(i).trim() + " ";
        }
        html += "\"></path></clipPath></defs>";
      }
      // Gradient
      if (this.prop.containsKey("grads"))
      {
        @SuppressWarnings("unchecked")
        ArrayList<ShapeProp> grads = (ArrayList<ShapeProp>) this.prop.get("grads");
        int len = grads.size();
        for (int i = 0; i < len; i++)
        {
          ShapeProp grad = (ShapeProp) grads.get(i);
          html += "<defs>";
          html += grad.getHTML();
          html += "</defs>";
        }
      }
      // Image fill
      if (this.prop.containsKey("ptn"))
      {
        html += "<defs>";
        html += ((ShapeProp) this.prop.get("ptn")).getHTML();
        html += "</defs>";
      }
      html += "</g>";
    }

    // fill-line-arrow
    // scale and translate
    html += "<g groupfor=\"fill-line-arrow\" ";
    html += ">";
    // fill
    if (this.fill != null)
    {
      html += "<g groupfor=\"fill\">";
      html += this.fill.getHTML();
      html += "</g>";
    }
    // line
    html += "<g groupfor=\"line\">";
    html += this.line.getHTML();
    html += "</g>";
    // fill
    if (this.arrows != null)
    {
      html += "<g groupfor=\"arrow\">";
      int len = this.arrows.size();
      for (int i = 0; i < len; i++)
      {
        ShapeArrow a = (ShapeArrow) this.arrows.get(i);
        html += a.getHTML();
      }
      html += "</g>";
    }
    html += "</g>";

    // title <title>shape</title>
    if (this.title != null)
    {
      html += "<title>";
      html += this.title;
      html += "</title>";
    }

    html += "</svg>";

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

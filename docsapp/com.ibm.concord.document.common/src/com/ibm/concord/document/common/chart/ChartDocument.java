/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.document.common.chart;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.ibm.json.java.JSONObject;

public class ChartDocument
{

  private DataProvider dataProvider;

  private String chartId;

  JSONObject content;

  PlotArea plotArea;

  private Map<String, DataSeries> allSeries;

  int changes = 0;

  int pivotSource = 0;

  public static final List<String> roles;
  static
  {
    roles = Arrays.asList(ChartConstant.X_VALUES, ChartConstant.Y_VALUES, ChartConstant.VALUES, ChartConstant.LABEL,
        ChartConstant.BUBBLE_SIZE);
  }

  public ChartDocument()
  {
    allSeries = new HashMap<String, DataSeries>();
  }

  public String getChartId()
  {
    return chartId;
  }

  public void setChartId(String chartId)
  {
    this.chartId = chartId;
  }

  public void attachDataProvider(DataProvider dataProvider)
  {
    this.dataProvider = dataProvider;
  }

  public DataProvider getDataProvider()
  {
    return this.dataProvider;
  }

  public DataSequence getDataSequence(String role, String id)
  {
    if (role.equals(ChartConstant.CATEGORIES))
    {
      List<Axis> axisList = this.plotArea.getAxisList();
      for (int i = 0; i < axisList.size(); i++)
      {
        Axis axis = axisList.get(i);
        if (axis.id.equals(id))
          return axis.catSeq;
      }
    }
    else
    {
      DataSeries series = allSeries.get(id);
      if (series != null)
        return series.getDataSequence(role);
    }
    return null;
  }

  public void addSeries(String id, DataSeries series)
  {
    allSeries.put(id, series);
  }

  public Map<String, DataSeries> getAllSeries()
  {
    return this.allSeries;
  }

  public JSONObject toJson()
  {
    plotArea.toJson();
    content.put(ChartConstant.CHANGES, changes);
    return content;
  }

  public void loadFromJson(JSONObject content)
  {
    this.content = content;

    Number pivot = (Number) content.get(ChartConstant.PIVOTSOURCE);
    if (pivot != null)
      pivotSource = pivot.intValue();

    Number cha = (Number) content.get(ChartConstant.CHANGES);
    if (cha != null)
      changes = cha.intValue();

    this.plotArea = new PlotArea(this);
    JSONObject plotAreaJson = (JSONObject) content.get(ChartConstant.PLOTAREA);
    if (plotAreaJson != null)
      this.plotArea.loadFromJson(plotAreaJson);
  }

  private void removeFontFace(JSONObject font)
  {
	  if(font!=null)
	  {
		  Number cha = (Number)font.get(ChartConstant.CHANGES);
		  if(cha!=null)
			  font.put(ChartConstant.CHANGES,cha.intValue() | 1);
		  else
			  font.put(ChartConstant.CHANGES,1);
		  font.remove("latin");
		  font.remove("asian");
		  font.remove("ctl");
	  }
  }
  
  public void set(JSONObject settings)
  {
    if (settings.containsKey(ChartConstant.TXPR))
    {
      changes = changes | 1;
      JSONObject txPr = (JSONObject) settings.get(ChartConstant.TXPR);
      JSONObject dest = (JSONObject) this.content.get(ChartConstant.TXPR);
      if (txPr == null && dest != null)
        // ChartUtils.removeAllAttris(dest);//keep changes flag
        this.content.remove(ChartConstant.TXPR);
      else
      {
        if (dest == null)
        {
          dest = new JSONObject();
          this.content.put(ChartConstant.TXPR, dest);
        }
        ChartUtils.mergeTxPr(dest, txPr);// merge and maintain change flag
      }

      // clean all the children element's font
      JSONObject title = (JSONObject) this.content.get(ChartConstant.TITLE);
      if (title != null)
      {
    	removeFontFace((JSONObject)title.get(ChartConstant.TXPR));
        ChartUtils.setChanges(title, 2);
      }

      JSONObject legend = (JSONObject) this.content.get(ChartConstant.LEGEND);
      if (legend != null)
      {
    	removeFontFace((JSONObject)legend.get(ChartConstant.TXPR));
        ChartUtils.setChanges(legend, 2);
      }

      List<Axis> axisList = this.plotArea.getAxisList();
      for (int i = 0; i < axisList.size(); i++)
      {
        Axis axis = axisList.get(i);
        if (axis.content != null)
        {
          removeFontFace((JSONObject)axis.content.get(ChartConstant.TXPR));
          axis.changes = axis.changes | 1;

          JSONObject axisTitle = (JSONObject) axis.content.get(ChartConstant.TITLE);
          if (axisTitle != null)
          {
            removeFontFace((JSONObject)axisTitle.get(ChartConstant.TXPR));
            ChartUtils.setChanges(axisTitle, 2);
            axis.changes = axis.changes | 4;
          }
        }
      }
    }

    JSONObject seriesList = (JSONObject) settings.get(ChartConstant.SERIES_LIST);
    if (seriesList != null)
    {
      Iterator<Map.Entry<String, JSONObject>> itor = seriesList.entrySet().iterator();
      while (itor.hasNext())
      {
        Map.Entry<String, JSONObject> entry = itor.next();
        String serId = entry.getKey();
        JSONObject pro = entry.getValue();
        DataSeries series = this.allSeries.get(serId);
        if (series != null && pro != null)
          series.set(pro);
      }
    }
    JSONObject axisProList = (JSONObject) settings.get(ChartConstant.AXIS);
    if (axisProList != null)
    {
      List<Axis> axisList = this.plotArea.getAxisList();
      HashMap<String, Axis> axisMap = new HashMap<String, Axis>();
      for (int i = 0; i < axisList.size(); i++)
      {
        Axis axis = axisList.get(i);
        axisMap.put(axis.id, axis);
      }

      Iterator<Map.Entry<String, JSONObject>> itor = axisProList.entrySet().iterator();
      while (itor.hasNext())
      {
        Map.Entry<String, JSONObject> entry = itor.next();
        String axId = entry.getKey();
        JSONObject pro = entry.getValue();
        Axis axis = axisMap.get(axId);
        if (axis != null && pro != null)
          axis.set(pro);
      }
    }

    if (settings.containsKey(ChartConstant.SPPR))
    {
      changes = changes | 2;
      JSONObject spPr = (JSONObject) settings.get(ChartConstant.SPPR);
      JSONObject dest = (JSONObject) this.content.get(ChartConstant.SPPR);
      if (spPr == null && dest != null)
        this.content.remove(ChartConstant.SPPR);
      // ChartUtils.removeAllAttris(dest);//need to keep change flag?
      else
      {
        if (dest == null)
        {
          dest = new JSONObject();
          this.content.put(ChartConstant.SPPR, dest);
        }
        ChartUtils.mergeSpPr(dest, spPr);
      }
    }

    if (settings.containsKey(ChartConstant.TITLE))
    {
      JSONObject titleSet = (JSONObject) settings.get(ChartConstant.TITLE);
      if (titleSet == null)
        this.content.remove(ChartConstant.TITLE);
      else
      {
        JSONObject title = (JSONObject) this.content.get(ChartConstant.TITLE);
        if (title != null)
        {
          int tmpCha = 0;
          if (titleSet.containsKey(ChartConstant.TEXT))
          {
            String text = (String) titleSet.get(ChartConstant.TEXT);
            if (text == null)
              title.remove(ChartConstant.TEXT);
            else
              title.put(ChartConstant.TEXT, text);
            tmpCha = tmpCha | 1;
          }
          if (titleSet.containsKey(ChartConstant.TXPR))
          {
            JSONObject txPr = (JSONObject) titleSet.get(ChartConstant.TXPR);
            if (txPr == null)
              title.remove(ChartConstant.TXPR);
            else
            {
              JSONObject dest = (JSONObject) title.get(ChartConstant.TXPR);
              if (dest == null)
              {
                dest = new JSONObject();
                title.put(ChartConstant.TXPR, dest);
              }
              ChartUtils.mergeTxPr(dest, txPr);
            }
            tmpCha = tmpCha | 2;
          }
          ChartUtils.setChanges(title, tmpCha);
        }
        else
          this.content.put(ChartConstant.TITLE, titleSet);// need to clear null object in titleSet?
      }
    }

    JSONObject plotArea = (JSONObject) settings.get(ChartConstant.PLOTAREA);
    if (plotArea != null)
      this.plotArea.set(plotArea);

    if (settings.containsKey(ChartConstant.LEGEND))
    {
      JSONObject legendSet = (JSONObject) settings.get(ChartConstant.LEGEND);
      JSONObject legend = (JSONObject) this.content.get(ChartConstant.LEGEND);
      if (legendSet == null && legend != null)
      {
        this.content.remove(ChartConstant.LEGEND);
      }
      else
      {
        if (legend == null)
        {
          legend = new JSONObject();
          this.content.put(ChartConstant.LEGEND, legend);
          legend.put(ChartConstant.CHANGES, 4);// legend is total new(may be deleted and then create)
        }
        int tmpCha = 0;
        if (legendSet.containsKey(ChartConstant.LEGENDPOS))
        {
          String pos = (String) legendSet.get(ChartConstant.LEGENDPOS);
          if (pos == null)
            legend.remove(ChartConstant.LEGENDPOS);
          else
            legend.put(ChartConstant.LEGENDPOS, pos);
          tmpCha = tmpCha | 1;
        }
        if (legendSet.containsKey(ChartConstant.TXPR))
        {
          JSONObject txPr = (JSONObject) legendSet.get(ChartConstant.TXPR);
          if (txPr == null)
            legend.remove(ChartConstant.TXPR);
          else
          {
            JSONObject dest = (JSONObject) legend.get(ChartConstant.TXPR);
            if (dest == null)
            {
              dest = new JSONObject();
              legend.put(ChartConstant.TXPR, dest);
            }
            ChartUtils.mergeTxPr(dest, txPr);
          }
          tmpCha = tmpCha | 2;
        }
        ChartUtils.setChanges(legend, tmpCha);
      }
    }
    if (settings.containsKey(ChartConstant.BIDI))
    {
      JSONObject bidiSet = (JSONObject) settings.get(ChartConstant.BIDI);
      if (bidiSet == null)
        this.content.remove(ChartConstant.BIDI);
      else
      {
        JSONObject bidi = (JSONObject) this.content.get(ChartConstant.BIDI);
        if (bidi == null)
        {
          bidi = new JSONObject();
          this.content.put(ChartConstant.BIDI, bidi);
        }
        int tmpCha = 0;
        if (bidiSet.containsKey(ChartConstant.DIR))
        {
          String dir = (String) bidiSet.get(ChartConstant.DIR);
          if (dir != null)
          {
            bidi.put(ChartConstant.DIR, dir);
            tmpCha = tmpCha | 1;
          }
        }
        if (bidiSet.containsKey(ChartConstant.TEXT_DIR))
        {
          String dir = (String) bidiSet.get(ChartConstant.TEXT_DIR);
          if (dir != null)
          {
            bidi.put(ChartConstant.TEXT_DIR, dir);
            tmpCha = tmpCha | 2;
          }
          ChartUtils.setChanges(bidi, tmpCha);
        }
      }
    }
  }
}

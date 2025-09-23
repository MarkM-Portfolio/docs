package com.ibm.concord.spreadsheet.document.compare;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.transform.sax.TransformerHandler;

import org.apache.commons.lang.StringUtils;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.concord.spreadsheet.common.ConversionConstant;

public class MapComparator
{
  private static final Logger LOG = Logger.getLogger(MapComparator.class.getName());

  public List<String> pathList, rightPathList;
  
  //only avaibable when create diff html, not the whole html
  public List<String> diffPathList, diffRightPathList;

  public Map<String, Object> left, right;

  public IJudger judger;
  
  private TransformerHandler mXMLWriter;
  
  private AttributesImpl boldAttr, missAttr, notEqualAttr, tableAttr, indexAttr;;
  
  private enum STATUS {MAP, ARRAY, VALUE};

//  private STATUS status;
  public MapComparator(IJudger j, String path)
  {
    pathList = new ArrayList<String>();
    pathList.add(path);
    rightPathList = new ArrayList<String>();
    rightPathList.add(path);
    
    diffPathList = new ArrayList<String>();
    diffRightPathList = new ArrayList<String>();
    
    judger = j;

    boldAttr = new AttributesImpl();
    boldAttr.addAttribute("", "", "class", "", "highlight");
    missAttr = new AttributesImpl();
    missAttr.addAttribute("", "", "class", "", "miss");
    notEqualAttr = new AttributesImpl();
    notEqualAttr.addAttribute("", "", "class", "", "notequal");
    AttributesImpl tableAttr = new AttributesImpl();
    tableAttr.addAttribute("", "", "table-layout", "", "automatic");
    tableAttr.addAttribute("", "", "width", "", "100%");
    tableAttr.addAttribute("", "", "border", "", "1");
    indexAttr = new AttributesImpl();
    indexAttr.addAttribute("", "", "class", "", "index");
  }

  public void reset()
  {
    pathList.clear();
    rightPathList.clear();
  }
  
  public void setmXMLWriter(TransformerHandler mXMLWriter)
  {
    this.mXMLWriter = mXMLWriter;
  }

  /*
   * report under current path, key is missing on either side.
   */
  public boolean reportMissingValue(String key, Object value, boolean isLeft) throws SAXException
  {
    String path = toPathString(key, isLeft);

    if (judger.isError(path))
    {
      LOG.log(Level.SEVERE, "Map value {0} is missing on the {1}.", new Object[] { path, isLeft ? "LEFT" : "RIGHT" });
      StringBuffer html = new StringBuffer();
      html.append(key);
      html.append(":");
      if(value != null)
        html.append(value.toString());
      else
        html.append("null");
      if (!DraftComparator.bShowAllHTML)
        createDiffRoot();
      String indexInfo = setIndexInfo(key, !isLeft);
      if(indexInfo != null)
      {
        if(isLeft)
          createTR("undefined",indexInfo, indexAttr);
        else
          createTR(indexInfo, "undefined", indexAttr);
      }
      if(isLeft)
        createTR("undefined",html.toString(), missAttr);
      else
        createTR(html.toString(), "undefined", missAttr);
      return true;
    }
    return false;
  }
  
  public boolean reportNotEqual(String key, Object left, Object right)
  {
    String path = toPathString(key);
    
    if (judger.isError(path))
    {
      LOG.log(Level.SEVERE, "Map value {0} not equal, left {1}, right {2}.", new Object[] { path, left, right });
      return true;
    }
    return false;
  }

  public String toPathString(String key)
  {
    return this.toPathString(key, true);
  }

  public void compare(Map o1, Map o2, TransformerHandler writer)
  {
    mXMLWriter = writer;
    compare(o1, o2);
  }
  
  
  private void createTD(String str, AttributesImpl attrs, List<int[]> spanList) throws SAXException
  {
    mXMLWriter.startElement("", "td", "td", null);
    
    if(spanList == null || spanList.size() == 0)
    {
      mXMLWriter.startElement("", "span", "span", attrs);
      mXMLWriter.characters(str.toCharArray(), 0, str.length());
      mXMLWriter.endElement("", "span", "span");
    }
    else
    {
      char[] charr = str.toCharArray();
      int length = spanList.size();
      int start = 0;
      for(int i=0; i<length; i++)
      {
        int[] pair = spanList.get(i);
        int size = pair[0] - start;
        
        mXMLWriter.startElement("", "span", "span", null);
        mXMLWriter.characters(charr, start, size);
        mXMLWriter.endElement("", "span", "span");
        
        mXMLWriter.startElement("", "span", "span", attrs);
        mXMLWriter.characters(charr, pair[0], pair[1] - pair[0]);
        mXMLWriter.endElement("", "span", "span");
        
        start = pair[1];
      }
      mXMLWriter.startElement("", "span", "span", null);
      mXMLWriter.characters(charr, start, charr.length - start);
      mXMLWriter.endElement("", "span", "span");
    }
   
    mXMLWriter.endElement("", "td", "td");
  }
  
  //create td the same content with specified attrs
  private void createTR(String str, AttributesImpl attrs) throws SAXException
  {
    mXMLWriter.startElement("", "tr", "tr", null);
    createTD(str, attrs, null);
    createTD(str, attrs, null);
    mXMLWriter.endElement("", "tr", "tr");
  }
  
  //create left and right td with different content 
  private void createTR(String lstr, String rstr, AttributesImpl attrs) throws SAXException
  {
    mXMLWriter.startElement("", "tr", "tr", null);
    createTD(lstr, attrs, null);
    createTD(rstr, attrs, null);
    mXMLWriter.endElement("", "tr", "tr");
  }
  
  //create left and right td with different content, and set attrs for span list 
  private void createTR(String lstr, String rstr, AttributesImpl attrs, List<int[]> lSpanList, List<int[]> rSpanList) throws SAXException
  {
    mXMLWriter.startElement("", "tr", "tr", null);
    createTD(lstr, attrs, lSpanList);
    createTD(rstr, attrs, rSpanList);
    mXMLWriter.endElement("", "tr", "tr");
  }
  
  public void compare(Map o1, Map o2)
  {
    try
    {
    boolean bStart = false;
    if (left == null || right == null)
    {
      // just starting
      bStart = true;
      left = o1;
      right = o2;
      if(mXMLWriter != null)
      {
        mXMLWriter.startElement("","table","table",tableAttr);
        mXMLWriter.startElement("", "caption", "caption", boldAttr);
        StringBuffer html = new StringBuffer();
        if(pathList.size() > 0)
        {
          String key = pathList.get(0);
          html.append(key);
        }
        mXMLWriter.characters(html.toString().toCharArray(), 0, html.length());
        mXMLWriter.endElement("", "caption", "caption");
      }
    }
    
    Set<Entry<String, Object>> leftEntrySet = o1.entrySet();
    Set<String> rightKeySet = new HashSet<String>(o2.keySet());
    
    for (Iterator iterator = leftEntrySet.iterator(); iterator.hasNext();)
    {
      Entry<String, Object> entry = (Entry<String, Object>) iterator.next();
      String key = entry.getKey();
      Object value = entry.getValue();
      String key2 = judger.getMapping(key);
      Object valueRight = o2.get(key2);
      if (valueRight == null)
      {
        reportMissingValue(key, value, false);
      }
      else
      {
        rightKeySet.remove(key2);
        if (value instanceof Map && valueRight instanceof Map)
        {
          if(mXMLWriter != null && DraftComparator.bShowAllHTML)
          {
            StringBuffer lhtml = new StringBuffer();
            lhtml.append(key);
            lhtml.append(":");
            lhtml.append("{");
            StringBuffer rhtml = new StringBuffer();
            rhtml.append(key2);
            rhtml.append(":");
            rhtml.append("{");
            createTR(lhtml.toString(), rhtml.toString(), null);
          }
          pathList.add(key);
          rightPathList.add(key2);
          
          compare((Map) value, (Map) valueRight);
        }
        else if (value instanceof List && valueRight instanceof List)
        {
          
          if(mXMLWriter != null && DraftComparator.bShowAllHTML)
          {
            StringBuffer llist = new StringBuffer();
            llist.append(key);
            llist.append(":");
            StringBuffer rlist = new StringBuffer();
            rlist.append(key2);
            rlist.append(":");
            createTR(llist.toString(), rlist.toString(), null);
          }
          compareList((List) value, (List) valueRight, key, key2);
        }
        else
        {
          boolean bNotEqual = false;
          if (value instanceof Number && valueRight instanceof Number)
          {
            if (((Number) value).longValue() != ((Number) valueRight).longValue())
            {
              bNotEqual = reportNotEqual(key, value, valueRight);
            }
          }
          else if (!judger.isEqual(value, valueRight, key))
          {
            bNotEqual = reportNotEqual(key, value, valueRight);
          }
          if (mXMLWriter != null)
          {
            StringBuffer lp = new StringBuffer();
            lp.append(key);
            lp.append(":");
            lp.append(value);
            StringBuffer rp = new StringBuffer();
            rp.append(key2);
            rp.append(":");
            rp.append(valueRight);
            AttributesImpl attrs = null;
            boolean bHTMLOut = false;
            if(DraftComparator.bShowAllHTML)
              bHTMLOut = true;
            if (bNotEqual)
            {
              if (!DraftComparator.bShowAllHTML)
              {
                bHTMLOut = true;
                createDiffRoot();
              }
              String indexInfo = setIndexInfo(key, true);
              if(indexInfo != null)
              {
                String rightIndexInfo = setIndexInfo(key, false);
                createTR(indexInfo,rightIndexInfo, indexAttr);
              }
              attrs = notEqualAttr;
            }
            if(bHTMLOut)
              createTR(lp.toString(), rp.toString(), attrs);
          }
        }
      }
    }
    for (Iterator iterator = rightKeySet.iterator(); iterator.hasNext();)
    {
      String key = (String) iterator.next();
      Object valueRight = o2.get(key);
      reportMissingValue(key, valueRight, true);
    }
    
    int size = pathList.size();
    if (size > 0)
    {
      boolean bEndHTML = false;
      if(DraftComparator.bShowAllHTML)
      {
        bEndHTML = true;
      }else
      {
        int diffSize = diffPathList.size();
        if(size == diffSize)
        {
          String path = pathList.get(size - 1);
          String diffPath = diffPathList.get(size - 1);
          if(path.equals(diffPath))
          {
            bEndHTML = true;
            diffPathList.remove(size - 1);
            diffRightPathList.remove(size - 1);
          }
        }
      }
      pathList.remove(size - 1);
      rightPathList.remove(size - 1);
      if(mXMLWriter != null && bEndHTML)
      {
        StringBuffer htmlEnd = new StringBuffer();
        htmlEnd.append("}");
        createTR(htmlEnd.toString(), null);
//        switch(status)
//        {
//          case MAP:
//          {
//            StringBuffer htmlEnd = new StringBuffer();
//            htmlEnd.append("}");
//            createTR(htmlEnd.toString(), null);
//            break;
//          }
//          default:
//            break;
//        }
      }
    }
    
    if(bStart)
    {
      if(mXMLWriter != null)
        mXMLWriter.endElement("", "table", "table");
    }
      
    }catch (SAXException e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    
  }

  //prepare the un exported parent tag for diff part
  private void createDiffRoot() throws SAXException
  {
    int length = pathList.size();
    
    for( int i = 0; i < length; i++)
    {
      String path = pathList.get(i);
      if( i >= diffPathList.size())
      {
        String rightPath = rightPathList.get(i);
        //the first element in pathList is the file name, such as content, meta, etc
        //which does not need to createTR, it is the caption of the table
        if( i > 0)
        {
          StringBuffer lhtml = new StringBuffer();
          lhtml.append(path);
          lhtml.append(":");
          lhtml.append("{");
          StringBuffer rhtml = new StringBuffer();
          rhtml.append(rightPath);
          rhtml.append(":");
          rhtml.append("{");
          createTR(lhtml.toString(), rhtml.toString(), null);
        }
        diffPathList.add(path);
        diffRightPathList.add(rightPath);
      }
    }
  }
  

  public String toPathString(String key, boolean isLeft)
  {
    List<String> list = pathList;
    if(!isLeft)
      list = rightPathList;
    String[] parts = new String[list.size() + 1];
    parts = list.toArray(parts);
    parts[parts.length - 1] = key;
    return StringUtils.join(parts, ".");
  }
  
  //for repeat number, if they are not equal, should append col/row index for user reference
  private String setIndexInfo(String key, boolean isLeft)
  {
    if(ConversionConstant.REPEATEDNUM.equals(key))
    {
      List<String> list = pathList;
      if(!isLeft)
        list = rightPathList;
      int size = list.size();
      int index = -1;
      if(size == 6 && ConversionConstant.SHEETS.equals(list.get(1))
         && ConversionConstant.ROWS.equals(list.get(3)))
      {
        String sheetId = list.get(2);
        String colId = list.get(5);
        index = ((MetaJudger)judger).getIndexById(sheetId, colId, false, isLeft);
      }
      else if(size == 4 && ConversionConstant.ROWS.equals(list.get(1)))
      {
        String sheetId = list.get(2);
        String rowId = list.get(3);
        index = ((MetaJudger)judger).getIndexById(sheetId, rowId, true, isLeft);
      }
      if(index > -1)
      {
        StringBuffer buf = new StringBuffer();
        buf.append("index:");
        buf.append(index);
        return buf.toString();
      }
    }
    return null;
  }
  
  public void compareList(List left, List right, String lKey, String rKey) throws SAXException
  {
    List<int[]> lIdx = new ArrayList<int[]>();
    List<int[]> rIdx = new ArrayList<int[]>();
    StringBuffer lHTML = new StringBuffer();
    lHTML.append("[");
    StringBuffer rHTML = new StringBuffer();
    rHTML.append("[");
    int leftSize = left.size();
    int rightSize = right.size();
    boolean bNotEqual = false;
    for (int i = 0; i < leftSize; i++)
    {
      boolean bResult = false;
      Object leftValue = left.get(i);
      Object rightValue = "undefined";
      if (i < rightSize)
      {
        rightValue = right.get(i);
        if (!leftValue.equals(rightValue))
        {
          bResult = reportNotEqual(lKey + "[" + i + "]", leftValue, rightValue);
        }
      }
      else
      {
        bResult = reportNotEqual(lKey + "[" + i + "]", leftValue, rightValue);
      }
      bNotEqual |= bResult;
      this.setSpanIdx(lHTML, leftValue, lIdx, rHTML, rightValue, rIdx, bResult);
      if (i != leftSize - 1)
      {
        lHTML.append(",");
        rHTML.append(",");
      }
    }
    for (int i = leftSize; i < rightSize; i++)
    {
      Object leftValue = "undefined";
      Object rightValue = right.get(i);
      boolean bResult = reportNotEqual(rKey + "[" + i + "]", leftValue, rightValue);
      bNotEqual |= bResult;
      this.setSpanIdx(lHTML, leftValue, lIdx, rHTML, rightValue, rIdx, bResult);
      if (i != rightSize - 1)
      {
        lHTML.append(",");
        rHTML.append(",");
      }
    }
    if(mXMLWriter != null)
    {
      AttributesImpl attrs = null;
      boolean bHTMLOut = false;
      if(DraftComparator.bShowAllHTML)
        bHTMLOut = true;
      if(bNotEqual)
      {
        attrs = notEqualAttr;
        if (!DraftComparator.bShowAllHTML)
        {
          bHTMLOut = true;
          createDiffRoot();
        }
      }
      if(bHTMLOut)
      {
        lHTML.append("]");
        rHTML.append("]");
        createTR(lHTML.toString(), rHTML.toString(), attrs, lIdx, rIdx);
      }
    }
  }

  private void setSpanIdx(StringBuffer lHTML, Object leftValue, List<int[]> lIdx, 
      StringBuffer rHTML, Object rightValue, List<int[]> rIdx, boolean bNotEqual)
  {
    int[] lp = new int[2];
    int[] rp = new int[2];
    if(bNotEqual)
    {
      int start = lHTML.length();
      lp[0] = start;
      start = rHTML.length();
      rp[0] = start;
    }
    lHTML.append(leftValue);
    rHTML.append(rightValue);
    if(bNotEqual){
      int end = lHTML.length();
      lp[1] = end;
      lIdx.add(lp);
      
      end = rHTML.length();
      rp[1] = end;
      rIdx.add(rp);
    }
  }
  public static interface IJudger
  {
    /**
     * judges if a path "a.b.c" should be considered error for this comparation.
     * 
     * @param path
     * @return
     */
    public boolean isError(String path);
    
    /**
     * judges if the entry value corresponding to the given path(as key) 
     * should add mapping between left and right
     * 
     * @param path
     * @return
     */
    public boolean isMapping(String path);
    
    /**
     * return the mapping key of the given key
     * @param key
     * @return
     */
    public String getMapping(String key);
    
    /**
     * check if the given two values are equals
     * these two values might need mapping before compare the content
     * @param v1
     * @param v2
     * @return
     */
    public boolean isEqual(Object v1, Object v2, String key);
  }
}

/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json.sax.context;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;
import java.util.Set;
import java.util.TimeZone;
import java.util.UUID;
import java.util.zip.DataFormatException;
import java.util.zip.Deflater;
import java.util.zip.Inflater;

import javax.xml.bind.DatatypeConverter;

import org.odftoolkit.odfdom.doc.text.OdfWhitespaceProcessor;
import org.w3c.dom.Node;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.ods2json.sax.PreserveManager;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLUtil;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.CellStyleType;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.JSONModel;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Range;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser.ParsedRef;
import com.ibm.symphony.conversion.spreadsheet.index.IndexUtil;

public class OfficeAnnotationContext extends GeneralDOMContext
{
  private String mText;
  private Date mDate;
  public OfficeAnnotationContext(XMLImport importer, String uri, String localName, String qName, Object target)
  {
    super(importer, uri, localName, qName, target);   
    mText = null;
  }
  
  
  //should be called after endElement
  public String getText(){
    if(mText == null){     
      StringBuilder buf = new StringBuilder();
      int length = this.mChildConvertors.size();
      boolean hasText = false;
      for (int i = 0; i < length; i++)
      {
        GeneralContext conv = mChildConvertors.get(i);
        if (conv instanceof TextPContext)
        {
          hasText = true;
          TextPContext pContext = (TextPContext) conv;
          buf.append(pContext.getText());
        }
      }
      if(hasText)
      {
        String value = buf.toString();
        if (value.endsWith("\n"))
        {
          int end = value.lastIndexOf("\n");
          value = value.substring(0, end);
        }
        mText = value;
      }
    }
    return mText;
  }
  //should be called after endElement
  public Date getDate(){
    if(mDate == null){     
      int length = this.mChildConvertors.size();
      boolean hasText = false;
      for (int i = 0; i < length; i++)
      {
        GeneralContext conv = mChildConvertors.get(i);
        String nodename = conv.getNodeName();
        if ("dc:date".equalsIgnoreCase(nodename))
        {
          OdfWhitespaceProcessor textProcessor = new OdfWhitespaceProcessor();
          String datestr = textProcessor.getText(((GeneralDOMContext)conv).mElement);
          try
          {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
            sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
            mDate = sdf.parse(datestr);
          } catch (Exception e) {} // do not break whole parser
          break;
        }
      }
    }
    return mDate;
  }
  
  @Override
  public void endElement()
  {
    // TODO Auto-generated method stub
    super.endElement();
    try {
      getText();
    } catch (Exception e) {}  // do not break parser 
    try {
      getDate();
    } catch (Exception e) {} // do not break parser
    ConversionUtil.Document document = (ConversionUtil.Document) mContext.get("Target");
    ConversionUtil.Sheet sheet = (ConversionUtil.Sheet) mContext.get("Sheet");
    ConversionUtil.Cell cell = (ConversionUtil.Cell) mTarget;
    String rangename = UUID.randomUUID().toString();
    GeneralContext pContext = this.getParentConvertor();
    JSONModel model = (JSONModel) pContext.getTarget();
    ParsedRef ref = PreserveManager.getTargetRef(mContext, model);
    
    Range commentsRange = new Range();
    commentsRange.rangeId = rangename;
    commentsRange.usage = ConversionUtil.RangeType.COMMENT;
    commentsRange.address = ref.toString();
    commentsRange.sheetId = sheet.sheetId;
    if(ConversionUtil.hasValue(ref.startCol)){
      int startCol = ReferenceParser.translateCol(ref.startCol);
      if(startCol != -1)
      {
        int nameRangeStartColIndex = startCol - 1;
        commentsRange.startColId = ConversionUtil.updateIdArray(nameRangeStartColIndex, sheet, document, false, false);
      }
    }
    if(ConversionUtil.hasValue(ref.startRow)){
      int startRow = ReferenceParser.translateRow(ref.startRow);
      if(startRow != -1)
      {
        int nameRangeStartRowIndex = startRow - 1;
        commentsRange.startRowId = ConversionUtil.updateIdArray(nameRangeStartRowIndex, sheet, document, true, false);
      }  
    }
    document.unnameList.add(commentsRange);
    // comments is similar as image. So add the flag to imagemap to indicate the row can not be repeated
    Map<String,Boolean> cellImageMap = (Map<String,Boolean>) mContext.get("cellImageMap");
    String cellId = IndexUtil.generateCellId(commentsRange.startRowId, commentsRange.startColId);
    cellImageMap.put(cellId, true);

    JSONObject comments = new JSONObject();
    JSONArray items = new JSONArray();
    try {
      JSONArray existItems = parseConcordComment(getText());
      if (existItems.size() > 0)
        items = existItems;
    } catch (Exception e) {}  // ignore error
    if (items.size() == 0)
    {
      JSONObject item = new JSONObject();
      item.put("content", getText());
      if (getDate()!=null)
        item.put("time", getDate().getTime());
      items.add(item);
    }
    comments.put("items", items);
    comments.put("id", rangename);
    document.docCommentsJSON.add(comments);
  }
  private int Match(String text, int beginpos, String prefix, String suffix, StringBuilder matchstring)
  {
    if (text.length() - beginpos < prefix.length() + suffix.length())
      return -1;
    if (text.startsWith(prefix, beginpos) == false)
      return -1;
    int pos = text.indexOf(suffix,beginpos+prefix.length());
    if (pos < 0) 
      return -1;
    matchstring.setLength(0);
    matchstring.append(text.substring(beginpos + prefix.length(), pos));
    return pos + suffix.length();
  }
  Date ParseDatetime(String datetime)
  {
    Date ret = null;
    try
    {
      // yyyy-MM-dd'T'HH:mm:ssZ
      SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd'T'hh:mm:ss'Z'");
      formatter.setTimeZone(TimeZone.getTimeZone("UTC"));
      ret = formatter.parse(datetime);
    }
    catch (Exception e)
    {
    }
    return ret;
  }
  public static void main(String[] args)
  {
    String comments = ConversionUtil.ZIPStringToHexString("a");
    System.out.println("ziped comments: " + comments);
    String org = ConversionUtil.HEXZIPStringToString(comments);
    System.out.println("unziped comments: " + org);
  }

  public JSONArray parseConcordComment(String text) throws IOException
  {
    JSONArray ret = new JSONArray();
    char C_ZEROWIDTH_CHAR = '\u200b';
    int pos=0;
    // try get items
    JSONObject item;
    do {
      StringBuilder matchstring = new StringBuilder();
      // try get name
      int endpos = Match(text, pos , (C_ZEROWIDTH_CHAR) + "#", ":\n", matchstring);
      if (endpos<0) break;

      item = new JSONObject();
      item.put("name",matchstring.toString());
      pos = endpos;
      // try get time
      endpos = Match(text, pos , (C_ZEROWIDTH_CHAR) + "#", "\n", matchstring);
      if (endpos<0) {
        ret.clear();
        return ret;
      }
      Date mtime = ParseDatetime(matchstring.toString());
      if (mtime == null) {
        ret.clear();
        return ret;
      }
      item.put("time", mtime.getTime());
      pos = endpos;
      // try get content
      boolean resolved = false;
      endpos = Match(text, pos , (C_ZEROWIDTH_CHAR)+"----\n", "\n"+(C_ZEROWIDTH_CHAR)+"\n", matchstring);
      if (endpos<0) {
        endpos = Match(text, pos , (C_ZEROWIDTH_CHAR)+"====\n", "\n"+(C_ZEROWIDTH_CHAR)+"\n", matchstring);
        resolved = true;
      }
      if (endpos<0) {
        ret.clear();
        return ret;
      }
      item.put("content", matchstring.toString());
      item.put("resolved", resolved);
      ret.add(item);
      pos = endpos;
    } while (pos < text.length());
    if (text.startsWith((C_ZEROWIDTH_CHAR)+"####\n", pos) == true) {
      String preservestring = ConversionUtil.HEXZIPStringToString(text.substring(pos + 6));
      JSONObject jsonitems_root = JSONObject.parse("{"+preservestring+"}");
      JSONArray jsonitems = (JSONArray) jsonitems_root.get("items");
      if (ret.size() == jsonitems.size()) 
      {
        for (int i=0; i<jsonitems.size();i++) 
        {
          JSONObject jsonitem = (JSONObject) jsonitems.get(i);
          item = (JSONObject) ret.get(i);
          Set<String> keys = jsonitem.keySet();
          for (String key:keys)
          {
            item.put(key, jsonitem.get(key));
          }
        }
      } else {
        // json items number is not the same as parsed content. discard them
        ret.clear();
        return ret;
      }
    }
    
    return ret;
  }
  public void startElement(AttributesImpl attributes)
  {
    super.startElement(attributes);
    mbChildPreserve = true;
    // Enable odf comments will not upgrade the draft version. 
    // So need a flag to determine if the comments is from an old preserved draft
    this.mAttrs.addAttribute("", "", "preserve", "PRESERVE", "0");
  }
  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes)
  {
      GeneralContext context = null;
        XMLUtil.NODENAME name = XMLUtil.getXMLToken(qName);
        switch(name){
          case TEXT_A :      
            context = new TextAContext(mImport, uri, localName, qName, mTarget);
            break;         
          case TEXT_P :      
            context = new TextPContext(mImport, uri, localName, qName, mTarget);
            break;         
          default:
            context =  new GeneralDOMContext(mImport, uri, localName, qName, mTarget);
            break;
        }
        return context;
  
  }

}

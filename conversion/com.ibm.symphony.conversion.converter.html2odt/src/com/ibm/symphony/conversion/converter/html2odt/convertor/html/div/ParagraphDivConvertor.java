package com.ibm.symphony.conversion.converter.html2odt.convertor.html.div;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.converter.html2odt.convertor.html.BodyConvertor;
import com.ibm.symphony.conversion.converter.html2odt.convertor.html.DIVConvertor;
import com.ibm.symphony.conversion.converter.html2odt.convertor.html.XMLConvertorUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.DOMIdGenerator;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;
import com.ibm.symphony.conversion.service.common.util.JTidyUtil;

public class ParagraphDivConvertor extends DIVConvertor
{

  @Override
  protected void doConvertXML(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);
    String id = htmlElement.getAttribute(HtmlCSSConstants.ID);
    String _type = (String) htmlElement.getAttribute("_type");
    if( _type != null )
    {
      if (  _type.equals(HtmlCSSConstants.TOPDIV) )
      {     
        BodyConvertor.stripRedundantDiv(context, htmlElement);

        if( odfElement == null)
        {
          String _sourcetype = htmlElement.getAttribute("_sourcetype");
          if( "spanDiv".equals(_sourcetype)  )
          {
            odfElement = XMLConvertorUtil.getCurrentFileDom(context).createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_SPAN));
          }
          else
          {
            odfElement = XMLConvertorUtil.getCurrentFileDom(context).createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_P));
          }
          indexTable.addEntryByHtmlNode(htmlElement, odfElement);
          parent.appendChild(odfElement);

        }
        else
        {
          parent.appendChild(odfElement);
        }
        try
        {
          convertAttributes(context, htmlElement, odfElement);
        }
        catch(Exception e)
        {
          
        }
        convertChildren(context, htmlElement, odfElement);
      }
      else if ( _type.equals(HtmlCSSConstants.LOCATIONDIV))
      {
        String divclass = htmlElement.getAttribute("class");
        if (divclass.indexOf("shape") != -1)
        {
          Document doc = (Document) context.getSource();
          Element div = doc.createElement(HtmlCSSConstants.DIV);
          div.setAttribute("_type", HtmlCSSConstants.LOCATIONDIV);
          NodeList children = htmlElement.getChildNodes();
          for (int i = 0; i < children.getLength(); i++)
          {
            div.appendChild(htmlElement.removeChild(children.item(i)));
          }
          htmlElement.appendChild(div);
          htmlElement.setAttribute("_type", HtmlCSSConstants.TOPDIV);
          BodyConvertor.stripRedundantDiv(context, htmlElement);
          OdfElement p = XMLConvertorUtil.getCurrentFileDom(context).createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_P));
          indexTable.addEntryByHtmlNode(htmlElement, p);

          parent.appendChild(p);
          convertChildren(context, htmlElement, p);
        }
      }
    }
    
  }

}

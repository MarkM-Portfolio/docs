/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf;

import org.odftoolkit.odfdom.doc.style.OdfStyleListLevelProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;
import org.odftoolkit.odfdom.doc.text.OdfTextListLevelStyleImage;
import org.odftoolkit.odfdom.doc.text.OdfTextListLevelStyleNumber;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;

import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertMapUtil;
import com.ibm.symphony.conversion.service.common.util.Measure;

/**
 * Internal class to hold the list style information for the current list level
 * 
 */
public class ListLevelDetails
{
  private int _textLevel;

  private double _spaceBefore;

  private double _minLabelWidth;

  private double _imageWidth;

  private String _bulletChar;
 
  private String _prefix;

  private String _suffix;

  private String _startValue;

  private String _numberFormat;

  private String _xlinkHref;

  private Double _fontSize;
  
  private String _fontFamily;
  
  private String _fontColor;

  private boolean _isBullet;

  private boolean _isNumber;

  private boolean _isRomanNumber;

  private boolean _isJapaneseNumber;

  private boolean _isImage;

  private boolean _hasNumberFormat;

  private String _odfListStyleName;
  
  private Node _listLevelStyleNode;

  /**
   * Construct a list level details object for the current list level of the ODF node
   * 
   * @param listLevel
   *          - ODF node for the <text:list-level-style-xxx>
   * 
   */
  public ListLevelDetails(Node listLevel, String odfListStyleName) // constructor
  {
    // set up default values
    _textLevel = 0;
    _spaceBefore = new Double(0.0);
    _minLabelWidth = new Double(0.0);
    _imageWidth = new Double(0.0);
    _bulletChar = "";
    _prefix = "";
    _suffix = "";
    _startValue = "";
    _numberFormat = "";
    _xlinkHref = "";
    _fontSize = new Double(1.0); // 100%
    _fontFamily = "";
    _fontColor = "";
    
    _listLevelStyleNode = listLevel;
    
    _isBullet = false;
    _isNumber = false;
    _isImage = false;

    _hasNumberFormat = false;
    _isRomanNumber = false;
    _isJapaneseNumber = false;

    _odfListStyleName = odfListStyleName;

    if (listLevel != null)
    {

      if (listLevel instanceof OdfTextListLevelStyleNumber)
      {
        _isNumber = true;
      }
      else if (listLevel instanceof OdfTextListLevelStyleImage)
      {
        _isImage = true;
      }
      else
      // assume it's a bullet
      {
        _isBullet = true;
      }

      NamedNodeMap attributes = listLevel.getAttributes();
      for (int j = 0; j < attributes.getLength(); j++) // loop thru attributes
      {
        Node attr = attributes.item(j);
        String nodeName = attr.getNodeName();
        if (nodeName.equals(ODPConvertConstants.ODF_ATTR_TEXT_LEVEL))
        {
          _textLevel = Integer.valueOf(attr.getNodeValue());
        }
        else if (nodeName.equals(ODPConvertConstants.ODF_ATTR_TEXT_START_VALUE))
        {
          Integer s = Integer.valueOf(attr.getNodeValue());
          if (s > 1) // Only set if > 1 - otherwise we will treat the same as if it wasn't specified to simplify the equals operator
          {
            //s -= 1; // need to subtract one from it because of how css counters work
            _startValue = Integer.toString(s);
          }
        }

        // pull out the bullet character
        else if (nodeName.equals(ODPConvertConstants.ODF_ATTR_TEXT_BULLET_CHAR))
        {
          _bulletChar = attr.getNodeValue();
        }
        
        // pull out the prefix
        else if (nodeName.equals(ODPConvertConstants.ODF_ATTR_STYLE_NUM_PREFIX))
        {
          _prefix = attr.getNodeValue();
        }

        // pull out the suffix
        else if (nodeName.equals(ODPConvertConstants.ODF_ATTR_STYLE_NUM_SUFFIX))
        {
          _suffix = attr.getNodeValue();
        }

        // process style:num-format
        else if (nodeName.equals(ODPConvertConstants.ODF_ATTR_STYLE_NUM_FORMAT))
        {
          String value = attr.getNodeValue();
          if (value.length() > 0)
          {
            _hasNumberFormat = true; // has a number format
            // Find the numFormat to use
            JSONObject attrMapping = (JSONObject) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF_ATTR).get(
                ODPConvertConstants.ODF_STYLE_NUM_FORMAT);
            _numberFormat = "1"; // Default to arabic numeral
            if (attrMapping.containsKey(value))
            {
              _numberFormat = value; // Non-string (1,a,A,i,I) value found
            }
            else  // not a normal number, check for Japanese numbering
            {
              if (value.equals(ODPConvertConstants.JAPANESE_NUMBER_J1))
              {
                _numberFormat = "j1";
                _isJapaneseNumber = true;
              }
              else if (value.equals(ODPConvertConstants.JAPANESE_NUMBER_J2))
              {
                _numberFormat = "j2";
                _isJapaneseNumber = true;
              }
            }

            if (_numberFormat.toUpperCase().equals("I"))
              _isRomanNumber = true;
          }
        }
        // process xlink:href
        else if (nodeName.equals(ODPConvertConstants.ODF_ATTR_XLINK_HREF))
        {
          _xlinkHref = attr.getNodeValue();
        }

      } // end, loop thru attributes

      NodeList listLevelProperties = listLevel.getChildNodes();

      for (int i = 0; i < listLevelProperties.getLength(); i++)
      {
        Node childNode = listLevelProperties.item(i);

        if (childNode instanceof OdfStyleListLevelProperties)
        {
          attributes = childNode.getAttributes();
          for (int j = 0; j < attributes.getLength(); j++)
          {
            Node attr = attributes.item(j);
            String nodeName = attr.getNodeName();
            if (nodeName.equals(OdfStyleListLevelProperties.SpaceBefore.toString()))
            {
              String nodeValue = attr.getNodeValue();
              _spaceBefore = Measure.extractNumber(nodeValue);
            }
            else if (nodeName.equals(OdfStyleListLevelProperties.MinLabelWidth.toString()))
            {
              String nodeValue = attr.getNodeValue();
              _minLabelWidth = Measure.extractNumber(nodeValue);
            }
            else if (nodeName.equals(ODPConvertConstants.ODF_ATTR_FO_WIDTH))
            {
              String nodeValue = attr.getNodeValue();
              _imageWidth = Measure.extractNumber(nodeValue);
            }
          }
        }
        else if (childNode instanceof OdfStyleTextProperties)
        {
          attributes = childNode.getAttributes();
          for (int j = 0; j < attributes.getLength(); j++)
          {
            Node attr = attributes.item(j);
            String nodeName = attr.getNodeName();
            if (nodeName.equals(OdfStyleTextProperties.FontSize.toString()))
            {
              Double fs_d = Measure.extractNumber(attr.getNodeValue());
              _fontSize = fs_d / 100.0;
            }
            else if (nodeName.equals(OdfStyleTextProperties.FontFamily.toString()))
            {
              _fontFamily = attr.getNodeValue();
            }
            else if (nodeName.equals(OdfStyleTextProperties.Color.toString()))
            {
              _fontColor = attr.getNodeValue();
            }
          }
        }
      }

      // we can't handle negative space-before, so adjust the label width (padding-left)
      // to be the difference between the 2, and zero out the spaceBefore (defect 7189)
      if (Double.compare(_spaceBefore, 0.0) < 0)
      {
        _minLabelWidth += _spaceBefore;
        _spaceBefore = 0.0;
      }

    }
    else // No list style.  Treat as default bullet (matching what Symphony would use).
    {
      _isBullet = true;     // List type is unknown.  Default to bullet.
      _textLevel = 1;       // Level is unknown.  Default to 1. 
      _fontSize = 0.45;     // 45%
    }
  } // end, constructor

  /**
   * Return the ODF list style name used to construct this object
   * 
   * @return String - e.g "Lxx"
   */
  public String getListStyleName()
  {
    return _odfListStyleName;
  }

  /**
   * Return the <code>text:level</code> property of the <code><text:list-level-style-xxxx></code> element
   * 
   * @return int
   */
  public int getLevel()
  {
    return _textLevel;
  }

  /**
   * Return the <code>text:space-before</code> property of the <code><style:list-level-properties></code> element
   * 
   * @return double - Will be zero if there isn't a <code>text:space-before</code> property in the list level node
   */
  public double getSpaceBefore()
  {
    return _spaceBefore;
  }

  /**
   * Return the <code>text:min-label-width</code> property of the <code><style:list-level-properties></code> element
   * 
   * @return double - Will be zero if there isn't a <code>text:min-label-width</code> property in the list level node
   */
  public double getMinLabelWidth()
  {
    return _minLabelWidth;
  }

  /**
   * Return the character signifying the number format (1,a,A,i,I)
   * 
   * @return String - If number format has not been set, an empty string is returned.
   */
  public String getNumberFormat()
  {
    return _numberFormat;
  }

  /**
   * Return the bullet character to be used
   * 
   * @return String - If there is no bullet character, an empty string is returned.
   */
  public String getBulletChar()
  {
    return _bulletChar;
  }
  
  /**
   * Return the character(s) to be placed before the bullet/number
   * 
   * @return String - If there are no chars, an empty string is returned.
   */
  public String getPrefix()
  {
    return _prefix;
  }

  /**
   * Return the character(s) to be placed after the bullet/number
   * 
   * @return String - If there are no chars, an empty string is returned.
   */
  public String getSuffix()
  {
    return _suffix;
  }

  /**
   * Return start value if this list level is for a number
   * 
   * @return String - The start value to use for the counter. Will be an empty string if there is no start value
   */
  public String getStartValue()
  {
    return _startValue;
  }

  /**
   * Get the font size of this list level
   * 
   * @return Double - size of bullet/number as a decimal (e.g. .50 for 50%)
   */
  public double getFontSize()
  {
    return _fontSize;
  }

  /**
   * Return the font family to be used
   * 
   * @return String - If there is no font family, an empty string is returned.
   */
  public String getFontFamily()
  {
    return _fontFamily;
  }

  /**
   * Return the font color to be used
   * 
   * @return String - If there is no font color, an empty string is returned.
   */
  public String getFontColor()
  {
    return _fontColor;
  }
  
  /**
   * Get the width for the image in this list level
   * 
   * @return Double - size of image
   */
  public double getImageWidth()
  {
    return _imageWidth;
  }

  /**
   * Get the image URL
   * 
   * @return String - URL to image xlink
   */
  public String getImageURL()
  {
    return _xlinkHref;
  }

  /**
   * Determine if this list level is for a number
   * 
   * @return boolean - true if this list level is a number
   */
  public boolean isNumber()
  {
    return _isNumber;
  }

  /**
   * Determine if this list level is for a number that is a Roman numeral format
   * 
   * @return boolean - true if this list level is a Roman number format
   */
  public boolean isRomanNumber()
  {
    return _isRomanNumber;
  }
  
  /**
   * Determine if this list level is for a number that is a Japanese format
   * 
   * @return boolean - true if this list level is a Japanese format
   */
  public boolean isJapaneseNumber()
  {
    return _isJapaneseNumber;
  }

  /**
   * Determine if this list level is for an image
   * 
   * @return boolean - true if this list level is an image
   */

  public boolean isBullet()
  {
    return _isBullet;
  }

  /**
   * Determine if this list level is for an image
   * 
   * @return boolean - true if this list level is an image
   */

  public boolean isImage()
  {
    return _isImage;
  }

  /**
   * Determine if this list level is a number, but has an empty number format
   * 
   * @return boolean - true if this list level does not have a number format
   */

  public boolean emptyNumberFormat()
  {
    return isNumber() && !_hasNumberFormat;
  }

  /**
   * Determine if THIS object equals the input ListLevelDetails object
   * 
   * @param inputLevelDetails - object to compare
   */
  public boolean equals(ListLevelDetails inputLevelDetails)
  {
    // quick check if they're the same list style name and level, they are equal
    if (this.getListStyleName().equals(inputLevelDetails.getListStyleName()) && (this.getLevel() == inputLevelDetails.getLevel()))
    {
      return true;
    }

    if ((this.getLevel() != inputLevelDetails.getLevel()) || (this.isNumber() != inputLevelDetails.isNumber())
        || (this.isBullet() != inputLevelDetails.isBullet()) || (this.isImage() != inputLevelDetails.isImage())
        || (this.isNumber() && !this.getStartValue().equals("") && !this.getStartValue().equals(inputLevelDetails.getStartValue()))
        || (!this.getNumberFormat().equals(inputLevelDetails.getNumberFormat()))
        || (this.getMinLabelWidth() != inputLevelDetails.getMinLabelWidth()) || (Double.compare(this.getFontSize(),inputLevelDetails.getFontSize()) != 0)
        || (this.getSpaceBefore() != inputLevelDetails.getSpaceBefore()) || (!this.getBulletChar().equals(inputLevelDetails.getBulletChar())) 
        || (!this.getPrefix().equals(inputLevelDetails.getPrefix())) || (!this.getSuffix().equals(inputLevelDetails.getSuffix())) 
        || (!this.getFontFamily().equals(inputLevelDetails.getFontFamily())) || (!this.getFontColor().equals(inputLevelDetails.getFontColor())) 
        || (this.getImageWidth() != inputLevelDetails.getImageWidth())
        || (!this.getImageURL().equals(inputLevelDetails.getImageURL())))
    {
      return false;
    }
    else
    {
      return true;
    }
  }
  
  
  public Node getListLevelStyleNode(){
  	return _listLevelStyleNode;
  }

}

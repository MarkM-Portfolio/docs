/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Allows to group CSS properties together and manipulate them for various purposes.
 */
public class CSSProperties
{

  // public static final String FAMILY_CHART = "chart";
  // public static final String FAMILY_DRAWING-PAGE = "drawing-page";
  public static final String FAMILY_GRAPHIC = "graphic";

  public static final String FAMILY_PARAGRAPH = "paragraph";

  // public static final String FAMILY_RUBY = "ruby";
  // public static final String FAMILY_SECTION = "section";
  // public static final String FAMILY_TABLE = "table";
  // public static final String FAMILY_TABLE-CELL = "table-cell";
  // public static final String FAMILY_TABLE-COLUMN = "table-column";
  // public static final String FAMILY_TABLE-ROW = "table-row";
  public static final String FAMILY_TEXT = "text";

  private static final String[] FAMILY_GRAPHIC_PROPERTIES = { "background-color", "background-repeat", "border", "border-bottom",
      "border-bottom-line-width", "border-left", "border-left-line-width", "border-line-width", "border-right", "border-right-line-width",
      "border-top", "border-top-line-width", "draw_fill-image-height", "draw_fill-image-ref-point", "draw_fill-image-width",
      "draw_tile-repeat-offset", "height", "left", "margin", "margin-bottom", "margin-left", "margin-right", "margin-top", "max-height",
      "max-width", "min-height", "min-width", "padding", "padding-bottom", "padding-left", "padding-right", "padding-top", "top",
      "vertical-align", "width", "word-wrap" };

  private static final String[] FAMILY_PARAGRAPH_PROPERTIES = { "background-color", "border", "border-bottom", "border-bottom-line-width",
      "border-left", "border-left-line-width", "border-line-width", "border-right", "border-right-line-width", "border-top",
      "border-top-line-width", "line-break", "line-height", "margin", "margin-bottom", "margin-left", "margin-right", "margin-top",
      "orphans", "padding", "padding-bottom", "padding-left", "padding-right", "padding-top", "special-process1", "special-process3",
      "text-align", "text-autospace", "text-indent", "vertical-align", "widows" };

  private static final String[] FAMILY_TEXT_PROPERTIES = { "background-color", "color", "display", "font-family", "font-size",
      "font-style", "font-variant", "font-weight", "letter-spacing", "text-decoration", "text-transform" };

  // FAMILY_TEXT_PROPERTIES: Removed text_shadow since the editor does not currently support editing it and there is no code to handle on
  // export.

  private LinkedHashMap<String, String> propertiesMap;

  /**
   * Constructs an empty group of CSS properties.
   */
  public CSSProperties()
  {
    propertiesMap = new LinkedHashMap<String, String>();
  }

  /**
   * Constructs a group of CSS properties initialized to the contents of the specified properties string. See the setProperties method for
   * more details about the parameters.
   *
   * @param properties - string representing the properties to set
   * @param updateExistingProperties - whether or not the existing properties should be updated
   */
  public CSSProperties(String properties, boolean updateExistingProperties)
  {
    this();
    setProperties(properties, updateExistingProperties);
  }

  /**
   * Returns the value of a given property name from a given properties string.
   *
   * @param properties - the properties string to extract the property value from
   * @param name - the property name to extract the value of
   * @return the property value, or null if the property doesn't exist
   */
  static public String extractProperty(String properties, String name)
  {
    return new CSSProperties(properties, true).getProperty(name);
  }

  /**
   * Sets a group of properties from a single string such as "color:#fffff;line-height:4em;". The updateExistingProperties parameter allows
   * to indicate whether already existing properties should be updated or not. Please note that property names are handled as lowercase
   * strings.
   *
   * @param properties - string representing the properties to set
   * @param updateExistingProperties - whether or not the existing properties should be updated
   * @return the number of properties that were set
   */
  public int setProperties(String properties, boolean updateExistingProperties)
  {
    if (properties == null)
    {
      return 0; // no properties, bail out
    }

    int setCount = 0;

    String[] pieces = properties.split(ODPConvertConstants.SYMBOL_SEMICOLON);
    for (String piece : pieces)
    {
      String[] nameValue = piece.split(ODPConvertConstants.SYMBOL_COLON, 2);
      if (nameValue.length < 1)
      {
        continue; // nothing to work with, skip it
      }

      String name = nameValue[0].trim().toLowerCase();
      if (name.length() == 0)
      {
        continue; // no name, skip it
      }

      String value = ""; // default to empty string as it may not exist
      if (nameValue.length == 2)
      {
        value = nameValue[1].trim(); // value found, use it
      }

      if (!updateExistingProperties && propertiesMap.containsKey(name))
      {
        continue; // no update, name exists, skip it
      }

      propertiesMap.put(name, value);
      setCount++;
    }

    return setCount;
  }

  /**
   * Sets a group of properties from a CSS style map. The updateExistingProperties parameter allows to indicate whether already existing
   * properties should be updated or not. Please note that property names are handled as lowercase strings.
   *
   * @param cssStyleMap - CSS style map to get the properties from
   * @param updateExistingProperties - whether or not the existing properties should be updated
   * @return the number of properties that were set
   */
  public int setProperties(Map<String, String> cssStyleMap, boolean updateExistingProperties)
  {
    if (cssStyleMap == null)
    {
      return 0; // no properties, bail out
    }

    int setCount = 0;

    for (String name : cssStyleMap.keySet())
    {
      String value = cssStyleMap.get(name);
      name = name.toLowerCase();
      if (!updateExistingProperties && propertiesMap.containsKey(name))
      {
        continue; // no update, name exists, skip it
      }
      propertiesMap.put(name, value);
      setCount++;
    }

    return setCount;
  }

  /**
   * Similarly to setProperties, sets the properties, but this time from a named node map object.
   *
   * @param properties - named node map representing the properties to set
   * @return the number of properties that were set
   */
  /*
   * public int setProperties(NamedNodeMap properties, boolean updateExistingProperties) { // This method is not implemented yet. }
   */

  /**
   * Sets a single property for a given name and value. If the property already exists, it is updated. To prevent updates, use
   * propertyExists before setting the property. Please note that property names are handled as lowercase strings.
   *
   * @param name - the name of the property to add
   * @param value - the value of the property to add
   */
  public void setProperty(String name, String value)
  {
    if (name == null || value == null)
    {
      return; // no name or value, bail out
    }
    propertiesMap.put(name.trim().toLowerCase(), value.trim());
  }

  /**
   * Removes a single property. If the property is found, it is removed. Please note that property names are handled as lowercase strings
   * (so the name passed will be set to lower case prior to attempting the remove).
   *
   * @param name - the name of the property to remove
   */
  public void removeProperty(String name)
  {
    if (name == null || name.length() == 0)
    {
      return; // no name, bail out
    }
    propertiesMap.remove(name.trim().toLowerCase());
  }

  /**
   * Returns whether a property for a given name exists or not. Please note that property names are handled as lowercase strings.
   *
   * @param name - the property name to check the existence of
   * @return whether or not the property exists
   */
  public boolean propertyExists(String name)
  {
    return propertiesMap.containsKey(name.trim().toLowerCase());
  }

  /**
   * Returns the number of properties.
   *
   * @return the number of properties
   */
  public int size()
  {
    return propertiesMap.size();
  }

  /**
   * Removes all of the properties.
   */
  public void clear()
  {
    propertiesMap.clear();
  }

  /**
   * Returns the value for a given property name. Please note that property names are handled as lowercase strings.
   *
   * @param name - the property name to get the value of
   * @return the property value, or null if the property doesn't exist
   */
  public String getProperty(String name)
  {
    if (!propertyExists(name))
    {
      return null;
    }

    return propertiesMap.get(name.trim().toLowerCase());
  }

  /**
   * Builds the properties as a string such as "color:#fffff;line-height:4em;".
   *
   * @param names - property names to build the string with
   * @param validate - whether or not names should be validated before, this allows to reduce processing when names are known to be valid
   * @return the properties
   */
  private String buildPropertiesString(Collection<String> names, boolean validateNames)
  {
    StringBuilder properties = new StringBuilder(128);
    for (String name : names)
    {
      String property = propertiesMap.get(name);
      if (validateNames && property == null)
      {
        continue; // name doesn't exist, skip it
      }
      properties.append(name + ODPConvertConstants.SYMBOL_COLON + property + ODPConvertConstants.SYMBOL_SEMICOLON);
    }
    return properties.toString();
  }

  /**
   * Returns the properties as a string such as "color:#fffff;line-height:4em;".
   *
   * @return the properties
   */
  public String getPropertiesAsString()
  {
    return buildPropertiesString(propertiesMap.keySet(), false);
  }

  /**
   * Overrides toString with the implementation of getPropertiesAsString.
   *
   * @return the properties as a string such as "color:#fffff;line-height:4em;"
   */
  public String toString()
  {
    return getPropertiesAsString();
  }

  /**
   * Returns the properties as a named node map.
   *
   * @return the properties
   */
  /*
   * public NamedNodeMap getPropertiesAsMap() { // This method is not implemented yet. }
   */

  /**
   * Returns the properties as an ODF style node.
   *
   * @return the properties
   */
  /*
   * public Node getPropertiesAsNode() { // This method is not implemented yet. }
   */

  /**
   * Returns the properties, for a given family, as a string such as "color:#fffff;line-height:4em;".
   *
   * @return the properties
   */
  public String getPropertiesByFamilyAsString(String family)
  {
    return getPropertiesByFamilyAsString(new String[] { family });
  }

  /**
   * Returns the properties, for a given family, as a named node map.
   *
   * @return the properties
   */
  /*
   * public Map getPropertiesByFamilyAsMap(String family) { // This method is not implemented yet. }
   */

  /**
   * Returns the properties, for a given family, as an ODF style node.
   *
   * @return the properties
   */
  /*
   * public Node getPropertiesByFamilyAsNode(String family) { // This method is not implemented yet. }
   */

  /**
   * Returns the properties, for a given set of families, as a string such as "color:#fffff;line-height:4em;".
   *
   * @return the properties
   */
  public String getPropertiesByFamilyAsString(String[] families)
  {
    ArrayList<String> names = new ArrayList<String>();

    for (String family : families)
    {
      if (family.equals(FAMILY_GRAPHIC))
      {
        names.addAll(Arrays.asList(FAMILY_GRAPHIC_PROPERTIES));
      }
      else if (family.equals(FAMILY_PARAGRAPH))
      {
        names.addAll(Arrays.asList(FAMILY_PARAGRAPH_PROPERTIES));
      }
      else if (family.equals(FAMILY_TEXT))
      {
        names.addAll(Arrays.asList(FAMILY_TEXT_PROPERTIES));
      }
    }

    return buildPropertiesString(names, true);
  }

  /**
   * Returns the properties, for a given set of families, as a named node map.
   *
   * @return the properties
   */
  /*
   * public Map getPropertiesByFamilyAsMap(String[] families) { // This method is not implemented yet. }
   */

  /**
   * Returns the properties, for a given set of families, as an ODF style node.
   *
   * @return the properties
   */
  /*
   * public Node getPropertiesByFamilyAsNode(String[] families) { // This method is not implemented yet. }
   */

}

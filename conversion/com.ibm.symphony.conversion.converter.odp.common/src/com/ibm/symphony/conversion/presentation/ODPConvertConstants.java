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

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import com.ibm.symphony.conversion.service.common.ODFConstants;

public class ODPConvertConstants
{
  // "office_automatic_style", "office_style","content_office_automatic_style" 
  public static enum STYLE_TYPE {
    OFFICE_AUTOMATIC_STYLE, OFFICE_STYLE, MASTER_STYLE, CONTENT_OFFICE_AUTOMATIC_STYLE, TEXT_LIST_INPLACE_STYLE
  };

  public static enum DOCUMENT_TYPE {
    STYLES, MASTER, CONTENT
  };

  public static enum DIV_CONTEXT_TYPE {
    SPEAKER_NOTES
  };

  public static final boolean DEBUG = false; // NOTE: This should be set to false in the final build.

  // =====================================================================
  // File related
  // =====================================================================
  public static final String FILE_RESOURCE_SEPARATOR = "/";

  public static final String FILE_OUTPUT_PREFIX = "output";

  public static final String FILE_HTML2ODP_TARGET_FOLDER = FILE_OUTPUT_PREFIX + File.separator + "html2odp";

  public static final String FILE_ODP2HTMP_TARGET_FOLDER = FILE_OUTPUT_PREFIX + File.separator + "odp2html";

  public static final String FILE_SUFFIX_HTML = ".html";

  public static final String FILE_SUFFIX_ZIP = ".zip";

  public static final String FILE_SUFFIX_PNG = ".png";

  public static final String FILE_SUFFIX_SVM = ".svm";

  public static final String FILE_SUFFIX_WMF = ".wmf";

  public static final String FILE_SUFFIX_EMF = ".emf";

  public static final String FILE_SUFFIX_SVG = ".svg";

  public static final String IMAGE_SUFFIX_SLIDESORTER = ".ss";

  public static final String IMAGE_SUFFIX_SLIDEEDITOR = ".se";

  public static final String FILE_PNG = "png";

  public static final String FILE_WMF = "wmf";

  public static final String FILE_EMF = "emf";

  public static final String FILE_SVM = "svm";

  public static final String FILE_JPG = "jpg";

  public static final String FILE_JPEG = "jpeg";

  public static final String FILE_BMP = "bmp";

  public static final String FILE_GIF = "gif";

  public static final String FILE_SVG = "svg";

  public static final String MIME_TYPE_WMF = "application/x-msmetafile";

  public static final String MIME_TYPE_SVM = "image/svm";

  public static final String MIME_TYPE_PNG = "image/png";

  public static final String MIME_TYPE_JPEG = "image/jpeg";

  public static final String FILE_HTML_CONTENT_FILE_NAME = "content" + FILE_SUFFIX_HTML;

  public static final String FILE_HTML_MASTER_FILE_NAME = "master" + FILE_SUFFIX_HTML;

  public static final String FILE_STYLES_XML = "styles.xml";

  public static final String FILE_TEMPLATE_LIST = "templateList.json";

  public static final String FILE_PICTURE_PREFIX = "Pictures";

  public static final String FILE_PICTURE_START_PREFIX = FILE_PICTURE_PREFIX + FILE_RESOURCE_SEPARATOR;
  
  public static final String FILE_MEDIA_PREFIX = "media";

  public static final String FILE_MEDIA_START_PREFIX = FILE_MEDIA_PREFIX + FILE_RESOURCE_SEPARATOR;

  public static final String FILE_OBJECT_REPLACEMENTS_FOLDER = "ObjectReplacements";

  public static final String FILE_OBJECT_REPLACEMENT_START_PREFIX = FILE_OBJECT_REPLACEMENTS_FOLDER + FILE_RESOURCE_SEPARATOR;

  public static final String FILE_CHARTS_PREFIX = "Charts";

  public static final String FILE_CHARTS_START_PREFIX = FILE_CHARTS_PREFIX + FILE_RESOURCE_SEPARATOR;

  public static final String FILE_DEFAULT_CHART_IMAGE = "default_chart.png";

  public static final String FILE_ORIGNAME_FIX = "original_";

  public static final String FILE_CONVERTED = "converted";

  public static final String FILE_CONVERTED_ODP = FILE_CONVERTED + ".odp";

  public static final String FILE_ODF_DRAFT = "odfdraft";

  public static final String FILE_BLANK_TEMPLATE = "Blank_Template.odp";

  // =====================================================================
  // Context related
  // =====================================================================
  public static double CONTEXT_PARENT_SIZE_DEFAULT = 18.0;

  public static double CONTEXT_LINE_HEIGHT_DEFAULT = 1.0;

  public static double CONTEXT_LINE_HEIGHT_OFFSET = 0.125;

  public static double CONTEXT_FONT_SIZE_DEFAULT = 1.0;

  public static final String CONTEXT_UNIQUE_ID = "unique-id";

  public static final String CONTEXT_PARENT_SIZE = "parent-size";
  
  public static final String CONTEXT_PARENT_PRESENTATION_CLASS = "presentation-class-name";

  public static final String CONTEXT_PARENT_WIDTH = "parent-width";

  public static final String CONTEXT_TARGET_CONTENT_PATH = "target-content-path";

  public static final String CONTEXT_TARGET_MASTER_PATH = "target-master-path";

  public static final String CONTEXT_CONVERT_SOURCE = "source";

  public static final String CONTEXT_MASTER_STYLE_MODE_VALUE = "master_style_mode_value";

  public static final String CONTEXT_CUSTOM_STYLE_MODE_VALUE = "custom_style_mode_value";

  public static final String CONTEXT_UPGRADE_MASTER_TARGET = "master-target";

  public static final String CONTEXT_UPGRADE_CONTENT_TARGET = "content-target";

  public static final String CONTEXT_CONVERT_TARGET = "target";

  public static final String CONTEXT_CONVERT_RESULT = "result";

  public static final String CONTEXT_EXPORT_CONVERT_RESULT = "export_result";

  public static final String CONTEXT_OLD_CHILDREN = "oldChildren";

  public static final String CONTEXT_REORDER = "Reorder";

  public static final String CONTEXT_CURRENT_ELEMENT = "current-element-context";

  public static final String CONTEXT_PARENT_ELEMENT = "current-parent-element";

  public static final String CONTEXT_CURRENT_STYLE_NODE = "current-style-node";

  public static final String CONTEXT_OUTLINE_FONTSIZE_MAP = "outline-fontsize-map";

  public static final String CONTEXT_LIST_OUTLINE_STYLE_NAME = "list-outline-style-name";
  
  public static final String CONTEXT_LIST_OUTLINE_STYLE_NAME_NEW = "list-outline-style-name-new";

  public static final String CONTEXT_CURRENT_LISTSTYLE = "list-style";

  public static final String CONTEXT_INPLACE_STYLE = "InplaceStyle"; // Only Used by ODT

  public static final String CONTEXT_SLIDE_NAME_ID = "slide-name-id";
  
  public static final String CONTEXT_SLIDE_HREF_LIST = "slide-href-list";
    
  public static final String CONTEXT_TARGET_BASE = "target-base";

  public static final String CONTEXT_SOURCE_PATH = "source-path";

  public static final String CONTEXT_TARGET_PATH = "target-path";

  public static final String CONTEXT_DRAWPAGE_HEAD_FOOT = "drawpage-header-footers";

  public static final String CONTEXT_DRAWPAGE_PAGE_NUMBER = "draw-page-page-number";

  public static final String CONTEXT_HEAD_FOOT_VALUE = "head-foot-value";

  public static final String CONTEXT_SHOW_HEAD_FOOT = "head-foot-show";

  public static final String CONTEXT_HEAD_FOOT_STYLE = "head-foot-style";

  public static final String CONTEXT_DRAWPAGE_MASTER_NAME = "draw-page-master-page-name";

  public static final String CONTEXT_DRAWPAGE_PROP_MAP = "draw-page-properties-map";

  public static final String CONTEXT_DRAWPAGE_FOOT_STYLE = "draw-page-footer-style";

  public static final String CONTEXT_DRAWPAGE_DATETIME_STYLE = "draw-page-date-time-style";

  public static final String CONTEXT_DRAWFRAME_MASTER_PRES_NAME = "draw-frame-master-presentation-name";

  public static final String CONTEXT_NEXT_OUTLINE_INDEX = "outline-index-next";

  public static final String CONTEXT_TEXTLIST_CHILD_HTML = "textlist-child-html-element";

  public static final String CONTEXT_TEXTLIST_HEADER_FLAG = "text:list-header-flag";

  public static final String CONTEXT_TEXTLIST_STYLE_BASE_NAME = "textlist-base-class";

  public static final String CONTEXT_TEXTLIST_STYLE_NAME = "text:style-name";

  public static final String CONTEXT_TEXTLIST_PARENT_TYPE = "list-parent-type";

  public static final String CONTEXT_TEXTLIST_START_VALUE = "list-start-value";

  public static final String CONTEXT_TEXTLIST_CHILD_SKIP_LI = "textlist-child-skip-li";

  public static final String CONTEXT_TEXTLIST_ITEM_COUNTER = "textlist-item-counter";

  public static final String CONTEXT_LIST_ITEM_LEVEL_DETAILS = "list-item-level-details";
  
  public static final String CONTEXT_LIST_IL_CLASS_NAME = "list-il-class-name";
  
  public static final String CONTEXT_LIST_ITEM_LEVEL_FROM = "list-item-level-from";

  public static final String CONTEXT_TABLE_INDEX = "table-index";

  public static final String CONTEXT_TABLE_WIDTH = "TableWidth";

  public static final String CONTEXT_TABLE_HEIGHT = "TableHeight";

  public static final String CONTEXT_TABLE_CELL_WIDTH_ARRAY = "table-cell-width-array";

  public static final String CONTEXT_TABLE_CELL_WIDTH = "table-cell-width";

  public static final String CONTEXT_PAGE_SIZE = "page-size";

  public static final String CONTEXT_CURRENT_SIZE = "current-size";

  public static final String CONTEXT_TABLE_TEMPLATE_REF = "table-template-reference";

  public static final String CONTEXT_TABLE_TEMPLATE_MAP = "table-template-map";

  public static final String CONTEXT_TABLE_TEMPLATE_ATTRS = "table-template-attrs";

  public static final String CONTEXT_TABLE_STYLE_ELEMENTS = "table-style-elements";

  public static final String CONTEXT_HTML_STYLE_SOURCE = "html-style-source";

  public static final String CONTEXT_LIST_STYLE_SOURCE = "list-style-source";

  public static final String CONTEXT_LIST_STYLE_SUFFIX = "list-style-suffix";

  public static final String CONTEXT_DEFINED_TABLE_STYLES = "defined-table-styles";

  public static final String CONTEXT_CUSTOM_STYLE_NAME = "custom-style-name";

  public static final String CONTEXT_PAGE_WIDTH = "page-width";

  public static final String CONTEXT_PAGE_WIDTH_DEFAULT = "28cm";

  public static final String CONTEXT_PAGE_HEIGHT = "page-height";

  public static final String CONTEXT_PAGE_ORIENTATION = "page-orientation";

  public static final String CONTEXT_MIN_SHAPE_DIV_HEIGHT = "shape-div-height";

  public static final String CONTEXT_MIN_SHAPE_DIV_WIDTH = "shape-div-width";

  public static final String CONTEXT_SHAPE_TEXT_AREAS = ODFConstants.CONTEXT_SHAPE_TEXT_AREAS;

  public static final String CONTEXT_PAGE_HEIGHT_DEFAULT = "21cm";

  public static final String CONTEXT_PAGE_ORIENTATION_DEFAULT = "landscape";

  public static final String CONTEXT_CSS_COMMON_STYLE = "css-common-style";

  public static final String NEW_CONTEXT_CSS_COMMON_STYLE = "new-css-common-style";

  public static final String CONTEXT_CSS_AUTOMATIC_STYLE = "css-automatic-style";

  public static final String CONTEXT_CSS_CONTENT_STYLE = "css-content-style";
  
  public static final String CONTEXT_LIST_BEFORE_STYLE = "list_before_style";

  public static final String NEW_CONTEXT_CSS_CONTENT_STYLE = "new-css-content-style";

  public static final String CONTEXT_COPY_PRESERVE_MAP = "copy-preserve_map";

  /**
   * Style hash map similar to the other ones (common, automatic, and content), to contain css style properties put on hold, i.e. removed
   * from their original css class and to be processed later during the import process. This new style entry in the context was originally
   * added to handle the text-decoration values (overline, line-through, and underline), but could serve for any additional property if
   * necessary. The structure is the same, a hash where the key is the style name, and the value a hash where the key/value is the property
   * name/value. Added in the scope of defect 9864.
   */
  public static final String CONTEXT_CSS_ON_HOLD_STYLE = "css-on-hold-style";

  public static final String CONTEXT_AUTOSTYLE_NODES_MAP = "auto-style-nodes";

  // public static final String CONTEXT_SYTLENAME_NODES_MAP = "style-names";

  public static final String CONTEXT_ODP_STYLES_MAP = "style-elements";

  public static final String CONTEXT_STYLES_HASHMAP = "styles-hashmap";

  public static final String CONTEXT_DRAWNAME_NODES_MAP = "draw-names";

  public static final String CONTEXT_SYTLENAME_NODES_MAP_IN_CONTENT = "style-names-content";

  public static final String CONTEXT_SYTLENAME_NODES_MAP_IN_STYLE = "style-names-style";

  public static final String CONTEXT_INSIDE_SHAPE = "inside-shape";

  public static final String CONTEXT_INSIDE_SVGSHAPE = "inside-SVGshape";

  public static final String CONTEXT_INSIDE_CHART = "inside-chart";

  public static final String CONTEXT_TRANSITION_VALUES = "transition-values";

  public static final String CONTEXT_PAGE_TRANSITION_STYLE = "page-transition-style";

  public static final String CONTEXT_OUTER_SPAN_CLASS = "outer-span-class";

  public static final String TARGET_FILE_PATH = "target-file-path";

  public static final String CONTEXT_STYLES_DOM = "styles_dom";

  public static final String CONTEXT_INDEX_TABLE = "indexTable";

  public static final String CONTEXT_MASTER_HTML = "masterHtml";

  public static final String CONTEXT_OFFICE_VERSION = "office-version";

  public static final String CONTEXT_FIELD_BOOLEAN_ATTRIBUTE = "isField";

  public static final String CONTEXT_FIELD_TYPE = "FieldType";

  public static final String CONTEXT_IS_NEW_DOC = "isNewDoc";

  public static final String CONTEXT_ODP_STYLES_MAP_ADDED = "converted_styles_map";

  public static final String CONTEXT_ODP_STYLES_MAP_UPDATED = "converted_styles_map_updated";

  public static final String CONTEXT_USED_STYLE_MAP = "used_style_map";

  public static final String CONTEXT_PRE_STYLE_NAME_MAP = "pre_style_name_map"; // for performance

  public static final String CONTEXT_PRE_STYLE_NAME = "presentation_style-name";

  public static final String CONTEXT_PAGE_TEMPLATE_NAME = "page_template_name";

  public static final String CONTEXT_PAGE_FRAME_LIST = "page_frame_list";

  public static final String CONTEXT_PAGE_LAYOUT_NAME = "page_layout_name";

  public static final String CONTEXT_PAGE_LAYOUT_NAME_UPDATED = "page_layout_name_updated";

  public static final String CONTEXT_INLINE_STYLE_MAP = "inline-styles-map";

  public static final String CONTEXT_IN_STYLE = "InsideStyles";

  public static final String CONTEXT_DOCUMENT_TYPE = "DocumentType";

  public static final String CONTEXT_HEADER_HEADER_MAP = "HeaderHeaderMap";

  public static final String CONTEXT_HEADER_FOOTER_MAP = "HeaderFooterMap";

  public static final String CONTEXT_HEADER_DATETIME_MAP = "HeaderDateTimeMap";

  public static final String CONTEXT_HEADER_PAGENUMBER_MAP = "HeaderPageNumberMap";

  public static final String CONTEXT_SHAPE_TRANSFORM_ANGLE = "ShapeTransformAngle";

  public static final String CONTEXT_TEXT_ROTATION_ANGLE = "DrawTextRotationAngle";

  public static final String CONTEXT_CACHED_SHAPE_MAP = "CachedShapeMap";

  public static final String CONTEXT_CACHED_CROP_MAP = "CachedCropMap";
  
  public static final String CONTEXT_CHART_NAMES = "ChartNames";
  
  public static final String CONTEXT_NEW_LIST_STYLE_NAME_MAP = "NewListStyleNameMap";
 
  public static final String ODF_DRAW_FRAME_ELEMENT = "OdfDrawFrameElement";

  public static final String CSS_RTL_QUALIFIER = "[style*=\"direction: rtl\"]";

  /**
   * Holds a temporary object for the style currently being imported from ODP This is only populated when a font size or padding conflict is
   * detected. In this case the style map (which maps the ODF style obj to CSS attributes) is duplicated and placed in this context
   * variable.
   */
  public static final String CONTEXT_NEW_STYLE_MAP = "new-style-map";

  /**
   * When a style must be duplicated due to font size or padding conflicts, a count must be kept so a unique style name can be created each
   * time. This object maps style names (original names) to count values. The count value is the duplicate instance number.
   */
  public static final String CONTEXT_NEW_STYLE_COUNT_MAP = "new-style-count-map";

  /**
   * The nested mapping table will keep track of font size/padding mapping for a given style. Each style with duplicates has an entry. Each
   * entry consists of a map that maps style to duplicate style "instance number".
   */
  public static final String CONTEXT_NEW_STYLE_DUP_INSTANCE_MAP = "new-style-instance-dup-map";

  /**
   * Map the outline level to font size. This is needed on export so that the proper font size calculations can be made for in-line styles
   * within lists.
   */
  public static final String CONTEXT_EXPORT_OUTLINE_FONTSIZE_MAP = "export-outline-fs-map";

  public static final String CONTEXT_EXPORT_LIST_CLONE_MAP = "export-outline-list-clone-map";

  /**
   * Map the outline level to font color.
   */
  public static final String CONTEXT_EXPORT_OUTLINE_FONTCOLOR_MAP = "export-outline-fc-map";

  /**
   * This value is used to count the pages on import and export (checked against page limits)
   */
  public static final String CONTEXT_PAGE_COUNT = "page-count";

  /**
   * This value is used to count the graphics on import (checked against page limits)
   */
  public static final String CONTEXT_GRAPHIC_COUNT = "graphic-count";

  public static final String CONTEXT_LIST_ITEM_LINE_HEIGHT = "ListItemLineHeight";

  public static final String CONTEXT_LIST_ITEM_BULLET_SIZE = "ListItemBulletSize";

  public static final String CONTEXT_THUMB_NAIL_PAGENUMBER = "thumbNailPageNumber";

  public static final String CONTEXT_TEXT_P_ELEMENT = "textPelement";

  public static final String CONTEXT_PROCESSING_FOOTERS = "ProcessingFooter";

  public static final String CONTEXT_PROCESSING_FOOTER_TYPE = "ProcessingFooterType";

  public static final String CONTEXT_FOOTER_FIELD = "FooterField";

  // public static final String CONTEXT_USED_MASTER_PAGE_STYLES = "UsedMasterPageStyles";

  /**
   * Used in the context so that property information for a conversion can be tracked as the conversion traverses the XML structure. Holds a
   * StackableProperties object.
   */
  public static final String CONTEXT_STACKABLE_PROPERTIES = "stackable-properties";

  /**
   * Used to specific the context of the current node when processing a conversion.
   */
  public static final String CONTEXT_DIV_CONTEXT = "div_context";

  /**
   * Used to disable in-line style processing for the current element. When this is set to "true", the style info will not be copied in-line
   * and the auto color processing will be broken for the current node and all nodes under it. DO NOT USE this unless you know exactly what
   * you're doing - if you use this you should manually call the in-line style processing code to restore the in-line style processing and
   * auto color processing (if needed).
   */
  public static final String CONTEXT_DISABLE_INLINE_STYLE_PROCESS = "disable-inline-style-processing";

  /**
   * During import, the style names for table template cell styles are renamed using the CSS specificity. This is used to store the old
   * table cell style names in the context so that after the styles.xml is processed, the old cell style names can be deleted from the list
   * of styles.
   */

  public static final String CONTEXT_OLD_TABLE_TEMPLATE_STYLENAMES = "old-table-template-stylenames";

  /**
   * Parameter placed in context when performing a style conversion during export. The old style object is stored in the context and must be
   * removed when no longer needed.
   */
  public static final String CONTEXT_OLD_STYLE_PARAM = "old-style-param";

  /**
   * Used during the style conversion to track the actual font size set in the current style element.
   */
  public static final String CONTEXT_CURRENT_FONT_SIZE = "current-font-size";
  
  public static final String CONTEXT_DEFAULT_FONT_SIZE = "default-font-size";

  /**
   * Used during the export to track whether the IBM Docs Dashed Line Style exists in the presentation
   */
  public static final String CONTEXT_DASHED_STYLE_EXISTS = "dashed-style-exists";

  /**
   * Used during the export to denote what post-processing style adjustments are needed for Shapes
   */
  public static final String CONTEXT_SVG_STYLE_ADJUSTMENTS = "Svg2Odf-style-adjustments";

  // =====================================================================
  // ODF related
  // =====================================================================
  public static final double OFFICE_VERSION_10 = 1.0;

  public static final double OFFICE_VERSION_11 = 1.1;

  public static final double OFFICE_VERSION_12 = 1.2;

  public static final String ODF_STYLE_COMMON = "office:styles";

  public static final String CSS_STYLE_COMMON_FILE = "office_styles.css";

  public static final String CSS_STYLE_TEXT_CSS = "text/css";

  public static final String CSS_STYLE_STYLESHEET = "stylesheet";

  public static final String ODF_STYLE_AUTO = "office:automatic-styles";

  public static final String CSS_STYLE_AUTO_FILE = "office_automatic_styles.css";

  public static final String ODF_STYLE_MASTER = "office:master-styles";

  public static final String ODF_STYLE_DOCUMENT = "office:document-styles";

  public static final String ODF_STYLE_DOCUMENT_CONTENT = "office:document-content";

  public static final String ODF_ELEMENT_OFFICE_BODY = "office:body";

  public static final String ODF_ELEMENT_PRESENTATION = "office:presentation";

  public static final String ODF_ELEMENT_TABLETABLE = "table:table";

  public static final String ODF_ELEMENT_TABLETABLE_CELL = "table:table-cell";

  public static final String ODF_ELEMENT_TABLE_CELL = "table-cell";

  public static final String ODF_ELEMENT_TABLEBODY = "table:body";

  public static final String ODF_ELEMENT_TABLESTYLE_NAME = "table:style-name";

  public static final String ODF_ELEMENT_TABLETABLE_ROW = "table:table-row";

  public static final String ODF_ELEMENT_TABLETABLE_COLUMN = "table:table-column";

  public static final String ODF_ELEMENT_TABLEFIRST_ROW = "table:first-row";

  public static final String ODF_ELEMENT_TABLELAST_ROW = "table:last-row";

  public static final String ODF_ELEMENT_TABLEFIRST_COLUMN = "table:first-column";

  public static final String ODF_ELEMENT_TABLELAST_COLUMN = "table:last-column";

  public static final String ODF_ELEMENT_TABLEODD_ROWS = "table:odd-rows";

  public static final String ODF_ELEMENT_TABLEODD_COLUMNS = "table:odd-columns";

  public static final String ODF_ELEMENT_TABLETABLE_TEMPLATE = "table:table-template";

  public static final String ODF_ELEMENT_TABLETEMPLATE_NAME = "table:template-name";

  public static final String ODF_ELEMENT_TABLEUSE_BANDING_ROWS_STYLES = "table:use-banding-rows-styles";

  public static final String ODF_ELEMENT_TABLEUSE_FIRST_ROW_STYLES = "table:use-first-row-styles";

  public static final String ODF_ELEMENT_TABLEUSE_LAST_ROW_STYLES = "table:use-last-row-styles";

  public static final String ODF_ELEMENT_TABLEUSE_FIRST_COLUMN_STYLES = "table:use-first-column-styles";

  public static final String ODF_ELEMENT_TABLEUSE_LAST_COLUMN_STYLES = "table:use-last-column-styles";

  public static final String ODF_ELEMENT_TABLEUSE_BANDING_COLUMNS_STYLES = "table:use-banding-columns-styles";

  public static final String ODF_ELEMENT_BORDER_COLOR = "border-color";

  public static final String ODF_ELEMENT_BORDER_TOP_COLOR = "border-top-color";

  public static final String ODF_ELEMENT_BACKGROUND_COLOR = "background-color";

  public static final String ODF_ELEMENT_TEXTLIST = "text:list";

  public static final String ODF_ELEMENT_TEXTSPAN = "text:span";

  public static final String ODF_ELEMENT_TEXTLIST_HEADER = "text:list-header";

  public static final String ODF_ELEMENT_TEXTLIST_ITEM = "text:list-item";

  public static final String ODF_ELEMENT_DRAWPAGE = "draw:page";

  public static final String ODF_ELEMENT_DRAWPAGE_THUMBNAIL = "draw:page-thumbnail";

  public static final String ODF_ELEMENT_DRAWFRAME = "draw:frame";

  public static final String ODF_ELEMENT_DRAWIMAGE = "draw:image";

  public static final String ODF_ELEMENT_DRAW_TEXTBOX = "draw:text-box";

  public static final String ODF_ELEMENT_DRAWLINE = "draw:line";

  public static final String ODF_ELEMENT_DRAWRECT = "draw:rect";

  public static final String ODF_ELEMENT_DRAWCIRCLE = "draw:circle";

  public static final String ODF_ELEMENT_DRAWELLIPSE = "draw:ellipse";

  public static final String ODF_ELEMENT_DRAWCUSTOMSHAPE = "draw:custom-shape";

  public static final String ODF_ELEMENT_DRAWCONNECTOR = "draw:connector";

  public static final String ODF_ELEMENT_DRAWPOLYLINE = "draw:polyline";

  public static final String ODF_ELEMENT_DRAWPATH = "draw:path";

  public static final String ODF_ELEMENT_DRAWPOLYGON = "draw:polygon";

  public static final String ODF_ELEMENT_DRAWREGULARPOLYGON = "draw:regular-polygon";

  public static final String ODF_ELEMENT_DRAWMEASURE = "draw:measure";

  public static final String ODF_ELEMENT_DRAWG = "draw:g";

  public static final String ODF_ELEMENT_DRAWENHANCEDGEOMETRY = "draw:enhanced-geometry";

  public static final String ODF_ELEMENT_DRAWGLUEPOINT = "draw:glue-point";

  public static final String ODF_ELEMENT_DRAWEQUATION = "draw:equation";

  public static final String ODF_ELEMENT_DRAWHANDLE = "draw:handle";

  public static final String ODF_ELEMENT_SVGTITLE = "svg:title";

  public static final String ODF_ELEMENT_SVGDESC = "svg:desc";

  public static final String ODF_ELEMENT_OFFICEFORMS = "office:forms";

  public static final String ODF_ELEMENT_OFFICEEVENTLISTENERS = "office:event-listeners";

  public static final String ODF_ELEMENT_DRAWCONTROL = "draw:control";

  public static final String ODF_ELEMENT_DRAWCAPTION = "draw:caption";

  public static final String ODF_ELEMENT_ANIMPAR = "anim:par";

  public static final String ODF_ELEMENT_DRAWOBJECT = "draw:object";

  public static final String ODF_ELEMENT_DRAWOBJECTOLE = "draw:object-ole";

  public static final String ODF_ELEMENT_DR3DSCENE = "dr3d:scene";

  public static final String ODF_ELEMENT_PRESENTATIONNOTES = "presentation:notes";

  public static final String ODF_ELEMENT_DRAW_PAGETHUMBNAIL = "draw:page-thumbnail";

  public static final String ODF_ELEMENT_HEADER_DECL = "presentation:header-decl";

  public static final String ODF_ELEMENT_PRESENTATION_NAME = "presentation:name";

  public static final String ODF_ELEMENT_TEXT_A = "text:a";

  public static final String ODF_ELEMENT_TEXT_PARAGRAPH = "text:p";

  public static final String ODF_ELEMENT_TEXT_LINE_BREAK = "text:line-break";

  public static final String ODF_ELEMENT_TEXTDATE = "text:date";

  public static final String ODF_ELEMENT_DATE = "date";

  public static final String ODF_ELEMENT_FIELD = "field";

  public static final String ODF_ELEMENT_TEXTTIME = "text:time";

  public static final String ODF_ELEMENT_TIME = "time";

  public static final String ODF_ELEMENT_AUTHOR = "author";

  public static final String ODF_ELEMENT_FILENAME = "filename";

  public static final String ODF_ELEMENT_TEXTPAGENUMBER = "text:page-number";

  public static final String ODF_ELEMENT_DRAWPAGENUMBER = "draw:page-number";

  public static final String ODF_ELEMENT_PAGENUMBER = "page-number";

  public static final String ODF_TABLESTYLES = "tablestyles";

  public static final String ODF_ELEMENT_TABLECONVEREDTABLE_CELL = "table:covered-table-cell";

  public static final String ODF_ELEMENT_DRAW_IMG = "draw:image";

  public static final String ODF_STYLE_MASTER_PAGE = "style:master-page";

  public static final String ODF_STYLE_PAGE_LAYOUT = "style:page-layout";

  public static final String ODF_STYLE_PAGE_LAYOUT_NAME = "style:page-layout-name";

  public static final String ODF_ATTR_DRAW_MASTER_PAGE_NAME = "draw:master-page-name";

  public static final String ODF_ATTR_DR3D = "dr3d";

  public static final String ODF_ATTR_DRAW_EXTRUSION = "draw:extrusion";

  public static final String ODF_ATTR_DRAW_POINTS = "draw:points";

  public static final String ODF_ATTR_DRAWENHANCEDPATH = "draw:enhanced-path";

  public static final String ODF_ATTR_DRAWGLUEPOINTS = "draw:glue-points";

  public static final String ODF_ATTR_DRAWMODIFIERS = "draw:modifiers";

  public static final String ODF_ATTR_DRAWHANDLEPOSITION = "draw:handle-position";

  public static final String ODF_ATTR_DRAWHANDLERANGEXMINIMUM = "draw:handle-range-x-minimum";

  public static final String ODF_ATTR_DRAWHANDLERANGEXMAXIMUM = "draw:handle-range-x-maximum";

  public static final String ODF_ATTR_DRAWHANDLERANGEYMINIMUM = "draw:handle-range-y-minimum";

  public static final String ODF_ATTR_DRAWHANDLERANGEYMAXIMUM = "draw:handle-range-y-maximum";

  public static final String ODF_ATTR_DRAWPATHSTRETCHPOINTX = "draw:path-stretchpoint-x";

  public static final String ODF_ATTR_DRAWPATHSTRETCHPOINTY = "draw:path-stretchpoint-y";

  public static final String ODF_ATTR_DRAWHANDLESWITCHED = "draw:handle-switched";

  public static final String ODF_ATTR_DRAWDISPLAYNAME = "draw:display-name";

  public static final String ODF_ATTR_DRAWSTYLE = "draw:style";

  public static final String ODF_ATTR_DRAWDOTS1 = "draw:dots1";

  public static final String ODF_ATTR_DRAWDOTS1LENGTH = "draw:dots1-length";

  public static final String ODF_ATTR_DRAWDISTANCE = "draw:distance";

  public static final String ODF_ATTR_STYLE_NAME = "style:name";

  public static final String ODF_ATTR_TEXT_STYLE_NAME = "text:style-name";

  public static final String ODF_ATTR_STYLE_TEXT_PROPERTIES = "style:text-properties";
  
  public static final String ODF_ATTR_STYLE_TABLE_PROPERTIES = "style:table-properties";

  public static final String ODF_ATTR_STYLE_BORDER_LINE_WIDTH = "style:border-line-width";

  public static final String ODF_ATTR_STYLE_BORDER_LINE_WIDTH_LEFT = "style:border-line-width-left";

  public static final String ODF_ATTR_STYLE_BORDER_LINE_WIDTH_RIGHT = "style:border-line-width-right";

  public static final String ODF_ATTR_STYLE_BORDER_LINE_WIDTH_TOP = "style:border-line-width-top";

  public static final String ODF_ATTR_STYLE_BORDER_LINE_WIDTH_BOTTOM = "style:border-line-width-bottom";

  public static final String ODF_ATTR_STYLE_STYLE = "style:style";
  
  public static final String ODF_ATTR_STYLE_DISPLAY = "display";
  
  public static final String ODF_ATTR_STYLE_DISPLAY_BLOCK = "block";

  public static final String ODF_ATTR_STYLE_FAMILY = "style:family";

  public static final String ODF_ATTR_STYLE_TEXT_POSITION = "style:text-position";

  public static final String ODF_ATTR_STYLE_TEXT_UNDERLINE_STYLE = "style:text-underline-style";

  public static final String ODF_ATTR_STYLE_TEXT_OVERLINE_STYLE = "style:text-overline-style";

  public static final String ODF_ATTR_STYLE_TEXT_STRIKETHROUGH_STYLE = "style:text-line-through-style";

  public static final String ODF_ATTR_PARENT_STYLE_NAME = "style:parent-style-name";

  public static final String ODF_ATTR_DATE_STYLE_NAME = "style:data-style-name";

  public static final String ODF_ATTR_FONT_SIZE = "fo:font-size";

  public static final String ODF_ATTR_COLOR = "fo:color";

  public static final String ODF_ATTR_LINE_HEIGHT = "fo:line-height";

  public static final String ODF_ATTR_FONT_FAMILY = "fo:font-family";

  public static final String ODF_ATTR_LANGUAGE = "fo:language";

  public static final String ODF_ATTR_COUNTRY = "fo:country";

  public static final String ODF_ATTR_COUNTRY_ASIAN = "style:country-asian";

  public static final String ODF_ATTR_LANGUAGE_ASIAN = "style:language-asian";

  public static final String ODF_ATTR_DRAW_LAYER = "draw:layer";

  public static final String ODF_ATTR_DRAW_STYLE_NAME = "draw:style-name";

  public static final String ODF_ATTR_TEXT_ANCHOR_TYPE = "text:anchor-type";

  public static final String ODF_ATTR_DRAW_TEXT_STYLE_NAME = "draw:text-style-name";

  public static final String ODF_ATTR_DRAW_TRANSFORM = "draw:transform";

  public static final String ODF_ATTR_XLINK_HREF = "xlink:href";

  public static final String ODF_ATTR_TABLE_NUM_COL_SPANNED = "table:number-columns-spanned";

  public static final String ODF_ATTR_TABLE_STYLE_NAME = "table:style-name";

  public static final String ODF_ATTR_SVG_VIEWBOX = "viewBox";

  public static final String ODF_ATTR_DRAW_NAME = "draw:name";

  public static final String ODF_ATTR_DRAW_TYPE = "draw:type";

  public static final String ODF_ATTR_SMIL_TYPE = "smil:type";

  public static final String ODF_ATTR_SMIL_SUBTYPE = "smil:subtype";

  public static final String ODF_ATTR_SMIL_DIRECTION = "smil:direction";

  public static final String ODF_ATTR_SMIL_FADECOLOR = "smil:fadeColor";

  public static final String ODF_ATTR_TRANSITION_SPEED = "presentation:transition-speed";

  public static final String ODF_ATTR_USE_HEADER_NAME = "presentation:use-header-name";

  public static final String ODF_ATTR_USE_FOOTER_NAME = "presentation:use-footer-name";

  public static final String ODF_ATTR_USE_DATE_TIME_NAME = "presentation:use-date-time-name";

  public static final String ODF_ATTR_PRESENTATION_CLASS = "presentation:class";

  public static final String ODF_ATTR_PRESENTATION_PLACEHOLDER = "presentation:placeholder";

  public static final String ODF_ATTR_PRESENTATION_DISPLAY_DATE_TIME = "presentation:display-date-time";

  public static final String ODF_ATTR_PRESENTATION_DISPLAY_FOOTER = "presentation:display-footer";

  public static final String ODF_ATTR_PRESENTATION_FOOTER = "presentation:footer";

  public static final String ODF_ATTR_PRESENTATION_DATETIME = "presentation:date-time";

  public static final String ODF_ATTR_PRESENTATION_PAGENUMBER = "text:page-number";

  public static final String ODF_ATTR_PRESENTATION_DISPLAY_HEADER = "presentation:display-header";

  public static final String ODF_ATTR_PRESENTATION_DISPLAY_PAGE_NUMBER = "presentation:display-page-number";

  public final static String ODF_ATTR_PRESENTATION_PAGE_LAYOUT_NAME = "presentation:presentation-page-layout-name";

  public final static String ODF_ATTR_TRANSITION_DURATION = "presentation:duration";

  public static final String ODF_ATTR_PRE_STYLE_NAME = "presentation:style-name";

  public static final String ODF_ATTR_GENERAL_STYLE_NAME = ":style-name";

  public static final String ODF_ATTR_FOOTER_FIELD_FOOTER = "footer";

  public static final String ODF_ATTR_FOOTER_FIELD_DATETIME = "date-time";

  public static final String ODF_ATTR_FOOTER_FIELD_PAGENUMBER = "page-number";

  public static final String ODF_STYLE_DEFAULT = "style:default-style";

  public static final String ODF_STYLE_DEFAULT_NAME = "default-style";

  public static final String ODF_STYLE_GRAPHIC_PROP = "style:graphic-properties";

  public static final String ODF_STYLE_TEXT_LIST = "text:list-style";

  public static final String ODF_STYLE_TEXT_STYLE_NAME = "text:style-name";

  public final static String ODF_STYLE_NUM_FORMAT = "style:num-format";

  public final static String ODF_STYLE_DRAWING_PAGE_PROP = "style:drawing-page-properties";

  public final static String ODF_STYLE_PRES_PAGE_LAYOUT = "style:presentation-page-layout";

  public final static String ODF_STYLE_GRAPHIC_REPEAT = "style:repeat";

  public final static String ODF_STYLE_TEXTLIST_BULLET_STYLE = "text:list-level-style-bullet";

  public final static String ODF_STYLE_TEXTLIST_IMAGE_STYLE = "text:list-level-style-image";

  public final static String ODF_STYLE_TEXTLIST_NUMBER_STYLE = "text:list-level-style-number";

  public static final String ODF_STYLE_ROW_HEIGHT = "style:row-height";

  public static final String ODF_STYLE_COLUMN_WIDTH = "style:column-width";

  public static final String ODF_STYLE_OBJECT_GROUPING = "draw:g";

  public static final String ODF_STYLE_FAMILY_DRAWING_PAGE = "drawing-page";

  public static final String ODF_STYLE_PARAGRAPH_PROPERTIES = "style:paragraph-properties";

  public static final String ODF_ATTR_VISIBILTY = "presentation:visibility";
  
  public static final String ODF_ATTR_BACKGROUND_OBJECTS_VISIBLE = "presentation:background-objects-visible";

  public final static String ODF_ATTR_TEXT_FIELD_DATE = "text:date-value";

  public final static String ODF_ATTR_TEXT_FIELD_TIME = "text:time-value";

  public static final String ODF_STYLE_DEFAULT_CELL_STYLE_NAME = "table:default-cell-style-name";

  public static final String ODF_STYLE_TABLE_TEMPLATE = "table:table-template";

  public static final String ODF_ATTR_DRAWTEXTAREAS = "draw:text-areas";

  public static final String ODF_ATTR_DRAWTEXTAREAHORIZONTALALIGN = "draw:textarea-horizontal-align";

  public static final String ODF_ATTR_DRAW_TEXTAREA_VERTICAL_ALIGN = "draw:textarea-vertical-align";

  public static final String ODF_ATTR_DRAW_AUTO_GROW_HEIGHT = "draw:auto-grow-height";

  public static final String ODF_ATTR_DRAWTRANSFORM = "draw:transform";

  public static final String ODF_ATTR_DRAW_OPACITY = "draw:opacity";

  public static final String ODF_ATTR_DRAW_FILL_GRADIENT_NAME = "draw:fill-gradient-name";

  public static final String ODF_ATTR_DRAW_FILL = "draw:fill";

  public static final String ODF_ATTR_DRAW_START_COLOR = "draw:start-color";

  public static final String ODF_ATTR_DRAW_FILL_COLOR = "draw:fill-color";

  public static final String ODF_ATTR_DRAW_FILL_IMAGE_NAME = "draw:fill-image-name";

  public static final String ODF_ATTR_DRAW_FILL_IMAGE_REFX = "draw:fill-image-ref-point-x";

  public static final String ODF_ATTR_DRAW_FILL_IMAGE_REFY = "draw:fill-image-ref-point-y";

  public static final String ODF_ATTR_DRAW_TILE_REPEAT_OFFSET = "draw:tile-repeat-offset";

  public static final String ODF_ATTR_DRAW_STROKE = "draw:stroke";

  public static final String ODF_ATTR_DRAW_STROKE_DASH = "draw:stroke-dash";

  public static final String ODF_ATTR_VALUE_DASH = "dash";

  public static final String ODF_ATTR_VALUE_CALLOUT = "callout";

  public static final String ODF_ATTR_SVG_STROKE_WIDTH = "svg:stroke-width";

  public static final String ODF_ATTR_SVG_STROKE_COLOR = "svg:stroke-color";

  public static final String ODF_ATTR_DRAWMARKEREND = "draw:marker-end";

  public static final String ODF_ATTR_DRAWMARKERSTART = "draw:marker-start";

  public static final String ODF_ATTR_DRAWMARKERENDWIDTH = "draw:marker-end-width";

  public static final String ODF_ATTR_DRAWMARKERSTARTWIDTH = "draw:marker-start-width";

  public static final String ODF_ATTR_DRAW_FORMULA = "draw:formula";

  public static final String ODF_ATTR_MIRROR_H = "mirror-horizontal";

  public static final String ODF_ATTR_MIRROR_V = "mirror-vertical";

  public static final String ODF_ATTR_HORIZONTAL = "horizontal";

  public static final String ODF_ATTR_VERTICAL = "vertical";

  public static final String ODF_ATTR_IMAGE = "image";

  public static final String ODF_ATTR_LIST_LEVEL_STYLE_IMAGE = "list-level-style-image";

  public static final String ODF_ATTR_SVG_X = "svg:x";

  public static final String ODF_ATTR_SVG_Y = "svg:y";

  public static final String ODF_ATTR_SVG_X1 = "svg:x1";

  public static final String ODF_ATTR_SVG_Y1 = "svg:y1";

  public static final String ODF_ATTR_SVG_X2 = "svg:x2";

  public static final String ODF_ATTR_SVG_Y2 = "svg:y2";

  public static final String ODF_ATTR_SVG_D = "svg:d";

  public static final String ODF_ATTR_SVG_WIDTH = "svg:width";

  public static final String ODF_ATTR_SVG_HEIGHT = "svg:height";

  public static final String ODF_SVG_ATTR_SVGVIEWBOX = "svg:viewBox";

  public static final String ODF_ATTR_FO_CLIP = "fo:clip";

  public static final String ODF_ATTR_FO_PADDING_RIGHT = "fo:padding-right";

  public static final String ODF_ATTR_FO_PADDING_LEFT = "fo:padding-left";

  public static final String ODF_ATTR_FO_PADDING_TOP = "fo:padding-top";

  public static final String ODF_ATTR_FO_PADDING_BOTTOM = "fo:padding-bottom";

  public static final String ODF_ATTR_FO_PADDING = "fo:padding";

  public static final String ODF_ATTR_FO_BORDER_BOTTOM = "fo:border-bottom";

  public static final String ODF_ATTR_FO_BORDER_TOP = "fo:border-top";

  public static final String ODF_ATTR_FO_BORDER_RIGHT = "fo:border-right";

  public static final String ODF_ATTR_FO_BORDER_LEFT = "fo:border-left";

  public static final String ODF_ATTR_FO_BORDER = "fo:border";

  public static final String ODF_ATTR_FO_MARGIN_BOTTOM = "fo:margin-bottom";

  public static final String ODF_ATTR_FO_MARGIN_TOP = "fo:margin-top";

  public static final String ODF_ATTR_FO_MARGIN_LEFT = "fo:margin-left";

  public static final String ODF_ATTR_FO_MARGIN_RIGHT = "fo:margin-right";

  public static final String ODF_ATTR_FO_MARGIN = "fo:margin";

  public static final String ODF_ATTR_FO_TEXT_INDENT = "fo:text-indent";

  public static final String ODF_ATTR_FO_TEXT_SHADOW = "fo:text-shadow";

  public static final String ODF_ATTR_FO_TEXT_ALIGN = "fo:text-align";

  public static final String ODF_ATTR_FO_COLOR = "fo:color";

  public static final String ODF_ATTR_FO_FONT_STYLE = "fo:font-style";

  public static final String ODF_ATTR_FO_WIDTH = "fo:width";

  public static final String ODF_ATTR_FO_HEIGHT = "fo:height";

  public static final String ODF_ATTR_FO_WRAP_OPTION = "fo:wrap-option";

  public final static String ODF_ATTR_XMLID = "xml:id";

  public final static String ODF_ATTR_DRAWID = "draw:id";

  public final static String ODF_ATTR_TEXTID = "text:id";

  public final static String ODF_ATTR_TABLEID = "table:id";

  public static final String ODF_ATTR_TEXT_BULLET_CHAR = "text:bullet-char";

  public final static String ODF_ATTR_STYLE_NUM_PREFIX = "style:num-prefix";

  public final static String ODF_ATTR_STYLE_NUM_SUFFIX = "style:num-suffix";

  public final static String ODF_ATTR_STYLE_NUM_FORMAT = "style:num-format";

  public static final String ODF_ATTR_TEXT_LEVEL = "text:level";
  
  public static final String ODF_ATTR_TEXT_SPACE_BEFORE = "text:space-before";

  public static final String ODF_ATTR_TEXT_START_VALUE = "text:start-value";

  public static final String ODF_ATTR_CLASS = "class";

  public static final String ODF_ATTR_DRAW_PAGE = "draw_page";

  public static final String ODF_ATTR_STYLE_MIRROR = "style:mirror";
  
  public static final String ODF_ATTR_STYLE_DISPLAY_NAME = "style:display-name";

  // =====================================================================
  // HTML related
  // =====================================================================
  public static final String HTML_TITLE = "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" "
      + "\"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n";

  public static final String HTML_ELEMENT_HEAD = "head";

  public static final String HTML_ELEMENT_BODY = "body";

  public static final String HTML_ELEMENT_LINK = "link";

  public static final String HTML_STYLE_TAG = "style";

  public static final String HTML_VALUES_TAG = "values";

  public static final String HTML_VISIBILITY_TAG = "visibility";

  public static final String HTML_SCRIPT_TAG = "script";

  public static final String HTML_ATTR_STYLE = "style";
  
  public static final String HTML_ATTR_CUSTOM_STYLE = "customstyle";

  public static final String HTML_ATTR_LEVEL = "level";
  
  public static final String HTML_ATTR_OLD_LEVEL = "_oldlevel";
  
  public static final String HTML_ATTR_OLD_STYLE_NAME = "_oldstylename";
  
  public static final String HTML_ATTR_ROLE = "role";
  
  public static final String HTML_ATTR_ARIA_LEVEL = "aria-level";

  public static final String HTML_ATTR_STYLE_TEMPLATE = "styletemplate";

  public static final String HTML_ATTR_CLASS = "class";

  public static final String HTML_ATTR_HREF = "href";

  public static final String HTML_ATTR_TYPE = "type";

  public static final String HTML_ATTR_REL = "rel";

  public static final String HTML_ATTR_FIELD = "field";

  public static final String HTML_ATTR_SRC = "src";

  public static final String HTML_ATTR_JUSTIFY = "justify";

  public static final String HTML_ATTR_CENTER = "center";

  public static final String HTML_ATTR_PRESERVE_ONLY = "preserveonly";

  public static final String HTML_ATTR_DEFAULT_LINE_HEIGHT = "defaultLineHeightSet";

  public static final String HTML_ATTR_SPACE_PLACEHOLDER = "spacePlaceholder";
  
  public static final String HTML_ATTR_TAB_PLACEHOLDER = "tabPlaceholder";

  public static final String HTML_ATTR_POSITION = "position";

  public static final String HTML_ATTR_COLSPAN = "colspan";

  public static final String HTML_ATTR_ZINDEX = "z-index";

  public static final String HTML_ATTR_DRAW_TEXT_STYLE_NAME = "draw_text-style-name";

  public static final String HTML_ATTR_DRAW_NAME = "draw_name";

  public static final String HTML_ATTR_DRAW_TYPE = "draw_type";

  public static final String HTML_ATTR_DRAW_TRANSFORM = "draw_transform";

  public static final String HTML_ATTR_DRAW_POINTS = "draw_points";

  public static final String HTML_SVG_ATTR_SVGVIEWBOX = "svg_viewBox";

  public static final String HTML_ATTR_PRESERVE_FOR_COPY = "preserveforcopy";

  public static final String HTML_ATTR_ALT = "alt";

  public static final String HTML_ATTR_NUMBERTYPE = "numberType";

  public static final String HTML_ATTR_VALUES = "values";

  public static final String HTML_ATTR_STARTNUMBER = "startNumber";

  public static final String HTML_ELEMENT_DIV = "div";

  public static final String HTML_ELEMENT_COLGROUP = "colgroup";

  public static final String HTML_ELEMENT_TBODY = "tbody";

  public static final String HTML_ELEMENT_P = "p";

  public static final String HTML_ELEMENT_BR = "br";

  public static final String HTML_ELEMENT_LI = "li";

  public static final String HTML_ELEMENT_UL = "ul";

  public static final String HTML_ELEMENT_OL = "ol";

  public static final String HTML_ELEMENT_TD = "td";

  public static final String HTML_ELEMENT_TR = "tr";

  public static final String HTML_ELEMENT_IMG = "img";

  public static final String HTML_ELEMENT_SPAN = "span";

  public static final String HTML_ELEMENT_TEXTA = "a";

  public static final String HTML_ELEMENT_STYLE_GR = "gr";

  public static final String HTML_ELEMENT_STYLE_PR = "pr";

  public static final String HTML_ELEMENT_STYLE_P = "P";

  public static final String HTML_CLASS_TEXT_P = "text_p";

  public static final String HTML_CLASS_TEXT_LIST = "text_list";

  public static final String HTML_CLASS_CONCORDLIST_PRESERVE = "concordList_Preserve";

  public static final String HTML_CLASS_TEXT_LIST_ITEM = "text_list-item";

  public static final String HTML_CLASS_TEXTLIST_HEADER = "text_list-header";

  public static final String HTML_CLASS_DRAW_PAGE = "draw_page";

  public static final String HTML_CLASS_DRAW_IMAGE = "draw_image";

  public static final String HTML_CLASS_IMPORTED_IMAGE = "importedImage";

  public static final String HTML_CLASS_PLACEHOLDER = "placeholder";

  public static final String HTML_CLASS_DRAW_SHAPE_CLASSES = "draw_shape_classes";

  public static final String HTML_CLASS_DRAW_CHART_CLASSES = "draw_chart_classes";

  public static final String HTML_CLASS_DRAW_CUSTOM_SHAPE = "draw_custom-shape";

  public static final String HTML_CLASS_DRAW_CHART = "draw_chart";

  public static final String HTML_CLASS_DRAW_OBJECT = "draw_object";

  public static final String HTML_CLASS_DRAW_STYLE_NAME = "draw_style-name";

  public static final String HTML_ATTR_PAGE_TEMPLATE_NAME = "page_template_name";

  public static final String HTML_ATTR_PAGE_NUMBER_FIELD = "page-number";

  public static final String HTML_ATTR_DATE_FIELD_TYPE = "date";

  public static final String HTML_ATTR_TIME_FIELD_TYPE = "time";

  public static final String HTML_ATTR_DRAW_MASTER_PAGE_NAME = "draw_master-page-name";

  public static final String HTML_ATTR_TABLE_DEFAULT_CELL_STYLE_NAME = "table_default-cell-style-name";

  public static final String HTML_ATTR_TABLE_BACKGROUND_COLOR = "table_background_color";

  public static final String HTML_ATTR_TABLE_ALT_COLOR = "table_alt_color";

  public static final String HTML_ATTR_CONTEXTBOXTYPE = "contentBoxType";

  public static final String HTML_ATTR_CUSTOMSTYLE = "customstyle";
  
  public static final String HTML_ATTR_MARGIN_TOP = "margin-top";

  public static final String HTML_ATTR_MARGIN_BOTTOM = "margin-bottom";
  
  public static final String HTML_ATTR_ODF_MARGIN_LEFT = "odf-margin-left";
  
  public static final String HTML_ATTR_ABS_ODF_MARGIN_LEFT = "abs-odf-margin-left";

  public static final String HTML_ATTR_MARGIN_LEFT = "margin-left";

  public static final String HTML_ATTR_ABS = "abs-";

  public static final String HTML_ATTR_ABS_MARGIN_LEFT = "abs-margin-left";
  
  public static final String HTML_ATTR_ABS_LIST_MARGIN_LEFT = "abs-list-margin-left";
  
  public static final String HTML_ATTR_LIST_MARGIN_LEFT = "list-margin-left";
  
  public static final String HTML_ATTR_ABS_TEXT_INDENT = "abs-text-indent";

  public static final String HTML_ATTR_MARGIN_RIGHT = "margin-right";
  
  public static final String HTML_ATTR_ABS_MARGIN_RIGHT = "abs-margin-right";
  
  public static final String HTML_ATTR_ABS_MIN_LABEL_WIDTH = "abs-min-label-width";

  public static final String HTML_ATTR_PADDING_LEFT = "padding-left";

  public static final String HTML_ATTR_PADDING_RIGHT = "padding-right";

  public static final String HTML_ATTR_PADDING_TOP = "padding-top";

  public static final String HTML_ATTR_PADDING_BOTTOM = "padding-bottom";

  public static final String HTML_ATTR_MARGIN = "margin";

  public static final String HTML_ATTR_PADDING = "padding";

  public static final String HTML_ATTR_PRESENTATION_CLASS = "presentation_class";
  
  public static final String HTML_ATTR_PRESERVE_PRES_CLASS = "preserve_pres_class";

  public static final String HTML_ATTR_PRESENTATIONNOTES = "presentation_notes";

  public static final String HTML_ATTR_PRES_PLACEHOLDER = "presentation_placeholder";

  public static final String HTML_ATTR_CHART_DATA = "chart_data";

  public static final String HTML_ATTR_UNGROUPABLE = "ungroupable";

  public static final String HTML_ATTR_DRAW_LAYER = "draw_layer";

  public static final String HTML_ATTR_DRAW_STYLE_NAME = "draw_style-name";

  public static final String HTML_ATTR_TEXT_STYLE_NAME = "draw_text-name";

  public static final String HTML_ATTR_SVG_X = "svg_x";

  public static final String HTML_ATTR_SVG_X1 = "svg_x1";

  public static final String HTML_ATTR_SVG_X2 = "svg_x2";

  public static final String HTML_ATTR_SVG_Y = "svg_y";

  public static final String HTML_ATTR_SVG_Y1 = "svg_y1";

  public static final String HTML_ATTR_SVG_Y2 = "svg_y2";

  public static final String HTML_ATTR_SVG_D = "svg_d";

  public static final String HTML_ATTR_SVG_HEIGHT = "svg_height";

  public static final String HTML_ATTR_SVG_WIDTH = "svg_width";

  public static final String HTML_ATTR_TEXT_ANCHOR_TYPE = "text_anchor-type";

  public static final String HTML_ATTR_CELLSPACING = "cellspacing";

  public static final String HTML_ATTR_TABLE_CELL = "table_table-cell";

  public static final String HTML_ATTR_TABLE_ROW = "table_table-row";

  public static final String HTML_ATTR_HIDE_SLIDE = "hideInSlideShow";

  public static final String HTML_ATTR_PRESERVE_GR_STYLE = "preserveclassgrstyle=";

  public static final String HTML_ATTR_PRESERVE_P_STYLE = "preserveclassPstyle=";

  public static final String HTML_ATTR_PAGE_WIDTH = "pagewidth";

  public static final String HTML_ATTR_PAGE_HEIGHT = "pageheight";

  public static final String HTML_ATTR_PAGE_ORIENTATION = "orientation";

  public static final String HTML_ATTR_PAGE_UNITS = "pageunits";

  /**
   * Custom attribute created inside an html element to store a copy of the automatic color calculated for the font color. On export, this
   * is used to see if any changes to the color were made - if not, the color information is stripped from the style info.
   */
  public static final String HTML_ATTR_AUTO_COLOR = "automatic_color";

  /**
   * Attribute to specify the text color defined in a cell style. This can be used on an element so the color attribute (when present) is
   * recognized as the color defined in the cell style and not the element's style.
   */
  public static final String HTML_ATTR_CELL_COLOR = "cell-text-color";

  /**
   * Attribute to specify an automatic color that originated from the cell. This will cause an automatic_color to be used within the cell
   * <p>
   * so that on export the color can be removed from the p. This attribute only used in stackable properties object.
   */
  public static final String HTML_ATTR_CELL_AUTO_COLOR = "cell-auto-color";

  /**
   * Attribute used to track the pseudo background color in the style. This background color is derived from the real style information but
   * is only used because the real background fill is not supported ex. gradient.
   */
  public static final String HTML_ATTR_PSEUDO_BG_COLOR = "pseudo_bg_color";

  /**
   * Used to mark an element as a removal candidate during export.
   */
  public static final String HTML_ATTR_REMOVAL_CANDIDATE = "removal-candidate";

  public static final String HTML_VALUE_DRAWING = "drawing";

  public static final String HTML_VALUE_CHART = "chart";

  public static final String HTML_VALUE_GROUP = "group";

  public static final String HTML_VALUE_YES = "yes";

  public static final String HTML_VALUE_TRUE = "true";

  public static final String HTML_VALUE_FALSE = "false";

  public static final String HTML_VALUE_SUB = "sub";

  public static final String HTML_VALUE_SUPER = "super";

  public static final String HTML_VALUE_G_DRAW_FRAME = "g_draw_frame";

  public static final String HTML_VALUE_DRAW_FRAME = "draw_frame";

  public static final String HTML_VALUE_SVG_SHAPE = "svg_shape";

  public static final String HTML_VALUE_BACKGROUND_IMAGE = "backgroundImage";

  public static final String HTML_VALUE_IMPORTED_SHAPE = "importedShape";

  public static final String HTML_VALUE_IMPORTED_IMAGE = "importedImage";

  public static final String HTML_VALUE_IMAGE_DRAW_FRAME = "image_draw_frame";

  public static final String HTML_VALUE_DRAW_FRAME_CLASSES = "draw_frame_classes";

  public static final String HTML_VALUE_DRAW_TEXT_BOX = "draw_text-box";

  public static final String HTML_VALUE_LAYOUT = "layout";

  public static final String HTML_VALUE_BACKGROUND = "backgroundobjects";

  public static final String HTML_VALUE_PAGE_NUMBER = "page-number";

  public static final String HTML_VALUE_HEADER = "header";

  public static final String HTML_VALUE_NOTES = "notes";

  public static final String HTML_VALUE_OUTLINE = "outline";

  public static final String HTML_VALUE_PARAGRAPH = "paragraph";

  public static final String HTML_VALUE_GRAPHIC = "graphic";

  public static final String HTML_VALUE_NONE = "none";

  public static final String HTML_VALUE_SLIDEWRAPPER = "slideWrapper";

  public static final String HTML_VALUE_CONTENT_BOX_DATA_NODE = "contentBoxDataNode";

  public static final String HTML_VALUE_FULL_SIZE = "height:100%;width:100%;";

  public static final String HTML_VALUE_DIV2_BG_STYLE = "position:relative;left:0%;top:0%;height:100%;width:100%;";

  public static final String HTML_VALUE_DIV2_STYLE = HTML_VALUE_DIV2_BG_STYLE;

  public static final String HTML_VALUE_DIV3_STYLE = "position:absolute;left:0%;top:0%;width:100%;height:100%;";

  public static final String HTML_VALUE_DIV4_STYLE = "position:absolute;top:0%;left:0%;width:100%;height:100%;";

  public static final String HTML_VALUE_DIV5_BG_STYLE = "position:relative;top:0%;left:0%;width:100%;height:100%;";

  public static final String HTML_VALUE_DIV5_STYLE = HTML_VALUE_DIV5_BG_STYLE;

  public static final String HTML_VALUE_DIV1_PN_STYLE = "position:absolute;top:100%;left:0%;width:100%;height:5%;";

  public static final String HTML_VALUE_TABLE_DIV_STYLE = "display:table; height:100%; width:100%; table-layout:fixed;";

  public static final String HTML_VALUE_CELL_DIV_STYLE_BASE = "display:table-cell;margin-top:0;margin-bottom:0;";

  public static final String HTML_VALUE_CELL_DIV_STYLE = HTML_VALUE_CELL_DIV_STYLE_BASE + HTML_VALUE_FULL_SIZE;

  public static final String HTML_VALUE_CELL_DIV_STYLE_OVERRIDES = "background-color:transparent;border:none;";

  public static final String HTML_STYLE_REL_POSITION = "position:relative;";

  public static final String HTML_STYLE_ABS_POSITION = "position:absolute;";

  public static final String HTML_VALUE_DEFAULT_SHAPEBOX = "position:absolute;top:2%;left:2%;width:96%;height:96%;";

  public static final String HTML_VALUE_DEFAULT_IMAGEBOX = "position:relative;top:2%;left:2%;width:96%;height:96%;";

  public static final String HTML_VALUE_DISPLAY_NONE = "display:none;";

  public static final String HTML_B64_SRC_PREFIX = "data:image/png;base64,";

  // =====================================================================
  // CSS related
  // =====================================================================

  public static final String CSS_CONCORD_SPECIFICITY_INCREASE_CLASS = ".concord";

  public static final String CSS_DEFAULT_CONTENT_TEXT = "defaultContentText";

  public static final String CSS_DEFAULT_CONTENT_IMAGE = "defaultContentImage";

  public static final String CSS_CONTENT_BOX_TITLE_CLASS = "cb_title";

  public static final String CSS_CONTENT_BOX_SUBTITLE_CLASS = "cb_subtitle";

  public static final String CSS_CONTENT_BOX_OUTLINE_CLASS = "cb_outline";

  public static final String CSS_BEFORE = ":before";

  public static final String CSS_CONTENT = "content";

  public static final String CSS_DECIMAL = "decimal";

  public static final String CSS_LIST_STYLE_PREFIX = "I-lst-";
  
  public static final String CSS_LIST_STYLE_PREFIX_NEW = "IL_";
  
  public static final String CSS_LIST_STYLE_PREFIX_NEW_MASTER = "ML_";

  public static final String CSS_PARA_STYLE_PREFIX_NEW_MASTER = "MP_";

  public static final String CSS_LIST_FORMAT_NAME = "listformat";

  public static final String CSS_LIST_COUNTER_NAME = "cnvcounter";

  public static final String CSS_CONCORD_LIST_STYLE_PREFIX = "lst-";

  public static final String CSS_LIST_STYLE_PREFIX_PADDING_RIGHT = "I-lst-PR-";

  public static final String CSS_LIST_STYLE_TYPE = "list-style-type";

  public static final String CSS_LIST_STYLE = "list-style";

  public static final String CSS_LIST_STYLE_IMG = "list-style-image";

  public static final String CSS_LIST_STYLE_POSITION = "list-style-position";

  public static final String CSS_BACKGROUND_IMAGE = "background-image";

  public static final String CSS_BACKGROUND_REPEAT = "background-repeat";

  public static final String CSS_BACKGROUND_POSITION = "background-position";

  public static final String CSS_BACKGROUND_SIZE = "background-size";
  
  public static final String CSS_INLINE_BLOCK = "inline-block";
  
  public static final String CSS_INLINE = "inline";

  public static final String CSS_BACKGROUND_ATTACHMENT = "background-attachment";

  public static final String CSS_BACKGROUND = "background";

  public static final String CSS_DISPLAY = "display";

  public static final String MOZ_BACKGROUND_SIZE = "-moz-background-size"; // for FF 3.x

  public static final String CSS_MIN_HEIGHT = "min-height";

  public static final String CSS_ATTR = "attr";

  public static final String CSS_COUNTER_RESET = "counter-reset";

  public static final String CSS_COUNTER = "counter";

  public static final String CSS_COUNTER_INCREMENT = "counter-increment";

  public static final String CSS_FONT_SIZE = "font-size";
  
  public static final String CSS_ABS_FONT_SIZE = "abs-font-size";
  
  public static final String CSS_FONT_SIZE_PFS = "pfs";

  public static final String CSS_FONT_STYLE = "font-style";

  public static final String CSS_FONT_WEIGHT = "font-weight";

  public static final String CSS_FONT_VARIANT = "font-variant";

  public static final String CSS_FONT_NAME = "font-name";

  public static final String CSS_FONT_FAMILY = "font-family";

  public static final String CSS_FONT_COLOR = "color";
  
  public static final String CSS_ABS_BULLET_FONT_COLOR = "abs-bullet-color";
  
  public static final String CSS_ABS_BULLET_FONT_SCALE = "abs-bullet-scale";
  
  public static final String CSS_ABS_BULLET_FONT_FAMILY = "abs-bullet-family";
  
  public static final String CSS_LINE_HEIGHT = "line-height";

  public static final String CSS_BACKGROUND_COLOR = "background-color";

  public static final String CSS_USE_WINDOW_FONT_COLOR = "use-window-font-color";

  public static final String CSS_BORDER = "border";

  public static final String CSS_BORDER_RIGHT = "border-right";

  public static final String CSS_BORDER_LEFT = "border-left";

  public static final String CSS_BORDER_TOP = "border-top";

  public static final String CSS_BORDER_BOTTOM = "border-bottom";

  public static final String CSS_VERTICAL_ALIGN = "vertical-align";

  public static final String CSS_TEXT_ALIGN = "text-align";

  public static final String CSS_TEXT_INDENT = "text-indent";

  public static final String CSS_TEXT_SHADOW = "text-shadow";

  public static final String CSS_TEXT_TRANSFORM = "text-transform";

  public static final String CSS_TEXT_DECORATION = "text-decoration";

  public static final String CSS_TEXT_PAGE_NUMBER = "text_page-number";

  public static final String CSS_ROW_HEIGHT = "rowHeight";

  public static final String CSS_COL_WIDTH = "colWidth";

  public static final String CSS_POSITION_RELATIVE = "position:relative;";

  public static final String CSS_POSITION_ABSOLUTE = "position:absolute;";

  public static final String CSS_POSITION = "position";

  public static final String CSS_ABSOLUTE = "absolute";

  public static final String CSS_WHITE_SPACE = "white-space";

  public static final String CSS_PRE = "pre";

  public static final String CSS_ATTR_VISIBILITY = "visibility";

  public static final String CSS_VALUE_HIDDEN = "hidden";

  public static final String CSS_VALUE_VISIBLE = "visible";

  public static final String CSS_VALUE_NORMAL = "normal";

  public static final String CSS_VALUE_NOWRAP = "nowrap";

  public static final String CSS_VALUE_WRAP = "wrap";

  public static final String CSS_VALUE_MITER = "miter";

  public static final String CSS_ATTR_ROTATE = "rotate";

  public static final String CSS_ATTR_SCALE = "scale";

  public static final String CSS_ATTR_SKEW_X = "skewX";

  public static final String CSS_ATTR_SKEW_Y = "skewY";

  public static final String CSS_ATTR_LEFT = "left";

  public static final String CSS_ATTR_MIDDLE = "middle";

  public static final String CSS_ATTR_TOP = "top";

  public static final String CSS_ATTR_TEXT_FIXED = "text_fixed";

  public static final String CSS_ATTR_TEXT_LOCALE = "text_locale";

  public static final String CSS_ATTR_TEXT_DATETIME_FORMAT = "text_datetime-format";

  public static final String CSS_ATTR_PAGE_NUMBER_FORMAT = "page-number-format";

  public static final String CSS_ATTR_PAGE_NUMBER_FORMAT_UPPER_ALPHA = "0";

  public static final String CSS_ATTR_PAGE_NUMBER_FORMAT_LOWER_ALPHA = "1";

  public static final String CSS_ATTR_PAGE_NUMBER_FORMAT_UPPER_ROMAN = "2";

  public static final String CSS_ATTR_PAGE_NUMBER_FORMAT_LOWER_ROMAN = "3";

  public static final String CSS_ATTR_PAGE_NUMBER_FORMAT_NUMERIC = "4";

  public static final String CSS_ATTR_SHOW_ON_TITLE = "show-on-title";

  public static final String CSS_ATTR_DATE_TIME = "date-time";

  public static final String CSS_ATTR_HEADER = "header";

  public static final String CSS_ATTR_FOOTER = "footer";

  public static final String CSS_ATTR_PAGE_NUMBER = "page-number";

  public static final String CSS_ATTR_DRAW_STYLE_NAME = "draw_style-name";

  public static final String CSS_VALUE_TRANSFORM_ORIGIN = "transform-origin:0% 0%";

  public static final String CSS_VALUE_TRANSPARENT = "transparent";

  public static final String CSS_VALUE_AUTO = "auto";

  public static final String CSS_VALUE_NONE = "none";

  public static final String CSS_VALUE_UNDERLINE = "underline";

  public static final String CSS_VALUE_OVERLINE = "overline";

  public static final String CSS_VALUE_STRIKETHROUGH = "line-through";

  public static final String CSS_VALUE_TEXT_DECORATION_NO_PREFIX = "no-";

  public static final String CSS_VALUE_SOLID = "solid";

  public static final String CSS_VALUE_REPEAT = "repeat";

  public static final String CSS_VALUE_SCROLL = "scroll";

  public static final String CSS_STYLE_FLIPH = "flipH";

  public static final String CSS_STYLE_FLIPV = "flipV";

  public static final String CSS_STYLE_FLIPVH = "flipVH";

  // mich - defect 2896, suffix used when creating a css class that contains only the text properties of a graphic style
  public static final String CSS_GRAPHIC_TEXT_PROPERTIES_CLASS_SUFFIX = "_graphic_text-properties";

  public static final String CSS_GRAPHIC_GRAPHIC_PROPERTIES_CLASS_SUFFIX = "_graphic_graphic-properties";

  public static final String CSS_GRAPHIC_PARAGRAPH_PROPERTIES_CLASS_SUFFIX = "_graphic_paragraph-properties";

  public static final String CSS_TABLE_CELL_SELECTOR = "td.table_table-cell.";

  public static final String CSS_TABLE_HEADER_ROW = "tableHeaderRow";

  public static final String CSS_TABLE_LAST_ROW = "tableTotalRow";

  public static final String CSS_TABLE_ALTERNATE_ROW = "tableAlternateRow";

  public static final String CSS_ALTERNATE_ROW = "alternateRow";

  public static final String CSS_TABLE_HEADER_COLUMN = "tableHeaderCol";

  public static final String CSS_TABLE_LAST_COLUMN = "tableTotalCol";

  public static final String CSS_TABLE_ALTERNATE_COLUMN = "tableAlternateCol";

  // =====================================================================
  // SVG related
  // =====================================================================
  public static final String SVG_ELEMENT_MARKER = "marker";

  public static final String SVG_ATTR_VIEWBOX = "viewBox";

  public static final String SVG_ATTR_WIDTH = "width";

  public static final String SVG_ATTR_HEIGHT = "height";

  public static final String SVG_ELEMENT_PATH = "path";

  public static final String SVG_ATTR_FILL = "fill";

  public static final String SVG_ATTR_CLIP_PATH = "clip-path";

  public static final String SVG_ATTR_GROUP = "g";

  public static final String SVG_ATTR_D = "d";

  public static final String SVG_ATTR_TRANSFORM = "transform";

  public static final String SVG_ATTR_X = "x";

  public static final String SVG_ATTR_X1 = "x1";

  public static final String SVG_ATTR_Y = "y";

  public static final String SVG_ATTR_Y1 = "y1";

  public static final String SVG_ATTR_X2 = "x2";

  public static final String SVG_ATTR_Y2 = "y2";

  public static final String SVG_CIRCLE_ATTR_X = "x";

  public static final String SVG_CIRCLE_ATTR_Y = "y";

  public static final String SVG_CIRCLE_ATTR_R = "r";

  public static final String SVG_ELLIPSE_ATTR_CX = "cx";

  public static final String SVG_ELLIPSE_ATTR_CY = "cy";

  public static final String SVG_ELLIPSE_ATTR_RX = "rx";

  public static final String SVG_ELLIPSE_ATTR_RY = "ry";

  public static final String SVG_ATTR_MARKERSTART = "marker-start";

  public static final String SVG_ATTR_MARKEREND = "marker-end";

  public static final String SVG_ATTR_MARKERWIDTH = "markerWidth";

  public static final String SVG_ATTR_MARKERHEIGHT = "markerHeight";

  public static final String SVG_MARKER_ID = "id";

  public static final String SVG_MARKER_REFX = "refX";

  public static final String SVG_MARKER_REFY = "refY";

  public static final String SVG_ATTR_ORIENT = "orient";

  public static final String SVG_ATTR_ORIENT_AUTO = "auto";

  public static final String SVG_ATTR_STROKE = "stroke";

  public static final String SVG_ATTR_RATIO = "ratio";

  public static final String SVG_ATTR_PRESERVE_ASPECT_RATIO = "preserveAspectRatio";

  public static final String SVG_ATTR_STROKE_WIDTH = "stroke-width";

  public static final String SVG_ATTR_STROKE_COLOR = "stroke-color";

  public static final String SVG_ATTR_STROKE_DASHARRAY = "stroke-dasharray";

  public static final String SVG_ATTR_STROKE_DASHOFFSET = "stroke-dashoffset";

  public static final String SVG_ATTR_DOCS_BORDER_THICKNESS = "docs_border_thickness";

  // =====================================================================
  // Clipping contants
  // =====================================================================
  public static final String CLIP_RIGHT = "clipRight";

  public static final String CLIP_LEFT = "clipLeft";

  public static final String CLIP_TOP = "clipTop";

  public static final String CLIP_BOTTOM = "clipBottom";

  public static final String CLIP_INFO_ATTRIBUTE = "clipinfo";

  public static final String CLIP_CALCULATED_DF_WIDTH_PERCENT = "calculatedWidthPercent";

  public static final String CLIP_CALCULATED_DF_HEIGHT_PERCENT = "calculatedHeightPercent";

  public static final String CLIP_CALCULATED_DF_Y_PERCENT = "calculatedYPercent";

  public static final String CLIP_CALCULATED_DF_X_PERCENT = "calculatedXPercent";

  public static final String CLIP_ORIGINAL_DF_WIDTH_PERCENT = "originalWidthPercent";

  public static final String CLIP_ORIGINAL_DF_HEIGHT_PERCENT = "originalHeightPercent";

  public static final String CLIP_ORIGINAL_DF_Y_PERCENT = "originalYPercent";

  public static final String CLIP_ORIGINAL_DF_X_PERCENT = "originalXPercent";

  public static final String CLIP_IMAGE_DIMENSION_MAP = "ImageDimensionMap";

  public static final String CLIP_PIXELS_PER_UNIT_X_AXIS = "pixelsPerUnitXAxis";

  public static final String CLIP_X_DENSITY = "Xdensity";

  public static final String CLIP_PIXELS_PER_UNIT_Y_AXIS = "pixelsPerUnitYAxis";

  public static final String CLIP_Y_DENSITY = "Ydensity";

  public static final String CLIP_UNIT_SPECIFIER = "unitSpecifier";

  public static final String CLIP_UNIT_RESUNITS = "resUnits";

  public static final String CLIP_UNIT_INCH = "inch";

  public static final String CLIP_UNIT_METER = "meter";

  // =====================================================================
  // Miscellaneous
  // =====================================================================
  public static final String ENGLISH_US_LOCALE = "en_US";

  public static final String DRAW_CUSTOM_SHAPE_ELEMENT_HORIZONTAL = "DCSEHorizontal";

  public static final String DRAW_CUSTOM_SHAPE_ELEMENT_VERTICAL = "DCSEVertical";

  public static final String DRAW_CUSTOM_SHAPE_ELEMENT_LINE = "dcseline";

  public static final String HEADER_FOOTER_DISPLAY_DATE_TIME = "HF_DisplayDateTime";

  public static final String HEADER_FOOTER_DISPLAY_FOOTER = "HF_DisplayFooter";

  public static final String HEADER_FOOTER_DISPLAY_HEADER = "HF_DisplayHeader";

  public static final String HEADER_FOOTER_DISPLAY_PAGE_NUMBER = "HF_DisplayPageNumber";

  public static final String HEADER_FOOTER_DISPLAY_MAP = "headerfooterMap";

  public static final String ALIGNMENT_START = "start";

  public static final String ALIGNMENT_CENTER = "center";

  public static final String ALIGNMENT_END = "end";

  public static final String ALIGNMENT_RIGHT = "right";

  public static final String ALIGNMENT_LEFT = "left";

  public static final String ALIGNMENT_TOP = "top";

  public static final String ALIGNMENT_MIDDLE = "middle";

  public static final String ALIGNMENT_BOTTOM = "bottom";

  public static final String ALIGNMENT_HEIGHT = "height";

  public static final String ALIGNMENT_WIDTH = "width";

  public static final String SYMBOL_COLON = ":";

  public static final String SYMBOL_WHITESPACE = " ";

  public static final String SYMBOL_UNDERBAR = "_";

  public static final String SYMBOL_U = "u";

  public static final String SYMBOL_DASH = "-";

  public static final String SYMBOL_LEFT_PARENTHESIS = "{";

  public static final String SYMBOL_RIGHT_PARENTHESIS = "}";

  public static final String SYMBOL_DOT = ".";

  public static final String SYMBOL_PERCENT = "%";

  public static final String SYMBOL_NEWLINE = "\n";

  public static final String SYMBOL_SEMICOLON = ";";

  public static final String SYMBOL_QUOTE = "\"";

  public static final String CONCORD_ODF_ATTR_ID = "id";

  public static final String NOTES = "notes";

  public static final String HEADER = "header";

  public static final String NEWTEXTCONTENT = "newTextContent";

  public static final String TUNDRA = "tundra";

  public static final String DEFAULT_TEMPLATE = "defaultMaster_Title";

  public static final String DEFAULT_TEXT_STYLE = "Default_20_Text";

  public static final String DEFAULT_BULLET_P_NAME = "P_B_Concord_Default";

  public static final String DEFAULT_NUMBER_P_NAME = "P_L_Concord_Default";

  public static final String TITLE = "title";

  public static final String PAGE = "page";

  public static final String PARENT = "parent";

  public static final String TEXT_NAME = "text-name";

  public static final String TEXT = "text";

  public static final String PARAGRAPH = "paragraph";

  public static final String PRESENTATION = "presentation";

  public static final String DEFAULT = "default";

  public static final String UNHANDLED_ERROR = "100";

  public static final String DP224 = "dp224";

  public static final String DRAW_PAGE_ID = "dp";

  public static final String DRAW_PAGE_FIRST_ID = "dp1";

  public static final String ZERO = "0";

  public static final String ZERO_PERCENT = "0%";

  public static final String SUPER_SUB_SCRIPT_FONT_SIZE = "58%";

  public static final String SUPER_SUB_SCRIPT_FONT_ADJUST = "33%";

  public static final String HIDE_IN_IE = "hideInIE";

  public static final String DELETE_ON_EXPORT = "deleteOnExport";

  public static final String BORDER_DASHED = "dashed";

  public static final String BORDER_DOTTED = "dotted";

  public static final String STROKE_DOT = "Dot";

  public static final String TEXTBOX_PREFIX = "textbox_";

  public static final String SLIDE_PREFIX = "slide_";

  public static final String BODY_PREFIX = "body_";

  public static final String SLIDE_WRAPPER_PREFIX = "slideWrapper_";

  public static final String HTTP_PREFIX = "http://";

  public static final String FILE_URL_PREFIX = "file://";

  public static final String CLOSED_DRAW_ENHANCED_PATH = "Z";

  public static final String WIDTH_STRETCH = "width_stretch";

  public static final String HEIGHT_STRETCH = "height_stretch";

  // Identifier used to identify the style as a Concord Duplicate
  public static final String STYLE_COPY_IDENTIFIER = "CDUP";

  // Identifier used to identify a duplicated drawstyle
  public static final String DRAWSTYLE_COPY_IDENTIFIER = "DSDUP";

  public static double CM_TO_INCH_CONV = 2.5399;

  public static final double PT_CM_CONVERSION = 0.03514598035;

  public static final String FONT_FAMILY_HELV = "Helv";

  public static final String FONT_FAMILY_HELVETICA = "Helvetica";

  public static final String FONT_FAMILY_ARIAL = "arial";

  public static final String STRING_NBSP = "\u00a0";
  
  public static final String STRING_8203 = "\u200b";

  public static final String BOOLEAN_VALUE_TRUE = "true";

  public static final String BOOLEAN_VALUE_FALSE = "false";

  public static final String UPGRADE_VERSION = "upgradeVersion";

  public static final String CONTEXT_IS_UPGRADE = "isUpgrade";

  public static final String CONTEXT_ELEMENT_EXISTS = "isExistingElement";

  public static final String CONTEXT_COPIED_ELEMENT = "copiedElement";

  public static final String SOURCE_CONVERSION_VERSION = "sourceConversionVersion";

  public static final String IBM_DOCS_DASHED_STYLE_NAME = "IBM_DOCS_THIN_DASHED";

  public static final String STANDARD = "standard";

  public static final String JAPANESE_NUMBER_J1 = "\u30a4, \u30ed, \u30cf, ...";

  public static final String JAPANESE_NUMBER_J2 = "\u30a2, \u30a4, \u30a6, ...";
  
  public static final String HTML_ELEMENT_LIST_ULOL = "html-list-ulol-element";
  
  public static final String HTML_ELEMENT_LIST_LI = "html-list-li-element";
  
  public static final String HTML_ELEMENT_LIST_ROOT = "html-list-li-root-element";
  
  public static final String CONTEXT_PRESENTATION_STYLE_CONTAINER = "context-presentation-style-container";
  
  public static final double INCREASE_INDENT = 1.2;

  // ========================================================================
  // Transition Attribute Type List
  // ========================================================================
  private static List<String> cvTransitionAttrTypeList = null;
  static
  {
    cvTransitionAttrTypeList = new ArrayList<String>(6);
    cvTransitionAttrTypeList.add(ODF_ATTR_SMIL_TYPE);
    cvTransitionAttrTypeList.add(ODF_ATTR_SMIL_SUBTYPE);
    cvTransitionAttrTypeList.add(ODF_ATTR_SMIL_DIRECTION);
    cvTransitionAttrTypeList.add(ODF_ATTR_TRANSITION_SPEED);
    cvTransitionAttrTypeList.add(ODF_ATTR_SMIL_FADECOLOR);
    cvTransitionAttrTypeList.add(ODF_ATTR_TRANSITION_DURATION);
  }

  public static final List<String> getTransitionAttrTypeList()
  {
    return cvTransitionAttrTypeList;
  }

}

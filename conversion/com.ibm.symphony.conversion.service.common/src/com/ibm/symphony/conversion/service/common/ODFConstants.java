/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2020                           */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common;

import java.io.File;

public class ODFConstants
{
  public static enum DOCUMENT_TYPE {
    STYLES, MASTER, CONTENT, UNKNOWN
  };

  public static final String STYLE_DEFAULT_STYLE = "style:default-style";

  public static final String STYLE_DRAWING_PAGE_PROPERTIES = "style:drawing-page-properties";

  public static final String STYLE_TEXT_PROPERTIES = "style:text-properties";

  public static final String STYLE_LIST_LEVEL_PROPERTIES = "style:list-level-properties";

  public static final String TEXT_LIST_LEVEL_STYLE_BULLET = "text:list-level-style-bullet";

  public static final String TEXT_LIST_LEVEL_STYLE_NUMBER = "text:list-level-style-number";

  public static final String TEXT_LIST_LEVEL_STYLE_IMAGE = "text:list-level-style-image";

  public static final String STYLE_GRAPHIC_PROPERTIES = "style:graphic-properties";

  public static final String STYLE_PARAGRAPH_PROPERTIES = "style:paragraph-properties";

  public static final String STYLE_NAME = "style:name";

  public static final String STYLE_PARENT_STYLE_NAME = "style:parent-style-name";

  public static final String STYLE_FAMILY = "style:family";

  public static final String STYLE_TEXT_OVERLINE_STYLE = "style:text-overline-style";

  public static final String STYLE_TEXT_UNDERLINE_STYLE = "style:text-underline-style";

  public static final String STYLE_TEXT_UNDERLINE_COLOR = "style:text-underline-color";

  public static final String STYLE_TEXT_UNDERLINE_WIDTH = "style:text-underline-width";

  public static final String STYLE_TEXT_LINE_THROUGH_STYLE = "style:text-line-through-style";

  public static final String STYLE_TEXT_BLINKING = "style:text-blinking";

  public static final String STYLE_TABLE_PROPERTIES = "style:table-properties";

  public static final String STYLE_TABLE_CELL_PROPERTYES = "style:table-cell-properties";

  public static final String STYLE_TABLE_ROW_PROPERTIES = "style:table-row-properties";

  public static final String STYLE_TABLE_COLUMN_PROPERTIES = "style:table-column-properties";

  public static final String STYLE_LIST_LEVEL_LABEL_ALIGNMENT = "style:list-level-label-alignment";

  public static final String STYLE_LIST_STYLE_NAME = "style:list-style-name";

  public static final String TEXT_STYLE_NAME = "text:style-name";

  public static final String TEXT_LIST = "text:list";

  public static final String TEXT_LIST_ITEM = "text:list-item";

  public static final String TEXT_LIST_HEADER = "text:list-header";

  public static final String TEXT_LEVEL = "text:level";

  public static final String TEXT_P = "text:p";

  public static final String TABLE_TABLE_CELL = "table:table-cell";

  public static final String STYLE_TEXT_POSITION = "style:text-position";

  public static final String DRAW_IMAGE = "draw:image";

  public static final String DRAW_ID = "draw:id";

  public static final String DRAW_START_SHAPE = "draw:start-shape";

  public static final String DRAW_END_SHAPE = "draw:end-shape";

  public static final String DRAW_LINE = "draw:line";

  public static final String DRAW_CONNECTOR = "draw:connector";

  public static final String DRAW_CUSTOMSHAPE = "draw:custom-shape";

  public static final String DRAW_ENHANCED_GEOMETRY = "draw:enhanced-geometry";

  public static final String DRAW_ELLIPSE = "draw:ellipse";

  public static final String DRAW_MEASURE = "draw:measure";

  public static final String DRAW_RECT = "draw:rect";

  public static final String DRAW_PATH = "draw:path";

  public static final String DRAW_G = "draw:g";

  public static final String DRAW_POLYGON = "draw:polygon";

  public static final String DRAW_POLYLINE = "draw:polyline";

  public static final String DRAW_REGULAR_POLYGON = "draw:regular-polygon";

  public static final String DR3D_SCENE = "dr3d:scene";

  public static final String DRAW_FRAME = "draw:frame";

  public static final String DRAW_PAGE = "draw:page";

  public static final String DRAW_STYLE_NAME = "draw:style-name";

  public static final String DRAW_TEXT_STYLE_NAME = "draw:text-style-name";

  public static final String DRAW_TRANSFORM = "draw:transform";

  public static final String TABLE_TABLE = "table:table";

  public static final String TABLE_TABLE_COLUMN = "table:table-column";

  public static final String TABLE_TABLE_ROW = "table:table-row";

  public static final String TABLE_STYLE_NAME = "table:style-name";

  public static final String XLINK_HREF = "xlink:href";

  public static final String OFFICE_TEXT = "office:text";

  public static final String OFFICE_TITLE = "office:title";

  public static final String FO_MARGIN_LEFT = "fo:margin-left";

  public static final String TEXT_SPACE_BEFORE = "text:space-before";

  public static final String FO_TEXT_INDENT = "fo:text-indent";

  public static final String TEXT_TAB_STOP_POSITION = "text:list-tab-stop-position";

  public static final String STYLE_NUM_FORMAT = "style:num-format";

  public static final String TEXT_BULLET_CHAR = "text:bullet-char";

  public static final String TEXT_DISPLAY_LEVELS = "text:display-levels";

  public static final String STYLE_NUM_SUFFIX = "style:num-suffix";

  public static final String STYLE_NUM_PREFIX = "style:num-prefix";

  public static final String TEXT_START_VALUE = "text:start-value";

  public static final String SVG_TITLE = "svg:title";

  public static final String TEXT_CONTINUE_LIST = "text:continue-list";

  public static final String TEXT_CONTINUE_NUMBERING = "text:continue-numbering";

  public static final String TEXT_OUTLINE_LEVEL = "text:outline-level";

  public static final String TEXT_OUTLINE_STYLE = "text:outline-style";

  public static final String TEXT_H = "text:h";

  public static final String TABLE_TABLE_HEADER_ROWS = "table:table-header-rows";

  public static final String TABLE_TABLE_HEADER_COLUMNS = "table:table-header-columns";

  public static final String TEXT_OUTLINE_LEVEL_STYLE = "text:outline-level-style";

  public static final String TEXT_RESTART_NUMBERING = "text:restart-numbering";

  public static final String TEXT_LIST_STYLE = "text:list-style";

  public static final String TEXT_INDEX_BODY = "text:index-body";

  public static final String TEXT_TAB = "text:tab";

  public static final String TEXT_A = "text:a";

  public static final String DRAW_A = "draw:a";

  public static final String TEXT_TRACKED_CHANGES = "text:tracked-changes";

  public static final String FO_BREAK_BEFORE = "fo:break-before";

  public static final String TEXT_OBJECT_INDEX_SOURCE = "text:object-index-source";

  public static final String TEXT_TABLE_OF_CONTENT_SOURCE = "text:table-of-content-source";

  public static final String TEXT_TABLE_OF_CONTENT = "text:table-of-content";

  public static final String TABLE_NAME = "table:name";

  public static final String STYLE_FONT_NAME = "style:font-name";

  public static final String STYLE_FONT_NAME_ASIAN = "style:font-name-asian";

  public static final String STYLE_FONT_FAMILY_ASIAN = "style:font-family-asian";

  public static final String STYLE_FONT_NAME_COMPLEX = "style:font-name-complex";

  public static final String TEXT_SPAN = "text:span";

  public static final String STYLE_FONT_FACE = "style:font-face";

  public static final String SVG_FONT_FAMILY = "svg:font-family";

  public static final String TABLE_NUM_COLUMNS_SPAN = "table:number-columns-spanned";

  public static double CM_TO_INCH_CONV = 2.5399;


  public static final String TABLE_NUM_ROWS_SPAN = "table:number-rows-spanned";

  public static final String TABLE_BORDER_MODEL = "table:border-model";

  public static final String STYLE_PAGE_LAYOUT_PROPERTIES = "style:page-layout-properties";

  public static final String STYLE_BACKGROUND_IMAGE = "style:background-image";

  public static final String STYLE_BACKGROUND_TRANSPARENCY = "style:background-transparency";

  public static final String XLINK_TYPE = "xlink:type";

  public static final String STYLE_REPEAT = "style:repeat";

  public static final String TEXT_ANCHOR_TYPE = "text:anchor-type";

  public static final String DRAW_Z_INDEX = "draw:z-index";

  public static final String SVG_X = "svg:x";

  public static final String SVG_Y = "svg:y";

  public static final String SVG_WIDTH = "svg:width";

  public static final String SVG_HEIGHT = "svg:height";

  public static final String STYLE_HORIZONTAL_POS = "style:horizontal-pos";

  public static final String SVG_VIEW_BOX = "svg:viewBox";

  public static final String DRAW_TEXT_ROTATE_ANGLE = "draw:text-rotate-angle";

  public static final String DRAW_MIRROR_VERTICAL = "draw:mirror-vertical";

  public static final String DRAW_TYPE = "draw:type";

  public static final String DRAW_ENHANCED_PATH = "draw:enhanced-path";

  public static final String DRAW_TEXT_BOX = "draw:text-box";

  public static final String STYLE_PAGE_NUMBER = "style:page-number";

  public static final String TABLE_ALIGN = "table:align";

  public static final String TABLE_COLUMN_REPEAT = "table:number-columns-repeated";

  public static final String TEXT_S = "text:s";

  public static final String TEXT_C = "text:c";

  public static final String TEXT_SEQUENCE_DECLS = "text:sequence-decls";

  public static final String TEXT_SEQUENCE_DECL = "text:sequence-decl";

  public static final String OFFICE_FORMS = "office:forms";

  public static final String XLINK_SHOW = "xlink:show";

  public static final String XLINK_ACTUATE = "xlink:actuate";

  public static final String TEXT_LINE_BREAK = "text:line-break";

  public static final String STYLE_MASTER_PAGE_NAME = "style:master-page-name";

  public static final String DRAW_NAME = "draw:name";

  public static final String TABLE_COVERED_TABLE_CELL = "table:covered-table-cell";

  public static final String OFFICE_NAME = "office:name";

  public static final String OFFICE_TARGET_FRAME_NAME = "office:target-frame-name";

  public static final String TEXT_BOOKMARK = "text:bookmark";

  public static final String TEXT_BOOKMARK_START = "text:bookmark-start";

  public static final String TEXT_BOOKMARK_END = "text:bookmark-end";

  public static final String TEXT_BOOKMARK_REF = "text:bookmark-ref";

  public static final String TEXT_REF_NAME = "text:ref-name";

  public static final String TEXT_INDEX_TITILE = "text:index-title";

  public static final String DRAW_CUSTOM_SHAPE = "draw:custom-shape";

  public static final String DRAW_OBJECT = "draw:object";

  public static final String DRAW_OBJECT_OLE = "draw:object-ole";

  public static final String DRAW_PLUGIN = "draw:plugin";

  public static final String TEXT_NOTE = "text:note";

  public static final String TEXT_SECTION = "text:section";

  public static final String OFFICE_ANNOTATION = "office:annotation";

  public static final String DRAW_CONTROL = "draw:control";

  public static final String TEXT_DATABASE_DISPLAY = "text:database-display";

  public static final String FO_LINE_HEIGHT = "fo:line-height";

  public static final String TEXT_SELECT_PAGE = "text:select-page";

  public static final String TEXT_PAGE_NUMBER = "text:page-number";

  public static final String TEXT_DATE = "text:date";

  public static final String TEXT_TIME = "text:time";

  public static final String TEXT_DATE_VALUE = "text:date-value";

  public static final String TEXT_TIME_VALUE = "text:time-value";

  public static final String TEXT_FIXED = "text:fixed";

  public static final String TEXT_STYLE_OVERRIDE = "text:style-override";

  public static final String TEXT_SEQUENCE = "text:sequence";

  public static final String STYLE_HEADER = "style:header";

  public static final String STYLE_FOOTER = "style:footer";

  public static final String STYLE_MASTER_PAGE = "style:master-page";

  public static final String FO_MIN_HEIGHT = "fo:min-height";

  public static final String STYLE_TAB_STOPS = "style:tab-stops";

  public static final String STYLE_TAB_STOP = "style:tab-stop";

  public static final String STYLE_TAB_STOP_DISTANCE = "style:tab-stop-distance";

  public static final String STYLE_CHAR = "style:char";

  public static final String STYLE_LEADER_COLOR = "style:leader-color";

  public static final String STYLE_LEADER_STYLE = "style:leader-style";

  public static final String STYLE_LEADER_TEXT = "style:leader-text";

  public static final String STYLE_LEADER_TEXT_STYLE = "style:leader-text-style";

  public static final String STYLE_LEADER_TYPE = "style:leader-type";

  public static final String STYLE_LEADER_WIDTH = "style:leader-width";

  public static final String STYLE_POSITION = "style:position";

  public static final String STYLE_TYPE = "style:type";

  public static final String STYLE_USE_WINDOW_FONT_COLOR = "style:use-window-font-color";

  public static final String STYLE_TABLE_CELL_PROPERTIES = "style:table-cell-properties";

  public static final String FO_BACKGROUND_COLOR = "fo:background-color";

  public static final String TEXT_NAME = "text:name";

  public static final String TEXT_VISITED_STYLE_NAME = "text:visited-style-name";

  public static final String TEXT_PROTECTED = "text:protected";

  public static final String STYLE_LEADER_CHAR = "style:leader-char";

  public static final String STYLE_SECTION_PROPERTIES = "style:section-properties";

  public static final String STYLE_COLUMNS = "style:columns";

  public static final String FO_COLUMN_COUNT = "fo:column-count";

  public static final String FO_COLUMN_GAP = "fo:column-gap";

  public static final String TEXT_INDEX_TITLE_TEMPLATE = "text:index-title-template";

  public static final String TEXT_TABLE_OF_CONTENT_ENTRY_TEMPLATE = "text:table-of-content-entry-template";

  public static final String TEXT_INDEX_ENTRY_LINK_START = "text:index-entry-link-start";

  public static final String TEXT_INDEX_ENTRY_CHAPTER = "text:index-entry-chapter";

  public static final String TEXT_INDEX_ENTRY_TEXT = "text:index-entry-text";

  public static final String TEXT_INDEX_ENTRY_TAB_STOP = "text:index-entry-tab-stop";

  public static final String TEXT_INDEX_ENTRY_PAGE_NUMBER = "text:index-entry-page-number";

  public static final String TEXT_INDEX_ENTRY_LINK_END = "text:index-entry-link-end";

  public static final String STYLE_KEEP_TOGETHER = "style:keep-together";

  public static final String STYLE_DELETE_NUMBER_TAB_STOP = "style:delete-number-tab-stop";

  // Below here is a copy of ODPConvertConstants.
  // TODO: Go through and figure out which ones are needed and delete the rest
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

  public static final String FILE_SUFFIX_SVG = ".svg";

  public static final String FILE_PNG = "png";

  public static final String FILE_WMF = "wmf";

  public static final String FILE_EMF = "emf";

  public static final String FILE_SVM = "svm";

  public static final String FILE_JPG = "jpg";

  public static final String FILE_JPEG = "jpeg";

  public static final String FILE_BMP = "bmp";

  public static final String FILE_GIF = "gif";

  public static final String MIME_TYPE_WMF = "application/x-msmetafile";

  public static final String MIME_TYPE_SVM = "image/svm";

  public static final String FILE_HTML_CONTENT_FILE_NAME = "content" + FILE_SUFFIX_HTML;

  public static final String FILE_HTML_MASTER_FILE_NAME = "master" + FILE_SUFFIX_HTML;

  public static final String FILE_STYLES_XML = "styles.xml";

  public static final String FILE_TEMPLATE_LIST = "templateList.json";

  public static final String FILE_PICTURE_PREFIX = "Pictures";

  public static final String FILE_PICTURE_START_PREFIX = FILE_PICTURE_PREFIX + FILE_RESOURCE_SEPARATOR;

  public static final String FILE_OBJECT_REPLACEMENTS_FOLDER = "ObjectReplacements";

  public static final String FILE_OBJECT_REPLACEMENT_START_PREFIX = FILE_OBJECT_REPLACEMENTS_FOLDER + FILE_RESOURCE_SEPARATOR;

  public static final String FILE_ORIGNAME_FIX = "original_";

  public static final String FILE_CONVERTED = "converted";

  public static final String FILE_CONVERTED_ODP = FILE_CONVERTED + ".odp";

  public static final String FILE_ODF_DRAFT = "odfdraft";

  public static final String FILE_BLANK_TEMPLATE = "Blank_Template.odp";

  // =====================================================================
  // Context related
  // =====================================================================

  public static double CONTEXT_LINE_HEIGHT_DEFAULT = 1.0;

  public static double CONTEXT_LINE_HEIGHT_OFFSET = 0.125;

  public static double CONTEXT_FONT_SIZE_DEFAULT = 1.0;

  public static final String CONTEXT_PARENT_SIZE = "parent-size";

  public static final String CONTEXT_PARENT_WIDTH = "parent-width";

  public static final String CONTEXT_TARGET_CONTENT_PATH = "target-content-path";

  public static final String CONTEXT_TARGET_MASTER_PATH = "target-master-path";

  public static final String CONTEXT_CONVERT_SOURCE = "source";

  public static final String CONTEXT_CONVERT_TARGET = "target";

  public static final String CONTEXT_CONVERT_RESULT = "result";

  public static final String CONTEXT_OLD_CHILDREN = "oldChildren";

  public static final String CONTEXT_REORDER = "Reorder";

  public static final String CONTEXT_CURRENT_ELEMENT = "current-element-context";

  public static final String CONTEXT_PARENT_ELEMENT = "current-parent-element";

  public static final String CONTEXT_CURRENT_STYLE_NODE = "current-style-node";

  public static final String CONTEXT_OUTLINE_FONTSIZE_MAP = "outline-fontsize-map";

  public static final String CONTEXT_CURRENT_LISTSTYLE = "list-style";

  public static final String CONTEXT_IMPLACE_STYLE = "InplaceStyle";

  public static final String CONTEXT_TARGET_BASE = "target-base";

  public static final String CONTEXT_SOURCE_PATH = "source-path";

  public static final String CONTEXT_TARGET_PATH = "target-path";

  public static final String CONTEXT_DRAWPAGE_HEAD_FOOT = "drawpage-header-footers";

  public static final String CONTEXT_DRAWPAGE_PAGE_NUMBER = "draw-page-page-number";

  public static final String CONTEXT_HEAD_FOOT_VALUE = "head-foot-value";

  public static final String CONTEXT_SHOW_HEAD_FOOT = "head-foot-show";

  public static final String CONTEXT_DRAWPAGE_MASTER_NAME = "draw-page-mster-page-name";

  public static final String CONTEXT_DRAWPAGE_PROP_MAP = "draw-page-properties-map";

  public static final String CONTEXT_DRAWPAGE_FOOT_STYLE = "draw-page-footer-style";

  public static final String CONTEXT_DRAWPAGE_DATETIME_STYLE = "draw-page-date-time-style";

  public static final String CONTEXT_NEXT_OUTLINE_INDEX = "outline-index-next";

  public static final String CONTEXT_TEXTLIST_CHILD_HTML = "textlist-child-html-element";

  public static final String CONTEXT_TEXTLIST_HEADER_FLAG = "text:list-header-flag";

  public static final String CONTEXT_TEXTLIST_STYLE_BASE_NAME = "textlist-base-class";

  public static final String CONTEXT_TEXTLIST_STYLE_NAME = "text:style-name";

  public static final String CONTEXT_TEXTLIST_PARENT_TYPE = "list-parent-type";

  public static final String CONTEXT_TABLE_INDEX = "table-index";

  public static final String CONTEXT_TABLE_WIDTH = "TableWidth";

  public static final String CONTEXT_TABLE_HEIGHT = "TableHeight";

  public static final String CONTEXT_PAGE_SIZE = "page-size";

  public static final String CONTEXT_CURRENT_SIZE = "current-size";

  public static final String CONTEXT_TABLE_TEMPLATE_REF = "table-template-reference";

  public static final String CONTEXT_TABLE_TEMPLATE_MAP = "table-template-map";

  public static final String CONTEXT_TABLE_TEMPLATE_ATTRS = "table-template-attrs";

  public static final String CONTEXT_TABLE_STYLE_ELEMENTS = "table-style-elements";

  public static final String CONTEXT_HTML_STYLE_SOURCE = "html-style-source";

  public static final String CONTEXT_DEFINED_TABLE_STYLES = "defined-table-styles";

  public static final String CONTEXT_CUSTOM_STYLE_NAME = "custom-style-name";

  public static final String CONTEXT_PAGE_WIDTH = "page-width";

  public static final String CONTEXT_PAGE_WIDTH_DEFAULT = "28cm";

  public static final String CONTEXT_PAGE_HEIGHT = "page-height";

  public static final String CONTEXT_MIN_SHAPE_DIV_HEIGHT = "shape-div-height";

  public static final String CONTEXT_MIN_SHAPE_DIV_WIDTH = "shape-div-width";

  public static final String CONTEXT_SHAPE_TEXT_AREAS = "Shape-DrawTextAreas";

  public static final String CONTEXT_TEXT_ROTATION_ANGLE = "DrawTextRotationAngle";

  public static final String CONTEXT_PAGE_HEIGHT_DEFAULT = "21cm";

  public static final String CONTEXT_CSS_COMMON_STYLE = "css-common-style";

  public static final String CONTEXT_CSS_AUTOMATIC_STYLE = "css-automatic-style";

  public static final String CONTEXT_CSS_CONTENT_STYLE = "css-content-style";

  public static final String CONTEXT_AUTOSTYLE_NODES_MAP = "auto-style-nodes";

  public static final String CONTEXT_SYTLENAME_NODES_MAP = "style-names";

  public static final String CONTEXT_ODP_STYLES_MAP = "style-elements";

  public static final String CONTEXT_DRAWNAME_NODES_MAP = "draw-names";

  public static final String CONTEXT_SYTLENAME_NODES_MAP_IN_CONTENT = "style-names-content";

  public static final String CONTEXT_SYTLENAME_NODES_MAP_IN_STYLE = "style-names-style";

  public static final String CONTEXT_INSIDE_SHAPE = "inside-shape";

  public static final String CONTEXT_TRANSITION_VALUES = "transition-values";

  public static final String CONTEXT_PAGE_TRANSITION_STYLE = "page-transition-style";

  public static final String CONTEXT_OUTER_SPAN_CLASS = "outer-span-class";

  public static final String TARGET_FILE_PATH = "target-file-path";

  public static final String CONTEXT_STYLES_DOM = "styles_dom";

  public static final String CONTEXT_INDEX_TABLE = "indexTable";

  public static final String CONTEXT_FIELD_BOOLEAN_ATTRIBUTE = "isField";

  public static final String CONTEXT_FIELD_TYPE = "FieldType";

  public static final String CONTEXT_IS_NEW_DOC = "isNewDoc";

  public static final String CONTEXT_ODP_STYLES_MAP_ADDED = "converted_styles_map";

  public static final String CONTEXT_USED_STYLE_MAP = "used_style_map";

  public static final String CONTEXT_PRE_STYLE_NAME_MAP = "pre_style_name_map"; // for performance

  public static final String CONTEXT_PRE_STYLE_NAME = "presentation_style-name";

  public static final String CONTEXT_PAGE_TEMPLATE_NAME = "page_template_name";

  public static final String CONTEXT_INLINE_STYLE_MAP = "inline-styles-map";

  public static final String CONTEXT_IN_STYLE = "InsideStyles";

  public static final String CONTEXT_DOCUMENT_TYPE = "DocumentType";

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

  public static final String CONTEXT_PAGE_COUNT = "page-count";

  public static final String CONTEXT_GRAPHIC_COUNT = "graphic-count";

  public static final String CONTEXT_LIST_ITEM_LINE_HEIGHT = "ListItemLineHeight";

  public static final String CONTEXT_LIST_ITEM_FONT_SIZE = "ListItemFontSize";

  public static final String CONTEXT_PARENT_LIST_ITEM_FONT_SIZE = "ParentLiFontSize";

  // =====================================================================
  // ODF related
  // =====================================================================
  public static final String ODF_STYLE_COMMON = "office:styles";

  public static final String CSS_STYLE_COMMON_FILE = "office_styles.css";

  public static final String CSS_STYLE_TEXT_CSS = "text/css";

  public static final String CSS_STYLE_STYLESHEET = "stylesheet";

  public static final String ODF_STYLE_AUTO = "office:automatic-styles";

  public static final String CSS_STYLE_AUTO_FILE = "office_automatic_styles.css";

  public static final String ODF_STYLE_MASTER = "office:master-styles";

  public static final String ODF_STYLE_DOCUMENT = "office:document-styles";

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

  public static final String ODF_ELEMENT_BACKGROUND_COLOR = "background-color";

  public static final String ODF_ELEMENT_TEXTLIST = "text:list";

  public static final String ODF_ELEMENT_TEXTSPAN = "text:span";

  public static final String ODF_ELEMENT_TEXTLIST_HEADER = "text:list-header";

  public static final String ODF_ELEMENT_TEXTLIST_ITEM = "text:list-item";

  public static final String ODF_ELEMENT_DRAWPAGE = "draw:page";

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

  public static final String ODF_ELEMENT_DRAWENHANCEDPATH = "draw:enhanced-path";

  public static final String ODF_ELEMENT_DRAWGLUEPOINT = "draw:glue-point";

  public static final String ODF_ELEMENT_SVGTITLE = "svg:title";

  public static final String ODF_ELEMENT_SVGDESC = "svg:desc";

  public static final String ODF_ELEMENT_OFFICEFORMS = "office:forms";

  public static final String ODF_ELEMENT_DRAWCONTROL = "draw:control";

  public static final String ODF_ELEMENT_DRAWCAPTION = "draw:caption";

  public static final String ODF_ELEMENT_ANIMPAR = "anim:par";

  public static final String ODF_ELEMENT_DRAWOBJECT = "draw:object";

  public static final String ODF_ELEMENT_DRAWOBJECTOLE = "draw:object-ole";

  public static final String ODF_ELEMENT_DR3DSCENE = "dr3d:scene";

  public static final String ODF_ELEMENT_PRESENTATIONNOTES = "presentation:notes";

  public static final String ODF_ELEMENT_HEADER_DECL = "presentation:header-decl";

  public static final String ODF_ELEMENT_PRESENTATION_NAME = "presentation:name";

  public static final String ODF_ELEMENT_TEXT_A = "text:a";

  public static final String ODF_ELEMENT_TEXT_PARAGRAPH = "text:p";

  public static final String ODF_ELEMENT_TEXT_LINE_BREAK = "text:line-break";

  public static final String ODF_ELEMENT_TEXTDATE = "text:date";

  public static final String ODF_ELEMENT_DCCREATOR = "dc:creator";

  public static final String ODF_ELEMENT_DCDATE = "dc:date";

  public static final String ODF_ELEMENT_DATE = "date";

  public static final String ODF_ELEMENT_FIELD = "field";

  public static final String ODF_ELEMENT_TEXTTIME = "text:time";

  public static final String ODF_ELEMENT_TIME = "time";

  public static final String ODF_ELEMENT_TEXTPAGENUMBER = "text:page-number";

  public static final String ODF_ELEMENT_PAGENUMBER = "page-number";

  public static final String ODF_TABLESTYLES = "tablestyles";

  public static final String ODF_ELEMENT_TABLECONVEREDTABLE_CELL = "table:covered-table-cell";

  public static final String ODF_ELEMENT_DRAW_IMG = "draw:image";

  public static final String ODF_STYLE_MASTER_PAGE = "style:master-page";

  public static final String ODF_ATTR_DRAW_MASTER_PAGE_NAME = "draw:master-page-name";

  public static final String ODF_ATTR_STYLE_NAME = "style:name";

  public static final String ODF_ATTR_TEXT_STYLE_NAME = "text:style-name";

  public static final String ODF_ATTR_STYLE_TEXT_PROPERTIES = "style:text-properties";

  public static final String ODF_ATTR_STYLE_STYLE = "style:style";

  public static final String ODF_ATTR_STYLE_FAMILY = "style:family";

  public static final String ODF_ATTR_STYLE_TEXT_POSITION = "style:text-position";

  public static final String ODF_ATTR_PARENT_STYLE_NAME = "style:parent-style-name";

  public static final String ODF_ATTR_FONT_SIZE = "fo:font-size";

  public static final String ODF_ATTR_LINE_HEIGHT = "fo:line-height";

  public static final String ODF_ATTR_FONT_FAMILY = "fo:font-family";

  public static final String ODF_ATTR_DRAW_STYLE_NAME = "draw:style-name";

  public static final String ODF_ATTR_DRAW_TEXT_STYLE_NAME = "draw:text-style-name";

  public static final String ODF_ATTR_XLINK_HREF = "xlink:href";

  public static final String ODF_ATTR_TABLE_NUM_COL_SPANNED = "table:number-columns-spanned";

  public static final String ODF_ATTR_TABLE_STYLE_NAME = "table:style-name";

  public static final String ODF_ATTR_SVG_VIEWBOX = "viewBox";

  public static final String ODF_ATTR_SVG_TRANSFORM = "transform";

  public static final String ODF_ATTR_DRAW_NAME = "draw:name";

  public static final String ODF_ATTR_SMIL_TYPE = "smil:type";

  public static final String ODF_ATTR_SMIL_SUBTYPE = "smil:subtype";

  public static final String ODF_ATTR_SMIL_DIRECTION = "smil:direction";

  public static final String ODF_ATTR_SMIL_FADECOLOR = "smil:fadeColor";

  public static final String ODF_ATTR_TRANSITION_SPEED = "presentation:transition-speed";

  public static final String ODF_ATTR_USE_FOOTER_NAME = "presentation:use-footer-name";

  public static final String ODF_ATTR_USE_DATE_TIME_NAME = "presentation:use-date-time-name";

  public static final String ODF_ATTR_PRESENTATION_CLASS = "presentation:class";

  public final static String ODF_ATTR_TRANSITION_DURATION = "presentation:duration";

  public static final String ODF_ATTR_PRE_STYLE_NAME = "presentation:style-name";

  public static final String ODF_ATTR_GENERAL_STYLE_NAME = ":style-name";

  public static final String ODF_STYLE_DEFAULT = "style:default-style";

  public static final String ODF_STYLE_DEFAULT_NAME = "default-style";

  public static final String ODF_STYLE_GRAPHIC_PROP = "style:graphic-properties";

  public static final String ODF_STYLE_TEXT_LIST = "text:list-style";

  public static final String ODF_STYLE_TEXT_STYLE_NAME = "text:style-name";

  public final static String ODF_STYLE_NUM_FORMAT = "style:num-format";

  public final static String ODF_STYLE_DRAWING_PAGE_PROP = "style:drawing-page-properties";

  public final static String ODF_STYLE_GRAPHIC_REPEAT = "style:repeat";

  public final static String ODF_STYLE_TEXTLIST_BULLET_STYLE = "text:list-level-style-bullet";

  public final static String ODF_STYLE_TEXTLIST_IMAGE_STYLE = "text:list-level-style-image";

  public final static String ODF_STYLE_TEXTLIST_NUMBER_STYLE = "text:list-level-style-number";

  public static final String ODF_STYLE_ROW_HEIGHT = "style:row-height";

  public static final String ODF_STYLE_COLUMN_WIDTH = "style:column-width";

  public static final String ODF_STYLE_OBJECT_GROUPING = "draw:g";

  public static final String ODF_STYLE_PARAGRAPH_PROPERTIES = "style:paragraph-properties";

  public static final String ODF_ATTR_VISIBILTY = "presentation:visibility";

  public final static String ODF_ATTR_TEXT_FIELD_DATE = "text:date-value";

  public final static String ODF_ATTR_TEXT_FIELD_TIME = "text:time-value";

  public static final String ODF_STYLE_DEFAULT_CELL_STYLE_NAME = "table:default-cell-style-name";

  public static final String ODF_STYLE_TABLE_TEMPLATE = "table:table-template";

  public static final String ODF_ATTR_DRAWTEXTAREAHORIZONTALALIGN = "draw:textarea-horizontal-align";

  public static final String ODF_ATTR_DRAW_TEXTAREA_VERTICAL_ALIGN = "draw:textarea-vertical-align";

  public static final String ODF_ATTR_DRAWTRANSFORM = "draw:transform";

  public static final String ODF_ATTR_DRAW_OPACITY = "draw:opacity";

  public static final String ODF_ATTR_DRAW_FILL_IMAGE_NAME = "draw:fill-image-name";

  public static final String ODF_ATTR_DRAW_FILL_IMAGE = "draw:fill-image";

  public static final String ODF_ATTR_DRAW_FILL_GRADIENT_NAME = "draw:fill-gradient-name";

  public static final String ODF_ATTR_DRAW_FILL = "draw:fill";

  public static final String ODF_ATTR_DRAW_FILL_COLOR = "draw:fill-color";

  public static final String ODF_ATTR_DRAW_STROKE = "draw:stroke";

  public static final String ODF_ATTR_DRAW_STROKE_DASH = "draw:stroke-dash";

  public static final String ODF_ATTR_VALUE_DASH = "dash";

  public static final String ODF_ATTR_SVG_STROKE_WIDTH = "svg:stroke-width";

  public static final String ODF_ATTR_SVG_STROKE_COLOR = "svg:stroke-color";

  public static final String ODF_ATTR_DRAWMARKEREND = "draw:marker-end";

  public static final String ODF_ATTR_DRAWMARKERSTART = "draw:marker-start";

  public static final String ODF_ATTR_DRAWMARKERENDWIDTH = "draw:marker-end-width";

  public static final String ODF_ATTR_DRAWMARKERSTARTWIDTH = "draw:marker-start-width";

  public static final String ODF_ATTR_MIRROR_H = "mirror-horizontal";

  public static final String ODF_ATTR_MIRROR_V = "mirror-vertical";

  public static final String ODF_ATTR_IMAGE = "image";

  public static final String ODF_ATTR_LIST_LEVEL_STYLE_IMAGE = "list-level-style-image";

  public static final String ODF_ATTR_SVG_X = "svg:x";

  public static final String ODF_ATTR_SVG_Y = "svg:y";

  public static final String ODF_ATTR_SVG_X1 = "svg:x1";

  public static final String ODF_ATTR_SVG_Y1 = "svg:y1";

  public static final String ODF_ATTR_SVG_X2 = "svg:x2";

  public static final String ODF_ATTR_SVG_Y2 = "svg:y2";

  public static final String ODF_ATTR_SVG_WIDTH = "svg:width";

  public static final String ODF_ATTR_SVG_HEIGHT = "svg:height";

  public static final String ODF_ATTR_FO_PADDING_RIGHT = "fo:padding-right";

  public static final String ODF_ATTR_FO_PADDING_LEFT = "fo:padding-left";

  public static final String ODF_ATTR_FO_PADDING_TOP = "fo:padding-top";

  public static final String ODF_ATTR_FO_PADDING_BOTTOM = "fo:padding-bottom";

  public static final String ODF_ATTR_FO_BORDER_BOTTOM = "fo:border-bottom";

  public static final String ODF_ATTR_FO_BORDER_TOP = "fo:border-top";

  public static final String ODF_ATTR_FO_BORDER_RIGHT = "fo:border-right";

  public static final String ODF_ATTR_FO_BORDER_LEFT = "fo:border-left";

  public static final String ODF_ATTR_FO_BORDER = "fo:border";

  public static final String ODF_ATTR_FO_MARGIN_BOTTOM = "fo:margin-bottom";

  public static final String ODF_ATTR_FO_MARGIN_TOP = "fo:margin-top";

  public static final String ODF_ATTR_FO_MARGIN_LEFT = "fo:margin-left";

  public static final String ODF_ATTR_FO_MARGIN_RIGHT = "fo:margin-right";

  public static final String ODF_ATTR_FO_TEXT_INDENT = "fo:text-indent";

  public static final String ODF_ATTR_FO_COLOR = "fo:color";

  public static final String ODF_ATTR_FO_FONT_STYLE = "fo:font-style";

  public final static String ODF_ATTR_XMLID = "xml:id";

  public final static String ODF_ATTR_DRAWID = "draw:id";

  public final static String ODF_ATTR_TEXTID = "text:id";

  public final static String ODF_ATTR_TABLEID = "table:id";

  public static final String ODF_ATTR_OFFICE_VERSION = "office:version";

  public static final String ODF_ATTR_CUSTOM_SHAPE = "custom-shape";

  // =====================================================================
  // HTML related
  // =====================================================================
  public static final String HTML_TITLE = "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" "
      + "\"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n";

  public static final String HTML_ELEMENT_HEAD = "head";

  public static final String HTML_ELEMENT_BODY = "body";

  public static final String HTML_ELEMENT_LINK = "link";

  public static final String HTML_STYLE_TAG = "style";

  public static final String HTML_SCRIPT_TAG = "script";

  public static final String HTML_ATTR_STYLE = "style";

  public static final String HTML_ATTR_CLASS = "class";

  public static final String HTML_ATTR_HREF = "href";

  public static final String HTML_ATTR_TYPE = "type";

  public static final String HTML_ATTR_REL = "rel";

  public static final String HTML_ATTR_FIELD = "field";

  public static final String HTML_ATTR_SRC = "src";

  public static final String HTML_ATTR_ALT = "alt";

  public static final String HTML_ATTR_ID = "id";

  public static final String HTML_ATTR_ARIA_DESCRIBEDBY = "aria-describedby";

  public static final String HTML_ATTR_ARIA_IGNORE_PREFIX = "P_arialabel_";

  public static final String HTML_ATTR_ARIA_LABEL = "aria-label";

  public static final String HTML_ATTR_ARIA_ROLE = "role";

  public static final String ARIA_ROLE_TEXTBOX = "textbox";

  public static final String ARIA_ROLE_LISTBOX = "listbox";

  public static final String ARIA_ROLE_PRESENTATION = "presentation";

  public static final String ARIA_ROLE_GRID = "grid";

  public static final String ARIA_ROLE_ROW = "row";

  public static final String ARIA_ROLE_GRIDCELL = "gridcell";

  public static final String ARIA_ROLE_ROWHEADER = "rowheader";

  public static final String ARIA_ROLE_COLUMNHEADER = "columnheader";

  public static final String HTML_ATTR_JUSTIFY = "justify";

  public static final String HTML_ATTR_CENTER = "center";

  public static final String HTML_ATTR_PRESERVE_ONLY = "preserveonly";

  public static final String HTML_ATTR_DEFAULT_LINE_HEIGHT = "defaultLineHeightSet";

  public static final String HTML_ATTR_SPACE_PLACEHOLDER = "spacePlaceholder";

  public static final String HTML_ELEMENT_DIV = "div";

  public static final String HTML_ELEMENT_LABEL = "label";

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

  public static final String HTML_ELEMENT_STYLE_P = "P";

  public static final String HTML_CLASS_TEXT_P = "text_p";

  public static final String HTML_CLASS_TEXT_LIST = "text_list";

  public static final String HTML_CLASS_TEXT_LIST_ITEM = "text_list_item";

  public static final String HTML_CLASS_TEXTLIST_HEADER = "text_list-header";

  public static final String HTML_CLASS_DRAW_PAGE = "draw_page";

  public static final String HTML_CLASS_DRAW_IMAGE = "draw_image";

  public static final String HTML_CLASS_PLACEHOLDER = "placeholder";

  public static final String HTML_CLASS_DRAW_SHAPE_CLASSES = "draw_shape_classes";

  public static final String HTML_CLASS_DRAW_CUSTOM_SHAPE = "draw_custom-shape";

  public static final String HTML_ATTR_PAGE_TEMPLATE_NAME = "page_template_name";

  public static final String HTML_ATTR_PAGE_NUMBER_FIELD = "page-number";

  public static final String HTML_ATTR_DATE_FIELD_TYPE = "date";

  public static final String HTML_ATTR_TIME_FIELD_TYPE = "time";

  public static final String HTML_ATTR_DRAW_MASTER_PAGE_NAME = "draw_master-page-name";

  public static final String HTML_ATTR_TABLE_DEFAULT_CELL_STYLE_NAME = "table_default-cell-style-name";

  public static final String HTML_ATTR_CONTEXTBOXTYPE = "contentBoxType";

  public static final String HTML_ATTR_MARGIN_TOP = "margin-top";

  public static final String HTML_ATTR_MARGIN_BOTTOM = "margin-bottom";

  public static final String HTML_ATTR_MARGIN = "margin";

  public static final String HTML_ATTR_PADDING = "padding";

  public static final String HTML_ATTR_PRESENTATION_CLASS = "presentation_class";

  public static final String HTML_ATTR_UNGROUPABLE = "ungroupable";

  public static final String HTML_ATTR_DRAW_LAYER = "draw_layer";

  public static final String HTML_ATTR_TEXT_ANCHOR_TYPE = "text_anchor-type";

  public static final String HTML_ATTR_CELLSPACING = "cellspacing";

  public static final String HTML_ATTR_TABLE_CELL = "table_table-cell";

  public static final String HTML_ATTR_TABLE_ROW = "table_table-row";

  public static final String HTML_ATTR_HIDE_SLIDE = "hideInSlideShow";

  public static final String HTML_ATTR_PRESERVE_GR_STYLE = "preserveclassgrstyle=";

  public static final String HTML_ATTR_PRESERVE_P_STYLE = "preserveclassPstyle=";

  public static final String HTML_VALUE_DRAWING = "drawing";

  public static final String HTML_VALUE_GROUP = "group";

  public static final String HTML_VALUE_YES = "yes";

  public static final String HTML_VALUE_TRUE = "true";

  public static final String HTML_VALUE_SUB = "sub";

  public static final String HTML_VALUE_SUPER = "super";

  public static final String HTML_VALUE_G_DRAW_FRAME = "g_draw_frame";

  public static final String HTML_VALUE_DRAW_FRAME = "draw_frame";

  public static final String HTML_VALUE_DRAW_PAGE = "draw_page";

  public static final String HTML_VALUE_BACKGROUND_IMAGE = "backgroundImage";

  public static final String HTML_VALUE_IMAGE_DRAW_FRAME = "image_draw_frame";

  public static final String HTML_VALUE_DRAW_FRAME_CLASSES = "draw_frame_classes";

  public static final String HTML_VALUE_DRAW_TEXT_BOX = "draw_text-box";

  public static final String HTML_VALUE_LAYOUT = "layout";

  public static final String HTML_VALUE_BACKGROUND = "backgroundobjects";

  public static final String HTML_VALUE_OUTLINE = "outline";

  public static final String HTML_VALUE_PARAGRAPH = "paragraph";

  public static final String HTML_VALUE_GRAPHIC = "graphic";

  public static final String HTML_VALUE_NONE = "none";

  public static final String HTML_VALUE_SLIDEWRAPPER = "slideWrapper";

  public static final String HTML_VALUE_CONTENT_BOX_DATA_NODE = "contentBoxDataNode";

  public static final String HTML_VALUE_DIV2_STYLE = "position:relative;left:0%;top:0%;height: 100%; width: 100%; cursor: pointer;";

  public static final String HTML_VALUE_DIV3_STYLE = "position:absolute;left:0%;top:0%;width:100%;height:100%;";

  public static final String HTML_VALUE_DIV4_STYLE = "position:absolute;top:0%;left:0%;width:100%;height:100%;";

  public static final String HTML_VALUE_DIV5_STYLE = "position:relative;top:0%;left:0%;width:100%;height:100%; cursor: pointer;";

  public static final String HTML_VALUE_TABLE_DIV_STYLE = "display:table; height:100%; width:100%; table-layout:fixed;";

  public static final String HTML_VALUE_CELL_DIV_STYLE = "display:table-cell; height:100%; width:100%; margin-top:0;margin-bottom:0;";

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

  public static final String CSS_LIST_STYLE_TYPE = "list-style-type";

  public static final String CSS_LIST_STYLE_IMG = "list-style-image";

  public static final String CSS_LIST_STYLE_POSITION = "list-style-position";

  public static final String CSS_FONT_SIZE = "font-size";

  public static final String CSS_FONT_STYLE = "font-style";

  public static final String CSS_FONT_WEIGHT = "font-weight";

  public static final String CSS_FONT_VARIANT = "font-variant";

  public static final String CSS_FONT_NAME = "font-name";

  public static final String CSS_FONT_FAMILY = "font-family";

  public static final String CSS_FONT_COLOR = "color";

  public static final String CSS_LINE_HEIGHT = "line-height";

  public static final String CSS_BACKGROUND_COLOR = "background-color";

  public static final String CSS_BORDER = "border";

  public static final String CSS_BORDER_RIGHT = "border-right";

  public static final String CSS_BORDER_LEFT = "border-left";

  public static final String CSS_BORDER_TOP = "border-top";

  public static final String CSS_BORDER_BOTTOM = "border-bottom";

  public static final String CSS_VERTICAL_ALIGN = "vertical-align";

  public static final String CSS_TEXT_ALIGN = "text-align";

  public static final String CSS_TEXT_SHADOW = "text-shadow";

  public static final String CSS_TEXT_TRANSFORM = "text-transform";

  public static final String CSS_TEXT_DECORATION = "text-decoration";

  public static final String CSS_ROW_HEIGHT = "rowHeight";

  public static final String CSS_COL_WIDTH = "colWidth";

  public static final String CSS_POSITION_RELATIVE = "position:relative;";

  public static final String CSS_POSITION_ABSOLUTE = "position:absolute;";

  public static final String CSS_ATTR_VISIBILITY = "visibility";

  public static final String CSS_VALUE_HIDDEN = "hidden";

  public static final String CSS_VALUE_VISIBLE = "visible";

  // =====================================================================
  // SVG related
  // =====================================================================
  public static final String SVG_ELEMENT_DEFS = "defs";

  public static final String SVG_ELEMENT_MARKER = "marker";

  public static final String SVG_ATTR_VIEWBOX = "viewBox";

  public static final String SVG_ATTR_SVG = "svg";

  public static final String SVG_ATTR_WIDTH = "width";

  public static final String SVG_ATTR_HEIGHT = "height";

  public static final String SVG_ATTR_LINE = "line";

  public static final String SVG_ELEMENT_PATH = "path";

  public static final String SVG_ATTR_FILL = "fill";

  public static final String SVG_ATTR_POINTS = "points";

  public static final String SVG_ATTR_CLIP_PATH = "clip-path";

  public static final String SVG_ATTR_GROUP = "g";

  public static final String SVG_ATTR_D = "d";

  public static final String SVG_ATTR_M = "m";

  public static final String SVG_ATTR_V = "v";

  public static final String SVG_ATTR_H = "h";

  public static final String SVG_ATTR_TRANSFORM = "transform";

  public static final String SVG_ATTR_X = "x";

  public static final String SVG_ATTR_Y = "y";

  public static final String SVG_ATTR_X1 = "x1";

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

  public static final String SVG_HEIGHT_ADJUSTMENT = "height-adjustment";

  public static final String SVG_WIDTH_ADJUSTMENT = "width-adjustment";

  public static final String SVG_CONNECTOR = "connector";

  // =====================================================================
  // Miscellaneous
  // =====================================================================
  public static final String ALIGNMENT_START = "start";

  public static final String ALIGNMENT_CENTER = "center";

  public static final String ALIGNMENT_END = "end";

  public static final String ALIGNMENT_RIGHT = "right";

  public static final String ALIGNMENT_LEFT = "left";

  public static final String ALIGNMENT_TOP = "top";

  public static final String SYMBOL_COMMA = ",";

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

  public static final String DEFAULT_TEMPLATE = "_28_Default_29__20_Title_20_Master";

  public static final String DEFAULT_TEXT_STYLE = "Default_20_Text";

  public static final String DEFAULT_BULLET_P_NAME = "P_B_Concord_Default";

  public static final String DEFAULT_NUMBER_P_NAME = "P_L_Concord_Default";

  public static final String TITLE = "title";

  public static final String PAGE = "page";

  public static final String TEXT = "text";

  public static final String DEFAULT = "default";

  public static final String UNHANDLED_ERROR = "100";

  public static final String DP224 = "dp224";

  public static final String DRAW_PAGE_ID = "dp";

  public static final String DRAW_PAGE_FIRST_ID = "dp1";

  public static final String DRAW_CUSTOM_SHAPE_ELEMENT_HORIZONTAL = "DCSEHorizontal";

  public static final String DRAW_CUSTOM_SHAPE_ELEMENT_VERTICAL = "DCSEVertical";

  public static final String ZERO = "0";

  public static final String SUPER_SUB_SCRIPT_FONT_SIZE = "58%";

  public static final String SUPER_SUB_SCRIPT_FONT_ADJUST = "33%";

  public static final String HIDE_IN_IE = "hideInIE";

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

  public static final String CONVERTED_POLY_LINE = "convertedPolyLine";

  // Identifier used to identify the style as a Concord Duplicate
  public static final String STYLE_COPY_IDENTIFIER = "CDUP";

  public static final String TEXT_CONSECUTIVE_NUMBERING = "text:consecutive-numbering";

  public static final String STYLE_FLOW_WITH_TEXT = "style:flow-with-text";

  public static final String CONFIG_CONFIG_ITEM = "config:config-item";

  public static final String CONFIG_NAME = "config:name";

  public static final String PRODUCT_NAME = "HCL Docs 2.0";

  public static final String STYLE_COUNTRY_ASIAN = "style:country-asian";

  public static final String STYLE_LANGUAGE_ASIAN = "style:language-asian";

  public static final String DC_LANGUAGE = "dc:language";

  public static final String FO_COUNTRY = "fo:country";

  public static final String FO_LANGUAGE = "fo:language";

  public static final String TEXT_RELATIVE_CONTEXT_CHAPTER_CON = "text:relative_context_chapter_con";

  public static final String TEXT_RELATIVE_CONTEXT_CHAPTER_REF = "text:relative_context_chapter_ref";

  public static final String TEXT_REF_FORMAT = "text:reference-format";

  public static final String RL_TB = "rl-tb";

  public static final String LR_TB = "lr-tb";
}

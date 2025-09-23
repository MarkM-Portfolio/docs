({
	//actionNew dojo menu
	newName : "新建",
	newTooltip : "创建文档",
	WARN_INTERNAL : "创建文件后，不可以更改许可权以便与组织外部的其他人员共享。",
	newCommunityInfo : "社区成员可以编辑此文件。",
  	CANCEL : "取消",
  	DOWNLOAD_EMPTY_TITLE : "无法下载此文件",
  	DOWNLOAD_EMPTY_OK : "关闭",
  	DOWNLOAD_EMPTY_CONTENT1 : "没有此文件的发布版本可供下载。",
  	DOWNLOAD_EMPTY_CONTENT2 : "可以从 Docs 编辑器发布版本。",
  	DOWNLOAD_EMPTYVIEW_TITLE : "无法下载此文件",
  	DOWNLOAD_EMPTYVIEW_OK : "关闭",
 	DOWNLOAD_EMPTYVIEW_CONTENT1 : "没有此文件的发布版本可供下载。",
  	DOWNLOAD_EMPTYVIEW_CONTENT2 : "可请求此文件的所有者发布一个文件版本。",  
  	DOWNLOAD_NEWDRAFT_TITLE : "下载版本",
  	DOWNLOAD_NEWDRAFT_OK : "下载版本",

  	DOWNLOAD_NEWDRAFT_LAST_EDITED: {
		DAY: "上次编辑日期：${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "上次编辑日期：${date}",	
		TODAY: "今天的上次编辑时间：${time}",	
		YEAR: "上次编辑日期：${date_long}",	
		YESTERDAY:	"昨天的上次编辑时间：${time}"
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT1: {
		DAY: "检测到一份更新的草稿，上次编辑日期为 ${date}。",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "检测到一份更新的草稿，上次编辑日期为 ${date}。",	
		TODAY: "检测到一份更新的草稿，上次编辑时间为今天 ${time}。",	
		YEAR: "检测到一份更新的草稿，上次编辑日期为 ${date_long}。",	
		YESTERDAY:	"检测到一份更新的草稿，上次编辑时间为昨天 ${time}。"
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT2: {
		DAY: "确定要继续下载于 ${date} 发布的版本吗？",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "确定要继续下载于 ${date} 发布的版本吗？",	
		TODAY: "确定要继续下载于今天 ${time} 发布的版本吗？",	
		YEAR: "确定要继续下载于 ${date_long} 发布的版本吗？",	
		YESTERDAY:	"确定要继续下载于昨天 ${time} 发布的版本吗？"
  	},
  	
  	DOWNLOAD_NEWDRAFT_CONFIRM_CONTENT: "这是 Docs 文件的最新可下载版本。要了解是否存在草稿格式的更高版本，请联系文件所有者。",

  	VIEW_FILE_DETAILS_LINK : "查看文件详细信息",
  	OPEN_THIS_FILE_TIP: "打开此文件",
  
	//newDocument 
	newDocumentName : "文档",
	newDocumentTooltip : "新建文档",
	newDocumentDialogTitle : "新建文档",
	newDocumentDialogContent : "为这个无标题的文档提供一个名称。",
	newDocumentDialogBtnOK : "创建",
	newDocumentDialogBtnOKTitle : "创建文档",
	newDocumentDialogInitialName : "无标题的文档",
	newDocumentDialogExtensions: {	
		doc: "Microsoft Word 97-2003(*.doc)",
		odt: "OpenDocument Text(*.odt)"
  	},
	newDocumentDialogBtnCancel : "取消",
	newDocumentDialogNamepre : "*名称：",
	newDocumentDialogDocumentTypePre : "类型：",
	newDocumentDialogDocumentChangeTypeLink : "更改缺省文件扩展名",
	newDocumentDialogDupErrMsg : "发现重复的文件名。请输入一个新名称。",
	newDocumentDialogIllegalErrMsg : "${0} 是无效的文档标题，请指定其他标题。",
	newDocumentDialogNoNameErrMsg : "需要文档名。",
	newDocumentDialogNoPermissionErrMsg : "无法创建该文件，因为您不具有编辑者访问权。请与管理员联系。",
	newDocumentDialogServerErrMsg : "Docs 服务器不可用。请联系服务器管理员，稍后重试。",
	newDocumentDialogServerErrMsg2 : "Connections 服务器不可用。请联系服务器管理员，稍后重试。",
	newDocumentDialog_TRIM_LONG_DOCUMENTNAME : "缩短文档名？",
	newDocumentDialog_WARN_LONG_DOCUMENTNAME : "文档名太长。",
	newDialogProblemidErrMsg : "请将此问题报告给您的管理员。",
	newDialogProblemidErrMsg_tip : "请将此问题报告给您的管理员。${shown_action}",
	newDialogProblemidErrMsgShow: "单击以显示详细信息",
	newDialogProblemidErrMsgHide: "单击以隐藏",
	newDocumentDialogTargetPre: "*保存到：",
	newDocumentDialogTargetCommunity: "此社区",
	newDocumentDialogTargetMyFiles: "我的文件",

	//newSpreadsheet 
	newSheetName : "电子表格",
	newSheetTooltip : "新建电子表格",
	newSheetDialogTitle : "新建电子表格",
	newSheetDialogBtnOKTitle : "创建电子表格",
	newSheetDialogInitialName : "无标题电子表格",
	newSheetDialogExtensions: {	
		xls: "Microsoft Excel 97-2003(*.xls)",
		ods: "OpenDocument Spreadsheet(*.ods)"
  	},

	//newPresentation 
	newPresName : "演示文稿",
	newPresTooltip : "新建演示文稿",
	newPresDialogTitle : "新建演示文稿",
	newPresDialogBtnOKTitle : "创建演示文稿",
	newPresDialogInitialName : "无标题的演示文稿",
	newPresDialogExtensions: {	
		ppt: "Microsoft PowerPoint 97-2003(*.ppt)",
		odp: "OpenDocument Presentation(*.odp)"
  	},

	//actionNewFrom
	newFromName : "创建文件",
	newFromDialogName : "根据文件新建",
	newFromTooltip: "使用该文件作为模板创建新文件",
	newFromDocTip : "根据模板文件创建文档（DOC、DOCX 或 ODT 文件）。您可以在 Docs 中联机编辑这些文档。",
	newFromSheetTip : "根据模板文件创建电子表格（XLS、XLSX 或 ODS 文件）。您可以在 Docs 中联机编辑这些电子表格。",
	newFromPresTip : "根据模板文件创建演示文稿（PPT、PPTX 或 ODP 文件）。您可以在 Docs 中联机编辑这些演示文稿。",

	//actionEdit
	editName : "在 Docs 中编辑",
	editTooltip : "在 Docs 中编辑",
	editWithDocsDialogTitle : "使用 Docs 开始联机编辑？",
	editWithDocsDialogContent1 : "Docs 使您可以与其他人同时在“文件”中开展协作，并可立即看到更改。您也可以私下联机工作。",
	editWithDocsDialogContent2 : "您不需要上载文档的新版本。如果所有编辑都联机进行，那么会保护您的工作和注释。",
	//editWithDocsDialogMore : "Learn More",
	editWithDocsDialogBtnOKTitle : "联机编辑",
	//editLockedFile: "You cannot edit this file because it is locked by other editors.",
	//joinLockedSession: "You cannot join the co-editing session because this file is locked by others.",

	//actionView
	viewName : "查看",
	viewTooltip : "在浏览器预览文件",

	//doc too large
	docTooLargeTitle : "文档过大。",
	docTooLargeDescription : "要编辑的文档过大。<br />确保 *.odt、*.doc <br />或 *.docx 格式的文件的大小不超过 2048 K。",
	docTooLargeCancelBtn: "取消",
	//exportPDF is dropped in #sprint4

	//current editors
	currentEditing : "当前正在编辑：",
		
	//Sheet title
	sheetTitle0: "Sheet1",
	sheetTitle1: "Sheet2",
	sheetTitle2: "Sheet3",
	
	//downloas as MS format and PDF
	downloadAsMS: "作为 Microsoft Office 格式下载",
	downloadAsPDF: "作为 PDF 文件下载",
	downloadWithUnsavedDraftTitle: "未完成的草稿",
	downloadWithUnsavedDraftReadersOkLabel: "确定",
	downloadWithUnsavedDraftDescription: "本版本可能不包含最新的联机编辑。单击“保存”以创建新的版本并下载。单击“取消”以继续而不保存。",
	downloadWithUnsavedDraftReadersDescription: "本版本可能不包含最新的编辑。所下载文档的版本会是文档编辑者上次保存的版本。要继续吗？",

	//draft tab

	draft_tab_title : "草稿",
	draft_created : "基于 V${1} 的 ${0}",
	draft_published : "已发布草稿中的最新编辑。",
	draft_beiing_edited : "此文件当前由 ${user} 在 Web 上编辑。",
	//draft_editor_valid : "Only people who are assigned as editors of the file can work with a draft.",
	draft_doctype_valid : "只能编辑作为 Docs 文档的文件。",
	draft_unpublished_tip : "存在尚未发布为版本的草稿编辑。${publish_action}",
	draft_save_action_label : "发布版本",
	draft_not_found : "此文件没有草稿编辑。",
	draft_latest_edit : "最新编辑：",
	draft_cur_editing : "当前正在编辑：",
	draft_edit_link : "编辑",
	//draft_last_edit : "Edited ${0}",
	
	// file summary
	docs_indicator_text: "这是 Docs 文件。所有编辑都必须联机进行。",
	nonentitlement_docs_indicator_text: "仅当您已购买 Docs 权利后，才可以联机编辑此文件。",
	LABEL_PUBLISHED_OTHER: {
		DAY: "${user} 发布日期：${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} 发布日期：${date}",	
		TODAY: "${user} 今天发布时间：${time}",	
		YEAR: "${user} 发布日期：${date_long}",	
		YESTERDAY:	"${user} 昨天发布时间：${time}"
	},
	LABEL_PUBLISHED: {
		DAY: "发布日期：${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "发布日期：${date}",	
		TODAY: "今天发布时间：${time}",	
		YEAR: "发布日期：${date_long}",	
		YESTERDAY:	"昨天发布时间：${time}"
	},
	LABEL_VERSION_PUBLISHED_OTHER: {
		DAY: "${user} 发布版本的日期：${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} 发布版本的日期：${date}",	
		TODAY: "${user} 今天发布版本的时间：${time}",	
		YEAR: "${user} 发布版本的日期：${date_long}",	
		YESTERDAY:	"${user} 昨天发布版本的时间：${time}"
	},
	LABEL_VERSION_PUBLISHED: {
		DAY: "版本发布日期：${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "版本发布日期：${date}",	
		TODAY: "今天版本发布时间：${time}",	
		YEAR: "版本发布日期：${date_long}",	
		YESTERDAY:	"昨天版本发布时间：${time}"
	},
	LABEL_CREATED_OTHER: {
		DAY: "${user} 创建日期：${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} 创建日期：${date}",	
		TODAY: "${user} 今天创建时间：${time}",	
		YEAR: "${user} 创建日期：${date_long}",	
		YESTERDAY:	"${user} 昨天创建时间：${time}"
	},
	LABEL_CREATED: {
		DAY: "创建日期：${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "创建日期：${date}",	
		TODAY: "今天创建时间：${time}",	
		YEAR: "创建日期：${date_long}",	
		YESTERDAY:	"昨天创建时间：${time}"
	},
    LABEL_DRAFT_MODIFIED_OTHER: {
		DAY: "${user} 编辑草稿日期：${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} 编辑草稿日期：${date}",	
		TODAY: "${user} 今天编辑草稿的时间：${time}",	
		YEAR: "${user} 编辑草稿日期：${date_long}",	
		YESTERDAY:	"${user} 昨天编辑草稿的时间：${time}"
	},
	LABEL_DRAFT_MODIFIED: {
		DAY: "草稿编辑日期：${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "草稿编辑日期：${date}",	
		TODAY: "今天的草稿编辑时间：${time}",	
		YEAR: "草稿编辑日期：${date_long}",	
		YESTERDAY:	"昨天的草稿编辑时间：${time}"
	},
	LABEL_DRAFT_CREATED_OTHER: {
		DAY: "${user} 创建草稿的日期：${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} 创建草稿的日期：${date}",	
		TODAY: "${user} 今天创建草稿的时间：${time}",	
		YEAR: "${user} 创建草稿的日期：${date_long}",	
		YESTERDAY:	"${user} 昨天创建草稿的时间：${time}"
	},
	LABEL_DRAFT_CREATED: {
		DAY: "草稿创建日期：${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "草稿创建日期：${date}",	
		TODAY: "今天的草稿创建时间：${time}",	
		YEAR: "草稿创建日期：${date_long}",	
		YESTERDAY:	"昨天的草稿创建时间：${time}"
	},
	LABEL_DRAFT_TAB_EDIT: {
		DAY: "编辑日期：${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "编辑日期：${date}",	
		TODAY: "今天编辑时间：${time}",	
		YEAR: "编辑日期：${date_long}",	
		YESTERDAY:	"昨天编辑时间：${time}"
	},
	//unsupported browser detection
	unSupporteBrowserTitle: "浏览器不受支持",
	unSupporteBrowserContent1: "抱歉，您的浏览器可能无法与 Docs 一起使用。为了实现最佳效果，请尝试使用以下某种受支持的浏览器。",
	unSupporteBrowserContent2: "当然，您可以继续使用自己的浏览器，但可能无法体验 Docs 的所有功能。",
	unSupporteBrowserContent3: "不再显示此消息。",
	
	//introduction box
	INTRODUCTION_BOX_TITLE : "“文件”和 Docs 中有哪些新增功能？",
	INTRODUCTION_BOX_BLURB: "上载并共享您的文件。可使用 Docs 单独或协同创建和编辑文件。在文件夹中组织文件，跟踪对文件的更改，加入您的收藏夹。",
	INTRODUCTION_BOX_BLURB_LOG_IN: "请登录以开始使用“文件”和 Docs。",
	INTRODUCTION_BOX_BLURB_UPLOAD: '单击“上载文件”以添加文件。单击“新建”以使用 Docs 创建一个文件。',
	INTRODUCTION_BOX_BLURB_UPLOAD_DOCS: '单击“上载文件”添加文件。单击“新建”以使用 Docs 创建一个文件。',
	//INTRODUCTION_BOX_BLURB_HELP: "",
    //INTRODUCTION_BOX_BLURB_HELP: "Tip: Click ", {helpLink} to see help on a specific feature or click Help to view all help topics.",
	INTRODUCTION_BOX_CLOSE: '关闭“欢迎使用‘文件’和 Docs”部分',
	//INTRODUCTION_BOX_LEARN_MORE: "Learn More",
	//INTRODUCTION_BOX_TAKE_TOUR: "Watch demo",
	//INTRODUCTION_BOX_HELP_ALT: "Help"
	INTRODUCTION_BOX_46_BLURB: "创建并就内容与同事协作。了解如何：",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM1: "添加您自己的文件。",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM2: "开始联机、实时、单独或共同编辑。",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM3: "上载和编辑文档、电子表格或演示文稿。",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM1: "{0}添加您自己的文件{1}。",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM2: "{0}开始联机、实时、单独或共同编辑{1}。",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM3: "{0}上载和编辑文档、电子表格或演示文稿{1}。",
	

	//Download conform for old files, which does not include latest changes in draft
	//UnsavedDraftConfirm : "This file has been edited by LotusLive Symphony. Current LotusLive Symphony has limitation <br/> saving the content back to it's original format. The document content you can download <br/> is still the same as original version. <br/><br/> Do you still want to download? <br/>",
	//UnsavedDraftBtnContinue : "Continue",
	//UnsavedDraftBtnContinueTitle: "Continue to download the original file",
	//UnsavedDraftBtnCancel : "Cancel"
	
	
	//export pdf page setup
	PAGE_SETUP_TITLE: "页面设置",
	PAGE_SETUP_BTN_OK: "确定",
	ORIENTATION_LABEL: "方向",
	PORTRAIT: "纵向",
	LANDSCAPE: "横向",	
	MARGINS_LABEL: "页边距",
	TOP: "顶部：",
	TOP_DESC:"上页边距（厘米）",
	TOP_DESC2:"上页边距（英寸）",
	BOTTOM: "底部：",
	BOTTOM_DESC:"下页边距（厘米）",
	BOTTOM_DESC2:"下页边距（英寸）",
	LEFT: "左侧：",
	LEFT_DESC:"左页边距（厘米）",
	LEFT_DESC2:"左页边距（英寸）",	
	RIGHT: "右侧：",
	RIGHT_DESC:"右页边距（厘米）",
	RIGHT_DESC2:"右页边距（英寸）",
	PAPER_FORMAT_LABEL: "纸张格式",
	PAPER_SIZE_LABEL: "纸张大小：",
	HEIGHT: "高度：",
	HEIGHT_DESC:"页面高度（厘米）",
	HEIGHT_DESC2:"页面高度（英寸）",	
	WIDTH: "宽度：",
	WIDTH_DESC:"页面宽度（厘米）",
	WIDTH_DESC2:"页面宽度（英寸）",
	CM_LABEL: "厘米",
	LETTER: "信纸",
	LEGAL: "标准法律用纸",
	TABLOID: "小报",
	USER: "用户",
	SIZE1: "信封 #6 3/4",
	SIZE2: "信封 Monarch",
	SIZE3: "信封 #9",
	SIZE4: "信封 #10",
	SIZE5: "信封 #11",
	SIZE6: "信封 #12",
	SIZE7: "16 开",
	SIZE8: "32 开",
	SIZE9: "大 32 开",
	DISPLAY_OPTION_LABEL: "显示选项",
	HEADER: "页眉",
	HEADER_DESC:"页眉高度（厘米）",	
	FOOTER: "页脚",
	FOOTER_DESC:"页脚高度（厘米）",
	GRIDLINE: "网格线",
	TAGGED_PDF: "带标记的 PDF",
	PAGE_LABEL: "页面顺序",
	PAGE_TYPE1: "从上向下，再向右",
	PAGE_TYPE2: "从左向右，再向下",
	PAGE_SETUP_INVALID_MSG: "输入无效并已自动更正。如果需要其他结果，请尝试其他值。",
	
	//Docs publish message
	service_unavailable_content: "Docs 服务不可用。目前无法处理您的请求。请稍后重试，或联系您的系统管理员。",
	viewaccess_denied_content: "您无权查看该文件。必须公开或与您共享该文件。",
	editaccess_denied_content: "您无权编辑此文件。您必须有权使用 Docs 并且该文件必须与您共享或者您必须具有该文件的编辑者访问权。",
	doc_notfound_content: "想要访问的文档已删除或移动。请检查链接是否正确。",
	repository_out_of_space_content: "没有足够的空间来保存新的文档。请除去其他文件以释放足够的空间来保存此文档。",
	fileconnect_denied_content: "Docs 无法连接到文件存储库。请稍后重试，或联系您的系统管理员。",
	convservice_unavailable_content: "Docs 转换服务不可用。目前无法处理您的请求。请稍后重试，或联系您的系统管理员。",
	doc_toolarge_content: "您要访问的文档过大。",
	conversion_timeout_content: "此时，文档转换耗时过长。请稍后重试。",
	storageserver_error_content: "服务器当前不可用。目前无法处理您的请求。请稍后重试，或联系您的系统管理员。",
	server_busy_content:"请稍等片刻，然后重试。",
	publish_locked_file: "您无法将此文件发布为新版本，因为它已被锁定，但是，您的内容会自动保存到草稿中。",
	publishErrMsg: "未发布此版本。文件可能太大，或服务器可能已超时。请重试，或者取消操作，然后请求您的管理员查看服务器日志以确定问题。",
	publishErrMsg_Quota_Out: "没有足够的空间来发布此文档的新版本。请除去其他文件，以释放足够的空间来发布此文档。",
	publishErrMsg_NoFile: "由于该文档已由其他人删除，因此发布失败。",
	publishErrMsg_NoPermission: "无法发布新版本，因为您没有针对此文件的编辑者许可权。请联系该文件的所有者以获取编辑者许可权，然后重试。"
		
})


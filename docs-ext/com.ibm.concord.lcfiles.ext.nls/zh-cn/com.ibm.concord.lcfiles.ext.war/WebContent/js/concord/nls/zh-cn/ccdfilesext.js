({
	//actionNew dojo menu
	newName : "新建",
	newTooltip : "创建文档",

	//newDocument 
	newDocumentName : "文档",
	newDocumentTooltip : "创建文档",
	newDocumentDialogTitle : "创建文档",
	newDocumentDialogContent : "请为该无标题草稿提供一个新名称",
	newDocumentDialogBtnOK : "创建",
	newDocumentDialogBtnOKTitle : "创建文档",
	newDocumentDialogBtnCancel : "取消",
	newDocumentDialogNamepre : "名称 (*)",
	newDocumentDialogInitialName : "无标题的文档",
	newDocumentDialogDupErrMsg : "发现重复的文件名。请输入一个新名称。",
	newDocumentDialogIllegalErrMsg : "${0} 是无效的文档标题，请指定其他标题。",
	newDocumentDialogServerErrMsg : "HCL Docs 服务器不可用。请联系服务器管理员，稍后重试。",
	newDocumentDialogServerErrMsg2 : "HCL Connections 服务器不可用。请联系服务器管理员，稍后重试。",


	//newSpreadsheet 
	newSheetName : "电子表格",
	newSheetTooltip : "创建电子表格",
	newSheetDialogTitle : "创建电子表格",
	newSheetDialogBtnOKTitle : "创建电子表格",
	newSheetDialogInitialName : "无标题电子表格",

	//newPresentation 
	newPresName : "演示文稿",
	newPresTooltip : "创建演示文稿",
	newPresDialogTitle : "创建演示文稿",
	newPresDialogBtnOKTitle : "创建演示文稿",
	newPresDialogInitialName : "无标题的演示文稿",

	//actionNewFrom
	newFromName : "创建文件",
	newFromTooltip: "使用该文件作为模板创建新文件",
	newFromDocTip : "使用当前文件作为模板创建文档。",
	newFromSheetTip : "使用当前文件作为模板创建电子表格。",

	//actionEdit
	editName : "编辑",
	editTooltip : "编辑",

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
	draft_beiing_edited : "此文件当前由 ${user} 在 Web 上编辑。",
	draft_editor_valid : "只有指定为文件编辑者的人员才可以处理草稿。",
	draft_doctype_valid : "只能编辑作为 HCL Docs 文档的文件。",
	draft_unpublished_tip : "存在尚未保存为版本的草稿编辑。",
	draft_save_action_label : "保存",
	draft_not_found : "此文件没有草稿编辑。",
	draft_latest_edit : "最新编辑：",
	draft_cur_editing : "当前正在编辑：",
	
	

	//unsupported browser detection
	unSupporteBrowserTitle: "浏览器不受支持",
	unSupporteBrowserContent1: "抱歉，您的浏览器可能无法与 HCL Docs 一起使用。为实现最佳效果，请尝试使用某个受支持的浏览器。",
	unSupporteBrowserContent2: "当然，您可以继续使用自己的浏览器，但可能无法体验 HCL Docs 的所有功能。",
	unSupporteBrowserContent3: "不再显示此消息。"
		
	//Download conform for old files, which does not include latest changes in draft
	//UnsavedDraftConfirm : "This file has been edited by LotusLive Symphony. Current LotusLive Symphony has limitation <br/> saving the content back to it's original format. The document content you can download <br/> is still the same as original version. <br/><br/> Do you still want to download? <br/>",
	//UnsavedDraftBtnContinue : "Continue",
	//UnsavedDraftBtnContinueTitle: "Continue to download the original file",
	//UnsavedDraftBtnCancel : "Cancel"
})

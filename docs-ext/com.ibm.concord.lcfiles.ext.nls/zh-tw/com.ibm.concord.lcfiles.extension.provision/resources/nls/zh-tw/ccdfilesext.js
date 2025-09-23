({
	//actionNew dojo menu
	newName : "新建",
	newTooltip : "建立文件",
	WARN_INTERNAL : "建立檔案之後，即無法變更許可權來與組織外的其他人分享。",
	newCommunityInfo : "社群成員能夠編輯此檔案。",
  	CANCEL : "取消",
  	DOWNLOAD_EMPTY_TITLE : "無法下載檔案",
  	DOWNLOAD_EMPTY_OK : "關閉",
  	DOWNLOAD_EMPTY_CONTENT1 : "此檔案沒有發佈版本可供下載。",
  	DOWNLOAD_EMPTY_CONTENT2 : "可從 Docs 編輯器發佈的版本。",
  	DOWNLOAD_EMPTYVIEW_TITLE : "無法下載檔案",
  	DOWNLOAD_EMPTYVIEW_OK : "關閉",
 	DOWNLOAD_EMPTYVIEW_CONTENT1 : "此檔案沒有發佈版本可供下載。",
  	DOWNLOAD_EMPTYVIEW_CONTENT2 : "請洽詢檔案擁有者發佈此檔案的版本。",  
  	DOWNLOAD_NEWDRAFT_TITLE : "下載版本",
  	DOWNLOAD_NEWDRAFT_OK : "下載版本",

  	DOWNLOAD_NEWDRAFT_LAST_EDITED: {
		DAY: "前次編輯日期：${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "前次編輯日期：${date}",	
		TODAY: "前次編輯時間：今天${time}",	
		YEAR: "前次編輯日期：${date_long}",	
		YESTERDAY:	"前次編輯時間：昨天的${time}"
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT1: {
		DAY: "偵測到新版草稿，前次編輯日期：${date}。",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "偵測到新版草稿，前次編輯日期：${date}。",	
		TODAY: "偵測到新版草稿，前次編輯時間：今天${time}。",	
		YEAR: "偵測到新版草稿，前次編輯日期：${date_long}。",	
		YESTERDAY:	"偵測到新版草稿，前次編輯時間：昨天${time}。"
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT2: {
		DAY: "確定要繼續下載 ${date} 發佈的版本嗎？",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "確定要繼續下載 ${date} 發佈的版本嗎？",	
		TODAY: "確定要繼續下載今天${time} 發佈的版本嗎？",	
		YEAR: "確定要繼續下載 ${date_long} 發佈的版本嗎？",	
		YESTERDAY:	"確定要繼續下載昨天${time} 發佈的版本嗎？"
  	},
  	
  	DOWNLOAD_NEWDRAFT_CONFIRM_CONTENT: "這是 Docs 檔案可供下載的最新版本。若要確認是否有草稿格式的更新版本，請聯絡檔案擁有者。",

  	VIEW_FILE_DETAILS_LINK : "檢視檔案詳細資訊",
  	OPEN_THIS_FILE_TIP: "開啟此檔案",
  
	//newDocument 
	newDocumentName : "文件",
	newDocumentTooltip : "新建文件",
	newDocumentDialogTitle : "新建文件",
	newDocumentDialogContent : "請提供此未命名文件的名稱。",
	newDocumentDialogBtnOK : "建立",
	newDocumentDialogBtnOKTitle : "建立文件",
	newDocumentDialogInitialName : "未命名文件",
	newDocumentDialogExtensions: {	
		doc: "Microsoft Word 97-2003(*.doc)",
		odt: "OpenDocument 文字(*.odt)"
  	},
	newDocumentDialogBtnCancel : "取消",
	newDocumentDialogNamepre : "*名稱：",
	newDocumentDialogDocumentTypePre : "類型：",
	newDocumentDialogDocumentChangeTypeLink : "變更預設檔案副檔名",
	newDocumentDialogDupErrMsg : "發現重複的檔名。請輸入新名稱。",
	newDocumentDialogIllegalErrMsg : "${0} 是無效的文件標題，請指定其他標題。",
	newDocumentDialogNoNameErrMsg : "需要文件名稱。",
	newDocumentDialogNoPermissionErrMsg : "無法建立檔案，因為您沒有編輯者存取權。請聯絡管理者。",
	newDocumentDialogServerErrMsg : "Docs 伺服器無法使用。請聯絡伺服器管理者，然後再試一次。",
	newDocumentDialogServerErrMsg2 : "Connections 伺服器無法使用。請聯絡伺服器管理者，然後再試一次。",
	newDocumentDialog_TRIM_LONG_DOCUMENTNAME : "要縮短文件名稱嗎？",
	newDocumentDialog_WARN_LONG_DOCUMENTNAME : "文件名稱太長。",
	newDialogProblemidErrMsg : "請向管理者報告此問題。",
	newDialogProblemidErrMsg_tip : "請向管理者報告此問題。${shown_action}",
	newDialogProblemidErrMsgShow: "按一下即可顯示詳細資料",
	newDialogProblemidErrMsgHide: "按一下即可隱藏",
	newDocumentDialogTargetPre: "*儲存至：",
	newDocumentDialogTargetCommunity: "此社群",
	newDocumentDialogTargetMyFiles: "我的檔案",

	//newSpreadsheet 
	newSheetName : "試算表",
	newSheetTooltip : "新建試算表",
	newSheetDialogTitle : "新建試算表",
	newSheetDialogBtnOKTitle : "建立試算表",
	newSheetDialogInitialName : "未命名試算表",
	newSheetDialogExtensions: {	
		xls: "Microsoft Excel 97-2003(*.xls)",
		ods: "OpenDocument 試算表(*.ods)"
  	},

	//newPresentation 
	newPresName : "簡報",
	newPresTooltip : "新建簡報",
	newPresDialogTitle : "新建簡報",
	newPresDialogBtnOKTitle : "建立簡報",
	newPresDialogInitialName : "未命名簡報",
	newPresDialogExtensions: {	
		ppt: "Microsoft PowerPoint 97-2003(*.ppt)",
		odp: "OpenDocument 簡報(*.odp)"
  	},

	//actionNewFrom
	newFromName : "建立檔案",
	newFromDialogName : "以檔案為範本新建",
	newFromTooltip: "以此檔案作為範本建立新檔案",
	newFromDocTip : "從範本檔建立文件（DOC、DOCX 或 ODT 檔）。您可以使用 Docs 在線上編輯這些文件。",
	newFromSheetTip : "從範本檔建立試算表（XLS、XLSX 或 ODS 檔）。您可以使用 Docs 在線上編輯這些試算表。",
	newFromPresTip : "從範本檔建立簡報（PPT、PPTX 或 ODP 檔）。您可以使用 Docs 在線上編輯這些簡報。",

	//actionEdit
	editName : "使用 Docs 編輯",
	editTooltip : "使用 Docs 編輯",
	editWithDocsDialogTitle : "要開始使用 Docs 在線上編輯嗎？",
	editWithDocsDialogContent1 : "Docs 可讓您與其他人員在「檔案」中一起協同合作，並立即查看變更。您也可以在線上單獨工作。",
	editWithDocsDialogContent2 : "您不需要上傳文件的新版本。如果所有編輯都在線上完成，您的工作和註解都會受到保護。",
	//editWithDocsDialogMore : "Learn More",
	editWithDocsDialogBtnOKTitle : "線上編輯",
	//editLockedFile: "You cannot edit this file because it is locked by other editors.",
	//joinLockedSession: "You cannot join the co-editing session because this file is locked by others.",

	//actionView
	viewName : "檢視",
	viewTooltip : "在瀏覽器中預覽檔案",

	//doc too large
	docTooLargeTitle : "文件太大。",
	docTooLargeDescription : "您要編輯的文件太大。<br />請確定 *.odt、*.doc<br />或 *.docx 格式的檔案大小未超過 2048 K。",
	docTooLargeCancelBtn: "取消",
	//exportPDF is dropped in #sprint4

	//current editors
	currentEditing : "現行編輯：",
		
	//Sheet title
	sheetTitle0: "工作表 1",
	sheetTitle1: "工作表 2",
	sheetTitle2: "工作表 3",
	
	//downloas as MS format and PDF
	downloadAsMS: "下載為 Microsoft Office 格式",
	downloadAsPDF: "下載為 PDF 檔",
	downloadWithUnsavedDraftTitle: "未完成的草稿",
	downloadWithUnsavedDraftReadersOkLabel: "確定",
	downloadWithUnsavedDraftDescription: "此版本可能不含最新的線上編輯。請按一下儲存來建立新的版本並下載。請按一下「取消」以繼續進行而不儲存。",
	downloadWithUnsavedDraftReadersDescription: "此版本可能不含最新的編輯。下載的文件版本會是文件的編輯者最後一次儲存的版本。要繼續嗎？",

	//draft tab

	draft_tab_title : "草稿",
	draft_created : "${0} 是以 ${1} 版為基礎",
	draft_published : "已發佈最新的編輯草稿。",
	draft_beiing_edited : "此檔案目前正由 ${user} 在 Web 上編輯。",
	//draft_editor_valid : "Only people who are assigned as editors of the file can work with a draft.",
	draft_doctype_valid : "只可編輯 Docs 文件的檔案。",
	draft_unpublished_tip : "此草稿中還有尚未發佈為版本的編輯。${publish_action}",
	draft_save_action_label : "發佈版本",
	draft_not_found : "此檔案沒有編輯草稿。",
	draft_latest_edit : "最新的編輯：",
	draft_cur_editing : "現行編輯：",
	draft_edit_link : "編輯",
	//draft_last_edit : "Edited ${0}",
	
	// file summary
	docs_indicator_text: "這是 Docs 檔案。所有編輯都必須在線上進行。",
	nonentitlement_docs_indicator_text: "您必須先購買 Docs 授權，才可在線上編輯此檔案。",
	LABEL_PUBLISHED_OTHER: {
		DAY: "${user} 發佈於 ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} 發佈於 ${date}",	
		TODAY: "${user} 發佈於今天${time}",	
		YEAR: "${user} 發佈於 ${date_long}",	
		YESTERDAY:	"${user} 發佈於昨天${time}"
	},
	LABEL_PUBLISHED: {
		DAY: "發佈於 ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "發佈於 ${date}",	
		TODAY: "發佈於今天${time}",	
		YEAR: "發佈於 ${date_long}",	
		YESTERDAY:	"發佈於昨天${time}"
	},
	LABEL_VERSION_PUBLISHED_OTHER: {
		DAY: "${user} 於 ${date} 發佈版本",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} 於 ${date} 發佈版本",	
		TODAY: "${user} 於今天${time} 發佈版本",	
		YEAR: "${user} 於 ${date_long} 發佈版本",	
		YESTERDAY:	"${user} 於昨天${time} 發佈版本"
	},
	LABEL_VERSION_PUBLISHED: {
		DAY: "版本發佈於 ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "版本發佈於 ${date}",	
		TODAY: "版本發佈於今天${time}",	
		YEAR: "版本發佈於 ${date_long}",	
		YESTERDAY:	"版本發佈於昨天${time}"
	},
	LABEL_CREATED_OTHER: {
		DAY: "${user} 建立於 ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} 建立於 ${date}",	
		TODAY: "${user} 建立於今天${time}",	
		YEAR: "${user} 建立於 ${date_long}",	
		YESTERDAY:	"${user} 建立於昨天${time}"
	},
	LABEL_CREATED: {
		DAY: "建立於 ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "建立於 ${date}",	
		TODAY: "建立於今天${time}",	
		YEAR: "建立於 ${date_long}",	
		YESTERDAY:	"建立於昨天${time}"
	},
    LABEL_DRAFT_MODIFIED_OTHER: {
		DAY: "${user} 於 ${date} 編輯草稿",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} 於 ${date} 編輯草稿",	
		TODAY: "${user} 於今天${time} 編輯草稿",	
		YEAR: "${user} 於 ${date_long} 編輯草稿",	
		YESTERDAY:	"${user} 於昨天${time} 編輯草稿"
	},
	LABEL_DRAFT_MODIFIED: {
		DAY: "草稿編輯於 ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "草稿編輯於 ${date}",	
		TODAY: "草稿編輯於今天${time}",	
		YEAR: "草稿編輯於 ${date_long}",	
		YESTERDAY:	"草稿編輯於昨天${time}"
	},
	LABEL_DRAFT_CREATED_OTHER: {
		DAY: "${user} 於 ${date} 建立草稿",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} 於 ${date} 建立草稿",	
		TODAY: "${user} 於今天${time} 建立草稿",	
		YEAR: "${user} 於 ${date_long} 建立草稿",	
		YESTERDAY:	"${user} 於昨天${time} 建立草稿"
	},
	LABEL_DRAFT_CREATED: {
		DAY: "草稿建立於 ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "草稿建立於 ${date}",	
		TODAY: "草稿建立於今天${time}",	
		YEAR: "草稿建立於 ${date_long}",	
		YESTERDAY:	"草稿建立於昨天${time}"
	},
	LABEL_DRAFT_TAB_EDIT: {
		DAY: "編輯於 ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "編輯於 ${date}",	
		TODAY: "編輯於今天${time}",	
		YEAR: "編輯於 ${date_long}",	
		YESTERDAY:	"編輯於昨天${time}"
	},
	//unsupported browser detection
	unSupporteBrowserTitle: "不支援的瀏覽器",
	unSupporteBrowserContent1: "抱歉，您的瀏覽器可能無法與 Docs 正常搭配運作。為獲致最佳結果，請嘗試使用受支援的瀏覽器。",
	unSupporteBrowserContent2: "您也可以繼續使用您的瀏覽器，但可能無法使用 Docs 的所有功能。",
	unSupporteBrowserContent3: "不再顯示此訊息。",
	
	//introduction box
	INTRODUCTION_BOX_TITLE : "第一次使用「檔案」與 Docs 嗎？",
	INTRODUCTION_BOX_BLURB: "請上傳並分享您的檔案。您可以使用 Docs 個別建立及編輯檔案，也可以和其他人一起協同合作。您可以利用資料夾來整理檔案、追蹤檔案的變更，以及設定我的最愛。",
	INTRODUCTION_BOX_BLURB_LOG_IN: "登入即可開始使用「檔案」及 Docs。",
	INTRODUCTION_BOX_BLURB_UPLOAD: '按一下「上傳檔案」可新增檔案。按一下「新建」可使用 Docs 建立檔案。',
	INTRODUCTION_BOX_BLURB_UPLOAD_DOCS: '按一下「上傳檔案」可新增檔案。按一下「新建」可使用 Docs 建立檔案。',
	//INTRODUCTION_BOX_BLURB_HELP: "",
    //INTRODUCTION_BOX_BLURB_HELP: "Tip: Click ", {helpLink} to see help on a specific feature or click Help to view all help topics.",
	INTRODUCTION_BOX_CLOSE: '關閉「歡迎使用檔案及 Docs」區段',
	//INTRODUCTION_BOX_LEARN_MORE: "Learn More",
	//INTRODUCTION_BOX_TAKE_TOUR: "Watch demo",
	//INTRODUCTION_BOX_HELP_ALT: "Help"
	INTRODUCTION_BOX_46_BLURB: "建立並與同事協同使用內容。瞭解如何：",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM1: "新增您自己的檔案。",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM2: "個別或以協同合作方式開始即時線上編輯。",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM3: "上傳及編輯文件、試算表或簡報。",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM1: "{0}新增您自己的檔案{1}。",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM2: "{0}個別或以協同合作方式開始即時線上編輯{1}。",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM3: "{0}上傳及編輯文件、試算表或簡報{1}。",
	

	//Download conform for old files, which does not include latest changes in draft
	//UnsavedDraftConfirm : "This file has been edited by LotusLive Symphony. Current LotusLive Symphony has limitation <br/> saving the content back to it's original format. The document content you can download <br/> is still the same as original version. <br/><br/> Do you still want to download? <br/>",
	//UnsavedDraftBtnContinue : "Continue",
	//UnsavedDraftBtnContinueTitle: "Continue to download the original file",
	//UnsavedDraftBtnCancel : "Cancel"
	
	
	//export pdf page setup
	PAGE_SETUP_TITLE: "頁面設定",
	PAGE_SETUP_BTN_OK: "確定",
	ORIENTATION_LABEL: "方向",
	PORTRAIT: "直印",
	LANDSCAPE: "橫印",	
	MARGINS_LABEL: "邊距",
	TOP: "上：",
	TOP_DESC:"上邊距（以公分為單位）",
	TOP_DESC2:"上邊距（以英寸為單位）",
	BOTTOM: "下：",
	BOTTOM_DESC:"下邊距（以公分為單位）",
	BOTTOM_DESC2:"下邊距（以英寸為單位）",
	LEFT: "左：",
	LEFT_DESC:"左邊距（以公分為單位）",
	LEFT_DESC2:"左邊距（以英寸為單位）",	
	RIGHT: "右：",
	RIGHT_DESC:"右邊距（以公分為單位）",
	RIGHT_DESC2:"右邊距（以英寸為單位）",
	PAPER_FORMAT_LABEL: "紙張格式",
	PAPER_SIZE_LABEL: "紙張大小：",
	HEIGHT: "高度：",
	HEIGHT_DESC:"紙張高度（以公分為單位）",
	HEIGHT_DESC2:"紙張高度（以英寸為單位）",	
	WIDTH: "寬度：",
	WIDTH_DESC:"紙張寬度（以公分為單位）",
	WIDTH_DESC2:"紙張寬度（以英寸為單位）",
	CM_LABEL: "公分",
	LETTER: "信紙",
	LEGAL: "法規紙",
	TABLOID: "小報",
	USER: "使用者",
	SIZE1: "Env. #6 3/4",
	SIZE2: "Env. Monarch",
	SIZE3: "Env. #9",
	SIZE4: "Env. #10",
	SIZE5: "Env. #11",
	SIZE6: "Env. #12",
	SIZE7: "16 開",
	SIZE8: "32 開",
	SIZE9: "32 大開",
	DISPLAY_OPTION_LABEL: "顯示選項",
	HEADER: "頁首",
	HEADER_DESC:"頁首高度（以公分為單位）",	
	FOOTER: "頁尾",
	FOOTER_DESC:"頁尾高度（以公分為單位）",
	GRIDLINE: "格線",
	TAGGED_PDF: "標籤 PDF",
	PAGE_LABEL: "頁面順序",
	PAGE_TYPE1: "由上往下，然後向右",
	PAGE_TYPE2: "由左往右，然後向下",
	PAGE_SETUP_INVALID_MSG: "輸入無效，已自動更正。若要有不同的結果，請嘗試輸入其他值。",
	
	//Docs publish message
	service_unavailable_content: "Docs 服務無法使用。目前無法處理您的要求。請於稍後重試，或聯絡您的系統管理者。",
	viewaccess_denied_content: "您沒有檢視此檔案的許可權。檔案必須公開或已與您分享。",
	editaccess_denied_content: "您沒有編輯這個檔案的許可權。您必須具備使用 Docs 授權，並獲取所需的共用檔案；或您必須具備檔案的編輯者存取權。",
	doc_notfound_content: "您要存取的文件已被刪除或移動。請確認鏈結正確無誤。",
	repository_out_of_space_content: "您沒有足夠的空間來儲存新的文件。請移除其他檔案以釋放足夠的空間來儲存這份文件。",
	fileconnect_denied_content: "Docs 無法連線到檔案儲存庫。請於稍後重試，或聯絡您的系統管理者。",
	convservice_unavailable_content: "Docs 轉換服務無法使用。目前無法處理您的要求。請於稍後重試，或聯絡您的系統管理者。",
	doc_toolarge_content: "您要存取的文件太大。",
	conversion_timeout_content: "目前文件轉換耗時過久。請稍後重試。",
	storageserver_error_content: "此伺服器目前無法使用。目前無法處理您的要求。請於稍後重試，或聯絡您的系統管理者。",
	server_busy_content:"請稍後重試。",
	publish_locked_file: "您無法將此檔案發佈為新版本，因為此檔案已鎖定，不過，您的內容會自動儲存為草稿。",
	publishErrMsg: "未發佈版本。檔案可能太大，或伺服器可能逾時。請重試，或取消並要求您的管理者檢查伺服器日誌以識別問題。",
	publishErrMsg_Quota_Out: "沒有足夠的空間來發佈這份文件的新版本。請移除其他檔案以釋放足夠的空間來發佈這份文件。",
	publishErrMsg_NoFile: "因為此文件已被其他人刪除，所以發佈失敗。",
	publishErrMsg_NoPermission: "無法發佈新版本，因為您沒有此檔案的編輯者許可權。請聯絡檔案擁有者以取得編輯者許可權，然後再試一次。"
		
})


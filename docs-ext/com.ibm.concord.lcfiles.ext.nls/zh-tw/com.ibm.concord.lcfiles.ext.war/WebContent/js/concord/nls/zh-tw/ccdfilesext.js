({
	//actionNew dojo menu
	newName : "新建",
	newTooltip : "建立文件",

	//newDocument 
	newDocumentName : "文件",
	newDocumentTooltip : "建立文件",
	newDocumentDialogTitle : "建立文件",
	newDocumentDialogContent : "請提供這個未命名草稿的新名稱",
	newDocumentDialogBtnOK : "建立",
	newDocumentDialogBtnOKTitle : "建立文件",
	newDocumentDialogBtnCancel : "取消",
	newDocumentDialogNamepre : "名稱 (*)",
	newDocumentDialogInitialName : "未命名文件",
	newDocumentDialogDupErrMsg : "發現重複的檔名。請輸入新名稱。",
	newDocumentDialogIllegalErrMsg : "${0} 是無效的文件標題，請指定其他標題。",
	newDocumentDialogServerErrMsg : "HCL Docs 伺服器無法使用。請聯絡伺服器管理者，然後再試一次。",
	newDocumentDialogServerErrMsg2 : "HCL Connections 伺服器無法使用。請聯絡伺服器管理者，然後再試一次。",


	//newSpreadsheet 
	newSheetName : "試算表",
	newSheetTooltip : "建立試算表",
	newSheetDialogTitle : "建立試算表",
	newSheetDialogBtnOKTitle : "建立試算表",
	newSheetDialogInitialName : "未命名試算表",

	//newPresentation 
	newPresName : "簡報",
	newPresTooltip : "建立簡報",
	newPresDialogTitle : "建立簡報",
	newPresDialogBtnOKTitle : "建立簡報",
	newPresDialogInitialName : "未命名簡報",

	//actionNewFrom
	newFromName : "建立檔案",
	newFromTooltip: "以此檔案作為範本建立新檔案",
	newFromDocTip : "使用現行檔案作為範本來建立文件。",
	newFromSheetTip : "使用現行檔案作為範本來建立試算表。",

	//actionEdit
	editName : "編輯",
	editTooltip : "編輯",

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
	downloadWithUnsavedDraftDescription: "這個版本可能不含最新的線上編輯。請按一下儲存來建立新的版本並下載。請按一下「取消」以繼續進行而不儲存。",
	downloadWithUnsavedDraftReadersDescription: "這個版本可能不含最新的編輯。下載的文件版本會是文件的編輯者最後一次儲存的版本。要繼續嗎？",

	//draft tab

	draft_tab_title : "草稿",
	draft_created : "${0} 是以 ${1} 版為基礎",
	draft_beiing_edited : "這個檔案目前正由 ${user} 在 Web 上編輯。",
	draft_editor_valid : "只有指派為檔案編輯者的人員可以處理草稿。",
	draft_doctype_valid : "只能編輯是 HCL Docs 文件的檔案。",
	draft_unpublished_tip : "還有編輯草稿尚未儲存為某個版本。",
	draft_save_action_label : "儲存",
	draft_not_found : "這個檔案沒有編輯草稿。",
	draft_latest_edit : "最新的編輯：",
	draft_cur_editing : "現行編輯：",
	
	

	//unsupported browser detection
	unSupporteBrowserTitle: "不支援的瀏覽器",
	unSupporteBrowserContent1: "抱歉，您的瀏覽器可能無法與 HCL Docs 正常運作。為了得到最佳結果，請嘗試使用其中一個支援的瀏覽器。",
	unSupporteBrowserContent2: "當然，您可以繼續使用您的瀏覽器，但可能無法體驗 HCL Docs 的所有特性。",
	unSupporteBrowserContent3: "不再顯示此訊息。"
		
	//Download conform for old files, which does not include latest changes in draft
	//UnsavedDraftConfirm : "This file has been edited by LotusLive Symphony. Current LotusLive Symphony has limitation <br/> saving the content back to it's original format. The document content you can download <br/> is still the same as original version. <br/><br/> Do you still want to download? <br/>",
	//UnsavedDraftBtnContinue : "Continue",
	//UnsavedDraftBtnContinueTitle: "Continue to download the original file",
	//UnsavedDraftBtnCancel : "Cancel"
})

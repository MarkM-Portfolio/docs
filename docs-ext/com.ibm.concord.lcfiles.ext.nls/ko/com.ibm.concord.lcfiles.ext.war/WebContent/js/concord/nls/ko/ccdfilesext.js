({
	//actionNew dojo menu
	newName : "새로 작성",
	newTooltip : "문서 작성",

	//newDocument 
	newDocumentName : "문서",
	newDocumentTooltip : "문서 작성",
	newDocumentDialogTitle : "문서 작성",
	newDocumentDialogContent : "이 제목 없는 초안에 새 이름을 제공하십시오.",
	newDocumentDialogBtnOK : "작성",
	newDocumentDialogBtnOKTitle : "문서 작성",
	newDocumentDialogBtnCancel : "취소",
	newDocumentDialogNamepre : "이름(*)",
	newDocumentDialogInitialName : "제목 없는 문서",
	newDocumentDialogDupErrMsg : "중복 파일 이름이 발견되었습니다. 새 이름을 입력하십시오.",
	newDocumentDialogIllegalErrMsg : "${0}은(는) 잘못된 문서 제목입니다. 다른 이름을 지정하십시오.",
	newDocumentDialogServerErrMsg : "HCL Docs 서버를 사용할 수 없습니다. 서버 관리자에게 문의한 후 나중에 다시 시도하십시오.",
	newDocumentDialogServerErrMsg2 : "HCL Connections 서버를 사용할 수 없습니다. 서버 관리자에게 문의한 후 나중에 다시 시도하십시오. ",


	//newSpreadsheet 
	newSheetName : "스프레드시트",
	newSheetTooltip : "스프레드시트 작성",
	newSheetDialogTitle : "스프레드시트 작성",
	newSheetDialogBtnOKTitle : "스프레드시트 작성",
	newSheetDialogInitialName : "제목 없는 스프레드시트",

	//newPresentation 
	newPresName : "프리젠테이션",
	newPresTooltip : "프리젠테이션 작성",
	newPresDialogTitle : "프리젠테이션 작성",
	newPresDialogBtnOKTitle : "프리젠테이션 작성",
	newPresDialogInitialName : "제목 없는 프리젠테이션",

	//actionNewFrom
	newFromName : "파일 작성",
	newFromTooltip: "이 파일을 템플리트로 사용하여 새 파일 작성",
	newFromDocTip : "현재 파일을 템플리트로 사용하여 문서를 작성합니다.",
	newFromSheetTip : "현재 파일을 템플리트로 사용하여 스프레드시트를 작성합니다.",

	//actionEdit
	editName : "편집",
	editTooltip : "편집",

	//actionView
	viewName : "보기",
	viewTooltip : "브라우저에서 파일 미리보기",

	//doc too large
	docTooLargeTitle : "문서가 너무 큽니다.",
	docTooLargeDescription : "편집하려는 문서가 너무 큽니다. <br />*.odt, *.doc 또는 *.docx 형식의 파일 크기가<br />2048K를 초과하지 않아야 합니다.",
	docTooLargeCancelBtn: "취소",
	//exportPDF is dropped in #sprint4

	//current editors
	currentEditing : "현재 편집자: ",
		
	//Sheet title
	sheetTitle0: "시트1",
	sheetTitle1: "시트2",
	sheetTitle2: "시트3",
	
	//downloas as MS format and PDF
	downloadAsMS: "Microsoft Office 형식으로 다운로드",
	downloadAsPDF: "PDF 파일로 다운로드",
	downloadWithUnsavedDraftTitle: "초안 문서",
	downloadWithUnsavedDraftReadersOkLabel: "확인",
	downloadWithUnsavedDraftDescription: "이 버전에 최신 온라인 편집 내용이 포함되어 있지 않을 수도 있습니다. 새 버전을 작성한 후 다운로드하려면 저장을 클릭하십시오. 저장하지 않고 진행하려면 취소를 클릭하십시오. ",
	downloadWithUnsavedDraftReadersDescription: "이 버전에 최신 편집 내용이 포함되어 있지 않을 수도 있습니다. 다운로드한 문서의 버전이 문서 편집기가 마지막으로 저장한 버전이 됩니다. 계속하시겠습니까?",

	//draft tab

	draft_tab_title : "초안",
	draft_created : "${0}(버전 ${1} 기반)",
	draft_beiing_edited : "이 파일은 현재 웹에서 ${user}이(가) 편집하고 있습니다.",
	draft_editor_valid : "파일 편집자로 지정된 사용자만 초안을 사용할 수 있습니다.",
	draft_doctype_valid : "HCL Docs 문서인 파일만 편집할 수 있습니다.",
	draft_unpublished_tip : "버전으로 저장되지 않은 초안 편집 내용이 있습니다.",
	draft_save_action_label : "저장",
	draft_not_found : "이 파일에 대한 초안 편집 내용이 있습니다.",
	draft_latest_edit : "최근 편집 내용:",
	draft_cur_editing : "현재 편집자: ",
	
	

	//unsupported browser detection
	unSupporteBrowserTitle: "지원되지 않는 브라우저",
	unSupporteBrowserContent1: "죄송합니다. 브라우저가 HCL Docs를 제대로 처리하지 못할 수 있습니다. 최상의 결과를 위해 지원되는 브라우저 중 하나를 사용해 보십시오.",
	unSupporteBrowserContent2: "브라우저를 계속 사용할 수는 있지만 HCL Docs의 일부 기능을 사용하지 못할 수 있습니다.",
	unSupporteBrowserContent3: "이 메시지를 다시 표시하지 않음"
		
	//Download conform for old files, which does not include latest changes in draft
	//UnsavedDraftConfirm : "This file has been edited by LotusLive Symphony. Current LotusLive Symphony has limitation <br/> saving the content back to it's original format. The document content you can download <br/> is still the same as original version. <br/><br/> Do you still want to download? <br/>",
	//UnsavedDraftBtnContinue : "Continue",
	//UnsavedDraftBtnContinueTitle: "Continue to download the original file",
	//UnsavedDraftBtnCancel : "Cancel"
})

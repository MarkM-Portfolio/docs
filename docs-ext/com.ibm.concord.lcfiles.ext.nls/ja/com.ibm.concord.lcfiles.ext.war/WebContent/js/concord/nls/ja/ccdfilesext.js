({
	//actionNew dojo menu
	newName : "新規作成",
	newTooltip : "文書の作成",

	//newDocument 
	newDocumentName : "文書",
	newDocumentTooltip : "文書の作成",
	newDocumentDialogTitle : "文書の作成",
	newDocumentDialogContent : "この無題のドラフトに新しい名前を指定します",
	newDocumentDialogBtnOK : "作成",
	newDocumentDialogBtnOKTitle : "文書の作成",
	newDocumentDialogBtnCancel : "キャンセル",
	newDocumentDialogNamepre : "名前 (*)",
	newDocumentDialogInitialName : "無題の文書",
	newDocumentDialogDupErrMsg : "重複するファイル名が見つかりました。新規の名前を入力してください。",
	newDocumentDialogIllegalErrMsg : "${0} は無効な文書タイトルです。別のタイトルを指定してください。",
	newDocumentDialogServerErrMsg : "HCL Docs サーバーが使用可能ではありません。サービス管理者に連絡し、後でもう一度実行してください。",
	newDocumentDialogServerErrMsg2 : "HCL Connections サーバーを使用できません。 サーバー管理者に連絡し、後でもう一度実行してください。",


	//newSpreadsheet 
	newSheetName : "スプレッドシート",
	newSheetTooltip : "スプレッドシートの作成",
	newSheetDialogTitle : "スプレッドシートの作成",
	newSheetDialogBtnOKTitle : "スプレッドシートの作成",
	newSheetDialogInitialName : "無題のスプレッドシート",

	//newPresentation 
	newPresName : "プレゼンテーション",
	newPresTooltip : "プレゼンテーションの作成",
	newPresDialogTitle : "プレゼンテーションの作成",
	newPresDialogBtnOKTitle : "プレゼンテーションの作成",
	newPresDialogInitialName : "無題のプレゼンテーション",

	//actionNewFrom
	newFromName : "ファイルの作成",
	newFromTooltip: "このファイルをテンプレートとして使用して新規ファイルを作成",
	newFromDocTip : "現在のファイルをテンプレートとして文書を作成します。",
	newFromSheetTip : "現在のファイルをテンプレートとしてスプレッドシートを作成します。",

	//actionEdit
	editName : "編集",
	editTooltip : "編集",

	//actionView
	viewName : "表示",
	viewTooltip : "ブラウザでファイルをプリビュー",

	//doc too large
	docTooLargeTitle : "文書が大きすぎます。",
	docTooLargeDescription : "編集対象の文書が大きすぎます。<br />*.odt、*.doc、*.docx 形式のファイルのサイズは <br />2048 K を超えないようにしてください。",
	docTooLargeCancelBtn: "キャンセル",
	//exportPDF is dropped in #sprint4

	//current editors
	currentEditing : "現在の編集: ",
		
	//Sheet title
	sheetTitle0: "Sheet1",
	sheetTitle1: "Sheet2",
	sheetTitle2: "Sheet3",
	
	//downloas as MS format and PDF
	downloadAsMS: "Microsoft Office 形式でダウンロード",
	downloadAsPDF: "PDF ファイルでダウンロード",
	downloadWithUnsavedDraftTitle: "未完了のドラフト",
	downloadWithUnsavedDraftReadersOkLabel: "OK",
	downloadWithUnsavedDraftDescription: "このバージョンには、最新のオンライン編集内容が含まれていない可能性があります。新規バージョンを作成してダウンロードするには「保存」をクリックします。保存せずに続行するには「キャンセル」をクリックします。",
	downloadWithUnsavedDraftReadersDescription: "このバージョンには、最新の編集内容が含まれていない可能性があります。ダウンロードされる文書のバージョンは、文書の編集者によって最後に保存されたバージョンです。続行しますか?",

	//draft tab

	draft_tab_title : "ドラフト",
	draft_created : "バージョン ${1} に基づく ${0}",
	draft_beiing_edited : "このファイルは、現在 ${user} によって Web 上で編集されています。",
	draft_editor_valid : "このファイルに編集者として割り当てられたユーザーのみが、ドラフトで作業できます。",
	draft_doctype_valid : "HCL Docs 文書のファイルのみを編集できます。",
	draft_unpublished_tip : "バージョンとして保存されていないドラフト編集内容があります。",
	draft_save_action_label : "保存",
	draft_not_found : "このファイルにはドラフト編集内容はありません。",
	draft_latest_edit : "最新の編集:",
	draft_cur_editing : "現在の編集: ",
	
	

	//unsupported browser detection
	unSupporteBrowserTitle: "サポートされないブラウザー",
	unSupporteBrowserContent1: "申し訳ありませんが、ご使用のブラウザーは HCL Docs を正しく処理できない可能性があります。最良の結果を得るためには、これらのサポートされるブラウザーのいずれかを使用してください。",
	unSupporteBrowserContent2: "もちろん、引き続きそのブラウザーを使用していただくことはできますが、HCL Docs の機能のうちで使用できないものがある可能性があります。",
	unSupporteBrowserContent3: "今後、このメッセージを表示しない"
		
	//Download conform for old files, which does not include latest changes in draft
	//UnsavedDraftConfirm : "This file has been edited by LotusLive Symphony. Current LotusLive Symphony has limitation <br/> saving the content back to it's original format. The document content you can download <br/> is still the same as original version. <br/><br/> Do you still want to download? <br/>",
	//UnsavedDraftBtnContinue : "Continue",
	//UnsavedDraftBtnContinueTitle: "Continue to download the original file",
	//UnsavedDraftBtnCancel : "Cancel"
})

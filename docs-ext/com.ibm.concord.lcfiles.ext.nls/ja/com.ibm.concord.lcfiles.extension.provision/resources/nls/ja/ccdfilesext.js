({
	//actionNew dojo menu
	newName : "新規",
	newTooltip : "文書の作成",
	WARN_INTERNAL : "いったんファイルが作成されたら、組織外の他のユーザーに共有するために許可を変更することはできません。",
	newCommunityInfo : "コミュニティー・メンバーはこのファイルを編集できます。",
  	CANCEL : "キャンセル",
  	DOWNLOAD_EMPTY_TITLE : "ファイルをダウンロードできません",
  	DOWNLOAD_EMPTY_OK : "閉じる",
  	DOWNLOAD_EMPTY_CONTENT1 : "このファイルにはダウンロードできる公開バージョンがありません。",
  	DOWNLOAD_EMPTY_CONTENT2 : "バージョンは、Docs エディターから公開できます。",
  	DOWNLOAD_EMPTYVIEW_TITLE : "ファイルをダウンロードできません",
  	DOWNLOAD_EMPTYVIEW_OK : "閉じる",
 	DOWNLOAD_EMPTYVIEW_CONTENT1 : "このファイルにはダウンロードできる公開バージョンがありません。",
  	DOWNLOAD_EMPTYVIEW_CONTENT2 : "ファイル所有者に、このファイルのバージョンを公開するように依頼してください。",  
  	DOWNLOAD_NEWDRAFT_TITLE : "バージョンのダウンロード",
  	DOWNLOAD_NEWDRAFT_OK : "バージョンのダウンロード",

  	DOWNLOAD_NEWDRAFT_LAST_EDITED: {
		DAY: "最終編集日: ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "最終編集日: ${date}",	
		TODAY: "最終編集日時: 今日の ${time}",	
		YEAR: "最終編集日: ${date_long}",	
		YESTERDAY:	"最終編集日時: 昨日の ${time}"
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT1: {
		DAY: "より新しいドラフト (最終編集日: ${date}) が検出されました。",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "より新しいドラフト (最終編集日: ${date}) が検出されました。",	
		TODAY: "より新しいドラフト (最終編集時刻: 今日の ${time}) が検出されました。",	
		YEAR: "より新しいドラフト (最終編集日: ${date_long}) が検出されました。",	
		YESTERDAY:	"より新しいドラフト (最終編集時刻: 昨日の ${time}) が検出されました。"
  	},
  	DOWNLOAD_NEWDRAFT_CONTENT2: {
		DAY: "${date} に公開されたバージョンのダウンロードを続行しますか?",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${date} に公開されたバージョンのダウンロードを続行しますか?",	
		TODAY: "今日の ${time} に公開されたバージョンのダウンロードを続行しますか?",	
		YEAR: "${date_long} に公開されたバージョンのダウンロードを続行しますか?",	
		YESTERDAY:	"昨日の ${time} に公開されたバージョンのダウンロードを続行しますか?"
  	},
  	
  	DOWNLOAD_NEWDRAFT_CONFIRM_CONTENT: "これは Docs ファイルのダウンロード可能な最新版です。 より新しいバージョンがドラフト形式で存在するかどうかについては、ファイルの所有者にお問い合わせください。",

  	VIEW_FILE_DETAILS_LINK : "ファイルの詳細の表示",
  	OPEN_THIS_FILE_TIP: "このファイルを開く",
  
	//newDocument 
	newDocumentName : "文書",
	newDocumentTooltip : "新規文書",
	newDocumentDialogTitle : "新規文書",
	newDocumentDialogContent : "この無題の文書に名前を指定してください。",
	newDocumentDialogBtnOK : "作成",
	newDocumentDialogBtnOKTitle : "文書の作成",
	newDocumentDialogInitialName : "無題の文書",
	newDocumentDialogExtensions: {	
		doc: "Microsoft Word 97-2003(*.doc)",
		odt: "OpenDocument テキスト(*.odt)"
  	},
	newDocumentDialogBtnCancel : "キャンセル",
	newDocumentDialogNamepre : "*名前:",
	newDocumentDialogDocumentTypePre : "タイプ:",
	newDocumentDialogDocumentChangeTypeLink : "デフォルト・ファイル拡張子の変更",
	newDocumentDialogDupErrMsg : "重複するファイル名が見つかりました。 新規の名前を入力してください。",
	newDocumentDialogIllegalErrMsg : "${0} は無効な文書タイトルです。別のタイトルを指定してください。",
	newDocumentDialogNoNameErrMsg : "文書名は必須です。",
	newDocumentDialogNoPermissionErrMsg : "編集者権限がないため、ファイルを作成できませんでした。 管理者にお問い合わせください。",
	newDocumentDialogServerErrMsg : "Docs サーバーを使用できません。 サーバー管理者に連絡し、後でやり直してください。",
	newDocumentDialogServerErrMsg2 : "Connections サーバーを使用できません。 サーバー管理者に連絡し、後でやり直してください。",
	newDocumentDialog_TRIM_LONG_DOCUMENTNAME : "文書名を短縮しますか?",
	newDocumentDialog_WARN_LONG_DOCUMENTNAME : "文書名が長すぎます。",
	newDialogProblemidErrMsg : "この問題を管理者に報告してください。 ",
	newDialogProblemidErrMsg_tip : "この問題を管理者に報告してください。 ${shown_action}",
	newDialogProblemidErrMsgShow: "クリックして詳細を表示",
	newDialogProblemidErrMsgHide: "クリックして非表示",
	newDocumentDialogTargetPre: "*保存先:",
	newDocumentDialogTargetCommunity: "このコミュニティー",
	newDocumentDialogTargetMyFiles: "マイ・ファイル",

	//newSpreadsheet 
	newSheetName : "スプレッドシート",
	newSheetTooltip : "新規スプレッドシート",
	newSheetDialogTitle : "新規スプレッドシート",
	newSheetDialogBtnOKTitle : "スプレッドシートの作成",
	newSheetDialogInitialName : "無題のスプレッドシート",
	newSheetDialogExtensions: {	
		xls: "Microsoft Excel 97-2003(*.xls)",
		ods: "OpenDocument スプレッドシート (*.ods)"
  	},

	//newPresentation 
	newPresName : "プレゼンテーション",
	newPresTooltip : "新規プレゼンテーション",
	newPresDialogTitle : "新規プレゼンテーション",
	newPresDialogBtnOKTitle : "プレゼンテーションの作成",
	newPresDialogInitialName : "無題のプレゼンテーション",
	newPresDialogExtensions: {	
		ppt: "Microsoft PowerPoint 97-2003(*.ppt)",
		odp: "OpenDocument プレゼンテーション(*.odp)"
  	},

	//actionNewFrom
	newFromName : "ファイルの作成",
	newFromDialogName : "ファイルから新規",
	newFromTooltip: "このファイルをテンプレートとして使用して新規ファイルを作成",
	newFromDocTip : "テンプレート・ファイルから文書 (DOC ファイル、DOCX ファイル、ODT ファイル) を作成します。 これらの文書は、Docs でオンラインで編集できます。",
	newFromSheetTip : "テンプレート・ファイルからスプレッドシート (XLS ファイル、XLSX ファイル、ODS ファイル) を作成します。 これらのスプレッドシートは、Docs でオンラインで編集できます。",
	newFromPresTip : "テンプレート・ファイルからプレゼンテーション (PPT ファイル、PPTX ファイル、ODP ファイル) を作成します。 これらのプレゼンテーションは、Docs でオンラインで編集できます。",

	//actionEdit
	editName : "Docs で編集",
	editTooltip : "Docs で編集",
	editWithDocsDialogTitle : "Docs でのオンライン編集を開始しますか?",
	editWithDocsDialogContent1 : "Docs を使用すると、ファイルで他のユーザーと同時に共同作業を行い、即時に変更内容を確認できます。 非公開でオンライン作業を行うこともできます。",
	editWithDocsDialogContent2 : "文書の新規バージョンをアップロードする必要はありません。 すべての編集作業をオンラインで行った場合、作業内容とコメントの両方が保護されます。 ",
	//editWithDocsDialogMore : "Learn More",
	editWithDocsDialogBtnOKTitle : "オンラインで編集",
	//editLockedFile: "You cannot edit this file because it is locked by other editors.",
	//joinLockedSession: "You cannot join the co-editing session because this file is locked by others.",

	//actionView
	viewName : "表示",
	viewTooltip : "ブラウザでファイルをプリビュー",

	//doc too large
	docTooLargeTitle : "文書が大きすぎます。",
	docTooLargeDescription : "編集対象の文書が大きすぎます。 <br />*.odt、*.doc、*.docx 形式のファイルのサイズは <br />2048 K を超えないようにしてください。",
	docTooLargeCancelBtn: "キャンセル",
	//exportPDF is dropped in #sprint4

	//current editors
	currentEditing : "現在の編集: ",
		
	//Sheet title
	sheetTitle0: "シート1",
	sheetTitle1: "シート2",
	sheetTitle2: "シート3",
	
	//downloas as MS format and PDF
	downloadAsMS: "Microsoft Office 形式でダウンロード",
	downloadAsPDF: "PDF ファイルでダウンロード",
	downloadWithUnsavedDraftTitle: "未完了のドラフト",
	downloadWithUnsavedDraftReadersOkLabel: "OK",
	downloadWithUnsavedDraftDescription: "このバージョンには、最新のオンライン編集内容が含まれていない可能性があります。 新規バージョンを作成してダウンロードするには「保存」をクリックします。 保存せずに続行するには「キャンセル」をクリックします。",
	downloadWithUnsavedDraftReadersDescription: "このバージョンには、最新の編集内容が含まれていない可能性があります。 ダウンロードされる文書のバージョンは、文書の編集者によって最終保存されたバージョンです。 続行しますか?",

	//draft tab

	draft_tab_title : "ドラフト",
	draft_created : "バージョン ${1} に基づく ${0}",
	draft_published : "ドラフトの最近の編集内容が公開されました。",
	draft_beiing_edited : "このファイルは、現在 ${user} が Web 上で編集中です。",
	//draft_editor_valid : "Only people who are assigned as editors of the file can work with a draft.",
	draft_doctype_valid : "Docs 文書のファイルのみを編集できます。",
	draft_unpublished_tip : "このドラフトには、バージョンとして公開されていない編集内容があります。 ${publish_action}",
	draft_save_action_label : "バージョンの公開",
	draft_not_found : "このファイルにはドラフト編集内容はありません。",
	draft_latest_edit : "最新の編集:",
	draft_cur_editing : "現在の編集:",
	draft_edit_link : "編集",
	//draft_last_edit : "Edited ${0}",
	
	// file summary
	docs_indicator_text: "これは Docs ファイルです。 すべての編集は、オンラインで行う必要があります。",
	nonentitlement_docs_indicator_text: "Docs ライセンスを購入済みの場合のみ、このファイルをオンライン編集できます。",
	LABEL_PUBLISHED_OTHER: {
		DAY: "${user} が ${date} に公開",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} が ${date} に公開",	
		TODAY: "${user} が今日の ${time} に公開",	
		YEAR: "${user} が ${date_long} に公開",	
		YESTERDAY:	"${user} が昨日の ${time} に公開"
	},
	LABEL_PUBLISHED: {
		DAY: "公開日 ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "公開日 ${date}",	
		TODAY: "今日の ${time} に公開",	
		YEAR: "公開日 ${date_long}",	
		YESTERDAY:	"昨日の ${time} に公開"
	},
	LABEL_VERSION_PUBLISHED_OTHER: {
		DAY: "${user} が ${date} に公開したバージョン",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} が ${date} に公開したバージョン",	
		TODAY: "${user} が今日の ${time} に公開したバージョン",	
		YEAR: "${user} が ${date_long} に公開したバージョン",	
		YESTERDAY:	"${user} が昨日の ${time} に公開したバージョン"
	},
	LABEL_VERSION_PUBLISHED: {
		DAY: "${date} に公開されたバージョン",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${date} に公開されたバージョン",	
		TODAY: "今日の ${time} に公開されたバージョン",	
		YEAR: "${date_long} に公開されたバージョン",	
		YESTERDAY:	"昨日の ${time} に公開されたバージョン"
	},
	LABEL_CREATED_OTHER: {
		DAY: "${user} が ${date} に作成",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} が ${date} に作成",	
		TODAY: "${user} が今日の ${time} に作成",	
		YEAR: "${user} が ${date_long} に作成",	
		YESTERDAY:	"${user} が昨日の ${time} に作成"
	},
	LABEL_CREATED: {
		DAY: "作成日 ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "作成日 ${date}",	
		TODAY: "今日の ${time} に作成",	
		YEAR: "作成日 ${date_long}",	
		YESTERDAY:	"昨日の ${time} に作成"
	},
    LABEL_DRAFT_MODIFIED_OTHER: {
		DAY: "${user} が ${date} に編集したドラフト",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} が ${date} に編集したドラフト",	
		TODAY: "${user} が今日の ${time} に編集したドラフト",	
		YEAR: "${user} が ${date_long} に編集したドラフト",	
		YESTERDAY:	"${user} が昨日の ${time} に編集したドラフト"
	},
	LABEL_DRAFT_MODIFIED: {
		DAY: "${date} に編集されたドラフト",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${date} に編集されたドラフト",	
		TODAY: "今日の ${time} に編集されたドラフト",	
		YEAR: "${date_long} に編集されたドラフト",	
		YESTERDAY:	"昨日の ${time} に編集されたドラフト"
	},
	LABEL_DRAFT_CREATED_OTHER: {
		DAY: "${user} が ${date} に作成したドラフト",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${user} が ${date} に作成したドラフト",	
		TODAY: "${user} が今日の ${time} に作成したドラフト",	
		YEAR: "${user} が ${date_long} に作成したドラフト",	
		YESTERDAY:	"${user} が昨日の ${time} に作成したドラフト"
	},
	LABEL_DRAFT_CREATED: {
		DAY: "${date} に作成されたドラフト",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "${date} に作成されたドラフト",	
		TODAY: "今日の ${time} に作成されたドラフト",	
		YEAR: "${date_long} に作成されたドラフト",	
		YESTERDAY:	"昨日の ${time} に作成されたドラフト"
	},
	LABEL_DRAFT_TAB_EDIT: {
		DAY: "編集日 ${date}",	
		FULL: "${date_long} ${time_long}",	
		MONTH: "編集日 ${date}",	
		TODAY: "今日の ${time} に編集",	
		YEAR: "編集日 ${date_long}",	
		YESTERDAY:	"昨日の ${time} に編集"
	},
	//unsupported browser detection
	unSupporteBrowserTitle: "サポートされないブラウザー",
	unSupporteBrowserContent1: "申し訳ありませんが、ご使用のブラウザーは Docs を正しく処理できない可能性があります。 最良の結果を得るためには、これらのサポートされるブラウザーのいずれかを使用してください。",
	unSupporteBrowserContent2: "もちろん、引き続きそのブラウザーを使用していただくことはできますが、Docs の機能のうちで使用できないものがある可能性があります。",
	unSupporteBrowserContent3: "今後、このメッセージを表示しない",
	
	//introduction box
	INTRODUCTION_BOX_TITLE : "ファイルと Docs の使い方",
	INTRODUCTION_BOX_BLURB: "ファイルをアップロードして共有できます。 Docs を使用すると、ファイルを個別に、または共同作業で作成、編集できます。 ファイルをフォルダーに整理したり、ファイルをフォローして変更内容をトラッキングしたり、お気に入りファイルをピン留めしたりできます。",
	INTRODUCTION_BOX_BLURB_LOG_IN: "ログインしてファイルと Docs の使用を開始します。",
	INTRODUCTION_BOX_BLURB_UPLOAD: '「ファイルのアップロード」をクリックしてファイルを追加します。 Docs でファイルを作成するには「新規」をクリックします。',
	INTRODUCTION_BOX_BLURB_UPLOAD_DOCS: '「ファイルのアップロード」をクリックしてファイルを追加します。 Docs でファイルを作成するには「新規」をクリックします。',
	//INTRODUCTION_BOX_BLURB_HELP: "",
    //INTRODUCTION_BOX_BLURB_HELP: "Tip: Click ", {helpLink} to see help on a specific feature or click Help to view all help topics.",
	INTRODUCTION_BOX_CLOSE: '「ファイルと Docs へようこそ」セクションを閉じる',
	//INTRODUCTION_BOX_LEARN_MORE: "Learn More",
	//INTRODUCTION_BOX_TAKE_TOUR: "Watch demo",
	//INTRODUCTION_BOX_HELP_ALT: "Help"
	INTRODUCTION_BOX_46_BLURB: "コンテンツの作成やワーク・メンバーとの共同作業を行います。 以下のことを習得してください。",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM1: "自分自身のファイルを追加する。",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM2: "オンラインで、リアルタイムに、個人または共同で編集を開始する。",
	INTRODUCTION_BOX_46_BLURB_LIST_ITEM3: "文書、スプレッドシート、プレゼンテーションをアップロードして編集する。",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM1: "{0}自分のファイルを追加する{1}。",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM2: "{0}個人または共同での編集を、オンラインでリアルタイムに開始する{1}。",
	INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM3: "{0}文書、スプレッドシート、プレゼンテーションをアップロードして編集する{1}。",
	

	//Download conform for old files, which does not include latest changes in draft
	//UnsavedDraftConfirm : "This file has been edited by LotusLive Symphony. Current LotusLive Symphony has limitation <br/> saving the content back to it's original format. The document content you can download <br/> is still the same as original version. <br/><br/> Do you still want to download? <br/>",
	//UnsavedDraftBtnContinue : "Continue",
	//UnsavedDraftBtnContinueTitle: "Continue to download the original file",
	//UnsavedDraftBtnCancel : "Cancel"
	
	
	//export pdf page setup
	PAGE_SETUP_TITLE: "ページ・レイアウトの設定",
	PAGE_SETUP_BTN_OK: "OK",
	ORIENTATION_LABEL: "方向",
	PORTRAIT: "縦",
	LANDSCAPE: "横",	
	MARGINS_LABEL: "ページ余白",
	TOP: "上:",
	TOP_DESC:"上余白 (センチメートル)",
	TOP_DESC2:"上余白 (インチ)",
	BOTTOM: "下:",
	BOTTOM_DESC:"下余白 (センチメートル)",
	BOTTOM_DESC2:"下余白 (インチ)",
	LEFT: "左:",
	LEFT_DESC:"左余白 (センチメートル)",
	LEFT_DESC2:"左余白 (インチ)",	
	RIGHT: "右:",
	RIGHT_DESC:"右余白 (センチメートル)",
	RIGHT_DESC2:"右余白 (インチ)",
	PAPER_FORMAT_LABEL: "用紙の書式",
	PAPER_SIZE_LABEL: "用紙サイズ:",
	HEIGHT: "高さ:",
	HEIGHT_DESC:"用紙の高さ (センチメートル)",
	HEIGHT_DESC2:"用紙の高さ (インチ)",	
	WIDTH: "幅:",
	WIDTH_DESC:"用紙の幅 (センチメートル)",
	WIDTH_DESC2:"用紙の幅 (インチ)",
	CM_LABEL: "cm",
	LETTER: "レター",
	LEGAL: "リーガル",
	TABLOID: "タブロイド",
	USER: "ユーザー",
	SIZE1: "封筒 #6 3/4",
	SIZE2: "封筒 Monarch",
	SIZE3: "封筒 #9",
	SIZE4: "封筒 #10",
	SIZE5: "封筒 #11",
	SIZE6: "封筒 #12",
	SIZE7: "16 kai",
	SIZE8: "32 kai",
	SIZE9: "32 kai 大",
	DISPLAY_OPTION_LABEL: "オプションの表示",
	HEADER: "ヘッダー",
	HEADER_DESC:"ヘッダーの高さ (センチメートル)",	
	FOOTER: "フッター",
	FOOTER_DESC:"フッターの高さ (センチメートル)",
	GRIDLINE: "グリッド線",
	TAGGED_PDF: "タグ付き PDF",
	PAGE_LABEL: "ページの順序",
	PAGE_TYPE1: "上から下、次に右",
	PAGE_TYPE2: "左から右、次に下",
	PAGE_SETUP_INVALID_MSG: "入力は無効なため、自動的に調整されました。 異なる結果が必要な場合は、別の値を入力してみてください。",
	
	//Docs publish message
	service_unavailable_content: "Docs サービスを使用できません。 現時点では要求を処理できません。 後でやり直すか、システム管理者にお問い合わせください。",
	viewaccess_denied_content: "このファイルを表示するための許可がありません。 ファイルが公開されているか、ファイルを共有している必要があります。",
	editaccess_denied_content: "このファイルを編集するための許可がありません。 Docs を使用するライセンスを持っているか、ファイルが自分に共有されているか、ファイルの編集者権限を持っている必要があります。",
	doc_notfound_content: "アクセス対象の文書は削除または移動されました。 リンクが正しいことを確認してください。",
	repository_out_of_space_content: "新規文書を保存するための十分なスペースがありません。他のファイルを削除して、この文書を保存できるだけのスペースを解放してください。",
	fileconnect_denied_content: "Docs がファイル・リポジトリーに接続できません。 後でやり直すか、システム管理者にお問い合わせください。",
	convservice_unavailable_content: "Docs 変換サービスを使用できません。 現時点では要求を処理できません。 後でやり直すか、システム管理者にお問い合わせください。",
	doc_toolarge_content: "アクセスしようとしている文書が大きすぎます。",
	conversion_timeout_content: "現時点では、文書の変換に時間がかかりすぎています。 後でやり直してください。",
	storageserver_error_content: "このサーバーは現在使用できません。 現時点では要求を処理できません。 後でやり直すか、システム管理者にお問い合わせください。",
	server_busy_content:"しばらく待機し、後でやり直してください。",
	publish_locked_file: "このファイルはロックされているため、新規バージョンとして公開できません。ただし、作業中のコンテンツは自動的にドラフトに保存されます。",
	publishErrMsg: "バージョンは公開されませんでした。 ファイルが大きすぎるか、サーバーがタイムアウトになった可能性があります。 やり直すか、キャンセルして、サーバー・ログを調べて問題を特定するように管理者に依頼してください。",
	publishErrMsg_Quota_Out: "この文書の新規バージョンを公開するための十分なスペースがありません。他のファイルを削除して、この文書を公開できるだけのスペースを解放してください。",
	publishErrMsg_NoFile: "この文書は他のユーザーによって削除されたため、公開に失敗しました。",
	publishErrMsg_NoPermission: "このファイルに対する編集者許可がないため、新バージョンの公開に失敗しました。 ファイル所有者に連絡して編集者許可を取得し、やり直してください。"
		
})


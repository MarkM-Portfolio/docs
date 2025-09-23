/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

({
	ctxMenu_createSlide: 	"スライドの作成",
	ctxMenu_renameSlide: 	"スライド名の変更",
	ctxMenu_deleteSlide: 	"スライドの削除",
	ctxMenu_selectAll: 	 	"すべて選択",
	ctxMenu_createTextBox: 	"テキスト・ボックスの追加",
	ctxMenu_addImage:	 	"イメージの追加",		
	ctxMenu_createTable: 	"表の作成",
	ctxMenu_slideTransition: "画面切り替え",
	ctxMenu_slideTransitionTitle: "画面切り替えの選択",
	ctxMenu_slideLayout: 	"スライド・レイアウト",
	ctxMenu_slideTemplates: "マスター・スタイル",
	ctxMenu_paste: 	 		"貼り付け",
	ctxMenu_autoFix: 		"自動修正",
		
	imageDialog: {	
		titleInsert:		"イメージの挿入",
		insertImageBtn:		"挿入",							
		URL:				"URL:",
		uploadFromURL:		"Web からのイメージ",
		imageGallery:		"イメージ・サンプル",
		uploadAnImageFile:	"ファイルからのイメージ",
		uploadImageFileTitle: "ファイルからアップロードするイメージの指定",
		insertImageErrorP1: "イメージを文書に挿入できません。",
		insertImageErrorP2: "サーバーに、ディスク・スペースが十分でないなどの問題があります。",
		insertImageErrorP3: "サーバー・ログを調べて問題を特定するように管理者に依頼してください。"
	},
	
	concordGallery:{
		results:		"結果: ${0}",
		show:			"表示:",
		all	:			"すべて",
		images:			"イメージ",
		pictures: 		"写真",
		arrows: 		"矢印",
		bullets: 		"マーカー",
		computer: 		"コンピューター",
		diagram: 		"図表",
		education: 		"学校",
		environment: 	"環境",
		finance: 		"経理",
		people: 		"人物",
		shape: 			"シェイプ",
		symbol: 		"シンボル",
		transportation:	"交通手段",
		table:			"表",
		search:			"検索",
		loading:		"ロード中..."
	},
	
	contentLockTitle: "コンテンツのロックに関するメッセージ",
	contentLockMsg :  "現在以下のユーザーに使用されているため、選択したオブジェクトの一部に対しては、操作を実行できません。",
	contentLockemail: "メール",
	
	warningforRotatedShape: "選択したオブジェクトの一部は循環オブジェクトであるため、これらのオブジェクトでは操作を実行できません。",
	
	cannotCreateShapesTitle: "シェイプを作成できません",
	cannotCreateShapesMessage: "${productName} は、バージョン 9 より低いバージョンの Internet Explorer でのシェイプの作成をサポートしていません。異なるブラウザーを使用してください。",
	cannotShowShapesTitle: "シェイプを表示できません",

	slidesInUse:"スライドが使用中",
	slidesInUseAll: "選択したスライドでこの操作を実行できません。これらのスライドの一部が、以下のユーザーによって現在使用されているためです:",
	slidesInUseSome: "選択したスライドのいくつかで、この操作を実行できません。これらのスライドが以下のユーザーによって現在使用されているためです:",
	
	contentInUse:"コンテンツが使用中",
	contentInUseAll:"選択したスライドでこの操作を実行できません。これらのスライドの内容の一部が以下のユーザーによって現在使用されているためです:",
	contentInUseSome:"選択したスライドの一部でこの操作を実行できません。その内容が以下のユーザーによって現在使用されているためです:",
		
	undoContentNotAvailable: "コンテンツはもう使用可能ではないため、取り消しを実行できませんでした。",
	redoContentNotAvailable: "コンテンツはもう使用可能ではないため、やり直しを実行できませんでした。",
	undoContentAlreadyExist: "コンテンツは既に存在するため、取り消しを実行できませんでした。" ,
	redoContentAlreadyExist: "コンテンツは既に存在するため、やり直しを実行できませんでした。",
	
	preventTemplateChange:"スライドが使用中",
	preventTemplateChangeMsg: "プレゼンテーションを編集中の別のユーザーが存在するため、マスター・スタイルを変更できません。",
	
	createTblTitle: 	"表の作成",
	createTblLabel: 	"行数と列数を入力してください。 最大値は 10 です。",
	createTblNumRows: "行の数",
	createTblNumCols: "列の数",
	createTblErrMsg:  "値が正の整数であること、空白ではないこと、10 までであることを確認してください。",

	insertTblRowTitle: 	"行の挿入",
	insertTblRowNumberOfRows: 	"行の数:",
	insertTblRowNumberPosition: 	"位置:",
	insertTblRowAbove: 	"上",
	insertTblRowBelow: 	"下",
	
	insertTblColTitle: 	"列の挿入",
	insertTblColNumberOfCols: 	"列の数:",
	insertTblColNumberPosition: 	"位置:",
	insertTblColBefore: "前",
	insertTblColAfter: 	"後",
	
	insertVoicePosition: "位置",
	
 	defaultText_newBox2: "ダブルクリックしてテキストを追加",	
	defaultText_newBox: "クリックしてテキストを入力",
	defaultText_speakerNotesBox: "クリックしてノートを入力",
	
	cannotAddComment_Title: "コメントを追加できません",
	cannotAddComment_Content: "このコンテンツ・ボックスまたはこのスライドにコメントを付けることはできません。コンテンツ・ボックスまたはスライドでサポートしているコメント数は、最大 ${0} 個です。",
	
	invalidImageType: "このイメージ・タイプは、現在サポートされていません。イメージを .bmp、.jpg、.jpeg、.gif、.png に変換し、やり直してください。",
	
	error_unableToDestroyTABContentsInDialog: "ダイアログ内のタブの内容を破棄できません",
	colon:		":",
	tripleDot:	"...",
	ok: 		"OK",
	cancel:		"キャンセル",
	preparingSlide: "スライドの編集を準備中",
	
	slideCommentClose: "コメントを閉じる",
	slideCommentDone: "完了",
	slideCommentPrev: "前へ",
	slideCommentNext: "次へ"
})


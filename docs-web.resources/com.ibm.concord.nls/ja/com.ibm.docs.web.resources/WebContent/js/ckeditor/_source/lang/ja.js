/*
Copyright (c) 2003-2011, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license


Portions Copyright IBM Corp., 2010-2011.
*/

/**
 * @fileOverview Defines the {@link CKEDITOR.lang} object, for the English
 *		language. This is the base file for all translations.
 */

/**#@+
   @type String
   @example
*/

/**
 * Constains the dictionary of language entries.
 * @namespace
 */
// NLS_ENCODING=UTF-8
// NLS_MESSAGEFORMAT_NONE
// G11N GA UI

CKEDITOR.lang["en"] =
{
	/**
	 * #STAT_NON_TRANSLATABLE <for dir: 'dir'>
	 * Please pay attention to variable 'dir' when translating:
	 * Only in 'Arabic' 'Persian' 'Hebrew' make dir a 'rtl' (dir : 'rtl'),
	 * Other languages DO NOT need to translate on variable 'dir', leave it as (dir: 'ltr')
	 */
	dir : "ltr",

	/*
	 * #END_NON_TRANSLATABLE <for dir: 'dir'>
	 */
	editorTitle : "リッチ・テキスト・エディター、%1。",

	// ARIA descriptions.
	toolbars	: "エディターのツールバー",
	editor	: "リッチ・テキスト・エディター",

	// Toolbar buttons without dialogs.
	source			: "ソース",
	newPage			: "新規ページ",
	save			: "保存",
	preview			: "プレビュー:",
	cut				: "切り取り",
	copy			: "コピー",
	paste			: "貼り付け",
	print			: "印刷",
	underline		: "下線",
	bold			: "太字",
	italic			: "イタリック",
	selectAll		: "すべて選択",
	removeFormat	: "書式のクリア",
	strike			: "取り消し線",
	subscript		: "下付き文字",
	superscript		: "上付き文字",
	horizontalrule	: "水平線の挿入",
	pagebreak		: "改ページの挿入",
	pagebreakAlt		: "改ページ",
	unlink			: "リンクの削除",
	undo			: "元に戻す",
	redo			: "やり直し",

	// Common messages and labels.
	common :
	{
		browseServer	: "ブラウザー・サーバー:",
		url				: "URL:",
		protocol		: "プロトコル:",
		upload			: "アップロード:",
		uploadSubmit	: "サーバーに送信",
		image			: "イメージの挿入",
		flash			: "Flash ムービーの挿入",
		form			: "フォームの挿入",
		checkbox		: "チェック・ボックスの挿入",
		radio			: "ラジオ・ボタンの挿入",
		textField		: "テキスト・フィールドの挿入",
		textarea		: "テキスト域の挿入",
		hiddenField		: "隠しフィールドの挿入",
		button			: "ボタンの挿入",
		select			: "選択フィールドの挿入",
		imageButton		: "イメージ・ボタンの挿入",
		notSet			: "<not set>",
		id				: "ID:",
		name			: "名前:",
		langDir			: "テキストの方向:",
		langDirLtr		: "左から右",
		langDirRtl		: "右から左",
		langCode		: "言語コード:",
		longDescr		: "詳細説明の URL:",
		cssClass		: "スタイルシート・クラス:",
		advisoryTitle	: "推奨タイトル:",
		cssStyle		: "スタイル:",
		ok				: "OK",
		cancel			: "キャンセル",
		close : "閉じる",
		preview			: "プレビュー:",
		generalTab		: "一般",
		advancedTab		: "拡張",
		validateNumberFailed	: "この値は数値ではありません。",
		confirmNewPage	: "このコンテンツに対する変更内容で保存していないものはすべて失われます。新しいページをロードしてもよろしいですか?",
		confirmCancel	: "一部のオプションが変更されました。ダイアログを閉じてもよろしいですか?",
		options : "オプション",
		target			: "ターゲット:",
		targetNew		: "新規ウィンドウ (_blank)",
		targetTop		: "最上位ウィンドウ (_top)",
		targetSelf		: "同じウィンドウ (_self)",
		targetParent	: "親ウィンドウ (_parent)",
		langDirLTR		: "左から右",
		langDirRTL		: "右から左",
		styles			: "スタイル:",
		cssClasses		: "スタイルシート・クラス:",
		width			: "幅:",
		height			: "高さ:",
		align			: "位置合わせ:",
		alignLeft		: "左揃え",
		alignRight		: "右揃え",
		alignCenter		: "中央揃え",
		alignTop		: "先頭",
		alignMiddle		: "中央",
		alignBottom		: "下端",
		invalidHeight	: "高さは正の整数でなければなりません。",
		invalidWidth	: "幅は正の整数でなければなりません。",
		invalidCssLength	: "'%1' フィールドに指定された値は、有効な CSS 計測単位 (px、%、in、cm、mm、em、ex、pt、pc) を含むかまたは含まない正の数でなければなりません。",
		invalidHtmlLength	: "'%1' フィールドに指定された値は、有効な HTML 計測単位 (px または %) を含むかまたは含まない正の数でなければなりません。",
		invalidInlineStyle	: "インライン・スタイルに指定された値は、セミコロンで区切られた、\"name : value\" という形式の 1 つ以上のタプルで構成されていなければなりません。",
		cssLengthTooltip	: "ピクセル単位の値の数値または有効な CSS 単位 (px、%、in、cm、mm、em、ex、pt、pc) を含む数値を入力してください。",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">、使用不可</span>"
	},

	contextmenu :
	{
		options : "コンテキスト・メニュー・オプション"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "特殊文字の挿入",
		title		: "記号と特殊文字",
		options : "特殊文字オプション"
	},

	// Link dialog.
	link :
	{
		toolbar		: "URL リンク",
		other 		: "<other>",
		menu		: "リンクの編集...",
		title		: "リンク",
		info		: "リンク情報",
		target		: "ターゲット",
		upload		: "アップロード:",
		advanced	: "拡張",
		type		: "リンク・タイプ:",
		toUrl		: "URL",
		toAnchor	: "テキスト内のアンカーにリンク",
		toEmail		: "メール",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "ターゲット・フレーム名:",
		targetPopupName	: "ポップアップ・ウィンドウ名:",
		popupFeatures	: "ポップアップ・ウィンドウ機能:",
		popupResizable	: "サイズ変更可能",
		popupStatusBar	: "ステータス・バー",
		popupLocationBar	: "ロケーション・バー",
		popupToolbar	: "ツールバー",
		popupMenuBar	: "メニュー・バー",
		popupFullScreen	: "全画面 (IE)",
		popupScrollBars	: "スクロール・バー",
		popupDependent	: "従属 (Netscape)",
		popupLeft		: "左位置",
		popupTop		: "上位置",
		id				: "ID:",
		langDir			: "テキストの方向:",
		langDirLTR		: "左から右",
		langDirRTL		: "右から左",
		acccessKey		: "アクセス・キー:",
		name			: "名前:",
		langCode		: "言語コード:",
		tabIndex		: "タブ索引:",
		advisoryTitle	: "推奨タイトル:",
		advisoryContentType	: "推奨コンテンツ・タイプ:",
		cssClasses		: "スタイルシート・クラス:",
		charset			: "リンクされるリソース文字セット:",
		styles			: "スタイル:",
		rel			: "関係",
		selectAnchor	: "アンカーの選択",
		anchorName		: "アンカー名で",
		anchorId		: "要素 ID で",
		emailAddress	: "メール・アドレス",
		emailSubject	: "メッセージの件名",
		emailBody		: "メッセージ本文",
		noAnchors		: "文書に使用可能なブックマークがありません。ツールバーで「文書のブックマークの挿入」アイコンをクリックして、ブックマークを追加してください。",
		noUrl			: "リンク URL を入力してください",
		noEmail			: "メール・アドレスを入力してください"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "文書のブックマークの挿入",
		menu		: "文書のブックマークの編集",
		title		: "文書のブックマーク",
		name		: "名前:",
		errorName	: "文書のブックマークの名前を入力してください",
		remove		: "文書のブックマークの削除"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "番号付きリストのプロパティー",
		bulletedTitle		: "黒丸付きリストのプロパティー",
		type				: "タイプ",
		start				: "開始番号",
		validateStartNumber				:"リストの開始番号は整数で指定する必要があります。",
		circle				: "黒丸",
		disc				: "白丸",
		square				: "四角",
		none				: "     なし",
		notset				: "<not set>",
		armenian			: "アルメニア語の番号付け",
		georgian			: "グルジア語の番号付け (an、ban、gan、など)",
		lowerRoman			: "小文字のローマ数字 (i、ii、iii、iv、v、など)",
		upperRoman			: "大文字のローマ数字 (I、II、III、IV、V、など)",
		lowerAlpha			: "小文字のアルファベット (a、b、c、d、e、など)",
		upperAlpha			: "大文字のアルファベット (A、B、C、D、E、など)",
		lowerGreek			: "小文字のギリシャ語 (アルファ、ベータ、ガンマ、など)",
		decimal				: "10 進数 (1、2、3、など)",
		decimalLeadingZero	: "先行ゼロ付きの 10 進数 (01、02、03、など)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "検索と置換",
		find				: "検索",
		replace				: "置換",
		findWhat			: "検索:",
		replaceWith			: "置換テキスト:",
		notFoundMsg			: "指定されたテキストは見つかりませんでした。",
		noFindVal			: '検索対象テキストは必須です。',
		findOptions			: "検索オプション",
		matchCase			: "大/小文字の区別",
		matchWord			: "完全に一致する単語",
		matchCyclic			: "循環検索",
		replaceAll			: "すべて置換",
		replaceSuccessMsg	: "%1 個所置換しました。"
	},

	// Table Dialog
	table :
	{
		toolbar		: "表の挿入",
		title		: "表",
		menu		: "表のプロパティー",
		deleteTable	: "表の削除",
		rows		: "行:",
		columns		: "列:",
		border		: "境界線のサイズ:",
		widthPx		: "ピクセル",
		widthPc		: "パーセント",
		widthUnit	: "幅の単位:",
		cellSpace	: "セル間隔:",
		cellPad		: "セル余白:",
		caption		: "表題:",
		summary		: "要約:",
		headers		: "ヘッダー:",
		headersNone		: "     なし",
		headersColumn	: "最初の列",
		headersRow		: "最初の行",
		headersBoth		: "両方",
		invalidRows		: "行数はゼロより大きい整数にしてください。",
		invalidCols		: "列数はゼロより大きい整数にしてください。",
		invalidBorder	: "境界線のサイズは正の数にしてください。",
		invalidWidth	: "表の幅は正の数にしてください。",
		invalidHeight	: "表の高さは正の数にしてください。",
		invalidCellSpacing	: "セル間隔は正の数にしてください。",
		invalidCellPadding	: "セル余白は正の数にしてください。",

		cell :
		{
			menu			: "セル",
			insertBefore	: "前にセルを挿入",
			insertAfter		: "後ろにセルを挿入",
			deleteCell		: "セルの削除",
			merge			: "セルの結合",
			mergeRight		: "右に結合",
			mergeDown		: "下に結合",
			splitHorizontal	: "セルを水平に分割",
			splitVertical	: "セルを垂直に分割",
			title			: "セルのプロパティー",
			cellType		: "セルのタイプ:",
			rowSpan			: "行スパン:",
			colSpan			: "列スパン:",
			wordWrap		: "ワード・ラップ:",
			hAlign			: "水平配置:",
			vAlign			: "垂直配置:",
			alignBaseline	: "ベースライン",
			bgColor			: "背景色:",
			borderColor		: "境界線の色:",
			data			: "データ",
			header			: "ヘッダー",
			yes				: "はい",
			no				: "いいえ",
			invalidWidth	: "セルの幅は正の数でなければなりません。",
			invalidHeight	: "セルの高さは正の数でなければなりません。",
			invalidRowSpan	: "行スパンは正の整数でなければなりません。",
			invalidColSpan	: "列スパンは正の整数でなければなりません。",
			chooseColor : "選択"
		},

		row :
		{
			menu			: "行",
			insertBefore	: "前に行を挿入",
			insertAfter		: "後ろに行を挿入",
			deleteRow		: "行の削除"
		},

		column :
		{
			menu			: "列",
			insertBefore	: "前に列を挿入",
			insertAfter		: "後ろに列を挿入",
			deleteColumn	: "列の削除"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "ボタン・プロパティー",
		text		: "テキスト (値)",
		type		: "タイプ:",
		typeBtn		: "ボタン",
		typeSbm		: "送信",
		typeRst		: "リセット"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "チェック・ボックス・プロパティー",
		radioTitle	: "ラジオ・ボタン・プロパティー",
		value		: "値:",
		selected	: "選択済み"
	},

	// Form Dialog.
	form :
	{
		title		: "フォームの挿入",
		menu		: "フォームのプロパティー",
		action		: "アクション:",
		method		: "メソッド:",
		encoding	: "エンコード:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "フィールド・プロパティーの選択",
		selectInfo	: "情報の選択",
		opAvail		: "使用可能なオプション",
		value		: "値:",
		size		: "サイズ:",
		lines		: "行",
		chkMulti	: "複数選択の許可",
		opText		: "テキスト:",
		opValue		: "値:",
		btnAdd		: "追加",
		btnModify	: "変更",
		btnUp		: "上",
		btnDown		: "下",
		btnSetValue : "選択済みの値として設定",
		btnDelete	: "削除"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "テキスト域のプロパティー",
		cols		: "列:",
		rows		: "行:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "テキスト・フィールドのプロパティー",
		name		: "名前:",
		value		: "値:",
		charWidth	: "文字幅:",
		maxChars	: "最大文字数:",
		type		: "タイプ:",
		typeText	: "テキスト",
		typePass	: "パスワード"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "隠しフィールドのプロパティー",
		name	: "名前:",
		value	: "値:"
	},

	// Image Dialog.
	image :
	{
		title		: "イメージ",
		titleButton	: "イメージ・ボタンのプロパティー",
		menu		: "イメージのプロパティー...",
		infoTab	: "イメージ情報",
		btnUpload	: "サーバーに送信",
		upload	: "アップロード",
		alt		: "代替テキスト:",
		lockRatio	: "比率の固定",
		resetSize	: "サイズのリセット",
		border	: "境界線:",
		hSpace	: "横方向の余白:",
		vSpace	: "縦方向の余白:",
		alertUrl	: "イメージの URL を入力してください",
		linkTab	: "リンク",
		button2Img	: "選択したイメージ・ボタンを単純イメージに変換しますか?",
		img2Button	: "選択したイメージをイメージ・ボタンに変換しますか?",
		urlMissing : "イメージのソース URL がありません。",
		validateBorder : "境界線は正の整数でなければなりません。",
		validateHSpace : "横方向の余白は正の整数でなければなりません。",
		validateVSpace : "縦方向の余白は正の整数でなければなりません。"
	},

	// Flash Dialog
	flash :
	{
		properties		: "Flash のプロパティー",
		propertiesTab	: "プロパティー",
		title		: "フラッシュ",
		chkPlay		: "自動再生",
		chkLoop		: "ループ",
		chkMenu		: "Flash メニューの有効化",
		chkFull		: "全画面表示の許可",
 		scale		: "スケール:",
		scaleAll		: "すべて表示",
		scaleNoBorder	: "境界線なし",
		scaleFit		: "ウィンドウに合わせる",
		access			: "スクリプト・アクセス:",
		accessAlways	: "ALWAYS",
		accessSameDomain	: "同じドメインのみ",
		accessNever	: "アクセスなし",
		alignAbsBottom: "下端に合わせる",
		alignAbsMiddle: "中央に合わせる",
		alignBaseline	: "ベースライン",
		alignTextTop	: "テキストの上部",
		quality		: "品質:",
		qualityBest	: "最高",
		qualityHigh	: "高",
		qualityAutoHigh	: "高 (自動)",
		qualityMedium	: "中",
		qualityAutoLow	: "低 (自動)",
		qualityLow	: "低",
		windowModeWindow	: "ウィンドウ",
		windowModeOpaque	: "不透明",
		windowModeTransparent	: "透明",
		windowMode	: "ウィンドウ・モード:",
		flashvars	: "変数:",
		bgcolor	: "背景色:",
		hSpace	: "横方向の余白:",
		vSpace	: "縦方向の余白:",
		validateSrc : "URL が空であってはなりません。",
		validateHSpace : "横方向の余白は正の整数でなければなりません。",
		validateVSpace : "縦方向の余白は正の整数でなければなりません。"
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "スペル・チェック",
		title			: "スペル・チェック",
		notAvailable	: "現在サービスは利用できません。",
		errorLoading	: "アプリケーション・サービス・ホストのロード中にエラーが発生しました: %s。",
		notInDic		: "辞書にありません",
		changeTo		: "変更後",
		btnIgnore		: "無視する",
		btnIgnoreAll	: "すべて無視する",
		btnReplace		: "置換",
		btnReplaceAll	: "すべて置換",
		btnUndo			: "元に戻す",
		noSuggestions	: "- 候補なし -",
		progress		: "スペル・チェック進行中...",
		noMispell		: "スペル・チェック完了: ミススペルはありません",
		noChanges		: "スペル・チェック完了: 修正した語はありません",
		oneChange		: "スペル・チェック完了: 1 語修正しました",
		manyChanges		: "スペル・チェック完了: %1 語修正しました",
		ieSpellDownload	: "スペル・チェッカーがインストールされていません。ダウンロードしますか?"
	},

	smiley :
	{
		toolbar	: "顔文字の挿入",
		title	: "顔文字",
		options : "顔文字オプション"
	},

	elementsPath :
	{
		eleLabel : "エレメント・パス",
		eleTitle : "%1 エレメント"
	},

	numberedlist : "番号付きリスト",
	bulletedlist : "黒丸付きリスト",
	indent : "インデントの増加",
	outdent : "インデントの減少",

	bidi :
	{
		ltr : "左から右",
		rtl : "右から左",
	},

	justify :
	{
		left : "左揃え",
		center : "中央揃え",
		right : "右揃え",
		block : "行末揃え"
	},

	blockquote : "引用",

	clipboard :
	{
		title		: "貼り付け",
		cutError	: "ブラウザーのセキュリティー設定により自動切り取りが禁止されています。代わりにキーボードで Ctrl+X を使用してください。",
		copyError	: "ブラウザーのセキュリティー設定により自動コピーが禁止されています。 代わりにキーボードで Ctrl+C を使用してください。",
		pasteMsg	: "Ctrl+V (MAC では Cmd+V) を押して以下に貼り付けます。",
		securityMsg	: "ブラウザーのセキュリティー設定により、クリップボードからの直接貼り付けが禁止されています。",
		pasteArea	: "貼り付け領域"
	},

	pastefromword :
	{
		confirmCleanup	: "貼り付けようとしているのは、Word からコピーしたテキストのようです。貼り付ける前にテキストをクリーンアップしますか?",
		toolbar			: "形式を選択して貼り付け",
		title			: "形式を選択して貼り付け",
		error			: "内部エラーが発生したので、貼り付けるデータをクリーンアップできませんでした。"
	},

	pasteText :
	{
		button	: "プレーン・テキストとして貼り付け",
		title	: "プレーン・テキストとして貼り付け"
	},

	templates :
	{
		button 			: "テンプレート",
		title : "コンテンツ・テンプレート",
		options : "テンプレート・オプション",
		insertOption: "実際のコンテンツを置換",
		selectPromptMsg: "エディターで開くテンプレートを選択してください",
		emptyListMsg : "(テンプレートは定義されていません)"
	},

	showBlocks : "ブロックの表示",

	stylesCombo :
	{
		label		: "スタイル",
		panelTitle 	: "スタイル",
		panelTitle1	: "ブロック・スタイル",
		panelTitle2	: "インライン・スタイル",
		panelTitle3	: "オブジェクト・スタイル"
	},

	format :
	{
		label		: "書式",
		panelTitle	: "段落の書式",

		tag_p		: "標準",
		tag_pre		: "書式設定済み",
		tag_address	: "アドレス",
		tag_h1		: "見出し 1",
		tag_h2		: "見出し 2",
		tag_h3		: "見出し 3",
		tag_h4		: "見出し 4",
		tag_h5		: "見出し 5",
		tag_h6		: "見出し 6",
		tag_div		: "標準 (DIV)"
	},

	div :
	{
		title				: "DIV コンテナーの作成",
		toolbar				: "DIV コンテナーの作成",
		cssClassInputLabel	: "スタイルシート・クラス",
		styleSelectLabel	: "スタイル",
		IdInputLabel		: "ID",
		languageCodeInputLabel	: "  言語コード",
		inlineStyleInputLabel	: "インライン・スタイル",
		advisoryTitleInputLabel	: "推奨タイトル",
		langDirLabel		: "テキストの方向",
		langDirLTRLabel		: "左から右",
		langDirRTLLabel		: "右から左",
		edit				: "DIV の編集",
		remove				: "DIV の削除"
  	},

	iframe :
	{
		title		: "IFrame のプロパティー",
		toolbar		: "IFrame の挿入",
		noUrl		: "iframe の URL を入力してくださいL",
		scrolling	: "スクロールバーを有効化",
		border		: "フレームの境界線を表示"
	},

	font :
	{
		label		: "フォント",
		voiceLabel	: "フォント",
		panelTitle	: "フォント名"
	},

	fontSize :
	{
		label		: "サイズ",
		voiceLabel	: "フォント・サイズ",
		panelTitle	: "フォント・サイズ"
	},

	colorButton :
	{
		textColorTitle	: "テキストの色",
		bgColorTitle	: "マーカー",
		panelTitle		: "色の選択",
		auto			: "自動",
		more			: "その他の色..."
	},

	colors :
	{
		"000" : "ブラック",
		"800000" : "えび茶",
		"8B4513" : "サドル・ブラウン",
		"2F4F4F" : "ダーク・スレート・グレイ",
		"008080" : "ティール",
		"000080" : "濃紺",
		"4B0082" : "藍色",
		"696969" : "ダーク・グレイ",
		"B22222" : "赤煉瓦色",
		"A52A2A" : "茶",
		"DAA520" : "ゴールデン・ロッド",
		"006400" : "ダーク・グリーン",
		"40E0D0" : "ターコイズ",
		"0000CD" : "ミディアム・ブルー",
		"800080" : "紫",
		"808080" : "グレイ",
		"F00" : "赤",
		"FF8C00" : "ダーク・オレンジ",
		"FFD700" : "金",
		"008000" : "緑",
		"0FF" : "シアン",
		"00F" : "青",
		"EE82EE" : "すみれ色",
		"A9A9A9" : "くすんだグレイ",
		"FFA07A" : "ライト・サーモン",
		"FFA500" : "オレンジ",
		"FFFF00" : "黄",
		"00FF00" : "ライム",
		"AFEEEE" : "ペイル・ターコイズ",
		"ADD8E6" : "ライト・ブルー",
		"DDA0DD" : "プラム",
		"D3D3D3" : "ライト・グレー",
		"FFF0F5" : "ラベンダー・ブラッシ",
		"FAEBD7" : "アンティーク・ホワイト",
		"FFFFE0" : "ライト・イエロー",
		"F0FFF0" : "ハニーデュー",
		"F0FFFF" : "アズール",
		"F0F8FF" : "アリス・ブルー",
		"E6E6FA" : "ラベンダー",
		"FFF" : "ホワイト"
	},

	scayt :
	{
		title			: "入力時のスペル・チェック",
		opera_title		: "Opera ではサポートされていません",
		enable			: "SCAYT を有効にする",
		disable			: "SCAYT を無効にする",
		about			: "SCAYT について",
		toggle			: "SCAYT の切り替え",
		options			: "オプション",
		langs			: "言語",
		moreSuggestions	: "その他の提案",
		ignore			: "無視する",
		ignoreAll		: "すべて無視する",
		addWord			: "単語の追加",
		emptyDic		: "辞書名を空にすることはできません。",

		optionsTab		: "オプション",
		allCaps			: "大文字だけの語を無視",
		ignoreDomainNames : "ドメイン・ネームを無視",
		mixedCase		: "大/小文字混合の語を無視",
		mixedWithDigits	: "数字が入っている語を無視",

		languagesTab	: "言語",

		dictionariesTab	: "辞書",
		dic_field_name	: "辞書名",
		dic_create		: "作成",
		dic_restore		: "復元",
		dic_delete		: "削除",
		dic_rename		: "名前変更",
		dic_info		: "最初、ユーザー辞書は Cookie に保管されます。しかし、Cookie にはサイズの制限があります。ユーザー辞書が大きくなって Cookie に保管できなくなったら、辞書をサーバーに保管できます。個人辞書をサーバーに保管するには、辞書の名前を指定する必要があります。既に保管した辞書がある場合は、名前を入力して「復元」ボタンをクリックしてください。",

		aboutTab		: "詳細情報"
	},

	about :
	{
		title		: "CKEditor について",
		dlgTitle	: "CKEditor について",
		help	: "ヘルプを参照する場合は $1 を確認してください。",
		userGuide : "CKEditor User's Guide",
		moreInfo	: "ライセンス情報については次の Web サイトにアクセスしてください:",
		copy		: "Copyright &copy; $1. All rights reserved."
	},

	maximize : "最大化",
	minimize : "最小化",

	fakeobjects :
	{
		anchor	: "アンカー",
		flash	: "Flash アニメーション",
		iframe		: "IFrame",
		hiddenfield	: "隠しフィールド",
		unknown	: "不明なオブジェクト"
	},

	resize : "ドラッグしてサイズ変更",

	colordialog :
	{
		title		: "色の選択",
		options	:	"色のオプション",
		highlight	: "強調表示",
		selected	: "選択した色",
		clear		: "クリア"
	},

	toolbarCollapse	: "ツールバーを省略表示",
	toolbarExpand	: "ツールバーを展開",

	toolbarGroups :
	{
		document : "文書",
		clipboard : "クリップボード/元に戻す",
		editing : "編集中",
		forms : "フォーム",
		basicstyles : "基本スタイル",
		paragraph : "段落",
		links : "リンク",
		insert : "挿入",
		styles : "スタイル",
		colors : "色の選択",
		tools : "ツール"
	},

	bidi :
	{
		ltr : "左から右のテキストに変更",
		rtl : "右から左のテキストに変更"
	},

	docprops :
	{
		label : "文書のプロパティー",
		title : "文書のプロパティー",
		design : "デザイン",
		meta : "メタ・タグ",
		chooseColor : "選択",
		other : "その他...",
		docTitle :	"ページのタイトル",
		charset : 	"文字セット・エンコード",
		charsetOther : "その他の文字セット・エンコード",
		charsetASCII : "ASCII",
		charsetCE : "中央ヨーロッパ",
		charsetCT : "中国語 (繁体字) (Big5)",
		charsetCR : "キリル文字",
		charsetGR : "ギリシャ語",
		charsetJP : "日本語",
		charsetKR : "韓国語",
		charsetTR : "トルコ語",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "西ヨーロッパ",
		docType : "文書タイプ見出し",
		docTypeOther : "その他の文書タイプ見出し",
		xhtmlDec : "XHTML 宣言を組み込む",
		bgColor : "マーカー",
		bgImage : "背景イメージ URL",
		bgFixed : "スクロールしない (固定の) 背景",
		txtColor : "テキストの色",
		margin : "ページ余白",
		marginTop : "先頭",
		marginLeft : "左揃え",
		marginRight : "右揃え",
		marginBottom : "下端",
		metaKeywords : "文書索引キーワード (コンマ区切り)",
		metaDescription : "文書の説明",
		metaAuthor : "作成者",
		metaCopyright : "著作権",
		previewHtml : "<p>これは<strong>サンプル・テキスト</strong>です。<a href=\"javascript:void(0)\">CKEditor</a> を使用しています。</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "インチ",
			widthCm	: "センチメートル",
			widthMm	: "ミリメートル",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "ポイント",
			widthPc	: "パイカ"
		},
		table :
		{
			heightUnit	: "高さの単位:",
			insertMultipleRows : "行の挿入",
			insertMultipleCols : "列の挿入",
			noOfRows : "行の数:",
			noOfCols : "列の数:",
			insertPosition : "位置: ",
			insertBefore : "前",
			insertAfter : "後",
			selectTable : "表の選択",
			selectRow : "行の選択",
			columnTitle : "列",
			colProps : "列プロパティー",
			invalidColumnWidth	: "列の幅は正の数にしてください。"
		},
		cell :
		{
			title : "セル"
		},
		emoticon :
		{
			angel		: "天使",
			angry		: "怒り",
			cool		: "クール",
			crying		: "泣き顔",
			eyebrow		: "眉",
			frown		: "しかめっ面",
			goofy		: "おどけ",
			grin		: "にこにこ",
			half		: "半分",
			idea		: "アイデア",
			laughing	: "大笑い",
			laughroll	: "笑い転げる",
			no			: "いいえ",
			oops		: "びっくり",
			shy			: "はにかみ",
			smile		: "スマイル",
			tongue		: "舌",
			wink		: "ウィンク",
			yes			: "はい"
		},

		menu :
		{
			link	: "リンクの挿入",
			list	: "リスト",
			paste	: "貼り付け",
			action	: "アクション",
			align	: "位置合わせ",
			emoticon: "顔文字"
		},

		iframe :
		{
			title	: "IFrame"
		},

		list:
		{
			numberedTitle		: "番号付きリスト",
			bulletedTitle		: "黒丸付きリスト"
		},

		// Anchor dialog
		anchor :
		{
			description	: "「セクション 1.2」などの分かりやすいブックマーク名を入力してください。ブックマークの挿入後に、「リンク」アイコンまたは「文書のブックマーク・リンク」アイコンをクリックして、ブックマークにリンクします。",
			title		: "文書のブックマーク・リンク",
			linkTo		: "リンク先:"
		},

		urllink :
		{
			title : "URL リンク",
			linkText : "リンク・テキスト:",
			selectAnchor: "アンカーの選択:",
			nourl: "テキスト・フィールドに URL を入力してください。",
			urlhelp: "ユーザーがこのリンクをクリックしたときに開く URL (http://www.example.com など) を入力するか、貼り付けます。",
			displaytxthelp: "リンクのテキスト表示を入力します。",
			openinnew : "新しいウィンドウでリンクを開く"
		},

		spellchecker :
		{
			title : "スペルを確認してください",
			replace : "置換:",
			suggesstion : "提案:",
			withLabel : "置換後:",
			replaceButton : "置換",
			replaceallButton:"すべて置換",
			skipButton:"スキップ",
			skipallButton: "すべてをスキップ",
			undochanges: "変更の取り消し",
			complete: "スペル・チェック完了",
			problem: "XML データの取得中に問題が発生しました",
			addDictionary: "辞書に追加",
			editDictionary: "辞書の編集"
		},

		status :
		{
			keystrokeForHelp: "ALT 0 キーを押すとヘルプが表示されます。"
		},

		linkdialog :
		{
			label : "リンク・ダイアログ"
		},

		image :
		{
			previewText : "この例に示すように、テキストは追加するイメージの周囲に配置されます。"
		}
	}

};

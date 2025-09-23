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
	editorTitle : "Rich Text 編輯器 %1。",

	// ARIA descriptions.
	toolbars	: "編輯器工具列",
	editor	: "Rich Text 編輯器",

	// Toolbar buttons without dialogs.
	source			: "來源",
	newPage			: "新建頁面",
	save			: "儲存",
	preview			: "預覽：",
	cut				: "剪下",
	copy			: "複製",
	paste			: "貼上",
	print			: "列印",
	underline		: "底線",
	bold			: "粗體",
	italic			: "斜體",
	selectAll		: "全選",
	removeFormat	: "移除格式",
	strike			: "刪除線",
	subscript		: "下標",
	superscript		: "上標",
	horizontalrule	: "插入水平線",
	pagebreak		: "插入分頁",
	pagebreakAlt		: "分頁",
	unlink			: "移除鏈結",
	undo			: "復原",
	redo			: "重做",

	// Common messages and labels.
	common :
	{
		browseServer	: "瀏覽器伺服器：",
		url				: "URL：",
		protocol		: "通訊協定：",
		upload			: "上傳：",
		uploadSubmit	: "傳送至伺服器",
		image			: "插入影像",
		flash			: "插入 Flash 影片",
		form			: "插入表單",
		checkbox		: "插入勾選框",
		radio			: "插入圓鈕",
		textField		: "插入文字欄位",
		textarea		: "插入文字區",
		hiddenField		: "插入隱藏欄位",
		button			: "插入按鈕",
		select			: "插入選取欄位",
		imageButton		: "插入影像按鈕",
		notSet			: "<not set>",
		id				: "ID：",
		name			: "名稱︰",
		langDir			: "文字方向：",
		langDirLtr		: "從左到右",
		langDirRtl		: "從右到左",
		langCode		: "語言碼：",
		longDescr		: "詳細說明 URL：",
		cssClass		: "樣式表類別：",
		advisoryTitle	: "宣告標題：",
		cssStyle		: "樣式：",
		ok				: "確定",
		cancel			: "取消",
		close : "關閉",
		preview			: "預覽：",
		generalTab		: "一般",
		advancedTab		: "進階",
		validateNumberFailed	: "此值不是數字。",
		confirmNewPage	: "這個內容任何未儲存的變更都會遺失。您確定要載入新的頁面嗎？",
		confirmCancel	: "部分選項已變更。您確定要關閉對話框？",
		options : "選項",
		target			: "目標：",
		targetNew		: "新視窗 (_blank)",
		targetTop		: "最上方視窗 (_top)",
		targetSelf		: "相同視窗 (_self)",
		targetParent	: "上層視窗 (_parent)",
		langDirLTR		: "從左到右",
		langDirRTL		: "從右到左",
		styles			: "樣式：",
		cssClasses		: "樣式表類別：",
		width			: "寬度：",
		height			: "高度：",
		align			: "對齊：",
		alignLeft		: "靠左",
		alignRight		: "靠右",
		alignCenter		: "置中",
		alignTop		: "靠上",
		alignMiddle		: "置中",
		alignBottom		: "靠下",
		invalidHeight	: "高度必須是正整數。",
		invalidWidth	: "寬度必須是正整數。",
		invalidCssLength	: "指定給 '%1' 欄位的值必須是正數，可含或不含有效的 CSS 度量單位（px、%、in、cm、mm、em、ex、pt 或 pc）。",
		invalidHtmlLength	: "指定給 '%1' 欄位的值必須是正數，可含或不含有效的 HTML 度量單位（px 或 %）。",
		invalidInlineStyle	: "指定給行內樣式的值必須由一個以上格式為「名稱 : 值」的值組所組成，並以分號區隔。",
		cssLengthTooltip	: "請以像素為單位輸入一個數字作為值，或是輸入含有效 CSS 單位（px、%、in、cm、mm、em、ex、pt 或 pc）的數字。",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">，無法使用</span>"
	},

	contextmenu :
	{
		options : "快速功能表選項"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "插入特殊字元 ",
		title		: "特殊字元",
		options : "特殊字元選項"
	},

	// Link dialog.
	link :
	{
		toolbar		: "URL 鏈結",
		other 		: "<other>",
		menu		: "編輯鏈結...",
		title		: "鏈結",
		info		: "鏈結資訊",
		target		: "目標",
		upload		: "上傳：",
		advanced	: "進階",
		type		: "鏈結類型：",
		toUrl		: "URL",
		toAnchor	: "鏈結至文字中的錨點",
		toEmail		: "電子郵件",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "目標圖文框名稱：",
		targetPopupName	: "蹦現視窗名稱：",
		popupFeatures	: "蹦現視窗功能：",
		popupResizable	: "可調整",
		popupStatusBar	: "狀態列",
		popupLocationBar	: "位置列",
		popupToolbar	: "工具列",
		popupMenuBar	: "功能表列",
		popupFullScreen	: "全螢幕 (IE)",
		popupScrollBars	: "捲軸",
		popupDependent	: "依視窗大小 (Netscape)",
		popupLeft		: "左邊位置",
		popupTop		: "頂端位置",
		id				: "ID：",
		langDir			: "文字方向：",
		langDirLTR		: "從左到右",
		langDirRTL		: "從右到左",
		acccessKey		: "存取鍵：",
		name			: "名稱︰",
		langCode		: "語言碼：",
		tabIndex		: "標籤索引：",
		advisoryTitle	: "宣告標題：",
		advisoryContentType	: "宣告內容類型：",
		cssClasses		: "樣式表類別：",
		charset			: "鏈結的資源字集：",
		styles			: "樣式：",
		rel			: "關係",
		selectAnchor	: "選取錨點",
		anchorName		: "依錨點名稱",
		anchorId		: "依元素 ID",
		emailAddress	: "電子郵件位址",
		emailSubject	: "訊息主旨",
		emailBody		: "訊息內文",
		noAnchors		: "文件中沒有可用的書籤。請按一下工具列上的「插入文件書籤」圖示來新增書籤。",
		noUrl			: "請鍵入鏈結 URL",
		noEmail			: "請鍵入電子郵件位址"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "插入文件書籤",
		menu		: "編輯文件書籤",
		title		: "文件書籤",
		name		: "名稱︰",
		errorName	: "請輸入文件書籤的名稱",
		remove		: "移除文件書籤"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "編號清單內容",
		bulletedTitle		: "項目符號清單內容",
		type				: "類型",
		start				: "起始",
		validateStartNumber				:"清單的起始號碼必須是整數。",
		circle				: "圓形",
		disc				: "實心圓",
		square				: "方形",
		none				: "無",
		notset				: "<not set>",
		armenian			: "亞美尼亞文編號",
		georgian			: "喬治亞文編號（an、ban、gan 等等）",
		lowerRoman			: "小寫羅馬數字（i、ii、iii、iv、v 等等）",
		upperRoman			: "大寫羅馬數字（I、II、III、IV、V 等等）",
		lowerAlpha			: "小寫字母（a、b、c、d、e 等等）",
		upperAlpha			: "大寫字母（A、B、C、D、E 等等）",
		lowerGreek			: "小寫希臘文（alpha、beta、gamma 等等）",
		decimal				: "十進位數（1、2、3 等等）",
		decimalLeadingZero	: "十進位前導零數（01、02、03 等等）"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "尋找/取代",
		find				: "尋找",
		replace				: "取代",
		findWhat			: "尋找：",
		replaceWith			: "取代為：",
		notFoundMsg			: "找不到指定的文字。",
		noFindVal			: '請提供要尋找的文字。',
		findOptions			: "尋找選項",
		matchCase			: "大小寫相符",
		matchWord			: "全字拼寫須相符",
		matchCyclic			: "比對循環",
		replaceAll			: "全部取代",
		replaceSuccessMsg	: "已取代 %1 個項目。"
	},

	// Table Dialog
	table :
	{
		toolbar		: "插入表格",
		title		: "表格",
		menu		: "表格內容",
		deleteTable	: "刪除表格",
		rows		: "列：",
		columns		: "直欄：",
		border		: "邊框大小：",
		widthPx		: "像素",
		widthPc		: "百分比",
		widthUnit	: "寬度單位：",
		cellSpace	: "資料格間距：",
		cellPad		: "資料格行距：",
		caption		: "標題：",
		summary		: "摘要：",
		headers		: "標頭：",
		headersNone		: "無",
		headersColumn	: "第一欄",
		headersRow		: "第一列",
		headersBoth		: "兩者",
		invalidRows		: "列數必須是大於零的整數。",
		invalidCols		: "欄數必須是大於零的整數。",
		invalidBorder	: "邊框大小必須是正數。",
		invalidWidth	: "表格寬度必須是正數。",
		invalidHeight	: "表格高度必須是正數。",
		invalidCellSpacing	: "資料格間距必須是正數。",
		invalidCellPadding	: "資料格行距必須是正數。",

		cell :
		{
			menu			: "資料格",
			insertBefore	: "在前面插入資料格",
			insertAfter		: "在後面插入資料格",
			deleteCell		: "刪除資料格",
			merge			: "合併資料格",
			mergeRight		: "向右合併",
			mergeDown		: "向下合併",
			splitHorizontal	: "水平分割資料格",
			splitVertical	: "垂直分割資料格",
			title			: "資料格內容",
			cellType		: "資料格類型：",
			rowSpan			: "列跨距：",
			colSpan			: "欄跨距：",
			wordWrap		: "自動換行：",
			hAlign			: "水平對齊：",
			vAlign			: "垂直對齊：",
			alignBaseline	: "基準線",
			bgColor			: "背景顏色：",
			borderColor		: "邊框顏色：",
			data			: "資料",
			header			: "標頭",
			yes				: "是",
			no				: "否",
			invalidWidth	: "資料格寬度必須是正數。",
			invalidHeight	: "資料格高度必須是正數。",
			invalidRowSpan	: "列跨距必須是正整數。",
			invalidColSpan	: "欄跨距必須是正整數。",
			chooseColor : "選擇"
		},

		row :
		{
			menu			: "列",
			insertBefore	: "在前面插入列",
			insertAfter		: "在後面插入列",
			deleteRow		: "刪除列"
		},

		column :
		{
			menu			: "直欄",
			insertBefore	: "在前面插入直欄",
			insertAfter		: "在後面插入直欄",
			deleteColumn	: "刪除直欄"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "按鈕內容",
		text		: "文字（值）：",
		type		: "類型：",
		typeBtn		: "按鈕",
		typeSbm		: "提交",
		typeRst		: "重設"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "勾選框內容",
		radioTitle	: "圓鈕內容",
		value		: "值：",
		selected	: "已選取"
	},

	// Form Dialog.
	form :
	{
		title		: "插入表單",
		menu		: "表單內容",
		action		: "動作： ",
		method		: "方法：",
		encoding	: "編碼："
	},

	// Select Field Dialog.
	select :
	{
		title		: "選取欄位內容",
		selectInfo	: "選取資訊",
		opAvail		: "可用選項",
		value		: "值：",
		size		: "大小：",
		lines		: "行",
		chkMulti	: "容許多重選項",
		opText		: "文字：",
		opValue		: "值：",
		btnAdd		: "新增",
		btnModify	: "修改",
		btnUp		: "上移",
		btnDown		: "下移",
		btnSetValue : "設為選取值",
		btnDelete	: "刪除"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "文字區內容",
		cols		: "直欄：",
		rows		: "列："
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "文字欄位內容",
		name		: "名稱︰",
		value		: "值：",
		charWidth	: "字元寬度：",
		maxChars	: "字元數上限：",
		type		: "類型：",
		typeText	: "文字",
		typePass	: "密碼"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "隱藏欄位內容",
		name	: "名稱︰",
		value	: "值："
	},

	// Image Dialog.
	image :
	{
		title		: "影像",
		titleButton	: "影像按鈕內容",
		menu		: "影像內容...",
		infoTab	: "影像資訊",
		btnUpload	: "傳送至伺服器",
		upload	: "上傳",
		alt		: "替代文字：",
		lockRatio	: "鎖定比例",
		resetSize	: "重設大小",
		border	: "邊框：",
		hSpace	: "水平間距：",
		vSpace	: "垂直間距：",
		alertUrl	: "請鍵入影像 URL",
		linkTab	: "鏈結",
		button2Img	: "您要將選取的影像按鈕轉換成簡式影像嗎？",
		img2Button	: "您要將選取的影像轉換成影像按鈕嗎？",
		urlMissing : "遺漏影像來源 URL。",
		validateBorder : "邊框必須是正整數。",
		validateHSpace : "水平間距必須是正整數。",
		validateVSpace : "垂直間距必須是正整數。"
	},

	// Flash Dialog
	flash :
	{
		properties		: "Flash 內容",
		propertiesTab	: "內容",
		title		: "Flash",
		chkPlay		: "自動播放",
		chkLoop		: "重複播放",
		chkMenu		: "啟用 Flash 功能表",
		chkFull		: "容許全螢幕",
 		scale		: "比例：",
		scaleAll		: "全部顯示",
		scaleNoBorder	: "無邊框",
		scaleFit		: "最適化",
		access			: "Script 存取：",
		accessAlways	: "一律",
		accessSameDomain	: "相同網域",
		accessNever	: "絕不",
		alignAbsBottom: "絕對靠下",
		alignAbsMiddle: "絕對置中",
		alignBaseline	: "基準線",
		alignTextTop	: "文字上方",
		quality		: "品質：",
		qualityBest	: "最佳",
		qualityHigh	: "高",
		qualityAutoHigh	: "高（自動）",
		qualityMedium	: "中",
		qualityAutoLow	: "低（自動）",
		qualityLow	: "低",
		windowModeWindow	: "視窗",
		windowModeOpaque	: "不透明",
		windowModeTransparent	: "透明",
		windowMode	: "視窗模式：",
		flashvars	: "變數：",
		bgcolor	: "背景顏色：",
		hSpace	: "水平間距：",
		vSpace	: "垂直間距：",
		validateSrc : "URL 不得為空白。",
		validateHSpace : "水平間距必須是正整數。",
		validateVSpace : "垂直間距必須是正整數。"
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "拼字檢查",
		title			: "拼字檢查",
		notAvailable	: "抱歉，目前無法使用服務。",
		errorLoading	: "載入應用程式服務主機時發生錯誤：%s。",
		notInDic		: "不在字典中",
		changeTo		: "變更為",
		btnIgnore		: "忽略",
		btnIgnoreAll	: "全部忽略",
		btnReplace		: "取代",
		btnReplaceAll	: "全部取代",
		btnUndo			: "復原",
		noSuggestions	: "- 無建議 -",
		progress		: "拼字檢查進行中...",
		noMispell		: "拼字檢查完成：找不到拼字錯誤",
		noChanges		: "拼字檢查完成：未變更任何單字",
		oneChange		: "拼字檢查完成：已變更一個單字",
		manyChanges		: "拼字檢查完成：已變更 %1 個單字",
		ieSpellDownload	: "未安裝拼字檢查程式。您要現在下載嗎？"
	},

	smiley :
	{
		toolbar	: "插入表情符號",
		title	: "表情符號",
		options : "表情符號選項"
	},

	elementsPath :
	{
		eleLabel : "元素路徑",
		eleTitle : "%1 元素"
	},

	numberedlist : "編號清單",
	bulletedlist : "項目符號清單",
	indent : "增加縮排",
	outdent : "減少縮排",

	bidi :
	{
		ltr : "從左到右",
		rtl : "從右到左",
	},

	justify :
	{
		left : "靠左對齊",
		center : "置中對齊",
		right : "靠右對齊",
		block : "左右對齊"
	},

	blockquote : "區塊引文",

	clipboard :
	{
		title		: "貼上",
		cutError	: "您的瀏覽器安全性設定會阻止自動剪下。請改用鍵盤上的 Ctrl+X。",
		copyError	: "您的瀏覽器安全性設定會阻止自動複製。請改用鍵盤上的 Ctrl+C。",
		pasteMsg	: "請按 Ctrl+V（Mac 上請按 Cmd+V）來貼在下方。",
		securityMsg	: "瀏覽器的安全性設定，使得您無法從剪貼簿直接貼上。",
		pasteArea	: "貼上區域"
	},

	pastefromword :
	{
		confirmCleanup	: "您要貼上的文字似乎是從 Word 所複製。您要在貼上之前將其清除嗎？",
		toolbar			: "選擇性貼上",
		title			: "選擇性貼上",
		error			: "無法清除貼上的資料，因為發生內部錯誤"
	},

	pasteText :
	{
		button	: "貼成純文字",
		title	: "貼成純文字"
	},

	templates :
	{
		button 			: "範本",
		title : "內容範本",
		options : "範本選項",
		insertOption: "取代實際內容",
		selectPromptMsg: "選取要在編輯器中開啟的範本",
		emptyListMsg : "（未定義範本）"
	},

	showBlocks : "顯示區塊",

	stylesCombo :
	{
		label		: "樣式",
		panelTitle 	: "樣式",
		panelTitle1	: "區塊樣式",
		panelTitle2	: "行內樣式",
		panelTitle3	: "物件樣式"
	},

	format :
	{
		label		: "格式",
		panelTitle	: "段落格式",

		tag_p		: "一般",
		tag_pre		: "格式化",
		tag_address	: "位址",
		tag_h1		: "標題 1",
		tag_h2		: "標題 2",
		tag_h3		: "標題 3",
		tag_h4		: "標題 4",
		tag_h5		: "標題 5",
		tag_h6		: "標題 6",
		tag_div		: "一般 (DIV)"
	},

	div :
	{
		title				: "建立 DIV 儲存器",
		toolbar				: "建立 DIV 儲存器",
		cssClassInputLabel	: "樣式表類別",
		styleSelectLabel	: "樣式",
		IdInputLabel		: "ID",
		languageCodeInputLabel	: " 語言碼",
		inlineStyleInputLabel	: "行內樣式",
		advisoryTitleInputLabel	: "宣告標題",
		langDirLabel		: "文字方向",
		langDirLTRLabel		: "從左到右",
		langDirRTLLabel		: "從右到左",
		edit				: "編輯 DIV",
		remove				: "移除 DIV"
  	},

	iframe :
	{
		title		: "資訊訊框內容",
		toolbar		: "插入資訊訊框",
		noUrl		: "請鍵入資訊訊框 URL",
		scrolling	: "啟用捲軸",
		border		: "顯示圖文框框線"
	},

	font :
	{
		label		: "字型",
		voiceLabel	: "字型",
		panelTitle	: "字型名稱"
	},

	fontSize :
	{
		label		: "大小",
		voiceLabel	: "字型大小",
		panelTitle	: "字型大小"
	},

	colorButton :
	{
		textColorTitle	: "文字顏色",
		bgColorTitle	: "背景顏色",
		panelTitle		: "顏色",
		auto			: "自動",
		more			: "其他顏色..."
	},

	colors :
	{
		"000" : "黑色",
		"800000" : "暗紅色",
		"8B4513" : "重褐色",
		"2F4F4F" : "深青灰色",
		"008080" : "深藍綠色",
		"000080" : "深藍色",
		"4B0082" : "靛藍色",
		"696969" : "深灰色",
		"B22222" : "磚紅色",
		"A52A2A" : "棕色",
		"DAA520" : "金菊色",
		"006400" : "深綠色",
		"40E0D0" : "藍綠色",
		"0000CD" : "原藍色",
		"800080" : "紫色",
		"808080" : "灰色",
		"F00" : "紅色",
		"FF8C00" : "暗橙色",
		"FFD700" : "金色",
		"008000" : "綠色",
		"0FF" : "青藍色",
		"00F" : "藍色",
		"EE82EE" : "紫羅蘭色",
		"A9A9A9" : "暗灰色",
		"FFA07A" : "淺澄紅色",
		"FFA500" : "橙色",
		"FFFF00" : "黃色",
		"00FF00" : "萊姆色",
		"AFEEEE" : "蒼綠色",
		"ADD8E6" : "淺藍色",
		"DDA0DD" : "梅紅色",
		"D3D3D3" : "淡灰色",
		"FFF0F5" : "淡紫色",
		"FAEBD7" : "復古白色",
		"FFFFE0" : "淺黃色",
		"F0FFF0" : "蜜瓜綠色",
		"F0FFFF" : "天藍色",
		"F0F8FF" : "愛麗絲藍色",
		"E6E6FA" : "粉紫色",
		"FFF" : "白色"
	},

	scayt :
	{
		title			: "鍵入時進行拼字檢查",
		opera_title		: "Opera 不支援",
		enable			: "啟用 SCAYT",
		disable			: "停用 SCAYT",
		about			: "關於 SCAYT",
		toggle			: "切換 SCAYT",
		options			: "選項",
		langs			: "語言",
		moreSuggestions	: "其他建議",
		ignore			: "忽略",
		ignoreAll		: "全部忽略",
		addWord			: "新增單字",
		emptyDic		: "字典名稱不應為空。",

		optionsTab		: "選項",
		allCaps			: "忽略全大寫單字",
		ignoreDomainNames : "忽略網域名稱",
		mixedCase		: "忽略大小寫混合的單字",
		mixedWithDigits	: "忽略帶有數字的單字",

		languagesTab	: "語言",

		dictionariesTab	: "字典",
		dic_field_name	: "字典名稱",
		dic_create		: "建立",
		dic_restore		: "還原",
		dic_delete		: "刪除",
		dic_rename		: "重新命名",
		dic_info		: "「使用者字典」一開始是儲存在 Cookie 中。不過，Cookie 的大小有限制。當「使用者字典」擴充到無法儲存在 Cookie 中時，字典可能會儲存在伺服器上。若要將個人字典儲存在伺服器上，您應該指定字典的名稱。如果您有已儲存的字典，請鍵入其名稱，然後按一下「還原」按鈕。",

		aboutTab		: "關於"
	},

	about :
	{
		title		: "關於 CKEditor",
		dlgTitle	: "關於 CKEditor",
		help	: "請查看 $1 以取得說明。",
		userGuide : "CKEditor 使用手冊",
		moreInfo	: "如需授權資訊，請造訪我們的網站：",
		copy		: "Copyright &copy; $1. All rights reserved."
	},

	maximize : "最大化",
	minimize : "最小化",

	fakeobjects :
	{
		anchor	: "錨點",
		flash	: "Flash 動畫",
		iframe		: "資訊訊框",
		hiddenfield	: "隱藏欄位",
		unknown	: "不明物件"
	},

	resize : "以拖曳方式調整大小",

	colordialog :
	{
		title		: "選取顏色",
		options	:	"顏色選項",
		highlight	: "強調顯示",
		selected	: "所選的顏色",
		clear		: "清除"
	},

	toolbarCollapse	: "收合工具列",
	toolbarExpand	: "展開工具列",

	toolbarGroups :
	{
		document : "文件",
		clipboard : "剪貼簿/復原",
		editing : "編輯",
		forms : "表單",
		basicstyles : "基本樣式",
		paragraph : "段落",
		links : "鏈結",
		insert : "插入",
		styles : "樣式",
		colors : "顏色",
		tools : "工具"
	},

	bidi :
	{
		ltr : "變更為從左到右文字",
		rtl : "變更為從右到左文字"
	},

	docprops :
	{
		label : "文件內容",
		title : "文件內容",
		design : "設計",
		meta : "Meta 標籤",
		chooseColor : "選擇",
		other : "其他...",
		docTitle :	"頁面標題",
		charset : 	"字集編碼",
		charsetOther : "其他字集編碼",
		charsetASCII : "ASCII",
		charsetCE : "中歐語言",
		charsetCT : "繁體中文 (Big5)",
		charsetCR : "斯拉夫文",
		charsetGR : "希臘文",
		charsetJP : "日文",
		charsetKR : "韓文",
		charsetTR : "土耳其文",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "西歐",
		docType : "文件類型標題",
		docTypeOther : "其他文件類型標題",
		xhtmlDec : "併入 XHTML 宣告",
		bgColor : "背景顏色",
		bgImage : "背景影像 URL",
		bgFixed : "非捲動（固定）背景",
		txtColor : "文字顏色",
		margin : "頁面邊距",
		marginTop : "靠上",
		marginLeft : "靠左",
		marginRight : "靠右",
		marginBottom : "靠下",
		metaKeywords : "文件索引關鍵字（以逗點區隔）",
		metaDescription : "文件說明",
		metaAuthor : "作者",
		metaCopyright : "著作權",
		previewHtml : "<p>這是一些<strong>樣本文字</strong>。您正在使用 <a href=\"javascript:void(0)\">CKEditor</a>。</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "英吋",
			widthCm	: "公分",
			widthMm	: "公釐",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "點",
			widthPc	: "12 磅因活字"
		},
		table :
		{
			heightUnit	: "高度單位：",
			insertMultipleRows : "插入列",
			insertMultipleCols : "插入直欄",
			noOfRows : "列數：",
			noOfCols : "欄數：",
			insertPosition : "位置：",
			insertBefore : "之前",
			insertAfter : "之後",
			selectTable : "選取表格",
			selectRow : "選取列",
			columnTitle : "直欄",
			colProps : "直欄內容",
			invalidColumnWidth	: "欄寬必須是正數。"
		},
		cell :
		{
			title : "資料格"
		},
		emoticon :
		{
			angel		: "天使",
			angry		: "生氣",
			cool		: "裝酷",
			crying		: "大哭",
			eyebrow		: "挑眉",
			frown		: "皺眉",
			goofy		: "愚蠢",
			grin		: "露齒微笑",
			half		: "半開口笑",
			idea		: "想法",
			laughing	: "大笑",
			laughroll	: "滾地大笑",
			no			: "否",
			oops		: "驚訝",
			shy			: "害羞",
			smile		: "微笑",
			tongue		: "吐舌頭",
			wink		: "眨眼",
			yes			: "是"
		},

		menu :
		{
			link	: "插入鏈結",
			list	: "清單",
			paste	: "貼上",
			action	: "動作",
			align	: "對齊",
			emoticon: "表情符號"
		},

		iframe :
		{
			title	: "資訊訊框"
		},

		list:
		{
			numberedTitle		: "編號清單",
			bulletedTitle		: "項目符號清單"
		},

		// Anchor dialog
		anchor :
		{
			description	: "鍵入敘述性的書籤名稱，如「1.2 節」。插入書籤之後，按一下「鏈結」或「文件書籤鏈結」圖示來加以鏈結。",
			title		: "文件書籤鏈結",
			linkTo		: "鏈結至："
		},

		urllink :
		{
			title : "URL 鏈結",
			linkText : "鏈結文字：",
			selectAnchor: "選取錨點：",
			nourl: "請在文字欄位中輸入 URL。",
			urlhelp: "鍵入或貼上使用者按一下此鏈結時會開啟的 URL，例如 http://www.example.com。",
			displaytxthelp: "鍵入此鏈結要顯示的文字。",
			openinnew : "在新視窗中開啟鏈結"
		},

		spellchecker :
		{
			title : "檢查拼字",
			replace : "取代：",
			suggesstion : "建議：",
			withLabel : "取代為：",
			replaceButton : "取代",
			replaceallButton:"全部取代",
			skipButton:"跳過",
			skipallButton: "全部跳過",
			undochanges: "復原變更",
			complete: "拼字檢查完成",
			problem: "擷取 XML 資料時發生問題",
			addDictionary: "新增至字典",
			editDictionary: "編輯字典"
		},

		status :
		{
			keystrokeForHelp: "按 ALT 0 以取得說明"
		},

		linkdialog :
		{
			label : "鏈結對話框"
		},

		image :
		{
			previewText : "文字將會在您新增的影像周圍流動顯示（如此範例所示）。"
		}
	}

};

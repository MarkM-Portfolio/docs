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
	editorTitle : "富文本格式编辑器 %1。",

	// ARIA descriptions.
	toolbars	: "编辑器工具栏",
	editor	: "富文本格式编辑器",

	// Toolbar buttons without dialogs.
	source			: "源",
	newPage			: "新建页面",
	save			: "保存",
	preview			: "预览：",
	cut				: "剪切",
	copy			: "复制",
	paste			: "粘贴",
	print			: "打印",
	underline		: "下划线",
	bold			: "粗体",
	italic			: "斜体",
	selectAll		: "全选",
	removeFormat	: "除去格式",
	strike			: "删除线",
	subscript		: "下标",
	superscript		: "上标",
	horizontalrule	: "插入水平线",
	pagebreak		: "插入分页符",
	pagebreakAlt		: "分页符",
	unlink			: "除去链接",
	undo			: "撤销",
	redo			: "重做",

	// Common messages and labels.
	common :
	{
		browseServer	: "浏览器服务器：",
		url				: "URL：",
		protocol		: "协议：",
		upload			: "上载：",
		uploadSubmit	: "发送至服务器",
		image			: "插入图像",
		flash			: "插入 Flash 电影",
		form			: "插入表单",
		checkbox		: "插入复选框",
		radio			: "插入单选按钮",
		textField		: "插入文本字段",
		textarea		: "插入文本区域",
		hiddenField		: "插入隐藏字段",
		button			: "插入按钮",
		select			: "插入选择字段",
		imageButton		: "插入图像按钮",
		notSet			: "<not set>",
		id				: "标识：",
		name			: "名称：",
		langDir			: "文本方向：",
		langDirLtr		: "从左至右",
		langDirRtl		: "从右至左",
		langCode		: "语言代码：",
		longDescr		: "详细描述 URL：",
		cssClass		: "样式表类：",
		advisoryTitle	: "说明性标题：",
		cssStyle		: "样式：",
		ok				: "确定",
		cancel			: "取消",
		close : "关闭",
		preview			: "预览：",
		generalTab		: "常规",
		advancedTab		: "高级",
		validateNumberFailed	: "此值不是数字。",
		confirmNewPage	: "将丢失对本内容所做的任何未保存更改。确实要加载新页面吗？",
		confirmCancel	: "某些选项已更改。确实要关闭该对话框吗？",
		options : "选项",
		target			: "目标：",
		targetNew		: "新窗口 (_blank)",
		targetTop		: "顶部窗口 (_top)",
		targetSelf		: "同一窗口 (_self)",
		targetParent	: "父窗口 (_parent)",
		langDirLTR		: "从左至右",
		langDirRTL		: "从右至左",
		styles			: "样式：",
		cssClasses		: "样式表类：",
		width			: "宽度：",
		height			: "高度：",
		align			: "对齐方式：",
		alignLeft		: "左",
		alignRight		: "右",
		alignCenter		: "居中",
		alignTop		: "顶部",
		alignMiddle		: "居中",
		alignBottom		: "底部",
		invalidHeight	: "高度必须是正整数。",
		invalidWidth	: "宽度必须是正整数。",
		invalidCssLength	: "为“1%”字段指定的值必须是正数，可包含或不包含有效的 CSS 度量单位（px、%、in、cm、mm、em、ex、pt 或 pc）。",
		invalidHtmlLength	: "为“1%”字段指定的值必须是正数，可包含或不包含有效的 HTML 度量单位（px 或 %）。",
		invalidInlineStyle	: "为内联样式指定的值必须由“名称 : 值”格式的一个或多个元组（以分号分隔）组成。",
		cssLengthTooltip	: "输入数字来表示以像素为单位的值，或输入数字及有效 CSS 单位（px、%、in、cm、mm、em、ex、pt 或 pc）的。",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">，不可用</span>"
	},

	contextmenu :
	{
		options : "上下文菜单选项"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "插入特殊字符",
		title		: "特殊字符",
		options : "特殊字符选项"
	},

	// Link dialog.
	link :
	{
		toolbar		: "URL 链接",
		other 		: "<other>",
		menu		: "编辑链接...",
		title		: "链接",
		info		: "链接信息",
		target		: "目标",
		upload		: "上载：",
		advanced	: "高级",
		type		: "链接类型：",
		toUrl		: "URL",
		toAnchor	: "链接到文本中的锚点",
		toEmail		: "电子邮件",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "目标帧名称：",
		targetPopupName	: "弹出窗口名称：",
		popupFeatures	: "弹出窗口功能部件：",
		popupResizable	: "可调整大小",
		popupStatusBar	: "状态栏",
		popupLocationBar	: "位置栏",
		popupToolbar	: "工具栏",
		popupMenuBar	: "菜单栏",
		popupFullScreen	: "全屏 (IE)",
		popupScrollBars	: "滚动条",
		popupDependent	: "从属 (Netscape)",
		popupLeft		: "左边位置",
		popupTop		: "顶部位置",
		id				: "标识：",
		langDir			: "文本方向：",
		langDirLTR		: "从左至右",
		langDirRTL		: "从右至左",
		acccessKey		: "访问键：",
		name			: "名称：",
		langCode		: "语言代码：",
		tabIndex		: "跳进索引：",
		advisoryTitle	: "说明性标题：",
		advisoryContentType	: "说明性内容类型：",
		cssClasses		: "样式表类：",
		charset			: "链接的资源字符集：",
		styles			: "样式：",
		rel			: "关系",
		selectAnchor	: "选择锚点",
		anchorName		: "按锚点名称",
		anchorId		: "按元素标识",
		emailAddress	: "电子邮件地址",
		emailSubject	: "消息主题",
		emailBody		: "消息正文",
		noAnchors		: "文档中没有提供书签。单击工具栏上的“插入文档书签”图标以添加书签。",
		noUrl			: "请输入链接 URL",
		noEmail			: "请输入电子邮件地址"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "插入文档书签",
		menu		: "编辑文档书签",
		title		: "文档书签",
		name		: "名称：",
		errorName	: "请输入文档书签的名称",
		remove		: "除去文档书签"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "编号列表属性",
		bulletedTitle		: "符号列表属性",
		type				: "类型",
		start				: "起始",
		validateStartNumber				:"列表的起始编号必须是整数。",
		circle				: "圆形",
		disc				: "描述",
		square				: "广场",
		none				: "无",
		notset				: "<not set>",
		armenian			: "亚美尼亚编号",
		georgian			: "格鲁吉亚编号（an、ban、gan 等）",
		lowerRoman			: "小写罗马数字（i、ii、iii、iv、v 等）",
		upperRoman			: "大写罗马数字（I、II、III、IV、V 等）",
		lowerAlpha			: "小写英文字母（a、b、c、d、e 等）",
		upperAlpha			: "大写英文字母（A、B、C、D、E 等）",
		lowerGreek			: "小写希腊字母（alpha、beta、gamma 等）",
		decimal				: "十进制数（1、2、3 等）",
		decimalLeadingZero	: "带前导零的十进制数（01、02、03 等）"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "查找与替换",
		find				: "查找",
		replace				: "替换",
		findWhat			: "查找：",
		replaceWith			: "替换为：",
		notFoundMsg			: "找不到指定的文本。",
		noFindVal			: '请提供要查找的文本。',
		findOptions			: "查找选项",
		matchCase			: "区分大小写",
		matchWord			: "全词匹配",
		matchCyclic			: "循环匹配",
		replaceAll			: "全部替换",
		replaceSuccessMsg	: "已替换 %1 个。"
	},

	// Table Dialog
	table :
	{
		toolbar		: "插入表格",
		title		: "表格",
		menu		: "表格属性",
		deleteTable	: "删除表格",
		rows		: "行数：",
		columns		: "列数：",
		border		: "边框大小：",
		widthPx		: "像素",
		widthPc		: "百分比",
		widthUnit	: "宽度单位：",
		cellSpace	: "单元格间距：",
		cellPad		: "单元格边距：",
		caption		: "文字说明：",
		summary		: "摘要：",
		headers		: "标题：",
		headersNone		: "无",
		headersColumn	: "第一列",
		headersRow		: "第一行",
		headersBoth		: "两者",
		invalidRows		: "行数必须是大于 0 的整数。",
		invalidCols		: "列数必须是大于 0 的整数。",
		invalidBorder	: "边框大小必须是正数。",
		invalidWidth	: "表宽度必须是正数。",
		invalidHeight	: "表高度必须是正数。",
		invalidCellSpacing	: "单元格间距必须是正数。",
		invalidCellPadding	: "单元格边距必须是正数。",

		cell :
		{
			menu			: "单元格",
			insertBefore	: "在之前插入单元格",
			insertAfter		: "在之后插入单元格",
			deleteCell		: "删除单元格",
			merge			: "合并单元格",
			mergeRight		: "向右合并",
			mergeDown		: "向下合并",
			splitHorizontal	: "水平拆分单元格",
			splitVertical	: "垂直拆分单元格",
			title			: "单元格属性",
			cellType		: "单元格类型：",
			rowSpan			: "行范围：",
			colSpan			: "列范围：",
			wordWrap		: "自动换行：",
			hAlign			: "水平对齐：",
			vAlign			: "垂直对齐：",
			alignBaseline	: "基线",
			bgColor			: "背景色：",
			borderColor		: "边框颜色：",
			data			: "数据",
			header			: "头",
			yes				: "是",
			no				: "否",
			invalidWidth	: "单元格宽度必须是正数。",
			invalidHeight	: "单元格高度必须是正数。",
			invalidRowSpan	: "行范围必须是正整数。",
			invalidColSpan	: "列范围必须是正整数。",
			chooseColor : "选择"
		},

		row :
		{
			menu			: "行",
			insertBefore	: "在之前插入行",
			insertAfter		: "在之后插入行",
			deleteRow		: "删除行"
		},

		column :
		{
			menu			: "列",
			insertBefore	: "在之前插入列",
			insertAfter		: "在之后插入列",
			deleteColumn	: "删除列"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "按钮属性",
		text		: "文本（值）：",
		type		: "类型：",
		typeBtn		: "按钮",
		typeSbm		: "提交",
		typeRst		: "重置"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "复选框属性",
		radioTitle	: "单选按钮属性",
		value		: "值：",
		selected	: "已选"
	},

	// Form Dialog.
	form :
	{
		title		: "插入表单",
		menu		: "表单属性",
		action		: "操作：",
		method		: "方法：",
		encoding	: "编码："
	},

	// Select Field Dialog.
	select :
	{
		title		: "选择字段属性",
		selectInfo	: "选择信息",
		opAvail		: "可用选项",
		value		: "值：",
		size		: "大小：",
		lines		: "线条",
		chkMulti	: "允许多个选择",
		opText		: "文本：",
		opValue		: "值：",
		btnAdd		: "添加",
		btnModify	: "修改",
		btnUp		: "向上",
		btnDown		: "向下",
		btnSetValue : "设置为选定值",
		btnDelete	: "删除"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "文本区域属性",
		cols		: "列数：",
		rows		: "行数："
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "文本字段属性",
		name		: "名称：",
		value		: "值：",
		charWidth	: "字符宽度：",
		maxChars	: "最大字符数：",
		type		: "类型：",
		typeText	: "文本",
		typePass	: "密码"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "隐藏字段属性",
		name	: "名称：",
		value	: "值："
	},

	// Image Dialog.
	image :
	{
		title		: "图像",
		titleButton	: "图像按钮属性",
		menu		: "图像属性...",
		infoTab	: "图像信息",
		btnUpload	: "发送至服务器",
		upload	: "上载",
		alt		: "备用文本：",
		lockRatio	: "锁定比率",
		resetSize	: "重置大小",
		border	: "边框：",
		hSpace	: "水平间距：",
		vSpace	: "垂直间距：",
		alertUrl	: "请输入图像 URL",
		linkTab	: "链接",
		button2Img	: "是否要将选定的图像按钮变换为简单图像？",
		img2Button	: "是否要将选定的图像变换为图像按钮？",
		urlMissing : "缺少图像源 URL。",
		validateBorder : "边框必须是正整数。",
		validateHSpace : "水平间距必须是正整数。",
		validateVSpace : "垂直间距必须是正整数。"
	},

	// Flash Dialog
	flash :
	{
		properties		: "Flash 属性",
		propertiesTab	: "属性",
		title		: "Flash",
		chkPlay		: "自动播放",
		chkLoop		: "循环",
		chkMenu		: "启用 Flash 菜单",
		chkFull		: "允许全屏",
 		scale		: "缩放：",
		scaleAll		: "全部显示",
		scaleNoBorder	: "无边框",
		scaleFit		: "最佳适合",
		access			: "脚本访问权：",
		accessAlways	: "总是",
		accessSameDomain	: "同一域",
		accessNever	: "永不",
		alignAbsBottom: "绝对底部",
		alignAbsMiddle: "绝对居中",
		alignBaseline	: "基线",
		alignTextTop	: "文本顶部",
		quality		: "质量：",
		qualityBest	: "最佳",
		qualityHigh	: "高",
		qualityAutoHigh	: "自动设置为高",
		qualityMedium	: "中",
		qualityAutoLow	: "自动设置为低",
		qualityLow	: "低",
		windowModeWindow	: "窗口",
		windowModeOpaque	: "不透明",
		windowModeTransparent	: "透明",
		windowMode	: "窗口方式：",
		flashvars	: "变量：",
		bgcolor	: "背景色：",
		hSpace	: "水平间距：",
		vSpace	: "垂直间距：",
		validateSrc : "URL 不能为空。",
		validateHSpace : "水平间距必须是正整数。",
		validateVSpace : "垂直间距必须是正整数。"
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "拼写检查",
		title			: "拼写检查",
		notAvailable	: "抱歉，该服务当前不可用。",
		errorLoading	: "装入应用程序服务主机“%s”时出错。",
		notInDic		: "不在字典中",
		changeTo		: "更改为",
		btnIgnore		: "忽略",
		btnIgnoreAll	: "全部忽略",
		btnReplace		: "替换",
		btnReplaceAll	: "全部替换",
		btnUndo			: "撤销",
		noSuggestions	: "- 无建议 -",
		progress		: "正在执行拼写检查...",
		noMispell		: "拼写检查完成：未发现拼写错误",
		noChanges		: "拼写检查完成：未更改词语",
		oneChange		: "拼写检查完成：更改了一个词语",
		manyChanges		: "拼写检查完成：更改了 1% 的词语",
		ieSpellDownload	: "未安装拼写检查程序。要立即下载吗？"
	},

	smiley :
	{
		toolbar	: "插入表情插图",
		title	: "表情插图",
		options : "表情插图选项"
	},

	elementsPath :
	{
		eleLabel : "元素路径",
		eleTitle : "%1 元素"
	},

	numberedlist : "带编号的列表",
	bulletedlist : "符号列表",
	indent : "增加缩进",
	outdent : "减少缩进",

	bidi :
	{
		ltr : "从左至右",
		rtl : "从右至左",
	},

	justify :
	{
		left : "左对齐",
		center : "居中对齐",
		right : "右对齐",
		block : "两端对齐"
	},

	blockquote : "块引用",

	clipboard :
	{
		title		: "粘贴",
		cutError	: "您的浏览器安全设置会阻止自动剪切。请改用键盘上的 Ctrl+X。",
		copyError	: "您的浏览器安全设置阻止自动复制。请改用键盘上的 Ctrl+C。",
		pasteMsg	: "请按 Ctrl+V（在 MAC 上为 Cmd+V）在以下位置粘贴。",
		securityMsg	: "您的浏览器安全性禁止直接从剪贴板粘贴。",
		pasteArea	: "粘贴区域"
	},

	pastefromword :
	{
		confirmCleanup	: "您要粘贴的文本似乎从 Word 中复制。在粘贴前是否要将其清除？",
		toolbar			: "选择性粘贴",
		title			: "选择性粘贴",
		error			: "由于内部错误，因此无法清除粘贴的数据"
	},

	pasteText :
	{
		button	: "粘贴为纯文本",
		title	: "粘贴为纯文本"
	},

	templates :
	{
		button 			: "模板",
		title : "内容模板",
		options : "模板选项",
		insertOption: "替换实际内容",
		selectPromptMsg: "请选择要在编辑器中打开的模板",
		emptyListMsg : "（未定义模板）"
	},

	showBlocks : "显示块",

	stylesCombo :
	{
		label		: "样式",
		panelTitle 	: "样式",
		panelTitle1	: "块样式",
		panelTitle2	: "直接插入样式",
		panelTitle3	: "对象样式"
	},

	format :
	{
		label		: "格式",
		panelTitle	: "段落格式",

		tag_p		: "普通",
		tag_pre		: "已应用格式",
		tag_address	: "地址",
		tag_h1		: "标题 1",
		tag_h2		: "标题 2",
		tag_h3		: "标题 3",
		tag_h4		: "标题 4",
		tag_h5		: "标题 5",
		tag_h6		: "标题 6",
		tag_div		: "普通 (DIV)"
	},

	div :
	{
		title				: "创建 DIV 容器",
		toolbar				: "创建 DIV 容器",
		cssClassInputLabel	: "样式表类",
		styleSelectLabel	: "样式",
		IdInputLabel		: "标识",
		languageCodeInputLabel	: " 语言代码",
		inlineStyleInputLabel	: "内联样式",
		advisoryTitleInputLabel	: "顾问标题",
		langDirLabel		: "文本方向",
		langDirLTRLabel		: "从左至右",
		langDirRTLLabel		: "从右至左",
		edit				: "编辑 DIV",
		remove				: "除去 DIV"
  	},

	iframe :
	{
		title		: "信息帧属性",
		toolbar		: "插入信息帧",
		noUrl		: "请输入信息帧 URL",
		scrolling	: "启用滚动条",
		border		: "显示帧边框"
	},

	font :
	{
		label		: "字体",
		voiceLabel	: "字体",
		panelTitle	: "字体名称"
	},

	fontSize :
	{
		label		: "大小",
		voiceLabel	: "字体大小",
		panelTitle	: "字体大小"
	},

	colorButton :
	{
		textColorTitle	: "文本颜色",
		bgColorTitle	: "背景色",
		panelTitle		: "颜色",
		auto			: "自动",
		more			: "更多颜色..."
	},

	colors :
	{
		"000" : "黑色",
		"800000" : "栗色",
		"8B4513" : "重褐色",
		"2F4F4F" : "深青灰",
		"008080" : "深青色",
		"000080" : "深蓝色",
		"4B0082" : "靛蓝色",
		"696969" : "深灰色",
		"B22222" : "砖红色",
		"A52A2A" : "棕色",
		"DAA520" : "浅金黄",
		"006400" : "深绿",
		"40E0D0" : "青绿色",
		"0000CD" : "中蓝色",
		"800080" : "紫色",
		"808080" : "灰色",
		"F00" : "红色",
		"FF8C00" : "深橙",
		"FFD700" : "黄金",
		"008000" : "绿色",
		"0FF" : "青色",
		"00F" : "蓝色",
		"EE82EE" : "紫罗兰色",
		"A9A9A9" : "暗灰色",
		"FFA07A" : "浅橙色",
		"FFA500" : "橙色",
		"FFFF00" : "黄色",
		"00FF00" : "浅黄绿色",
		"AFEEEE" : "苍绿色",
		"ADD8E6" : "浅蓝色",
		"DDA0DD" : "梅红色",
		"D3D3D3" : "浅灰色",
		"FFF0F5" : "浅紫红",
		"FAEBD7" : "古董白",
		"FFFFE0" : "浅黄色",
		"F0FFF0" : "蜜色",
		"F0FFFF" : "天蓝色",
		"F0F8FF" : "爱丽丝蓝",
		"E6E6FA" : "浅紫色",
		"FFF" : "白色"
	},

	scayt :
	{
		title			: "输入时进行拼写检查",
		opera_title		: "Opera 不支持",
		enable			: "启用 SCAYT",
		disable			: "禁用 SCAYT",
		about			: "关于 SCAYT",
		toggle			: "切换 SCAYT",
		options			: "选项",
		langs			: "语言",
		moreSuggestions	: "更多建议",
		ignore			: "忽略",
		ignoreAll		: "全部忽略",
		addWord			: "添加单词",
		emptyDic		: "字典名称不应为空。",

		optionsTab		: "选项",
		allCaps			: "忽略全部大写的词语",
		ignoreDomainNames : "忽略域名",
		mixedCase		: "忽略大小写混用的词语",
		mixedWithDigits	: "忽略带数字的词语",

		languagesTab	: "语言",

		dictionariesTab	: "字典",
		dic_field_name	: "字典名称",
		dic_create		: "创建",
		dic_restore		: "恢复",
		dic_delete		: "删除",
		dic_rename		: "重命名",
		dic_info		: "用户字典最初存储在 Cookie 中。但是，Cookie 的大小有限。在用户字典增长到 Cookie 中的存储上限时，该字典可以存储到我们的服务器上。要在我们的服务器上存储您的个人字典，应当为您的字典指定名称。如果已存储有字典，请输入其名称，然后单击“恢复”按钮。",

		aboutTab		: "关于"
	},

	about :
	{
		title		: "关于 CKEditor",
		dlgTitle	: "关于 CKEditor",
		help	: "检查 $1 以获取帮助。",
		userGuide : "CKEditor 用户指南",
		moreInfo	: "有关许可证信息，请访问我们的 Web 站点：",
		copy		: "Copyright &copy; $1. All rights reserved."
	},

	maximize : "最大化",
	minimize : "最小化",

	fakeobjects :
	{
		anchor	: "锚点",
		flash	: "Flash 动画",
		iframe		: "信息帧",
		hiddenfield	: "隐藏字段",
		unknown	: "未知对象"
	},

	resize : "拖动以调整大小",

	colordialog :
	{
		title		: "选择颜色",
		options	:	"颜色选项",
		highlight	: "加亮",
		selected	: "选择的颜色",
		clear		: "清除"
	},

	toolbarCollapse	: "折叠工具栏",
	toolbarExpand	: "展开工具栏",

	toolbarGroups :
	{
		document : "文档",
		clipboard : "剪贴板/撤销",
		editing : "编辑",
		forms : "格式",
		basicstyles : "基本样式",
		paragraph : "段落",
		links : "链接",
		insert : "插入",
		styles : "样式",
		colors : "颜色",
		tools : "工具"
	},

	bidi :
	{
		ltr : "更改为从左到右的文本",
		rtl : "更改为从右到左的文本"
	},

	docprops :
	{
		label : "文档属性",
		title : "文档属性",
		design : "设计",
		meta : "元标记",
		chooseColor : "选择",
		other : "其他...",
		docTitle :	"页面标题",
		charset : 	"字符集编码",
		charsetOther : "其他字符集编码",
		charsetASCII : "ASCII",
		charsetCE : "中欧语",
		charsetCT : "繁体中文 (Big5)",
		charsetCR : "西里尔文",
		charsetGR : "希腊语",
		charsetJP : "日语",
		charsetKR : "韩语",
		charsetTR : "土耳其语",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "西欧语",
		docType : "文档类型标题",
		docTypeOther : "其他文档类型标题",
		xhtmlDec : "包括 XHTML 声明",
		bgColor : "背景色",
		bgImage : "背景图像 URL",
		bgFixed : "非滚动（固定）背景",
		txtColor : "文本颜色",
		margin : "页边距",
		marginTop : "顶部",
		marginLeft : "左",
		marginRight : "右",
		marginBottom : "底部",
		metaKeywords : "文档索引关键字（逗号分隔）",
		metaDescription : "文档描述",
		metaAuthor : "作者",
		metaCopyright : "版权",
		previewHtml : "<p>这是一些<strong>样本文本</strong>。您使用的是 <a href=\"javascript:void(0)\">CKEditor</a>。</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "英寸",
			widthCm	: "厘米",
			widthMm	: "毫米",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "点",
			widthPc	: "12 点活字"
		},
		table :
		{
			heightUnit	: "高度单位：",
			insertMultipleRows : "插入行",
			insertMultipleCols : "插入列",
			noOfRows : "行数：",
			noOfCols : "列数：",
			insertPosition : "位置：",
			insertBefore : "之前",
			insertAfter : "之后",
			selectTable : "选择表",
			selectRow : "选择行",
			columnTitle : "列",
			colProps : "列属性",
			invalidColumnWidth	: "列宽必须是正数。"
		},
		cell :
		{
			title : "单元格"
		},
		emoticon :
		{
			angel		: "天使",
			angry		: "生气",
			cool		: "扮酷",
			crying		: "哭泣",
			eyebrow		: "挑眉",
			frown		: "皱眉",
			goofy		: "傻呼呼",
			grin		: "露齿笑",
			half		: "似笑非笑",
			idea		: "构思",
			laughing	: "大笑",
			laughroll	: "笑翻天",
			no			: "否",
			oops		: "惊讶",
			shy			: "害羞",
			smile		: "微笑",
			tongue		: "吐舌",
			wink		: "眨眼",
			yes			: "是"
		},

		menu :
		{
			link	: "插入链接",
			list	: "列举",
			paste	: "粘贴",
			action	: "操作",
			align	: "对齐",
			emoticon: "表情插图"
		},

		iframe :
		{
			title	: "信息帧"
		},

		list:
		{
			numberedTitle		: "带编号的列表",
			bulletedTitle		: "符号列表"
		},

		// Anchor dialog
		anchor :
		{
			description	: "输入描述性书签名称，如“第 1.2 节”。插入书签后，单击“链接”或“文档书签链接”图标以链接到该书签。",
			title		: "文档书签链接",
			linkTo		: "链接到："
		},

		urllink :
		{
			title : "URL 链接",
			linkText : "链接文本：",
			selectAnchor: "选择锚点：",
			nourl: "请在文本字段中输入 URL。",
			urlhelp: "输入或粘贴 URL 以在用户单击此链接时打开，例如 http://www.example.com。",
			displaytxthelp: "输入链接的文本显示。",
			openinnew : "在新窗口中打开链接"
		},

		spellchecker :
		{
			title : "检查拼写",
			replace : "替换：",
			suggesstion : "建议：",
			withLabel : "替换为：",
			replaceButton : "替换",
			replaceallButton:"全部替换",
			skipButton:"跳过",
			skipallButton: "全部跳过",
			undochanges: "撤销更改",
			complete: "拼写检查完成",
			problem: "检索 XML 数据时出现问题",
			addDictionary: "添加到字典",
			editDictionary: "编辑字典"
		},

		status :
		{
			keystrokeForHelp: "按 ALT 0 以获取帮助"
		},

		linkdialog :
		{
			label : "链接对话框"
		},

		image :
		{
			previewText : "文本将围绕在所添加图像的周围，如此示例中所示。"
		}
	}

};

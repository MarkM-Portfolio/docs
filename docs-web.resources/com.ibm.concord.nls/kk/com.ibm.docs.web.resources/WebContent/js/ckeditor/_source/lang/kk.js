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
	editorTitle : "Пішімделген мәтін өңдегіш, %1.",

	// ARIA descriptions.
	toolbars	: "Өңдегіш құралдар тақтасы",
	editor	: "Пішімделген мәтін өңдегіші",

	// Toolbar buttons without dialogs.
	source			: "Негізгі",
	newPage			: "Жаңа бет",
	save			: "Сақтау",
	preview			: "Алдын ала қарап шығу:",
	cut				: "Қиып алу",
	copy			: "Көшіру",
	paste			: "Қою",
	print			: "Басып шығару",
	underline		: "Астын сызу",
	bold			: "Қалың",
	italic			: "Көлбеу",
	selectAll		: "Барлығын таңдау",
	removeFormat	: "Пішімді алып тастау",
	strike			: "Сызылған",
	subscript		: "Жоласты",
	superscript		: "Жол үсті",
	horizontalrule	: "Көлденең жолақ кірістіру",
	pagebreak		: "Бет үзілімін кірістіру",
	pagebreakAlt		: "Бет үзілімі",
	unlink			: "Сілтеме жою",
	undo			: "Болдырмау",
	redo			: "Қайтару",

	// Common messages and labels.
	common :
	{
		browseServer	: "Шолғыш сервері:",
		url				: "URL:",
		protocol		: "Протоколы:",
		upload			: "Жүктеп салу:",
		uploadSubmit	: "Оны серверге жіберу",
		image			: "Сурет кірістіру",
		flash			: "Жарқыл бейнені кірістіру",
		form			: "Пішінді кірістіру",
		checkbox		: "Құсбелгісін кірістіру",
		radio			: "Айырып-қосқышты кірістіру",
		textField		: "Мәтін өрісін кірістіру",
		textarea		: "Мәтін аймағын кірістіру",
		hiddenField		: "Жасырын өрісті кірістіру",
		button			: "Түймешікті кірістіру",
		select			: "Таңдау өрісін кірістіру",
		imageButton		: "Сурет түймешігін кірістіру",
		notSet			: "<not set>",
		id				: "Id:",
		name			: "Аты:",
		langDir			: "Мәтін бағыты:",
		langDirLtr		: "Солдан оңға",
		langDirRtl		: "Оңнан солға",
		langCode		: "Тіл коды:",
		longDescr		: "URL мекен-жайының ұзақ сипаттамасы:",
		cssClass		: "Мәнерлер кестесінің сыныптары:",
		advisoryTitle	: "Ұсыныс тақырыбы:",
		cssStyle		: "Мәнер:",
		ok				: "OK",
		cancel			: "Болдырмау",
		close : "Жабу",
		preview			: "Алдын ала қарап шығу:",
		generalTab		: "Жалпы",
		advancedTab		: "Қосымша",
		validateNumberFailed	: "Бұл мән сан емес.",
		confirmNewPage	: "Осы мазмұнның кез келген сақталмаған өзгертулері жоғалады. Шынымен жаңа бетті жүктегіңіз келеді ме?",
		confirmCancel	: "Параметрлердің кейбірі өзгертілді. Шынымен тілқатысу терезесін жапқыңыз келеді ме?",
		options : "Параметрлер",
		target			: "Мақсаты:",
		targetNew		: "Жаңа терезе (_blank)",
		targetTop		: "Жоғарғы терезе (_top)",
		targetSelf		: "Бірдей терезе (_self)",
		targetParent	: "Басты терезе (_parent)",
		langDirLTR		: "Солдан оңға",
		langDirRTL		: "Оңнан солға",
		styles			: "Мәнер:",
		cssClasses		: "Мәнерлер кестесінің сыныптары:",
		width			: "Ені:",
		height			: "Биіктігі:",
		align			: "Туралау:",
		alignLeft		: "Сол",
		alignRight		: "Оң",
		alignCenter		: "Орта",
		alignTop		: "Жоғарғы",
		alignMiddle		: "Ортаңғы",
		alignBottom		: "Төменгі",
		invalidHeight	: "Биіктігі оң бүтін сан болуы керек.",
		invalidWidth	: "Ені оң бүтін сан болуы керек.",
		invalidCssLength	: "'%1' өрісі үшін көрсетілген мән жарамды CSS өлшем бірлігімен немесе бірлігінсіз оң сан болуы керек (px, %, in, cm, mm, em, ex, pt немесе pc).",
		invalidHtmlLength	: "'%1' өрісі үшін көрсетілген мән жарамды HTML өлшем бірлігімен немесе бірлігінсіз оң сан болуы керек (px немесе %).",
		invalidInlineStyle	: "Кірістірілген мәнер үшін көрсетілген мәнде қос нүкте арқылы бөлінген \"name : value\" пішімі бар бір немесе бірнеше мәндер жолы болуы керек.",
		cssLengthTooltip	: "Мән үшін санды пиксельде немесе жарамды CSS бірлігі бар санды енгізіңіз (px, %, in, cm, mm, em, ex, pt немесе pc).",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">, қол жеткізгісіз</span>"
	},

	contextmenu :
	{
		options : "Мәтінмән мәзірінің параметрлері"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "Арнайы таңбаны кірістіру",
		title		: "Арнайы таңба",
		options : "Арнайы таңба параметрлері"
	},

	// Link dialog.
	link :
	{
		toolbar		: "URL мекен-жайының сілтемесі",
		other 		: "<other>",
		menu		: "Сілтемені өңдеу...",
		title		: "Сілтеме",
		info		: "Сілтеме туралы ақпарат",
		target		: "Мақсаты",
		upload		: "Жүктеп салу:",
		advanced	: "Қосымша",
		type		: "Сілтеме түрі:",
		toUrl		: "URL мекен-жайы",
		toAnchor	: "Мәтіндегі бетбелгіге сілтеме жасау",
		toEmail		: "Электрондық пошта",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "Мақсатты жақтау аты:",
		targetPopupName	: "Қалқымалы терезе аты:",
		popupFeatures	: "Қалқымалы терезе мүмкіндіктері:",
		popupResizable	: "Өлшемі өзгертпелі",
		popupStatusBar	: "Күй жолағы",
		popupLocationBar	: "Орын жолағы",
		popupToolbar	: "Құралдар тақтасы",
		popupMenuBar	: "Мәзір жолағы",
		popupFullScreen	: "Толық экран (IE)",
		popupScrollBars	: "Жолақтарды айналдыру",
		popupDependent	: "Тәуелді (Netscape)",
		popupLeft		: "Сол жақтағы орын",
		popupTop		: "Басты орын",
		id				: "Id:",
		langDir			: "Мәтін бағыты:",
		langDirLTR		: "Солдан оңға",
		langDirRTL		: "Оңнан солға",
		acccessKey		: "Кіру кілті:",
		name			: "Аты:",
		langCode		: "Тіл коды:",
		tabIndex		: "Қойынды индексі:",
		advisoryTitle	: "Ұсыныс тақырыбы:",
		advisoryContentType	: "Ұсыныс мазмұнының түрі:",
		cssClasses		: "Мәнерлер кестесінің сыныптары:",
		charset			: "Сілтеме жасалған ресурстың таңбалар жиыны:",
		styles			: "Мәнер:",
		rel			: "Байланыс",
		selectAnchor	: "Бетбелгіні таңдау",
		anchorName		: "Бетбелгі аты бойынша",
		anchorId		: "Элемент коды бойынша",
		emailAddress	: "Электрондық пошта мекен-жайы",
		emailSubject	: "Хабар тақырыбы",
		emailBody		: "Хабардың мәтіні",
		noAnchors		: "Ешқандай бетбелгілер құжатта қол жетімді емес. 'Құжат бетбелгісін кірістіру' белгішесін құралдас тақтасында бірін қосу үшін басыңыз.",
		noUrl			: "URL мекен-жайы сілтемесін теріңіз",
		noEmail			: "Электрондық пошта мекен-жайын теріңіз"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "Құжат бетбелгісін кірістіру",
		menu		: "Құжат бетбелгісін өңдеу",
		title		: "Құжат бетбелгісі",
		name		: "Аты:",
		errorName	: "Құжат бетбелгісі үшін атты енгізіңіз",
		remove		: "Құжат бетбелгісін алып тастау"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "Нөмірленген тізім сипаттары",
		bulletedTitle		: "Таңбалаушы тізім сипаттары",
		type				: "Түрі",
		start				: "Іске қосу",
		validateStartNumber				:"Тізімді бастау саны бүтін сан болуы керек.",
		circle				: "Шеңбер",
		disc				: "Диск",
		square				: "Шаршы",
		none				: "Ешбір",
		notset				: "<not set>",
		armenian			: "Армян нөмірлеуі",
		georgian			: "Грузин нөмірлеуі (an, ban, gan, etc.)",
		lowerRoman			: "Кіші рим әрпі (i, ii, iii, iv, v, etc.)",
		upperRoman			: "Үлкен рим әрпі (I, II, III, IV, V, etc.)",
		lowerAlpha			: "Кіші альфа әрпі (a, b, c, d, e, etc.)",
		upperAlpha			: "Үлкен альфа әрпі (A, B, C, D, E, etc.)",
		lowerGreek			: "Кіші грек әрпі (альфа, бета, гамма және тағы басқа)",
		decimal				: "Ондық (1, 2, 3, тағы басқа)",
		decimalLeadingZero	: "Бастапқы ондық нөл (01, 02, 03 тағы басқа)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "Табу және ауыстыру",
		find				: "Табу",
		replace				: "Ауыстыру",
		findWhat			: "Табу:",
		replaceWith			: "Мынаумен ауыстыру:",
		notFoundMsg			: "Көрсетілген мәтін табылмады.",
		noFindVal			: 'Табылатын мәтін қажет.',
		findOptions			: "Параметрлерді табу",
		matchCase			: "Салыстыру ісі",
		matchWord			: "Сөзді толық сәйкестендіру",
		matchCyclic			: "Циклдік салыстыру",
		replaceAll			: "Барлығын ауыстыру",
		replaceSuccessMsg	: "%1 көшірме(лер)сі ауыстырылды."
	},

	// Table Dialog
	table :
	{
		toolbar		: "Кесте кірістіру",
		title		: "Кесте",
		menu		: "Кесте сипаттары",
		deleteTable	: "Кестені жою",
		rows		: "Жолдар:",
		columns		: "Бағандар:",
		border		: "Жиек өлшемі:",
		widthPx		: "пиксель",
		widthPc		: "пайыз",
		widthUnit	: "Бірлік ені:",
		cellSpace	: "Ұяшықтар аралығы:",
		cellPad		: "Ұяшықтар өрісі:",
		caption		: "Тақырыбы:",
		summary		: "Жиынтық:",
		headers		: "Тақырыптары:",
		headersNone		: "Ешбір",
		headersColumn	: "Бірінші баған",
		headersRow		: "Бірінші жол",
		headersBoth		: "Екеуі де",
		invalidRows		: "Жолдар саны нөлден үлкенірек бүтін сан болуы керек.",
		invalidCols		: "Бағандар саны нөлден үлкенірек бүтін сан болуы керек.",
		invalidBorder	: "Жиек өлшемі оң сан болуы керек.",
		invalidWidth	: "Кесте ені оң сан болуы керек.",
		invalidHeight	: "Кесте биіктігі оң сан болуы керек.",
		invalidCellSpacing	: "Ұяшықтар аралығы оң сан болуы керек.",
		invalidCellPadding	: "Ұяшықтар өрісі оң сан болуы керек.",

		cell :
		{
			menu			: "Ұяшық",
			insertBefore	: "Ұяшықты алдына кірістіру",
			insertAfter		: "Ұяшықты кейін кірістіру",
			deleteCell		: "Ұяшықтарды жою",
			merge			: "Ұяшықтарды біріктіру",
			mergeRight		: "Оңға біріктіру",
			mergeDown		: "Төменге біріктіру",
			splitHorizontal	: "Ұяшықты көлденең бөлу",
			splitVertical	: "Ұяшықты тігінен бөлу",
			title			: "Ұяшық сипаттары",
			cellType		: "Ұяшық түрі:",
			rowSpan			: "Жолдар аралығы:",
			colSpan			: "Бағандар аралығы:",
			wordWrap		: "Сөздерді тасымалдау:",
			hAlign			: "Тігінен туралау:",
			vAlign			: "Көлденеңнен туралау:",
			alignBaseline	: "Тірек бағыттауыш",
			bgColor			: "Өң түсі:",
			borderColor		: "Жиек түсі:",
			data			: "Деректер",
			header			: "Үстіңгі деректеме",
			yes				: "Иә",
			no				: "Жоқ",
			invalidWidth	: "Ұяшық ені оң сан болуы керек.",
			invalidHeight	: "Ұяшық биіктігі оң сан болуы керек.",
			invalidRowSpan	: "Жолдар аралығы оң бүтін сан болуы керек.",
			invalidColSpan	: "Бағандар аралығы оң бүтін сан болуы керек.",
			chooseColor : "Таңдау"
		},

		row :
		{
			menu			: "Жол",
			insertBefore	: "Жолды алдына кірістіру",
			insertAfter		: "Жолды кейін кірістіру",
			deleteRow		: "Жолдарды жою"
		},

		column :
		{
			menu			: "Баған",
			insertBefore	: "Бағанды алдына кірістіру",
			insertAfter		: "Бағанды артынан кірістіру",
			deleteColumn	: "Бағандарды жою"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "Түймешік сипаттары",
		text		: "Мәтін (Мән):",
		type		: "Түрі:",
		typeBtn		: "Түймешік",
		typeSbm		: "Жіберу",
		typeRst		: "Ысыру"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "Құсбелгі сипаттары",
		radioTitle	: "Айырып-қосқыш сипаттары",
		value		: "Мән:",
		selected	: "Таңдалған"
	},

	// Form Dialog.
	form :
	{
		title		: "Пішінді кірістіру",
		menu		: "Пішім сипаттары",
		action		: "Әрекет:",
		method		: "Әдіс:",
		encoding	: "Кодтау:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "Өріс сипаттарын таңдау",
		selectInfo	: "Мәліметті таңдау",
		opAvail		: "Қол жетімді параметрлер",
		value		: "Мән:",
		size		: "Өлшем:",
		lines		: "жолдар",
		chkMulti	: "Бірнеше таңдауға рұқсат беру",
		opText		: "Мәтін:",
		opValue		: "Мән:",
		btnAdd		: "Қосу",
		btnModify	: "Өзгерту",
		btnUp		: "Жоғары",
		btnDown		: "Төмен",
		btnSetValue : "Таңдаулы мән ретінде орнату",
		btnDelete	: "Жою"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "Мәтін аймағы сипаттары",
		cols		: "Бағандар:",
		rows		: "Жолдар:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "Мәтін өрісі сипаттары",
		name		: "Аты:",
		value		: "Мән:",
		charWidth	: "Таңба ені:",
		maxChars	: "Ең үлкен таңбалары:",
		type		: "Түрі:",
		typeText	: "Мәтін",
		typePass	: "Құпия сөз"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "Жасырын өріс сипаттары",
		name	: "Аты:",
		value	: "Мән:"
	},

	// Image Dialog.
	image :
	{
		title		: "Сурет",
		titleButton	: "Сурет түймешігі сипаттары",
		menu		: "Сурет сипаттары...",
		infoTab	: "Сурет туралы ақпарат",
		btnUpload	: "Оны серверге жіберу",
		upload	: "Жүктеп салу",
		alt		: "Балама мәтін:",
		lockRatio	: "Құрсаулау коэффициенті",
		resetSize	: "Өлшемді ысыру",
		border	: "Жиек:",
		hSpace	: "Көлденең орын:",
		vSpace	: "Тігінен орын:",
		alertUrl	: "Суреттің URL мекен-жайын теріңіз",
		linkTab	: "Сілтеме",
		button2Img	: "Таңдаулы сурет түймешігін қарапайым суретке түрлендіргіңіз келеді ме?",
		img2Button	: "Таңдаулы суретті мына сурет түймешігіне түрлендіргіңіз келеді ме?",
		urlMissing : "Суреттің бастапқы URL мекен-жайы жоқ.",
		validateBorder : "Жиек оң бүтін сан болуы керек.",
		validateHSpace : "Тік орын оң бүтін сан болуы керек.",
		validateVSpace : "Көлденең орын оң бүтін сан болуы керек."
	},

	// Flash Dialog
	flash :
	{
		properties		: "Жарқыл сипаттары",
		propertiesTab	: "Сипаттар",
		title		: "Жарқыл",
		chkPlay		: "Автоматты ойнау",
		chkLoop		: "Тұйық",
		chkMenu		: "Жарқыл мәзірін іске қосу",
		chkFull		: "Толық экранды қосу",
 		scale		: "Масштабтау:",
		scaleAll		: "Барлығын көрсету",
		scaleNoBorder	: "Жиек жоқ",
		scaleFit		: "Нақты сәйкестендіру",
		access			: "Сценарийге кіру:",
		accessAlways	: "Әрқашан",
		accessSameDomain	: "Бірдей домен",
		accessNever	: "Ешқашан",
		alignAbsBottom: "Abs төменгі",
		alignAbsMiddle: "Abs ортаңғы",
		alignBaseline	: "Тірек бағыттауыш",
		alignTextTop	: "Жоғарыда мәтін теру",
		quality		: "Сапасы:",
		qualityBest	: "Ең жақсы",
		qualityHigh	: "Жоғары",
		qualityAutoHigh	: "Автоматты жоғары",
		qualityMedium	: "Орташа",
		qualityAutoLow	: "Автоматты төмен",
		qualityLow	: "Төмен",
		windowModeWindow	: "Терезе",
		windowModeOpaque	: "Мөлдір емес",
		windowModeTransparent	: "Мөлдір",
		windowMode	: "Терезе режимі:",
		flashvars	: "Айнымалы мәндер:",
		bgcolor	: "Өң түсі:",
		hSpace	: "Көлденең орын:",
		vSpace	: "Тігінен орын:",
		validateSrc : "URL мекен-жайы бос болуы керек.",
		validateHSpace : "Тік орын оң бүтін сан болуы керек.",
		validateVSpace : "Көлденең орын оң бүтін сан болуы керек."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "Емлені тексеру",
		title			: "Емлені тексеру",
		notAvailable	: "Кешіріңіз, бірақ қызмет қазір қол жеткізгісіз.",
		errorLoading	: "Бағдарлама қызметінің хостын жүктеу қатесі: %s.",
		notInDic		: "Сөздікте емес",
		changeTo		: "Келесіге өзгерту",
		btnIgnore		: "Елемеу",
		btnIgnoreAll	: "Барлығын елемеу",
		btnReplace		: "Ауыстыру",
		btnReplaceAll	: "Барлығын ауыстыру",
		btnUndo			: "Болдырмау",
		noSuggestions	: "- Ұсыныстар жоқ -",
		progress		: "Емлені тексеру орындалуда...",
		noMispell		: "Емлені тексеру аяқталды: емле қатесі табылмады",
		noChanges		: "Емлені тексеру аяқталды: ешқандай сөз өзгертілмеді",
		oneChange		: "Емлені тексеру аяқталды: бір сөз өзгерді",
		manyChanges		: "Емлені тексеру аяқталды: %1 сөз өзгертілді",
		ieSpellDownload	: "Емлені тексеру құралы орнатылмады. Оны қазір жүктеп салғыңыз келеді ме?"
	},

	smiley :
	{
		toolbar	: "Көңіл-күй таңбасын енгізу",
		title	: "Көңіл-күйлер",
		options : "Көңіл-күй параметрлері"
	},

	elementsPath :
	{
		eleLabel : "Элементтер жолы",
		eleTitle : "%1 элементі"
	},

	numberedlist : "Нөмірленген тізім",
	bulletedlist : "Таңбаланған тізім",
	indent : "Жол шегінісін үлкейту",
	outdent : "Жол шегінісін кішірейту",

	bidi :
	{
		ltr : "Солдан оңға",
		rtl : "Оңнан солға",
	},

	justify :
	{
		left : "Сол жақ бойынша туралау",
		center : "Ортасы бойынша туралау",
		right : "Оң жақ бойынша туралау",
		block : "Туралау"
	},

	blockquote : "Дәйексөз",

	clipboard :
	{
		title		: "Қою",
		cutError	: "Шолғыштың қауіпсіздік параметрлері автоматты қиюға тыйым салады. Ctrl+X пернесін пернетақтада пайдаланыңыз.",
		copyError	: "Шолғыштың қауіпсіздік параметрлері автоматты көшіруге тыйым салады. Ctrl+C пернесін пернетақтада пайдаланыңыз.",
		pasteMsg	: "Ctrl+V пернесін (Cmd+V on MAC) төменге орналастыру үшін басыңыз.",
		securityMsg	: "Шолғыш қауіпсіздігі аралық сақтағыштан тікелей қоюға тыйым салады.",
		pasteArea	: "Қою аймағы"
	},

	pastefromword :
	{
		confirmCleanup	: "Қойылатын мәтін Word бағдарламасынан көшірілгенге ұқсайды. Оны қоймай тұрып тазартқыңыз келеді ме?",
		toolbar			: "Арнайы қою",
		title			: "Арнайы қою",
		error			: "Ішкі қатеге байланысты қойылған деректерді өшіру мүмкін болмады"
	},

	pasteText :
	{
		button	: "Қарапайым мәтін ретінде қою",
		title	: "Қарапайым мәтін ретінде қою"
	},

	templates :
	{
		button 			: "Үлгілер",
		title : "Мазмұн үлгілері",
		options : "Үлгі параметрлері",
		insertOption: "Нақты мазмұндарды ауыстыру",
		selectPromptMsg: "Үлгіні өңдегіште ашу үшін таңдаңыз",
		emptyListMsg : "(Ешқандай үлгілер анықталмады)"
	},

	showBlocks : "Құрсауларды көрсету",

	stylesCombo :
	{
		label		: "Мәнерлер",
		panelTitle 	: "Мәнерлер",
		panelTitle1	: "Құрсаулау мәнерлері",
		panelTitle2	: "Кірістірілген мәнерлер",
		panelTitle3	: "Нысан мәнерлері"
	},

	format :
	{
		label		: "Пішім",
		panelTitle	: "Еже пішімі",

		tag_p		: "Қалыпты",
		tag_pre		: "Пішімделген",
		tag_address	: "Мекен-жай",
		tag_h1		: "1-тақырып",
		tag_h2		: "2-тақырып",
		tag_h3		: "3-тақырып",
		tag_h4		: "4-тақырып",
		tag_h5		: "5-тақырып",
		tag_h6		: "6-тақырып",
		tag_div		: "Қарапайым (DIV)"
	},

	div :
	{
		title				: "Div контейнерді жасау",
		toolbar				: "Div контейнерді жасау",
		cssClassInputLabel	: "Мәнерлер кестесінің сыныптары",
		styleSelectLabel	: "Мәнер",
		IdInputLabel		: "Id",
		languageCodeInputLabel	: " Тіл коды",
		inlineStyleInputLabel	: "Кірістірілген мәнер",
		advisoryTitleInputLabel	: "Ұсыныс тақырыбы",
		langDirLabel		: "Мәтін бағыты",
		langDirLTRLabel		: "Солдан оңға",
		langDirRTLLabel		: "Оңнан солға",
		edit				: "Div өңдеу",
		remove				: "Div жою"
  	},

	iframe :
	{
		title		: "IFrame сипаттары",
		toolbar		: "IFrame кірістіру",
		noUrl		: "iframe URL мекен-жайын теріңіз",
		scrolling	: "Жылжыту жолақтарын іске қосу",
		border		: "Жақтау жиегін көрсету"
	},

	font :
	{
		label		: "Қаріп",
		voiceLabel	: "Қаріп",
		panelTitle	: "Қаріп аты"
	},

	fontSize :
	{
		label		: "Өлшем",
		voiceLabel	: "Қаріп өлшемі",
		panelTitle	: "Қаріп өлшемі"
	},

	colorButton :
	{
		textColorTitle	: "Мәтін түсі",
		bgColorTitle	: "Өң түсі",
		panelTitle		: "Түстер",
		auto			: "Автоматты",
		more			: "Қосымша түстер..."
	},

	colors :
	{
		"000" : "Қара",
		"800000" : "Қошқыл қызыл",
		"8B4513" : "Тері қоңыр",
		"2F4F4F" : "Қою қызғылт сұр",
		"008080" : "Жасыл көгілдір",
		"000080" : "Қою қара-көк",
		"4B0082" : "Индиго",
		"696969" : "Қоңыр сұр",
		"B22222" : "Кірпіш түсті",
		"A52A2A" : "Қоңыр",
		"DAA520" : "Алтын түстес",
		"006400" : "Қою жасыл",
		"40E0D0" : "Көгілдір",
		"0000CD" : "Орташа көк",
		"800080" : "Күлгін",
		"808080" : "Сұр",
		"F00" : "Қызыл",
		"FF8C00" : "Қою қызғылт сары",
		"FFD700" : "Алтын сары",
		"008000" : "Жасыл",
		"0FF" : "Көгілдір",
		"00F" : "Көк",
		"EE82EE" : "Ашық күлгін",
		"A9A9A9" : "Күңгірт сұр",
		"FFA07A" : "Ашық сары-қызғылт",
		"FFA500" : "Қызғылт сары",
		"FFFF00" : "Сары",
		"00FF00" : "Ашық жасыл",
		"AFEEEE" : "Ақ көгілдір",
		"ADD8E6" : "Ақшыл көк",
		"DDA0DD" : "Алхоры түсті",
		"D3D3D3" : "Ашық сұр",
		"FFF0F5" : "Қызылдай құлпыраған көгілдір түс",
		"FAEBD7" : "Көне ақ",
		"FFFFE0" : "Ашық сары",
		"F0FFF0" : "Балды шық түсті",
		"F0FFFF" : "Көкшіл",
		"F0F8FF" : "Ашық көк",
		"E6E6FA" : "Лилия түсті",
		"FFF" : "Ақ"
	},

	scayt :
	{
		title			: "Тергендей емлені тексеру",
		opera_title		: "Opera бағдарламасы қолдау көрсетейді",
		enable			: "SCAYT іске қосу",
		disable			: "SCAYT ажырату",
		about			: "SCAYT туралы",
		toggle			: "SCAYT ажырата қосу",
		options			: "Параметрлер",
		langs			: "Тілдер",
		moreSuggestions	: "Көбірек ұсыныстар",
		ignore			: "Елемеу",
		ignoreAll		: "Барлығын елемеу",
		addWord			: "Сөз қосу",
		emptyDic		: "Сөздік аты бос болмауы керек.",

		optionsTab		: "Параметрлер",
		allCaps			: "Бәрі бас әріпті сөздерді елемеу",
		ignoreDomainNames : "Домен аттарын елемеу",
		mixedCase		: "Аралас әріптері бар сөздерді елемеу",
		mixedWithDigits	: "Сандары бар сөздерді елемеу",

		languagesTab	: "Тілдер",

		dictionariesTab	: "Сөздіктер",
		dic_field_name	: "Сөздік аты",
		dic_create		: "Жасау",
		dic_restore		: "Қалпына келтіру",
		dic_delete		: "Жою",
		dic_rename		: "Атын өзгерту",
		dic_info		: "Бастапқыда пайдаланушы сөздігі Cookie файлында сақталады. Дегенмен, Cookie файлдары өлшемі бойынша шектеледі. Пайдаланушы сөздігі Cookie файлында сақталатын нүктеге жеткенде, сөздік біздің серверде сақталуы мүмкін. Жеке сөздікті біздің серверде сақтау үшін, сөздіктің атын көрсету керек. Егер сөздікті әлдқашан сақтаған болсаңыз. оның атын теріп, Қалпына келтіру түймешігін басыңыз.",

		aboutTab		: "Туралы"
	},

	about :
	{
		title		: "CKEditor туралы",
		dlgTitle	: "CKEditor туралы",
		help	: "Анықтама алу үшін $1 тексеріңіз.",
		userGuide : "CKEditor пайдаланушылық нұсқаулығы",
		moreInfo	: "Лицензиялау туралы ақпаратты алу үшін, біздің веб-торапқа кіріңіз:",
		copy		: "&copy; $1 авторлық құқығы. Барлық құқықтар қорғалған."
	},

	maximize : "Үлкейту",
	minimize : "Қайыру",

	fakeobjects :
	{
		anchor	: "Бұрыш",
		flash	: "Жарқыл анимация",
		iframe		: "IFrame",
		hiddenfield	: "Жасырын өріс",
		unknown	: "Белгісіз нысан"
	},

	resize : "өлшемін өзгерту үшін жылжыту",

	colordialog :
	{
		title		: "Түс таңдау",
		options	:	"Түс параметрлері",
		highlight	: "Ерекшелеу",
		selected	: "Түсті таңдау",
		clear		: "Тазалау"
	},

	toolbarCollapse	: "Құралдар тақтасын тасалау",
	toolbarExpand	: "Құралдар тақтасын кеңейту",

	toolbarGroups :
	{
		document : "Құжат",
		clipboard : "Аралық сақтағыш/Болдырмау",
		editing : "Өңдеу",
		forms : "Форумдар",
		basicstyles : "Негізгі мәнерлер",
		paragraph : "Еже",
		links : "Сілтемелер",
		insert : "Кірістіру",
		styles : "Мәнерлер",
		colors : "Түстер",
		tools : "Құралдар"
	},

	bidi :
	{
		ltr : "Солдан оңға қарай мәтінді өзгерту",
		rtl : "Оңнан солға қарай мәтінді өзгерту"
	},

	docprops :
	{
		label : "Құжат сипаттары",
		title : "Құжат сипаттары",
		design : "Дизайн",
		meta : "Мета тегтер",
		chooseColor : "Таңдау",
		other : "Басқа...",
		docTitle :	"Бет тақырыбы",
		charset : 	"Таңбалар жиынын кодтау",
		charsetOther : "Басқа таңбалар жиынын кодтау",
		charsetASCII : "ASCII",
		charsetCE : "Орталық Еуропа",
		charsetCT : "Дәстүрлі қытай (Big5)",
		charsetCR : "Кирилл жазуы",
		charsetGR : "Грек",
		charsetJP : "Жапон",
		charsetKR : "Кәріс",
		charsetTR : "Түрік",
		charsetUN : "Юникод (UTF-8)",
		charsetWE : "Батыс Еуропалық",
		docType : "Құжат түрінің тақырыбы",
		docTypeOther : "Басқа құжат түрінің тақырыбы",
		xhtmlDec : "XHTML жарияланымдарын қосу",
		bgColor : "Өң түсі",
		bgImage : "өң сүретінің URL мекен-жайы",
		bgFixed : "Жылжытылмайтын (Тұрақталған) өң",
		txtColor : "Мәтін түсі",
		margin : "Бет жиектері",
		marginTop : "Жоғарғы",
		marginLeft : "Сол",
		marginRight : "Оң",
		marginBottom : "Төменгі",
		metaKeywords : "Құжатты индекстеу кілтсөздері (үтірмен бөлінген)",
		metaDescription : "Құжат сипаттамасы",
		metaAuthor : "Автор",
		metaCopyright : "Авторлық құқық",
		previewHtml : "<p>Бұл бірнеше <strong>үлгі мәтін</strong>. Сіз <a href=\"javascript:void(0)\">CKEditor</a> пайдаланасыз.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "дюйм",
			widthCm	: "сантиметр",
			widthMm	: "миллиметр",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "нүкте",
			widthPc	: "пика"
		},
		table :
		{
			heightUnit	: "Биіктік бірлігі:",
			insertMultipleRows : "Жолдарды кірістіру",
			insertMultipleCols : "Бағандарды кірістіру",
			noOfRows : "Жолдар саны:",
			noOfCols : "Бағандар саны:",
			insertPosition : "Орны:",
			insertBefore : "Дейін",
			insertAfter : "Кейін",
			selectTable : "Кестені таңдау",
			selectRow : "Жолды таңдау",
			columnTitle : "Баған",
			colProps : "Баған сипаттары",
			invalidColumnWidth	: "Баған ені оң сан болуы керек."
		},
		cell :
		{
			title : "Ұяшық"
		},
		emoticon :
		{
			angel		: "Періште",
			angry		: "Ашулы",
			cool		: "Салқын",
			crying		: "Жылау",
			eyebrow		: "Қас",
			frown		: "Бұртию",
			goofy		: "Ақымақ",
			grin		: "Күлімсіреу",
			half		: "Жарты",
			idea		: "Ой",
			laughing	: "Күлу",
			laughroll	: "Жатып күлу",
			no			: "Жоқ",
			oops		: "Ах",
			shy			: "Ұялу",
			smile		: "Күлімдеу",
			tongue		: "Тіл",
			wink		: "Көз қысу",
			yes			: "Иә"
		},

		menu :
		{
			link	: "Сілтеме кірістіру",
			list	: "Тізім",
			paste	: "Қою",
			action	: "Әрекет",
			align	: "Туралау",
			emoticon: "Көңіл-күй"
		},

		iframe :
		{
			title	: "IFrame"
		},

		list:
		{
			numberedTitle		: "Нөмірленген тізім",
			bulletedTitle		: "Таңбаланған тізім"
		},

		// Anchor dialog
		anchor :
		{
			description	: "Сипаттағыш бетбелгі атын, яғни '1.2 бөлімі' деп теріңіз. Бетбелгіні кірістіргеннен кейін, 'Сілтеме' немесе 'Құжат бетбелгісінің сілтемесі' белгішесін оған сілтеме жасау үшін басыңыңыз.",
			title		: "Құжат бетбелгісінің сілтемесі",
			linkTo		: "Сілтеме:"
		},

		urllink :
		{
			title : "URL мекен-жайының сілтемесі",
			linkText : "Мәтін сілтемесі:",
			selectAnchor: "Бетбелгіні таңдау:",
			nourl: "URL мекен-жайын мәтін өрісіне енгізіңіз.",
			urlhelp: "URL мекен-жайын пайдаланушы осы сілтемені ашқанда, теріңіз немесе қойыңыз, мысалы http://www.example.com.",
			displaytxthelp: "Сілтеме үшін мәтін дисплейін теріңіз.",
			openinnew : "Сілтемені жаңа терезеде ашу"
		},

		spellchecker :
		{
			title : "Емлені тексеру",
			replace : "Ауыстыру:",
			suggesstion : "Ұсыныстар:",
			withLabel : "Бірге:",
			replaceButton : "Ауыстыру",
			replaceallButton:"Барлығын ауыстыру",
			skipButton:"Өткізіп жіберу",
			skipallButton: "Барлығын өткізіп жіберу",
			undochanges: "Өзгертулерді болдырмау",
			complete: "Емлені тексеру аяқталды",
			problem: "XML деректерін шығаратын проблема",
			addDictionary: "Сөздікке қосу",
			editDictionary: "Сөздікті өңдеу"
		},

		status :
		{
			keystrokeForHelp: "ALT 0 пернесін анықтама алу үшін басыңыз"
		},

		linkdialog :
		{
			label : "Тілқатысу терезесінің сілтемесі"
		},

		image :
		{
			previewText : "Мәтін осы мысалға қосатын сурет жанында болады."
		}
	}

};

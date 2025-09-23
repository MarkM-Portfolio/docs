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
	editorTitle : "Редактор на RTF текст, %1.",

	// ARIA descriptions.
	toolbars	: "Ленти с инструменти на редактор",
	editor	: "Редактор на RTF текст",

	// Toolbar buttons without dialogs.
	source			: "Източник",
	newPage			: "Нова страница",
	save			: "Записване",
	preview			: "Предварителен преглед:",
	cut				: "Изрязване",
	copy			: "Копиране",
	paste			: "Поставяне",
	print			: "Отпечатване",
	underline		: "Подчертаване",
	bold			: "Получер",
	italic			: "Курсив",
	selectAll		: "Избиране на всички",
	removeFormat	: "Премахване на формат",
	strike			: "Зачеркване",
	subscript		: "Долен индекс",
	superscript		: "Горен индекс",
	horizontalrule	: "Вмъкване на хоризонтална линия",
	pagebreak		: "Вмъкване на Нова страница",
	pagebreakAlt		: "Нова страница",
	unlink			: "Премахване на връзка",
	undo			: "Отмяна",
	redo			: "Връщане",

	// Common messages and labels.
	common :
	{
		browseServer	: "Сървър на браузър:",
		url				: "URL адрес:",
		protocol		: "Протокол:",
		upload			: "Качване:",
		uploadSubmit	: "Изпрати го към сървъра",
		image			: "Вмъкване на изображение",
		flash			: "Вмъкване на Flash видеоклип",
		form			: "Вмъкване на формуляр",
		checkbox		: "Вмъкване на поле за отметка",
		radio			: "Вмъкване на радио бутон",
		textField		: "Вмъкване на текстово поле",
		textarea		: "Вмъкване на област за текст",
		hiddenField		: "Вмъкване на скрито поле",
		button			: "Вмъкване на бутон",
		select			: "Вмъкване на поле за избор",
		imageButton		: "Вмъкване на бутон за изображение",
		notSet			: "<not set>",
		id				: "Идентификатор:",
		name			: "Име:",
		langDir			: "Посока на текст:",
		langDirLtr		: "От ляво надясно",
		langDirRtl		: "От дясно наляво",
		langCode		: "Езиков код:",
		longDescr		: "URL с дълго описание:",
		cssClass		: "Класове на листове със стилове:",
		advisoryTitle	: "Заглавие на консултант:",
		cssStyle		: "Стил:",
		ok				: "OK",
		cancel			: "Отказ",
		close : "Затваряне",
		preview			: "Предварителен преглед:",
		generalTab		: "Общ",
		advancedTab		: "Разширен",
		validateNumberFailed	: "Тази стойност не е номер.",
		confirmNewPage	: "Всички незапазени промени в това съдържание ще бъдат загубени. Наистина ли желаете да заредите нова страница?",
		confirmCancel	: "Някои от опциите са променени. Наистина ли искате да затворите диалога?",
		options : "Опции",
		target			: "Приемник:",
		targetNew		: "Нов прозорец (_blank)",
		targetTop		: "Най-горен прозорец (_top)",
		targetSelf		: "Същият прозорец (_self)",
		targetParent	: "Родителски прозорец (_parent)",
		langDirLTR		: "От ляво надясно",
		langDirRTL		: "От дясно наляво",
		styles			: "Стил:",
		cssClasses		: "Класове на листове със стилове:",
		width			: "Ширина:",
		height			: "Височина:",
		align			: "Подравняване:",
		alignLeft		: "Ляво",
		alignRight		: "Дясно",
		alignCenter		: "Център",
		alignTop		: "Горе",
		alignMiddle		: "По средата",
		alignBottom		: "Долна част",
		invalidHeight	: "Височината трябва да бъде положително цяло число.",
		invalidWidth	: "Ширината трябва да бъде положително цяло число.",
		invalidCssLength	: "Указаната стойност за поле '%1' трябва да бъде положително число с или без валидна CSS мерителна единица (px, %, in, cm, mm, em, ex, pt или pc).",
		invalidHtmlLength	: "Указаната стойност за поле '%1' трябва да бъде положително число с или без валидна HTML мерителна единица (px или %).",
		invalidInlineStyle	: "Указаната стойност за вмъкнатия стил трябва да включва един или повече кортежи с формат \"име : стойност\", разделени от точки и запетаи.",
		cssLengthTooltip	: "Въведете номер за стойност в пиксели или номер с валидна CSS единица (px, %, in, cm, mm, em, ex, pt или pc).",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">, недостъпен</span>"
	},

	contextmenu :
	{
		options : "Опции на контекстно меню"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "Вмъкване на специален символ",
		title		: "Специален символ",
		options : "Опции на специалния символ"
	},

	// Link dialog.
	link :
	{
		toolbar		: "URL връзка",
		other 		: "<other>",
		menu		: "Редактиране на връзка...",
		title		: "Връзка",
		info		: "Информация за връзка",
		target		: "Приемник",
		upload		: "Качване:",
		advanced	: "Разширени",
		type		: "Тип на връзката:",
		toUrl		: "URL",
		toAnchor	: "Връзка към котва в текста",
		toEmail		: "Имейл",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "Име на рамка на приемник:",
		targetPopupName	: "Име на изскачащ прозорец:",
		popupFeatures	: "Характеристики на изскачащ прозорец:",
		popupResizable	: "Преоразмерим",
		popupStatusBar	: "Лента на състоянието",
		popupLocationBar	: "Лента на местоположение",
		popupToolbar	: "Лента с инструменти",
		popupMenuBar	: "Лента с меню",
		popupFullScreen	: "Пълен екран (IE)",
		popupScrollBars	: "Плъзгачи за преглед",
		popupDependent	: "Зависим (Netscape)",
		popupLeft		: "Лява позиция",
		popupTop		: "Горна позиция",
		id				: "Идентификатор:",
		langDir			: "Посока на текст:",
		langDirLTR		: "От ляво надясно",
		langDirRTL		: "От дясно наляво",
		acccessKey		: "Ключ за достъп:",
		name			: "Име:",
		langCode		: "Езиков код:",
		tabIndex		: "Индекс на раздел:",
		advisoryTitle	: "Заглавие на консултант:",
		advisoryContentType	: "Тип съдържание на консултант:",
		cssClasses		: "Класове на листове със стилове:",
		charset			: "Символно множество на свързан ресурс:",
		styles			: "Стил:",
		rel			: "Взаимовръзка",
		selectAnchor	: "Изберете котва",
		anchorName		: "По име на котва",
		anchorId		: "По Идентификатор на елемент",
		emailAddress	: "Имейл адрес",
		emailSubject	: "Предмет на съобщение",
		emailBody		: "Основен текст на съобщение",
		noAnchors		: "Няма достъпни отметки в документа. Щракнете върху иконата 'Вмъкване на отметка в документа' в лентата с инструменти, за да добавите отметка. ",
		noUrl			: "Моля, въведете URL на връзка",
		noEmail			: "Моля, въведете имейл адрес"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "Вмъкване на отметка в документ",
		menu		: "Редактиране на отметка на документ",
		title		: "Отметка на документ",
		name		: "Име:",
		errorName	: "Моля, въведете име за отметката на документа",
		remove		: "Премахване на отметка на документ"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "Свойства на номериран списък",
		bulletedTitle		: "Свойства на списък с водещи символи",
		type				: "Тип",
		start				: "Начало",
		validateStartNumber				:"Началният символ в списък трябва да бъде цяло число.",
		circle				: "Кръг",
		disc				: "Диск",
		square				: "Квадрат",
		none				: "Няма",
		notset				: "<not set>",
		armenian			: "Арменско номериране",
		georgian			: "Грузинско номериране (an, ban, gan и т.н.)",
		lowerRoman			: "Малки римски (i, ii, iii, iv, v и т.н.)",
		upperRoman			: "Главни римски (I, II, III, IV, V и т.н.)",
		lowerAlpha			: "Малки букви (a, b, c, d, e и т.н.)",
		upperAlpha			: "Главни букви (A, B, C, D, E и т.н.)",
		lowerGreek			: "Малки гръцки (алфа, бета, гама и т.н.)",
		decimal				: "Десетични (1, 2, 3 и т.н.)",
		decimalLeadingZero	: "Десетични с водеща нула (01, 02, 03 и т.н.)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "Търсене и заместване",
		find				: "Търсене",
		replace				: "Заместване",
		findWhat			: "Намери",
		replaceWith			: "Замести с:",
		notFoundMsg			: "Указаният текст не е намерен.",
		noFindVal			: 'Текстът за намиране е задължителен.',
		findOptions			: "Опции за откриване",
		matchCase			: "С малки и главни букви",
		matchWord			: "Съвпадение цяла дума",
		matchCyclic			: "Съвпадение на цикличен",
		replaceAll			: "Замени всички",
		replaceSuccessMsg	: "%1 повторение(я) подменено(и)."
	},

	// Table Dialog
	table :
	{
		toolbar		: "Вмъкване на таблица",
		title		: "Таблица",
		menu		: "Свойства на таблица",
		deleteTable	: "Изтриване на таблица",
		rows		: "Редове:",
		columns		: "Колони:",
		border		: "Размер на граница:",
		widthPx		: "пиксели",
		widthPc		: "процент",
		widthUnit	: "Ширина на единица:",
		cellSpace	: "Разстояние между клетки:",
		cellPad		: "Вътрешни полета в клетка:",
		caption		: "Заглавие:",
		summary		: "Обобщение:",
		headers		: "Заглавни части:",
		headersNone		: "Няма",
		headersColumn	: "Първа колона",
		headersRow		: "Първи ред",
		headersBoth		: "И двете",
		invalidRows		: "Броят на редовете трябва да бъде цяло число по-голямо от нула.",
		invalidCols		: "Броят на колоните трябва да бъде цяло число по-голямо от нула.",
		invalidBorder	: "Размерът на границата трябва да бъде положително число.",
		invalidWidth	: "Ширината на таблицата трябва да бъде положително число.",
		invalidHeight	: "Височината на таблицата трябва да бъде положително число.",
		invalidCellSpacing	: "Разстоянието между клетките трябва да бъде положително число.",
		invalidCellPadding	: "Вътрешните полета в клетка трябва да са положително число.",

		cell :
		{
			menu			: "Клетка",
			insertBefore	: "Вмъкване на клетка преди",
			insertAfter		: "Вмъкване на клетка след",
			deleteCell		: "Изтриване на клетки",
			merge			: "Сливане на клетки",
			mergeRight		: "Сливане надясно",
			mergeDown		: "Сливане надолу",
			splitHorizontal	: "Разделяне на клетки хоризонтално",
			splitVertical	: "Разделяне на клетки вертикално",
			title			: "Свойства на клетка",
			cellType		: "Тип клетка:",
			rowSpan			: "Обхват на редове:",
			colSpan			: "Обхват на колони:",
			wordWrap		: "Пренасяне на дума:",
			hAlign			: "Хоризонтално подравняване:",
			vAlign			: "Вертикално подравняване:",
			alignBaseline	: "Базова линия",
			bgColor			: "Цвят на фон:",
			borderColor		: "Цвят на граница:",
			data			: "Данни",
			header			: "Заглавна част",
			yes				: "Да",
			no				: "Не",
			invalidWidth	: "Ширината на клетката трябва да бъде положително число.",
			invalidHeight	: "Височината на клетката трябва да бъде положително число.",
			invalidRowSpan	: "Обхватът на редовете трябва да бъде положително число.",
			invalidColSpan	: "Обхватът на колоните трябва да бъде положително число.",
			chooseColor : "Изберете"
		},

		row :
		{
			menu			: "Ред",
			insertBefore	: "Вмъкване на ред преди",
			insertAfter		: "Вмъкване на ред след",
			deleteRow		: "Изтриване на редове"
		},

		column :
		{
			menu			: "Колона",
			insertBefore	: "Вмъкване на колона преди",
			insertAfter		: "Вмъкване на колона след",
			deleteColumn	: "Изтриване на колони"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "Свойства на бутон",
		text		: "Текст (Стойност):",
		type		: "Тип:",
		typeBtn		: "Бутон",
		typeSbm		: "Подаване",
		typeRst		: "Нулиране"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "Свойства на поле за отметка",
		radioTitle	: "Свойства на радио бутон",
		value		: "Стойност:",
		selected	: "Избран"
	},

	// Form Dialog.
	form :
	{
		title		: "Вмъкване на формуляр",
		menu		: "От Свойства",
		action		: "Действие:",
		method		: "Метод:",
		encoding	: "Кодиране:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "Избор на Свойства на поле",
		selectInfo	: "Избор на Информация",
		opAvail		: "Достъпни опции",
		value		: "Стойност:",
		size		: "Размер:",
		lines		: "линии",
		chkMulti	: "Позволи множество избори",
		opText		: "Текст:",
		opValue		: "Стойност:",
		btnAdd		: "Добавяне",
		btnModify	: "Модифициране",
		btnUp		: "Нагоре",
		btnDown		: "Надолу",
		btnSetValue : "Задаване като избрана стойност",
		btnDelete	: "Изтриване"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "Свойства на област за текст",
		cols		: "Колони:",
		rows		: "Редове:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "Свойства на текстово поле",
		name		: "Име:",
		value		: "Стойност:",
		charWidth	: "Ширина на символ:",
		maxChars	: "Максимум символи:",
		type		: "Тип:",
		typeText	: "Текст",
		typePass	: "Парола"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "Свойства на скрито поле",
		name	: "Име:",
		value	: "Стойност:"
	},

	// Image Dialog.
	image :
	{
		title		: "Изображение",
		titleButton	: "Свойства на бутон за изображение",
		menu		: "Свойства на изображение...",
		infoTab	: "Информация за изображение",
		btnUpload	: "Изпрати го към сървъра",
		upload	: "Качване",
		alt		: "Алтернативен текст:",
		lockRatio	: "Коефициент на заключване",
		resetSize	: "Възстановяване на размер",
		border	: "Граница:",
		hSpace	: "Хоризонтално пространство:",
		vSpace	: "Вертикално пространство:",
		alertUrl	: "Моля, въведете URL адрес на изображението",
		linkTab	: "Връзка",
		button2Img	: "Желаете ли да трансформирате избрания бутон на изображение в обикновено изображение?",
		img2Button	: "Желаете ли да трансформирате избраното изображение в бутон на изображение?",
		urlMissing : "Липсва URL източник на изображението.",
		validateBorder : "Границата трябва да бъде положително цяло число.",
		validateHSpace : "Хоризонталното пространство трябва да бъде положително цяло число.",
		validateVSpace : "Вертикалното пространство трябва да бъде положително цяло число."
	},

	// Flash Dialog
	flash :
	{
		properties		: "Флаш свойства",
		propertiesTab	: "Свойства",
		title		: "Флаш",
		chkPlay		: "Автоматично пускане",
		chkLoop		: "Цикъл",
		chkMenu		: "Активиране на флаш меню",
		chkFull		: "Позволи пълен екран",
 		scale		: "Мащаб:",
		scaleAll		: "Покажи всички",
		scaleNoBorder	: "Без Граница",
		scaleFit		: "Точно съответствие",
		access			: "Достъп до скрипт:",
		accessAlways	: "Винаги",
		accessSameDomain	: "Същият домейн",
		accessNever	: "Никога",
		alignAbsBottom: "Abs долна част",
		alignAbsMiddle: "Abs средна част",
		alignBaseline	: "Базова линия",
		alignTextTop	: "Отгоре в текста",
		quality		: "Качество:",
		qualityBest	: "Най-добро",
		qualityHigh	: "Високо",
		qualityAutoHigh	: "Автоматично високо",
		qualityMedium	: "Средно",
		qualityAutoLow	: "Автоматично ниско",
		qualityLow	: "Ниско",
		windowModeWindow	: "Прозорец",
		windowModeOpaque	: "Непрозрачен",
		windowModeTransparent	: "Прозрачен",
		windowMode	: "Режим на прозорец:",
		flashvars	: "Променливи:",
		bgcolor	: "Цвят на фон:",
		hSpace	: "Хоризонтално пространство:",
		vSpace	: "Вертикално пространство:",
		validateSrc : "URL адресът не трябва да е празен.",
		validateHSpace : "Хоризонталното пространство трябва да бъде положително цяло число.",
		validateVSpace : "Вертикалното пространство трябва да бъде положително цяло число."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "Проверка на правописа",
		title			: "Проверка на правописа",
		notAvailable	: "Съжаляваме, но услугата в момента не е достъпна.",
		errorLoading	: "Грешка при зареждането на хост на услуга на приложение: %s.",
		notInDic		: "Не е в речника",
		changeTo		: "Промени на",
		btnIgnore		: "Игнориране",
		btnIgnoreAll	: "Игнорирай всички",
		btnReplace		: "Заместване",
		btnReplaceAll	: "Замести всички",
		btnUndo			: "Отмяна",
		noSuggestions	: "- Няма предположения -",
		progress		: "Проверката на правописа се изпълнява...",
		noMispell		: "Проверката на правописа приключи: Няма намерени правописни грешки",
		noChanges		: "Проверката на правописа приключи: Няма променени думи",
		oneChange		: "Проверката на правописа приключи: Една променена дума",
		manyChanges		: "Проверката на правописа приключи: %1 променени думи",
		ieSpellDownload	: "Програмата за проверка на правописа не е инсталирана. Желаете ли да я изтеглите сега?"
	},

	smiley :
	{
		toolbar	: "Вмъкване на емотикон",
		title	: "Емотикони",
		options : "Опции на емотикон"
	},

	elementsPath :
	{
		eleLabel : "Пътека на елементи",
		eleTitle : "%1 елемент"
	},

	numberedlist : "Номериран списък",
	bulletedlist : "Списък с водещи символи",
	indent : "Увеличи отстъп",
	outdent : "Намали отстъп",

	bidi :
	{
		ltr : "От ляво надясно",
		rtl : "От дясно наляво",
	},

	justify :
	{
		left : "Подравняване наляво",
		center : "Подравняване в център",
		right : "Подравняване надясно",
		block : "Двустранно подравняване"
	},

	blockquote : "Блоков цитат",

	clipboard :
	{
		title		: "Поставяне",
		cutError	: "Настройките за защита на Вашия браузър пречат на автоматичното изрязване. Използвайте Ctrl+X във Вашата клавиатура вместо това.",
		copyError	: "Настройките за защита на Вашия браузър пречат на автоматичното копиране. Използвайте Ctrl+C във Вашата клавиатура вместо това.",
		pasteMsg	: "Натиснете Ctrl+V (Cmd+V при MAC) за да поставите по-долу.",
		securityMsg	: "Защитата на Вашия браузър блокира поставянето директно от буферната памет.",
		pasteArea	: "Област на поставяне"
	},

	pastefromword :
	{
		confirmCleanup	: "Текстът, който искате да поставите, изглежда е копиран от Word. Желаете ли да го изчистите преди поставянето?",
		toolbar			: "Поставяне на специален символ",
		title			: "Поставяне на специален символ",
		error			: "Не беше възможно да се изчистят поставените данни поради вътрешна грешка"
	},

	pasteText :
	{
		button	: "Поставяне като обикновен текст",
		title	: "Поставяне като обикновен текст"
	},

	templates :
	{
		button 			: "Шаблони",
		title : "Шаблони на съдържание",
		options : "Опции на шаблон",
		insertOption: "Подмяна на актуално съдържание",
		selectPromptMsg: "Изберете шаблона за отваряне в редактор",
		emptyListMsg : "(Няма определени шаблони)"
	},

	showBlocks : "Покажи блокове",

	stylesCombo :
	{
		label		: "Стилове",
		panelTitle 	: "Стилове",
		panelTitle1	: "Стилове на блок",
		panelTitle2	: "Вмъкнати стилове",
		panelTitle3	: "Стилове на обект"
	},

	format :
	{
		label		: "Формат",
		panelTitle	: "Формат на параграф",

		tag_p		: "Нормален",
		tag_pre		: "Форматиран",
		tag_address	: "Адрес",
		tag_h1		: "Заглавие 1",
		tag_h2		: "Заглавие 2",
		tag_h3		: "Заглавие 3",
		tag_h4		: "Заглавие 4",
		tag_h5		: "Заглавие 5",
		tag_h6		: "Заглавие 6",
		tag_div		: "Нормално (DIV)"
	},

	div :
	{
		title				: "Създаване на Div контейнер",
		toolbar				: "Създаване на Div контейнер",
		cssClassInputLabel	: "Класове на листове със стилове",
		styleSelectLabel	: "Стил",
		IdInputLabel		: "Идентификатор",
		languageCodeInputLabel	: " Езиков код",
		inlineStyleInputLabel	: "Вмъкнат стил",
		advisoryTitleInputLabel	: "Заглавие на консултант",
		langDirLabel		: "Посока на текст",
		langDirLTRLabel		: "От ляво надясно",
		langDirRTLLabel		: "От дясно наляво",
		edit				: "Редактиране на Div",
		remove				: "Премахване на Div"
  	},

	iframe :
	{
		title		: "Свойства на IFrame",
		toolbar		: "Вмъкване на IFrame",
		noUrl		: "Моля, въведете URL на iframe",
		scrolling	: "Активиране на плъзгачи",
		border		: "Покажи граница на фрейм"
	},

	font :
	{
		label		: "Шрифт",
		voiceLabel	: "Шрифт",
		panelTitle	: "Име на шрифт"
	},

	fontSize :
	{
		label		: "Размер",
		voiceLabel	: "Размер на шрифт",
		panelTitle	: "Размер на шрифт"
	},

	colorButton :
	{
		textColorTitle	: "Цвят на текста",
		bgColorTitle	: "Цвят на фон",
		panelTitle		: "Цветове",
		auto			: "Автоматично",
		more			: "Още цветове..."
	},

	colors :
	{
		"000" : "Черен",
		"800000" : "Кестеняв",
		"8B4513" : "Светло кафяво",
		"2F4F4F" : "Тъмно сиво-син",
		"008080" : "Синьозелен",
		"000080" : "Морско синьо",
		"4B0082" : "Индиго",
		"696969" : "Тъмносив",
		"B22222" : "Тухлено червен",
		"A52A2A" : "Кафяв",
		"DAA520" : "Златист",
		"006400" : "Тъмно зелен",
		"40E0D0" : "Тюркоазен",
		"0000CD" : "Средно син",
		"800080" : "Лилав",
		"808080" : "Сив",
		"F00" : "Червен",
		"FF8C00" : "Тъмно оранжев",
		"FFD700" : "Златен",
		"008000" : "Зелен",
		"0FF" : "Синьозелен",
		"00F" : "Син",
		"EE82EE" : "Виолетов",
		"A9A9A9" : "Бледосив",
		"FFA07A" : "Светло розовооранжев",
		"FFA500" : "Оранжев",
		"FFFF00" : "Жълт",
		"00FF00" : "Лимоненожълт",
		"AFEEEE" : "Бледо тюркоазен",
		"ADD8E6" : "Свелосин",
		"DDA0DD" : "Тъмновиолетов",
		"D3D3D3" : "Светлосив",
		"FFF0F5" : "Бледолилаво",
		"FAEBD7" : "Антично бяло",
		"FFFFE0" : "Светложълт",
		"F0FFF0" : "Бледосиньо",
		"F0FFFF" : "Небесен",
		"F0F8FF" : "Небесносиньо",
		"E6E6FA" : "Лавандулов",
		"FFF" : "Бял"
	},

	scayt :
	{
		title			: "Проверка на правопис докато пишете",
		opera_title		: "Не се поддържа от Opera",
		enable			: "Активиране на SCAYT",
		disable			: "Деактивиране на SCAYT",
		about			: "Относно SCAYT",
		toggle			: "Превключване на SCAYT",
		options			: "Опции",
		langs			: "Езици",
		moreSuggestions	: "Още предложения",
		ignore			: "Игнориране",
		ignoreAll		: "Игнорирай всички",
		addWord			: "Добавяне на дума",
		emptyDic		: "Името на речник не трябва да е празно.",

		optionsTab		: "Опции",
		allCaps			: "Игнориране на всички думи с главни букви",
		ignoreDomainNames : "Игнориране на имена на домейн",
		mixedCase		: "Игнориране на думи със смесени букви",
		mixedWithDigits	: "Игнориране на думи с числа",

		languagesTab	: "Езици",

		dictionariesTab	: "Речници",
		dic_field_name	: "Име на речник",
		dic_create		: "Създаване",
		dic_restore		: "Възстановяване",
		dic_delete		: "Изтриване",
		dic_rename		: "Преименуване",
		dic_info		: "Първоначално речника на потребителя се съхранява в Бисквитка. Бисквитките обаче са с ограничен размер. Когато речникът на потребителя нарастне до положение, при което не може да се съхрани в Бисквитка, тогава речникът може да се съхрани в нашия сървър. За да съхраните Вашия личен речник в нашия сървър, трябва да укажете име за Вашия сървър. Ако вече имате запомнен речник, моля въведете неговото име и щракнете върху бутон Възстановяване.",

		aboutTab		: "Относно"
	},

	about :
	{
		title		: "Относно CKEditor",
		dlgTitle	: "Относно CKEditor",
		help	: "Проверете $1 за помощ.",
		userGuide : "CKEditor Ръководство за потребител",
		moreInfo	: "За информация относно лицензиране, моля посетете нашия уеб сайт:",
		copy		: "Авторско право &copy; $1. Всички права запазени."
	},

	maximize : "Максимизиране",
	minimize : "Минимизиране",

	fakeobjects :
	{
		anchor	: "Котва",
		flash	: "Флаш анимация",
		iframe		: "IFrame",
		hiddenfield	: "Скрито поле",
		unknown	: "Непознат обект"
	},

	resize : "Плъзнете за преоразмеряване",

	colordialog :
	{
		title		: "Изберете цвят",
		options	:	"Опции за цвят",
		highlight	: "Осветяване",
		selected	: "Избран цвят",
		clear		: "Изчистване"
	},

	toolbarCollapse	: "Сгъване на лента с инструменти",
	toolbarExpand	: "Разгъване на лента с инструменти",

	toolbarGroups :
	{
		document : "Документ",
		clipboard : "Буферна памет/Отмяна",
		editing : "Редактиране",
		forms : "Формуляри",
		basicstyles : "Основни стилове",
		paragraph : "Параграф",
		links : "Връзки",
		insert : "Вмъкване",
		styles : "Стилове",
		colors : "Цветове",
		tools : "Инструменти"
	},

	bidi :
	{
		ltr : "Промяна до текст от ляво надясно",
		rtl : "Промяна до текст от дясно наляво"
	},

	docprops :
	{
		label : "Свойства на документ",
		title : "Свойства на документ",
		design : "Дизайн",
		meta : "Метаетикети",
		chooseColor : "Изберете",
		other : "Други...",
		docTitle :	"Заглавие на страница",
		charset : 	"Кодиране на набор символи",
		charsetOther : "Друго кодиране на набор символи",
		charsetASCII : "ASCII",
		charsetCE : "Централноевропейски",
		charsetCT : "Китайски традиционен (Big5)",
		charsetCR : "Кирилица",
		charsetGR : "Гръцки",
		charsetJP : "Японски",
		charsetKR : "Корейски",
		charsetTR : "Турски",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "Западноевропейски",
		docType : "Заглавие на тип документ",
		docTypeOther : "Друго заглавие на тип документ",
		xhtmlDec : "Включване на XHTML декларации",
		bgColor : "Цвят на фон",
		bgImage : "URL на фоново изображение",
		bgFixed : "Фон без превъртане (фиксиран)",
		txtColor : "Цвят на текста",
		margin : "Полета на страница",
		marginTop : "Горе",
		marginLeft : "Ляво",
		marginRight : "Дясно",
		marginBottom : "Долна част",
		metaKeywords : "Ключови думи за индексиране на документ (разделени със запетая)",
		metaDescription : "Описание на документ",
		metaAuthor : "Автор",
		metaCopyright : "Авторско право",
		previewHtml : "<p>Това е <strong>примерен текст</strong>. Вие използвате <a href=\"javascript:void(0)\">CKEditor</a>.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "инчове",
			widthCm	: "сантиметри",
			widthMm	: "милиметри",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "точки",
			widthPc	: "пики"
		},
		table :
		{
			heightUnit	: "Височина на единица:",
			insertMultipleRows : "Вмъкване на редове",
			insertMultipleCols : "Вмъкване на колони",
			noOfRows : "Брой редове:",
			noOfCols : "Брой колони:",
			insertPosition : "Позиция:",
			insertBefore : "Преди",
			insertAfter : "След",
			selectTable : "Изберете таблица",
			selectRow : "Изберете ред",
			columnTitle : "Колона",
			colProps : "Свойства на колона",
			invalidColumnWidth	: "Ширината на колоната трябва да бъде положително число."
		},
		cell :
		{
			title : "Клетка"
		},
		emoticon :
		{
			angel		: "Ангел",
			angry		: "Ядосано",
			cool		: "Готин",
			crying		: "Плачещ",
			eyebrow		: "Невярващ",
			frown		: "Начумерен",
			goofy		: "Глуповат",
			grin		: "Широко усмихнат",
			half		: "С половин усмивка",
			idea		: "Идея",
			laughing	: "Смеещ се",
			laughroll	: "Търкалящ се от смях",
			no			: "Не",
			oops		: "Опа",
			shy			: "Срамежлив",
			smile		: "Усмихнат",
			tongue		: "Изплезен",
			wink		: "Намигване",
			yes			: "Да"
		},

		menu :
		{
			link	: "Вмъкване на връзка",
			list	: "Списък",
			paste	: "Поставяне",
			action	: "Действие",
			align	: "Подравняване",
			emoticon: "Емотикон"
		},

		iframe :
		{
			title	: "IFrame"
		},

		list:
		{
			numberedTitle		: "Номериран списък",
			bulletedTitle		: "Списък с водещи символи"
		},

		// Anchor dialog
		anchor :
		{
			description	: "Въведете описателно име на отметка, като 'Раздел 1.2'. След вмъкването на отметката, щракнете или върху икона 'Връзка', или върху икона 'Връзка към отметка на документ', за да се свържете с нея.",
			title		: "Връзка към отметка на документ",
			linkTo		: "Връзка към:"
		},

		urllink :
		{
			title : "URL връзка",
			linkText : "Текст на връзка:",
			selectAnchor: "Изберете котва:",
			nourl: "Моля, въведете URL в текстовото поле.",
			urlhelp: "Въведете или поставете URL да се отваря, когато потребителите щракнат върху тази връзка, например http://www.example.com.",
			displaytxthelp: "Въведете текстово показване за връзката.",
			openinnew : "Отваряне на връзка в нов прозорец"
		},

		spellchecker :
		{
			title : "Проверка за правописни грешки",
			replace : "Заместване:",
			suggesstion : "Предложения:",
			withLabel : "С:",
			replaceButton : "Заместване",
			replaceallButton:"Замести всички",
			skipButton:"Пропускане",
			skipallButton: "Пропусни всички",
			undochanges: "Отмяна на промени",
			complete: "Проверката на правописа завърши",
			problem: "Проблем при извличане на XML данни",
			addDictionary: "Добавяне към речник",
			editDictionary: "Редактиране на речник"
		},

		status :
		{
			keystrokeForHelp: "Натиснете ALT 0 за помощ"
		},

		linkdialog :
		{
			label : "Връзка на диалог"
		},

		image :
		{
			previewText : "Текстът ще тръгне около изображението, което добавяте, като в този пример."
		}
	}

};

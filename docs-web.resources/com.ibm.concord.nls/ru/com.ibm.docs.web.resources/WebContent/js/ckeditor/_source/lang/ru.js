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
	editorTitle : "Текстовый редактор, %1.",

	// ARIA descriptions.
	toolbars	: "Панели инструментов",
	editor	: "Текстовый редактор",

	// Toolbar buttons without dialogs.
	source			: "Источник",
	newPage			: "Создать страницу",
	save			: "Сохранить",
	preview			: "Предварительный просмотр:",
	cut				: "Вырезать",
	copy			: "Скопировать",
	paste			: "Вставить",
	print			: "Печать",
	underline		: "Подчеркивание",
	bold			: "Полужирный",
	italic			: "Курсив",
	selectAll		: "Выделить все",
	removeFormat	: "Отменить форматирование",
	strike			: "Зачеркивание",
	subscript		: "Нижний индекс",
	superscript		: "Верхний индекс",
	horizontalrule	: "Вставить горизонтальную линию",
	pagebreak		: "Вставить разрыв страницы",
	pagebreakAlt		: "Разрыв страницы",
	unlink			: "Удалить ссылку",
	undo			: "Отменить",
	redo			: "Повторить",

	// Common messages and labels.
	common :
	{
		browseServer	: "Сервер браузера:",
		url				: "URL:",
		protocol		: "Протокол:",
		upload			: "Передать на сервер:",
		uploadSubmit	: "Отправить на сервер",
		image			: "Вставить изображение",
		flash			: "Вставить видеоклип Flash",
		form			: "Вставить форму",
		checkbox		: "Вставить переключатель",
		radio			: "Вставить переключатель",
		textField		: "Вставить текстовое поле",
		textarea		: "Вставить область текста",
		hiddenField		: "Вставить скрытое поле",
		button			: "Вставить кнопку",
		select			: "Вставить поле выбора",
		imageButton		: "Вставить графическую кнопку",
		notSet			: "<not set>",
		id				: "ИД:",
		name			: "Имя:",
		langDir			: "Направление текста:",
		langDirLtr		: "Слева направо",
		langDirRtl		: "Справа налево",
		langCode		: "Код языка:",
		longDescr		: "URL длинного описания:",
		cssClass		: "Классы таблицы стилей:",
		advisoryTitle	: "Информационный заголовок:",
		cssStyle		: "Стиль:",
		ok				: "OK",
		cancel			: "Отмена",
		close : "Закрыть",
		preview			: "Предварительный просмотр:",
		generalTab		: "Общие",
		advancedTab		: "Дополнительно",
		validateNumberFailed	: "Это значение не является числом.",
		confirmNewPage	: "Несохраненные изменения этих материалов будут потеряны. Вы действительно хотите загрузить новую страницу?",
		confirmCancel	: "Некоторые параметры были изменены. Вы действительно хотите закрыть это окно?",
		options : "Параметры",
		target			: "Целевой объект:",
		targetNew		: "Новое окно (_blank)",
		targetTop		: "Верхнее окно (_top)",
		targetSelf		: "То же окно (_self)",
		targetParent	: "Родительское окно (_parent)",
		langDirLTR		: "Слева направо",
		langDirRTL		: "Справа налево",
		styles			: "Стиль:",
		cssClasses		: "Классы таблицы стилей:",
		width			: "Ширина:",
		height			: "Высота:",
		align			: "Выровнять:",
		alignLeft		: "По левому краю",
		alignRight		: "По правому краю",
		alignCenter		: "По центру",
		alignTop		: "По верхнему краю",
		alignMiddle		: "По центру",
		alignBottom		: "По нижнему краю",
		invalidHeight	: "Высота должна быть положительным целым числом.",
		invalidWidth	: "Ширина должна быть положительным целым числом.",
		invalidCssLength	: "Значение поля '%1' должно быть положительным числом (указывать допустимые единицы измерения CSS (px, %, in, cm, mm, em, ex, pt или pc) не обязательно).",
		invalidHtmlLength	: "Значение поля '%1' должно быть положительным числом (указывать допустимые единицы измерения HTML (px или %) не обязательно).",
		invalidInlineStyle	: "Значение, указанное для локального стиля, должно состоять из одной или нескольких записей в формате \"имя : значение\", разделенных точкой с запятой.",
		cssLengthTooltip	: "Введите числовое значение в пикселях или число с допустимой единицей CSS (px, %, in, cm, mm, em, ex, pt, или pc).",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">, недоступно</span>"
	},

	contextmenu :
	{
		options : "Опции контекстного меню"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "Вставить символ",
		title		: "Символ",
		options : "Опции специальных символов"
	},

	// Link dialog.
	link :
	{
		toolbar		: "URL ссылки",
		other 		: "<other>",
		menu		: "Изменить ссылку...",
		title		: "Ссылка",
		info		: "Информация о ссылке",
		target		: "Целевой объект",
		upload		: "Передать на сервер:",
		advanced	: "Дополнительно",
		type		: "Тип ссылки:",
		toUrl		: "URL",
		toAnchor	: "Ссылка на метку в тексте",
		toEmail		: "Эл. почта",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "Имя целевого фрейма:",
		targetPopupName	: "Имя всплывающего окна:",
		popupFeatures	: "Функции всплывающего окна:",
		popupResizable	: "С возможностью изменения размера",
		popupStatusBar	: "Строка состояния",
		popupLocationBar	: "Строка адреса",
		popupToolbar	: "Панель инструментов",
		popupMenuBar	: "Строка меню",
		popupFullScreen	: "Полноэкранный (IE)",
		popupScrollBars	: "Полосы прокрутки",
		popupDependent	: "Зависимый (Netscape)",
		popupLeft		: "Положение левого края",
		popupTop		: "Положение верхнего края",
		id				: "ИД:",
		langDir			: "Направление текста:",
		langDirLTR		: "Слева направо",
		langDirRTL		: "Справа налево",
		acccessKey		: "Ключ доступа:",
		name			: "Имя:",
		langCode		: "Код языка:",
		tabIndex		: "Указатель табуляции:",
		advisoryTitle	: "Информационный заголовок:",
		advisoryContentType	: "Тип содержимого для сведения:",
		cssClasses		: "Классы таблицы стилей:",
		charset			: "Кодировка связанного ресурса:",
		styles			: "Стиль:",
		rel			: "Отношение",
		selectAnchor	: "Выбрать метку",
		anchorName		: "По имени маркера",
		anchorId		: "По ИД элемента",
		emailAddress	: "Адрес эл. почты",
		emailSubject	: "Тема сообщения",
		emailBody		: "Тело сообщения",
		noAnchors		: "В документе нет доступных закладок. Для добавления закладки щелкните на значке 'Вставить закладку документа' на панели инструментов.",
		noUrl			: "Введите URL ссылки",
		noEmail			: "Введите адрес электронной почты"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "Вставить закладку документа",
		menu		: "Изменить закладку документа",
		title		: "Закладка документа",
		name		: "Имя:",
		errorName	: "Введите имя закладки документа",
		remove		: "Удалить закладку документа"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "Свойства нумерованного списка",
		bulletedTitle		: "Свойства маркированного списка",
		type				: "Тип",
		start				: "Начало",
		validateStartNumber				:"Начальный номер списка должен быть целым числом.",
		circle				: "Круг",
		disc				: "Диск",
		square				: "Квадрат",
		none				: "Нет",
		notset				: "<not set>",
		armenian			: "Армянская нумерация",
		georgian			: "Грузинская нумерация (an, ban, gan и т. п.)",
		lowerRoman			: "Строчные римские цифры (i, ii, iii, iv, v и т. п.)",
		upperRoman			: "Прописные римские числа (I, II, III, IV, V и т. п.)",
		lowerAlpha			: "Строчные латинские буквы (a, b, c, d, e и т. п.)",
		upperAlpha			: "Прописные латинские буквы (A, B, C, D, E и т. п.)",
		lowerGreek			: "Строчные греческие буквы (alpha, beta, gamma и т. п.)",
		decimal				: "Десятичные числа (1, 2, 3  и т. п.)",
		decimalLeadingZero	: "Десятичные числа с ведущим нулем (01, 02, 03 и т. п.)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "Найти и заменить",
		find				: "Найти",
		replace				: "Заменить",
		findWhat			: "Найти:",
		replaceWith			: "Заменить на:",
		notFoundMsg			: "Указанный текст не найден.",
		noFindVal			: 'Требуется текст для поиска.',
		findOptions			: "Опции поиска",
		matchCase			: "С учетом регистра",
		matchWord			: "Слово целиком",
		matchCyclic			: "По всему тексту",
		replaceAll			: "Заменить все",
		replaceSuccessMsg	: "Заменено вхождений: %1."
	},

	// Table Dialog
	table :
	{
		toolbar		: "Вставить таблицу",
		title		: "Таблица",
		menu		: "Свойства таблицы",
		deleteTable	: "Удалить таблицу",
		rows		: "Строки:",
		columns		: "Столбцы:",
		border		: "Размер рамки:",
		widthPx		: "пикселей",
		widthPc		: "процентов",
		widthUnit	: "Единица ширины:",
		cellSpace	: "Расстояние между ячейками:",
		cellPad		: "Отступ внутри ячеек:",
		caption		: "Название:",
		summary		: "Обзор:",
		headers		: "Заголовки:",
		headersNone		: "Нет",
		headersColumn	: "Первый столбец",
		headersRow		: "Первая строка",
		headersBoth		: "Оба",
		invalidRows		: "Число строк должно быть положительным целым числом.",
		invalidCols		: "Число столбцов должно быть положительным целым числом.",
		invalidBorder	: "Размер рамки должен быть положительным числом.",
		invalidWidth	: "Ширина таблицы должна быть положительным числом.",
		invalidHeight	: "Высота таблицы должна быть положительным числом.",
		invalidCellSpacing	: "Расстояние между ячейками должно быть положительным числом.",
		invalidCellPadding	: "Отступ внутри ячеек должен быть положительным числом.",

		cell :
		{
			menu			: "Ячейка",
			insertBefore	: "Вставить ячейку перед",
			insertAfter		: "Вставить ячейку после",
			deleteCell		: "Удалить ячейки",
			merge			: "Объединить ячейки",
			mergeRight		: "Объединить с правой",
			mergeDown		: "Объединить с нижней",
			splitHorizontal	: "Разбить ячейку по горизонтали",
			splitVertical	: "Разбить ячейку по вертикали",
			title			: "Свойства ячейки",
			cellType		: "Тип ячейки:",
			rowSpan			: "Число строк:",
			colSpan			: "Число столбцов:",
			wordWrap		: "Перенос слов:",
			hAlign			: "Выравнивание по горизонтали:",
			vAlign			: "Выравнивание по вертикали:",
			alignBaseline	: "По базовой линии",
			bgColor			: "Цвет фона:",
			borderColor		: "Цвет рамки:",
			data			: "Данные",
			header			: "Заголовок",
			yes				: "Да",
			no				: "Нет",
			invalidWidth	: "Ширина ячейки должна быть положительным числом.",
			invalidHeight	: "Высота ячейки должна быть положительным числом.",
			invalidRowSpan	: "Число строк должно быть положительным целым числом.",
			invalidColSpan	: "Число столбцов должно быть положительным целым числом.",
			chooseColor : "Выбрать"
		},

		row :
		{
			menu			: "Строка",
			insertBefore	: "Вставить строку перед",
			insertAfter		: "Вставить строку после",
			deleteRow		: "Удалить строки"
		},

		column :
		{
			menu			: "Столбец",
			insertBefore	: "Вставить столбец перед",
			insertAfter		: "Вставить столбец после",
			deleteColumn	: "Удалить столбцы"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "Свойства кнопки",
		text		: "Текст (значение):",
		type		: "Тип:",
		typeBtn		: "Кнопка",
		typeSbm		: "Отправить",
		typeRst		: "Сбросить"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "Свойства переключателей",
		radioTitle	: "Свойства переключателя",
		value		: "Значение:",
		selected	: "Выбранные"
	},

	// Form Dialog.
	form :
	{
		title		: "Вставить форму",
		menu		: "Свойства формы",
		action		: "Действие:",
		method		: "Метод:",
		encoding	: "Кодировка:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "Свойства поля выбора",
		selectInfo	: "Информация о выборе",
		opAvail		: "Доступные опции",
		value		: "Значение:",
		size		: "Размер:",
		lines		: "строк",
		chkMulti	: "Разрешить несколько вариантов выбора",
		opText		: "Текст:",
		opValue		: "Значение:",
		btnAdd		: "Добавить",
		btnModify	: "Изменить",
		btnUp		: "Вверх",
		btnDown		: "Вниз",
		btnSetValue : "Задать в качестве выбранного значения",
		btnDelete	: "Удалить"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "Свойства области текста",
		cols		: "Столбцы:",
		rows		: "Строки:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "Свойства текстового поля",
		name		: "Имя:",
		value		: "Значение:",
		charWidth	: "Ширина символа:",
		maxChars	: "Максимальное число символов:",
		type		: "Тип:",
		typeText	: "Текст",
		typePass	: "Пароль"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "Свойства скрытого поля",
		name	: "Имя:",
		value	: "Значение:"
	},

	// Image Dialog.
	image :
	{
		title		: "Изображение",
		titleButton	: "Свойства графической кнопки",
		menu		: "Свойства изображения...",
		infoTab	: "Информация об изображении",
		btnUpload	: "Отправить на сервер",
		upload	: "Передать",
		alt		: "Альтернативный текст:",
		lockRatio	: "Блокировать отношение",
		resetSize	: "Сбросить размер",
		border	: "Рамка:",
		hSpace	: "Интервал по горизонтали:",
		vSpace	: "Интервал по вертикали:",
		alertUrl	: "Введите URL изображения",
		linkTab	: "Ссылка",
		button2Img	: "Преобразовать выбранную графическую кнопку в простое изображение?",
		img2Button	: "Преобразовать выбранное изображение в графическую кнопку?",
		urlMissing : "Отсутствует URL источника изображения.",
		validateBorder : "Рамка должна быть положительным целым числом.",
		validateHSpace : "Интервал по горизонтали должен быть положительным целым числом.",
		validateVSpace : "Интервал по вертикали должен быть положительным целым числом."
	},

	// Flash Dialog
	flash :
	{
		properties		: "Свойства объекта Flash",
		propertiesTab	: "Свойства",
		title		: "Flash",
		chkPlay		: "Автоматическое воспроизведение",
		chkLoop		: "Циклическое воспроизведение",
		chkMenu		: "Включить меню Flash",
		chkFull		: "Разрешить полноэкранный режим",
 		scale		: "Масштаб:",
		scaleAll		: "Показать все",
		scaleNoBorder	: "Без обрамления",
		scaleFit		: "Точно по размеру",
		access			: "Доступ к сценарию:",
		accessAlways	: "Всегда",
		accessSameDomain	: "Тот же домен",
		accessNever	: "Никогда",
		alignAbsBottom: "По нижнему краю - Абс.",
		alignAbsMiddle: "По середине - Абс.",
		alignBaseline	: "По базовой линии",
		alignTextTop	: "По верхнему краю текста",
		quality		: "Качество",
		qualityBest	: "Наилучшее",
		qualityHigh	: "Высокий",
		qualityAutoHigh	: "Автоматически выбираемое высокое",
		qualityMedium	: "Среднее",
		qualityAutoLow	: "Автоматически выбираемое низкое",
		qualityLow	: "Низкий",
		windowModeWindow	: "Окно",
		windowModeOpaque	: "Непрозрачный",
		windowModeTransparent	: "Прозрачный",
		windowMode	: "Режим окна:",
		flashvars	: "Переменные:",
		bgcolor	: "Цвет фона:",
		hSpace	: "Интервал по горизонтали:",
		vSpace	: "Интервал по вертикали:",
		validateSrc : "URL не должен быть пустым.",
		validateHSpace : "Интервал по горизонтали должен быть положительным целым числом.",
		validateVSpace : "Интервал по вертикали должен быть положительным целым числом."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "Проверка орфографии",
		title			: "Проверка орфографии",
		notAvailable	: "Извините, служба в данный момент недоступна.",
		errorLoading	: "Ошибка загрузки хоста службы приложения: %s.",
		notInDic		: "Отсутствует в словаре",
		changeTo		: "Изменить на",
		btnIgnore		: "Пропустить",
		btnIgnoreAll	: "Игнорировать все",
		btnReplace		: "Заменить",
		btnReplaceAll	: "Заменить все",
		btnUndo			: "Отменить",
		noSuggestions	: "- Предложений нет -",
		progress		: "Выполняется проверка орфографии...",
		noMispell		: "Проверка орфографии выполнена. Орфографических ошибок не найдено",
		noChanges		: "Проверка орфографии выполнена. Замены слов не было",
		oneChange		: "Проверка орфографии выполнена. Изменено одно слово",
		manyChanges		: "Проверка орфографии выполнена. Изменено слов: %1",
		ieSpellDownload	: "Программа проверки орфографии не установлена. Загрузить ее?"
	},

	smiley :
	{
		toolbar	: "Вставить значок настроения",
		title	: "Значки настроения",
		options : "Параметры значка настроения"
	},

	elementsPath :
	{
		eleLabel : "Путь к элементам",
		eleTitle : "Элемент %1"
	},

	numberedlist : "Нумерованный список",
	bulletedlist : "Маркированный список",
	indent : "Увеличить отступ",
	outdent : "Уменьшить отступ",

	bidi :
	{
		ltr : "Слева направо",
		rtl : "Справа налево",
	},

	justify :
	{
		left : "Выровнять по левому краю",
		center : "Выровнять по центру",
		right : "Выровнять по правому краю",
		block : "Выровнять по обоим краям"
	},

	blockquote : "Цитата",

	clipboard :
	{
		title		: "Вставить",
		cutError	: "Автоматическое отсечение запрещено в настройках безопасности браузера. Используйте сочетание клавиш Ctrl+X.",
		copyError	: "Автоматическое копирование запрещено в настройках безопасности браузера. Используйте сочетание клавиш Ctrl+C.",
		pasteMsg	: "Нажмите клавиши Ctrl+V (Cmd+V в MAC) для вставки ниже.",
		securityMsg	: "Защита браузера блокирует вставку непосредственно из буфера обмена.",
		pasteArea	: "Область вставки"
	},

	pastefromword :
	{
		confirmCleanup	: "Похоже, что вставляемый текст скопирован из Word. Очистить его перед вставкой?",
		toolbar			: "Специальная вставка",
		title			: "Специальная вставка",
		error			: "Невозможно очистить вставляемые данные из-за внутренней ошибки"
	},

	pasteText :
	{
		button	: "Вставить как простой текст",
		title	: "Вставить как простой текст"
	},

	templates :
	{
		button 			: "Шаблоны",
		title : "Шаблоны материалов",
		options : "Опции шаблона",
		insertOption: "Заменить фактические материалы",
		selectPromptMsg: "Выберите шаблон для открытия в редакторе",
		emptyListMsg : "(Шаблонов не определено)"
	},

	showBlocks : "Показать блоки",

	stylesCombo :
	{
		label		: "Стили",
		panelTitle 	: "Стили",
		panelTitle1	: "Стили блока",
		panelTitle2	: "Локальные стили",
		panelTitle3	: "Стили объекта"
	},

	format :
	{
		label		: "Формат",
		panelTitle	: "Формат абзаца",

		tag_p		: "Обычный",
		tag_pre		: "Отформатирован",
		tag_address	: "Адрес",
		tag_h1		: "Заголовок 1",
		tag_h2		: "Заголовок 2",
		tag_h3		: "Заголовок 3",
		tag_h4		: "Заголовок 4",
		tag_h5		: "Заголовок 5",
		tag_h6		: "Заголовок 6",
		tag_div		: "Обычный (DIV)"
	},

	div :
	{
		title				: "Создать контейнер Div",
		toolbar				: "Создать контейнер Div",
		cssClassInputLabel	: "Классы таблицы стилей",
		styleSelectLabel	: "Стиль",
		IdInputLabel		: "ИД",
		languageCodeInputLabel	: " Код языка",
		inlineStyleInputLabel	: "Локальный стиль",
		advisoryTitleInputLabel	: "Информационный заголовок",
		langDirLabel		: "Направление текста",
		langDirLTRLabel		: "Слева направо",
		langDirRTLLabel		: "Справа налево",
		edit				: "Изменить Div",
		remove				: "Удалить Div"
  	},

	iframe :
	{
		title		: "Свойства IFrame",
		toolbar		: "Вставить IFrame",
		noUrl		: "Введите URL IFrame",
		scrolling	: "Включить полосы прокрутки",
		border		: "Показать границу фрейма"
	},

	font :
	{
		label		: "Шрифт",
		voiceLabel	: "Шрифт",
		panelTitle	: "Шрифт"
	},

	fontSize :
	{
		label		: "Размер",
		voiceLabel	: "Размер шрифта",
		panelTitle	: "Размер шрифта"
	},

	colorButton :
	{
		textColorTitle	: "Цвет текста",
		bgColorTitle	: "Цвет фона",
		panelTitle		: "Цвета",
		auto			: "Автоматически",
		more			: "Дополнительные цвета..."
	},

	colors :
	{
		"000" : "Черный",
		"800000" : "Темно-коричневый",
		"8B4513" : "Кожано-коричневый",
		"2F4F4F" : "Аспидно-серый",
		"008080" : "Сине-зеленый",
		"000080" : "Темно-синий",
		"4B0082" : "Индиго",
		"696969" : "Темно-серый",
		"B22222" : "Кирпичный",
		"A52A2A" : "Коричневый",
		"DAA520" : "Красного золота",
		"006400" : "Темно-зеленый",
		"40E0D0" : "Бирюзовый",
		"0000CD" : "Синий нейтральный",
		"800080" : "Фиолетовый",
		"808080" : "Серый",
		"F00" : "Красный",
		"FF8C00" : "Темно-оранжевый",
		"FFD700" : "Золото",
		"008000" : "Зеленый",
		"0FF" : "Бирюзовый",
		"00F" : "Синий",
		"EE82EE" : "Фиолетовый",
		"A9A9A9" : "Темно-серый",
		"FFA07A" : "Светлый оранжево-розовый",
		"FFA500" : "Оранжевый",
		"FFFF00" : "Желтый",
		"00FF00" : "Ярко-зеленый",
		"AFEEEE" : "Бледно-бирюзовый",
		"ADD8E6" : "Светло-синий",
		"DDA0DD" : "Сливовый",
		"D3D3D3" : "Светло-серый",
		"FFF0F5" : "Розово-лавандовый",
		"FAEBD7" : "Античный белый",
		"FFFFE0" : "Светло-желтый",
		"F0FFF0" : "Медовый",
		"F0FFFF" : "Лазурный",
		"F0F8FF" : "Бледно-голубой",
		"E6E6FA" : "Лавандовый",
		"FFF" : "Белый"
	},

	scayt :
	{
		title			: "Проверять орфографию по мере ввода",
		opera_title		: "Не поддерживается в Opera",
		enable			: "Включить SCAYT",
		disable			: "Выключить SCAYT",
		about			: "Сведения о SCAYT",
		toggle			: "Переключить SCAYT",
		options			: "Параметры",
		langs			: "Языки",
		moreSuggestions	: "Дополнительные предложения",
		ignore			: "Пропустить",
		ignoreAll		: "Игнорировать все",
		addWord			: "Добавить слово",
		emptyDic		: "Имя словаря не должно быть пустым.",

		optionsTab		: "Параметры",
		allCaps			: "Игнорировать слова со всеми прописными буквами",
		ignoreDomainNames : "Игнорировать имена доменов",
		mixedCase		: "Игнорировать слова с символами разных регистров",
		mixedWithDigits	: "Игнорировать слова, содержащие цифры",

		languagesTab	: "Языки",

		dictionariesTab	: "Словари",
		dic_field_name	: "Имя словаря",
		dic_create		: "Создать",
		dic_restore		: "Восстановить",
		dic_delete		: "Удалить",
		dic_rename		: "Переименовать",
		dic_info		: "Первоначально пользовательский словарь хранится в Cookie. Однако размер Cookie ограничен. Когда размер пользовательского словаря увеличивается настолько, что его нельзя хранить в Cookie, его можно сохранить на нашем сервере. Для сохранения пользовательского словаря на нашем сервере пользователь должен указать имя своего словаря. Если словарь уже был сохранен, введите его имя и нажмите кнопку Восстановить.",

		aboutTab		: "О программе"
	},

	about :
	{
		title		: "Сведения о CKEditor",
		dlgTitle	: "Сведения о CKEditor",
		help	: "Выберите $1 для справки.",
		userGuide : "Руководство пользователя CKEditor",
		moreInfo	: "Информация о лицензировании приведена на веб-сайте:",
		copy		: "Copyright &copy; $1. Все права защищены."
	},

	maximize : "Развернуть",
	minimize : "Свернуть",

	fakeobjects :
	{
		anchor	: "Привязка",
		flash	: "Flash-анимация",
		iframe		: "IFrame",
		hiddenfield	: "Скрытое поле",
		unknown	: "Неизвестный объект"
	},

	resize : "Изменить размер с помощью указателя мыши",

	colordialog :
	{
		title		: "Выбрать цвет",
		options	:	"Цветовое оформление",
		highlight	: "Выделение",
		selected	: "Выбранный цвет",
		clear		: "Очистить"
	},

	toolbarCollapse	: "Свернуть панель инструментов",
	toolbarExpand	: "Развернуть панель инструментов",

	toolbarGroups :
	{
		document : "Документ",
		clipboard : "Буфер обмена/Отменить",
		editing : "Редактирование",
		forms : "Формы",
		basicstyles : "Основные стили",
		paragraph : "Абзац",
		links : "Ссылки",
		insert : "Вставить",
		styles : "Стили",
		colors : "Цвета",
		tools : "Сервис"
	},

	bidi :
	{
		ltr : "Задать направление текста Слева-направо",
		rtl : "Задать направление текста Справа-налево"
	},

	docprops :
	{
		label : "Свойства документа",
		title : "Свойства документа",
		design : "Эскиз",
		meta : "Метатеги",
		chooseColor : "Выбрать",
		other : "Другое...",
		docTitle :	"Заголовок страницы",
		charset : 	"Кодировка набора символов",
		charsetOther : "Другая кодировка набора символов",
		charsetASCII : "ASCII",
		charsetCE : "Центральноевропейская",
		charsetCT : "Традиционная китайская (Big5)",
		charsetCR : "Кириллица",
		charsetGR : "Греческая",
		charsetJP : "Японская",
		charsetKR : "Корейская",
		charsetTR : "Турецкая",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "Западноевропейская",
		docType : "Заголовок типа документа",
		docTypeOther : "Другой заголовок типа документа",
		xhtmlDec : "Включить объявления XHTML",
		bgColor : "Цвет фона",
		bgImage : "URL фонового изображения",
		bgFixed : "Фон без прокрутки (фиксированный)",
		txtColor : "Цвет текста",
		margin : "Поля страницы",
		marginTop : "По верхнему краю",
		marginLeft : "По левому краю",
		marginRight : "По правому краю",
		marginBottom : "По нижнему краю",
		metaKeywords : "Ключевые слова индексации документа (через запятую)",
		metaDescription : "Описание документа",
		metaAuthor : "Автор",
		metaCopyright : "Copyright",
		previewHtml : "<p>Это <strong>пример текста</strong>. Используется <a href=\"javascript:void(0)\">CKEditor</a>.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "дюймы",
			widthCm	: "сантиметры",
			widthMm	: "миллиметры",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "пункты",
			widthPc	: "пики"
		},
		table :
		{
			heightUnit	: "Единица высоты:",
			insertMultipleRows : "Вставить строки",
			insertMultipleCols : "Вставить столбцы",
			noOfRows : "Число строк:",
			noOfCols : "Число столбцов:",
			insertPosition : "Позиция:",
			insertBefore : "Перед",
			insertAfter : "После",
			selectTable : "Выбрать таблицу",
			selectRow : "Выбрать строку",
			columnTitle : "Столбец",
			colProps : "Свойства столбца",
			invalidColumnWidth	: "Ширина столбца должна быть положительным числом."
		},
		cell :
		{
			title : "Ячейка"
		},
		emoticon :
		{
			angel		: "Ангел",
			angry		: "Недовольство",
			cool		: "Стильность",
			crying		: "Плач",
			eyebrow		: "Брови",
			frown		: "Хмурый вид",
			goofy		: "Бестолковость",
			grin		: "Усмешка",
			half		: "Полуулыбка",
			idea		: "Идея",
			laughing	: "Смех",
			laughroll	: "Хохот",
			no			: "Нет",
			oops		: "Оплошность",
			shy			: "Стыд",
			smile		: "Улыбка",
			tongue		: "Язык",
			wink		: "Подмигивание",
			yes			: "Да"
		},

		menu :
		{
			link	: "Вставить ссылку",
			list	: "Список",
			paste	: "Вставить",
			action	: "Действие",
			align	: "Выровнять",
			emoticon: "Значок настроения"
		},

		iframe :
		{
			title	: "IFrame"
		},

		list:
		{
			numberedTitle		: "Нумерованный список",
			bulletedTitle		: "Маркированный список"
		},

		// Anchor dialog
		anchor :
		{
			description	: "Введите описательное имя закладки, например 'Раздел 1.2'. После вставки закладки щелкните или на значке 'Ссылка', или на значке 'Ссылка на закладку документа', чтобы создать ссылку на нее.",
			title		: "Ссылка на закладку документа",
			linkTo		: "Ссылка на:"
		},

		urllink :
		{
			title : "URL ссылки",
			linkText : "Текст ссылки",
			selectAnchor: "Выберите метку:",
			nourl: "Введите URL в текстовое поле.",
			urlhelp: "Введите или вставьте URL, который должен открываться при щелчке на этой ссылке, например http://www.example.com.",
			displaytxthelp: "Введите текст, отображаемый для ссылки.",
			openinnew : "Открыть ссылку в новом окне"
		},

		spellchecker :
		{
			title : "Проверить орфографию",
			replace : "Заменить:",
			suggesstion : "Варианты:",
			withLabel : "На:",
			replaceButton : "Заменить",
			replaceallButton:"Заменить все",
			skipButton:"Пропустить",
			skipallButton: "Пропустить все",
			undochanges: "Отменить изменения",
			complete: "Проверка орфографии завершена",
			problem: "Неполадка при извлечении данных XML",
			addDictionary: "Добавить в словарь",
			editDictionary: "Редактировать словарь"
		},

		status :
		{
			keystrokeForHelp: "Для справки нажмите ALT 0"
		},

		linkdialog :
		{
			label : "Окно Ссылка"
		},

		image :
		{
			previewText : "Текст будет обтекать добавляемое изображение, как в этом примере."
		}
	}

};

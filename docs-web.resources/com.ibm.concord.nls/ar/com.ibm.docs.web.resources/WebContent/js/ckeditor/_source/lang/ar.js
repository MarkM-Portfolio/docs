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
	dir : "rtl",

	/*
	 * #END_NON_TRANSLATABLE <for dir: 'dir'>
	 */
	editorTitle : "محرر نص rich text، %1.",

	// ARIA descriptions.
	toolbars	: "خطوط الأدوات لبرنامج التحرير",
	editor	: "برنامج تحرير نص Rich Text",

	// Toolbar buttons without dialogs.
	source			: "المصدر",
	newPage			: "صفحة جديدة",
	save			: "‏حفظ‏",
	preview			: "المعاينة:",
	cut				: "قص",
	copy			: "‏نسخ‏",
	paste			: "لصق",
	print			: "‏طباعة‏",
	underline		: "تسطير",
	bold			: "عريض",
	italic			: "مائل",
	selectAll		: "‏اختيار كل‏",
	removeFormat	: "ازالة النسق",
	strike			: "يتوسطه خط",
	subscript		: "رمز سفلي",
	superscript		: "رمز علوي",
	horizontalrule	: "ادراج خط أفقي",
	pagebreak		: "ادراج فاصل صفحات",
	pagebreakAlt		: "فاصل صفحات",
	unlink			: "ازالة وصلة",
	undo			: "تراجع",
	redo			: "‏اعادة‏",

	// Common messages and labels.
	common :
	{
		browseServer	: "وحدة خدمة برنامج الاستعراض:",
		url				: "‏عنوان URL:‏",
		protocol		: "البروتوكول:",
		upload			: "تحميل:",
		uploadSubmit	: "ارسال الى وحدة الخدمة",
		image			: "ادراج صورة",
		flash			: "ادراج فيلم Flash",
		form			: "ادراج نموذج",
		checkbox		: "ادراج مربع اختيار",
		radio			: "ادراج اختيار دائري",
		textField		: "ادراج مجال نص",
		textarea		: "ادراج مساحة نص",
		hiddenField		: "ادراج مجال مختفي",
		button			: "ادراج اختيار",
		select			: "ادراج مجال اختيار",
		imageButton		: "ادراج اختيار صورة",
		notSet			: "<not set>",
		id				: "الكود:",
		name			: "‏الاسم:‏",
		langDir			: "اتجاه النص:",
		langDirLtr		: "يسار الي يمين",
		langDirRtl		: "يمين الي يسار",
		langCode		: "كود اللغة:",
		longDescr		: "عنوان URL الخاص بالشرح المفصل:",
		cssClass		: "فئات صفحة الأنماط:",
		advisoryTitle	: "اللقب الوظيفي للاستشاري:",
		cssStyle		: "الأسلوب:",
		ok				: "‏حسنا‏",
		cancel			: "الغاء",
		close : "‏اغلاق‏",
		preview			: "المعاينة:",
		generalTab		: "عام",
		advancedTab		: "‏متقدم‏",
		validateNumberFailed	: "هذه القيمة لا تعد رقم.",
		confirmNewPage	: "سيتم فقد أية تغييرات بهذه المحتويات. هل أنت متأكد من أنك تريد تحميل صفحة جديدة؟",
		confirmCancel	: "تم تغيير بعض الاختيارات. هل أنت متأكد من أنك تريد اغلاق مربع الحوار؟",
		options : "‏اختيارات‏",
		target			: "الهدف:",
		targetNew		: "نافذة جديدة (_blank)",
		targetTop		: "نافذة بأعلى (_top)",
		targetSelf		: "نفس النافذة (_self)",
		targetParent	: "النافذة الرئيسية (_parent)",
		langDirLTR		: "يسار الي يمين",
		langDirRTL		: "يمين الي يسار",
		styles			: "الأسلوب:",
		cssClasses		: "فئات صفحة الأنماط:",
		width			: "العرض:",
		height			: "الارتفاع:",
		align			: "محاذاة:",
		alignLeft		: "اليسار",
		alignRight		: "اليمين",
		alignCenter		: "وسط",
		alignTop		: "‏أعلى‏",
		alignMiddle		: "الوسط",
		alignBottom		: "أسفل",
		invalidHeight	: "يجب أن يكون الارتفاع رقم صحيح موجب.",
		invalidWidth	: "يجب أن يكون العرض رقم صحيح موجب.",
		invalidCssLength	: "القيمة المحددة للمجال '%1' يجب أن تكون رقم صحيح موجب مع أو بدون وحدة قياس CSS الصحيحة (px، %، in، cm,mm، em، ex، pt، pc).",
		invalidHtmlLength	: "القيمة المحددة للمجال '%1' يجب أن تكون رقم صحيح موجب مع أو بدون وحدة قياس HTML الصحيحة (px أو %).",
		invalidInlineStyle	: "القيمة المحددة النمط الضمني يجب أن تتكون من tuple واحد أو أكثر بالنسق \"الاسم : القيمة\"، مفصول بفاصلة منقوطة.",
		cssLengthTooltip	: "أدخل رقم للقيمة بالبكسل أو رقم مع وحدة CSS صحيحة (px، %، in، cm، mm، em، ex، pt، pc).",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">، غير متاح</span>"
	},

	contextmenu :
	{
		options : "اختيارات القائمة السياقية"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "ادراج حروف خاصة",
		title		: "حروف خاصة",
		options : "اختيارات الحروف الخاصة"
	},

	// Link dialog.
	link :
	{
		toolbar		: "وصلة عنوان URL",
		other 		: "<other>",
		menu		: "تحرير الوصلة...",
		title		: "‏وصلة‏",
		info		: "معلومات الوصلة",
		target		: "الهدف",
		upload		: "تحميل:",
		advanced	: "‏متقدم‏",
		type		: "نوع الوصلة:",
		toUrl		: "عنوان URL",
		toAnchor	: "ربط بنقطة التثبيت التي توجد بالنص",
		toEmail		: "البريد الالكتروني",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "اسم الاطار المستهدف:",
		targetPopupName	: "اسم النافذة المنبثقة:",
		popupFeatures	: "خصائص النافذة المنبثقة:",
		popupResizable	: "يمكن تغيير حجمه",
		popupStatusBar	: "خط الحالة",
		popupLocationBar	: "خط المكان",
		popupToolbar	: "خط الأدوات",
		popupMenuBar	: "خط القائمة",
		popupFullScreen	: "شاشة كاملة (IE)",
		popupScrollBars	: "خطوط التصفح",
		popupDependent	: "تابع (Netscape)",
		popupLeft		: "الموضع الأيسر",
		popupTop		: "الموضع العلوي",
		id				: "الكود:",
		langDir			: "اتجاه النص:",
		langDirLTR		: "يسار الي يمين",
		langDirRTL		: "يمين الي يسار",
		acccessKey		: "مفتاح التوصل:",
		name			: "‏الاسم:‏",
		langCode		: "كود اللغة:",
		tabIndex		: "فهرس علامة التبويب:",
		advisoryTitle	: "اللقب الوظيفي للاستشاري:",
		advisoryContentType	: "نوع المحتويات الاستشارية:",
		cssClasses		: "فئات صفحة الأنماط:",
		charset			: "Charset الخاصة بالمصدر المتصل:",
		styles			: "الأسلوب:",
		rel			: "علاقة",
		selectAnchor	: "تحديد نقطة تثبيت",
		anchorName		: "وفقا لاسم نقطة التثبيت",
		anchorId		: "وفقا لكود العنصر",
		emailAddress	: "عنوان البريد الالكتروني",
		emailSubject	: "موضوع الرسالة",
		emailBody		: "نص الرسالة",
		noAnchors		: "لا توجد علامات توقف متاحة في الوثيقة. اضغط على الشارة 'ادراج علامة توقف الوثيقة' من خط الأدوات لاضافة واحدة.",
		noUrl			: "برجاء ادخال عنوان URL للوصلة",
		noEmail			: "برجاء ادخال عنوان البريد الالكتروني"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "ادراج علامة توقف الوثيقة",
		menu		: "تحرير علامة توقف الوثيقة",
		title		: "علامة توقف الوثيقة",
		name		: "‏الاسم:‏",
		errorName	: "برجاء ادخال اسم لعلامة توقف الوثيقة",
		remove		: "ازالة علامة توقف الوثيقة"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "خصائص كشف الأرقام",
		bulletedTitle		: "خصائص الكشف النقطي",
		type				: "‏النوع‏",
		start				: "بدء",
		validateStartNumber				:"يجب أن يكون رقم بدء الكشف عبارة عن رقم بالكامل.",
		circle				: "دائرة",
		disc				: "قرص",
		square				: "مربع",
		none				: "لا شيء",
		notset				: "<not set>",
		armenian			: "الترقيم الأرميني",
		georgian			: "الترقيم الجيورجي (an، ban، gan، الخ)",
		lowerRoman			: "الأرقام الرومانية الصغيرة (i، ii، iii، iv، v، الخ)",
		upperRoman			: "الأرقام الرومانية الكبيرة (I، II، III، IV، V، الخ)",
		lowerAlpha			: "حروف ألفا الصغيرة (a، b، c، d، e، الخ)",
		upperAlpha			: "حروف ألفا الكبيرة (A، B، C، D، E، الخ)",
		lowerGreek			: "الحروف اليونانية الصغيرة (ألفا، بتا، جاما، الخ)",
		decimal				: "عشري (1، 2، 3، الخ)",
		decimalLeadingZero	: "الأصفار البادئة العشرية (01، 02، 03، الخ)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "ايجاد واستبدال",
		find				: "ايجاد",
		replace				: "‏استبدال‏",
		findWhat			: "ايجاد:",
		replaceWith			: "استبدال بالآتي:",
		notFoundMsg			: "لم يتم ايجاد النص المحدد.",
		noFindVal			: 'النص المراد ايجاده مطلوب.',
		findOptions			: "اختيارات الايجاد",
		matchCase			: "مطابقة حالة الحروف",
		matchWord			: "مطابقة الكلمة بالكامل",
		matchCyclic			: "مطابقة ما هو دوري",
		replaceAll			: "استبدال كل",
		replaceSuccessMsg	: "تم استبدال %1 تكرار (تكرارات)."
	},

	// Table Dialog
	table :
	{
		toolbar		: "‏ادراج جدول‏",
		title		: "جدول",
		menu		: "خصائص الجدول",
		deleteTable	: "حذف الجدول",
		rows		: "الصفوف:",
		columns		: "الأعمدة:",
		border		: "حجم الحدود:",
		widthPx		: "بكسل",
		widthPc		: "نسبة مئوية",
		widthUnit	: "وحدة العرض:",
		cellSpace	: "تباعد الخانة:",
		cellPad		: "ملء الخانة:",
		caption		: "تسمية توضيحية:",
		summary		: "الملخص:",
		headers		: "نصوص الرأس:",
		headersNone		: "لا شيء",
		headersColumn	: "العمود الأول",
		headersRow		: "الصف الأول",
		headersBoth		: "كلاهما",
		invalidRows		: "عدد الصفوف يجب أن يكون رقم صحيحا أكبر من صر.",
		invalidCols		: "عدد الأعمدة يجب أن يكون رقم صحيحا أكبر من صر.",
		invalidBorder	: "حجم الحدود يجب أن يكون رقم موجب.",
		invalidWidth	: "عرض الجدول يجب أن يكون رقم موجب.",
		invalidHeight	: "ارتفاع الجدول يجب أن يكون رقم موجب.",
		invalidCellSpacing	: "تباعد الخانة يجب أن يكون رقم موجب.",
		invalidCellPadding	: "ملء الخانة يجب أن يكون رقم موجب.",

		cell :
		{
			menu			: "خانة",
			insertBefore	: "ادراج خانة قبل",
			insertAfter		: "ادراج خانة بعد",
			deleteCell		: "حذف خانات",
			merge			: "دمج الخانات",
			mergeRight		: "دمج يمين",
			mergeDown		: "دمج أسفل",
			splitHorizontal	: "تقسيم الخانة أفقيا",
			splitVertical	: "تقسيم الخانة رأسيا",
			title			: "خصائص الخانة",
			cellType		: "نوع الخانة:",
			rowSpan			: "امتداد الصفوف:",
			colSpan			: "امتداد الأعمدة:",
			wordWrap		: "التفاف الكلمة:",
			hAlign			: "محاذاة أفقية:",
			vAlign			: "محاذاة رأسية:",
			alignBaseline	: "السطر الأساسي",
			bgColor			: "لون الخلفية:",
			borderColor		: "لون الحدود:",
			data			: "البيانات",
			header			: "الرأس",
			yes				: "نعم",
			no				: "لا",
			invalidWidth	: "عرض الخانة يجب أن يكون رقم موجب.",
			invalidHeight	: "ارتفاع الخانة يجب أن يكون رقم موجب.",
			invalidRowSpan	: "امتداد الصفوف يجب أن يكون رقم صحيح موجب.",
			invalidColSpan	: "يجب أن يكون امتداد الأعمدة رقم صحيح موجب.",
			chooseColor : "اختيار"
		},

		row :
		{
			menu			: "صف",
			insertBefore	: "ادراج صف قبل",
			insertAfter		: "ادراج صف بعد",
			deleteRow		: "حذف صفوف"
		},

		column :
		{
			menu			: "العمود",
			insertBefore	: "ادراج عمود قبل",
			insertAfter		: "ادراج عمود بعد",
			deleteColumn	: "حذف أعمدة"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "خصائص الاختيار",
		text		: "النص (القيمة):",
		type		: "النوع:",
		typeBtn		: "الاختيار",
		typeSbm		: "احالة",
		typeRst		: "ارجاع"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "خصائص مربع الاختيار",
		radioTitle	: "خصائص الاختيار الدائري",
		value		: "القيمة:",
		selected	: "المحدد"
	},

	// Form Dialog.
	form :
	{
		title		: "ادراج نموذج",
		menu		: "خصائص النموذج",
		action		: "التصرف:",
		method		: "الطريقة:",
		encoding	: "التكويد:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "تحديد خصائص المجال",
		selectInfo	: "تحديد المعلومات",
		opAvail		: "الاختيارات المتاحة",
		value		: "القيمة:",
		size		: "الحجم:",
		lines		: "سطر",
		chkMulti	: "السماح بالاختيارات المتعددة",
		opText		: "النص:",
		opValue		: "القيمة:",
		btnAdd		: "اضافة",
		btnModify	: "تعديل",
		btnUp		: "لأعلى",
		btnDown		: "لأسفل",
		btnSetValue : "تحديد كقيمة محددة",
		btnDelete	: "حذف"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "خصائص مساحة النص",
		cols		: "الأعمدة:",
		rows		: "الصفوف:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "خصائص مجال النص",
		name		: "‏الاسم:‏",
		value		: "القيمة:",
		charWidth	: "عرض الحروف:",
		maxChars	: "الحد الأقصى من عدد الحروف:",
		type		: "النوع:",
		typeText	: "نص",
		typePass	: "كلمة السرية"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "خصائص المجال المخفي",
		name	: "‏الاسم:‏",
		value	: "القيمة:"
	},

	// Image Dialog.
	image :
	{
		title		: "صورة",
		titleButton	: "خصائص اختيار الصورة",
		menu		: "خصائص الصورة...",
		infoTab	: "معلومات عن الصورة",
		btnUpload	: "ارسالها الى وحدة الخدمة",
		upload	: "‏تحميل‏",
		alt		: "النص البديل:",
		lockRatio	: "نسبة الاقفال",
		resetSize	: "ارجاع الحجم",
		border	: "‏الحدود‏:",
		hSpace	: "مسافة أفقية:",
		vSpace	: "مسافة رأسية:",
		alertUrl	: "برجاء ادخال عنوان URL للصورة",
		linkTab	: "‏وصلة‏",
		button2Img	: "هل تريد تغيير اختيار الصورة المحددة الى صورة بسيطة؟",
		img2Button	: "هل تريد تغيير الصورة المحددة الى اختيار صورة؟",
		urlMissing : "عنوان URL الخاص بمصدر الصورة غير موجود.",
		validateBorder : "الحدود يجب أن تكون رقم صحيح موجب.",
		validateHSpace : "المسافة الأفقية يجب أن تكون رقم صحيح موجب.",
		validateVSpace : "المسافة الرأسية يجب أن تكون رقم صحيح موجب."
	},

	// Flash Dialog
	flash :
	{
		properties		: "خصائص الوميض",
		propertiesTab	: "الخصائص",
		title		: "وميض",
		chkPlay		: "تشغيل آلي",
		chkLoop		: "حلقة",
		chkMenu		: "اتاحة قائمة الوميض",
		chkFull		: "السماح بعرض شاشة كاملة",
 		scale		: "المقياس:",
		scaleAll		: "عرض الكل",
		scaleNoBorder	: "بدون حدود",
		scaleFit		: "ملائمة تامة",
		access			: "امكانية التوصل الى البرنامج النصي:",
		accessAlways	: "دائما",
		accessSameDomain	: "نفس النطاق",
		accessNever	: "مطلقا",
		alignAbsBottom: "محاذاة مع السطر",
		alignAbsMiddle: "توسيط",
		alignBaseline	: "السطر الأساسي",
		alignTextTop	: "أعلى النص",
		quality		: "الجودة:",
		qualityBest	: "الأفضل",
		qualityHigh	: "عالي",
		qualityAutoHigh	: "عالي آليا",
		qualityMedium	: "متوسط",
		qualityAutoLow	: "منخفض آليا",
		qualityLow	: "منخفض",
		windowModeWindow	: "نافذة",
		windowModeOpaque	: "معتم",
		windowModeTransparent	: "شفاف",
		windowMode	: "نمط النافذة:",
		flashvars	: "المتغيرات:",
		bgcolor	: "لون الخلفية:",
		hSpace	: "مسافة أفقية:",
		vSpace	: "مسافة رأسية:",
		validateSrc : "لا يجب أن يكون عنوان URL خاليا.",
		validateHSpace : "المسافة الأفقية يجب أن تكون رقم صحيح موجب.",
		validateVSpace : "المسافة الرأسية يجب أن تكون رقم صحيح موجب."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "التحقق من الهجاء",
		title			: "فحص الهجاء",
		notAvailable	: "عفوا، الخدمة غير متاحة الآن.",
		errorLoading	: "حدث خطأ أثناء تحميل نظام خدمة التطبيق: %s.",
		notInDic		: "لا توجد في القاموس",
		changeTo		: "تغيير الى",
		btnIgnore		: "تجاهل",
		btnIgnoreAll	: "تجاهل كل",
		btnReplace		: "‏استبدال‏",
		btnReplaceAll	: "استبدال كل",
		btnUndo			: "تراجع",
		noSuggestions	: "- بدون اقتراحات -",
		progress		: "جاري التحقق من الهجاء...",
		noMispell		: "تم التحقق من الهجاء: لم يتم ايجاد أخطاء بالهجاء",
		noChanges		: "تم التحقق من الهجاء: لم يتم أي كلمات",
		oneChange		: "تم التحقق من الهجاء: تم تغيير كلمة واحدة",
		manyChanges		: "تم التحقق من الهجاء: تم تغيير %1 كلمة",
		ieSpellDownload	: "لم يتم تركيب برنامج التحقق من الهجاء. هل تريد تحميله الآن؟"
	},

	smiley :
	{
		toolbar	: "ادراج شكل متحرك",
		title	: "أشكال متحركة",
		options : "اختيارات الأشكال المتحركة"
	},

	elementsPath :
	{
		eleLabel : "مسار العناصر",
		eleTitle : "عنصر %1"
	},

	numberedlist : "‏كشف مرقم‏",
	bulletedlist : "كشف نقطي",
	indent : "زيادة الازاحة للداخل",
	outdent : "تقليل الازاحة للداخل",

	bidi :
	{
		ltr : "يسار الي يمين",
		rtl : "يمين الي يسار",
	},

	justify :
	{
		left : "محاذاة الى اليسار",
		center : "محاذاة في الوسط",
		right : "محاذاة الى اليمين",
		block : "ضبط المحاذاة"
	},

	blockquote : "علامة تنصيص الفقرة",

	clipboard :
	{
		title		: "لصق",
		cutError	: "محددات سرية برنامج الاستعراض الخاص بك تمنع القص الآلي.  استخدم Ctrl+X بلوحة المفاتيح الخاصة بك بدلا من ذلك.",
		copyError	: "محددات سرية برنامج الاستعراض الخاص بك تمنع النسخ الآلي.  استخدم Ctrl+C بلوحة المفاتيح الخاصة بك بدلا من ذلك.",
		pasteMsg	: "اضغط Ctrl+V ‏(Cmd+V on MAC)‏ للصق أسفل.",
		securityMsg	: "سرية برنامج الاستعراض الخاص بك تمنع اللصق مباشرة من المسودة.",
		pasteArea	: "مساحة اللصق"
	},

	pastefromword :
	{
		confirmCleanup	: "يبدو أن النص الذي تريد لصقه تم نسخه من Word. هل تريد مسحه قبل اللصق؟",
		toolbar			: "لصق خاص",
		title			: "لصق خاص",
		error			: "ليس ممكنا مسح البيانات التي تم لصقها لحدوث خطأ داخلي"
	},

	pasteText :
	{
		button	: "لصق كنص عادي",
		title	: "لصق كنص عادي"
	},

	templates :
	{
		button 			: "القوالب",
		title : "قوالب المحتويات",
		options : "اختيارات القوالب",
		insertOption: "استبدال المحتويات الفعلية",
		selectPromptMsg: "حدد القالب الذي سيتم فتحه في برنامج التحرير",
		emptyListMsg : "(لم يتم تعريف أية قوالب)"
	},

	showBlocks : "عرض الفقرات",

	stylesCombo :
	{
		label		: "الأنماط",
		panelTitle 	: "الأنماط",
		panelTitle1	: "أنماط الكتلة",
		panelTitle2	: "أنماط مباشرة",
		panelTitle3	: "أنماط العناصر"
	},

	format :
	{
		label		: "تنسيق",
		panelTitle	: "نسق الفقرة",

		tag_p		: "عادي",
		tag_pre		: "تنسيق",
		tag_address	: "العنوان",
		tag_h1		: "العنوان 1",
		tag_h2		: "العنوان 2",
		tag_h3		: "العنوان 3",
		tag_h4		: "العنوان 4",
		tag_h5		: "العنوان 5",
		tag_h6		: "العنوان 6",
		tag_div		: "عادي (DIV)"
	},

	div :
	{
		title				: "تكوين حاوية Div",
		toolbar				: "تكوين حاوية Div",
		cssClassInputLabel	: "فئات صفحة الأنماط",
		styleSelectLabel	: "الأسلوب",
		IdInputLabel		: "كود التعريف",
		languageCodeInputLabel	: " كود اللغة",
		inlineStyleInputLabel	: "أسلوب ضمني",
		advisoryTitleInputLabel	: "اللقب الوظيفي للاستشاري",
		langDirLabel		: "اتجاه النص",
		langDirLTRLabel		: "يسار الي يمين",
		langDirRTLLabel		: "يمين الي يسار",
		edit				: "تحرير Div",
		remove				: "ازالة Div"
  	},

	iframe :
	{
		title		: "خصائص IFrame",
		toolbar		: "ادراج IFrame",
		noUrl		: "برجاء ادخال عنوان URL الى iframe",
		scrolling	: "اتاحة خطوط التصفح",
		border		: "عرض حدود الاطار"
	},

	font :
	{
		label		: "طاقم الطباعة",
		voiceLabel	: "طاقم الطباعة",
		panelTitle	: "اسم طاقم الطباعة"
	},

	fontSize :
	{
		label		: "الحجم",
		voiceLabel	: "حجم طاقم الطباعة",
		panelTitle	: "حجم طاقم الطباعة"
	},

	colorButton :
	{
		textColorTitle	: "لون النص",
		bgColorTitle	: "لون الخلفية",
		panelTitle		: "الألوان",
		auto			: "آليا",
		more			: "مزيد من الألوان..."
	},

	colors :
	{
		"000" : "أسود",
		"800000" : "أحمر بني",
		"8B4513" : "بني فاتح",
		"2F4F4F" : "رمادي اردوازي داكن",
		"008080" : "أزرق مخضر",
		"000080" : "أزرق غامق",
		"4B0082" : "نيلي",
		"696969" : "رمادي داكن",
		"B22222" : "أصفر زاهي",
		"A52A2A" : "بني",
		"DAA520" : "أصفر ذهبي",
		"006400" : "أخضر داكن",
		"40E0D0" : "تركواز",
		"0000CD" : "أزرق متوسط",
		"800080" : "أرجواني",
		"808080" : "رمادي",
		"F00" : "أحمر",
		"FF8C00" : "برتقالي غامق",
		"FFD700" : "ذهبي",
		"008000" : "أخضر",
		"0FF" : "أزرق سماوي",
		"00F" : "أزرق",
		"EE82EE" : "بنفسجي",
		"A9A9A9" : "رمادي شاحب",
		"FFA07A" : "فضي فاتح",
		"FFA500" : "برتقالي",
		"FFFF00" : "أصفر",
		"00FF00" : "ليموني",
		"AFEEEE" : "تركواز فاتح",
		"ADD8E6" : "أزرق فاتح",
		"DDA0DD" : "أرجواني داكن",
		"D3D3D3" : "رمادى فاتح",
		"FFF0F5" : "أحمر أرجواني",
		"FAEBD7" : "أبيض عتيق",
		"FFFFE0" : "أصفر فاتح",
		"F0FFF0" : "أبيض مائل للأخضر",
		"F0FFFF" : "أزرق سماوي",
		"F0F8FF" : "أزرق فاتح",
		"E6E6FA" : "أرجواني فاتح",
		"FFF" : "أبيض"
	},

	scayt :
	{
		title			: "فحص الهجاء أثناء الكتابة",
		opera_title		: "غير مدعم بواسطة Opera",
		enable			: "اتاحة SCAYT",
		disable			: "الغاء اتاحة SCAYT",
		about			: "نبذة عن SCAYT",
		toggle			: "تبديل SCAYT",
		options			: "‏اختيارات‏",
		langs			: "اللغات",
		moreSuggestions	: "مزيد من الاقتراحات",
		ignore			: "تجاهل",
		ignoreAll		: "تجاهل كل",
		addWord			: "اضافة كلمة",
		emptyDic		: "لا يجب أن يكون اسم القاموس خاليا.",

		optionsTab		: "‏اختيارات‏",
		allCaps			: "تجاهل كل الكلمات التي تبدأ بحروف كبيرة",
		ignoreDomainNames : "تجاهل أسماء النطاق",
		mixedCase		: "تجاهل الكلمات التي تتضمن حالات مختلطة",
		mixedWithDigits	: "تجاهل الكلمات التي تتضمن أرقام",

		languagesTab	: "اللغات",

		dictionariesTab	: "قاموس",
		dic_field_name	: "اسم القاموس",
		dic_create		: "تكوين",
		dic_restore		: "استعادة",
		dic_delete		: "حذف",
		dic_rename		: "‏اعادة تسمية‏",
		dic_info		: "في البداية، يتم تخزين قاموس المستخدم في ملف تعريف الارتباط.  على الرغم من ذلك، تكون ملفات تعريف الارتباط محددة الحجم.  وعند وصول قاموس المستخدم الى مرحلة لا يمكن عندها تخزينه في ملف تعريف الارتباط، فقد يتم عندئذ تخزين القاموس على وحدة الخدمة الخاصة بنا.  لتخزين القاموس الشخصي على وحدة الخدمة الخاصة بنا، يجب أن تقوم بتحديد اسم للقاموس الخاص بك.  اذا كان لديك بالفعل قاموس تم تخزينه، برجاء ادخال اسمه والضغط على مفتاح استعادة.",

		aboutTab		: "نبذة عن"
	},

	about :
	{
		title		: "نبذة عن CKEditor",
		dlgTitle	: "نبذة عن CKEditor",
		help	: "ارجع الى $1 للحصول على مساعدة",
		userGuide : "دليل مستخدم CKEditor",
		moreInfo	: "لمعرفة معلومات الترخيص، برجاء زيارة موقع الانترنت الخاص بها:",
		copy		: "حقوق النشر &copy; $1. جميع الحقوق محفوظة."
	},

	maximize : "تكبير",
	minimize : "تصغير",

	fakeobjects :
	{
		anchor	: "ارساء",
		flash	: "رسوم متحركة وامضة",
		iframe		: "IFrame",
		hiddenfield	: "مجال مخفي",
		unknown	: "عنصر غير معروف"
	},

	resize : "سحب لتغيير الحجم",

	colordialog :
	{
		title		: "تحديد لون",
		options	:	"اختيارات اللون",
		highlight	: "اظهار",
		selected	: "اللون المحدد",
		clear		: "محو"
	},

	toolbarCollapse	: "طي خط الأدوات",
	toolbarExpand	: "عرض خط الأدوات",

	toolbarGroups :
	{
		document : "وثيقة",
		clipboard : "المسودة/تراجع",
		editing : "تحرير",
		forms : "النماذج",
		basicstyles : "الأنماط الأساسية",
		paragraph : "فقرة",
		links : "الروابط",
		insert : "‏ادراج‏",
		styles : "الأنماط",
		colors : "الألوان",
		tools : "الأدوات"
	},

	bidi :
	{
		ltr : "التغيير الى نص من اليسار الى اليمين",
		rtl : "التغيير الى نص من اليمين الى اليسار"
	},

	docprops :
	{
		label : "‏خصائص الوثيقة‏",
		title : "‏خصائص الوثيقة‏",
		design : "تصميم",
		meta : "شارات التعليم التعريفية",
		chooseColor : "اختيار",
		other : "أخرى...",
		docTitle :	"عنوان الصفحة",
		charset : 	"تكويد فئة الحروف",
		charsetOther : "تكويدات فئات الحروف الأخرى",
		charsetASCII : "ASCII",
		charsetCE : "وسط أوروبا",
		charsetCT : "الصينية التقليدية (Big5)",
		charsetCR : "سيرياليه",
		charsetGR : "اليونانية",
		charsetJP : "اليابانية",
		charsetKR : "الكورية",
		charsetTR : "التركية",
		charsetUN : "أحادية الكود (UTF-8)",
		charsetWE : "أوربا الغربية",
		docType : "عنوان نوع الوثيقة",
		docTypeOther : "عنوان نوع وثيقة آخر",
		xhtmlDec : "تضمين توضيحات XHTML",
		bgColor : "لون الخلفية",
		bgImage : "عنوان URL لخلفية الصورة",
		bgFixed : "خلفية بدون تصفح (ثابتة)",
		txtColor : "لون النص",
		margin : "هوامش الصفحة",
		marginTop : "‏أعلى‏",
		marginLeft : "اليسار",
		marginRight : "اليمين",
		marginBottom : "أسفل",
		metaKeywords : "الكلمات المرشدة لفهرسة الوثيقة (مفصولة بفاصلات)",
		metaDescription : "وصف الوثيقة",
		metaAuthor : "المؤلف",
		metaCopyright : "‏حقوق النشر‏",
		previewHtml : "<p>هذا هو <strong>مثال للنص</strong>. يمكنك استخدام <a href=\"javascript:void(0)\">CKEditor</a>.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "بوصة",
			widthCm	: "سنتيمتر",
			widthMm	: "ملليمتر",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "نقاط",
			widthPc	: "حروف مطبعية"
		},
		table :
		{
			heightUnit	: "وحدة الارتفاع:",
			insertMultipleRows : "ادراج صفوف",
			insertMultipleCols : "ادراج أعمدة",
			noOfRows : "عدد الصفوف:",
			noOfCols : "عدد الأعمدة:",
			insertPosition : "الموضع:",
			insertBefore : "قبل",
			insertAfter : "بعد",
			selectTable : "تحديد جدول",
			selectRow : "تحديد صف",
			columnTitle : "العمود",
			colProps : "خواص العمود",
			invalidColumnWidth	: "عرض العمود يجب أن يكون رقم موجب."
		},
		cell :
		{
			title : "خانة"
		},
		emoticon :
		{
			angel		: "ملاك",
			angry		: "غاضب",
			cool		: "هادئ",
			crying		: "بكاء",
			eyebrow		: "حاجب عين",
			frown		: "عابس",
			goofy		: "أحمق",
			grin		: "ابتسامة",
			half		: "نصف",
			idea		: "فكرة",
			laughing	: "ضاحك",
			laughroll	: "تمايل من الضحك",
			no			: "لا",
			oops		: "عذرا",
			shy			: "خجول",
			smile		: "ابتسام",
			tongue		: "لسان",
			wink		: "غمزة",
			yes			: "نعم"
		},

		menu :
		{
			link	: "‏ادراج وصلة‏",
			list	: "كشف",
			paste	: "لصق",
			action	: "‏الوظيفة‏",
			align	: "محاذاة",
			emoticon: "أشكال متحركة"
		},

		iframe :
		{
			title	: "IFrame"
		},

		list:
		{
			numberedTitle		: "‏كشف مرقم‏",
			bulletedTitle		: "كشف نقطي"
		},

		// Anchor dialog
		anchor :
		{
			description	: "أدخل اسم وصفي لعلامة التوقف، مثل 'Section 1.2'. بعد ادراج علامة التوقف، اضغط على 'ربط' أو 'رابط علامة توقف الوثيقة' للربط معها.",
			title		: "رابط علامة توقف الوثيقة",
			linkTo		: "ربط مع:"
		},

		urllink :
		{
			title : "وصلة عنوان URL",
			linkText : "نص الوصلة",
			selectAnchor: "حدد علامة التثبيت:",
			nourl: "برجاء ادخال عنوان URL في مجال النص.",
			urlhelp: "قم بادخال أو لصق عنوان URL لفتحه عندما يقوم المستخدمين الضغط على هذه الوصلة، على سبيل المثال، http://www.example.com.",
			displaytxthelp: "أدخل نص للوصلة.",
			openinnew : "فتح وصلة في نافذة جديدة"
		},

		spellchecker :
		{
			title : "التحقق من الهجاء",
			replace : "استبدال",
			suggesstion : "الاقتراحات:",
			withLabel : "مع:",
			replaceButton : "‏استبدال‏",
			replaceallButton:"استبدال كل",
			skipButton:"تخطي",
			skipallButton: "تخطي الكل",
			undochanges: "التراجع عن تنفيذ التغييرات",
			complete: "الانتهاء من فحص الهجاء",
			problem: "حدثت مشكلة أثناء استرجاع بيانات XML",
			addDictionary: "اضافة الى القاموس",
			editDictionary: "تحرير قاموس"
		},

		status :
		{
			keystrokeForHelp: "اضغط ALT 0 للمساعدة"
		},

		linkdialog :
		{
			label : "حوار الوصلة"
		},

		image :
		{
			previewText : "سيتدفق النص حول الصورة الجاري اضافتها مثل ما هو موضح في هذا المثال."
		}
	}

};

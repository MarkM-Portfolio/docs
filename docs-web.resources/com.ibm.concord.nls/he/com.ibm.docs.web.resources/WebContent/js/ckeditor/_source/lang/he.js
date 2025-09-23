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
	editorTitle : "עורך תמליל עשיר, %1.",

	// ARIA descriptions.
	toolbars	: "סרגלי כלים של העורך",
	editor	: "עורך תמליל עשיר",

	// Toolbar buttons without dialogs.
	source			: "מקור",
	newPage			: "עמוד חדש",
	save			: "שמירה",
	preview			: "תצוגה מקדימה:",
	cut				: "גזירה",
	copy			: "העתקה",
	paste			: "הדבקה",
	print			: "הדפסה",
	underline		: "קו תחתי",
	bold			: "מודגש",
	italic			: "נטוי",
	selectAll		: "בחירת הכל",
	removeFormat	: "סילוק עיצוב",
	strike			: "קו חוצה",
	subscript		: "כתב תחתי",
	superscript		: "כתב עילי",
	horizontalrule	: "הוספת קו אופקי",
	pagebreak		: "הוספת מעבר עמוד",
	pagebreakAlt		: "מעבר עמוד",
	unlink			: "סילוק קישור",
	undo			: "ביטול פעולה",
	redo			: "שחזור פעולה",

	// Common messages and labels.
	common :
	{
		browseServer	: "שרת דפדפן:",
		url				: "URL:‏",
		protocol		: "פרוטוקול:",
		upload			: "טעינה:",
		uploadSubmit	: "משלוח לשרת",
		image			: "הוספת תמונה",
		flash			: "הוספת סרטון פלאש",
		form			: "הוספת טופס",
		checkbox		: "הוספת תיבת סימון",
		radio			: "הוספת לחצן רדיו",
		textField		: "הוספת שדה תמליל",
		textarea		: "הוספת אזור תמליל",
		hiddenField		: "הוספת שדה מוסתר",
		button			: "הוספת לחצן",
		select			: "הוספת שדה בחירה",
		imageButton		: "הוספת לחצן תמונה",
		notSet			: "<not set>",
		id				: "זיהוי:",
		name			: "שם:",
		langDir			: "כיוון תמליל:",
		langDirLtr		: "משמאל לימין",
		langDirRtl		: "מימין לשמאל",
		langCode		: "קוד שפה:",
		longDescr		: "URL תיאור ארוך:",
		cssClass		: "מחלקות גליון סגנונות:",
		advisoryTitle	: "כותרת הסבר:",
		cssStyle		: "סגנון:",
		ok				: "אישור",
		cancel			: "ביטול",
		close : "סגירה",
		preview			: "תצוגה מקדימה:",
		generalTab		: "כללי",
		advancedTab		: "מתקדם",
		validateNumberFailed	: "ערך זה אינו מספר.",
		confirmNewPage	: "שינויים בתוכן זה שלא נשמרו יאבדו. אתם בטוחים שברצונכם לטעון דף חדש?‏",
		confirmCancel	: "חלק מהאפשרויות השתנו. אתם בטוחים שברצונכם לסגור את הדו-שיח?‏",
		options : "אפשרויות",
		target			: "יעד:",
		targetNew		: "חלון חדש (‎_blank)",
		targetTop		: "חלון עליון (‎_top)",
		targetSelf		: "אותו חלון (‎_self)",
		targetParent	: "חלון אב (‎_parent)",
		langDirLTR		: "משמאל לימין",
		langDirRTL		: "מימין לשמאל",
		styles			: "סגנון:",
		cssClasses		: "מחלקות גליון סגנונות:",
		width			: "רוחב:",
		height			: "גובה:",
		align			: "יישור:",
		alignLeft		: "שמאל",
		alignRight		: "ימין",
		alignCenter		: "מרכז",
		alignTop		: "ראש",
		alignMiddle		: "אמצע",
		alignBottom		: "תחתית",
		invalidHeight	: "הגובה חייב להיות מספר שלם חיובי.‏",
		invalidWidth	: "הרוחב חייב להיות מספר שלם חיובי.‏",
		invalidCssLength	: "הערך המצוין עבור השדה '%1' חייב להיות מספר חיובי עם או בלי יחידת מידה חוקית של CSS ‏(px,‏ %,‏ in,‏ cm,‏ mm,‏ em,‏ ex,‏ pt,‏ או pc).",
		invalidHtmlLength	: "הערך המצוין עבור השדה '%1' חייב להיות מספר חיובי עם או בלי יחידת מידה חוקית של HTML ‏(px או %).",
		invalidInlineStyle	: "הערך המצוין עבור הסגנון המוכלל בשורה חייב להכיל n-ניה אחת או יותר במבנה \"name: value\", מופרדות בתווי נקודה-פסיק.",
		cssLengthTooltip	: "ציינו מספר כערך בפיקסלים או מספר עם יחידת מידה חוקית של CSS ‏(px,‏ %,‏ in,‏ cm,‏ mm,‏ em,‏ ex,‏ pt,‏ או pc).‏",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">, לא זמין</span>"
	},

	contextmenu :
	{
		options : "אפשרויות תפריט הקשר"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "הוספת תו מיוחד",
		title		: "תו מיוחד",
		options : "אפשרויות תווים מיוחדים"
	},

	// Link dialog.
	link :
	{
		toolbar		: "קישור URL",
		other 		: "<other>",
		menu		: "עריכת קישור...‏",
		title		: "קישור",
		info		: "פרטי קישור",
		target		: "יעד",
		upload		: "טעינה:",
		advanced	: "מתקדם",
		type		: "סוג קישור:",
		toUrl		: "URL",
		toAnchor	: "קישור לעוגן בתמליל",
		toEmail		: "דואל",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "שם מסגרת יעד:",
		targetPopupName	: "שם חלון צץ:",
		popupFeatures	: "מאפייני חלון צץ:",
		popupResizable	: "מאפשר שינוי גודל",
		popupStatusBar	: "סרגל מצב",
		popupLocationBar	: "סרגל מיקומים",
		popupToolbar	: "סרגל כלים",
		popupMenuBar	: "סרגל תפריטים",
		popupFullScreen	: "מסך מלא (IE)",
		popupScrollBars	: "פסי גלילה",
		popupDependent	: "תלוי (Netscape)",
		popupLeft		: "מיקום ימני",
		popupTop		: "מיקום עליון",
		id				: "זיהוי:",
		langDir			: "כיוון תמליל:",
		langDirLTR		: "משמאל לימין",
		langDirRTL		: "מימין לשמאל",
		acccessKey		: "מקש גישה:",
		name			: "שם:",
		langCode		: "קוד שפה:",
		tabIndex		: "אינדקס לשוניות:",
		advisoryTitle	: "כותרת הסבר:",
		advisoryContentType	: "סוג תוכן הסבר:",
		cssClasses		: "מחלקות גליון סגנונות:",
		charset			: "מערכת תווים של משאבים מקושרים:",
		styles			: "סגנון:",
		rel			: "יחס",
		selectAnchor	: "בחירת עוגן",
		anchorName		: "לפי שם עוגן",
		anchorId		: "לפי זיהוי מרכיב",
		emailAddress	: "כתובת דואל",
		emailSubject	: "נושא ההודעה",
		emailBody		: "גוף ההודעה",
		noAnchors		: "אין סימניות זמינות במסמך. לחצו על האיקון 'הוספת סימניית מסמך' בסרגל הכלים כדי להוסיף סימניה.",
		noUrl			: "נא להקליד את URL הקישור",
		noEmail			: "נא להקליד את כתובת הדואל"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "הוספת סימניית מסמך",
		menu		: "עריכת סימניית מסמך",
		title		: "סימניית מסמך",
		name		: "שם:",
		errorName	: "נא לציין שם עבור הסימניה למסמך.",
		remove		: "סילוק סימניית מסמך"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "תכונות רשימה ממוספרת",
		bulletedTitle		: "תכונות רשימה עם תבליטים",
		type				: "סוג",
		start				: "התחלה",
		validateStartNumber				:"המספר הראשון ברשימה חייב להיות מספר שלם.",
		circle				: "מעגל",
		disc				: "דסקית",
		square				: "ריבוע",
		none				: "ללא",
		notset				: "<not set>",
		armenian			: "מספור ארמני",
		georgian			: "מספור גרוזיני (an,‏ ban,‏ gan,‏ וכו')",
		lowerRoman			: "ספרה רומית לא-רישית (i,‏ ii,‏ iii,‏ iv,‏ v,‏ וכו')",
		upperRoman			: "ספרה רומית רישית  (I,‏ II,‏ III,‏ IV,‏ V,‏ וכו')",
		lowerAlpha			: "אות אלפנומרית לא-רישית (a,‏ b,‏ c,‏ d,‏ e,‏ וכו')",
		upperAlpha			: "אות אלפנומרית רישית (A,‏ B,‏ C,‏ D,‏ E,‏ וכו')",
		lowerGreek			: "אות יוונית לא-רישית (alpha,‏ beta,‏ gamma,‏ וכו')",
		decimal				: "מספר עשרוני (1, 2, 3, וכו')",
		decimalLeadingZero	: "מספר עשרוני עם אפס מוביל (01, 02, 03,‏ וכו')"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "חיפוש והחלפה",
		find				: "חיפוש",
		replace				: "החלפה",
		findWhat			: "חיפוש:",
		replaceWith			: "החלפה עם:",
		notFoundMsg			: "התמליל שצוין לא נמצא.",
		noFindVal			: 'דרוש תמליל לחיפוש.',
		findOptions			: "אפשרויות חיפוש",
		matchCase			: "התאמת רישיות",
		matchWord			: "התאמת מילים שלמות",
		matchCyclic			: "התאמה מעגלית",
		replaceAll			: "החלפת הכל",
		replaceSuccessMsg	: "%1 מופעים הוחלפו"
	},

	// Table Dialog
	table :
	{
		toolbar		: "הוספת טבלה",
		title		: "טבלה",
		menu		: "תכונות טבלה",
		deleteTable	: "מחיקת טבלה",
		rows		: "שורות:",
		columns		: "עמודות:",
		border		: "גודל גבול:",
		widthPx		: "פיקסלים",
		widthPc		: "אחוזים",
		widthUnit	: "יחידת רוחב:",
		cellSpace	: "ריווח תאים:",
		cellPad		: "ריפוד תאים:",
		caption		: "כיתוב:",
		summary		: "סיכום:",
		headers		: "כותרות:",
		headersNone		: "ללא",
		headersColumn	: "עמודה ראשונה",
		headersRow		: "שורה ראשונה",
		headersBoth		: "שניהם",
		invalidRows		: "מספר השורות חייב להיות מספר שלם גדול מאפס.",
		invalidCols		: "מספר העמודות חייב להיות מספר שלם גדול מאפס.",
		invalidBorder	: "גודל הגבול חייב להיות מספר חיובי.",
		invalidWidth	: "רוחב הטבלה חייב להיות מספר חיובי.",
		invalidHeight	: "גובה הטבלה חייב להיות מספר חיובי.",
		invalidCellSpacing	: "ריווח התאים חייב להיות מספר חיובי.",
		invalidCellPadding	: "ריפוד התאים חייב להיות מספר חיובי.",

		cell :
		{
			menu			: "תא",
			insertBefore	: "הוספת תא לפני",
			insertAfter		: "הוספת תא אחרי",
			deleteCell		: "מחיקת תאים",
			merge			: "מיזוג תאים",
			mergeRight		: "מיזוג ימינה",
			mergeDown		: "מיזוג למטה",
			splitHorizontal	: "פיצול תאים אופקית",
			splitVertical	: "פיצול תאים אנכית",
			title			: "תכונות תא",
			cellType		: "סוג תא:",
			rowSpan			: "מנעד שורות:",
			colSpan			: "מנעד עמודות:",
			wordWrap		: "גלישת מילים:",
			hAlign			: "יישור אופקי:",
			vAlign			: "יישור אנכי:",
			alignBaseline	: "קו בסיס",
			bgColor			: "צבע רקע:",
			borderColor		: "צבע גבול:",
			data			: "נתונים",
			header			: "כותרת",
			yes				: "כן",
			no				: "לא",
			invalidWidth	: "רוחב התא חייב להיות מספר חיובי.",
			invalidHeight	: "גובה התא חייב להיות מספר חיובי.",
			invalidRowSpan	: "מנעד השורות חייב להיות מספר שלם חיובי.‏",
			invalidColSpan	: "מנעד העמודות חייב להיות מספר שלם חיובי.‏",
			chooseColor : "בחירה:"
		},

		row :
		{
			menu			: "שורה",
			insertBefore	: "הוספת שורה לפני",
			insertAfter		: "הוספת שורה אחרי",
			deleteRow		: "מחיקת שורות"
		},

		column :
		{
			menu			: "עמודה",
			insertBefore	: "הוספת עמודה לפני",
			insertAfter		: "הוספת עמודה אחרי",
			deleteColumn	: "מחיקת עמודות"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "תכונות לחצן",
		text		: "תמליל (ערך):",
		type		: "סוג:",
		typeBtn		: "לחצן",
		typeSbm		: "הגשה",
		typeRst		: "איפוס"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "תכונות תיבת סימון",
		radioTitle	: "תכונות לחצן רדיו",
		value		: "ערך:",
		selected	: "נבחר"
	},

	// Form Dialog.
	form :
	{
		title		: "הוספת טופס",
		menu		: "תכונות טופס",
		action		: "פעולה:",
		method		: "מתודה:",
		encoding	: "קידוד:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "בחירת תכונות שדה",
		selectInfo	: "פרטי בחירה",
		opAvail		: "אפשרויות זמינות",
		value		: "ערך:",
		size		: "גודל:",
		lines		: "שורות",
		chkMulti	: "לאפשר בחירות מרובות",
		opText		: "תמליל:",
		opValue		: "ערך:",
		btnAdd		: "הוספה",
		btnModify	: "שינוי",
		btnUp		: "למעלה",
		btnDown		: "למטה",
		btnSetValue : "הגדרה כערך נבחר",
		btnDelete	: "מחיקה"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "תכונות אזור תמליל",
		cols		: "עמודות:",
		rows		: "שורות:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "תכונת שדה תמליל",
		name		: "שם:",
		value		: "ערך:",
		charWidth	: "רוחב תווים:",
		maxChars	: "מספר תווים מרבי:",
		type		: "סוג:",
		typeText	: "תמליל",
		typePass	: "סיסמה"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "תכונת שדה מוסתר",
		name	: "שם:",
		value	: "ערך:"
	},

	// Image Dialog.
	image :
	{
		title		: "תמונה",
		titleButton	: "תכונות לחצן תמונה",
		menu		: "תכונות תמונה...‏",
		infoTab	: "פרטי תמונה",
		btnUpload	: "משלוח לשרת",
		upload	: "טעינה",
		alt		: "תמליל חלופי:",
		lockRatio	: "נעילת יחס ממדים",
		resetSize	: "איפוס גודל",
		border	: "שוליים:",
		hSpace	: "רווח אופקי:",
		vSpace	: "רווח אנכי:",
		alertUrl	: "נא להקליד את URL הקישור",
		linkTab	: "קישור",
		button2Img	: "האם ברצונכם להמיר את לחצן התמונה שנבחר לתמונה פשוטה?",
		img2Button	: "האם ברצונכם להמיר את התמונה שנבחרה ללחצן תמונה?",
		urlMissing : "ה-URL של מקור התמונה חסר.",
		validateBorder : "הגבול חייב להיות מספר שלם חיובי.‏",
		validateHSpace : "הרווח האופקי חייב להיות מספר שלם חיובי.‏",
		validateVSpace : "הרווח האנכי חייב להיות מספר שלם חיובי.‏"
	},

	// Flash Dialog
	flash :
	{
		properties		: "תכונות פלאש",
		propertiesTab	: "תכונות",
		title		: "פלאש",
		chkPlay		: "הרצה אוטומטית",
		chkLoop		: "לולאה",
		chkMenu		: "הפעלת תפריט פלאש",
		chkFull		: "לאפשר מסך מלא",
 		scale		: "ממדים:",
		scaleAll		: "הצגת הכל",
		scaleNoBorder	: "ללא גבול",
		scaleFit		: "התאמה מדויקת",
		access			: "גישת סקריפט:",
		accessAlways	: "תמיד",
		accessSameDomain	: "באותו מיתחם",
		accessNever	: "לעולם לא",
		alignAbsBottom: "תחתית אבסולוטית",
		alignAbsMiddle: "אמצע אבסולוטי",
		alignBaseline	: "קו בסיס",
		alignTextTop	: "ראש התמליל",
		quality		: "איכות:",
		qualityBest	: "טוב ביותר",
		qualityHigh	: "גבוהה",
		qualityAutoHigh	: "גבוהה אוטומטית",
		qualityMedium	: "בינונית",
		qualityAutoLow	: "נמוכה אוטומטית",
		qualityLow	: "נמוכה",
		windowModeWindow	: "חלון",
		windowModeOpaque	: "אטום",
		windowModeTransparent	: "שקוף",
		windowMode	: "מצב חלון:",
		flashvars	: "משתנים:",
		bgcolor	: "צבע רקע:",
		hSpace	: "רווח אופקי:",
		vSpace	: "רווח אנכי:",
		validateSrc : "ה-URL אינו יכול להיות ריק.‏",
		validateHSpace : "הרווח האופקי חייב להיות מספר שלם חיובי.‏",
		validateVSpace : "הרווח האנכי חייב להיות מספר שלם חיובי.‏"
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "בדיקת איות",
		title			: "בדיקת איות",
		notAvailable	: "מצטערים, השירות אינו זמין כרגע.",
		errorLoading	: "שגיאה בטעינת מארח שירותי הישומים: %s.",
		notInDic		: "לא במילון",
		changeTo		: "שינוי למילה",
		btnIgnore		: "התעלמות",
		btnIgnoreAll	: "התעלמות מהכל",
		btnReplace		: "החלפה",
		btnReplaceAll	: "החלפת הכל",
		btnUndo			: "ביטול פעולה",
		noSuggestions	: "- אין הצעות -",
		progress		: "בדיקת איות מתבצעת...",
		noMispell		: "בדיקת האיות הסתיימה: לא נמצאו שגיאות איות",
		noChanges		: "בדיקת האיות הסתיימה: לא שונו מילים",
		oneChange		: "בדיקת האיות הסתיימה: שונתה מילה אחת",
		manyChanges		: "בדיקת האיות הסתיימה: שונו %1 מילים",
		ieSpellDownload	: "בודק האיות אינו מותקן. האם ברצונכם להוריד אותו עכשיו?"
	},

	smiley :
	{
		toolbar	: "הוספת רגשון",
		title	: "רגשונים",
		options : "אפשרויות רגשונים"
	},

	elementsPath :
	{
		eleLabel : "נתיב מרכיבים",
		eleTitle : "מרכיב %1"
	},

	numberedlist : "רשימה ממוספרת",
	bulletedlist : "רשימה עם תבליטים",
	indent : "הגדלת כניסה",
	outdent : "הקטנת כניסה",

	bidi :
	{
		ltr : "משמאל לימין",
		rtl : "מימין לשמאל",
	},

	justify :
	{
		left : "יישור לשמאל",
		center : "יישור למרכז",
		right : "יישור לימין ",
		block : "יישור דו-צדדי"
	},

	blockquote : "מובאה",

	clipboard :
	{
		title		: "הדבקה",
		cutError	: "הגדרות האבטחה של הדפדפן שלכם מונעות גזירה אוטומטית. השתמשו בשילוב המקשים Ctrl+X במקלדת במקום זאת.",
		copyError	: "הגדרות האבטחה של הדפדפן שלכם מונעות העתקה אוטומטית. השתמשו בשילוב המקשים Ctrl+C במקלדת במקום זאת.",
		pasteMsg	: "לחצו על Ctrl+V (Cmd+V במערכות MAC) כדי להדביק למטה.",
		securityMsg	: "האבטחה של הדפדפן שלכם מונעת הדבקה ישירות מלוח הגזירים.",
		pasteArea	: "אזור הדבקה"
	},

	pastefromword :
	{
		confirmCleanup	: "נראה שהתמליל שברצונכם להדביק הועתק מתוך Word.‏ האם ברצונכם לנקות אותו לפני ההדבקה?",
		toolbar			: "הדבקה מיוחדת",
		title			: "הדבקה מיוחדת",
		error			: "לא ניתן לנקות את הנתונים המודבקים בגלל שגיאה פנימית"
	},

	pasteText :
	{
		button	: "הדבקה כתמליל פשוט",
		title	: "הדבקה כתמליל פשוט"
	},

	templates :
	{
		button 			: "תבניות",
		title : "תבניות תוכן",
		options : "אפשרויות תבנית",
		insertOption: "החלפת תוכן ממשי",
		selectPromptMsg: "בחרו את את התבנית לפתיחה בעורך",
		emptyListMsg : "(לא הוגדרו תבניות)"
	},

	showBlocks : "הצגת חטיבות",

	stylesCombo :
	{
		label		: "סגנונות",
		panelTitle 	: "סגנונות",
		panelTitle1	: "סגנונות חטיבה",
		panelTitle2	: "סגנונות מוכללים שורה",
		panelTitle3	: "סגנונות אובייקט"
	},

	format :
	{
		label		: "עיצוב",
		panelTitle	: "עיצוב פסקה",

		tag_p		: "רגיל",
		tag_pre		: "מעוצב",
		tag_address	: "כתובת",
		tag_h1		: "כותרת 1",
		tag_h2		: "כותרת 2",
		tag_h3		: "כותרת 3",
		tag_h4		: "כותרת 4",
		tag_h5		: "כותרת 5",
		tag_h6		: "כותרת 6",
		tag_div		: "רגיל (DIV)"
	},

	div :
	{
		title				: "יצירת Div Container",
		toolbar				: "יצירת Div Container",
		cssClassInputLabel	: "מחלקות גליון סגנונות",
		styleSelectLabel	: "סגנון",
		IdInputLabel		: "זיהוי",
		languageCodeInputLabel	: " קוד שפה",
		inlineStyleInputLabel	: "סגנון Inline",
		advisoryTitleInputLabel	: "כותרת הסבר",
		langDirLabel		: "כיוון תמליל",
		langDirLTRLabel		: "משמאל לימין",
		langDirRTLLabel		: "מימין לשמאל",
		edit				: "עריכת Div",
		remove				: "סילוק Div"
  	},

	iframe :
	{
		title		: "תכונות IFrame",
		toolbar		: "הוספת IFrame",
		noUrl		: "נא להקליד URL של iframe",
		scrolling	: "הפעלת פסי גלילה",
		border		: "הצגת גבול מסגרת"
	},

	font :
	{
		label		: "גופן",
		voiceLabel	: "גופן",
		panelTitle	: "שם גופן"
	},

	fontSize :
	{
		label		: "גודל",
		voiceLabel	: "גודל גופן",
		panelTitle	: "גודל גופן"
	},

	colorButton :
	{
		textColorTitle	: "צבע תמליל",
		bgColorTitle	: "צבע רקע",
		panelTitle		: "צבעים",
		auto			: "אוטומטי",
		more			: "עוד צבעים..."
	},

	colors :
	{
		"000" : "שחור",
		"800000" : "חום כהה",
		"8B4513" : "חום דהוי",
		"2F4F4F" : "אפור צפחה כהה",
		"008080" : "כחול-ירוק",
		"000080" : "כחול כהה",
		"4B0082" : "אינדיגו",
		"696969" : "אפור כהה",
		"B22222" : "ענבר שרוף",
		"A52A2A" : "חום",
		"DAA520" : "זהוב",
		"006400" : "ירוק כהה",
		"40E0D0" : "טורקיז",
		"0000CD" : "כחול בינוני",
		"800080" : "ארגמן",
		"808080" : "אפור",
		"F00" : "אדום",
		"FF8C00" : "כתום כהה",
		"FFD700" : "זהב",
		"008000" : "ירוק",
		"0FF" : "טורקיז כהה",
		"00F" : "כחול",
		"EE82EE" : "סגול",
		"A9A9A9" : "אפור עמום",
		"FFA07A" : "ורוד סלמון",
		"FFA500" : "כתום",
		"FFFF00" : "צהוב",
		"00FF00" : "ירקרק",
		"AFEEEE" : "טורקיז בהיר",
		"ADD8E6" : "כחול בהיר",
		"DDA0DD" : "שזיף",
		"D3D3D3" : "אפור בהיר",
		"FFF0F5" : "סגול בהיר",
		"FAEBD7" : "לבן עתיק",
		"FFFFE0" : "צהוב בהיר",
		"F0FFF0" : "טל דבש",
		"F0FFFF" : "תכלת",
		"F0F8FF" : "תכלכל",
		"E6E6FA" : "לוונדר",
		"FFF" : "לבן"
	},

	scayt :
	{
		title			: "בדיקת איות תוך כדי הקלדה (SCAYT)",
		opera_title		: "לא נתמך על ידי Opera",
		enable			: "הפעלת SCAYT",
		disable			: "השבתת SCAYT",
		about			: "אודות SCAYT",
		toggle			: "מיתוג SCAYT",
		options			: "אפשרויות",
		langs			: "שפות",
		moreSuggestions	: "הצעות נוספות",
		ignore			: "התעלמות",
		ignoreAll		: "התעלמות מהכל",
		addWord			: "הוספת מילה",
		emptyDic		: "שם המילון אינו יכול להיות ריק.‏",

		optionsTab		: "אפשרויות",
		allCaps			: "התעלמות מילים המכילות רק אותיות רישיות",
		ignoreDomainNames : "התעלמות משמות מיתחמים",
		mixedCase		: "התעלמות ממילים עם רישיות מעורבת",
		mixedWithDigits	: "התעלמות ממילים עם מספרים",

		languagesTab	: "שפות",

		dictionariesTab	: "מילונים",
		dic_field_name	: "שם מילון",
		dic_create		: "יצירה",
		dic_restore		: "שחזור",
		dic_delete		: "מחיקה",
		dic_rename		: "שינוי שם",
		dic_info		: "בשלב ראשון מילון המשתמש מאוחסן בקובץ Cookie.‏ עם זאת, קובצי Cookie מוגבלים בגודלם. כשמילון המשתמש מגיע לגודל שבו לא ניתן לאחסן אותו בקובץ Cookie,‏ ניתן לאחסן את המילון בשרת שלנו. כדי לאחסן את המילון האישי שלכם בשרת שלנו, עליכם לציין שם עבור המילון. אם כבר יש לכם מילון מאוחסן, הקלידו את שמו ולחצו על הלחצן 'שחזור'.",

		aboutTab		: "אודות"
	},

	about :
	{
		title		: "אודות CKEditor",
		dlgTitle	: "אודות CKEditor",
		help	: "ראו $1 כדי לקבל עזרה.",
		userGuide : "מדריך למשתמש של CKEditor",
		moreInfo	: "כדי לקבל מידע על רשיונות בקרו באתר שלנו:",
		copy		: "&copy; זכויות היוצרים של $1.‏ כל הזכויות שמורות."
	},

	maximize : "הגדלה",
	minimize : "מזעור",

	fakeobjects :
	{
		anchor	: "עוגן",
		flash	: "הנפשת פלאש",
		iframe		: "IFrame",
		hiddenfield	: "שדה מוסתר",
		unknown	: "אובייקט לא ידוע"
	},

	resize : "גררו לשינוי גודל",

	colordialog :
	{
		title		: "בחירת צבע",
		options	:	"אפשרויות צבע",
		highlight	: "הבלטה",
		selected	: "צבע נבחר",
		clear		: "ניקוי"
	},

	toolbarCollapse	: "כיווץ סרגל הכלים",
	toolbarExpand	: "הרחבת סרגל הכלים",

	toolbarGroups :
	{
		document : "מסמך",
		clipboard : "לוח הגזירים/ביטול פעולה",
		editing : "עריכה",
		forms : "טפסים",
		basicstyles : "סגנונות בסיסיים",
		paragraph : "פיסקה",
		links : "קישורים",
		insert : "הוספה",
		styles : "סגנונות",
		colors : "צבעים",
		tools : "כלים"
	},

	bidi :
	{
		ltr : "מעבר לתמליל משמאל-לימין",
		rtl : "מעבר לתמליל מימין-לשמאל"
	},

	docprops :
	{
		label : "תכונות מסמך",
		title : "תכונות מסמך",
		design : "עיצוב",
		meta : "תגי מטא",
		chooseColor : "בחירה:",
		other : "אחר...‏",
		docTitle :	"כותרת עמוד",
		charset : 	"קידוד מערכת תווים",
		charsetOther : "קידוד מערכת תווים אחר",
		charsetASCII : "ASCII",
		charsetCE : "מרכז אירופה",
		charsetCT : "סינית מסורתית (Big5)",
		charsetCR : "קירילית",
		charsetGR : "יוונית",
		charsetJP : "יפנית",
		charsetKR : "קוריאנית",
		charsetTR : "טורקית",
		charsetUN : "Unicode (UTF-8)‎",
		charsetWE : "מערב אירופה",
		docType : "כותרת סוג מסמך",
		docTypeOther : "כותרת סוג מסמך אחר",
		xhtmlDec : "הכללת הכרזות XHTML",
		bgColor : "צבע רקע",
		bgImage : "URL של תמונת רקע",
		bgFixed : "רקע לא נגלל (קבוע)",
		txtColor : "צבע תמליל",
		margin : "שולי עמוד",
		marginTop : "ראש",
		marginLeft : "שמאל",
		marginRight : "ימין",
		marginBottom : "תחתית",
		metaKeywords : "מילות מפתח למפתוח המסמך (ערכים מופרדים בפסיקים)",
		metaDescription : "תיאור מסמך",
		metaAuthor : "מחבר",
		metaCopyright : "זכויות יוצרים",
		previewHtml : "<p>זהו <strong>תמליל לדוגמה</strong>. אתם משתמשים בעורך <a href=\"javascript:void(0)\">CKEditor</a>.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "אינצ'ים",
			widthCm	: "סנטימטרים",
			widthMm	: "מילימטרים",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "נקודות",
			widthPc	: "פיקות"
		},
		table :
		{
			heightUnit	: "יחידת גובה:",
			insertMultipleRows : "הוספת שורות",
			insertMultipleCols : "הוספת עמודות",
			noOfRows : "מספר שורות:",
			noOfCols : "מספר עמודות:",
			insertPosition : "מיקום:",
			insertBefore : "לפני",
			insertAfter : "אחרי",
			selectTable : "בחירת טבלה",
			selectRow : "בחירת שורה",
			columnTitle : "עמודה",
			colProps : "תכונות עמודה",
			invalidColumnWidth	: "רוחב העמודה חייב להיות מספר חיובי."
		},
		cell :
		{
			title : "תא"
		},
		emoticon :
		{
			angel		: "מלאך",
			angry		: "כועס",
			cool		: "מגניב",
			crying		: "בוכה",
			eyebrow		: "הרמת גבה",
			frown		: "זועף",
			goofy		: "שטותי",
			grin		: "גיחוך",
			half		: "חצי",
			idea		: "רעיון",
			laughing	: "צוחק",
			laughroll	: "צחוק מתגלגל",
			no			: "לא",
			oops		: "אופס",
			shy			: "מבויש",
			smile		: "חיוך",
			tongue		: "לשון",
			wink		: "קריצה",
			yes			: "כן"
		},

		menu :
		{
			link	: "הוספת קישור",
			list	: "רשימה",
			paste	: "הדבקה",
			action	: "פעולה",
			align	: "יישור",
			emoticon: "רגשון"
		},

		iframe :
		{
			title	: "IFrame"
		},

		list:
		{
			numberedTitle		: "רשימה ממוספרת",
			bulletedTitle		: "רשימה עם תבליטים"
		},

		// Anchor dialog
		anchor :
		{
			description	: "הקלידו שם סימניה תיאורי, כגון 'סעיף 1.2'. לאחר שתוסיפו את הסימניה, לחצו על האיקון 'קישור' או 'קישור סימניית מסמך' כדי לקשר אליה.",
			title		: "קישור סימניית מסמך",
			linkTo		: "קישור אל:"
		},

		urllink :
		{
			title : "קישור URL",
			linkText : "תמליל קישור:",
			selectAnchor: "בחירת עוגן:",
			nourl: "נא לציין URL בשדה התמליל.",
			urlhelp: "הקלידו או הדביקו URL שייפתח כשמשתמשים ילחצו על קישור זה, לדוגמה http://www.example.com.",
			displaytxthelp: "הקלידו תמליל שיוצג בקישור.",
			openinnew : "פתיחת קישור בחלון חדש"
		},

		spellchecker :
		{
			title : "בדיקת איות",
			replace : "החלפה:",
			suggesstion : "הצעות:",
			withLabel : "עם:",
			replaceButton : "החלפה",
			replaceallButton:"החלפת הכל",
			skipButton:"דילוג",
			skipallButton: "דילוג על הכל",
			undochanges: "ביטול שינויים",
			complete: "בדיקת האיות הושלמה",
			problem: "בעיה באחזור נתוני XML",
			addDictionary: "הוספה למילון",
			editDictionary: "עריכת מילון"
		},

		status :
		{
			keystrokeForHelp: "לחצו על ALT 0 כדי להציג עזרה"
		},

		linkdialog :
		{
			label : "דו-שיח קישור"
		},

		image :
		{
			previewText : "התמליל יגלוש מסביב לתמונה שאתם מוסיפים, כמו בדוגמה זו."
		}
	}

};

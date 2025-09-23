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
	editorTitle : "Formázottszöveg-szerkesztő, %1",

	// ARIA descriptions.
	toolbars	: "Szerkesztőeszköztárak",
	editor	: "Formázottszöveg-szerkesztő",

	// Toolbar buttons without dialogs.
	source			: "Forrás",
	newPage			: "Új oldal",
	save			: "Mentés",
	preview			: "Előnézet:",
	cut				: "Kivágás",
	copy			: "Másolás",
	paste			: "Beillesztés",
	print			: "Nyomtatás",
	underline		: "Aláhúzott",
	bold			: "Félkövér",
	italic			: "Dőlt",
	selectAll		: "Mindet kijelöli",
	removeFormat	: "Formázás eltávolítása",
	strike			: "Áthúzott",
	subscript		: "Alsó index ",
	superscript		: "Felső index     ",
	horizontalrule	: "Vízszintes vonal beszúrása",
	pagebreak		: "Oldaltörés beszúrása",
	pagebreakAlt		: "Oldaltörés",
	unlink			: "Hivatkozás eltávolítása",
	undo			: "Visszavonás ",
	redo			: "Újra",

	// Common messages and labels.
	common :
	{
		browseServer	: "Böngészőkiszolgáló:",
		url				: "URL:",
		protocol		: "Protokoll:",
		upload			: "Feltöltés:",
		uploadSubmit	: "Küldés a kiszolgálóra",
		image			: "Kép beszúrása",
		flash			: "Flash film beszúrása",
		form			: "Űrlap beszúrása",
		checkbox		: "Jelölőnégyzet beszúrása",
		radio			: "Választógomb beszúrása",
		textField		: "Szövegmező beszúrása",
		textarea		: "Szövegterület beszúrása",
		hiddenField		: "Rejtett mező beszúrása",
		button			: "Gomb beszúrása",
		select			: "Kiválasztó mező beszúrása",
		imageButton		: "Kép gomb beszúrása",
		notSet			: "<not set>",
		id				: "Azonosító:",
		name			: "Név: ",
		langDir			: "Szöveg iránya:",
		langDirLtr		: "Balról jobbra",
		langDirRtl		: "Jobbról balra",
		langCode		: "Nyelvkód:",
		longDescr		: "Hosszú leírás URL címe:",
		cssClass		: "Stíluslaposztályok:",
		advisoryTitle	: "Tanácsadói cím:",
		cssStyle		: "Stílus:",
		ok				: "OK",
		cancel			: "Mégse",
		close : "Bezárás",
		preview			: "Előnézet:",
		generalTab		: "Általános rész",
		advancedTab		: "Speciális",
		validateNumberFailed	: "Ez az érték nem szám.",
		confirmNewPage	: "A tartalom nem mentett módosításai elvesznek. Biztosan betölt egy új oldalt?",
		confirmCancel	: "Néhány beállítás megváltozott. Biztosan be akarja zárni a párbeszédablakot?",
		options : "Beállítások",
		target			: "Cél:",
		targetNew		: "Új ablak (_blank)",
		targetTop		: "Legfelső ablak (_top)",
		targetSelf		: "Ugyanaz az ablak (_self)",
		targetParent	: "Szülőablak (_parent)",
		langDirLTR		: "Balról jobbra",
		langDirRTL		: "Jobbról balra",
		styles			: "Stílus:",
		cssClasses		: "Stíluslaposztályok:",
		width			: "Szélesség:",
		height			: "Magasság:",
		align			: "Igazítás:",
		alignLeft		: "Balra",
		alignRight		: "Jobbra",
		alignCenter		: "Középre",
		alignTop		: "Felülre",
		alignMiddle		: "Középre",
		alignBottom		: "Alulra",
		invalidHeight	: "A magasság értékének pozitív egész számnak kell lennie.",
		invalidWidth	: "A szélesség értékének pozitív egész számnak kell lennie.",
		invalidCssLength	: "A(z) '%1' mezőhöz megadott értéknek pozitív egész számnak kell lennie érvényes CSS-mértékegységgel (px, %, in, cm, mm, em, ex, pt vagy pc) vagy anélkül.",
		invalidHtmlLength	: "A(z) '%1' mezőhöz megadott értéknek pozitív egész számnak kell lennie érvényes HTML-mértékegységgel (px vagy %) vagy anélkül.",
		invalidInlineStyle	: "A beágyazott stílushoz megadott értéknek néhány pontosvesszővel elválasztott \"név : érték\" formátumú rendezett többesből kell állnia.",
		cssLengthTooltip	: "Képpontban kifejezett érték megadásához adjon meg egy számot, másfajta érték megadásához adjon meg egy számot valamilyen érvényes CSS-mértékegységgel (px, %, in, cm, mm, em, ex, pt vagy pc) együtt.",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">, nem érhető el</span>"
	},

	contextmenu :
	{
		options : "A helyi menü pontjai"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "Különleges karakter beszúrása",
		title		: "Különleges karakter ",
		options : "Különleges karakter beállításai"
	},

	// Link dialog.
	link :
	{
		toolbar		: "URL-hivatkozás",
		other 		: "<other>",
		menu		: "Hivatkozás szerkesztése...",
		title		: "Hivatkozás",
		info		: "A hivatkozás adatai",
		target		: "Cél",
		upload		: "Feltöltés:",
		advanced	: "Speciális",
		type		: "Hivatkozás típusa:",
		toUrl		: "URL",
		toAnchor	: "Szövegbeli horgonyra mutató hivatkozás",
		toEmail		: "E-mail",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "Célkeret neve:",
		targetPopupName	: "Előugró ablak neve:",
		popupFeatures	: "Az előugró ablak tulajdonságai:",
		popupResizable	: "Átméretezhető",
		popupStatusBar	: "Állapotsáv",
		popupLocationBar	: "Helysáv",
		popupToolbar	: "Eszközsáv",
		popupMenuBar	: "Menüsor",
		popupFullScreen	: "Teljes képernyő (IE)",
		popupScrollBars	: "Görgetősávok",
		popupDependent	: "Függő (Netscape)",
		popupLeft		: "Bal oldali helyzet",
		popupTop		: "Felső helyzet",
		id				: "Azonosító:",
		langDir			: "Szöveg iránya:",
		langDirLTR		: "Balról jobbra",
		langDirRTL		: "Jobbról balra",
		acccessKey		: "Gyorsbillentyű:",
		name			: "Név: ",
		langCode		: "Nyelvkód:",
		tabIndex		: "Bejárási index:",
		advisoryTitle	: "Tanácsadói cím:",
		advisoryContentType	: "Tanácsadói tartalomtípus:",
		cssClasses		: "Stíluslaposztályok:",
		charset			: "Hivatkozott erőforrás-karakterkészlet:",
		styles			: "Stílus:",
		rel			: "Viszony",
		selectAnchor	: "Horgony kiválasztása",
		anchorName		: "Horgony neve alapján",
		anchorId		: "Elemazonosító alapján",
		emailAddress	: "E-mail cím",
		emailSubject	: "Üzenet tárgya",
		emailBody		: "Üzenettörzs",
		noAnchors		: "Nincsenek könyvjelzők a dokumentumban. Könyvjelző hozzáadásához kattintson a Dokumentum-könyvjelző beszúrása ikonra az eszközsávon.",
		noUrl			: "Írja be a hivatkozás URL címét",
		noEmail			: "Írja be az e-mail címet"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "Dokumentum-könyvjelző beszúrása",
		menu		: "Dokumentum-könyvjelző szerkesztése",
		title		: "Dokumentum-könyvjelző",
		name		: "Név: ",
		errorName	: "Adja meg a dokumentum-könyvjelző nevét",
		remove		: "Dokumentum-könyvjelző eltávolítása"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "Számozott lista tulajdonságai",
		bulletedTitle		: "Felsorolásjeles lista tulajdonságai",
		type				: "Típus",
		start				: "Indítás",
		validateStartNumber				:"A lista kezdőszámának egész számnak kell lennie.",
		circle				: "Kör",
		disc				: "Korong",
		square				: "Négyzet",
		none				: "Nincs",
		notset				: "<not set>",
		armenian			: "Örmény számok",
		georgian			: "Grúz számok (an, ban, gan stb.)",
		lowerRoman			: "Kisbetűs római számok (i, ii, iii, iv, v stb.)",
		upperRoman			: "Nagybetűs római számok (I, II, III, IV, V stb.)",
		lowerAlpha			: "Kisbetűk (a, b, c, d, e stb.)",
		upperAlpha			: "Nagybetűk (A, B, C, D, E stb.)",
		lowerGreek			: "Görög kisbetűk (alfa, béta, gamma stb.)",
		decimal				: "Tízes számrendszerbeli számok (1, 2, 3 stb.)",
		decimalLeadingZero	: "Tízes számrendszerbeli számok kezdő nullával (01, 02, 03 stb.)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "Keresés és csere",
		find				: "Keresés",
		replace				: "Csere",
		findWhat			: "Keresés:",
		replaceWith			: "Csere erre:",
		notFoundMsg			: "A megadott szöveg nem található.",
		noFindVal			: 'Adja meg a keresendő szöveget.',
		findOptions			: "Keresési beállítások",
		matchCase			: "Kis- és nagybetűk megkülönböztetése",
		matchWord			: "Teljes szó egyezése",
		matchCyclic			: "Körkörös egyeztetés",
		replaceAll			: "Mindet cseréli",
		replaceSuccessMsg	: "%1 előfordulás lecserélve."
	},

	// Table Dialog
	table :
	{
		toolbar		: "Táblázat beszúrása",
		title		: "Táblázat",
		menu		: "Táblázat tulajdonságai",
		deleteTable	: "Táblázat törlése",
		rows		: "Sor:",
		columns		: "Oszlop:",
		border		: "Szegélyvastagság:",
		widthPx		: "képpont",
		widthPc		: "százalék",
		widthUnit	: "Vastagság egysége:",
		cellSpace	: "Cellatávolság:",
		cellPad		: "Cellakitöltés:",
		caption		: "Felirat:",
		summary		: "Összegzés:",
		headers		: "Fejlécek:",
		headersNone		: "Nincs",
		headersColumn	: "Első oszlop",
		headersRow		: "Első sor",
		headersBoth		: "Mindkettő",
		invalidRows		: "A sorok számának nullánál nagyobb egész számnak kell lennie.",
		invalidCols		: "Az oszlopok számának nullánál nagyobb egész számnak kell lennie.",
		invalidBorder	: "A szegélyvastagságnak pozitív számnak kell lennie.",
		invalidWidth	: "A táblázat szélességének pozitív számnak kell lennie.",
		invalidHeight	: "A táblázat magasságának pozitív számnak kell lennie.",
		invalidCellSpacing	: "A cellatávolságnak pozitív számnak kell lennie.",
		invalidCellPadding	: "A cellakitöltésnek pozitív számnak kell lennie.",

		cell :
		{
			menu			: "Cella",
			insertBefore	: "Cella beszúrása ez elé",
			insertAfter		: "Cella beszúrása ez után",
			deleteCell		: "Cellák törlése",
			merge			: "Cellák egyesítése",
			mergeRight		: "Egyesítés jobbra",
			mergeDown		: "Egyesítés lefelé",
			splitHorizontal	: "A cella szétválasztása vízszintesen",
			splitVertical	: "A cella szétválasztása függőlegesen",
			title			: "Cella tulajdonságai",
			cellType		: "Cella típusa:",
			rowSpan			: "Sortávolság:",
			colSpan			: "Oszloptávolság:",
			wordWrap		: "Szövegtördelés:",
			hAlign			: "Vízszintes igazítás:",
			vAlign			: "Függőleges igazítás:",
			alignBaseline	: "Alapvonal",
			bgColor			: "Háttérszín:",
			borderColor		: "Szegélyszín:",
			data			: "Adatok",
			header			: "Fejléc",
			yes				: "Igen",
			no				: "Nem",
			invalidWidth	: "A cellaszélességnek pozitív számnak kell lennie.",
			invalidHeight	: "A cellamagasságnak pozitív számnak kell lennie.",
			invalidRowSpan	: "A sortávolságnak pozitív egész számnak kell lennie.",
			invalidColSpan	: "Az oszloptávolságnak pozitív egész számnak kell lennie.",
			chooseColor : "Kiválasztás"
		},

		row :
		{
			menu			: "Sor",
			insertBefore	: "Sor beszúrása ez elé",
			insertAfter		: "Sor beszúrása ez után",
			deleteRow		: "Sorok törlése"
		},

		column :
		{
			menu			: "Oszlop",
			insertBefore	: "Oszlop beszúrása ez elé",
			insertAfter		: "Oszlop beszúrása ez után",
			deleteColumn	: "Oszlopok törlése"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "Gomb tulajdonságai",
		text		: "Szöveg (érték):",
		type		: "Típus:",
		typeBtn		: "Gomb",
		typeSbm		: "Elküldés",
		typeRst		: "Visszaállítás"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "Jelölőnégyzet tulajdonságai",
		radioTitle	: "Választógomb tulajdonságai",
		value		: "Érték:",
		selected	: "Kijelölve"
	},

	// Form Dialog.
	form :
	{
		title		: "Űrlap beszúrása",
		menu		: "Űrlap tulajdonságai",
		action		: "Művelet:",
		method		: "Metódus:",
		encoding	: "Kódolás:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "Mezőtulajdonságok kiválasztása",
		selectInfo	: "A kijelölés adatai",
		opAvail		: "Választható beállítások",
		value		: "Érték:",
		size		: "Méret:",
		lines		: "sor",
		chkMulti	: "Több elem kijelölésének engedélyezése",
		opText		: "Szöveg:",
		opValue		: "Érték:",
		btnAdd		: "Hozzáadás",
		btnModify	: "Módosítás",
		btnUp		: "Felfelé",
		btnDown		: "Lefelé",
		btnSetValue : "Beállítás kijelölt értékként",
		btnDelete	: "Törlés"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "Szövegterület tulajdonságai",
		cols		: "Oszlop:",
		rows		: "Sor:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "Szövegmező tulajdonságai",
		name		: "Név:",
		value		: "Érték:",
		charWidth	: "Karakterszélesség:",
		maxChars	: "Karakterek száma legföljebb:",
		type		: "Típus:",
		typeText	: "Szöveg",
		typePass	: "Jelszó"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "Rejtett mező tulajdonságai",
		name	: "Név:",
		value	: "Érték:"
	},

	// Image Dialog.
	image :
	{
		title		: "Kép",
		titleButton	: "Képgomb tulajdonságai",
		menu		: "Kép tulajdonságai...",
		infoTab	: "A kép adatai",
		btnUpload	: "Küldés a kiszolgálóra",
		upload	: "Feltöltés",
		alt		: "Helyettesítő szöveg:",
		lockRatio	: "Zárolási arány",
		resetSize	: "Méret alaphelyzetbe állítása",
		border	: "Szegély:",
		hSpace	: "Vízszintes hely:",
		vSpace	: "Függőleges hely:",
		alertUrl	: "Írja be a kép URL-címét",
		linkTab	: "Hivatkozás",
		button2Img	: "Átalakítja a kijelölt képgombot egyszerű képpé?",
		img2Button	: "Átalakítja a kijelölt képet képgombbá?",
		urlMissing : "Hiányzik a kép forrás-URL-címe.",
		validateBorder : "A szegélynek pozitív egész számnak kell lennie.",
		validateHSpace : "A vízszintes helynek pozitív egész számnak kell lennie.",
		validateVSpace : "A függőleges helynek pozitív egész számnak kell lennie."
	},

	// Flash Dialog
	flash :
	{
		properties		: "Flash tulajdonságai",
		propertiesTab	: "Tulajdonságok",
		title		: "Flash",
		chkPlay		: "Automatikus lejátszás",
		chkLoop		: "Ciklus",
		chkMenu		: "Flash menü engedélyezése",
		chkFull		: "Teljes képernyő engedélyezése",
 		scale		: "Méretezés:",
		scaleAll		: "Az összes megjelenítése",
		scaleNoBorder	: "Nincs szegély",
		scaleFit		: "Pontos illeszkedés",
		access			: "Parancsfájl-hozzáférés:",
		accessAlways	: "Mindig",
		accessSameDomain	: "Azonos tartomány",
		accessNever	: "Soha",
		alignAbsBottom: "Teljesen lent",
		alignAbsMiddle: "Teljesen középen",
		alignBaseline	: "Alapvonal",
		alignTextTop	: "Szöveg tetejére",
		quality		: "Minőség:",
		qualityBest	: "A legjobb",
		qualityHigh	: "Jó",
		qualityAutoHigh	: "Automatikus jó",
		qualityMedium	: "Közepes",
		qualityAutoLow	: "Automatikus gyenge",
		qualityLow	: "Gyenge",
		windowModeWindow	: "Ablak",
		windowModeOpaque	: "Átlátszatlan",
		windowModeTransparent	: "Átlátszó",
		windowMode	: "Ablak üzemmód:",
		flashvars	: "Változók:",
		bgcolor	: "Háttérszín:",
		hSpace	: "Vízszintes hely:",
		vSpace	: "Függőleges hely:",
		validateSrc : "Az URL-cím mező nem lehet üres.",
		validateHSpace : "A vízszintes helynek pozitív egész számnak kell lennie.",
		validateVSpace : "A függőleges helynek pozitív egész számnak kell lennie."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "Helyesírás-ellenőrzés",
		title			: "Helyesírás-ellenőrzés",
		notAvailable	: "Sajnáljuk, a szolgáltatás jelenleg nem érhető el.",
		errorLoading	: "Hiba az alkalmazás %s szolgáltatás-gazdagépének betöltésekor.",
		notInDic		: "Nincs a szótárban",
		changeTo		: "Módosítás erre:",
		btnIgnore		: "Átugrás",
		btnIgnoreAll	: "Az összes átugrása",
		btnReplace		: "Csere",
		btnReplaceAll	: "Mindet cseréli",
		btnUndo			: "Visszavonás ",
		noSuggestions	: "- Nincs javaslat -",
		progress		: "A helyesírás-ellenőrzés folyamatban...",
		noMispell		: "A helyesírás-ellenőrzés befejeződött: Nincs helyesírási hiba.",
		noChanges		: "Helyesírás-ellenőrzés kész: Nem módosultak szavak.",
		oneChange		: "A helyesírás-ellenőrzés befejeződött: Egy szó módosult.",
		manyChanges		: "A helyesírás-ellenőrzés befejeződött: %1 szó módosult.",
		ieSpellDownload	: "Nincs telepítve helyesírás-ellenőrző. Telepíti most?"
	},

	smiley :
	{
		toolbar	: "Hangulatjel beszúrása",
		title	: "Hangulatjelek",
		options : "Hangulatjelek beállításai"
	},

	elementsPath :
	{
		eleLabel : "Elem elérési útja",
		eleTitle : "%1 elem"
	},

	numberedlist : "Számozott lista",
	bulletedlist : "Felsorolásjeles lista",
	indent : "Behúzás növelése",
	outdent : "Behúzás csökkentése",

	bidi :
	{
		ltr : "Balról jobbra",
		rtl : "Jobbról balra",
	},

	justify :
	{
		left : "Balra igazítás",
		center : "Középre igazítás",
		right : "Jobbra igazítás",
		block : "Sorkizárt igazítás"
	},

	blockquote : "Kiemelt idézetblokk",

	clipboard :
	{
		title		: "Beillesztés",
		cutError	: "A böngésző biztonsági beállításai nem engedik az automatikus kivágást. Használja helyette a Ctrl+X billentyűkombinációt.",
		copyError	: "A böngésző biztonsági beállításai nem engedik az automatikus másolást. Használja helyette a Ctrl+C billentyűkombinációt.",
		pasteMsg	: "A kurzor alá beillesztéshez nyomja le a Ctrl+V (Mac gépen a Cmd+V) billentyűkombinációt.",
		securityMsg	: "A böngésző biztonsági beállításai nem engedik a közvetlen beillesztést a vágólapról.",
		pasteArea	: "Beillesztési terület"
	},

	pastefromword :
	{
		confirmCleanup	: "Úgy tűnik, hogy a beillesztendő szöveg Word szövegszerkesztőből lett kimásolva. Szeretné a beillesztés előtt megtisztítani a formázásoktól?",
		toolbar			: "Irányított beillesztés",
		title			: "Irányított beillesztés",
		error			: "Belső hiba miatt nem sikerült megtisztítani a formázásoktól a szöveget beillesztés előtt."
	},

	pasteText :
	{
		button	: "Beillesztés sima szövegként",
		title	: "Beillesztés sima szövegként"
	},

	templates :
	{
		button 			: "Sablonok",
		title : "Tartalomsablonok",
		options : "Sablonbeállítások",
		insertOption: "A jelenlegi tartalom cseréje",
		selectPromptMsg: "Válassza ki a szerkesztőben megnyitandó sablont",
		emptyListMsg : "(Nincsenek sablonok)"
	},

	showBlocks : "Tömbök megjelenítése",

	stylesCombo :
	{
		label		: "Stílusok",
		panelTitle 	: "Stílusok",
		panelTitle1	: "Blokkstílusok",
		panelTitle2	: "Beágyazási stílusok",
		panelTitle3	: "Objektumstílusok"
	},

	format :
	{
		label		: "Formázás",
		panelTitle	: "Bekezdés formázása",

		tag_p		: "Normál",
		tag_pre		: "Formázott",
		tag_address	: "Cím",
		tag_h1		: "1. címsor",
		tag_h2		: "2. címsor",
		tag_h3		: "3. címsor",
		tag_h4		: "4. címsor",
		tag_h5		: "5. címsor",
		tag_h6		: "6. címsor",
		tag_div		: "Normál (DIV)"
	},

	div :
	{
		title				: "DIV-tároló létrehozása",
		toolbar				: "DIV-tároló létrehozása",
		cssClassInputLabel	: "Stíluslaposztályok",
		styleSelectLabel	: "Stílus",
		IdInputLabel		: "Azonosító",
		languageCodeInputLabel	: " Nyelvkód",
		inlineStyleInputLabel	: "Beágyazási stílus",
		advisoryTitleInputLabel	: "Tanácsadói cím",
		langDirLabel		: "Írásirány",
		langDirLTRLabel		: "Balról jobbra",
		langDirRTLLabel		: "Jobbról balra",
		edit				: "Div szerkesztése",
		remove				: "Div eltávolítása"
  	},

	iframe :
	{
		title		: "IFrame-tulajdonságok",
		toolbar		: "IFrame beszúrása",
		noUrl		: "Írja be az IFrame URL-címét",
		scrolling	: "Görgetősávok engedélyezése",
		border		: "Keret szegélyének megjelenítése"
	},

	font :
	{
		label		: "Betűtípus",
		voiceLabel	: "Betűtípus",
		panelTitle	: "Betűtípus neve"
	},

	fontSize :
	{
		label		: "Méret",
		voiceLabel	: "Betűméret",
		panelTitle	: "Betűméret"
	},

	colorButton :
	{
		textColorTitle	: "Szövegszín",
		bgColorTitle	: "Háttérszín",
		panelTitle		: "Színek",
		auto			: "Automatikus",
		more			: "További színek..."
	},

	colors :
	{
		"000" : "Fekete",
		"800000" : "Gesztenyebarna",
		"8B4513" : "Dióbarna",
		"2F4F4F" : "Sötét palaszürke",
		"008080" : "Pávakék",
		"000080" : "Sötétkék",
		"4B0082" : "Indigókék",
		"696969" : "Sötétszürke",
		"B22222" : "Téglavörös",
		"A52A2A" : "Barna",
		"DAA520" : "Aranysárga",
		"006400" : "Sötétzöld",
		"40E0D0" : "Türkizkék",
		"0000CD" : "Középkék",
		"800080" : "Bíborlila",
		"808080" : "Szürke",
		"F00" : "Piros",
		"FF8C00" : "Sötét narancssárga",
		"FFD700" : "Aranysárga",
		"008000" : "Zöld",
		"0FF" : "Zöldeskék",
		"00F" : "Kék",
		"EE82EE" : "Ibolyakék",
		"A9A9A9" : "Halványszürke",
		"FFA07A" : "Világos lazacszín",
		"FFA500" : "Narancssárga",
		"FFFF00" : "Sárga",
		"00FF00" : "Zöldcitromzöld",
		"AFEEEE" : "Halvány türkizkék",
		"ADD8E6" : "Világoskék",
		"DDA0DD" : "Szilvakék",
		"D3D3D3" : "Világosszürke",
		"FFF0F5" : "Levendulaszín",
		"FAEBD7" : "Ófehér",
		"FFFFE0" : "Világossárga",
		"F0FFF0" : "Halványzöld",
		"F0FFFF" : "Azúrkék",
		"F0F8FF" : "Halványkék",
		"E6E6FA" : "Levendulaszín",
		"FFF" : "Fehér"
	},

	scayt :
	{
		title			: "Helyesírás-ellenőrzés beíráskor",
		opera_title		: "Opera böngészővel nem használható",
		enable			: "A SCAYT (helyesírás-ellenőrzés beíráskor) engedélyezése",
		disable			: "A SCAYT (helyesírás-ellenőrzés beíráskor) letiltása",
		about			: "A SCAYT (helyesírás-ellenőrzés beíráskor) névjegye",
		toggle			: "Váltás a SCAYT (helyesírás-ellenőrzés beíráskor) ki- és bekapcsolása közt",
		options			: "Beállítások",
		langs			: "Nyelvek",
		moreSuggestions	: "További javaslatok",
		ignore			: "Átugrás",
		ignoreAll		: "Az összes átugrása",
		addWord			: "Szó hozzáadása",
		emptyDic		: "A szótár neve mező nem lehet üres.",

		optionsTab		: "Beállítások",
		allCaps			: "A teljesen nagybetűs szavak átugrása",
		ignoreDomainNames : "A tartománynevek átugrása",
		mixedCase		: "A vegyesen kis- és nagybetűs szavak átugrása",
		mixedWithDigits	: "A számokat tartalmazó szavak átugrása",

		languagesTab	: "Nyelvek",

		dictionariesTab	: "Szótárak",
		dic_field_name	: "A szótár neve",
		dic_create		: "Létrehozás",
		dic_restore		: "Visszaállítás",
		dic_delete		: "Törlés",
		dic_rename		: "Átnevezés",
		dic_info		: "A felhasználói szótárat kezdetben egy cookie-ban tárolja a program. A cookie-k mérete azonban korlátozott. Ha a felhasználói szótár túlnő azon a méreten, amekkorát még cookie-ban lehet tárolni, tárolható a kiszolgálón is. A személyes szótár kiszolgálón való tárolásához meg kell adnia a szótár nevét. Ha van már tárolt szótára, adja meg annak nevét, és kattintson a Visszaállítás gombra.",

		aboutTab		: "Névjegy"
	},

	about :
	{
		title		: "A CKEditor névjegye",
		dlgTitle	: "A CKEditor névjegye",
		help	: "A súgó megnyitásához használja a $1 lehetőséget.",
		userGuide : "A CKEditor használati utasítása",
		moreInfo	: "A licencelési információkért lásd webhelyünket:",
		copy		: "Copyright &copy; $1. Minden jog fenntartva."
	},

	maximize : "Teljes méret",
	minimize : "Minimális méret",

	fakeobjects :
	{
		anchor	: "Horgony",
		flash	: "Flash animáció",
		iframe		: "IFrame",
		hiddenfield	: "Rejtett mező",
		unknown	: "Ismeretlen objektum"
	},

	resize : "Átméretezéshez húzza itt",

	colordialog :
	{
		title		: "Színválasztás",
		options	:	"Színbeállítások",
		highlight	: "Kiemelés",
		selected	: "Kiválasztott szín",
		clear		: "Kiürítés"
	},

	toolbarCollapse	: "Az eszközsáv becsukása",
	toolbarExpand	: "Az eszközsáv kinyitása",

	toolbarGroups :
	{
		document : "Dokumentum",
		clipboard : "Vágólap/visszavonás",
		editing : "Szerkesztés",
		forms : "Űrlapok",
		basicstyles : "Alapvető stílusok",
		paragraph : "Bekezdés",
		links : "Hivatkozások",
		insert : "Beszúrás",
		styles : "Stílusok",
		colors : "Színek",
		tools : "Eszközök"
	},

	bidi :
	{
		ltr : "Váltás balról jobbra haladó írásra",
		rtl : "Váltás jobbról balra haladó írásra"
	},

	docprops :
	{
		label : "Dokumentum tulajdonságai",
		title : "Dokumentum tulajdonságai",
		design : "Kialakítás",
		meta : "Metacímkék",
		chooseColor : "Kiválasztás",
		other : "Egyéb...",
		docTitle :	"A weblap címe",
		charset : 	"Karakterkészlet-kódolás",
		charsetOther : "Egyéb karakterkészlet-kódolás",
		charsetASCII : "ASCII",
		charsetCE : "Közép-európai",
		charsetCT : "Hagyományos kínai (Big5)",
		charsetCR : "Cirill",
		charsetGR : "Görög",
		charsetJP : "Japán",
		charsetKR : "Koreai",
		charsetTR : "Török",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "Nyugat-európai",
		docType : "Dokumentumtípus-fejléc",
		docTypeOther : "Egyéb dokumentumtípus-fejléc",
		xhtmlDec : "Tartalmazza az XHTML-meghatározásokat",
		bgColor : "Háttérszín",
		bgImage : "A háttérkép URL-címe",
		bgFixed : "Nem görgethető (rögzített) háttér",
		txtColor : "Szövegszín",
		margin : "Oldalmargók",
		marginTop : "Felső",
		marginLeft : "Bal",
		marginRight : "Jobb",
		marginBottom : "Alsó",
		metaKeywords : "Dokumentumindexelési kulcsszavak (vesszővel tagolva)",
		metaDescription : "A dokumentum leírása",
		metaAuthor : "Szerző",
		metaCopyright : "Copyright",
		previewHtml : "<p>Ez egy <strong>mintaszöveg</strong>. Ön a <a href=\"javascript:void(0)\">CKEditor</a> szerkesztőprogramot használja.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "hüvelyk",
			widthCm	: "centiméter",
			widthMm	: "milliméter",
			widthEm	: "kvirt",
			widthEx	: "ex",
			widthPt	: "pont",
			widthPc	: "///ciceró"
		},
		table :
		{
			heightUnit	: "Magasság egysége:",
			insertMultipleRows : "Sorok beszúrása",
			insertMultipleCols : "Oszlopok beszúrása",
			noOfRows : "Sorok száma:",
			noOfCols : "Oszlopok száma:",
			insertPosition : "Helyzet:",
			insertBefore : "Ez előtt:",
			insertAfter : "Ez után:",
			selectTable : "Táblázat kiválasztása",
			selectRow : "Sor kijelölése",
			columnTitle : "Oszlop",
			colProps : "Oszlop tulajdonságai",
			invalidColumnWidth	: "Az oszlopszélességnek pozitív számnak kell lennie."
		},
		cell :
		{
			title : "Cella"
		},
		emoticon :
		{
			angel		: "Angyal",
			angry		: "Mérges",
			cool		: "Laza",
			crying		: "Sírós",
			eyebrow		: "Szemöldök",
			frown		: "Rosszalló",
			goofy		: "Ostoba",
			grin		: "Vigyorgó",
			half		: "Fél",
			idea		: "Ötlet",
			laughing	: "Nevető",
			laughroll	: "Nevetéstől guruló",
			no			: "Nem",
			oops		: "Ajjaj",
			shy			: "Félénk",
			smile		: "Mosolygó",
			tongue		: "Kinyújtott nyelvű",
			wink		: "Kacsintó",
			yes			: "Igen"
		},

		menu :
		{
			link	: "Hivatkozás beszúrása",
			list	: "Listázás",
			paste	: "Beillesztés",
			action	: "Művelet",
			align	: "Igazítás",
			emoticon: "Hangulatjel "
		},

		iframe :
		{
			title	: "IFrame"
		},

		list:
		{
			numberedTitle		: "Számozott lista",
			bulletedTitle		: "Felsorolásjeles lista"
		},

		// Anchor dialog
		anchor :
		{
			description	: "Adjon meg a leíró könyvjelzőnevet, például: 1.2. szakasz. A könyvjelző beszúrása után kattintson az Összekapcsolás vagy a Dokumentum-könyvjelző összekapcsolása ikonra a hivatkozás és a dokumentum összekapcsolásához.",
			title		: "Dokumentum-könyvjelző összekapcsolása",
			linkTo		: "Összekapcsolás ezzel:"
		},

		urllink :
		{
			title : "URL-hivatkozás",
			linkText : "A hivatkozás szövege:",
			selectAnchor: "Válasszon horgonyt:",
			nourl: "Írjon be URL-címet a szövegmezőbe.",
			urlhelp: "Írja vagy illessze be azt az URL címet, amely akkor nyílik meg, ha a felhasználó erre hivatkozásra kattint (például http://www.pelda.hu).",
			displaytxthelp: "Írja be a hivatkozáshoz megjelenítendő szöveget.",
			openinnew : "A hivatkozás megnyitása új ablakban"
		},

		spellchecker :
		{
			title : "Helyesírás-ellenőrzés",
			replace : "Csere:",
			suggesstion : "Javaslatok:",
			withLabel : "Ezzel:",
			replaceButton : "Csere",
			replaceallButton:"Mindet cseréli",
			skipButton:"Kihagyja",
			skipallButton: "Mindet kihagyja",
			undochanges: "Módosítások visszavonása",
			complete: "A helyesírás-ellenőrzés befejeződött",
			problem: "Probléma az XML-adatok beolvasása során",
			addDictionary: "Felvétel a szótárba",
			editDictionary: "A szótár szerkesztése"
		},

		status :
		{
			keystrokeForHelp: "A súgó megnyitásához nyomja meg az ALT+0 billentyűkombinációt."
		},

		linkdialog :
		{
			label : "Hivatkozás párbeszédpanel"
		},

		image :
		{
			previewText : "A hozzáadott képet a szöveg körülfolyja, mint ebben a példában."
		}
	}

};

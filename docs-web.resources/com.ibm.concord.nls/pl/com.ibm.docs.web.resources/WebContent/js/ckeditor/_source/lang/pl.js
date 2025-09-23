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
	editorTitle : "Edytor tekstu formatowanego %1",

	// ARIA descriptions.
	toolbars	: "Paski narzędzi edytora",
	editor	: "Edytor tekstu w formacie RTF",

	// Toolbar buttons without dialogs.
	source			: "Źródło",
	newPage			: "Nowa strona",
	save			: "Zapisz",
	preview			: "Podgląd:",
	cut				: "Wytnij",
	copy			: "Kopiuj",
	paste			: "Wklej",
	print			: "Drukuj",
	underline		: "Podkreślenie",
	bold			: "Pogrubienie",
	italic			: "Kursywa",
	selectAll		: "Wybierz wszystko",
	removeFormat	: "Usuń formatowanie",
	strike			: "Przekreślenie",
	subscript		: "Indeks dolny",
	superscript		: "Indeks górny",
	horizontalrule	: "Wstaw linię poziomą",
	pagebreak		: "Wstaw podział strony",
	pagebreakAlt		: "Podział strony",
	unlink			: "Usuń odsyłacz",
	undo			: "Cofnij",
	redo			: "Ponów",

	// Common messages and labels.
	common :
	{
		browseServer	: "Serwer przeglądarki:",
		url				: "Adres URL:",
		protocol		: "Protokół:",
		upload			: "Prześlij:",
		uploadSubmit	: "Wyślij do serwera",
		image			: "Wstaw obraz",
		flash			: "Wstaw film w formacie Flash",
		form			: "Wstaw formularz",
		checkbox		: "Wstaw pole wyboru",
		radio			: "Wstaw przełącznik",
		textField		: "Wstaw pole tekstowe",
		textarea		: "Wstaw obszar tekstowy",
		hiddenField		: "Wstaw ukryte pole",
		button			: "Wstaw przycisk",
		select			: "Wstaw obszar wyboru",
		imageButton		: "Wstaw przycisk z obrazem",
		notSet			: "<not set>",
		id				: "Identyfikator:",
		name			: "Nazwa:",
		langDir			: "Kierunek tekstu:",
		langDirLtr		: "Od lewej do prawej",
		langDirRtl		: "Od prawej do lewej",
		langCode		: "Kod języka:",
		longDescr		: "Adres URL z długim opisem:",
		cssClass		: "Klasy arkusza stylów:",
		advisoryTitle	: "Tytuł pomocniczy:",
		cssStyle		: "Styl:",
		ok				: "OK",
		cancel			: "Anuluj",
		close : "Zamknij",
		preview			: "Podgląd:",
		generalTab		: "Ogólne",
		advancedTab		: "Zaawansowane",
		validateNumberFailed	: "Ta wartość nie jest liczbą.",
		confirmNewPage	: "Wszystkie niezapisane zmiany w tej treści zostaną utracone. Czy na pewno załadować nową stronę?",
		confirmCancel	: "Niektóre opcje zostały zmienione. Czy na pewno zamknąć okno dialogowe?",
		options : "Opcje",
		target			: "Cel:",
		targetNew		: "Nowe okno (_blank)",
		targetTop		: "Okno znajdujące się najwyżej (_top)",
		targetSelf		: "To samo okno (_self)",
		targetParent	: "Okno macierzyste (_parent)",
		langDirLTR		: "Od lewej do prawej",
		langDirRTL		: "Od prawej do lewej",
		styles			: "Styl:",
		cssClasses		: "Klasy arkusza stylów:",
		width			: "Szerokość:",
		height			: "Wysokość:",
		align			: "Wyrównanie:",
		alignLeft		: "Do lewej",
		alignRight		: "Do prawej",
		alignCenter		: "Wyśrodkuj",
		alignTop		: "Do góry",
		alignMiddle		: "Wyśrodkuj",
		alignBottom		: "Do dołu",
		invalidHeight	: "Wysokość musi być wyrażona dodatnią liczbą całkowitą.",
		invalidWidth	: "Szerokość musi być wyrażona dodatnią liczbą całkowitą.",
		invalidCssLength	: "Wartość podana w polu %1 musi być dodatnią liczbą całkowitą bez jednostki miary lub z poprawną jednostką miary używaną w arkuszach CSS, taką jak piksel (px), %, cal (in), cm, mm, firet (em), wysokość x (ex), punkt (pt) lub pica (pc).",
		invalidHtmlLength	: "Wartość podana w polu %1 musi być dodatnią liczbą całkowitą bez jednostki miary lub z poprawną jednostką miary używaną w języku HTML, taką jak piksel (px) lub %.",
		invalidInlineStyle	: "Wartość podana dla stylu wstawianego musi składać się z jednej lub wielu krotek (rozdzielanych średnikami) w formacie \"nazwa : wartość\".",
		cssLengthTooltip	: "Wprowadź liczbę wyrażoną w pikslach lub liczbę z poprawną jednostką miary używaną w arkuszach CSS, taką jak piksel (px), %, cal (in), cm, mm, firet (em), wysokość x (ex), punkt (pt) lub pica (pc).",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">, niedostępne</span>"
	},

	contextmenu :
	{
		options : "Opcje menu kontekstowego"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "Wstaw znak specjalny",
		title		: "Znak specjalny",
		options : "Opcje znaku specjalnego"
	},

	// Link dialog.
	link :
	{
		toolbar		: "Adres URL odsyłacza",
		other 		: "<other>",
		menu		: "Edytuj odsyłacz...",
		title		: "Odsyłacz",
		info		: "Informacje o odsyłaczu",
		target		: "Element docelowy",
		upload		: "Prześlij:",
		advanced	: "Zaawansowane",
		type		: "Typ odsyłacza:",
		toUrl		: "Adres URL",
		toAnchor	: "Odsyłacz do zakotwiczenia w tekście",
		toEmail		: "E-mail",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "Nazwa ramki docelowej:",
		targetPopupName	: "Nazwa okna wywoływanego:",
		popupFeatures	: "Opcje okna wywoływanego:",
		popupResizable	: "Możliwość zmiany wielkości",
		popupStatusBar	: "Pasek statusu",
		popupLocationBar	: "Pasek położenia",
		popupToolbar	: "Pasek narzędzi",
		popupMenuBar	: "Pasek menu",
		popupFullScreen	: "Pełny ekran (IE)",
		popupScrollBars	: "Paski przewijania",
		popupDependent	: "Zależne (Netscape)",
		popupLeft		: "Położenie względem lewej krawędzi",
		popupTop		: "Położenie względem górnej krawędzi",
		id				: "Identyfikator:",
		langDir			: "Kierunek tekstu:",
		langDirLTR		: "Od lewej do prawej",
		langDirRTL		: "Od prawej do lewej",
		acccessKey		: "Klawisz dostępu:",
		name			: "Nazwa:",
		langCode		: "Kod języka:",
		tabIndex		: "Indeks klawisza Tab:",
		advisoryTitle	: "Tytuł pomocniczy:",
		advisoryContentType	: "Typ treści tytułu pomocniczego:",
		cssClasses		: "Klasy arkusza stylów:",
		charset			: "Zestaw znaków dowiązanego zasobu:",
		styles			: "Styl:",
		rel			: "Relacja",
		selectAnchor	: "Wybierz zakotwiczenie",
		anchorName		: "Według nazwy zakotwiczenia",
		anchorId		: "Według identyfikatora elementu",
		emailAddress	: "Adres e-mail",
		emailSubject	: "Temat wiadomości",
		emailBody		: "Treść wiadomości",
		noAnchors		: "W dokumencie nie są dostępne żadne zakładki. Kliknij ikonę Wstaw zakładkę dokumentu.",
		noUrl			: "Wpisz adres URL odsyłacza",
		noEmail			: "Wpisz adres e-mail"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "Wstaw zakładkę dokumentu",
		menu		: "Edytuj zakładkę dokumentu",
		title		: "Zakładka dokumentu",
		name		: "Nazwa:",
		errorName	: "Wprowadź nazwę zakładki dokumentu",
		remove		: "Usuń zakładkę dokumentu"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "Właściwości listy numerowanej",
		bulletedTitle		: "Właściwości listy wypunktowanej",
		type				: "Typ",
		start				: "Uruchom",
		validateStartNumber				:"Numer początkowy listy musi być liczbą całkowitą.",
		circle				: "Okrąg",
		disc				: "Koło",
		square				: "Kwadrat",
		none				: "Brak",
		notset				: "<not set>",
		armenian			: "Numeracja ormiańska",
		georgian			: "Numeracja gruzińska (an, ban, gan itd.)",
		lowerRoman			: "Małe cyfry rzymskie (i, ii, iii, iv, v itd.)",
		upperRoman			: "Wielkie cyfry rzymskie (I, II, III, IV, V itd.)",
		lowerAlpha			: "Małe litery alfabetu (a, b, c, d, e itd.)",
		upperAlpha			: "Wielkie litery alfabetu (A, B, C, D, E itd.)",
		lowerGreek			: "Małe litery greckie (alpha, beta, gamma itd.)",
		decimal				: "Liczby dziesiętne (1, 2, 3 itd.)",
		decimalLeadingZero	: "Liczby dziesiętne z zerem wiodącym (01, 02, 03 itd.)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "Znajdowanie i zastępowanie",
		find				: "Znajdź",
		replace				: "Zastąp",
		findWhat			: "Znajdź:",
		replaceWith			: "Zastąp przez:",
		notFoundMsg			: "Nie znaleziono określonego tekstu.",
		noFindVal			: 'Wymagany jest tekst do wyszukania.',
		findOptions			: "Opcje znajdowania",
		matchCase			: "Rozróżniaj wielkość liter",
		matchWord			: "Szukaj całych słów",
		matchCyclic			: "Szukaj od początku",
		replaceAll			: "Zastąp wszystkie",
		replaceSuccessMsg	: "Zastąpiono następującą liczbę wystąpień: %1."
	},

	// Table Dialog
	table :
	{
		toolbar		: "Wstaw tabelę",
		title		: "Tabela",
		menu		: "Właściwości tabeli",
		deleteTable	: "Usuń tabelę",
		rows		: "Wiersze:",
		columns		: "Kolumny:",
		border		: "Wielkość ramki:",
		widthPx		: "piks.",
		widthPc		: "%",
		widthUnit	: "Jednostka szerokości:",
		cellSpace	: "Odstępy między komórkami:",
		cellPad		: "Dopełnianie komórek:",
		caption		: "Tytuł:",
		summary		: "Podsumowanie:",
		headers		: "Nagłówki:",
		headersNone		: "Brak",
		headersColumn	: "Pierwsza kolumna",
		headersRow		: "Pierwszy wiersz",
		headersBoth		: "Oba",
		invalidRows		: "Liczba wierszy musi być wyrażona liczbą całkowitą większą niż zero.",
		invalidCols		: "Liczba kolumn musi być wyrażona liczbą całkowitą większą niż zero.",
		invalidBorder	: "Wielkość ramki musi być wyrażona liczbą dodatnią.",
		invalidWidth	: "Szerokość tabeli musi być wyrażona liczbą dodatnią.",
		invalidHeight	: "Wysokość tabeli musi być wyrażona liczbą dodatnią.",
		invalidCellSpacing	: "Odstępy między komórkami muszą być wyrażone liczbą dodatnią.",
		invalidCellPadding	: "Dopełnianie komórek musi być wyrażone liczbą dodatnią.",

		cell :
		{
			menu			: "Komórka",
			insertBefore	: "Wstaw komórkę przed",
			insertAfter		: "Wstaw komórkę po",
			deleteCell		: "Usuń komórki",
			merge			: "Scal komórki",
			mergeRight		: "Scal w prawo",
			mergeDown		: "Scal w dół",
			splitHorizontal	: "Podziel komórkę poziomo",
			splitVertical	: "Podziel komórkę pionowo",
			title			: "Właściwości komórki",
			cellType		: "Typ komórki:",
			rowSpan			: "Zakres wierszy:",
			colSpan			: "Zakres kolumn:",
			wordWrap		: "Zawijanie słów:",
			hAlign			: "Wyrównanie w poziomie:",
			vAlign			: "Wyrównanie w pionie:",
			alignBaseline	: "Do linii podstawowej",
			bgColor			: "Kolor tła:",
			borderColor		: "Kolor krawędzi:",
			data			: "Dane",
			header			: "Nagłówek",
			yes				: "Tak",
			no				: "Nie",
			invalidWidth	: "Szerokość komórki musi być wyrażona liczbą dodatnią.",
			invalidHeight	: "Wysokość komórki musi być wyrażona liczbą dodatnią.",
			invalidRowSpan	: "Zakres wierszy musi być wyrażony dodatnią liczbą całkowitą.",
			invalidColSpan	: "Zakres kolumn musi być wyrażony dodatnią liczbą całkowitą.",
			chooseColor : "Wybierz kolor"
		},

		row :
		{
			menu			: "Wiersz",
			insertBefore	: "Wstaw wiersz przed",
			insertAfter		: "Wstaw wiersz po",
			deleteRow		: "Usuń wiersze"
		},

		column :
		{
			menu			: "Kolumna",
			insertBefore	: "Wstaw kolumnę przed",
			insertAfter		: "Wstaw kolumnę po",
			deleteColumn	: "Usuń kolumny"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "Właściwości przycisku",
		text		: "Tekst (wartość):",
		type		: "Typ:",
		typeBtn		: "Przycisk",
		typeSbm		: "Wyślij",
		typeRst		: "Wyczyść"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "Właściwości pola wyboru",
		radioTitle	: "Właściwości przełącznika",
		value		: "Wartość:",
		selected	: "Wybrane"
	},

	// Form Dialog.
	form :
	{
		title		: "Wstaw formularz",
		menu		: "Właściwości formularza",
		action		: "Działanie:",
		method		: "Metoda:",
		encoding	: "Kodowanie:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "Wybór właściwości pola",
		selectInfo	: "Informacje o wyborze",
		opAvail		: "Dostępne opcje",
		value		: "Wartość:",
		size		: "Wielkość:",
		lines		: "wier.",
		chkMulti	: "Zezwalaj na wybór wielokrotny",
		opText		: "Tekst:",
		opValue		: "Wartość:",
		btnAdd		: "Dodaj",
		btnModify	: "Modyfikuj",
		btnUp		: "W górę",
		btnDown		: "W dół",
		btnSetValue : "Ustaw jako wybraną wartość",
		btnDelete	: "Usuń"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "Właściwości obszaru tekstowego",
		cols		: "Kolumny:",
		rows		: "Wiersze:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "Właściwości pola tekstowego",
		name		: "Nazwa:",
		value		: "Wartość:",
		charWidth	: "Szerokość znaku:",
		maxChars	: "Maksymalna liczba znaków:",
		type		: "Typ:",
		typeText	: "Tekst",
		typePass	: "Hasło"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "Właściwości ukrytego pola",
		name	: "Nazwa:",
		value	: "Wartość:"
	},

	// Image Dialog.
	image :
	{
		title		: "Obraz",
		titleButton	: "Właściwości przycisku z obrazem",
		menu		: "Właściwości obrazu...",
		infoTab	: "Informacje o obrazie",
		btnUpload	: "Wyślij do serwera",
		upload	: "Prześlij",
		alt		: "Tekst alternatywny:",
		lockRatio	: "Zachowaj proporcje",
		resetSize	: "Resetuj wielkość",
		border	: "Ramka:",
		hSpace	: "Odstęp w poziomie:",
		vSpace	: "Odstęp w pionie:",
		alertUrl	: "Wpisz adres URL obrazu",
		linkTab	: "Odsyłacz",
		button2Img	: "Czy przekształcić wybrany przycisk z obrazem w zwykły obraz?",
		img2Button	: "Czy przekształcić wybrany obraz w przycisk z obrazem?",
		urlMissing : "Brak adresu URL źródła obrazu.",
		validateBorder : "Wartość Ramka musi być wyrażona dodatnią liczbą całkowitą.",
		validateHSpace : "Odstęp w poziomie musi być wyrażony dodatnią liczbą całkowitą.",
		validateVSpace : "Odstęp w pionie musi być wyrażony dodatnią liczbą całkowitą."
	},

	// Flash Dialog
	flash :
	{
		properties		: "Właściwości dokumentu Flash",
		propertiesTab	: "Właściwości",
		title		: "Dokument Flash",
		chkPlay		: "Automatyczne odtwarzanie",
		chkLoop		: "Pętla",
		chkMenu		: "Włącz menu dokumentu Flash",
		chkFull		: "Zezwalaj na tryb pełnoekranowy",
 		scale		: "Skala:",
		scaleAll		: "Pokaż wszystko",
		scaleNoBorder	: "Bez krawędzi",
		scaleFit		: "Dokładne dopasowanie",
		access			: "Dostęp do skryptu:",
		accessAlways	: "Zawsze",
		accessSameDomain	: "Ta sama domena",
		accessNever	: "Nigdy",
		alignAbsBottom: "Do dołu (bezwzględnie)",
		alignAbsMiddle: "Wyśrodkuj (bezwzględnie)",
		alignBaseline	: "Do linii podstawowej",
		alignTextTop	: "Do góry tekstu",
		quality		: "Jakość:",
		qualityBest	: "Najwyższa",
		qualityHigh	: "Wysoka",
		qualityAutoHigh	: "Automatyczna wysoka",
		qualityMedium	: "Średnia",
		qualityAutoLow	: "Automatyczna niska",
		qualityLow	: "Niska",
		windowModeWindow	: "Okno",
		windowModeOpaque	: "Nieprzezroczyste",
		windowModeTransparent	: "Przezroczyste",
		windowMode	: "Tryb okna:",
		flashvars	: "Zmienne:",
		bgcolor	: "Kolor tła:",
		hSpace	: "Odstęp w poziomie:",
		vSpace	: "Odstęp w pionie:",
		validateSrc : "Adres URL nie może być pusty.",
		validateHSpace : "Odstęp w poziomie musi być wyrażony dodatnią liczbą całkowitą.",
		validateVSpace : "Odstęp w pionie musi być wyrażony dodatnią liczbą całkowitą."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "Sprawdzanie pisowni",
		title			: "Sprawdzanie pisowni",
		notAvailable	: "Niestety, ta usługa jest teraz niedostępna.",
		errorLoading	: "Błąd podczas ładowania hosta usługi aplikacji: %s.",
		notInDic		: "Nie ma w słowniku",
		changeTo		: "Zmień na",
		btnIgnore		: "Ignoruj",
		btnIgnoreAll	: "Ignoruj wszystkie",
		btnReplace		: "Zastąp",
		btnReplaceAll	: "Zastąp wszystkie",
		btnUndo			: "Cofnij",
		noSuggestions	: "- Brak sugestii -",
		progress		: "Trwa sprawdzanie pisowni...",
		noMispell		: "Zakończono sprawdzanie pisowni: brak błędów pisowni",
		noChanges		: "Zakończono sprawdzanie pisowni: nie zmieniono żadnych słów",
		oneChange		: "Zakończono sprawdzanie pisowni: zmieniono jedno słowo",
		manyChanges		: "Zakończono sprawdzanie pisowni: liczba zmienionych słów: %1",
		ieSpellDownload	: "Narzędzie sprawdzania pisowni nie zostało zainstalowane. Czy pobrać je teraz?"
	},

	smiley :
	{
		toolbar	: "Wstaw emotikon",
		title	: "Emotikony",
		options : "Opcje emotikonów"
	},

	elementsPath :
	{
		eleLabel : "Ścieżka elementów",
		eleTitle : "Element %1"
	},

	numberedlist : "Lista numerowana",
	bulletedlist : "Lista wypunktowana",
	indent : "Zwiększ wcięcie",
	outdent : "Zmniejsz wcięcie",

	bidi :
	{
		ltr : "Od lewej do prawej",
		rtl : "Od prawej do lewej",
	},

	justify :
	{
		left : "Wyrównaj do lewej",
		center : "Wyśrodkuj",
		right : "Wyrównaj do prawej",
		block : "Wyrównaj"
	},

	blockquote : "Cytat blokowy",

	clipboard :
	{
		title		: "Wklej",
		cutError	: "Ustawienia zabezpieczeń przeglądarki uniemożliwiają automatyczne wycinanie. Zamiast tego naciśnij klawisze Ctrl+X na klawiaturze.",
		copyError	: "Ustawienia zabezpieczeń przeglądarki uniemożliwiają automatyczne kopiowanie. Zamiast tego naciśnij klawisze Ctrl+C na klawiaturze.",
		pasteMsg	: "Aby wkleić treść, naciśnij klawisze Ctrl+V (Cmd+V na komputerze MAC).",
		securityMsg	: "Zabezpieczenia przeglądarki blokują możliwość bezpośredniego wklejania zawartości schowka.",
		pasteArea	: "Obszar wklejania"
	},

	pastefromword :
	{
		confirmCleanup	: "Wklejany tekst prawdopodobnie został skopiowany z programu Word. Czy wyczyścić go przed wklejeniem?",
		toolbar			: "Wklej specjalne",
		title			: "Wklej specjalne",
		error			: "Nie można wyczyścić wklejanych danych z powodu błędu wewnętrznego."
	},

	pasteText :
	{
		button	: "Wklej jako zwykły tekst",
		title	: "Wklejanie jako zwykły tekst"
	},

	templates :
	{
		button 			: "Szablony",
		title : "Szablony treści",
		options : "Opcje szablonu",
		insertOption: "Zastąp bieżącą treść",
		selectPromptMsg: "Wybierz szablon, który ma zostać otwarty w edytorze",
		emptyListMsg : "(nie zdefiniowano szablonów)"
	},

	showBlocks : "Pokaż bloki",

	stylesCombo :
	{
		label		: "Style",
		panelTitle 	: "Style",
		panelTitle1	: "Style blokowe",
		panelTitle2	: "Style wstawiane",
		panelTitle3	: "Style obiektów"
	},

	format :
	{
		label		: "Format",
		panelTitle	: "Format akapitu",

		tag_p		: "Normalny",
		tag_pre		: "Formatowany",
		tag_address	: "Adres",
		tag_h1		: "Nagłówek 1",
		tag_h2		: "Nagłówek 2",
		tag_h3		: "Nagłówek 3",
		tag_h4		: "Nagłówek 4",
		tag_h5		: "Nagłówek 5",
		tag_h6		: "Nagłówek 6",
		tag_div		: "Normalny (DIV)"
	},

	div :
	{
		title				: "Tworzenie kontenera Div",
		toolbar				: "Tworzenie kontenera Div",
		cssClassInputLabel	: "Klasy arkusza stylów",
		styleSelectLabel	: "Styl",
		IdInputLabel		: "Identyfikator",
		languageCodeInputLabel	: " Kod języka",
		inlineStyleInputLabel	: "Styl wstawiany",
		advisoryTitleInputLabel	: "Tytuł pomocniczy",
		langDirLabel		: "Kierunek tekstu",
		langDirLTRLabel		: "Od lewej do prawej",
		langDirRTLLabel		: "Od prawej do lewej",
		edit				: "Edytuj kontener Div",
		remove				: "Usuń kontener Div"
  	},

	iframe :
	{
		title		: "Właściwości i-ramki",
		toolbar		: "Wstaw i-ramkę",
		noUrl		: "Wpisz adres URL i-ramki",
		scrolling	: "Włącz paski przewijania",
		border		: "Pokaż krawędzie ramki"
	},

	font :
	{
		label		: "Czcionka",
		voiceLabel	: "Czcionka",
		panelTitle	: "Nazwa czcionki"
	},

	fontSize :
	{
		label		: "Wielkość",
		voiceLabel	: "Wielkość czcionki",
		panelTitle	: "Wielkość czcionki"
	},

	colorButton :
	{
		textColorTitle	: "Kolor tekstu",
		bgColorTitle	: "Kolor tła",
		panelTitle		: "Kolory",
		auto			: "Automatyczny",
		more			: "Więcej kolorów..."
	},

	colors :
	{
		"000" : "Czarny",
		"800000" : "Rdzawoczerwony",
		"8B4513" : "Brąz skórzany",
		"2F4F4F" : "Ciemny mysi",
		"008080" : "Zielonomodry",
		"000080" : "Granatowy",
		"4B0082" : "Indygo",
		"696969" : "Ciemnoszary",
		"B22222" : "Podpalana cegła",
		"A52A2A" : "Brązowy",
		"DAA520" : "Stare złoto",
		"006400" : "Ciemnozielony",
		"40E0D0" : "Turkusowy",
		"0000CD" : "Średni niebieski",
		"800080" : "Fioletowy",
		"808080" : "Szary",
		"F00" : "Czerwony",
		"FF8C00" : "Ciemnopomarańczowy",
		"FFD700" : "Złoty",
		"008000" : "Zielony",
		"0FF" : "Niebieskozielony",
		"00F" : "Niebieski",
		"EE82EE" : "Fiołkowy",
		"A9A9A9" : "Przyciemniony szary",
		"FFA07A" : "Jasnołososiowy",
		"FFA500" : "Pomarańczowy",
		"FFFF00" : "Żółty",
		"00FF00" : "Limonkowy",
		"AFEEEE" : "Bladoturkusowy",
		"ADD8E6" : "Jasnoniebieski",
		"DDA0DD" : "Śliwkowy",
		"D3D3D3" : "Jasnoszary",
		"FFF0F5" : "Lawendoworóżowy",
		"FAEBD7" : "Biel antyczna",
		"FFFFE0" : "Jasnożółty",
		"F0FFF0" : "Miodowy",
		"F0FFFF" : "Lazurowy",
		"F0F8FF" : "Bladoniebieski",
		"E6E6FA" : "Lawendowy",
		"FFF" : "Biały"
	},

	scayt :
	{
		title			: "Sprawdzanie pisowni podczas pisania",
		opera_title		: "Nieobsługiwane przez przeglądarkę Opera",
		enable			: "Włącz sprawdzanie pisowni podczas pisania",
		disable			: "Wyłącz sprawdzanie pisowni podczas pisania",
		about			: "Informacje o sprawdzaniu pisowni podczas pisania",
		toggle			: "Przełącz sprawdzanie pisowni podczas pisania",
		options			: "Opcje",
		langs			: "Języki",
		moreSuggestions	: "Więcej sugestii",
		ignore			: "Ignoruj",
		ignoreAll		: "Ignoruj wszystkie",
		addWord			: "Dodaj słowo",
		emptyDic		: "Nazwa słownika nie może być pusta.",

		optionsTab		: "Opcje",
		allCaps			: "Ignoruj słowa zapisane wyłącznie wielkimi literami",
		ignoreDomainNames : "Ignoruj nazwy domen",
		mixedCase		: "Ignoruj słowa zapisane wielkimi i małymi literami",
		mixedWithDigits	: "Ignoruj słowa z cyframi",

		languagesTab	: "Języki",

		dictionariesTab	: "Słowniki",
		dic_field_name	: "Nazwa słownika",
		dic_create		: "Utwórz",
		dic_restore		: "Odtwórz",
		dic_delete		: "Usuń",
		dic_rename		: "Zmień nazwę",
		dic_info		: "Początkowo słownik użytkownika jest zapisywany w informacji cookie. Jednak wielkość informacji cookie jest ograniczona. Gdy słownik użytkownika zostanie rozbudowany i nie będzie można go zapisać w informacji cookie, można zapisać słownik na naszym serwerze. Aby zapisać własny słownik na naszym serwerze, należy podać nazwę słownika. Jeśli słownik jest już zapisany, należy wpisać jego nazwę i kliknąć przycisk Odtwórz.",

		aboutTab		: "Informacje"
	},

	about :
	{
		title		: "Informacje o edytorze CKEditor",
		dlgTitle	: "Informacje o edytorze CKEditor",
		help	: "Pomoc można znaleźć w następującym miejscu: $1.",
		userGuide : "Podręcznik użytkownika edytora CKEditor",
		moreInfo	: "Informacje licencyjne można znaleźć w serwisie WWW:",
		copy		: "Copyright &copy; $1. Wszelkie prawa zastrzeżone."
	},

	maximize : "Maksymalizuj",
	minimize : "Minimalizuj",

	fakeobjects :
	{
		anchor	: "Zakotwiczenie",
		flash	: "Animacja Flash",
		iframe		: "i-ramka",
		hiddenfield	: "Ukryte pole",
		unknown	: "Nieznany obiekt"
	},

	resize : "Przeciągnij, aby zmienić wielkość",

	colordialog :
	{
		title		: "Wybór koloru",
		options	:	"Opcje koloru",
		highlight	: "Podświetl",
		selected	: "Wybrany kolor",
		clear		: "Wyczyść"
	},

	toolbarCollapse	: "Zwiń pasek narzędzi",
	toolbarExpand	: "Rozwiń pasek narzędzi",

	toolbarGroups :
	{
		document : "Dokument",
		clipboard : "Schowek/Cofnij",
		editing : "Edytowanie",
		forms : "Formularze",
		basicstyles : "Podstawowe style",
		paragraph : "Akapit",
		links : "Odsyłacze",
		insert : "Wstaw",
		styles : "Style",
		colors : "Kolory",
		tools : "Narzędzia"
	},

	bidi :
	{
		ltr : "Przekształć w tekst czytany od lewej do prawej",
		rtl : "Przekształć w tekst czytany od prawej do lewej"
	},

	docprops :
	{
		label : "Właściwości dokumentu",
		title : "Właściwości dokumentu",
		design : "Projektowanie",
		meta : "Metaznaczniki",
		chooseColor : "Wybierz kolor",
		other : "Inne...",
		docTitle :	"Tytuł strony",
		charset : 	"Kodowanie zestawu znaków",
		charsetOther : "Inne kodowanie zestawu znaków",
		charsetASCII : "ASCII",
		charsetCE : "Środkowoeuropejski",
		charsetCT : "Chiński tradycyjny (Big5)",
		charsetCR : "Cyrylica",
		charsetGR : "Grecki",
		charsetJP : "Japoński",
		charsetKR : "Koreański",
		charsetTR : "Turecki",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "Zachodnioeuropejski",
		docType : "Nagłówek typu dokumentu",
		docTypeOther : "Inny nagłówek typu dokumentu",
		xhtmlDec : "Dołącz deklaracje XHTML",
		bgColor : "Kolor tła",
		bgImage : "Adres URL obrazu tła",
		bgFixed : "Tło nieprzewijane (stałe)",
		txtColor : "Kolor tekstu",
		margin : "Marginesy strony",
		marginTop : "Górny",
		marginLeft : "Lewy",
		marginRight : "Prawy",
		marginBottom : "Dolny",
		metaKeywords : "Słowa kluczowe indeksowania dokumentu (rozdzielane przecinkami)",
		metaDescription : "Opis dokumentu",
		metaAuthor : "Autor",
		metaCopyright : "Copyright",
		previewHtml : "<p>To jest <strong>przykładowy tekst</strong>. Używasz edytora <a href=\"javascript:void(0)\">CKEditor</a>.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "\"",
			widthCm	: "cm",
			widthMm	: "mm",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "pkt",
			widthPc	: "pc"
		},
		table :
		{
			heightUnit	: "Jednostka wysokości:",
			insertMultipleRows : "Wstawianie wierszy",
			insertMultipleCols : "Wstawianie kolumn",
			noOfRows : "Liczba wierszy:",
			noOfCols : "Liczba kolumn:",
			insertPosition : "Pozycja:",
			insertBefore : "Przed",
			insertAfter : "Po",
			selectTable : "Wybierz tabelę",
			selectRow : "Wybierz wiersz",
			columnTitle : "Kolumna",
			colProps : "Właściwości kolumny",
			invalidColumnWidth	: "Szerokość kolumny musi być wyrażona liczbą dodatnią."
		},
		cell :
		{
			title : "Komórka"
		},
		emoticon :
		{
			angel		: "Anioł",
			angry		: "Złość",
			cool		: "Cwaniak",
			crying		: "Płacz",
			eyebrow		: "Uniesienie brwi",
			frown		: "Niezadowolenie",
			goofy		: "Niezdarność",
			grin		: "Szeroki uśmiech",
			half		: "Zniesmaczenie",
			idea		: "Pomysł",
			laughing	: "Śmiech",
			laughroll	: "Tarzanie się ze śmiechu",
			no			: "Nie",
			oops		: "Oj",
			shy			: "Nieśmiałość",
			smile		: "Uśmiech",
			tongue		: "Pokazywanie języka",
			wink		: "Mrugnięcie",
			yes			: "Tak"
		},

		menu :
		{
			link	: "Wstaw odsyłacz",
			list	: "Lista",
			paste	: "Wklej",
			action	: "Działanie",
			align	: "Wyrównaj",
			emoticon: "Emotikon"
		},

		iframe :
		{
			title	: "i-ramka"
		},

		list:
		{
			numberedTitle		: "Lista numerowana",
			bulletedTitle		: "Lista wypunktowana"
		},

		// Anchor dialog
		anchor :
		{
			description	: "Wpisz opisową nazwę zakładki (np. Sekcja 1.2). Po wstawieniu zakładki kliknij ikonę Odsyłacz lub Odsyłacz do zakładki dokumentu, aby utworzyć odsyłacz do tej zakładki.",
			title		: "Odsyłacz do zakładki dokumentu",
			linkTo		: "Odsyłacz do:"
		},

		urllink :
		{
			title : "Adres URL odsyłacza",
			linkText : "Tekst odsyłacza:",
			selectAnchor: "Wybierz zakotwiczenie:",
			nourl: "Wprowadź adres URL w polu tekstowym.",
			urlhelp: "Wpisz lub wklej adres URL, który ma zostać otwarty, gdy użytkownicy klikną ten odsyłacz, na przykład http://www.przyklad.com.",
			displaytxthelp: "Wpisz tekst, który ma zostać wyświetlony dla odsyłacza.",
			openinnew : "Otwórz odsyłacz w nowym oknie"
		},

		spellchecker :
		{
			title : "Sprawdzanie pisowni",
			replace : "Zastąp:",
			suggesstion : "Sugestie:",
			withLabel : "Przy użyciu:",
			replaceButton : "Zastąp",
			replaceallButton:"Zastąp wszystkie",
			skipButton:"Pomiń",
			skipallButton: "Pomiń wszystko",
			undochanges: "Cofnij zmiany",
			complete: "Zakończono sprawdzanie pisowni",
			problem: "Problem podczas pobierania danych XML",
			addDictionary: "Dodaj do słownika",
			editDictionary: "Edytuj słownik"
		},

		status :
		{
			keystrokeForHelp: "Naciśnij klawisze ALT+0 w celu uzyskania pomocy"
		},

		linkdialog :
		{
			label : "Okno dialogowe odsyłacza"
		},

		image :
		{
			previewText : "Tekst będzie opływał dodawany obraz tak jak w tym przykładzie."
		}
	}

};

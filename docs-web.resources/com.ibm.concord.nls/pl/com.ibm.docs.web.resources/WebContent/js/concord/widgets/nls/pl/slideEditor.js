/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

({
	ctxMenu_createSlide: 	"Utwórz slajd",
	ctxMenu_renameSlide: 	"Zmień nazwę slajdu",
	ctxMenu_deleteSlide: 	"Usuń slajd",
	ctxMenu_selectAll: 	 	"Wybierz wszystko",
	ctxMenu_createTextBox: 	"Dodaj pole tekstowe",
	ctxMenu_addImage:	 	"Dodaj obraz",		
	ctxMenu_createTable: 	"Utwórz tabelę",
	ctxMenu_slideTransition: "Przejścia slajdu",
	ctxMenu_slideTransitionTitle: "Wybór przejścia",
	ctxMenu_slideLayout: 	"Układ slajdu",
	ctxMenu_slideTemplates: "Style wzorcowe",
	ctxMenu_paste: 	 		"Wklej",
	ctxMenu_autoFix: 		"Automatyczna poprawka",
		
	imageDialog: {	
		titleInsert:		"Wstawianie obrazu",
		insertImageBtn:		"Wstaw",							
		URL:				"Adres URL:",
		uploadFromURL:		"Obraz z sieci WWW",
		imageGallery:		"Galeria obrazów",
		uploadAnImageFile:	"Obraz z pliku",
		uploadImageFileTitle: "Podaj obraz do załadowania z pliku",
		insertImageErrorP1: "Nie można wstawić obrazu do dokumentu.",
		insertImageErrorP2: "Wystąpił problem na serwerze, np. brak wystarczającej ilości miejsca na dysku.",
		insertImageErrorP3: "Poproś administratora o sprawdzenie dziennika serwera w celu zidentyfikowania problemu."
	},
	
	concordGallery:{
		results:		"Wyniki: ${0}",
		show:			"Pokaż:",
		all	:			"Wszystko",
		images:			"Obrazy",
		pictures: 		"Zdjęcia",
		arrows: 		"Strzałki",
		bullets: 		"Wypunktowanie",
		computer: 		"Komputer",
		diagram: 		"Diagram",
		education: 		"Edukacja",
		environment: 	"Środowisko",
		finance: 		"Finanse",
		people: 		"Ludzie",
		shape: 			"Kształty",
		symbol: 		"Symbole",
		transportation:	"Transport",
		table:			"Tabele",
		search:			"Szukaj",
		loading:		"Ładowanie..."
	},
	
	contentLockTitle: "Komunikat o blokadzie treści",
	contentLockMsg :  "Nie można wykonać operacji na niektórych wybranych obiektach, ponieważ te obiekty są aktualnie używane przez następujących użytkowników:",
	contentLockemail: "Adres e-mail",
	
	warningforRotatedShape: "Nie można wykonać operacji na niektórych wybranych obiektach, ponieważ te obiekty zostały obrócone.",
	
	cannotCreateShapesTitle: "Nie można utworzyć kształtów",
	cannotCreateShapesMessage: "Program ${productName} nie obsługuje tworzenia kształtów w przeglądarce Internet Explorer w wersjach wcześniejszych niż 9. Aby utworzyć kształty, użyj innej przeglądarki.",
	cannotShowShapesTitle: "Nie można wyświetlić kształtów",

	slidesInUse:"Używane slajdy",
	slidesInUseAll: "Nie można wykonać operacji na wybranych slajdach, ponieważ niektóre z nich są aktualnie używane przez następujących użytkowników:",
	slidesInUseSome: "Nie można wykonać operacji na niektórych wybranych slajdach, ponieważ slajdy te są aktualnie używane przez następujących użytkowników:",
	
	contentInUse:"Używana treść",
	contentInUseAll:"Nie można wykonać operacji na wybranej treści slajdu, ponieważ niektóra treść slajdu jest aktualnie używana przez następujących użytkowników:",
	contentInUseSome:"Nie można wykonać operacji na niektórej wybranej treści slajdu, ponieważ treść ta jest aktualnie używana przez następujących użytkowników:",
		
	undoContentNotAvailable: "Nie można wykonać operacji cofania, ponieważ treść nie jest już dostępna.",
	redoContentNotAvailable: "Nie można wykonać operacji ponawiania, ponieważ treść nie jest już dostępna.",
	undoContentAlreadyExist: "Nie można wykonać operacji cofania, ponieważ treść już istnieje." ,
	redoContentAlreadyExist: "Nie można wykonać operacji ponawiania, ponieważ treść już istnieje.",
	
	preventTemplateChange:"Używane slajdy",
	preventTemplateChangeMsg: "Nie można zmienić stylu wzorcowego, gdy inny użytkownik edytuje tę prezentację.",
	
	createTblTitle: 	"Tworzenie tabeli",
	createTblLabel: 	"Wprowadź liczbę wierszy i kolumn. Wartość maksymalna to 10.",
	createTblNumRows: "Liczba wierszy",
	createTblNumCols: "Liczba kolumn",
	createTblErrMsg:  "Upewnij się, że wartość jest pozytywną liczbą całkowitą, nie jest pusta i nie jest większa od 10.",

	insertTblRowTitle: 	"Wstawianie wierszy",
	insertTblRowNumberOfRows: 	"Liczba wierszy:",
	insertTblRowNumberPosition: 	"Pozycja:",
	insertTblRowAbove: 	"Powyżej",
	insertTblRowBelow: 	"Poniżej",
	
	insertTblColTitle: 	"Wstawianie kolumn",
	insertTblColNumberOfCols: 	"Liczba kolumn:",
	insertTblColNumberPosition: 	"Pozycja:",
	insertTblColBefore: "Przed",
	insertTblColAfter: 	"Po",
	
	insertVoicePosition: "Pozycja",
	
 	defaultText_newBox2: "Kliknij dwukrotnie, aby dodać tekst",	
	defaultText_newBox: "Kliknij, aby dodać tekst",
	defaultText_speakerNotesBox: "Kliknij, aby dodać uwagi",
	
	cannotAddComment_Title: "Nie można dodać komentarza",
	cannotAddComment_Content: "Nie można dołączyć komentarzy do tego pola treści lub slajdu. Pole treści lub slajd może obsługiwać co najwyżej następującą liczbę komentarzy: ${0}. ",
	
	invalidImageType: "Ten typ obrazu nie jest aktualnie obsługiwany. Przekształć obraz w plik .bmp, .jpg, .jpeg, .gif lub .png i spróbuj ponownie.",
	
	error_unableToDestroyTABContentsInDialog: "Nie można zniszczyć treści tabulacji w oknie dialogowym",
	colon:		":",
	tripleDot:	"...",
	ok: 		"OK",
	cancel:		"Anuluj",
	preparingSlide: "Przygotowywanie slajdu do edytowania",
	
	slideCommentClose: "Zamknij komentarz",
	slideCommentDone: "Gotowe",
	slideCommentPrev: "Wstecz",
	slideCommentNext: "Dalej"
})


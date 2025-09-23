/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2020                           */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */
define({
        PAGE_BREAK_TEXT: "Podział strony",
        SECTION_BREAK_TEXT: "Podział sekcji",
        LINE_BREAK_TEXT: "Podział wiersza",
        COLUMN_BREAK_TEXT: "Podział kolumny",
        INSERT_IMAGE_NOT_PROPER_PLACE: "Obrazy można dodawać tylko w tekście i tabelach, nie można dodać obrazu w tym miejscu.",
        LOADING: "Trwa ładowanie treści.",
        LOAD_FINISHED: "Zakończono ładowanie treści.",
        PAGE_SETUP: "Ustawienia strony",
        NOTE_INVALIDACTION_FOOTNOTE: "To nie jest poprawne działanie dla przypisu.",
        NOTE_INVALIDACTION_ENDNOTE: "To nie jest poprawne działanie dla przypisu końcowego.",
        PAGENUMBER_OF_TOTALNUMBER: "Strona ${0} z ${1}", //page 1 of N
        PAGE_NUMBER: "Strona: ${pageNumber} / ${totalPageNumber}",
        toc: {
            title: "Spis treści",
            update: "Aktualizuj",
            del: "Usuń",
            toc: "Spis treści",
            linkTip: "Naciśnij klawisz Ctrl i kliknij, aby przejść",
            linkTip_Mac: "Naciśnij klawisz \u2318 i kliknij, aby przejść",
            pageNumber: "Tylko numer strony",
            entireTable: "Cała tabela"
        },
        link: {
            addlink: "Dodaj odsyłacz",
            gotolink: "Otwórz odsyłacz",
            unlink: "Usuń odsyłacz",
            editlink: "Edytuj odsyłacz",
            internalLink: "Odsyłacz wewnętrzny",
            ctrlLink: "Naciśnij klawisz Ctrl i kliknij, aby przejść do odsyłacza",
            ctrlLink_Mac: "Naciśnij klawisz \u2318 i kliknij, aby przejść do odsyłacza",
            cannotOpen: " nie może zostać otwarty z poziomu produktu ${productName}."
        },
        field: {
            update: "Aktualizuj pole"
        },
        insertTime: "Wstawianie czasu",
        insertDate: "Wstawianie daty",
        selectDate: "Wybierz datę",
        selectTime: "Wybierz godzinę",
        acc_blank: "pusta", // when selection is nothing but space char and empty paragraph
        acc_space: "spacja", // string read out when the cursor is before one space char
        acc_inLink: "w odsyłaczu ",
        acc_inField: "w polu ",
        acc_selected: " wybrane",
        acc_inTable: "w wierszu ${0} kolumnie ${1} tabeli ",
        acc_imageSelected: "wybrana grafika",
        acc_canvasSelected: "wybrany kształt",
        acc_textboxSelected: "wybrane pole tekstowe",
        ACC_TABLE_TABLESIZE: "Wybrano następującą liczbę wierszy ${0} i kolumn ${1}",
        ACC_TABLE_MAXSIZE: " Obsługiwana maksymalna wielkość tabeli to 20*20",
        ACC_headerFooterMode: "tryb edycji nagłówka i stopki",
        ACC_EditorMode: "tryb edycji edytora",
        ACC_FootnotesMode: "tryb edycji przypisów",
        ACC_EndnotesMode: "tryb edycji przypisów końcowych",
        ACC_uniformTable: "Dodano nowy wiersz",
        Acc_column: "kolumna ${0}",
        acc_page: "strona ${0}",
        acc_section: "sekcja ${0}",
        acc_spellWarn: "niepoprawna pisownia",
        acc_outTable: "poza tabelą",
        acc_link: "odsyłacz",
        acc_field: "pole",
        acc_footnote: "przypis",
        acc_endnote: "przypis końcowy",
        acc_editor: "Edytujący: ${0}",
        tablePropertyTitle: "Właściwości tabeli",
        headerTitle: "Nagłówek",
        footerTitle: "Stopka",
        firstheaderTitle: "Nagłówek pierwszej strony",
        firstfooterTitle: "Stopka pierwszej strony",
        evenheaderTitle: "Nagłówek strony parzystej",
        evenfooterTitle: "Stopka strony parzystej",
        oddheaderTitle: "Nagłówek strony nieparzystej",
        oddfooterTitle: "Stopka strony nieparzystej",
        showTableBorder: "Pokaż granice tabeli",
        list_none: "Brak",
        SET_NUMBERING_VALUE: "Ustaw wartość numeracji",
        BIDI_CONTENT_EDITING: "Tan dokument zawiera treść dwukierunkową. Aby ten dokument był poprawnie obsługiwany, należy włączyć obsługę języków dwukierunkowych w preferencjach produktu HCL Connections."
});

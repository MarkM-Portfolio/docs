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
        PAGE_BREAK_TEXT: "Oldaltörés",
        SECTION_BREAK_TEXT: "Szakasztörés",
        LINE_BREAK_TEXT: "Sortörés",
        COLUMN_BREAK_TEXT: "Hasábtörés",
        INSERT_IMAGE_NOT_PROPER_PLACE: "Sajnáljuk, képek csak a törzsszöveghez és -táblázatokhoz adhatók hozzá, az aktuális helyen azonban nem.",
        LOADING: "A tartalom betöltése folyamatban van.",
        LOAD_FINISHED: "A tartalom betöltődött.",
        PAGE_SETUP: "Oldalbeállítás",
        NOTE_INVALIDACTION_FOOTNOTE: "Ez a művelet lábjegyzeteken nem hajtható végre.",
        NOTE_INVALIDACTION_ENDNOTE: "Ez a művelet végjegyzeteken nem hajtható végre.",
        PAGENUMBER_OF_TOTALNUMBER: "${0}. oldal, összesen: ${1}", //page 1 of N
        PAGE_NUMBER: "Oldal: ${pageNumber} / ${totalPageNumber}",
        toc: {
            title: "Tartalomjegyzék",
            update: "Frissítés",
            del: "Törlés",
            toc: "Tartalomjegyzék",
            linkTip: "Továbblépéshez kattintson a CTRL billentyűt lenyomva.",
            linkTip_Mac: "\u2318 kattintson ide a továbblépéshez",
            pageNumber: "Csak oldalszám",
            entireTable: "Teljes táblázat"
        },
        link: {
            addlink: "Hivatkozás hozzáadása",
            gotolink: "Hivatkozás megnyitása",
            unlink: "Hivatkozás eltávolítása",
            editlink: "Hivatkozás szerkesztése",
            internalLink: "Belső hivatkozás",
            ctrlLink: "A hivatkozás megnyitásához kattintson rá a Ctrl billentyűt lenyomva tartva",
            ctrlLink_Mac: "\u2318Kattintson ide a hivatkozás megnyitásához",
            cannotOpen: " nem lehet megnyitni a(z) ${productName} alkalmazásból."
        },
        field: {
            update: "Mező frissítése"
        },
        insertTime: "Időpont beszúrása",
        insertDate: "Dátum beszúrása",
        selectDate: "Dátum kiválasztása",
        selectTime: "Idő kiválasztása",
        acc_blank: "üres", // when selection is nothing but space char and empty paragraph
        acc_space: "szóköz", // string read out when the cursor is before one space char
        acc_inLink: "hivatkozásban ",
        acc_inField: "mezőben ",
        acc_selected: " kijelölve",
        acc_inTable: "a táblázat ${0}. sorában a(z) ${1}. oszlopban ",
        acc_imageSelected: "ábra kijelölve",
        acc_canvasSelected: "alakzat kijelölve",
        acc_textboxSelected: "szövegdoboz kijelölve",
        ACC_TABLE_TABLESIZE: "${0} sort és ${1} oszlopot jelölt ki",
        ACC_TABLE_MAXSIZE: " A támogatott legnagyobb táblázatméret 20*20",
        ACC_headerFooterMode: "fejléc-/láblécszerkesztési mód",
        ACC_EditorMode: "szerkesztői szerkesztés mód",
        ACC_FootnotesMode: "lábjegyzet-szerkesztési mód",
        ACC_EndnotesMode: "végjegyzet-szerkesztési mód",
        ACC_uniformTable: "Egy új sort adott hozzá",
        Acc_column: "${0}. oszlop",
        acc_page: "${0}. oldal",
        acc_section: "${0}. szakasz",
        acc_spellWarn: "helyesírási hiba",
        acc_outTable: "táblázaton kívüli tartomány",
        acc_link: "hivatkozás",
        acc_field: "mező",
        acc_footnote: "lábjegyzet",
        acc_endnote: "végjegyzet",
        acc_editor: "Szerkesztő: ${0}",
        tablePropertyTitle: "Táblázat tulajdonságai",
        headerTitle: "Fejléc",
        footerTitle: "Lábléc",
        firstheaderTitle: "Első oldal fejléce",
        firstfooterTitle: "Első oldal lábléce",
        evenheaderTitle: "Páros oldal fejléce",
        evenfooterTitle: "Páros oldal lábléce",
        oddheaderTitle: "Páratlan oldal fejléce",
        oddfooterTitle: "Páratlan oldal lábléce",
        showTableBorder: "Táblázat határainak megjelenítése",
        list_none: "Nincs",
        SET_NUMBERING_VALUE: "Számozási érték beállítása",
        BIDI_CONTENT_EDITING: "Ez a dokumentum kétirányú tartalommal rendelkezik. A dokumentum megfelelő működéséhez kapcsolja be a kétirányú támogatást az HCL Connections beállításaiban."
});

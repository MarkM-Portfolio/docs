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
        PAGE_BREAK_TEXT: "Prelom strani",
        SECTION_BREAK_TEXT: "Prelom odseka",
        LINE_BREAK_TEXT: "Prelom vrstice",
        COLUMN_BREAK_TEXT: "Prelom stolpca",
        INSERT_IMAGE_NOT_PROPER_PLACE: "Žal je slike mogoče dodati samo v telo besedila in tabele, ne na trenutno lokacijo.",
        LOADING: "Vsebina se nalaga.",
        LOAD_FINISHED: "Nalaganje vsebine je končano.",
        PAGE_SETUP: "Nastavitev strani",
        NOTE_INVALIDACTION_FOOTNOTE: "To ni veljavno dejanje za sprotno opombo.",
        NOTE_INVALIDACTION_ENDNOTE: "To ni veljavno dejanje za končno opombo.",
        PAGENUMBER_OF_TOTALNUMBER: "Stran ${0} od ${1}", //page 1 of N
        PAGE_NUMBER: "Stran: ${pageNumber} / ${totalPageNumber}",
        toc: {
            title: "Kazalo",
            update: "Posodobi",
            del: "Izbriši",
            toc: "Kazalo",
            linkTip: "Za krmarjenje pritisnite Ctrl in kliknite",
            linkTip_Mac: "Za krmarjenje kliknite \u2318",
            pageNumber: "Samo številka strani",
            entireTable: "Celotna tabela"
        },
        link: {
            addlink: "Dodaj povezavo",
            gotolink: "Odpri povezavo",
            unlink: "Odstrani povezavo",
            editlink: "Uredi povezavo",
            internalLink: "Interna povezava",
            ctrlLink: "Povezavo odprete s Ctrl+klikom",
            ctrlLink_Mac: "Povezavo odprete tako, da kliknete \u2318",
            cannotOpen: " ni mogoče odpreti iz izdelka ${productName}."
        },
        field: {
            update: "Posodobitev ni uspela"
        },
        insertTime: "Vstavi čas",
        insertDate: "Vstavi datum",
        selectDate: "Izberi datum",
        selectTime: "Izberi čas",
        acc_blank: "prazno", // when selection is nothing but space char and empty paragraph
        acc_space: "presledek", // string read out when the cursor is before one space char
        acc_inLink: "v povezavi ",
        acc_inField: "v polju ",
        acc_selected: " izbrano",
        acc_inTable: "v tabeli v vrstici ${0} stolpcu ${1} ",
        acc_imageSelected: "izbrana grafika",
        acc_canvasSelected: "izbrana oblika",
        acc_textboxSelected: "izbrano besedilno polje",
        ACC_TABLE_TABLESIZE: "Izbrali ste naslednje št. vrstic: ${0}, stolpcev: ${1}",
        ACC_TABLE_MAXSIZE: " Največja podprta velikost tabele je 20*20",
        ACC_headerFooterMode: "glava noga način za urejanje",
        ACC_EditorMode: "urejevalnik način za urejanje",
        ACC_FootnotesMode: "sprotne opombe način za urejanje",
        ACC_EndnotesMode: "končne opombe način za urejanje",
        ACC_uniformTable: "Dodana je nova vrstica",
        Acc_column: "stolpec ${0}",
        acc_page: "stran  ${0}",
        acc_section: "odsek  ${0}",
        acc_spellWarn: "črkovanje je nepravilno",
        acc_outTable: "izven tabele",
        acc_link: "povezava",
        acc_field: "polje",
        acc_footnote: "sprotna opomba",
        acc_endnote: "končna opomba",
        acc_editor: "Uredil ${0}",
        tablePropertyTitle: "Lastnosti tabele",
        headerTitle: "Glava",
        footerTitle: "Noga",
        firstheaderTitle: "Glava na prvi strani",
        firstfooterTitle: "Noga na prvi strani",
        evenheaderTitle: "Glava na sodi strani",
        evenfooterTitle: "Noga na sodi strani",
        oddheaderTitle: "Glava na lihi strani",
        oddfooterTitle: "Noga na lihi strani",
        showTableBorder: "Prikaži meje tabel",
        list_none: "Brez",
        SET_NUMBERING_VALUE: "Nastavi vrednost oštevilčevanja",
        BIDI_CONTENT_EDITING: "Ta dokument vsebuje vsebino v dvosmernem jeziku. Za pravilno delo s tem dokumentom vključite v preferencah programa HCL Connections podporo za dvosmerne jezike."
});

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
        PAGE_BREAK_TEXT: "Prijelom stranice",
        SECTION_BREAK_TEXT: "Prijelom odlomka",
        LINE_BREAK_TEXT: "Prijelom reda",
        COLUMN_BREAK_TEXT: "Prijelom stupca",
        INSERT_IMAGE_NOT_PROPER_PLACE: "Žao nam je, slike se mogu dodati samo u tijelu teksta i u tablicama, a ne na trenutnoj lokaciji.",
        LOADING: "Sadržaj se učitava.",
        LOAD_FINISHED: "Učitavanje sadržaja je završeno.",
        PAGE_SETUP: "Postavi stranicu",
        NOTE_INVALIDACTION_FOOTNOTE: "Ovo nije važeća akcija za fusnotu.",
        NOTE_INVALIDACTION_ENDNOTE: "Ovo nije važeća akcija za bilješku na kraju.",
        PAGENUMBER_OF_TOTALNUMBER: "Stranica ${0} od ${1}", //page 1 of N
        PAGE_NUMBER: "Stranica: ${pageNumber} / ${totalPageNumber}",
        toc: {
            title: "Tablica sadržaja",
            update: "Ažuriraj",
            del: "Izbriši",
            toc: "Tablica sadržaja",
            linkTip: "Ctrl klik za odlazak",
            linkTip_Mac: "\u2318 kliknite za navigaciju",
            pageNumber: "Samo broj stranice",
            entireTable: "Čitava tablica"
        },
        link: {
            addlink: "Dodaj vezu",
            gotolink: "Otvori vezu",
            unlink: "Ukloni vezu",
            editlink: "Uredi vezu",
            internalLink: "Interna veza",
            ctrlLink: "Ctrl+klik za prelazak na vezu",
            ctrlLink_Mac: "\u2318Kliknite za prelazak na vezu",
            cannotOpen: " se ne može otvoriti u ${productName}."
        },
        field: {
            update: "Ažuriraj polje"
        },
        insertTime: "Umetni vrijeme",
        insertDate: "Umetni datum",
        selectDate: "Izaberi datum",
        selectTime: "Izaberi vrijeme",
        acc_blank: "prazno mjesto", // when selection is nothing but space char and empty paragraph
        acc_space: "razmak", // string read out when the cursor is before one space char
        acc_inLink: "u vezi ",
        acc_inField: "u polju ",
        acc_selected: " izabrano",
        acc_inTable: "u redu tablice ${0}, stupcu ${1} ",
        acc_imageSelected: "izabrana slika",
        acc_canvasSelected: "izabrani oblik",
        acc_textboxSelected: "izabrani tekst okvir",
        ACC_TABLE_TABLESIZE: "Izabrali ste ${0} redova, ${1} stupaca",
        ACC_TABLE_MAXSIZE: " Maksimalna podržana veličina tablice je 20*20",
        ACC_headerFooterMode: "način uređivanja zaglavlja podnožja",
        ACC_EditorMode: "način uređivanja editora",
        ACC_FootnotesMode: "način uređivanja fusnote",
        ACC_EndnotesMode: "način uređivanja bilješke",
        ACC_uniformTable: "Dodan je novi red",
        Acc_column: "stupac  ${0}",
        acc_page: "stranica  ${0}",
        acc_section: "odlomak  ${0}",
        acc_spellWarn: "pogreške u pravopisu",
        acc_outTable: "izvan tablice",
        acc_link: "veza",
        acc_field: "polje",
        acc_footnote: "fusnota",
        acc_endnote: "bilješka",
        acc_editor: "Uredio ${0}",
        tablePropertyTitle: "Svojstva tablice",
        headerTitle: "Zaglavlje",
        footerTitle: "Donje zaglavlje",
        firstheaderTitle: "Zaglavlje prve stranice",
        firstfooterTitle: "Podnožje prve stranice",
        evenheaderTitle: "Zaglavlje parne stranice",
        evenfooterTitle: "Podnožje parne stranice",
        oddheaderTitle: "Zaglavlje neparne stranice",
        oddfooterTitle: "Podnožje neparne stranice",
        showTableBorder: "Pokaži granice tablice",
        list_none: "Ništa",
        SET_NUMBERING_VALUE: "Postavi vrijednost numeriranja",
        BIDI_CONTENT_EDITING: "Ovaj dokument sadrži dvosmjerni sadržaj. Da biste mogli pravilno raditi s ovim dokumentom, uključite podršku za dvosmjerni sadržaj u preferencama HCL Connectionsa."
});

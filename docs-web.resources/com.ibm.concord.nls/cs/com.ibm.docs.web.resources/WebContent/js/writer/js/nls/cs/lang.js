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
        PAGE_BREAK_TEXT: "Zalomení stránky",
        SECTION_BREAK_TEXT: "Zalomení oddílu",
        LINE_BREAK_TEXT: "Zalomení řádku",
        COLUMN_BREAK_TEXT: "Zalomení sloupce",
        INSERT_IMAGE_NOT_PROPER_PLACE: "Litujeme, obrázky lze přidávat pouze do základního textu a tabulek, nikoli na aktuální místo. ",
        LOADING: "Probíhá načítání obsahu.",
        LOAD_FINISHED: "Načítání obsahu bylo dokončeno.",
        PAGE_SETUP: "Nastavení stránky",
        NOTE_INVALIDACTION_FOOTNOTE: "Tato akce je pro poznámku pod čarou neplatná.",
        NOTE_INVALIDACTION_ENDNOTE: "Tato akce je pro vysvětlivky neplatná.",
        PAGENUMBER_OF_TOTALNUMBER: "Stránka ${0} z ${1}", //page 1 of N
        PAGE_NUMBER: "Stránka: ${pageNumber} / ${totalPageNumber}",
        toc: {
            title: "Obsah",
            update: "Aktualizovat",
            del: "Odstranit",
            toc: "Obsah",
            linkTip: "Chcete-li provést přechod, podržte klávesu Ctrl a klepněte.",
            linkTip_Mac: "Chcete-li provést přechod, podržte klávesu \u2318 a klepněte.",
            pageNumber: "Pouze číslo stránky",
            entireTable: "Celá tabulka"
        },
        link: {
            addlink: "Přidat odkaz",
            gotolink: "Otevřít odkaz",
            unlink: "Odebrat odkaz",
            editlink: "Upravit odkaz",
            internalLink: "Interní odkaz",
            ctrlLink: "Odkaz lze aktivovat akcí Ctrl+klepnutí.",
            ctrlLink_Mac: "Odkaz lze aktivovat akcí \u2318+klepnutí.",
            cannotOpen: " nelze otevřít z produktu ${productName}."
        },
        field: {
            update: "Aktualizovat pole"
        },
        insertTime: "Vložit čas",
        insertDate: "Vložit datum",
        selectDate: "Vybrat datum",
        selectTime: "Vybrat čas",
        acc_blank: "prázdné", // when selection is nothing but space char and empty paragraph
        acc_space: "mezera", // string read out when the cursor is before one space char
        acc_inLink: "v odkazu ",
        acc_inField: "v poli ",
        acc_selected: " vybrané",
        acc_inTable: "v tabulce na řádku ${0} ve sloupci ${1} ",
        acc_imageSelected: "vybraná grafika",
        acc_canvasSelected: "vybraný tvar",
        acc_textboxSelected: "vybrané textové pole",
        ACC_TABLE_TABLESIZE: "Vybrali jste ${0} řádků, ${1} sloupců",
        ACC_TABLE_MAXSIZE: " Maximální podporovaná velikost tabulky je 20*20",
        ACC_headerFooterMode: "režim úprav záhlaví/zápatí",
        ACC_EditorMode: "režim úprav editoru",
        ACC_FootnotesMode: "režim úprav poznámek pod čarou",
        ACC_EndnotesMode: "režim úprav vysvětlivek",
        ACC_uniformTable: "Byl přidán nový řádek",
        Acc_column: "sloupec  ${0}",
        acc_page: "stránka  ${0}",
        acc_section: "oddíl  ${0}",
        acc_spellWarn: "pravopis je chybný",
        acc_outTable: "mimo tabulku",
        acc_link: "odkaz",
        acc_field: "pole",
        acc_footnote: "poznámka pod čarou",
        acc_endnote: "vysvětlivka",
        acc_editor: "Upravil: ${0}",
        tablePropertyTitle: "Vlastnosti tabulky",
        headerTitle: "Záhlaví",
        footerTitle: "Zápatí",
        firstheaderTitle: "Záhlaví první stránky",
        firstfooterTitle: "Zápatí první stránky",
        evenheaderTitle: "Záhlaví sudých stránek",
        evenfooterTitle: "Zápatí sudých stránek",
        oddheaderTitle: "Záhlaví lichých stránek",
        oddfooterTitle: "Zápatí lichých stránek",
        showTableBorder: "Zobrazit hranice tabulky",
        list_none: "Žádná položka",
        SET_NUMBERING_VALUE: "Nastavit hodnotu číslování",
        BIDI_CONTENT_EDITING: "Tento dokument zahrnuje obousměrný obsah. Aby byl dokument zpracován správně, zapněte v předvolbách produktu HCL Connections obousměrná podporu."
});

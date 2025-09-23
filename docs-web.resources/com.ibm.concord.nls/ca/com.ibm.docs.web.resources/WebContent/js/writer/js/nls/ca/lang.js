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
        PAGE_BREAK_TEXT: "Salt de pàgina",
        SECTION_BREAK_TEXT: "Salt de secció",
        LINE_BREAK_TEXT: "Salt de línia",
        COLUMN_BREAK_TEXT: "Salt de columna",
        INSERT_IMAGE_NOT_PROPER_PLACE: "Ho sentim, les imatges només es poden afegir al text del cos i a les taules, no a la ubicació actual. ",
        LOADING: "El contingut s'està carregant.",
        LOAD_FINISHED: "El contingut s'ha acabat de carregar.",
        PAGE_SETUP: "Configuració de la pàgina",
        NOTE_INVALIDACTION_FOOTNOTE: "Aquesta no és una acció vàlida per a una nota a peu de pàgina.",
        NOTE_INVALIDACTION_ENDNOTE: "Aquesta no és una acció vàlida per a una nota final.",
        PAGENUMBER_OF_TOTALNUMBER: "Pàgina ${0} de ${1}", //page 1 of N
        PAGE_NUMBER: "Pàgina: ${pageNumber} / ${totalPageNumber}",
        toc: {
            title: "Taula de contingut",
            update: "Actualitza",
            del: "Suprimeix",
            toc: "Taula de contingut",
            linkTip: "Feu clic amb la tecla Ctrl premuda per navegar",
            linkTip_Mac: "Feu clic a \u2318 per navegar",
            pageNumber: "Només número de pàgina",
            entireTable: "Taula sencera"
        },
        link: {
            addlink: "Afegeix un enllaç",
            gotolink: "Obre enllaç",
            unlink: "Elimina enllaç",
            editlink: "Edita enllaç",
            internalLink: "Enllaç intern",
            ctrlLink: "Ctrl+Clic per anar a l'enllaç",
            ctrlLink_Mac: "Feu clic a \u2318 per anar a l'enllaç",
            cannotOpen: " no es pot obrir des de l'${productName}."
        },
        field: {
            update: "Actualitza el camp"
        },
        insertTime: "Insereix hora",
        insertDate: "Insereix data",
        selectDate: "Selecciona data",
        selectTime: "Selecciona hora",
        acc_blank: "en blanc", // when selection is nothing but space char and empty paragraph
        acc_space: "espai", // string read out when the cursor is before one space char
        acc_inLink: "a l'enllaç ",
        acc_inField: "en el camp ",
        acc_selected: " seleccionat",
        acc_inTable: "a la fila ${0} i columna ${1} de la taula ",
        acc_imageSelected: "gràfic seleccionat",
        acc_canvasSelected: "forma seleccionada",
        acc_textboxSelected: "quadre de text seleccionat",
        ACC_TABLE_TABLESIZE: "Ha seleccionat ${0} files, ${1} columnes",
        ACC_TABLE_MAXSIZE: " El tamany màxim de taula suportat és de 20*20",
        ACC_headerFooterMode: "modalitat d'edició de peu i capçalera de pàgina",
        ACC_EditorMode: "modalitat d'edició de l'editor",
        ACC_FootnotesMode: "modalitat d'edició de notes a peu de pàgina",
        ACC_EndnotesMode: "modalitat d'edició de notes al final",
        ACC_uniformTable: "S'ha afegit una nova línea",
        Acc_column: "columna ${0}",
        acc_page: "pàgina ${0}",
        acc_section: "secció ${0}",
        acc_spellWarn: "l'ortografia no és correcta",
        acc_outTable: "fora de la taula",
        acc_link: "enllaç",
        acc_field: "camp",
        acc_footnote: "nota a peu de pàgina",
        acc_endnote: "nota al final",
        acc_editor: "Edició per ${0}",
        tablePropertyTitle: "Propietats de la taula",
        headerTitle: "Capçalera",
        footerTitle: "Peu de pàgina",
        firstheaderTitle: "Capçalera de la primera pàgina",
        firstfooterTitle: "Peu de la primera pàgina",
        evenheaderTitle: "Capçalera de pàgina parell",
        evenfooterTitle: "Peu de pàgina parell",
        oddheaderTitle: "Capçalera de pàgina senar",
        oddfooterTitle: "Peu de pàgina senar",
        showTableBorder: "Mostrar límits de la taula",
        list_none: "Cap",
        SET_NUMBERING_VALUE: "Defineix valor de numeració",
        BIDI_CONTENT_EDITING: "Aquest document té contingut bidireccional. Per poder treballar amb aquest document sense problemes ha d'habilitar el suport bidireccional en les preferències d'HCL Connections."
});

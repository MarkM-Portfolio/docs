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
        PAGE_BREAK_TEXT: "Seitenumbruch",
        SECTION_BREAK_TEXT: "Abschnittsumbruch",
        LINE_BREAK_TEXT: "Zeilenumbruch",
        COLUMN_BREAK_TEXT: "Spaltenumbruch",
        INSERT_IMAGE_NOT_PROPER_PLACE: "Bilder können leider nur in den Haupttext und in Tabellen hinzugefügt werden, nicht an der aktuellen Position.",
        LOADING: "Der Inhalt wird geladen.",
        LOAD_FINISHED: "Der Inhalt wurde vollständig geladen.",
        PAGE_SETUP: "Seite einrichten",
        NOTE_INVALIDACTION_FOOTNOTE: "Diese Aktion ist für Fußnoten nicht gültig.",
        NOTE_INVALIDACTION_ENDNOTE: "Die Aktion ist für Endnoten nicht gültig.",
        PAGENUMBER_OF_TOTALNUMBER: "Seite ${0} von ${1}", //page 1 of N
        PAGE_NUMBER: "Seite: ${pageNumber}/${totalPageNumber}",
        toc: {
            title: "Inhaltsverzeichnis",
            update: "Aktualisieren",
            del: "Löschen",
            toc: "Inhaltsverzeichnis",
            linkTip: "Halten Sie beim Klicken die Strg-Taste gedrückt, um zu navigieren",
            linkTip_Mac: "Halten Sie beim Klicken \u2318 gedrückt, um zu navigieren",
            pageNumber: "Nur Seitenzahl",
            entireTable: "Gesamte Tabelle"
        },
        link: {
            addlink: "Link hinzufügen",
            gotolink: "Link öffnen",
            unlink: "Verknüpfung entfernen",
            editlink: "Link bearbeiten",
            internalLink: "Interner Link",
            ctrlLink: "Strg+Klick, um den Link aufzurufen",
            ctrlLink_Mac: "\u2318Klicken, um den Link aufzurufen",
            cannotOpen: " kann nicht in ${productName} geöffnet werden."
        },
        field: {
            update: "Feld aktualisieren"
        },
        insertTime: "Uhrzeit einfügen",
        insertDate: "Datum einfügen",
        selectDate: "Datum auswählen",
        selectTime: "Uhrzeit auswählen",
        acc_blank: "leer", // when selection is nothing but space char and empty paragraph
        acc_space: "Bereich", // string read out when the cursor is before one space char
        acc_inLink: "in Link ",
        acc_inField: "in Feld ",
        acc_selected: " ausgewählt",
        acc_inTable: "in Tabellenzeile ${0} Spalte ${1} ",
        acc_imageSelected: "ausgewählte Abbildung",
        acc_canvasSelected: "ausgewählte Form",
        acc_textboxSelected: "ausgewähltes Textfeld",
        ACC_TABLE_TABLESIZE: "Sie haben ${0} Zeilen, ${1} Spalten ausgewählt",
        ACC_TABLE_MAXSIZE: " Die maximal unterstützte Tabellengröße beträgt 20x20",
        ACC_headerFooterMode: "Bearbeitungsmodus für Kopf- und Fußzeile",
        ACC_EditorMode: "Bearbeitungsmodus für Editoren",
        ACC_FootnotesMode: "Bearbeitungsmodus für Fußnoten",
        ACC_EndnotesMode: "Bearbeitungsmodus für Endnoten",
        ACC_uniformTable: "Es wird eine neue Zeile hinzugefügt",
        Acc_column: "Spalte  ${0}",
        acc_page: "Seite  ${0}",
        acc_section: "Abschnitt  ${0}",
        acc_spellWarn: "Die Rechtschreibung ist falsch",
        acc_outTable: "außerhalb der Tabelle",
        acc_link: "Link",
        acc_field: "Feld",
        acc_footnote: "Fußnote",
        acc_endnote: "Endnote",
        acc_editor: "Bearbeitung von ${0}",
        tablePropertyTitle: "Tabelleneigenschaften",
        headerTitle: "Kopfzeile",
        footerTitle: "Fußzeile",
        firstheaderTitle: "Kopfzeile der ersten Seite",
        firstfooterTitle: "Fußzeile der ersten Seite",
        evenheaderTitle: "Kopfzeile von geraden Seiten",
        evenfooterTitle: "Fußzeile von geraden Seiten",
        oddheaderTitle: "Kopfzeile für ungerade Seiten",
        oddfooterTitle: "Fußzeile für ungerade Seiten",
        showTableBorder: "Tabellengrenzen anzeigen",
        list_none: "Kein(e)",
        SET_NUMBERING_VALUE: "Zählwert festlegen",
        BIDI_CONTENT_EDITING: "Dieses Dokument enthält bidirektionale Inhalte. Aktivieren Sie die bidirektionale Unterstützung in den Voreinstellungen von HCL Connections an, um ordnungsgemäß arbeiten zu können."
});

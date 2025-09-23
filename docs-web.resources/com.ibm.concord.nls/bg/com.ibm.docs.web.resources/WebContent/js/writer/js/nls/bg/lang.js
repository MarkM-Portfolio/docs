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
        PAGE_BREAK_TEXT: "Нова страница",
        SECTION_BREAK_TEXT: "Нов раздел",
        LINE_BREAK_TEXT: "Нов ред",
        COLUMN_BREAK_TEXT: "Нова колона",
        INSERT_IMAGE_NOT_PROPER_PLACE: "Съжаляваме, изображенията могат да бъдат добавяни само в основен текст и таблици, а не в текущото местоположение.",
        LOADING: "Съдържанието се зарежда.",
        LOAD_FINISHED: "Зареждането на съдържанието е приключено.",
        PAGE_SETUP: "Настройка на страница",
        NOTE_INVALIDACTION_FOOTNOTE: "Това не е валидно действие за бележки под линия.",
        NOTE_INVALIDACTION_ENDNOTE: "Това не е валидно действие за бележки в края.",
        PAGENUMBER_OF_TOTALNUMBER: "Страница ${0} от ${1}", //page 1 of N
        PAGE_NUMBER: "Страница: ${pageNumber} / ${totalPageNumber}",
        toc: {
            title: "Съдържание",
            update: "Актуализиране",
            del: "Изтриване",
            toc: "Съдържание",
            linkTip: "Ctrl щракване за навигиране",
            linkTip_Mac: "\u2318 щракване за навигиране",
            pageNumber: "Само номер на страница",
            entireTable: "Цялата таблица"
        },
        link: {
            addlink: "Добавяне на връзка",
            gotolink: "Отваряне на връзка",
            unlink: "Премахване на връзка",
            editlink: "Редактиране на връзка",
            internalLink: "Вътрешна връзка",
            ctrlLink: "Ctrl + щракване за отиване към връзката",
            ctrlLink_Mac: "\u2318 Щракване за отиване към връзката",
            cannotOpen: " не може да бъде отворен от ${productName}."
        },
        field: {
            update: "Обновяване на поле"
        },
        insertTime: "Вмъкване на час",
        insertDate: "Вмъкване на дата",
        selectDate: "Избор на дата",
        selectTime: "Избор на час",
        acc_blank: "празен", // when selection is nothing but space char and empty paragraph
        acc_space: "шпация", // string read out when the cursor is before one space char
        acc_inLink: "във връзка ",
        acc_inField: "в поле ",
        acc_selected: " избрани",
        acc_inTable: "в ред на таблица ${0} колона ${1} ",
        acc_imageSelected: "избрана графика",
        acc_canvasSelected: "избрана фигура",
        acc_textboxSelected: "избрано текстово поле",
        ACC_TABLE_TABLESIZE: "Избрали сте ${0} реда, ${1} колони",
        ACC_TABLE_MAXSIZE: " Поддържаният максимален размер на таблицата е 20*20",
        ACC_headerFooterMode: "режим на редактиране на горен и долен колонтитул",
        ACC_EditorMode: "режим на редактиране от редактор",
        ACC_FootnotesMode: "режим на редактиране на бележки под линия",
        ACC_EndnotesMode: "режим на редактиране на бележки в края",
        ACC_uniformTable: "Добавен е нов ред",
        Acc_column: "колона  ${0}",
        acc_page: "страница  ${0}",
        acc_section: "раздел  ${0}",
        acc_spellWarn: "правописът не е правилен",
        acc_outTable: "извън таблицата",
        acc_link: "връзка",
        acc_field: "поле",
        acc_footnote: "бележка под линия",
        acc_endnote: "бележка в края",
        acc_editor: "Редакция от ${0}",
        tablePropertyTitle: "Свойства на таблица",
        headerTitle: "Заглавна част",
        footerTitle: "Долен колонтитул",
        firstheaderTitle: "Горен колонтитул на първа страница",
        firstfooterTitle: "Долен колонтитул на първа страница",
        evenheaderTitle: "Горен колонтитул на четна страница",
        evenfooterTitle: "Долен колонтитул на четна страница",
        oddheaderTitle: "Горен колонтитул на нечетна страница",
        oddfooterTitle: "Долен колонтитул на нечетна страница",
        showTableBorder: "Показване на границите на таблицата",
        list_none: "Няма",
        SET_NUMBERING_VALUE: "Задайте стойност за номериране",
        BIDI_CONTENT_EDITING: "Този документ включва двупосочно съдържание. За да работите правилно с този документ, включете двупосочната поддръжка във Вашите предпочитания за HCL Connections."
});

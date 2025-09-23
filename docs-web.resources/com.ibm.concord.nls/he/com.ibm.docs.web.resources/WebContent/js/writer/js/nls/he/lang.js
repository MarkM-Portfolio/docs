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
        PAGE_BREAK_TEXT: "מעבר עמוד",
        SECTION_BREAK_TEXT: "מעבר חלק",
        LINE_BREAK_TEXT: "מעבר שורה",
        COLUMN_BREAK_TEXT: "מעבר עמודה",
        INSERT_IMAGE_NOT_PROPER_PLACE: "אפשר להוסיף תמונות רק בתמליל הגוף ובטבלאות, לא במיקום הנוכחי. ",
        LOADING: "התוכן נטען.",
        LOAD_FINISHED: "טעינת התוכן הסתיימה.",
        PAGE_SETUP: "הגדרות עמוד",
        NOTE_INVALIDACTION_FOOTNOTE: "זו אינה פעולה חוקית עבור הערת שוליים.",
        NOTE_INVALIDACTION_ENDNOTE: "זו אינה פעולה חוקית עבור הערת סיום.",
        PAGENUMBER_OF_TOTALNUMBER: "עמוד ${0} מתוך ${1}", //page 1 of N
        PAGE_NUMBER: "עמוד: ${pageNumber} / ${totalPageNumber}",
        toc: {
            title: "תוכן עניינים",
            update: "עדכון",
            del: "מחיקה",
            toc: "תוכן עניינים",
            linkTip: "Ctrl+לחיצה לניווט",
            linkTip_Mac: "\u2318 לחיצה לניווט",
            pageNumber: "מספר עמוד בלבד",
            entireTable: "הטבלה כולה"
        },
        link: {
            addlink: "הוספת קישור",
            gotolink: "פתיחת הקישור",
            unlink: "סילוק קישור",
            editlink: "עריכת קישור",
            internalLink: "קישור פנימי",
            ctrlLink: "Ctrl+לחיצה כדי לעבור לקישור",
            ctrlLink_Mac: "\u2318 לחיצה כדי לעבור לקישור",
            cannotOpen: " אינו מאפשר פתיחה מתוך ${productName}."
        },
        field: {
            update: "עדכון שדה"
        },
        insertTime: "הוספת שעה",
        insertDate: "הוספת תאריך",
        selectDate: "בחירת תאריך",
        selectTime: "בחירת שעה",
        acc_blank: "ריק", // when selection is nothing but space char and empty paragraph
        acc_space: "רווח", // string read out when the cursor is before one space char
        acc_inLink: "בקישור ",
        acc_inField: "בשדה ",
        acc_selected: " נבחר",
        acc_inTable: "בטבלה שורה ${0} עמודה ${1} ",
        acc_imageSelected: "נבחרה גרפיקה",
        acc_canvasSelected: "נבחרה צורה",
        acc_textboxSelected: "נבחרה תיבת תמליל",
        ACC_TABLE_TABLESIZE: "בחרתם ${0} שורות, ${1} עמודות",
        ACC_TABLE_MAXSIZE: " גודל הטבלה המרבי הנתמך הוא 20*20",
        ACC_headerFooterMode: "מצב עריכה של כותרת עליונה/תחתונה",
        ACC_EditorMode: "מצב עריכה של העורך",
        ACC_FootnotesMode: "מצב עריכה של הערות שוליים",
        ACC_EndnotesMode: "מצב עריכה של הערות סיום",
        ACC_uniformTable: "שורה חדשה נוספה",
        Acc_column: "עמודה ${0}",
        acc_page: "עמוד ${0}",
        acc_section: "חלק ${0}",
        acc_spellWarn: "האיות נכון",
        acc_outTable: "מחוץ לטבלה",
        acc_link: "קישור",
        acc_field: "שדה",
        acc_footnote: "הערת שוליים",
        acc_endnote: "הערת סיום",
        acc_editor: "עריכה על ידי ${0}",
        tablePropertyTitle: "תכונות טבלה",
        headerTitle: "כותרת עליונה",
        footerTitle: "כותרת תחתונה",
        firstheaderTitle: "כותרת עליונה בעמוד ראשון",
        firstfooterTitle: "כותרת תחתונה בעמוד ראשון",
        evenheaderTitle: "כותרת עליונה בעמוד זוגי",
        evenfooterTitle: "כותרת תחתונה בעמוד זוגי",
        oddheaderTitle: "כותרת עליונה בעמוד אי-זוגי",
        oddfooterTitle: "כותרת תחתונה בעמוד אי-זוגי",
        showTableBorder: "הצגת גבולות טבלה",
        list_none: "ללא",
        SET_NUMBERING_VALUE: "הגדרת ערך מספור",
        BIDI_CONTENT_EDITING: "המסמך מכיל תמליל דו-כיווני. כדי לעבוד כהלכה עם מסמך זה הפעילו את התמיכה הדו-כיוונית בהעדפות HCL Connections.‏"
});

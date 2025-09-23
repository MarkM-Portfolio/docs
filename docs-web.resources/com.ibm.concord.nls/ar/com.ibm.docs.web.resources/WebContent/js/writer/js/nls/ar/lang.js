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
        PAGE_BREAK_TEXT: "فاصل الصفحة",
        SECTION_BREAK_TEXT: "فاصل القسم",
        LINE_BREAK_TEXT: "سطر فاصل",
        COLUMN_BREAK_TEXT: "عمود فاصل",
        INSERT_IMAGE_NOT_PROPER_PLACE: "عذرا، يمكن اضافة الصور فقط في النص الأساسي والجداول، وليس في المكان الحالي.",
        LOADING: "جاري تحميل المحتويات.",
        LOAD_FINISHED: "تم الانتهاء من تحميل المحتويات.",
        PAGE_SETUP: "اعداد الصفحة",
        NOTE_INVALIDACTION_FOOTNOTE: "هذا التصرف ليس صحيحا للمذكرة الطرفية.",
        NOTE_INVALIDACTION_ENDNOTE: "هذا التصرف ليس صحيحا للمذكرة النهائية.",
        PAGENUMBER_OF_TOTALNUMBER: "الصفحة ${0} من ${1}", //page 1 of N
        PAGE_NUMBER: "الصفحة: ${pageNumber} / ${totalPageNumber}",
        toc: {
            title: "قائمة المحتويات",
            update: "‏تعديل‏",
            del: "حذف",
            toc: "قائمة المحتويات",
            linkTip: "Ctrl ضغط للتجول",
            linkTip_Mac: "‏‎\u2318‎‏ اضغط للتجول",
            pageNumber: "رقم الصفحة فقط",
            entireTable: "الجدول بالكامل"
        },
        link: {
            addlink: "اضافة وصلة",
            gotolink: "فتح الوصلة",
            unlink: "ازالة وصلة",
            editlink: "تحرير وصلة",
            internalLink: "وصلة داخلية",
            ctrlLink: "Ctrl+ضغط لبدء الوصلة",
            ctrlLink_Mac: "‏‎\u2318‎‏اضغط للرجوع الى الوصلة",
            cannotOpen: " لا يمكن الفتح من ${productName}."
        },
        field: {
            update: "تحديث المجال"
        },
        insertTime: "ادراج وقت",
        insertDate: "ادراج تاريخ",
        selectDate: "تحديد التاريخ",
        selectTime: "تحديد الوقت",
        acc_blank: "فارغ", // when selection is nothing but space char and empty paragraph
        acc_space: "مساحة", // string read out when the cursor is before one space char
        acc_inLink: "في الوصلة ",
        acc_inField: "في مجال ",
        acc_selected: " محدد",
        acc_inTable: "في صف الجدول ${0} العمود ${1} ",
        acc_imageSelected: "الرسم البياني المحدد",
        acc_canvasSelected: "الشكل المحدد",
        acc_textboxSelected: "مربع النص المحدد",
        ACC_TABLE_TABLESIZE: "قد قمت بتحديد ${0} صفوف، ${1} أعمدة",
        ACC_TABLE_MAXSIZE: " الحد الأقصى لحجم الجدول الذي يتم دعمه هو 20*20",
        ACC_headerFooterMode: "نمط تحرير نص الطرف ونص الرأس",
        ACC_EditorMode: "نمط تحرير المحرر",
        ACC_FootnotesMode: "نمط تحرير المذكرات الطرفية",
        ACC_EndnotesMode: "نمط تحرير المذكرات النهائية",
        ACC_uniformTable: "تم اضافة صف جديد",
        Acc_column: "العمود  ${0}",
        acc_page: "الصفحة  ${0}",
        acc_section: "القسم  ${0}",
        acc_spellWarn: "الهجاء غير صحيح",
        acc_outTable: "خارج الجدول",
        acc_link: "وصلة",
        acc_field: "مجال",
        acc_footnote: "مذكرة طرفية",
        acc_endnote: "مذكرة طرفية ختامية",
        acc_editor: "تحرير بواسطة ${0}",
        tablePropertyTitle: "خصائص الجدول",
        headerTitle: "الرأس",
        footerTitle: "نص الطرف",
        firstheaderTitle: "نص رأس الصفحة الأولى",
        firstfooterTitle: "نص طرف الصفحة الأولى",
        evenheaderTitle: "نص رأس الصفحة الزوجية",
        evenfooterTitle: "نص طرف الصفحة زوجية",
        oddheaderTitle: "نص رأس الصفحة الفردية",
        oddfooterTitle: "نص طرف الصفحة الفردية",
        showTableBorder: "عرض حدود الجدول",
        list_none: "لا شيء",
        SET_NUMBERING_VALUE: "تحديد قيمة الترقيم",
        BIDI_CONTENT_EDITING: "هذه الوثيقة تتضمن محتويات ثنائية الاتجاه. للعمل مع هذه الوثيقة بطريقة مناسبة قم بتشغيل الدعم ثنائي الاتجاه في تفضيلات HCL Connections الخاصة بك."
});

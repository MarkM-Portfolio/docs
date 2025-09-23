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
        PAGE_BREAK_TEXT: "เส้นกั้นหน้า",
        SECTION_BREAK_TEXT: "เส้นกั้นส่วน",
        LINE_BREAK_TEXT: "เส้นกั้นบรรทัด",
        COLUMN_BREAK_TEXT: "เส้นกั้นคอลัมน์",
        INSERT_IMAGE_NOT_PROPER_PLACE: "ขออภัย สามารถเพิ่มรูปภาพในข้อความของเนื้อความและตารางเท่านั้น ไม่ใช่ในตำแหน่งปัจจุบัน",
        LOADING: "กำลังโหลดเนื้อหา",
        LOAD_FINISHED: "โหลดเนื้อหาเสร็จสิ้นแล้ว",
        PAGE_SETUP: "การตั้งค่าหน้ากระดาษ",
        NOTE_INVALIDACTION_FOOTNOTE: "ไม่ใช่การดำเนินการที่ถูกต้องสำหรับเชิงอรรถ",
        NOTE_INVALIDACTION_ENDNOTE: "ไม่ใช่การดำเนินการที่ถูกต้องสำหรับอ้างอิงท้ายเรื่อง",
        PAGENUMBER_OF_TOTALNUMBER: "หน้า ${0} จาก ${1}", //page 1 of N
        PAGE_NUMBER: "หน้า: ${pageNumber} / ${totalPageNumber}",
        toc: {
            title: "สารบัญ",
            update: "อัพเดต",
            del: "ลบ",
            toc: "สารบัญ",
            linkTip: "Ctrl คลิกเพื่อนำทาง",
            linkTip_Mac: "\u2318 คลิกเพื่อนำทาง",
            pageNumber: "เฉพาะหมายเลขหน้าเท่านั้น",
            entireTable: "ตารางทั้งหมด"
        },
        link: {
            addlink: "เพิ่มลิงก์",
            gotolink: "เปิดลิงก์",
            unlink: "ลบลิงก์",
            editlink: "แก้ไขลิงก์",
            internalLink: "ลิงก์ภายใน",
            ctrlLink: "Ctrl+Click เพื่อไปที่ลิงก์",
            ctrlLink_Mac: "\u2318คลิกเพื่อไปที่ลิงก์",
            cannotOpen: " ไม่สามารถเปิดจาก ${productName}"
        },
        field: {
            update: "อัพเดตฟิลด์"
        },
        insertTime: "แทรกเวลา",
        insertDate: "แทรกวันที่",
        selectDate: "เลือกวันที่",
        selectTime: "เลือกเวลา",
        acc_blank: "ว่าง", // when selection is nothing but space char and empty paragraph
        acc_space: "ช่องว่าง", // string read out when the cursor is before one space char
        acc_inLink: "ในลิงก์ ",
        acc_inField: "ในฟิลด์ ",
        acc_selected: " ที่เลือก",
        acc_inTable: "ในแถว ${0} คอลัมน์ ${1} ของตาราง ",
        acc_imageSelected: "กราฟิกที่เลือก",
        acc_canvasSelected: "รูปทรงที่เลือก",
        acc_textboxSelected: "เท็กซ์บ็อกซ์ที่เลือก",
        ACC_TABLE_TABLESIZE: "คุณได้เลือก ${0} แถว, ${1} คอลัมน์",
        ACC_TABLE_MAXSIZE: " ขนาดตารางสูงสุดที่สนับสนุนคือ 20*20",
        ACC_headerFooterMode: "โหมดแก้ไขส่วนหัวและส่วนท้าย",
        ACC_EditorMode: "โหมดแก้ไขเอดิเตอร์",
        ACC_FootnotesMode: "โหมดแก้ไขเชิงอรรถ",
        ACC_EndnotesMode: "โหมดแก้ไข end notes",
        ACC_uniformTable: "เพิ่มแถวใหม่",
        Acc_column: "คอลัมน์  ${0}",
        acc_page: "เพจ  ${0}",
        acc_section: "ส่วน  ${0}",
        acc_spellWarn: "การสะกดคำไม่ถูกต้อง",
        acc_outTable: "นอกตาราง",
        acc_link: "link (ลิงก์)",
        acc_field: "ฟิลด์",
        acc_footnote: "เชิงอรรถ",
        acc_endnote: "อ้างอิงท้ายเรื่อง",
        acc_editor: "แก้ไขโดย ${0}",
        tablePropertyTitle: "คุณสมบัติตาราง",
        headerTitle: "ส่วนหัว",
        footerTitle: "ส่วนท้าย",
        firstheaderTitle: "ส่วนหัวหน้าแรก",
        firstfooterTitle: "ส่วนท้ายหน้าแรก",
        evenheaderTitle: "ส่วนหัวหน้าคู่",
        evenfooterTitle: "ส่วนท้ายหน้าคู่",
        oddheaderTitle: "ส่วนหัวหน้าคี่",
        oddfooterTitle: "ส่วนท้ายหน้าคี่",
        showTableBorder: "แสดงขอบเขตตาราง",
        list_none: "ไม่ได้กำหนด",
        SET_NUMBERING_VALUE: "ตั้งค่าตัวเลข",
        BIDI_CONTENT_EDITING: "เอกสารนี้มีเนื้อหาแบบสองทิศทาง เมื่อต้องการทำงานกับเอกสารนี้อย่างสมบูรณ์ ให้ปิดการสนับสนุนสองทิศทางในการกำหนดค่าตามความชอบ HCL Connections ของคุณ"
});

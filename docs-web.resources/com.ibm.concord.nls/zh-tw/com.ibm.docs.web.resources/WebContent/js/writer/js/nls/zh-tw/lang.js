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
        PAGE_BREAK_TEXT: "分頁",
        SECTION_BREAK_TEXT: "分節符號",
        LINE_BREAK_TEXT: "換行符號",
        COLUMN_BREAK_TEXT: "分欄符號",
        INSERT_IMAGE_NOT_PROPER_PLACE: "抱歉，只能在內文文字和表格中新增影像，不能在現行位置進行此操作。",
        LOADING: "內容載入中。",
        LOAD_FINISHED: "內容載入完成。",
        PAGE_SETUP: "頁面設定",
        NOTE_INVALIDACTION_FOOTNOTE: "沒有有效的註腳動作。",
        NOTE_INVALIDACTION_ENDNOTE: "沒有有效的章節附註動作。",
        PAGENUMBER_OF_TOTALNUMBER: "第 ${1} 之 ${0} 頁", //page 1 of N
        PAGE_NUMBER: "頁次：${pageNumber} / ${totalPageNumber}",
        toc: {
            title: "目錄",
            update: "更新",
            del: "刪除",
            toc: "目錄",
            linkTip: "Ctrl+按一下滑鼠按鈕可進行導覽",
            linkTip_Mac: "\u2318 按一下以導覽",
            pageNumber: "僅頁碼",
            entireTable: "整個表格"
        },
        link: {
            addlink: "新增鏈結",
            gotolink: "開啟鏈結",
            unlink: "移除鏈結",
            editlink: "編輯鏈結",
            internalLink: "內部鏈結",
            ctrlLink: "Ctrl+按一下滑鼠按鈕可前往鏈結",
            ctrlLink_Mac: "\u2318按一下以跳至鏈結",
            cannotOpen: " 無法從 ${productName} 開啟。"
        },
        field: {
            update: "更新欄位"
        },
        insertTime: "插入時間",
        insertDate: "插入日期",
        selectDate: "選取日期",
        selectTime: "選取時間",
        acc_blank: "空白", // when selection is nothing but space char and empty paragraph
        acc_space: "空格", // string read out when the cursor is before one space char
        acc_inLink: "在鏈結中",
        acc_inField: "在欄位中",
        acc_selected: " 已選取",
        acc_inTable: "在表格的第 ${0} 列，第 ${1} 欄 ",
        acc_imageSelected: "選取的圖形",
        acc_canvasSelected: "選取的形狀",
        acc_textboxSelected: "選取的文字框",
        ACC_TABLE_TABLESIZE: "您已選取 ${0} 列，${1} 欄",
        ACC_TABLE_MAXSIZE: " 支援的表格大小上限為 20*20",
        ACC_headerFooterMode: "頁首頁尾編輯模式",
        ACC_EditorMode: "編輯者編輯模式",
        ACC_FootnotesMode: "註腳編輯模式",
        ACC_EndnotesMode: "尾註編輯模式",
        ACC_uniformTable: "已新增一列",
        Acc_column: "欄 ${0}",
        acc_page: "頁 ${0}",
        acc_section: "章節 ${0}",
        acc_spellWarn: "拼字不正確",
        acc_outTable: "超出表格",
        acc_link: "鏈結",
        acc_field: "欄位",
        acc_footnote: "註腳",
        acc_endnote: "尾註",
        acc_editor: "依 ${0} 編輯",
        tablePropertyTitle: "表格內容",
        headerTitle: "頁首",
        footerTitle: "頁尾",
        firstheaderTitle: "第一頁頁首",
        firstfooterTitle: "最末頁頁尾",
        evenheaderTitle: "偶數頁頁首",
        evenfooterTitle: "偶數頁頁尾",
        oddheaderTitle: "奇數頁頁首",
        oddfooterTitle: "奇數頁頁尾",
        showTableBorder: "顯示表格邊界",
        list_none: "無",
        SET_NUMBERING_VALUE: "設定編號值",
        BIDI_CONTENT_EDITING: "此文件包含雙向內容。若要正確使用此文件，請在 HCL Connections 喜好設定中開啟雙向支援。"
});

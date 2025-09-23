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
        PAGE_BREAK_TEXT: "分页符",
        SECTION_BREAK_TEXT: "分节符",
        LINE_BREAK_TEXT: "换行符",
        COLUMN_BREAK_TEXT: "分栏符",
        INSERT_IMAGE_NOT_PROPER_PLACE: "非常抱歉，只能在正文文本和表格中添加图像，而不能在当前位置中添加图像。",
        LOADING: "正在装入内容。",
        LOAD_FINISHED: "已完成内容装入。",
        PAGE_SETUP: "页面设置",
        NOTE_INVALIDACTION_FOOTNOTE: "这是无效的脚注操作。",
        NOTE_INVALIDACTION_ENDNOTE: "这是无效的尾注操作。",
        PAGENUMBER_OF_TOTALNUMBER: "第 ${0} 页（共 ${1} 页）", //page 1 of N
        PAGE_NUMBER: "页面：${pageNumber} / ${totalPageNumber}",
        toc: {
            title: "目录",
            update: "更新",
            del: "删除",
            toc: "目录",
            linkTip: "单击 Ctrl 键以浏览",
            linkTip_Mac: "\u2318 单击以浏览",
            pageNumber: "仅限页码",
            entireTable: "整个表"
        },
        link: {
            addlink: "添加链接",
            gotolink: "打开链接",
            unlink: "除去链接",
            editlink: "编辑链接",
            internalLink: "内部链接",
            ctrlLink: "Ctrl+Click 以转至链接",
            ctrlLink_Mac: "\u2318单击以转至链接",
            cannotOpen: " 无法从 ${productName} 打开。"
        },
        field: {
            update: "更新字段"
        },
        insertTime: "插入时间",
        insertDate: "插入日期",
        selectDate: "选择日期",
        selectTime: "选择时间",
        acc_blank: "空白", // when selection is nothing but space char and empty paragraph
        acc_space: "空格", // string read out when the cursor is before one space char
        acc_inLink: "链接中",
        acc_inField: "在字段中",
        acc_selected: " 已选择",
        acc_inTable: "在表的行 ${0}、列 ${1} 中 ",
        acc_imageSelected: "已选择图形",
        acc_canvasSelected: "已选择形状",
        acc_textboxSelected: "已选择文本框",
        ACC_TABLE_TABLESIZE: "您已选择 ${0} 行、${1} 列",
        ACC_TABLE_MAXSIZE: " 支持的最大表格大小是 20*20",
        ACC_headerFooterMode: "页眉页脚编辑方式",
        ACC_EditorMode: "编辑器编辑方式",
        ACC_FootnotesMode: "脚注编辑方式",
        ACC_EndnotesMode: "尾注编辑方式",
        ACC_uniformTable: "添加了一个新行",
        Acc_column: "列 ${0}",
        acc_page: "页面 ${0}",
        acc_section: "区段 ${0}",
        acc_spellWarn: "拼写不正确",
        acc_outTable: "超出表格范围",
        acc_link: "链接",
        acc_field: "字段",
        acc_footnote: "脚注",
        acc_endnote: "尾注",
        acc_editor: "编辑者：${0}",
        tablePropertyTitle: "表格属性",
        headerTitle: "页眉",
        footerTitle: "页脚",
        firstheaderTitle: "第一页页眉",
        firstfooterTitle: "第一页页脚",
        evenheaderTitle: "偶数页页眉",
        evenfooterTitle: "偶数页页脚",
        oddheaderTitle: "奇数页页眉",
        oddfooterTitle: "奇数页页脚",
        showTableBorder: "显示表格边框",
        list_none: "无",
        SET_NUMBERING_VALUE: "设置编号值",
        BIDI_CONTENT_EDITING: "该文档包含双向内容。要正确处理该文档，请在 HCL Connections 首选项中开启双向支持。"
});

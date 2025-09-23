define({
        clipboard: {
            pasteTableToTableError: "无法在其他表中创建或粘贴表。",
            securityMsg: "由于浏览器的安全设置，应用程序无法访问您的剪贴板。要访问剪贴板，请按 Ctrl+V 以将内容粘贴到该字段中，然后单击“确定”。",
            pasteMaxMsg: "要粘贴的内容的大小过大。",
            cutError: '您的浏览器安全设置阻止自动复制。 请改用键盘上的 Ctrl+X。',
            copyError: '您的浏览器安全设置阻止自动复制。 请改用键盘上的 Ctrl+C。',
            pasteError: "由于浏览器的安全设置，应用程序无法访问您的剪贴板。请改为使用键盘上的 Ctrl+V。",
            cutErrorOnMac: '您的浏览器安全设置阻止自动复制。 请改用键盘上的 \u2318X。',
            copyErrorOnMac: '您的浏览器安全设置阻止自动复制。 请改用键盘上的 \u2318C。',
            pasteErrorOnMac: "由于浏览器的安全设置，应用程序无法访问您的剪贴板。请改用键盘上的 \u2318V。"
        },
        coediting: {
            exitTitle: "退出共同编辑",
            offlineTitle: "网络问题",
            reloadTitle: "同步问题",
            firstTab: "第一个选项卡",
            connectMsg: "单击 ${0} 按钮以重新连接，或者单击 ${1} 以刷新。",
            exitMsg: "单击“退出”以退出共同编辑方式，或者单击“查看方式”以切换到只读方式。",
            lockMsg: "将锁定编辑器以防止数据丢失。",
            connectLabel: "连接",
            exitLabel: "退出",
            reloadLabel: "重新装入",
            viewLabel: "查看方式",
            viweAlert: "用于仅查看方式的占位符",
            forbiddenInput: "由于选择包含一个任务，所以无法输入文本。",
            taskLockMsg: "${0} 正在该区段秘密工作。当秘密工作提交回本文档后，会覆盖您的更改。"
        },
        comments:
        {
            commentLabel: "添加注释",
            deleteComment: "删除注释",
            showComment: "显示注释",
            hoverText: "注释"
        },
        concordhelp:
        {
            about: "帮助内容"
        },

        concordpresentations:
        {
            newSlide: "新建幻灯片",
            addImage: "插入图像",
            slideShow: "开始幻灯片放映",
            addTextBox: "添加文本框",
            addPresComments: "添加注释",
            ctxMenuSmartTable: "添加表格",
            slideTemplate: "母版样式",
            slideLayout: "幻灯片布局",
            saveAsDraft: "保存"
        },

        concordrestyler:
        {
            toolbarRestylePrevious: "上一个样式",
            toolbarRestyleNext: "下一个样式"
        },

        concordsave:
        {
            concordsaveLabel: "保存文档",
            concordpublishLabel: "发布版本",
            publishOkLabel: "发布",
            checkinLabel: "检入",
			yesLabel: "是"
        },

        concordtemplates:
        {
            toolbarTemplates: "模板",
            dlgLabelDefaultSearchbarValue: "搜索",
            dlgLabelInitSearchResults: "结果：5 个模板",
            dlgLabelResults: "结果：",
            dlgLabelTemplates: " 个模板",
            dlgLabelShow: "显示：",
            dlgLabelAll: " 所有",
            dlgLabelDoc: "文档",
            dlgLabelST: "表格",
            dlgLabelSections: "区段",
            dlgLabelSeperator: " | ",
            dlgLabelDone: " 完成",
            dlgLabelCancel: " 取消",
            dlgInsertSectionError: "无法插入节，因为所选内容在表格内。",
            dlgLabelDataError: "当前无法检索模板。请稍后重试。",
            dlgTitle: "模板",
            dlgLabelLoading: "正在装入...",
            RESULTS_TOTAL_TEMPLATES: "结果：${0} 个模板",
            template0:
            {
                title: "传真",
                description: ""
            },
            template1:
            {
                title: "发票",
                description: ""
            },
            template2:
            {
                title: "备忘录",
                description: ""
            },
            template3:
            {
                title: "信函",
                description: ""
            },
            template4:
            {
                title: "简历",
                description: ""
            },
            template5:
            {
                title: "员工信头",
                description: ""
            },
            template6:
            {
                title: "公司信头",
                description: ""
            },
            template7:
            {
                title: "个人信头",
                description: ""
            },
            template8:
            {
                title: "研究报告信头",
                description: ""
            },
            template9:
            {
                title: "引用",
                description: ""
            }
        },
        deletekey:
        {
            forbiddenCopy: "由于所选内容包含任务或注释，因此无法复制内容",
            forbiddenCut: "由于所选内容包含任务，因此无法剪切内容",
            forbiddenDelete: "由于所选内容包含任务，因此无法删除内容。"
        },
        dialogmessage:
        {
            title: "消息",
            dlgTitle: "消息",
            validate: "验证",
            dialogMessage: "此处的对话框消息"
        },

        increasefont:
        {
            fail: "无法继续放大或缩小字体大小。已达到最大值或最小值。"
        },

        list:
        {
            disableMutliRangeSel: "不能在一个操作中向不连续的行添加编号或项目符号。尝试一次向一行添加编号或项目符号。",
            disableBullet: "不能将数字或项目符号添加到任务选择器中。请尝试选择文本而不选择“操作”按钮，然后添加数字或项目符号。"
        },

        listPanel:
        {
            continuelabel: "继续编号",
            restartlabel: "重新编号"
        },
        liststyles:
        {
            // Note: captions taken from UX design (story 42103 in pre-2012 RTC repository)
            titles:
            {
                numeric: "编号",
                bullets: "项目符号",
                multilevel: "多级列表"  // for both numeric and bullet lists
            },
            numeric:
            {
                numeric1: "数字 1",
                numeric2: "数字 2",
                numericParen: "带括号的数字",
                numericLeadingZero: "带前导 0 的数字",
                upperAlpha: "大写字母",
                upperAlphaParen: "带括号的大写字母",
                lowerAlpha: "小写字母",
                lowerAlphaParen: "带括号的小写字母",
                upperRoman: "大写罗马数字",
                lowerRoman: "小写罗马数字",
                japanese1: "日本数字 1",
                japanese2: "日本数字 2"
            },
            multilevelNumeric:
            {
                numeric: "数字",
                tieredNumbers: "分层数字",
                alphaNumeric: "字母数字",
                numericRoman: "罗马数字",
                numericArrows: "数字/向下箭头",
                alphaNumericBullet: "字母数字/项目符号",
                alphaRoman: "字母罗马数字",
                lowerAlphaSquares: "小写字母/正方形",
                upperRomanArrows: "大写罗马数字/箭头"
            },
            bullets:
            {
                circle: "圆形",
                cutOutSquare: "开口正方形",
                rightArrow: "向右箭头",
                diamond: "菱形",
                doubleArrow: "双箭头",
                asterisk: "星号",
                thinArrow: "细箭头",
                checkMark: "勾选符号",
                plusSign: "加号",
                // TODO - captions for image bullets
                //      - using image titles as starting point
                //        (see images in story 42428 in pre-2012 RTC repository)
                imgBlueCube: "蓝色立方体",
                imgBlackSquare: "黑色正方形",
                imgBlueAbstract: "蓝色抽象图",
                imgLeaf: "叶子",
                imgSilver: "银色圆圈",
                imgRedArrow: "红色箭头",
                imgBlackArrow: "黑色箭头",
                imgPurpleArrow: "紫色箭头",
                imgGreenCheck: "绿色勾选符号",
                imgRedX: "红色 X",
                imgGreenFlag: "绿旗",
                imgRedFlag: "红旗",
                imgStar: "星星"
            },
            multilevelBullets:
            {
                numeric: "数字",
                tieredNumbers: "分层数字",
                lowerAlpha: "小写字母",
                alphaRoman: "字母罗马数字",
                lowerRoman: "小写罗马数字",
                upperRoman: "大写罗马数字",
                dirArrows: "方向箭头",
                descCircles: "递减圆形",
                descSquares: "递减正方形"
            }
        },

        presComments:
        {
            addPresComments: "添加注释"
        },

        publish:
        {
            publishLabel: "在“我的文件”中保存文档",
            publishDocument: "在“我的文件”中保存文档",
            publishDocumentWaitMessage: "当在“我的文件”中保存文档时，请等待。",
            documentPublished: "文档已保存在“我的文件”中"
        },

        smarttables:
        {
            toolbarAddST: "添加表格",
            toolbarDelSTRow: "删除行",
            toolbarDelSTCol: "删除列",
            toolbarDelST: "删除表格",
            toolbarChgSTStyle: "更改表格样式",
            toolbarMoveSTRowUp: "将行上移",
            toolbarMoveSTRowDown: "将行下移",
            toolbarMoveSTColBefore: "将列前移",
            toolbarMoveSTColAfter: "将列后移",
            toolbarSortSTColAsc: "按升序排序",
            toolbarSortSTColDesc: "按降序排序",
            toolbarResizeSTCols: "调整列大小",
            toolbarMakeHeaderRow: "制作标题",
            toolbarMakeNonHeaderRow: "制作非标题",
            toolbarMakeHeaderCol: "制作标题",
            toolbarMakeNonHeaderCol: "制作非标题",
            toolbarToggleFacetSelection: "以查看方式生成类别",
            ctxMenuSmartTable: "表格",
            ctxMenuTableProperties: "表格属性...",
            ctxMenuTableCellProperties: "单元格属性...",
            ctxMenuDeleteST: "删除",
            ctxMenuChgSTStyle: "更改样式",
            ctxMenuShowCaption: "显示文字说明",
            ctxMenuHideCaption: "隐藏文字说明",
            ctxMenuResizeST: "调整大小",
            ctxMenuResizeColumnsST: "调整列大小",
            ctxMenuSTRow: "行",
            ctxMenuAddSTRowAbv: "在上方插入行",
            ctxMenuAddSTRowBlw: "在下方插入行",
            ctxMenuMoveSTRowUp: "将行上移",
            ctxMenuMoveSTRowDown: "将行下移",
            ctxMenuDelSTRow: "删除",
            ctxMenuSTCol: "列",
            ctxMenuAddSTColBfr: "在之前插入列",
            ctxMenuAddSTColAft: "在之后插入列",
            ctxMenuMoveSTColBefore: "将列左移",
            ctxMenuMoveSTColAfter: "将列右移",
            ctxMenuDelSTCol: "删除",
            ctxMenuSortSTColAsc: "按升序排序",
            ctxMenuSortSTColDesc: "按降序排序",
            ctxMenuShowAllFacets: "显示类别",
            ctxMenuHideAllFacets: "隐藏类别",
            ctxMenuSTCell: "单元格",
            ctxMenuMergeCells: "合并单元格",
            ctxMenuMergeDown: "与下方的单元格合并",
            ctxMenuVerSplit: "垂直拆分",
            ctxMenuHorSplit: "水平拆分",
            ctxMenuAlignTextLeft: "左对齐",
            ctxMenuAlignTextCenter: "居中对齐",
            ctxMenuAlignTextRight: "右对齐",
            ctxMenuClearSTCellContent: "清除内容",
            ctxMenuMakeHeaderRow: "将所选行用作标题",
            ctxMenuMakeNonHeaderRow: "除去标题样式",
            ctxMenuMakeHeaderCol: "将所选列用作标题",
            ctxMenuMakeNonHeaderCol: "除去标题样式",
            msgCannotInsertRowBeforeHeader: "不能在标题之前插入新行。",
            msgCannotInsertCoBeforeHeader: "不能在标题之前插入新列。",
            msgCannotMoveHeaderRow: "不能移动标题行。",
            dlgTitleSTProperties: "表格属性",
            dlgTitleAddST: "添加表格",
            dlgLabelSTName: "表格名称：",
            dlgLabelSTType: "选择标题类型",
            dlgLabelSTRows: "行数",
            dlgLabelSTCols: "列数",
            dlgLabelSTTemplate: "使用模板",
            dlgMsgValidationRowsMax: "输入 1 至 200 之间的数字。",
            dlgMsgValidationColsMax: "输入 1 至 25 之间的数字。",
            dlgMsgValidation: "该值必须是正整数",
            dlgLabelSTInstruction: "输入行数和列数。对于行数，最大值为 200；对于列数，最大值为 25。"
        },
        task: {
            titleAssign: "分配区段",
            ctxMenuTask: "分配",
            ctxMenuCreateTask: "分配一个区段",
            ctxMenuDeleteTask: "删除",
            ctxMenuClearTask: "清除分配",
            ctxMenuHideTask: "全部隐藏",
            ctxMenuShowTask: "全部显示"
        },
        tablestyles: {
            tableStylesToolbarLabel: "更改表格样式",
            styleTableHeading: "样式表",
            recommendedTableHeading: "推荐",
            tableStylesGalleryHeading: "库",
            customHeading: "定制",
            customTableHeading: "定制表格",
            customTableCustomizeATable: "定制表格",
            customTableStyleATable: "设计表格样式",
            customTableAddATable: "添加表格",
            customTableSelectTableGrid: "选择表网格",
            customTableSelectColorScheme: "选择颜色方案",
            customTableHeader: "标题",
            customTableBanding: "条纹",
            customTableSummary: "摘要",
            customTableBorders: "边框",
            customTableBackground: "背景",
            tableStylePlain: "无格式",
            tableStyleBlueStyle: "蓝色样式",
            tableStyleRedTint: "红色色调",
            tableStyleBlueHeader: "蓝色页眉",
            tableStyleDarkGrayHeaderFooter: "深灰色页眉/页脚",
            tableStyleLightGrayRows: "浅灰色行",
            tableStyleDarkGrayRows: "深灰色行",
            tableStyleBlueTint: "蓝色色调",
            tableStyleRedHeader: "红色页眉",
            tableStyleGreenHeaderFooter: "绿色页眉/页脚",
            tableStylePlainRows: "无格式行",
            tableStyleGrayTint: "灰色色调",
            tableStyleGreenTint: "绿色色调",
            tableStyleGreenHeader: "绿色页眉",
            tableStyleRedHeaderFooter: "红色页眉/页脚",
            tableStyleGreenStyle: "绿色样式",
            tableStylePurpleTint: "紫色色调",
            tableStyleBlackHeader: "黑色页眉",
            tableStylePurpleHeader: "紫色页眉",
            tableStyleLightBlueHeaderFooter: "浅蓝色页眉/页脚"
        },
        toc: {
            title: "目录",
            update: "更新",
            del: "删除",
            toc: "目录",
            linkTip: "单击 Ctrl 键以浏览",
            pageNumber: "仅限页码",
            entireTable: "整个表"
        },
        link: {
            gotolink: "转至链接",
            unlink: "除去链接",
            editlink: "编辑链接"
        },
        field: {
            update: "更新字段"
        },
        undo: {
            undoTip: "撤销",
            redoTip: "重做"
        },
        wysiwygarea: {
            failedPasteActions: "无法粘贴。${productName} 无法复制和粘贴来自其他应用程序的图像。请将图像文件上载到 ${productName} 以在其中使用该图像。",
            filteredPasteActions: "无法粘贴。要确保可以使用来自其他 Web 站点的图像，请将该图像下载到本地计算机，然后将此图像文件上载到 ${productName}。"
        }
})


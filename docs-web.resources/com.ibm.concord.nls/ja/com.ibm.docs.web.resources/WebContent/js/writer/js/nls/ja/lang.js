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
        PAGE_BREAK_TEXT: "改ページ",
        SECTION_BREAK_TEXT: "セクション区切り",
        LINE_BREAK_TEXT: "改行",
        COLUMN_BREAK_TEXT: "列区切り",
        INSERT_IMAGE_NOT_PROPER_PLACE: "イメージを追加できるのは本文テキストと表のみです。この場所には追加できません。",
        LOADING: "コンテンツをロード中です。",
        LOAD_FINISHED: "コンテンツのロードが終了しました。",
        PAGE_SETUP: "ページ・レイアウトの設定",
        NOTE_INVALIDACTION_FOOTNOTE: "これは脚注に対して有効なアクションではありません。",
        NOTE_INVALIDACTION_ENDNOTE: "これは文末脚注に対して有効なアクションではありません。",
        PAGENUMBER_OF_TOTALNUMBER: "ページ ${0} / ${1}", //page 1 of N
        PAGE_NUMBER: "ページ: ${pageNumber} / ${totalPageNumber}",
        toc: {
            title: "目次",
            update: "更新",
            del: "削除",
            toc: "目次",
            linkTip: "Ctrl をクリックしてナビゲート",
            linkTip_Mac: "\u2318 をクリックしてナビゲート",
            pageNumber: "ページ番号のみ",
            entireTable: "表全体"
        },
        link: {
            addlink: "リンクの追加",
            gotolink: "リンクを開く",
            unlink: "リンクの削除",
            editlink: "リンクの編集",
            internalLink: "内部リンク",
            ctrlLink: "Ctrl + クリックでリンクに移動",
            ctrlLink_Mac: "\u2318クリックでリンクに移動",
            cannotOpen: " ${productName} から開けません。"
        },
        field: {
            update: "フィールドの更新"
        },
        insertTime: "時刻の挿入",
        insertDate: "日付の挿入",
        selectDate: "日付の選択",
        selectTime: "時刻の選択",
        acc_blank: "空白", // when selection is nothing but space char and empty paragraph
        acc_space: "スペース", // string read out when the cursor is before one space char
        acc_inLink: "リンク内 ",
        acc_inField: "フィールド内 ",
        acc_selected: " 選択済み",
        acc_inTable: "テーブル行 ${0} 列 ${1} ",
        acc_imageSelected: "選択済み画像",
        acc_canvasSelected: "選択済みシェイプ",
        acc_textboxSelected: "選択済みテキスト・ボックス",
        ACC_TABLE_TABLESIZE: "${0} 行、${1} 列を選択しました",
        ACC_TABLE_MAXSIZE: " サポートされる最大表サイズは 20*20 です",
        ACC_headerFooterMode: "ヘッダー/フッター編集モード",
        ACC_EditorMode: "エディター編集モード",
        ACC_FootnotesMode: "脚注編集モード",
        ACC_EndnotesMode: "文末脚注編集モード",
        ACC_uniformTable: "新しい行が追加されました",
        Acc_column: "列  ${0}",
        acc_page: "ページ  ${0}",
        acc_section: "セクション  ${0}",
        acc_spellWarn: "スペルが正しくありません",
        acc_outTable: "表の外",
        acc_link: "リンク",
        acc_field: "フィールド",
        acc_footnote: "脚注",
        acc_endnote: "文末脚注",
        acc_editor: "${0} が編集",
        tablePropertyTitle: "表のプロパティー",
        headerTitle: "ヘッダー",
        footerTitle: "フッター",
        firstheaderTitle: "最初のページのヘッダー",
        firstfooterTitle: "最初のページのフッター",
        evenheaderTitle: "偶数ページのヘッダー",
        evenfooterTitle: "偶数ページのフッター",
        oddheaderTitle: "奇数ページのヘッダー",
        oddfooterTitle: "奇数ページのフッター",
        showTableBorder: "表の境界を表示",
        list_none: "なし",
        SET_NUMBERING_VALUE: "番号付けの値を設定",
        BIDI_CONTENT_EDITING: "この文書には双方向言語コンテンツが含まれています。 この文書で適切に作業するには、HCL Connections の設定で双方向言語サポートを有効にしてください。"
});

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
        PAGE_BREAK_TEXT: "Sayfa Sonu",
        SECTION_BREAK_TEXT: "Bölüm Sonu",
        LINE_BREAK_TEXT: "Satır Sonu",
        COLUMN_BREAK_TEXT: "Sütun Sonu",
        INSERT_IMAGE_NOT_PROPER_PLACE: "Üzgünüz, resimler yalnızca gövde metnine ve tablolara eklenebilir, geçerli konuma eklenemez. ",
        LOADING: "İçerik yükleniyor.",
        LOAD_FINISHED: "İçerik yükleme tamamlandı.",
        PAGE_SETUP: "Sayfa Yapısı",
        NOTE_INVALIDACTION_FOOTNOTE: "Dipnot için geçerli bir işlem değil.",
        NOTE_INVALIDACTION_ENDNOTE: "Son not için geçerli bir işlem değil.",
        PAGENUMBER_OF_TOTALNUMBER: "Sayfa ${0} / ${1}", //page 1 of N
        PAGE_NUMBER: "Sayfa: ${pageNumber} / ${totalPageNumber}",
        toc: {
            title: "İçindekiler Tablosu",
            update: "Güncelleştir",
            del: "Sil",
            toc: "İçindekiler Tablosu",
            linkTip: "Gezinmek için Ctrl tuşuna basın",
            linkTip_Mac: "\u2318 gitmek için tıklatın",
            pageNumber: "Yalnızca sayfa numarası",
            entireTable: "Tüm Tablo"
        },
        link: {
            addlink: "Bağlantı Ekle",
            gotolink: "Bağlantıyı Aç",
            unlink: "Bağlantıyı Kaldır",
            editlink: "Bağlantıyı Düzenle",
            internalLink: "İç Bağlantı",
            ctrlLink: "Bağlantıya gitmek için Ctrl tuşuna basıp tıklatın",
            ctrlLink_Mac: "\u2318Bağlantıya gitmek için tıklatın",
            cannotOpen: " ${productName} uygulamasından açılamıyor."
        },
        field: {
            update: "Alanı Güncelleştir"
        },
        insertTime: "Saat Ekle",
        insertDate: "Tarih Ekle",
        selectDate: "Tarih Seç",
        selectTime: "Saat Seç",
        acc_blank: "boş", // when selection is nothing but space char and empty paragraph
        acc_space: "boşluk", // string read out when the cursor is before one space char
        acc_inLink: "bağlantıda ",
        acc_inField: "alanında ",
        acc_selected: " seçildi",
        acc_inTable: "tablo satırı ${0} sütunu ${1} ",
        acc_imageSelected: "grafik seçildi",
        acc_canvasSelected: "şekil seçildi",
        acc_textboxSelected: "metin kutusu seçildi",
        ACC_TABLE_TABLESIZE: "${0} satır, ${1} sütun seçtiniz",
        ACC_TABLE_MAXSIZE: " Desteklenen en büyük tablo boyutu 20*20'dir.",
        ACC_headerFooterMode: "üstbilgi altbildi düzenleme modu",
        ACC_EditorMode: "düzenleyici düzenleme modu",
        ACC_FootnotesMode: "dipnotlar düzenleme modu",
        ACC_EndnotesMode: "sonnotlar düzenleme modu",
        ACC_uniformTable: "Yeni bir satır eklendi",
        Acc_column: "sütun  ${0}",
        acc_page: "sayfa  ${0}",
        acc_section: "bölüm  ${0}",
        acc_spellWarn: "yazım hatalı",
        acc_outTable: "tablo dışında",
        acc_link: "bağlantı",
        acc_field: "alan",
        acc_footnote: "dipnot",
        acc_endnote: "sonnot",
        acc_editor: "${0} ile düzenle",
        tablePropertyTitle: "Tablo Özellikleri",
        headerTitle: "Üstbilgi",
        footerTitle: "Altbilgi",
        firstheaderTitle: "İlk Sayfa Başlığı",
        firstfooterTitle: "İlk Sayfa Altbilgisi",
        evenheaderTitle: "Çift Sayılı Sayfa Üstbilgisi",
        evenfooterTitle: "Çift Sayılı Sayfa Altbilgisi",
        oddheaderTitle: "Tek Sayılı Sayfa Üstbilgisi",
        oddfooterTitle: "Tek Sayılı Sayfa Altbilgisi",
        showTableBorder: "Tablo Sınırlarını Göster",
        list_none: "Hiçbiri",
        SET_NUMBERING_VALUE: "Numaralandırma Değerini Ayarla",
        BIDI_CONTENT_EDITING: "Bu belgede çift yönlü içerik bulunur. Bu belgeyle düzgün bir şekilde çalışmak için HCL Connections tercihlerinizde çift yönlü desteği açın."
});

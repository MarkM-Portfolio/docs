/*
Copyright (c) 2003-2011, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license


Portions Copyright IBM Corp., 2010-2011.
*/

/**
 * @fileOverview Defines the {@link CKEDITOR.lang} object, for the English
 *		language. This is the base file for all translations.
 */

/**#@+
   @type String
   @example
*/

/**
 * Constains the dictionary of language entries.
 * @namespace
 */
// NLS_ENCODING=UTF-8
// NLS_MESSAGEFORMAT_NONE
// G11N GA UI

CKEDITOR.lang["en"] =
{
	/**
	 * #STAT_NON_TRANSLATABLE <for dir: 'dir'>
	 * Please pay attention to variable 'dir' when translating:
	 * Only in 'Arabic' 'Persian' 'Hebrew' make dir a 'rtl' (dir : 'rtl'),
	 * Other languages DO NOT need to translate on variable 'dir', leave it as (dir: 'ltr')
	 */
	dir : "ltr",

	/*
	 * #END_NON_TRANSLATABLE <for dir: 'dir'>
	 */
	editorTitle : "Zengin metin düzenleyici, %1.",

	// ARIA descriptions.
	toolbars	: "Düzenleyici araç çubukları",
	editor	: "Zengin Metin Düzenleyici",

	// Toolbar buttons without dialogs.
	source			: "Kaynak",
	newPage			: "Yeni Sayfa",
	save			: "Kaydet",
	preview			: "Önizleme:",
	cut				: "Kes",
	copy			: "Kopyala",
	paste			: "Yapıştır",
	print			: "Yazdır",
	underline		: "Altı Çizili",
	bold			: "Kalın",
	italic			: "İtalik",
	selectAll		: "Tümünü Seç",
	removeFormat	: "Biçimi Kaldır",
	strike			: "Üstü Çizili",
	subscript		: "Alt Simge",
	superscript		: "Üst Simge",
	horizontalrule	: "Yatay Çizgi Ekle",
	pagebreak		: "Sayfa Sonu Ekle",
	pagebreakAlt		: "Sayfa Sonu",
	unlink			: "Bağlantıyı Kaldır",
	undo			: "Geri Al",
	redo			: "Yinele",

	// Common messages and labels.
	common :
	{
		browseServer	: "Tarayıcı Sunucusu:",
		url				: "URL:",
		protocol		: "İletişim Kuralı:",
		upload			: "Karşıya Yükle:",
		uploadSubmit	: "Sunucuya Gönder",
		image			: "Resim Ekle",
		flash			: "Flash Filmi Ekle",
		form			: "Form Ekle",
		checkbox		: "Onay Kutusu Ekle",
		radio			: "Radyo Düğmesi Ekle",
		textField		: "Metin Giriş Alanı Ekle",
		textarea		: "Metin Alanı Ekle",
		hiddenField		: "Gizli Alan Ekle",
		button			: "Düğme Ekle",
		select			: "Seçim Alanı Ekle",
		imageButton		: "Resim Düğmesi Ekle",
		notSet			: "<not set>",
		id				: "Tanıtıcı:",
		name			: "Ad:",
		langDir			: "Metin Yönü:",
		langDirLtr		: "Soldan Sağa",
		langDirRtl		: "Sağdan Sola",
		langCode		: "Dil Kodu:",
		longDescr		: "Uzun Açıklama URL adresi",
		cssClass		: "Stil sayfası sınıfları:",
		advisoryTitle	: "Öneri başlığı:",
		cssStyle		: "Stil:",
		ok				: "Tamam",
		cancel			: "İptal",
		close : "Kapat",
		preview			: "Önizleme:",
		generalTab		: "Genel",
		advancedTab		: "Gelişmiş",
		validateNumberFailed	: "Bu değer bir sayı değil.",
		confirmNewPage	: "Bu içeriğe kaydedilmemiş tüm değişiklikler kaybolacak. Yeni bir sayfa yüklemek istediğinizden emin misiniz?",
		confirmCancel	: "Bazı seçenekler değiştirildi. Bu iletişim kutusunu kapatmak istediğinizden emin misiniz?",
		options : "Seçenekler",
		target			: "Hedef:",
		targetNew		: "Yeni Pencere (_blank)",
		targetTop		: "En Üst Pencere (_top)",
		targetSelf		: "Aynı Pencere (_self)",
		targetParent	: "Üst Pencere (_parent)",
		langDirLTR		: "Soldan Sağa",
		langDirRTL		: "Sağdan Sola",
		styles			: "Stil:",
		cssClasses		: "Stil Sayfası Sınıfları:",
		width			: "Genişlik:",
		height			: "Yükseklik:",
		align			: "Hizala:",
		alignLeft		: "Sola",
		alignRight		: "Sağa",
		alignCenter		: "Ortala",
		alignTop		: "Üste",
		alignMiddle		: "Ortaya",
		alignBottom		: "Alta",
		invalidHeight	: "Yükseklik bir pozitif tamsayı olmalıdır.",
		invalidWidth	: "Genişlik bir pozitif tamsayı olmalıdır.",
		invalidCssLength	: "'%1' alanı için belirtilen değer, geçerli bir CSS ölçü birimli (px, %, in, cm, mm, em, ex, pt veya pc) ya da birimsiz bir pozitif sayı olmalıdır.",
		invalidHtmlLength	: "'%1' alanı için belirtilen değer, geçerli bir HTML ölçü birimli (px veya %) ya da birimsiz bir pozitif sayı olmalıdır.",
		invalidInlineStyle	: "Yerleşik stil için belirtilen değer, noktalı virgülle ayrılan \"ad : değer\" biçimiyle bir veya birden fazla başlıktan oluşmalıdır.",
		cssLengthTooltip	: "Pikseldeki bir değer için bir sayı ya da geçerli CSS birimiyle (px, %, in, cm, mm, em, ex, pt veya pc) bir sayı girin.",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">, kullanılabilir değil</span>"
	},

	contextmenu :
	{
		options : "Bağlam Menüsü Seçenekleri"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "Özel Karakter Ekle",
		title		: "Özel Karakter",
		options : "Özel Karakter Seçenekleri"
	},

	// Link dialog.
	link :
	{
		toolbar		: "URL Bağlantısı",
		other 		: "<other>",
		menu		: "Bağlantıyı Düzenle...",
		title		: "Bağlantı",
		info		: "Bağlantı Bilgileri",
		target		: "Hedef",
		upload		: "Karşıya Yükle:",
		advanced	: "Gelişmiş",
		type		: "Bağlantı Tipi:",
		toUrl		: "URL",
		toAnchor	: "Metne tutturulacak bağlantı",
		toEmail		: "E-posta",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "Hedef Çerçeve Adı:",
		targetPopupName	: "Açılan Pencere Adı:",
		popupFeatures	: "Açılan Pencere Özellikleri:",
		popupResizable	: "Yeniden Boyutlandırılabilir",
		popupStatusBar	: "Durum Çubuğu",
		popupLocationBar	: "Konum Çubuğu",
		popupToolbar	: "Araç Çubuğu",
		popupMenuBar	: "Menü Çubuğu",
		popupFullScreen	: "Tam Ekran (IE)",
		popupScrollBars	: "Kaydırma Çubukları",
		popupDependent	: "Bağımlı (Netscape)",
		popupLeft		: "Sol Konum",
		popupTop		: "Üst Konum",
		id				: "Tanıtıcı:",
		langDir			: "Metin Yönü:",
		langDirLTR		: "Soldan Sağa",
		langDirRTL		: "Sağdan Sola",
		acccessKey		: "Erişim Anahtarı:",
		name			: "Ad:",
		langCode		: "Dil Kodu:",
		tabIndex		: "Sekme Dizini:",
		advisoryTitle	: "Öneri başlığı:",
		advisoryContentType	: "Öneri İçeriği Türü:",
		cssClasses		: "Stil sayfası sınıfları:",
		charset			: "Bağlı Kaynak Karakter Kümesi:",
		styles			: "Stil:",
		rel			: "İlişki",
		selectAnchor	: "Tutturucu Seç",
		anchorName		: "Tutturucu Adına Göre",
		anchorId		: "Öğe Tanıtıcısına Göre",
		emailAddress	: "E-Posta Adresi",
		emailSubject	: "İleti Konusu",
		emailBody		: "İleti Gövdesi",
		noAnchors		: "Belgede kullanılabilir yer işareti yok. Eklemek için, araç çubuğunda 'Belge Yer İşareti Ekle' simgesini tıklatın.",
		noUrl			: "Lütfen bağlantı URL'sini yazın",
		noEmail			: "Lütfen e-posta adresini yazın"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "Belge Yer İşareti Ekle",
		menu		: "Belge Yer İşaretini Düzenle",
		title		: "Belge Yer İşareti",
		name		: "Ad:",
		errorName	: "Lütfen belge yer işareti için bir ad girin",
		remove		: "Belge Yer İşaretini Kaldır"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "Numaralandırılmış Liste Özellikleri",
		bulletedTitle		: "Madde İşaretli Liste Özellikleri",
		type				: "Tür",
		start				: "Başlat",
		validateStartNumber				:"Liste başlangıç numarası bir tamsayı olmalıdır.",
		circle				: "Daire",
		disc				: "Disk",
		square				: "Kare",
		none				: "Hiçbiri",
		notset				: "<not set>",
		armenian			: "Ermenice numaralandırma",
		georgian			: "Gürcüce numaralandırma (an, ban, gan, vb.)",
		lowerRoman			: "Küçük Harf Romen (i, ii, iii, iv, v, vb.)",
		upperRoman			: "Büyük Harf Romen (I, II, III, IV, V, vb.)",
		lowerAlpha			: "Küçük Harf Alfa (a, b, c, d, e, vb.)",
		upperAlpha			: "Büyük Harf Alfa (A, B, C, D, E, vb.)",
		lowerGreek			: "Küçük Harf Yunan (alfa, beta, gama, vb.)",
		decimal				: "Ondalık (1, 2, 3, vb.)",
		decimalLeadingZero	: "Sayısal öndeki sıfır (01, 02, 03, vb.)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "Bul ve Değiştir",
		find				: "Bul",
		replace				: "Değiştir",
		findWhat			: "Bul:",
		replaceWith			: "Şununla değiştir:",
		notFoundMsg			: "Belirtilen metin bulunamadı.",
		noFindVal			: 'Bulunacak metin gerekli.',
		findOptions			: "Seçenekleri Bul",
		matchCase			: "Büyük/küçük harf eşle",
		matchWord			: "Tam sözcük eşle",
		matchCyclic			: "Döngüsel eşle",
		replaceAll			: "Tümünü Değiştir",
		replaceSuccessMsg	: "Bulunan %1 öğe değiştirildi."
	},

	// Table Dialog
	table :
	{
		toolbar		: "Tablo Ekle",
		title		: "Tablo",
		menu		: "Tablo Özellikleri",
		deleteTable	: "Tabloyu Sil",
		rows		: "Satırlar:",
		columns		: "Sütunlar:",
		border		: "Kenarlık boyutu:",
		widthPx		: "piksel",
		widthPc		: "yüzde",
		widthUnit	: "Genişlik birimi:",
		cellSpace	: "Hücre aralığı:",
		cellPad		: "Hücre doldurma:",
		caption		: "Resim yazısı:",
		summary		: "Özet:",
		headers		: "Üstbilgiler:",
		headersNone		: "Hiçbiri",
		headersColumn	: "İlk sütun",
		headersRow		: "İlk Satır",
		headersBoth		: "Her ikisi",
		invalidRows		: "Satır sayısı sıfırdan büyük bir tamsayı olmalıdır.",
		invalidCols		: "Sütun sayısı sıfırdan büyük bir tamsayı olmalıdır.",
		invalidBorder	: "Kenarlık boyutu bir pozitif sayı olmalıdır.",
		invalidWidth	: "Tablo genişliği bir pozitif sayı olmalıdır.",
		invalidHeight	: "Tablo yüksekliği bir pozitif sayı olmalıdır.",
		invalidCellSpacing	: "Hücre aralığı bir pozitif sayı olmalıdır.",
		invalidCellPadding	: "Hücre doldurma bir pozitif sayı olmalıdır.",

		cell :
		{
			menu			: "Hücre",
			insertBefore	: "Hücreyi Önüne Ekle",
			insertAfter		: "Hücreyi Arkasına Ekle",
			deleteCell		: "Hücreleri Sil",
			merge			: "Hücreleri Birleştir",
			mergeRight		: "Sağa Birleştir",
			mergeDown		: "Aşağı Birleştir",
			splitHorizontal	: "Hücreyi Yatay Olarak Böl",
			splitVertical	: "Hücreyi Dikey Olarak Böl",
			title			: "Hücre Özellikleri",
			cellType		: "Hücre tipi:",
			rowSpan			: "Satır aralığı:",
			colSpan			: "Sütun aralığı:",
			wordWrap		: "Sözcük kaydırma:",
			hAlign			: "Yatay hizalama:",
			vAlign			: "Dikey hizalama:",
			alignBaseline	: "Taban çizgisi",
			bgColor			: "Arka plan rengi:",
			borderColor		: "Kenarlık rengi:",
			data			: "Veri",
			header			: "Üstbilgi",
			yes				: "Evet",
			no				: "Hayır",
			invalidWidth	: "Hücre genişliği bir pozitif sayı olmalıdır.",
			invalidHeight	: "Hücre yüksekliği bir pozitif sayı olmalıdır.",
			invalidRowSpan	: "Satır aralığı bir pozitif tamsayı olmalıdır.",
			invalidColSpan	: "Sütun aralığı bir pozitif tamsayı olmalıdır.",
			chooseColor : "Seç"
		},

		row :
		{
			menu			: "Satır",
			insertBefore	: "Satırı Önüne Ekle",
			insertAfter		: "Satırı Arkasına Ekle",
			deleteRow		: "Satırları Sil"
		},

		column :
		{
			menu			: "Sütun",
			insertBefore	: "Sütunu Önüne Ekle",
			insertAfter		: "Sütunu Arkasına Ekle",
			deleteColumn	: "Sütunları Sil"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "Düğme Özellikleri",
		text		: "Metin (Değer):",
		type		: "Tip:",
		typeBtn		: "Düğme",
		typeSbm		: "Gönder",
		typeRst		: "Sıfırla"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "Onay Kutusu Özellikleri",
		radioTitle	: "Radyo Düğmesi Özellikleri",
		value		: "Değer:",
		selected	: "Seçili"
	},

	// Form Dialog.
	form :
	{
		title		: "Form Ekle",
		menu		: "Form Özellikleri",
		action		: "Eylem:",
		method		: "Yöntem:",
		encoding	: "Kodlama:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "Alan Özelliklerini Seç",
		selectInfo	: "Bilgileri Seç",
		opAvail		: "Kullanılabilir Seçenekler",
		value		: "Değer:",
		size		: "Boyut:",
		lines		: "satır",
		chkMulti	: "Birden çok seçime izin ver",
		opText		: "Metin:",
		opValue		: "Değer:",
		btnAdd		: "Ekle",
		btnModify	: "Değiştir",
		btnUp		: "Yukarı",
		btnDown		: "Aşağı",
		btnSetValue : "Seçili değer olarak ayarla",
		btnDelete	: "Sil"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "Metin Alanı Özellikleri",
		cols		: "Sütunlar:",
		rows		: "Satırlar:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "Metin Alanı Özellikleri",
		name		: "Ad:",
		value		: "Değer:",
		charWidth	: "Karakter Genişliği:",
		maxChars	: "Karakter Üst Sınırı:",
		type		: "Tip:",
		typeText	: "Metin",
		typePass	: "Parola"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "Gizli Alan Özellikleri",
		name	: "Ad:",
		value	: "Değer:"
	},

	// Image Dialog.
	image :
	{
		title		: "Resim",
		titleButton	: "Resim Düğmesi Özellikleri",
		menu		: "Resim Özellikleri...",
		infoTab	: "Resim Bilgileri",
		btnUpload	: "Sunucuya gönder",
		upload	: "Karşıya Yükle",
		alt		: "Diğer metin:",
		lockRatio	: "Kilitleme Oranı",
		resetSize	: "Boyutu Sıfırla",
		border	: "Kenarlık:",
		hSpace	: "Yatay alan:",
		vSpace	: "Dikey alan:",
		alertUrl	: "Lütfen resim URL'sini yazın",
		linkTab	: "Bağlantı",
		button2Img	: "Seçili resim düğmesini basit bir resme dönüştürmek istiyor musunuz?",
		img2Button	: "Seçili resmi resim düğmesine dönüştürmek istiyor musunuz?",
		urlMissing : "Resim kaynağının URL adresi eksik.",
		validateBorder : "Kenarlık bir pozitif tamsayı olmalıdır.",
		validateHSpace : "Yatay alan bir pozitif tamsayı olmalıdır.",
		validateVSpace : "Dikey alan bir pozitif tamsayı olmalıdır."
	},

	// Flash Dialog
	flash :
	{
		properties		: "Flash Özellikleri",
		propertiesTab	: "Özellikler",
		title		: "Flash",
		chkPlay		: "Otomatik oynat",
		chkLoop		: "Döngü",
		chkMenu		: "Flash menüyü etkinleştir",
		chkFull		: "Tam ekrana izin ver",
 		scale		: "Ölçek:",
		scaleAll		: "Tümünü göster",
		scaleNoBorder	: "Kenarlık Yok",
		scaleFit		: "Tam Sığdır",
		access			: "Komut dosyası erişimi:",
		accessAlways	: "Her zaman",
		accessSameDomain	: "Aynı etki alanı",
		accessNever	: "Hiçbir zaman",
		alignAbsBottom: "Abs Alta",
		alignAbsMiddle: "Abs Ortaya",
		alignBaseline	: "Taban çizgisi",
		alignTextTop	: "Metin Üstte",
		quality		: "Kalite:",
		qualityBest	: "En İyi",
		qualityHigh	: "Yüksek",
		qualityAutoHigh	: "Otomatik Yüksek",
		qualityMedium	: "Orta",
		qualityAutoLow	: "Otomatik Düşük",
		qualityLow	: "Düşük",
		windowModeWindow	: "Pencere",
		windowModeOpaque	: "Opak",
		windowModeTransparent	: "Saydam",
		windowMode	: "Pencere modu:",
		flashvars	: "Değişkenler:",
		bgcolor	: "Arka plan rengi:",
		hSpace	: "Yatay alan:",
		vSpace	: "Dikey alan:",
		validateSrc : "URL boş olmamalıdır.",
		validateHSpace : "Yatay alan bir pozitif tamsayı olmalıdır.",
		validateVSpace : "Dikey alan bir pozitif tamsayı olmalıdır."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "Yazım Denetimi",
		title			: "Yazım Denetimi",
		notAvailable	: "Üzgünüz, hizmet şu anda kullanılamıyor.",
		errorLoading	: "Uygulama hizmeti ana makinesi yüklenirken hata oluştu: %s.",
		notInDic		: "Sözlükte yok",
		changeTo		: "Şuna değiştir",
		btnIgnore		: "Yoksay",
		btnIgnoreAll	: "Tümünü Yoksay",
		btnReplace		: "Değiştir",
		btnReplaceAll	: "Tümünü Değiştir",
		btnUndo			: "Geri Al",
		noSuggestions	: "- Öneri yok -",
		progress		: "Yazım denetimi yapılıyor...",
		noMispell		: "Yazım denetimi tamamlandı: Yazım hatası bulunamadı",
		noChanges		: "Yazım denetimi tamamlandı: Değiştirilen sözcük yok",
		oneChange		: "Yazım denetimi tamamlandı: Bir sözcük değiştirildi",
		manyChanges		: "Yazım denetimi tamamlandı: %1 sözcük değiştirildi",
		ieSpellDownload	: "Yazım denetleyicisi kurulu değil. Şimdi karşıdan yüklemek istiyor musunuz?"
	},

	smiley :
	{
		toolbar	: "İfade Ekle",
		title	: "İfadeler",
		options : "İfade Seçenekleri"
	},

	elementsPath :
	{
		eleLabel : "Öğe yolu",
		eleTitle : "%1 öğe"
	},

	numberedlist : "Numaralı Liste",
	bulletedlist : "Madde İşaretli Liste",
	indent : "Girintiyi Artır",
	outdent : "Girintiyi Azalt",

	bidi :
	{
		ltr : "Soldan Sağa",
		rtl : "Sağdan Sola",
	},

	justify :
	{
		left : "Sola Hizala",
		center : "Ortala",
		right : "Sağa Hizala",
		block : "Hizala"
	},

	blockquote : "Blok alıntı",

	clipboard :
	{
		title		: "Yapıştır",
		cutError	: "Tarayıcı güvenlik ayarlarınız otomatik kesmeye izin vermiyor. Bunun yerine klavyenizde Ctrl+X tuşlarını kullanın.",
		copyError	: "Tarayıcı güvenlik ayarlarınız otomatik kopyalamaya izin vermiyor. Bunun yerine klavyenizde Ctrl+C tuşlarını kullanın.",
		pasteMsg	: "Aşağıya yapıştırmak için Ctrl+V (MAC üzerinde Cmd+V) tuşlarına basın.",
		securityMsg	: "Tarayıcı güvenliğiniz doğrudan panodan yapıştırmayı engeller.",
		pasteArea	: "Yapıştırma Alanı"
	},

	pastefromword :
	{
		confirmCleanup	: "Yapıştırmak istediğiniz metin Word belgesinden kopyalanmış. Yapıştırmadan önce metni temizlemek istiyor musunuz?",
		toolbar			: "Özel Yapıştır",
		title			: "Özel Yapıştır",
		error			: "Yapıştırılan veriler, bir iç hata nedeniyle temizlenemedi."
	},

	pasteText :
	{
		button	: "Düz metin olarak yapıştır",
		title	: "Düz Metin Olarak Yapıştır"
	},

	templates :
	{
		button 			: "Şablonlar",
		title : "İçerik Şablonları",
		options : "Şablon Seçenekleri",
		insertOption: "Gerçek içerikleri değiştir",
		selectPromptMsg: "Düzenleyicide açılacak şablonu seç",
		emptyListMsg : "(Şablon tanımlanmadı)"
	},

	showBlocks : "Engelleri Göster",

	stylesCombo :
	{
		label		: "Stiller",
		panelTitle 	: "Stiller",
		panelTitle1	: "Blok Stilleri",
		panelTitle2	: "Yerleşik Stiller",
		panelTitle3	: "Nesne Stilleri"
	},

	format :
	{
		label		: "Biçim",
		panelTitle	: "Paragraf Biçimi",

		tag_p		: "Normal",
		tag_pre		: "Biçimlendirilmiş",
		tag_address	: "Adres",
		tag_h1		: "Başlık 1",
		tag_h2		: "Başlık 2",
		tag_h3		: "Başlık 3",
		tag_h4		: "Başlık 4",
		tag_h5		: "Başlık 5",
		tag_h6		: "Başlık 6",
		tag_div		: "Normal (DIV)"
	},

	div :
	{
		title				: "Div Kapsayıcısı Oluştur",
		toolbar				: "Div Kapsayıcısı Oluştur",
		cssClassInputLabel	: "Stil sayfası sınıfları",
		styleSelectLabel	: "Stil",
		IdInputLabel		: "Tanıtıcı",
		languageCodeInputLabel	: " Dil Kodu",
		inlineStyleInputLabel	: "Yerleşik Stil",
		advisoryTitleInputLabel	: "Öneri başlığı",
		langDirLabel		: "Metin Yönü",
		langDirLTRLabel		: "Soldan Sağa",
		langDirRTLLabel		: "Sağdan Sola",
		edit				: "Div Düzenle",
		remove				: "Div Kaldır"
  	},

	iframe :
	{
		title		: "IFrame Özellikleri",
		toolbar		: "IFrame Ekle",
		noUrl		: "Lütfen iframe URL'sini yazın",
		scrolling	: "Kaydırma çubuklarını etkinleştir",
		border		: "Çerçeve kenarlığını göster"
	},

	font :
	{
		label		: "Yazı Tipi",
		voiceLabel	: "Yazı Tipi",
		panelTitle	: "Yazı Tipi Adı"
	},

	fontSize :
	{
		label		: "Boyut",
		voiceLabel	: "Yazı Tipi Boyutu",
		panelTitle	: "Yazı Tipi Boyutu"
	},

	colorButton :
	{
		textColorTitle	: "Metin Rengi",
		bgColorTitle	: "Arka Plan Rengi",
		panelTitle		: "Renkler",
		auto			: "Otomatik",
		more			: "Diğer Renkler..."
	},

	colors :
	{
		"000" : "Siyah",
		"800000" : "Bordo",
		"8B4513" : "Koyu Kahverengi",
		"2F4F4F" : "Koyu Kurşun Grisi",
		"008080" : "Deniz Mavisi",
		"000080" : "Lacivert",
		"4B0082" : "Çivit Mavisi",
		"696969" : "Koyu Gri",
		"B22222" : "Tuğla Kırmızısı",
		"A52A2A" : "Kahverengi",
		"DAA520" : "Başak Sarısı",
		"006400" : "Koyu Yeşil",
		"40E0D0" : "Turkuaz",
		"0000CD" : "Orta Mavi",
		"800080" : "Mor",
		"808080" : "Gri",
		"F00" : "Kırmızı",
		"FF8C00" : "Koyu Turuncu",
		"FFD700" : "Altın Rengi",
		"008000" : "Yeşil",
		"0FF" : "Camgöbeği",
		"00F" : "Mavi",
		"EE82EE" : "Mor",
		"A9A9A9" : "Soluk Gri",
		"FFA07A" : "Açık Somon",
		"FFA500" : "Turuncu",
		"FFFF00" : "Sarı",
		"00FF00" : "Açık Yeşil",
		"AFEEEE" : "Soluk Turkuaz",
		"ADD8E6" : "Açık Mavi",
		"DDA0DD" : "Erik Rengi",
		"D3D3D3" : "Açık Yeşil",
		"FFF0F5" : "Lavanta Beyazı",
		"FAEBD7" : "Antik Beyaz",
		"FFFFE0" : "Açık Sarı",
		"F0FFF0" : "Bal Rengi",
		"F0FFFF" : "Gökyüzü Mavisi",
		"F0F8FF" : "Alice Mavisi",
		"E6E6FA" : "Lavanta",
		"FFF" : "Beyaz"
	},

	scayt :
	{
		title			: "Yazarken Yazım Denetimi",
		opera_title		: "Opera tarafından desteklenmiyor",
		enable			: "SCAYT Uygulamasını Etkinleştir",
		disable			: "SCAYT Uygulamasını Devre Dışı Bırak",
		about			: "SCAYT Hakkında",
		toggle			: "SCAYT Uygulamasını Aç/Kapat",
		options			: "Seçenekler",
		langs			: "Diller",
		moreSuggestions	: "Diğer öneriler",
		ignore			: "Yoksay",
		ignoreAll		: "Tümünü Yoksay",
		addWord			: "Sözcük Ekle",
		emptyDic		: "Sözlük adı boş olmamalıdır.",

		optionsTab		: "Seçenekler",
		allCaps			: "Tüm Büyük Harfli Sözcükleri Yoksay",
		ignoreDomainNames : "Etki Alanı Adlarını Yoksay",
		mixedCase		: "Karışık Büyük/Küçük Harfi Olan Sözcükleri Yoksay",
		mixedWithDigits	: "Sayıları Olan Sözcükleri Yoksay",

		languagesTab	: "Diller",

		dictionariesTab	: "Sözlükler",
		dic_field_name	: "Sözlük adı",
		dic_create		: "Oluştur",
		dic_restore		: "Geri Yükle",
		dic_delete		: "Sil",
		dic_rename		: "Yeniden Adlandır",
		dic_info		: "Kullanıcı Sözlüğü başlangıçta Tanımlama Bilgisi içinde saklanır. Ancak Tanımlama Bilgileri boyut açısından sınırlıdır. Kullanıcı Sözlüğü, Tanımlama Bilgisinde saklanamayacak boyuta ulaştığında sunucunuzda saklanabilir. Kişisel sözlüğünüzü sunucunuzda saklamak için, sözlüğünüze ilişkin bir ad belirtmeniz gerekir. Önceden saklanmış bir sözlüğünüz varsa, lütfen adını yazın ve Geri Yükle düğmesini tıklatın.",

		aboutTab		: "Hakkında"
	},

	about :
	{
		title		: "CKEditor Hakkında",
		dlgTitle	: "CKEditor Hakkında",
		help	: "Yardım için bkz. $1",
		userGuide : "CKEditor Kullanıcı Kılavuzu",
		moreInfo	: "Lisanslama bilgileri için lütfen web sitemizi ziyaret edin:",
		copy		: "Copyright &copy; $1. Her hakkı saklıdır."
	},

	maximize : "Ekranı kapla",
	minimize : "Simge durumuna küçült",

	fakeobjects :
	{
		anchor	: "Tutturucu",
		flash	: "Flash Canlandırma",
		iframe		: "IFrame",
		hiddenfield	: "Gizli Alan",
		unknown	: "Bilinmeyen Nesne"
	},

	resize : "Yeniden boyutlandırmak için sürükleyin",

	colordialog :
	{
		title		: "Renk Seç",
		options	:	"Renk Seçenekleri",
		highlight	: "Vurgula",
		selected	: "Seçilen Renk",
		clear		: "Temizle"
	},

	toolbarCollapse	: "Araç Çubuğunu Daralt",
	toolbarExpand	: "Araç Çubuğunu Genişlet",

	toolbarGroups :
	{
		document : "Belge",
		clipboard : "Pano/Geri Al",
		editing : "Düzenleme",
		forms : "Biçimler",
		basicstyles : "Temel Stiller",
		paragraph : "Paragraf",
		links : "Bağlantılar",
		insert : "Ekle",
		styles : "Stiller",
		colors : "Renkler",
		tools : "Araçlar"
	},

	bidi :
	{
		ltr : "Soldan Sağa Metnine Değiştir",
		rtl : "Sağdan Sola Metnine Değiştir"
	},

	docprops :
	{
		label : "Belge Özellikleri",
		title : "Belge Özellikleri",
		design : "Tasarım",
		meta : "Meta Etiketleri",
		chooseColor : "Seç",
		other : "Diğer...",
		docTitle :	"Sayfa Başlığı",
		charset : 	"Karakter Kümesi Kodlaması",
		charsetOther : "Diğer Karakter Kümesi Kodlaması",
		charsetASCII : "ASCII",
		charsetCE : "Orta Avrupa",
		charsetCT : "Geleneksel Çince (Big5)",
		charsetCR : "Kiril",
		charsetGR : "Yunanca",
		charsetJP : "Japonca",
		charsetKR : "Korece",
		charsetTR : "Türkçe",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "Batı Avrupa",
		docType : "Belge Tipi Başlığı",
		docTypeOther : "Diğer Belge Tipi Başlığı",
		xhtmlDec : "XHTML Bildirimlerini Ekle",
		bgColor : "Arka Plan Rengi",
		bgImage : "Arka Plan Resim URL'si",
		bgFixed : "Kaymayan (Sabit) Arka Plan",
		txtColor : "Metin Rengi",
		margin : "Sayfa Kenar Boşlukları",
		marginTop : "Üst",
		marginLeft : "Sol",
		marginRight : "Sağ",
		marginBottom : "Alt",
		metaKeywords : "Belge Dizinleme Anahtar Sözcükleri (virgülle ayrılmış)",
		metaDescription : "Belge Açıklaması",
		metaAuthor : "Yazar",
		metaCopyright : "Telif Hakkı",
		previewHtml : "<p>Bu bir <strong>örnek metin</strong>. <a href=\"javascript:void(0)\">CKEditor</a> aracını kullanıyorsunuz.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "inç",
			widthCm	: "santimetre",
			widthMm	: "milimetre",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "punto",
			widthPc	: "pika"
		},
		table :
		{
			heightUnit	: "Yükseklik birimi:",
			insertMultipleRows : "Satır Ekle",
			insertMultipleCols : "Sütun Ekle",
			noOfRows : "Satır Sayısı:",
			noOfCols : "Sütun Sayısı:",
			insertPosition : "Konum:",
			insertBefore : "Önce",
			insertAfter : "Sonra",
			selectTable : "Tablo Seç",
			selectRow : "Satır Seç",
			columnTitle : "Sütun",
			colProps : "Sütun Özellikleri",
			invalidColumnWidth	: "Sütun genişliği bir pozitif sayı olmalıdır."
		},
		cell :
		{
			title : "Hücre"
		},
		emoticon :
		{
			angel		: "Melek",
			angry		: "Kızgın",
			cool		: "Çekici",
			crying		: "Ağlayan",
			eyebrow		: "Kaşları çatık",
			frown		: "Asık",
			goofy		: "Budala",
			grin		: "Sırıtan",
			half		: "Yarım gülümseme",
			idea		: "Fikir",
			laughing	: "Gülen",
			laughroll	: "Gülerken yuvarlanan",
			no			: "Hayır",
			oops		: "Hop",
			shy			: "Utangaç",
			smile		: "Gülümseyen",
			tongue		: "Dil çıkaran",
			wink		: "Göz kırpan",
			yes			: "Evet"
		},

		menu :
		{
			link	: "Bağlantı Ekle",
			list	: "Listele",
			paste	: "Yapıştır",
			action	: "Eylem",
			align	: "Hizala",
			emoticon: "İfade"
		},

		iframe :
		{
			title	: "IFrame"
		},

		list:
		{
			numberedTitle		: "Numaralı Liste",
			bulletedTitle		: "Madde İşaretli Liste"
		},

		// Anchor dialog
		anchor :
		{
			description	: "'Bölüm 1.2' gibi tanımlayıcı bir yer işareti adı yazın. Yer işaretini ekledikten sonra, bağlamak için 'Bağlantı' ya da 'Belge Yer İşareti Bağlantısı' simgesini tıklatın.",
			title		: "Belge Yer İşareti Bağlantısı",
			linkTo		: "Şuna bağla:"
		},

		urllink :
		{
			title : "URL Bağlantısı",
			linkText : "Bağlantı Metni:",
			selectAnchor: "Tutturucu Seç:",
			nourl: "Lütfen metin alanına bir URL girin.",
			urlhelp: "Kullanıcılar bu bağlantıyı tıklattıklarında açılacak URL'yi yazın ya da kopyalayın, örneğin http://www.ornek.com.",
			displaytxthelp: "Bağlantıya ilişkin metin görüntülemeyi yazın.",
			openinnew : "Bağlantıyı yeni pencerede açın"
		},

		spellchecker :
		{
			title : "Yazım Denetimi",
			replace : "Değiştir:",
			suggesstion : "Öneriler:",
			withLabel : "Şununla:",
			replaceButton : "Değiştir",
			replaceallButton:"Tümünü Değiştir",
			skipButton:"Atla",
			skipallButton: "Tümünü Atla",
			undochanges: "Değişiklikleri Geri Al",
			complete: "Yazım Denetimi Tamamlandı",
			problem: "XML verileri alınırken sorun oluştu",
			addDictionary: "Sözlüğe Ekle",
			editDictionary: "Sözlüğü Düzenle"
		},

		status :
		{
			keystrokeForHelp: "Yardım için ALT 0 tuşlarına basın"
		},

		linkdialog :
		{
			label : "Bağlantı İletişim Kutusu"
		},

		image :
		{
			previewText : "Metin, bu örnekte olduğu gibi eklediğiniz resmin etrafında olacak."
		}
	}

};

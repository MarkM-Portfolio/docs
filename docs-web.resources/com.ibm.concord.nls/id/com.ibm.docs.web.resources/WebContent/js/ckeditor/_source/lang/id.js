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
	editorTitle : "Editor rich text, %1.",

	// ARIA descriptions.
	toolbars	: "Toolbar editor",
	editor	: "Editor Rich Text",

	// Toolbar buttons without dialogs.
	source			: "Sumber",
	newPage			: "Halaman Baru",
	save			: "Simpan",
	preview			: "Pratinjau:",
	cut				: "Potong",
	copy			: "Salin",
	paste			: "Tempel",
	print			: "Cetak",
	underline		: "Garis Bawah",
	bold			: "Cetak Tebal",
	italic			: "Cetak Miring",
	selectAll		: "Pilih Semua",
	removeFormat	: "Hapus Format",
	strike			: "Coretan",
	subscript		: "Subskrip",
	superscript		: "Superskrip",
	horizontalrule	: "Masukkan Garis Horizontal",
	pagebreak		: "Masukkan Pemisah Halaman",
	pagebreakAlt		: "Pemisah Halaman",
	unlink			: "Hapus Tautan",
	undo			: "Batalkan",
	redo			: "Ulangi",

	// Common messages and labels.
	common :
	{
		browseServer	: "Server Browser:",
		url				: "URL:",
		protocol		: "Protokol:",
		upload			: "Unggah:",
		uploadSubmit	: "Kirim ke Server",
		image			: "Sisipkan Gambar",
		flash			: "Sisipkan Film Flash",
		form			: "Sisipkan Formulir",
		checkbox		: "Sisipkan Kotak Centang",
		radio			: "Sisipkan Tombol Radio",
		textField		: "Sisipkan Bidang Teks",
		textarea		: "Sisipkan Area Teks",
		hiddenField		: "Sisipkan Bidang Tersembunyi",
		button			: "Sisipkan Tombol",
		select			: "Sisipkan Bidang Pilihan",
		imageButton		: "Sisipkan Tombol Gambar",
		notSet			: "<not set>",
		id				: "Id:",
		name			: "Nama:",
		langDir			: "Arah Teks:",
		langDirLtr		: "Kiri ke Kanan",
		langDirRtl		: "Kanan ke Kiri Right",
		langCode		: "Kode Bahasa:",
		longDescr		: "URL Deskripsi Panjang:",
		cssClass		: "Kelas lembar gaya:",
		advisoryTitle	: "Judul advisori:",
		cssStyle		: "Gaya:",
		ok				: "OK",
		cancel			: "Batal",
		close : "Tutup",
		preview			: "Pratinjau:",
		generalTab		: "Umum",
		advancedTab		: "Lanjutan",
		validateNumberFailed	: "Nilai ini bukan angka.",
		confirmNewPage	: "Setiap perubahan yang tidak tersimpan pada konten ini akan hilang. Apakah Anda yakin ingin memuat halaman baru?",
		confirmCancel	: "Beberapa opsi telah diubah. Apakah Anda yakin ingin menutup dialog?",
		options : "Opsi",
		target			: "Target:",
		targetNew		: "Jendela Baru (_kosong)",
		targetTop		: "Jendela Topmost (_atas)",
		targetSelf		: "Jendela yang Sama (_ini)",
		targetParent	: "Jendela Induk (_induk)",
		langDirLTR		: "Kiri ke Kanan",
		langDirRTL		: "Kanan ke Kiri",
		styles			: "Gaya:",
		cssClasses		: "Kelas Lembar Gaya:",
		width			: "Lebar:",
		height			: "Tinggi:",
		align			: "Ratakan:",
		alignLeft		: "Kiri",
		alignRight		: "Kanan",
		alignCenter		: "Tengah",
		alignTop		: "Atas",
		alignMiddle		: "Tengah",
		alignBottom		: "Bawah",
		invalidHeight	: "Tinggi harus berupa bilangan bulat positif.",
		invalidWidth	: "Lebar harus berupa bilangan bulat positif.",
		invalidCssLength	: "Nilai yang ditentukan untuk bidang '%1' harus berupa bilangan positif dengan atau tanpa unit pengukuran CSS yang valid (px, %, in, cm, mm, em, ex, pt, atau pc).",
		invalidHtmlLength	: "Nilai yang ditentukan untuk bidang '%1' harus berupa bilangan positif dengan atau tanpa unit pengukuran HTML yang valid (px atau %).",
		invalidInlineStyle	: "Nilai yang ditentukan untuk gaya sebaris harus terdiri dari satu atau lebih rangkapan dengan format \"name : value\", dipisahkan oleh titik koma.",
		cssLengthTooltip	: "Masukkan angka untuk nilai dalam piksel atau angka dengan unit CSS yang valid (px, %, in, cm, mm, em, ex, pt, atau pc).",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">, tidak tersedia</span>"
	},

	contextmenu :
	{
		options : "Opsi Menu Konteks"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "Sisipkan Karakter Khusus",
		title		: "Karakter Khusus",
		options : "Opsi Karakter Khusus"
	},

	// Link dialog.
	link :
	{
		toolbar		: "Tautan URL",
		other 		: "<other>",
		menu		: "Edit Tautan...",
		title		: "Tautan",
		info		: "Informasi Tautan",
		target		: "Target",
		upload		: "Unggah:",
		advanced	: "Lanjutan",
		type		: "Tipe Tuatan:",
		toUrl		: "URL",
		toAnchor	: "Tautkan ke jangkar teks",
		toEmail		: "Email",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "Nama Bingkai Target:",
		targetPopupName	: "Nama Jendela Popup:",
		popupFeatures	: "Fitur Jendela Popup:",
		popupResizable	: "Ukuran dapat diubah",
		popupStatusBar	: "Bar Status",
		popupLocationBar	: "Bar Lokasi",
		popupToolbar	: "Toolbar",
		popupMenuBar	: "Bar Menu",
		popupFullScreen	: "Layar Penuh (IE)",
		popupScrollBars	: "Bar Gulir",
		popupDependent	: "Dependen (Netscape)",
		popupLeft		: "Posisi Kiri",
		popupTop		: "Posisi Atas",
		id				: "Id:",
		langDir			: "Arah Teks:",
		langDirLTR		: "Kiri ke Kanan",
		langDirRTL		: "Kanan ke Kiri",
		acccessKey		: "Kunci Akses:",
		name			: "Nama:",
		langCode		: "Kode Bahasa:",
		tabIndex		: "Indeks Tab:",
		advisoryTitle	: "Judul advisori:",
		advisoryContentType	: "Tipe Konten Advisori:",
		cssClasses		: "Kelas lembar gaya:",
		charset			: "Setkarakter Sumber Terhubung:",
		styles			: "Gaya:",
		rel			: "Hubungan",
		selectAnchor	: "Pilih Jangkar",
		anchorName		: "Berdasarkan Nama Jangkar",
		anchorId		: "Berdasarkan Id Elemen",
		emailAddress	: "Alamat Email",
		emailSubject	: "Subjek Pesan",
		emailBody		: "Isi Pesan",
		noAnchors		: "Tidak ada markah yang tersedia dalam dokumen. Untuk menambahkannya, klik ikon 'Masukkan Markah Dokumen' pada toolbar.",
		noUrl			: "Silakan ketik URL tautan",
		noEmail			: "Silakan ketik alamat e-mail"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "Sisipkan Markah Dokumen",
		menu		: "Edit Markah Dokumen",
		title		: "Markah Dokumen",
		name		: "Nama:",
		errorName	: "Harap masukkan nama untuk markah dokume",
		remove		: "Hapus Markah Dokumen"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "Properti Daftar Bernomor",
		bulletedTitle		: "Properti Daftar Berpoin",
		type				: "Tipe",
		start				: "Mulai",
		validateStartNumber				:"Nomor dimulainya daftar harus berupa bilangan bulat.",
		circle				: "Lingkaran",
		disc				: "Cakram",
		square				: "Persegi",
		none				: "Tidak Ada",
		notset				: "<not set>",
		armenian			: "Penomoran armenia",
		georgian			: "Penomoran georgia (an, ban, gan, dst.)",
		lowerRoman			: "Huruf kecil Romawi (i, ii, iii, iv, v, dst.)",
		upperRoman			: "Huruf besar Romawi (I, II, III, IV, V, dst.)",
		lowerAlpha			: "Huruf kecil Alpha (a, b, c, d, e, dst.)",
		upperAlpha			: "Huruf besar Alpha (A, B, C, D, E, dst.)",
		lowerGreek			: "Huruf kecil Yunani (alpha, beta, gamma, dst.)",
		decimal				: "Desimal (1, 2, 3, dst.)",
		decimalLeadingZero	: "Desimal yang diawali nol (01, 02, 03, dst.)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "Temukan dan Ganti",
		find				: "Temukan",
		replace				: "Ganti",
		findWhat			: "Temukan:",
		replaceWith			: "Ganti dengan:",
		notFoundMsg			: "Teks yang ditentukan tidak ditemukan.",
		noFindVal			: 'Diperlukan teks untuk menemukan.',
		findOptions			: "Temukan Opsi",
		matchCase			: "Cocokkan huruf",
		matchWord			: "Cocokkan keseluruhan kata",
		matchCyclic			: "Cocokkan siklik",
		replaceAll			: "Ganti Semua",
		replaceSuccessMsg	: "%1 keberadaan diganti."
	},

	// Table Dialog
	table :
	{
		toolbar		: "Sisipkan Tabel",
		title		: "Tabel",
		menu		: "Properti Tabel",
		deleteTable	: "Hapus Tabel",
		rows		: "Baris:",
		columns		: "Kolom:",
		border		: "Ukuran Tepian:",
		widthPx		: "piksel",
		widthPc		: "persen",
		widthUnit	: "Unit lebar:",
		cellSpace	: "Jarak antar sel:",
		cellPad		: "Pengisi sel:",
		caption		: "Keterangan:",
		summary		: "Ringkasan:",
		headers		: "Header:",
		headersNone		: "Tidak Ada",
		headersColumn	: "Kolom Pertama",
		headersRow		: "Baris Pertama",
		headersBoth		: "Keduanya",
		invalidRows		: "Jumlah baris harus berupa bilangan bulat yang lebih besar dari nol.",
		invalidCols		: "Jumlah kolom harus berupa bilangan bulat yang lebih besar dari nol.",
		invalidBorder	: "Ukuran tepian harus berupa bilangan positif.",
		invalidWidth	: "Lebar tabel harus berupa bilangan positif.",
		invalidHeight	: "Tinggi tabel harus berupa bilangan positif.",
		invalidCellSpacing	: "Jarak antar sel harus berupa bilangan positif.",
		invalidCellPadding	: "Pengisi sel harus berupa bilangan positif.",

		cell :
		{
			menu			: "Sel",
			insertBefore	: "Sisipkan Sel Sebelumnya",
			insertAfter		: "Sisipkan Sel Sesudahnya",
			deleteCell		: "Hapus Sel",
			merge			: "Gabungkan Sel",
			mergeRight		: "Gabung ke Kanan",
			mergeDown		: "Gabung ke Bawah",
			splitHorizontal	: "Pisah Sel Secara Horizontal",
			splitVertical	: "Pisah Sel Secara Vertikal",
			title			: "Properti Sel",
			cellType		: "Tipe Sel:",
			rowSpan			: "Rentang baris:",
			colSpan			: "Rentang kolom:",
			wordWrap		: "Kemas kata:",
			hAlign			: "Perataan Horizontal:",
			vAlign			: "Perataan Vertikal:",
			alignBaseline	: "Garis dasar",
			bgColor			: "Warna latar belakang:",
			borderColor		: "Warna tepian",
			data			: "Data",
			header			: "Header",
			yes				: "Ya",
			no				: "Tidak",
			invalidWidth	: "Lebar sel harus berupa bilangan positif.",
			invalidHeight	: "Tinggi sel harus berupa bilangan positif.",
			invalidRowSpan	: "Rentang baris harus berupa bilangan bulat positif.",
			invalidColSpan	: "Rentang kolom harus berupa bilangan bulat positif.",
			chooseColor : "Pilih"
		},

		row :
		{
			menu			: "Baris",
			insertBefore	: "Sisipkan Baris Sebelumnya",
			insertAfter		: "Sisipkan Baris Sesudahnya",
			deleteRow		: "Hapus Baris"
		},

		column :
		{
			menu			: "Kolom",
			insertBefore	: "Sisipkan Kolom Sebelumnya",
			insertAfter		: "Sisipkan Kolom Sesudahnya",
			deleteColumn	: "Hapus Kolom"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "Properti Tombol",
		text		: "Teks (Nilai):",
		type		: "Tipe:",
		typeBtn		: "Tombol",
		typeSbm		: "Kirim",
		typeRst		: "Atur ulang"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "Properti Kotak Centang",
		radioTitle	: "Properti Tombol Radio",
		value		: "Nilai:",
		selected	: "Terpilih"
	},

	// Form Dialog.
	form :
	{
		title		: "Masukkan Formulir",
		menu		: "Properti Formulir",
		action		: "Tindakan:",
		method		: "Metode:",
		encoding	: "Pengkodean:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "Pilih Properti Kolom",
		selectInfo	: "Pilih Info",
		opAvail		: "Opsi yang Tersedia",
		value		: "Nilai:",
		size		: "Ukuran:",
		lines		: "garis",
		chkMulti	: "Izinkan seleksi multipel",
		opText		: "Teks:",
		opValue		: "Nilai:",
		btnAdd		: "Tambahkan",
		btnModify	: "Modifikasi",
		btnUp		: "Atas",
		btnDown		: "Bawah",
		btnSetValue : "Atur sebagai nilai terpilih",
		btnDelete	: "Hapus"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "Properti Area Teks",
		cols		: "Kolom:",
		rows		: "Baris:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "Properti Kolom Teks",
		name		: "Nama:",
		value		: "Nilai:",
		charWidth	: "Lebar Karakter:",
		maxChars	: "Karakter Maksimum:",
		type		: "Tipe:",
		typeText	: "Teks",
		typePass	: "Kata Sandi"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "Properti Kolom Tersembunyi",
		name	: "Nama:",
		value	: "Nilai:"
	},

	// Image Dialog.
	image :
	{
		title		: "Gambar",
		titleButton	: "Properti Tombol Gambar",
		menu		: "Properti Gambar...",
		infoTab	: "Informasi Gambar",
		btnUpload	: "Kirim ke server",
		upload	: "Unggah",
		alt		: "Teks alternatif:",
		lockRatio	: "Rasio Kunci",
		resetSize	: "Atur Ulang Ukuran",
		border	: "Tepian:",
		hSpace	: "Spasi horizontal:",
		vSpace	: "Spasi Vertikal:",
		alertUrl	: "Silakan ketik URL gambar",
		linkTab	: "Tautan",
		button2Img	: "Apakah Anda ingin mengubah tombol gambar yang dipilih menjadi gambar sederhana?",
		img2Button	: "Apakah Anda ingin mengubah gambar yang dipilih menjadi tombol gambar?",
		urlMissing : "URL sumber gambar tidak ada.",
		validateBorder : "Tepian harus berupa bilangan bulat positif.",
		validateHSpace : "Spasi horizontal harus berupa bilangan bulat positif.",
		validateVSpace : "Spasi vertikal harus berupa bilangan bulat positif."
	},

	// Flash Dialog
	flash :
	{
		properties		: "Properti Flash",
		propertiesTab	: "Properti",
		title		: "Flash",
		chkPlay		: "Auto play",
		chkLoop		: "Pengulangan",
		chkMenu		: "Aktifkan menu flash",
		chkFull		: "Izinkan layar penuh",
 		scale		: "Skala:",
		scaleAll		: "Tampilkan semua",
		scaleNoBorder	: "Tanpa Tepian",
		scaleFit		: "Sesuai dengan Tepat",
		access			: "Akses skrip:",
		accessAlways	: "Selalu",
		accessSameDomain	: "Domain sama",
		accessNever	: "Tidak Pernah",
		alignAbsBottom: "Abs Bawah",
		alignAbsMiddle: "Abs Tengah",
		alignBaseline	: "Garis dasar",
		alignTextTop	: "Atas Teks",
		quality		: "Kualitas:",
		qualityBest	: "Terbaik",
		qualityHigh	: "Tinggi",
		qualityAutoHigh	: "Tinggi Otomatis",
		qualityMedium	: "Sedang",
		qualityAutoLow	: "Rendah Otomatis",
		qualityLow	: "Rendah",
		windowModeWindow	: "Jendela",
		windowModeOpaque	: "Buram",
		windowModeTransparent	: "Transparan",
		windowMode	: "Mode jendela:",
		flashvars	: "Variabel:",
		bgcolor	: "Warna latar belakang:",
		hSpace	: "Spasi horizontal:",
		vSpace	: "Spasi vertikal:",
		validateSrc : "URL tidak boleh kosong.",
		validateHSpace : "Spasi horizontal harus berupa bilangan bulat positif.",
		validateVSpace : "Spasi vertikal harus berupa bilangan bulat positif."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "Pemeriksaan Ejaan",
		title			: "Pemeriksaan Ejaan",
		notAvailable	: "Maaf, layanan tidak tersedia saat ini.",
		errorLoading	: "Kesalahan dalam memuat host layanan aplikasi: %s.",
		notInDic		: "Tidak ada dalam kamus",
		changeTo		: "Ubah menjadi",
		btnIgnore		: "Abaikan",
		btnIgnoreAll	: "Abaikan semua",
		btnReplace		: "Ganti",
		btnReplaceAll	: "Ganti Semua",
		btnUndo			: "Batalkan",
		noSuggestions	: "- Tidak ada saran -",
		progress		: "Pemeriksaan ejaan sedang berlangsung...",
		noMispell		: "Pemeriksaan ejaan selesai: Tidak ditemukan kesalahan ejaan",
		noChanges		: "Pemeriksaan ejaan selesai: Tidak ada kata yang diganti",
		oneChange		: "Pemeriksaan ejaan selesai: Satu kata diganti",
		manyChanges		: "Pemeriksaan ejaan selesai: %1 kata diganti",
		ieSpellDownload	: "Pemeriksaan ejaan tidak terinstal. Apakah Anda ingin mengunduhnya sekarang?"
	},

	smiley :
	{
		toolbar	: "Sisipkan Emoticon",
		title	: "Emoticon",
		options : "Opsi Emoticon"
	},

	elementsPath :
	{
		eleLabel : "Jalur elemen",
		eleTitle : "%1 elemen"
	},

	numberedlist : "Daftar Bernomor",
	bulletedlist : "Daftar Berpoin",
	indent : "Tambah Inden",
	outdent : "Kurangi Inden",

	bidi :
	{
		ltr : "Kiri ke Kanan",
		rtl : "Kanan ke Kiri",
	},

	justify :
	{
		left : "Rata Kiri",
		center : "Rata Kanan",
		right : "Rata Kanan",
		block : "Rata Kanan Kiri"
	},

	blockquote : "Blockquote",

	clipboard :
	{
		title		: "Tempel",
		cutError	: "Pengaturan keamanan browser Anda mencegah pemotongan otomatis. Gunakan Ctrl+X pada keyboard Anda.",
		copyError	: "Pengaturan keamanan browser Anda mencegah penyalinan otomatis. Gunakan Ctrl+C pada keyboard Anda.",
		pasteMsg	: "Tekan Ctrl+V (Cmd+V pada MAC) untuk menempel di bawah ini.",
		securityMsg	: "Keamanan browser Anda menghalangi penempelan langsung dari papan klip.",
		pasteArea	: "Area Penempelan"
	},

	pastefromword :
	{
		confirmCleanup	: "Teks yang akan Anda tempel sepertinya disalin dari Word. Apakah Anda ingin membersihkannya sebelum ditempel?",
		toolbar			: "Tempel Khusus",
		title			: "Tempel Khusus",
		error			: "Pembersihan data yang ditempel tidak dapat dilakukan karena terjadi kesalahan internal"
	},

	pasteText :
	{
		button	: "Tempel sebagai teks polos",
		title	: "Tempel sebagai Teks Polos"
	},

	templates :
	{
		button 			: "Templat",
		title : "Templat Konten",
		options : "Opsi Templat",
		insertOption: "Ganti konten yang sebenarnya",
		selectPromptMsg: "Pilih templat yang akan dibuka di editor",
		emptyListMsg : "(Tidak ada templat yang diatur)"
	},

	showBlocks : "Tampilkan Blok",

	stylesCombo :
	{
		label		: "Gaya",
		panelTitle 	: "Gaya",
		panelTitle1	: "Gaya Blok",
		panelTitle2	: "Gaya Sebaris'",
		panelTitle3	: "Gaya Objek"
	},

	format :
	{
		label		: "Format",
		panelTitle	: "Format Paragraf",

		tag_p		: "Normal",
		tag_pre		: "Terformat",
		tag_address	: "Alamat",
		tag_h1		: "Judul 1",
		tag_h2		: "Judul 2",
		tag_h3		: "Judul 3",
		tag_h4		: "Judul 4",
		tag_h5		: "Judul 5",
		tag_h6		: "Judul 6",
		tag_div		: "Normal (DIV)"
	},

	div :
	{
		title				: "Buat Kontainer Div",
		toolbar				: "Buat Kontainer Div",
		cssClassInputLabel	: "Kelas lembar gaya",
		styleSelectLabel	: "Gaya",
		IdInputLabel		: "Id",
		languageCodeInputLabel	: " Kode Bahasa",
		inlineStyleInputLabel	: "Gaya Sebaris",
		advisoryTitleInputLabel	: "Jabatan departemen",
		langDirLabel		: "Arah Teks",
		langDirLTRLabel		: "Kiri ke Kanan",
		langDirRTLLabel		: "Kanan ke Kiri",
		edit				: "Edit Div",
		remove				: "Hapus Div"
  	},

	iframe :
	{
		title		: "Properti IFrame",
		toolbar		: "Masukkan IFrame",
		noUrl		: "Silakan ketik URL iframe",
		scrolling	: "Aktifkan bar gulir",
		border		: "Tampilkan tepian frame"
	},

	font :
	{
		label		: "Font",
		voiceLabel	: "Font",
		panelTitle	: "Nama Font"
	},

	fontSize :
	{
		label		: "Ukuran",
		voiceLabel	: "Ukuran Font",
		panelTitle	: "Ukuran Font"
	},

	colorButton :
	{
		textColorTitle	: "Warna Teks",
		bgColorTitle	: "Warna Latar Belakang",
		panelTitle		: "Warna",
		auto			: "Otomatis",
		more			: "Lebih Banyak Warna..."
	},

	colors :
	{
		"000" : "Hitam",
		"800000" : "Merah tua",
		"8B4513" : "Coklat Pelana",
		"2F4F4F" : "Abu-abu Slate Tua",
		"008080" : "Teal",
		"000080" : "Biru Laut",
		"4B0082" : "Indigo",
		"696969" : "Abu-abu Tua",
		"B22222" : "Fire Brick",
		"A52A2A" : "Coklat",
		"DAA520" : "Golden Rod",
		"006400" : "Hijau Tua",
		"40E0D0" : "Turquoise",
		"0000CD" : "Biru Medium",
		"800080" : "Ungu",
		"808080" : "Abu-abu",
		"F00" : "Merah",
		"FF8C00" : "Oranye Tua",
		"FFD700" : "Emas",
		"008000" : "Hijau",
		"0FF" : "Biru Cyan",
		"00F" : "Biru",
		"EE82EE" : "Violet",
		"A9A9A9" : "Abu-abu Redup",
		"FFA07A" : "Light Salmon",
		"FFA500" : "Oranye",
		"FFFF00" : "Kuning",
		"00FF00" : "Hijau muda",
		"AFEEEE" : "Turquoise Pucat",
		"ADD8E6" : "Biru Muda",
		"DDA0DD" : "Plum",
		"D3D3D3" : "Abu-abu Muda",
		"FFF0F5" : "Lavender Blush",
		"FAEBD7" : "Putih Antique",
		"FFFFE0" : "Kuning Muda",
		"F0FFF0" : "Kuning belewah",
		"F0FFFF" : "Biru langit",
		"F0F8FF" : "Biru Alice",
		"E6E6FA" : "Lavender",
		"FFF" : "Putih"
	},

	scayt :
	{
		title			: "Periksa Ejaan Saat Anda Mengetik",
		opera_title		: "Tidak didukung oleh Opera",
		enable			: "Aktifkan SCAYT",
		disable			: "Nonaktifkan SCAYT",
		about			: "Tentang SCAYT",
		toggle			: "Aktifkan/Nonaktifkan SCAYT",
		options			: "Opsi",
		langs			: "Bahasa",
		moreSuggestions	: "Saran lebih lanjut",
		ignore			: "Abaikan",
		ignoreAll		: "Abaikan Semua",
		addWord			: "Tambah Kata",
		emptyDic		: "Nama kamus tidak boleh kosong.",

		optionsTab		: "Opsi",
		allCaps			: "Abaikan Kata dengan Huruf Kapital Semua",
		ignoreDomainNames : "Abaikan Nama Domain",
		mixedCase		: "Abaikan Kata dengan Huruf Besar dan Kecil",
		mixedWithDigits	: "Abaikan Kata dengan Angka",

		languagesTab	: "Bahasa",

		dictionariesTab	: "Kamus",
		dic_field_name	: "Nama kamus",
		dic_create		: "Buat",
		dic_restore		: "Pulihkan",
		dic_delete		: "Hapus",
		dic_rename		: "Ganti nama",
		dic_info		: "Awalnya Kamus Pengguna disimpan di Cookie. Namun, ukuran Cookie terbatas. Saat ukuran Kamus Pengguna bertambah hingga tidak dapat disimpan di Cookie, maka kamus tersebut dapat disimpan di server kami. Untuk menyimpan kamus pribadi Anda di server kami, Anda harus menentukan nama untuk kamus Anda. Jika Anda sudah memiliki kamus yang disimpan, ketik nama kamus dan klik tombol Pulihkan.",

		aboutTab		: "Tentang"
	},

	about :
	{
		title		: "Tentang CKEditor",
		dlgTitle	: "Tentang CKEditor",
		help	: "Periksa $1 untuk bantuan.",
		userGuide : "Panduan Pengguan CKEditor",
		moreInfo	: "Untuk informasi pelisensian, kunjungi situs web kami:",
		copy		: "Hak Cipta &copy; $1. Semua hak cipta dilindungi undang-undang."
	},

	maximize : "Besarkan",
	minimize : "Kecilkan",

	fakeobjects :
	{
		anchor	: "Jangkar",
		flash	: "Animasi Flash",
		iframe		: "IFrame",
		hiddenfield	: "Bidang Tersembunyi",
		unknown	: "Objek Tidak Dikenal"
	},

	resize : "Tarik untuk mengubah ukuran",

	colordialog :
	{
		title		: "Pilih Warna",
		options	:	"Opsi Warna",
		highlight	: "Soroti",
		selected	: "Warna Terpilih",
		clear		: "Hapus"
	},

	toolbarCollapse	: "Lipat Toolbar",
	toolbarExpand	: "Perluas Toolbar",

	toolbarGroups :
	{
		document : "Dokumen",
		clipboard : "Papan Klip/Batalkan",
		editing : "Mengedit",
		forms : "Bentuk",
		basicstyles : "Gaya Dasar",
		paragraph : "Paragraf",
		links : "Tautan",
		insert : "Masukkan",
		styles : "Gaya",
		colors : "Warna",
		tools : "Peralatan"
	},

	bidi :
	{
		ltr : "Ubah Teks Kiri ke Kanan",
		rtl : "Ubah Teks Kanan ke Kiri"
	},

	docprops :
	{
		label : "Properti Dokumen",
		title : "Properti Dokumen",
		design : "Desain",
		meta : "Tag Meta",
		chooseColor : "Pilih",
		other : "Lainnya...",
		docTitle :	"Judul Halaman",
		charset : 	"Pengkodean Set Karakter",
		charsetOther : "Pengkodean Set Karakter Lainnya",
		charsetASCII : "ASCII",
		charsetCE : "Eropa Tengah",
		charsetCT : "Cina Tradisional (Big5)",
		charsetCR : "Cyrillic",
		charsetGR : "Yunani",
		charsetJP : "Jepang",
		charsetKR : "Korea",
		charsetTR : "Turki",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "Eropa Barat",
		docType : "Judul Tipe Dokumen",
		docTypeOther : "Judul Tipe Dokumen Lainnya",
		xhtmlDec : "Termasuk Pernyataan XHTML",
		bgColor : "Warna Latar Belakang",
		bgImage : "URL Gambar Latar Belakang",
		bgFixed : "Latar Belakang Tidak Dapat Digulir (Tetap)",
		txtColor : "Warna Teks",
		margin : "Margin Halaman",
		marginTop : "Atas",
		marginLeft : "Kiri",
		marginRight : "Kanan",
		marginBottom : "Bawah",
		metaKeywords : "Kata Kunci Pengindeksan Dokumen (dipisahkan dengan koma)",
		metaDescription : "Uraian Dokumen",
		metaAuthor : "Penulis",
		metaCopyright : "Hak Cipta",
		previewHtml : "<p>Anda menggunakan <a href=\"javascript:void(0)\">CKEditor</a>.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "inci",
			widthCm	: "sentimeter",
			widthMm	: "millimeter",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "point",
			widthPc	: "pica"
		},
		table :
		{
			heightUnit	: "Unit tinggi:",
			insertMultipleRows : "Masukkan Baris",
			insertMultipleCols : "Masukkan Kolom",
			noOfRows : "Jumlah Baris:",
			noOfCols : "Jumlah Kolom:",
			insertPosition : "Posisi:",
			insertBefore : "sebelum",
			insertAfter : "Sesudah",
			selectTable : "Pilih Tabel",
			selectRow : "Pilih Baris",
			columnTitle : "Kolom",
			colProps : "Properti Kolom",
			invalidColumnWidth	: "Lebar kolom harus berupa bilangan positif."
		},
		cell :
		{
			title : "Sel"
		},
		emoticon :
		{
			angel		: "Malaikat",
			angry		: "Marah",
			cool		: "Keren",
			crying		: "Menangis",
			eyebrow		: "Heran",
			frown		: "Mengernyit",
			goofy		: "Bodoh",
			grin		: "Tersenyum Lebar",
			half		: "Melamun",
			idea		: "Ada Ide",
			laughing	: "Tertawa",
			laughroll	: "Tertawa terbahak-bahak",
			no			: "Tidak",
			oops		: "Ups",
			shy			: "Malu",
			smile		: "Tersenyum",
			tongue		: "Julur lidah",
			wink		: "Berkedip",
			yes			: "Ya"
		},

		menu :
		{
			link	: "Masukkan Tautan",
			list	: "Daftar",
			paste	: "Tempel",
			action	: "Tindakan",
			align	: "Ratakan",
			emoticon: "Emoticon"
		},

		iframe :
		{
			title	: "IFrame"
		},

		list:
		{
			numberedTitle		: "Daftar Bernomor",
			bulletedTitle		: "Daftar Berpoin"
		},

		// Anchor dialog
		anchor :
		{
			description	: "Ketikkan nama markah yang deskriptif, seperti 'Bagian 1.2'. Setelah memasukkan markah, klik ikon 'Tautan' atau 'Tautan Markah Dokumen' agar dapat terhubung.",
			title		: "Tautan Markah Dokumen",
			linkTo		: "Tautkan ke:"
		},

		urllink :
		{
			title : "Tautan URL",
			linkText : "Teks Tautan:",
			selectAnchor: "Pilih Jangkar:",
			nourl: "Masukkan URL ke kolom teks.",
			urlhelp: "Ketik atau tempel URL untuk dibuka saat pengguna mengklik link berikut, misalnya http://www.example.com.",
			displaytxthelp: "Ketik tampilan teks untuk tautan.",
			openinnew : "Buka tautan dalam jendela baru"
		},

		spellchecker :
		{
			title : "Periksa Ejaan",
			replace : "Ganti:",
			suggesstion : "Saran:",
			withLabel : "Dengan:",
			replaceButton : "Ganti",
			replaceallButton:"Ganti Semua",
			skipButton:"Lewati",
			skipallButton: "Lewati Semua",
			undochanges: "Batalkan Perubahan",
			complete: "Pemeriksaan Ejaan Selesai",
			problem: "Terjadi masalah saat mengambil data XML",
			addDictionary: "Tambah ke Kamus",
			editDictionary: "Edit Kamus"
		},

		status :
		{
			keystrokeForHelp: "Tekan ALT 0 untuk bantuan"
		},

		linkdialog :
		{
			label : "Dialog Tautan"
		},

		image :
		{
			previewText : "Teks akan mengalir di sekitar gambar yang Anda tambahkan seperti dalam contoh ini."
		}
	}

};

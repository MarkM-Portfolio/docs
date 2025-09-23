/*
Copyright (c) 2003-2011, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license


Portions Copyright IBM Corp., 2010-2011.
*/

CKEDITOR.plugins.setLang( "a11yhelp", "en",
{

	// When translating all fields in accessibilityHelp object, do not translate anything with the form ${xxx}
	accessibilityHelp :
	{
		title : "Petunjuk Aksesbilitas",
		contents : "Konten Bantuan. Untuk menutup dialog ini tekan ESC.",
		legend :
		[
			{
				name : "Umum",
				items :
				[
					{
						name : "Toolbar Editor",
						legend:
							"Tekan ${toolbarFocus} untuk menavigasi ke toolbar. " +
							"Pindah ke grup toolbar berikutnya dan sebelumnya dengan TAB dan SHIFT-TAB. " +
							"Pindah ke tombol toolbar berikutnya dan sebelumnya dengan TANDA PANAH KANAN atau TANDA PANAH KIRI. " +
							"Tekan SPASI atau ENTER untuk mengaktifkan tombol toolbar."
					},

					{
						name : "Dialog Editor",
						legend :
							"Dalam sebuah dialog, tekan TAB untuk menavigasi kolom dialog berikutnya, tekan SHIFT + TAB untuk berpindah ke kolom sebelumnya, tekan ENTER memasukkan dialog, tekan ESC untuk membatalkan dialog. " +
							"Untuk dialog yang memiliki beberapa halaman tab, tekan ALT + F10 untuk menavigasi ke daftar tab. " +
							"Lalu berpindah ke tab berikutnya dengan TAB ATAU TANDA PANAH KANAN. " +
							"Pindah ke tab sebelumnya dengan SHIFT + TAB atau TANDA PANAH KIRI. " +
							"Tekan SPASI atau ENTER untuk memilih halaman tab."
					},

					{
						name : "Menu Konteks Editor",
						legend :
							"Tekan ${contextMenu} atau TOMBOL APLIKASI untuk membuka menu konteks. " +
							"Lalu pindah ke opsi menu berikutnya dengan TAB atau TANDA PANAH KANAN. " +
							"Pindah ke opsi sebelumnya dengan  SHIFT+TAB atau TANDA PANAH ATAS. " +
							"Tekan SPASI atau ENTER untuk memilih opsi menu. " +
							"Buka sub-menu pada opsi terkini dengan SPASI atau ENTER atau TANDA PANAH KANAN. " +
							"Kembali ke item menu induk dengan ESC atau TANDA PANAH KIRI. " +
							"Tutup menu konteks dengan ESC."
					},

					{
						name : "Kotak Daftar Editor",
						legend :
							"Di dalam kotak daftar, pindah ke item daftar berikutnya dengan TAB ATAU TANDA PANAH BAWAH. " +
							"Pindah ke item daftar sebelumnya dengan SHIFT + TAB atau TANDA PANAH ATAS. " +
							"Tekan SPASI atau ENTER untuk memilih opsi daftar. " +
							"Tekan ESC untuk menutup kotak daftar."
					},

					{
						name : "Bar Element Path Editor (jika ada*)",
						legend :
							"Tekan ${elementsPathFocus}untuk menavigasi ke bar elements path. " +
							"Pindah ke tombol element berikutnya dengan TAB atau TANDA PANAH KANAN. " +
							"Pindah ke tombol sebelumnya dengan  SHIFT+TAB atau TANDA PANAH KIRI. " +
							"Tekan SPASI atau ENTER untuk memilih elemen pada editor"
					}
				]
			},
			{
				name : "Perintah",
				items :
				[
					{
						name : " Perintah Batalkan",
						legend : "Tekan ${undo}"
					},
					{
						name : " Perintah Ulangi",
						legend : "Tekan ${redo}"
					},
					{
						name : " Perintah tebalkan",
						legend : "Tekan ${bold}"
					},
					{
						name : " Perintah cetak miringkan",
						legend : "Tekan ${italic}"
					},
					{
						name : " Perintah garis bawahi",
						legend : "Tekan ${underline}"
					},
					{
						name : " Perintah tautan",
						legend : "Tekan ${link}"
					},
					{
						name : " Perintah Lipat Toolbar (jika tersedia*)",
						legend : "Tekan ${toolbarCollapse}"
					},
					{
						name : " Bantuan Aksesibilitas",
						legend : "Tekan ${a11yHelp}"
					}
				]
			},

			{	//added by ibm
				name : "",
				items :
				[
					{
						name : "Catatan",
						legend : "* Beberapa fitur dapat dinonaktifkan oleh administrator Anda."
					}
				]
			}
		]
	}

});

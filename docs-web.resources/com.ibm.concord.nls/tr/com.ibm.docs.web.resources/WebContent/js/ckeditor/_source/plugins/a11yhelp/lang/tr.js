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
		title : "Erişilebilirlik Yönergeleri",
		contents : "Yardım İçeriği. Bu iletişim kutusunu kapatmak için ESC tuşuna basın.",
		legend :
		[
			{
				name : "Genel",
				items :
				[
					{
						name : "Düzenleyici Araç Çubuğu",
						legend:
							"Araç çubuğuna gitmek için ${toolbarFocus} düğmesine basın. " +
							"SEKME ve ÜST KARAKTER-SEKME tuşlarıyla sonraki ve önceki araç çubuğu grubuna gidin. " +
							"SAĞ OK ya da SOL OK tuşlarıyla sonraki ve önceki araç çubuğu düğmesine gidin. " +
							"Araç çubuğu düğmesini etkinleştirmek için BOŞLUK ya da ENTER tuşuna basın."
					},

					{
						name : "Düzenleyici İletişim Kutusu",
						legend :
							"İletişim kutusunun içinde, sonraki iletişim kutusu alanına gitmek için ÜST KARAKTER + SEKME tuşlarına basın, iletişim kutusunu göndermek için ENTER tuşuna basın, iletişim kutusunu iptal etmek için ESC tuşuna basın." +
							"Birden fazla sekme sayfası olan iletişim kutularında sekme listesine gitmek için ALT + F10 tuşlarına basın." +
							"Daha sonra SEKME YA DA SAĞ OK ile sonraki sekmeye gidin. " +
							"ÜST KARAKTER + SEKME ya da SOL OK ile önceki sekmeye gidin. " +
							"Sekme sayfasını seçmek için BOŞLUK ya da ENTER tuşuna basın."
					},

					{
						name : "Düzenleyici Bağlam Menüsü",
						legend :
							"Bağlam menüsünü açmak için ${contextMenu} ya da UYGULAMA ANAHTARINA basın. " +
							"Daha sonra, SEKME ya da AŞAĞI OK ile sonraki menü seçeneğine gidin. " +
							"ÜST KARAKTER+SEKME ya da YUKARI OK ile önceki seçeneğe gidin. " +
							"Menü seçeneğini belirlemek için BOŞLUK ya da ENTER tuşuna basın. " +
							"BOŞLUK ya da ENTER ya da SAĞ OK ile geçerli seçeneğin alt menüsünü açın. " +
							"ESC ya da SOL OK ile ana menü öğesine geri gidin. " +
							"ESC ile bağlam menüsünü kapatın."
					},

					{
						name : "Düzenleyici Liste Kutusu",
						legend :
							"Liste kutusunun içinde, SEKME ya da AŞAĞI OK ile sonraki liste öğesine gidin. " +
							"ÜST KARAKTER + SEKME ya da SAĞ OK ile önceki liste öğesine gidin. " +
							"Liste seçeneğini belirlemek için BOŞLUK ya da ENTER tuşuna basın. " +
							"Liste kutusunu kapatmak için ESC tuşuna basın."
					},

					{
						name : "Düzenleyici Öğe Yolu Çubuğu (varsa*)",
						legend :
							"Öğe yolu çubuğuna gitmek için ${elementsPathFocus} düğmesine basın. " +
							"SEKME ya da SAĞ OK ile sonraki öğe düğmesine gidin. " +
							"ÜST KARAKTER+SEKME ya da SOL OK ile önceki düğmeye gidin. " +
							"Düzenleyici içinde öğeyi seçmek için BOŞLUK ya da ENTER tuşuna basın. "
					}
				]
			},
			{
				name : "Komutlar",
				items :
				[
					{
						name : " Geri al komutu",
						legend : "${undo} düğmesine basın"
					},
					{
						name : " Yinele komutu",
						legend : "${redo} düğmesine basın"
					},
					{
						name : " Kalın komutu",
						legend : "${bold} düğmesine basın"
					},
					{
						name : " İtalik komutu",
						legend : "${italic} düğmesine basın"
					},
					{
						name : " Altı çizili komutu",
						legend : "${underline} düğmesine basın"
					},
					{
						name : " Bağlantı komutu",
						legend : "${link} düğmesine basın"
					},
					{
						name : " Araç Çubuğu Daraltma komutu (varsa*)",
						legend : "${toolbarCollapse} düğmesine basın"
					},
					{
						name : " Erişilebilirlik Yardımı",
						legend : "${a11yHelp} düğmesine basın"
					}
				]
			},

			{	//added by ibm
				name : "",
				items :
				[
					{
						name : "Not",
						legend : "* Bazı özellikler yöneticiniz tarafından devre dışı bırakılabilir."
					}
				]
			}
		]
	}

});

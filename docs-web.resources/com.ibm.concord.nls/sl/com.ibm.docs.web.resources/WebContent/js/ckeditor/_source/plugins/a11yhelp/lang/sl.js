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
		title : "Navodila za dostopnost",
		contents : "Vsebina pomoči. Če želite zapreti to pogovorno okno, pritisnite ESC.",
		legend :
		[
			{
				name : "Splošno",
				items :
				[
					{
						name : "Orodna vrstica urejevalnika",
						legend:
							"Če se želite pomakniti na orodno vrstico, pritisnite ${toolbarFocus}. " +
							"Na naslednjo ali prejšnjo skupino orodne vrstice se pomaknete s TAB in SHIFT-TAB. " +
							"Na naslednji ali prejšnji gumb orodne vrstice se pomaknete s PUŠČICO LEVO ali PUŠČICO DESNO. " +
							"Gumb orodne vrstice aktivirate s PRESLEDNICO ali tipko ENTER."
					},

					{
						name : "Pogovorno okno urejevalnika",
						legend :
							"V pogovornem oknu se s tipko TAB pomaknete na naslednje polje pogovornega okna, s kombinacijo tipk SHIFT + TAB se pomaknete na prejšnje polje, z ENTER preložite pogovorno okno v obdelavo in z ESC ga prekličete. " +
							"Pri pogovornih oknih, ki imajo več strani zavihkov, se s kombinacijo tipk ALT + F10 pomaknete na seznam zavihkov. " +
							"Nato se s TAB ali PUŠČICO DESNO pomaknete na naslednji zavihek." +
							"Na prejšnji zavihek se pomaknete s SHIFT + TAB ali s PUŠČICO LEVO. " +
							"S PRESLEDNICO ali ENTER izberete stran zavihka."
					},

					{
						name : "Kontekstni meni urejevalnika",
						legend :
							"Za odpiranje kontekstnega menija pritisnite ${contextMenu} ali APLIKACIJSKO TIPKO. " +
							"Na naslednjo menijsko možnost se pomaknete s TAB ali PUŠČICO DOL. " +
							"Na naslednjo možnost se pomaknete s SHIFT+TAB ali PUŠČICO GOR. " +
							"Možnost menija izberete s PRESLEDNICO ali tipko ENTER. " +
							"Podmeni trenutne možnosti odprete s PRESLEDNICO, ali tipko ENTER ali PUŠČICO DESNO. " +
							"Nazaj na nadrejeni meni se vrnete z ESC ali PUŠČICO LEVO. " +
							"Kontekstni meni zaprete z ESC."
					},

					{
						name : "Seznamsko polje urejevalnika",
						legend :
							"Znotraj seznamskega polja se pomaknete na naslednji seznam s TAB ali PUŠČICO DOL. " +
							"Na naslednji element seznama se pomaknete s SHIFT + TAB ali PUŠČICO GOR. " +
							"Možnost seznama izberete s PRESLEDNICO ali tipko ENTER. " +
							"Seznamsko polje zaprete z ESC."
					},

					{
						name : "Vrstica poti elementa urejevalnika (če je na voljo*)",
						legend :
							"Za pomikanje med elementi vrstice poti pritisnite ${elementsPathFocus}. " +
							"Na naslednji gumb elementa se pomaknete s TAB ali PUŠČICO DESNO. " +
							"Na prejšnji gumb se pomaknete s SHIFT+TAB ali PUŠČICO LEVO. " +
							"Element v urejevalniku izberete s PRESLEDNICO ali tipko ENTER. "
					}
				]
			},
			{
				name : "Ukazi",
				items :
				[
					{
						name : " Ukaz za razveljavitev",
						legend : "Pritisnite ${undo}"
					},
					{
						name : " Ukaz za ponovno uveljavitev",
						legend : "Pritisnite ${redo}"
					},
					{
						name : " Ukaz za krepki tisk",
						legend : "Pritisnite ${bold}"
					},
					{
						name : " Ukaz za ležeči tisk",
						legend : "Pritisnite ${italic}"
					},
					{
						name : " Ukaz za podčrtano besedilo",
						legend : "Pritisnite ${underline}"
					},
					{
						name : " Ukaz za povezavo",
						legend : "Pritisnite ${link}"
					},
					{
						name : " Ukaz za strnitev orodne vrstice (če je na voljo*)",
						legend : "Pritisnite ${toolbarCollapse}"
					},
					{
						name : " Pomoč za dostopnost",
						legend : "Pritisnite ${a11yHelp}"
					}
				]
			},

			{	//added by ibm
				name : "",
				items :
				[
					{
						name : "Opomba",
						legend : "* Nekatere funkcije lahko skrbnik onemogoči."
					}
				]
			}
		]
	}

});

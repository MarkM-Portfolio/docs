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
		title : "Instrucţiuni de accesibilitate",
		contents : "Cuprins Ajutor. Pentru a închide acest dialog apăsaţi ESC.",
		legend :
		[
			{
				name : "General",
				items :
				[
					{
						name : "Bară de unelte editor",
						legend:
							"Apăsaţi ${toolbarFocus} pentru a naviga la bara de unelte. " +
							"Mutaţi-vă la grupul de bare de unelte următor şi anterior cu TAB şi SHIFT-TAB. " +
							"Mutaţi-vă la butonul bară de unelte următor şi anterior cu RIGHT ARROW sau LEFT ARROW. " +
							"Apăsaţi SPACE sau ENTER pentru a activa butonul bară de unelte."
					},

					{
						name : "Dialog editor",
						legend :
							"În interiorul unui dialog, apăsaţi TAB pentru a naviga la următorul câmp de dialog, apăsaţi SHIFT + TAB pentru a vă muta la câmpul anterior, apăsaţi ENTER pentru a lansa dialogul, apăsaţi ESC pentru a anula dialogul. " +
							"Pentru dialoguri care au pagini cu mai multe file, apăsaţi ALT + F10 pentru a naviga la lista de file. " +
							"Apoi mutaţi-vă la fila următoare cu TAB sau RIGTH ARROW. " +
							"Mutaţi-vă la fila anterioară cu SHIFT + TAB sau LEFT ARROW. " +
							"Apăsaţi SPACE sau ENTER pentru a selecta pagina filei."
					},

					{
						name : "Meniu contextual editor",
						legend :
							"Apăsaţi ${contextMenu} sau APPLICATION KEY pentru a deschide meniul contextual. " +
							"Apoi mutaţi-vă la următoare opţiune a meniului cu TAB sau DOWN ARROW. " +
							"Mutaţi-vă la opţiunea anterioară cu SHIFT+TAB sau UP ARROW. " +
							"Apăsaţi SPACE sau ENTER pentru a selecta opţiunea meniului. " +
							"Deschideţi submeniul opţiunii curente cu SPACE sau ENTER sau RIGHT ARROW. " +
							"Deplasaţi-vă înapoi la articolul de meniu părinte cu ESC sau LEFT ARROW. " +
							"Închideţi meniul contextual cu ESC."
					},

					{
						name : "Casetă listă editor",
						legend :
							"În interiorul unei casete listă, deplasaţi-vă la următorul articol din listă cu TAB sau DOWN ARROW. " +
							"Mutaţi-vă la articolul de listă anterior cu SHIFT + TAB sau UP ARROW. " +
							"Apăsaţi SPACE sau ENTER pentru a selecta opţiunea listă. " +
							"Apăsaţi ESC pentru a închide caseta listă."
					},

					{
						name : "Bară cale element editor (dacă este disponibilă*)",
						legend :
							"Apăsaţi ${elementsPathFocus} pentru a naviga la bara de cale a elementelor. " +
							"Mutaţi-vă la următorul buton element cu TAB sau RIGHT ARROW. " +
							"Mutaţi-vă la butonul anterior cu SHIFT+TAB sau LEFT ARROW. " +
							"Apăsaţi SPACE sau ENTER pentru a selecta elementul din editor."
					}
				]
			},
			{
				name : "Comenzi",
				items :
				[
					{
						name : " Comanda Anulare acţiune",
						legend : "Apăsaţi ${undo}"
					},
					{
						name : "Comanda Refacere acţiune",
						legend : "Apăsaţi ${redo}"
					},
					{
						name : " Comanda Aldin",
						legend : "Apăsaţi ${bold}"
					},
					{
						name : " Comanda Cursiv",
						legend : "Apăsaţi ${italic}"
					},
					{
						name : " Comanda Subliniere",
						legend : "Apăsaţi ${underline}"
					},
					{
						name : " Comanda Legătură",
						legend : "Apăsaţi ${link}"
					},
					{
						name : "Comandă Rstrângere bară de unelte (dacă este disponibilă*)",
						legend : "Apăsaţi ${toolbarCollapse}"
					},
					{
						name : " Ajutor de accesibilitate",
						legend : "Apăsaţi ${a11yHelp}"
					}
				]
			},

			{	//added by ibm
				name : "",
				items :
				[
					{
						name : "Notă",
						legend : "* Anumite caracteristici pot fi dezactivate de administratorul dumneavoastră."
					}
				]
			}
		]
	}

});

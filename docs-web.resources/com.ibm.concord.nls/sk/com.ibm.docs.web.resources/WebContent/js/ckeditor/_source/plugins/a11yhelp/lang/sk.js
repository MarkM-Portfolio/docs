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
		title : "Návod na používanie zjednodušeného ovládania",
		contents : "Obsah pomoci. Toto dialógové okno môžete zatvoriť stlačením klávesu Esc.",
		legend :
		[
			{
				name : "Všeobecné",
				items :
				[
					{
						name : "Lišta nástrojov editora",
						legend:
							"Ak chcete prejsť na lištu nástrojov, stlačte ${toolbarFocus}. " +
							"Ak chcete prejsť na ďalšiu alebo predošlú skupinu na lište nástrojov, použite kláves Tab a kombináciu klávesov Shift + Tab. " +
							"Ak chcete prejsť na ďalšie alebo predošlé tlačidlo na lište nástrojov, použite šípku doprava alebo šípku doľava. " +
							"Ak chcete aktivovať tlačidlo na lište nástrojov, stlačte medzerník alebo kláves Enter."
					},

					{
						name : "Dialógové okno editora",
						legend :
							"Vnútri dialógového okna, ak chcete prejsť na ďalšie pole dialógového okna, stlačte kláves Tab. ak chcete prejsť na predošlé pole, stlačte kombináciu klávesov Shift + Tab. Ak chcete odoslať dialógové okno, stlačte kláves Enter. Ak chcete zrušiť dialógové okno, stlačte kláves Esc. " +
							"Pre dialógové okná, ktoré majú viac strán záložiek, kombináciou klávesov Alt + F10 prejdete na zoznam záložiek. " +
							"Potom prejdite na ďalšiu záložku pomocou klávesu Tab alebo šípky doprava. " +
							"Ak chcete prejsť na predošlú záložku, stlačte kombináciu klávesov Shift + Tab alebo šípku doľava. " +
							"Ak chcete vybrať stránku záložky, stlačte medzerník alebo kláves Enter."
					},

					{
						name : "Kontextová ponuka editora",
						legend :
							"Ak chcete otvoriť kontextovú ponuku, stlačte ${contextMenu} alebo kláves Aplikácia. " +
							"Na ďalšiu položku ponuky prejdete stlačením klávesu Tab alebo šípky nadol. " +
							"Na predošlú položku prejdete stlačením kombinácie klávesov Shift + Tab alebo šípky nahor. " +
							"Ak chcete vybrať položku ponuky, stlačte medzerník alebo kláves Enter. " +
							"Ak chcete otvoriť podponuku aktuálnej položky, stlačte medzerník, kláves Enter alebo šípku doprava. " +
							"Ak sa chcete vrátiť na položku rodičovskej ponuky, stlačte kláves Esc alebo šípku doľava. " +
							"Ak chcete zatvoriť kontextovú ponuku, stlačte kláves Esc."
					},

					{
						name : "Zoznamové pole v editore",
						legend :
							"Vnútri zoznamového poľa môžete prejsť na ďalšiu položku zoznamu stlačením klávesu Tab alebo šípky nadol. " +
							"Ak chcete prejsť na predošlú položku zoznamu, stlačte kombináciu klávesov Shift + Tab alebo šípku nahor. " +
							"Ak chcete vybrať položku zoznamu, stlačte medzerník alebo kláves Enter. " +
							"Ak chcete zatvoriť zoznamové pole, stlačte kláves Esc."
					},

					{
						name : "Lišta cesty elementov v editore (ak je k dispozícii*)",
						legend :
							"Ak chcete prejsť na lištu cesty elementov, stlačte ${elementsPathFocus}. " +
							"Ak chcete prejsť na tlačidlo ďalšieho elementu, stlačte kláves Tab alebo šípku doprava. " +
							"Ak chcete prejsť na predošlé tlačidlo, stlačte kombináciu klávesov Shift + Tab alebo šípku doľava. " +
							"Ak chcete vybrať element v editore, stlačte medzerník alebo kláves Enter."
					}
				]
			},
			{
				name : "Príkazy",
				items :
				[
					{
						name : " Príkaz Vrátiť",
						legend : "Stlačte ${undo}"
					},
					{
						name : " Príkaz Znova vykonať",
						legend : "Stlačte ${redo}"
					},
					{
						name : " Príkaz Tučné",
						legend : "Stlačte ${bold}"
					},
					{
						name : " Príkaz Kurzíva",
						legend : "Stlačte ${italic}"
					},
					{
						name : " Príkaz Podčiarknutie",
						legend : "Stlačte ${underline}"
					},
					{
						name : " Príkaz Odkaz",
						legend : "Stlačte ${link}"
					},
					{
						name : " Príkaz Zvinúť lištu nástrojov (ak je k dispozícii*)",
						legend : "Stlačte ${toolbarCollapse}"
					},
					{
						name : " Pomoc k používaniu zjednodušeného ovládania",
						legend : "Stlačte ${a11yHelp}"
					}
				]
			},

			{	//added by ibm
				name : "",
				items :
				[
					{
						name : "Poznámka",
						legend : "* Niektoré funkcie mohol zakázať váš administrátor."
					}
				]
			}
		]
	}

});

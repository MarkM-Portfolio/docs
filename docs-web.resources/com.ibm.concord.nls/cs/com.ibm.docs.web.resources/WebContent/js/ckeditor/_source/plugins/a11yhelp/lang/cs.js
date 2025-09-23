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
		title : "Pokyny k usnadnění přístupu",
		contents : "Obsah nápovědy. Toto dialogové okno lze zavřít stisknutím klávesy ESC.",
		legend :
		[
			{
				name : "Obecné",
				items :
				[
					{
						name : "Panel nástrojů editoru",
						legend:
							"Panel nástrojů je možné aktivovat stiskem klávesy ${toolbarFocus}. " +
							"Mezi skupinami na panelu nástrojů je možné přepínat pomocí kláves TAB a SHIFT+TAB. " +
							"Mezi tlačítky je možné přepínat pomocí kláves šipka vpravo nebo šipka vlevo. " +
							"Tlačítko na panelu je možné aktivovat pomocí klávesy ENTER nebo mezerníku."
					},

					{
						name : "Dialogové okno editoru",
						legend :
							"V dialogovém okně lze stisknutím klávesy TAB přejít k dalšímu poli dialogového okna, stisknutím kombinace kláves SHIFT+TAB přejít k předchozímu poli, stisknutím klávesy ENTER odeslat obsah dialogového okna nebo stisknutím klávesy ESC dialogové okno zrušit. " +
							"Pro dialogová okna s více kartami je možné zobrazit seznam karet pomocí klávesové zkratky ALT + F10. " +
							"Na další kartu je možné se přesunout pomocí klávesy TAB nebo šipky vpravo. " +
							"Na předchozí kartu je možné se přesunout pomocí kláves SHIFT+TAB nebo šipky vlevo. " +
							"Kartu je možné vybrat stiskem klávesy ENTER nebo mezerník."
					},

					{
						name : "Kontextová nabídka editoru",
						legend :
							"Kontextovou nabídku je možné zobrazit pomocí klávesy ${contextMenu} nebo klávesy aplikace. " +
							"Mezi možnostmi nabídky můžete přepínat pomocí kláves TAB nebo šipky dolů. " +
							"Na předchozí možnost je možné přejít pomocí klávesy SHIFT+TAB nebo šipky nahoru. " +
							"Možnost v nabídce je možné vybrat pomocí mezerníku nebo klávesy ENTER. " +
							"Podnabídku je možné otevřít pomocí mezerníku, klávesy ENTER nebo šipky vpravo. " +
							"Vrátit se k nadřízené položce nabídky je možné pomocí klávesy ESC nebo šipky vlevo. " +
							"Kontextovou nabídku lze zavřít pomocí klávesy ESC."
					},

					{
						name : "Pole se seznamem editoru",
						legend :
							"V okénku se seznamem se na další položku přesunete klávesami TAB nebo šipky dolů. " +
							"Na předchozí položku je možné přejít pomocí kláves SHIFT+TAB nebo šipky nahoru. " +
							"Možnost v seznamu je možné vybrat pomocí mezerníku nebo klávesy ENTER. " +
							"Okénko se seznamem je možné zavřít pomocí klávesy ESC."
					},

					{
						name : "Panel cesty prvku editoru (pokud je k dispozici*)",
						legend :
							"K panelu cesty prvku editoru je možné přejít stiskem klávesy ${elementsPathFocus}. " +
							"Přesunout se na další tlačítko prvku je možné pomocí kláves TAB nebo šipky vpravo. " +
							"Přesunout se na předchozí tlačítko je možné pomocí kláves SHIFT+TAB nebo šipky vlevo. " +
							"Prvek v editoru je možné vybrat stisknutím mezerníku nebo klávesy ENTER."
					}
				]
			},
			{
				name : "Příkazy",
				items :
				[
					{
						name : " Příkaz Zpět",
						legend : "Stiskněte kombinaci kláves ${undo}."
					},
					{
						name : " Příkaz Znovu",
						legend : "Stiskněte kombinaci kláves ${redo}."
					},
					{
						name : " Příkaz Tučné",
						legend : "Stiskněte kombinaci kláves ${bold}."
					},
					{
						name : " Příkaz Kurzíva",
						legend : "Stiskněte kombinaci kláves ${italic}."
					},
					{
						name : " Příkaz Podtržené",
						legend : "Stiskněte kombinaci kláves ${underline}."
					},
					{
						name : " Příkaz Odkaz",
						legend : "Stiskněte kombinaci kláves ${link}."
					},
					{
						name : " Příkaz Sbalit panel nástrojů (pokud je k dispozici*)",
						legend : "Stiskněte kombinaci kláves ${toolbarCollapse}."
					},
					{
						name : " Nápověda pro usnadnění přístupu",
						legend : "Stiskněte kombinaci kláves ${a11yHelp}."
					}
				]
			},

			{	//added by ibm
				name : "",
				items :
				[
					{
						name : "Poznámka",
						legend : "* Některé funkce mohou být zakázány vaším administrátorem."
					}
				]
			}
		]
	}

});

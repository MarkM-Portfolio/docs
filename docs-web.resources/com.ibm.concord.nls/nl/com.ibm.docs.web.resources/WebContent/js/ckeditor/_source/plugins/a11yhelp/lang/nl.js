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
		title : "Toegankelijkheidsinstructies",
		contents : "Inhoudsopgave Help. Druk op Esc om dit venster te sluiten.",
		legend :
		[
			{
				name : "Algemeen",
				items :
				[
					{
						name : "Werkbalk van editor",
						legend:
							"Druk op ${toolbarFocus} om naar de werkbalk te gaan. " +
							"Ga naar volgende of vorige werkbalkgroep met Tab en Shift-Tab. " +
							"Ga naar volgende of vorige werkbalkknop met pijlen naar rechts en links. " +
							"Druk op de spatiebalk of op Enter om de werkbalkknop te activeren."
					},

					{
						name : "Editorvenster",
						legend :
							"In een venster drukt u op de tabtoets om naar het volgende dialoogveld te gaan. Druk op Shift+Tab om naar het vorige veld te gaan. Druk op Enter om de venstergegevens vast te leggen en druk op Esc om het venster te annuleren. " +
							"Voor vensters met meerdere tabpagina's drukt u op Alt+F10 om de tablijst te openen. " +
							"Ga vervolgens naar het volgende tabblad met de tabtoets of de pijl naar rechts. " +
							"Ga naar vorige tabblad met Shift+Tab of pijl naar links. " +
							"Druk op de spatiebalk of op Enter om de tabpagina te selecteren."
					},

					{
						name : "Contextmenu in editor",
						legend :
							"Druk op ${contextMenu} of op toepassingstoets om het contextmenu te openen. " +
							"Ga vervolgens naar de volgende menuoptie met de tabtoets of de pijl omlaag. " +
							"Ga naar de vorige optie met Shift+Tab of de pijl omhoog. " +
							"Druk op de spatiebalk of op Enter om de menuoptie te selecteren. " +
							"Open het submenu van de huidige optie met de spatiebalk of Enter of de pijl naar rechts. " +
							"Ga terug naar het bovenliggende menu-item en Esc of de pijl naar links. " +
							"Sluit het contextmenu met Esc."
					},

					{
						name : "Keuzelijst in editor",
						legend :
							"Ga naar het volgende item in een keuzelijst met de tabtoets of de pijl omlaag. " +
							"Ga naar het vorige lijstitem met Shift+Tab of de pijl naar links. " +
							"Druk op de spatiebalk of op Enter om de lijstoptie te selecteren. " +
							"Druk op Esc om de keuzelijst te sluiten."
					},

					{
						name : "Elementenpadbalk in editor (indien beschikbaar*)",
						legend :
							"Druk op ${elementsPathFocus} om naar de elementenpadbalk te gaan. " +
							"Ga naar de volgende elementknop met de tabtoets of de pijl naar rechts. " +
							"Ga naar de vorige knop met Shift+Tab of de pijl naar links. " +
							"Druk op de spatiebalk of op Enter om het element in de editor te selecteren."
					}
				]
			},
			{
				name : "Opdrachten",
				items :
				[
					{
						name : " Opdracht Ongedaan maken",
						legend : "Druk op ${undo}"
					},
					{
						name : " Opdracht Opnieuw uitvoeren",
						legend : "Druk op ${redo}"
					},
					{
						name : " Opdracht Vet weergeven",
						legend : "Druk op ${bold}"
					},
					{
						name : " Opdracht Cursief weergeven",
						legend : "Druk op ${italic}"
					},
					{
						name : " Opdracht Onderstrepen",
						legend : "Druk op ${underline}"
					},
					{
						name : " Opdracht Koppelen",
						legend : "Druk op ${link}"
					},
					{
						name : " Opdracht Werkbalk samenvouwen (indien beschikbaar*)",
						legend : "Druk op ${toolbarCollapse}"
					},
					{
						name : " Help bij toegankelijkheid",
						legend : "Druk op ${a11yHelp}"
					}
				]
			},

			{	//added by ibm
				name : "",
				items :
				[
					{
						name : "Opmerking",
						legend : "* Sommige functies kunnen door de beheerder worden uitgeschakeld."
					}
				]
			}
		]
	}

});

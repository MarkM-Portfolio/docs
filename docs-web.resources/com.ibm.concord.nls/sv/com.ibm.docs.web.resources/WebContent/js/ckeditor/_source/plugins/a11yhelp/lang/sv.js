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
		title : "Instruktioner för hjälpmedelsfunktioner",
		contents : "Hjälpinnehåll. Om du vill stänga dialogrutan trycker du på ESC.",
		legend :
		[
			{
				name : "Allmänt",
				items :
				[
					{
						name : "Verktygsfältet i redigeraren",
						legend:
							"Tryck på ${toolbarFocus} för att navigera till verktygsfältet. " +
							"Flytta till nästa och föregående grupp med verktygsfält med TABB och SKIFT+TABB. " +
							"Flytta till nästa och föregående verktygsfältsknapp med HÖGERPILEN och SKIFT+TABB. " +
							"Tryck på MELLANSLAG eller ENTER för att aktivera verktygsfältsknappen."
					},

					{
						name : "Dialogrutor i redigeraren",
						legend :
							"Om du vill gå till nästa fält i en dialogruta trycker du på TABB. Om du vill gå till föregående fält trycker du på SKIFT+TABB. Om du vill acceptera inställningarna och stänga dialogrutan trycker du på ENTER. Om du vill stänga dialogrutan trycker du på ESC." +
							"För dialoger som har många fliksidor trycker du på ALT+F10 för att gå till fliklistan. " +
							"Gå sedan till nästa flik med TABB eller HÖGERPILEN. " +
							"Gå till föregående flik med SKIFT+TABB eller VÄNSTERPILEN. " +
							"Tryck på MELLANSLAG eller ENTER för att välja fliksidan."
					},

					{
						name : "Kontextmenyn i redigeraren",
						legend :
							"Tryck på ${contextMenu} eller PROGRAMTANGENTEN för att öppna kontextmenyn. " +
							"Gå till nästa menyalternativ med TABB eller NEDÅTPILEN. " +
							"Gå till föregående alternativ med SKIFT+TABB eller UPPÅTPILEN. " +
							"Tryck på MELLANSLAG eller ENTER för att välja menyalternativet." +
							"Öppna undermenyn för aktuellt alternativ med BLANKSTEG, ENTER eller HÖGERPILEN." +
							"Gå tillbaka till huvudmenynalternativet med ESC eller VÄNSTERPILEN. " +
							"Om du vill stänga kontextmenyn trycker du på ESC."
					},

					{
						name : "Listrutor i redigeraren",
						legend :
							"I en listruta går du till nästa alternativ med TABB eller NEDÅTPILEN. " +
							"Gå till föregående alternativ med SKIFT+TABB eller UPPÅTPILEN. " +
							"Tryck på MELLANSLAG eller ENTER för att välja alternativet." +
							"tryck på ESC för att stänga listrutan."
					},

					{
						name : "Fältet för sökvägselement i redigeraren (om tillgängligt*)",
						legend :
							"Tryck på ${elementsPathFocus} för att gå till elementfältet. " +
							"Gå till nästa elementknapp med TABB eller HÖGERPILEN. " +
							"Gå till föregående knapp med SKIFT+TABB eller VÄNSTERPILEN. " +
							"Tryck på MELLANSLAG eller ENTER för att välja elementet i redigeraren."
					}
				]
			},
			{
				name : "Kommandon",
				items :
				[
					{
						name : " Ångra",
						legend : "Tryck på ${undo}"
					},
					{
						name : " Gör om",
						legend : "Tryck på ${redo}"
					},
					{
						name : " Fetstil",
						legend : "Tryck på ${bold}"
					},
					{
						name : " Kursiv stil",
						legend : "Tryck på ${italic}"
					},
					{
						name : " Understrykning",
						legend : "Tryck på ${underline}"
					},
					{
						name : " Länk",
						legend : "Tryck på ${link}"
					},
					{
						name : " Komprimera verktygsfält (om tillgängligt*)",
						legend : "Tryck på ${toolbarCollapse}"
					},
					{
						name : " Hjälp för hjälpmedelsfunktioner",
						legend : "Tryck på ${a11yHelp}"
					}
				]
			},

			{	//added by ibm
				name : "",
				items :
				[
					{
						name : "Anteckning",
						legend : "* Vissa funktioner kan ha avaktiverats av administratören."
					}
				]
			}
		]
	}

});

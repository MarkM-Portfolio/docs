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
		title : "Instruktioner vedr. handicapvenlighed",
		contents : "Hjælpeindhold. Tryk på Esc for at lukke dialogboksen.",
		legend :
		[
			{
				name : "Generelt",
				items :
				[
					{
						name : "Editor - værktøjslinje",
						legend:
							"Tryk på ${toolbarFocus} for at navigere til værktøjslinjen." +
							"Flyt til den næste og forrige værktøjslinjegruppe med TAB og SKIFT-TAB. " +
							"Flyt til den næste og forrige værktøjslinjeknap med HØJRE PIL eller VENSTRE PIL." +
							"Tryk på MELLEMRUM eller ENTER for at aktivere værktøjslinjeknappen."
					},

					{
						name : "Editor - Dialog",
						legend :
							"I en dialogboks skal du trykke på TAB for at navigere til det næste dialogfelt, trykke på SKIFT + TAB for at flytte til det forrige felt, trykke på ENTER for at sende dialogboksen, trykke på ESC for at annullere dialogboksen." +
							"I dialogbokse, der har flere skillebladssider, skal du trykke på ALT + F10 for at navigere til tab-list. " +
							"Flyt derefter til det næste skilleblad med TAB eller HØJRE PIL." +
							"Flyt til det forrige skilleblad med SKIFT + TAB eller VENSTRE PIL." +
							"Tryk på MELLEMRUM eller ENTER for at vælge skillebladssiden."
					},

					{
						name : "Editor - Kontekstmenu",
						legend :
							"Tryk på ${contextMenu} eller PROGRAMTASTEN for at åbne kontekstmenuen." +
							"Flyt derefter til det næste menupunkt med TAB eller PIL NED." +
							"Flyt til det forrige punkt med SKIFT+TAB eller PIL OP." +
							"Tryk på MELLEMRUM eller ENTER for at vælge menupunktet." +
							"Åbn undermenuen til det aktuelle punkt med MELLEMRUM eller ENTER eller HØJRE PIL." +
							"Gå tilbage til det overordnede menupunkt med ESC eller VENSTRE PIL." +
							"Luk kontekstmenuen med ESC."
					},

					{
						name : "Editor - Liste",
						legend :
							"I en liste kan du flytte til det næste listeelement med TAB eller PIL NED." +
							"Flyt til det forrige listeelement med SKIFT + TAB eller PIL OP." +
							"Tryk på MELLEMRUM eller ENTER for at vælge listeelementet." +
							"Tryk på ESC for at lukke listen."
					},

					{
						name : "Editor - Elementstilinje (hvis den er tilgængelig*)",
						legend :
							"Tryk på ${elementsPathFocus} for at navigere til elementstilinjen." +
							"Flyt til den næste elementknap med TAB eller HØJRE PIL." +
							"Flyt til den forrige knap med SKIFT+TAB eller VENSTRE PIL." +
							"Tryk på MELLEMRUM eller ENTER for at vælge elementet i editoren."
					}
				]
			},
			{
				name : "Kommandoer",
				items :
				[
					{
						name : "Fortryd-kommando",
						legend : "Tryk på ${undo}"
					},
					{
						name : "Gentag-kommando",
						legend : "Tryk på ${redo}"
					},
					{
						name : "Fed-kommando",
						legend : "Tryk på ${bold}"
					},
					{
						name : "Kursiv-kommando",
						legend : "Tryk på ${italic}"
					},
					{
						name : "Understreget-kommando",
						legend : "Tryk på ${underline}"
					},
					{
						name : "Link-kommando",
						legend : "Tryk på ${link}"
					},
					{
						name : "Skjul værktøjslinje-kommando (hvis den er tilgængelig*)",
						legend : "Tryk på ${toolbarCollapse}"
					},
					{
						name : "Hjælp til handicapvenlighed",
						legend : "Tryk på ${a11yHelp}"
					}
				]
			},

			{	//added by ibm
				name : "",
				items :
				[
					{
						name : "Bemærk",
						legend : "* Visse funktioner kan deaktiveres af administratoren."
					}
				]
			}
		]
	}

});

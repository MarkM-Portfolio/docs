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
		title : "Anweisungen zu Eingabehilfen",
		contents : "Hilfeinhalte: Drücken Sie Escape, um dieses Dialogfenster zu schließen.",
		legend :
		[
			{
				name : "Allgemein",
				items :
				[
					{
						name : "Editor-Symbolleiste",
						legend:
							"Drücken Sie ${toolbarFocus}, um zur Symbolleiste zu navigieren. " +
							"Gelangen Sie zur nächsten oder vorherigen Symbolleiste mit dem Tabulator bzw. Umschaltung und Tabulator. " +
							"Gelangen Sie zur nächsten oder vorherigen Symbolleistenschaltfläche mit den Tasten Rechtspfeil oder Linkspfeil. " +
							"Drücken Sie die Leer- oder Eingabetaste, um die Symbolleistenschaltfläche zu aktivieren."
					},

					{
						name : "Editor-Dialogfeld",
						legend :
							"Durch das Drücken der Tabulatortaste im Dialogfeld, gelangen Sie zum nächsten Dialogfeld bzw. mit Umschalt- und Tabulatortaste zum vorherigen Feld. Das Drücken der Eingabetaste schickt den Dialog ab, während die Escapetaste den Dialog abbricht." +
							"Bei Dialogen mit mehreren Registerkarten navigieren Sie mit ALT und F10 zur Liste der Registerkarten. " +
							"Mit der Tabulatortaste oder der Rechtspfeiltaste erreichen Sie die nächste Registerkarte. " +
							"Zur vorherigen Registerkarte gelangen Sie mit Umschalt- und Tabulatortaste oder der Linkspfeiltaste. " +
							"Drücken Sie die Leer- oder Eingabetaste, um die Registerkarte auszuwählen."
					},

					{
						name : "Editor-Kontextmenü",
						legend :
							"Drücken Sie ${contextMenu} oder die Anwendungstaste, um das Kontextmenü zu öffnen. " +
							"Mit der Tabulatortaste oder der Abwärtspfeiltaste navigieren Sie zur nächsten Menüoption. " +
							"Mit der Umschalt- und Tabulatortaste oder der Aufwärtspfeiltaste navigieren Sie zur vorherigen Option. " +
							"Drücken Sie die Leer- oder Eingabetaste, um die Menüoption auszuwählen. " +
							"Öffnen Sie ein Untermenü der aktuellen Option mit der Leer- oder Eingabetaste oder der Rechtspfeiltaste. " +
							"Mit der Escapetaste oder Linkspfeiltaste navigieren Sie zum übergeordneten Menüelement zurück. " +
							"Schließen Sie das Kontextmenü mit der Escapetaste."
					},

					{
						name : "Editor-Listenfenster",
						legend :
							"Innerhalb eines Listenfensters navigieren Sie zum nächsten Listeneintrag mit der Tabulator- oder der Abwärtspfeiltaste. " +
							"Zur vorherigen Listeneintrag navigieren Sie per Umschalt- und Tabulatortaste oder der Aufwärtspfeiltaste. " +
							"Drücken Sie die Leer- oder Eingabetaste, um die Listenoption auszuwählen. " +
							"Drücken Sie die Escapetaste, um das Listenfenster zu schließen."
					},

					{
						name : "Editor-Elementpfadleiste (wenn verfügbar*)",
						legend :
							"Drücken Sie ${elementsPathFocus}, um zur Elementpfadleiste zu navigieren. " +
							"Mit der Tabulator- oder Rechtspfeiltaste navigieren Sie zur nächsten Elementschaltfläche. " +
							"Mit der Umschalt- und Tabulatortaste bzw. der Linkspfeiltaste gelangen Sie zur vorherigen Schaltfläche. " +
							"Drücken Sie die Leerzeichen- oder Eingabetaste, um im Editor das Element auszuwählen."
					}
				]
			},
			{
				name : "Befehle",
				items :
				[
					{
						name : " Widerrufsbefehl",
						legend : "Drücken Sie ${undo}"
					},
					{
						name : " Wiederherstellenbefehl",
						legend : "Drücken Sie ${redo}"
					},
					{
						name : " Fettformatierungsbefehl",
						legend : "Drücken Sie ${bold}"
					},
					{
						name : " Kursivformatierungsbefehl",
						legend : "Drücken Sie ${italic}"
					},
					{
						name : " Unterstreichungsbefehl",
						legend : "Drücken Sie ${underline}"
					},
					{
						name : " Link-Befehl",
						legend : "${link}"
					},
					{
						name : " Befehl zum Ausblenden der Symbolleiste (falls verfügbar*)",
						legend : "Drücken Sie ${toolbarCollapse}"
					},
					{
						name : " Hilfstexte zu den Eingabehilfen",
						legend : "Drücken Sie ${a11yHelp}"
					}
				]
			},

			{	//added by ibm
				name : "",
				items :
				[
					{
						name : "Anmerkung",
						legend : "* Einige Funktionen können durch Ihren Administrator inaktiviert werden."
					}
				]
			}
		]
	}

});

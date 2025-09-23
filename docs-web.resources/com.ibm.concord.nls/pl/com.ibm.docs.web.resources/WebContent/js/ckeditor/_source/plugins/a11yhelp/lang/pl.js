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
		title : "Instrukcje dotyczące ułatwień dostępu",
		contents : "Spis treści pomocy. Aby zamknąć to okno dialogowe, naciśnij klawisz ESC.",
		legend :
		[
			{
				name : "Ogólne",
				items :
				[
					{
						name : "Pasek narzędzi edytora",
						legend:
							"Do nawigowania po pasku narzędzi służy klawisz ${toolbarFocus}. " +
							"Aby przechodzić między następną i poprzednią grupą paska narzędzi, naciśnij klawisz TAB lub klawisze SHIFT+TAB. " +
							"Aby przechodzić między następnym i poprzednim przyciskiem paska narzędzi, naciśnij klawisz strzałki w prawo lub w lewo. " +
							"Aby aktywować przycisk paska narzędzi, naciśnij spację lub klawisz Enter."
					},

					{
						name : "Okno dialogowe edytora",
						legend :
							"Aby w oknie dialogowym przejść do następnego pola, należy nacisnąć klawisz TAB. W celu przejścia do poprzedniego pola należy nacisnąć klawisze SHIFT+TAB. Aby wysłać dane z okna dialogowego, należy nacisnąć klawisz Enter. Aby anulować zmiany wprowadzone w oknie dialogowym, należy nacisnąć klawisz Esc." +
							"Aby w oknie dialogowym z wieloma kartami przejść do listy kart, należy nacisnąć klawisze ALT + F10." +
							"Aby przejść do następnej karty, należy nacisnąć klawisz TAB lub strzałkę w prawo. " +
							"Aby przejść do poprzedniej karty, należy nacisnąć klawisze SHIFT + TAB lub strzałkę w lewo. " +
							"Aby wybrać stronę karty, należy nacisnąć klawisz spacji lub Enter."
					},

					{
						name : "Menu kontekstowe edytora",
						legend :
							"Aby otworzyć menu kontekstowe, należy nacisnąć ${contextMenu} lub KLAWISZ APLIKACJI. " +
							"Następnie można przejść do kolejnej opcji menu, używając klawisza TAB lub strzałki w dół." +
							"Aby przejść do poprzedniej opcji, należy nacisnąć klawisze SHIFT+TAB lub strzałkę w górę." +
							"Aby wybrać opcję menu, należy nacisnąć klawisz spacji lub Enter." +
							"W celu otwarcia podmenu bieżącej opcji należy nacisnąć klawisz spacji, klawisz Enter lub klawisz strzałki w prawo. " +
							"Aby powrócić do nadrzędnego elementu menu, należy nacisnąć klawisz Esc lub klawisz strzałki w lewo. " +
							"Aby zamknąć menu kontekstowe, należy nacisnąć klawisz Esc."
					},

					{
						name : "Pole listy edytora",
						legend :
							"Aby wewnątrz pola listy przejść do następnej pozycji listy, należy nacisnąć klawisz TAB lub klawisz strzałki w dół. " +
							"Aby przejść do poprzedniej pozycji listy, należy nacisnąć klawisze SHIFT+TAB lub klawisz strzałki w górę. " +
							"W celu wybrania opcji listy należy nacisnąć klawisz spacji lub klawisz Enter. " +
							"Aby zamknąć pole listy, należy nacisnąć klawisz Esc."
					},

					{
						name : "Pasek ścieżki elementów edytora (jeśli jest dostępny*)",
						legend :
							"Do nawigowania po pasku ścieżki elementów służy klawisz ${elementsPathFocus}. " +
							"Aby przejść do kolejnego przycisku, należy nacisnąć klawisz TAB lub klawisz strzałki w prawo. " +
							"Aby przejść do poprzedniego przycisku, należy nacisnąć klawisze SHIFT+TAB lub klawisz strzałki w lewo. " +
							"Aby wybrać element w edytorze, należy nacisnąć spację lub klawisz Enter."
					}
				]
			},
			{
				name : "Komendy",
				items :
				[
					{
						name : " Komenda Cofnij",
						legend : "Naciśnij ${undo}."
					},
					{
						name : " Komenda Ponów",
						legend : "Naciśnij ${redo}."
					},
					{
						name : " Komenda Pogrubienie",
						legend : "Naciśnij ${bold}."
					},
					{
						name : " Komenda Kursywa",
						legend : "Naciśnij ${italic}."
					},
					{
						name : " Komenda Podkreślenie",
						legend : "Naciśnij ${underline}."
					},
					{
						name : " Komenda Odsyłacz",
						legend : "Naciśnij ${link}."
					},
					{
						name : " Komenda Zwiń pasek narzędzi (jeśli jest dostępny*)",
						legend : "Naciśnij ${toolbarCollapse}."
					},
					{
						name : " Pomoc dotycząca ułatwień dostępu",
						legend : "Naciśnij ${a11yHelp}."
					}
				]
			},

			{	//added by ibm
				name : "",
				items :
				[
					{
						name : "Uwaga",
						legend : "* Niektóre funkcje mogą być wyłączone przez administratora."
					}
				]
			}
		]
	}

});

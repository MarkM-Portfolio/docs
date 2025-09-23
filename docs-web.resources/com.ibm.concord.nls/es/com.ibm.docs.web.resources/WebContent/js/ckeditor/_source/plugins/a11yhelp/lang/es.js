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
		title : "Instrucciones de accesibilidad",
		contents : "Contenidos de la Ayuda. Para cerrar el diálogo pulse ESC.",
		legend :
		[
			{
				name : "General",
				items :
				[
					{
						name : "Barra de herramientas del editor",
						legend:
							"Pulse ${toolbarFocus} para ir a la barra de herramientas. " +
							"Vaya al grupo de barra de herramientas siguiente y anterior con TAB y MAYÚS-TAB. " +
							"Vaya al botón de barra de herramientas siguiente y anterior con FLECHA DERECHA o FLECHA IZQUIERDA. " +
							"Pulse ESPACIO o INTRO para activar el botón de barra de herramientas."
					},

					{
						name : "Diálogo del editor",
						legend :
							"Dentro de un diálogo, pulse la tecla tabulador para ir al siguiente campo del diálogo, pulse las teclas Mayús+Tab para ir al campo anterior, pulse Intro para enviar el diálogo, pulse Esc para cancelar el diálogo." +
							"Para diálogos que tienen que ver con varias páginas de fichas, pulse ALT + F10 para navegar a pestaña-lista. " +
							"A continuación, vaya a la ficha siguiente con TAB O FLECHA DERECHA. " +
							"Vaya a la ficha anterior con MAYÚS + TAB o FLECHA IZQUIERDA. " +
							"Pulse ESPACIO o INTRO para seleccionar la página del separador."
					},

					{
						name : "Menú de contexto del editor",
						legend :
							"Pulse ${contextMenu} o TECLA DE APLICACIÓN para abrir el menú contextual. " +
							"A continuación, vaya a la siguiente opción de menú con TAB o FLECHA ABAJO. " +
							"Vaya a la opción anterior con MAYÚS+TAB o FLECHA ARRIBA. " +
							"Pulse ESPACIO o INTRO para seleccionar la opción de menú. " +
							"Abra el submenú de opción actual con ESPACIO o INTRO o FLECHA DERECHA. " +
							"Vaya al elemento de menú padre con ESC o FLECHA IZQUIERDA. " +
							"Cierre el menú de contexto con ESC."
					},

					{
						name : "Recuadro de lista del editor",
						legend :
							"Dentro de un recuadro de lista, vaya al siguiente elemento de la lista con TAB O FLECHA ABAJO. " +
							"Vaya al elemento de lista anterior con MAYÚS + TAB o FLECHA ARRIBA. " +
							"Pulse ESPACIO o INTRO para seleccionar la opción de lista. " +
							"Pulse ESC para cerrar el recuadro de lista."
					},

					{
						name : "Barra de vía de acceso de elementos del editor (si está disponible*)",
						legend :
							"Pulse ${elementsPathFocus} para ir a la barra de vía de acceso de elementos. " +
							"Vaya al botón del elemento siguiente con TAB o FLECHA DERECHA. " +
							"Vaya al botón anterior con MAYÚS+TAB o FLECHA IZQUIERDA. " +
							"Pulse ESPACIO o INTRO para seleccionar el elemento en el editor."
					}
				]
			},
			{
				name : "Mandatos",
				items :
				[
					{
						name : " Mandato Deshacer",
						legend : "Pulse ${undo}"
					},
					{
						name : " Mandato Rehacer",
						legend : "Pulse ${redo}"
					},
					{
						name : " Mandato Negrita",
						legend : "Pulse ${bold}"
					},
					{
						name : " Mandato Cursiva",
						legend : "Pulse ${italic}"
					},
					{
						name : " Mandato Subrayado",
						legend : "Pulse ${underline}"
					},
					{
						name : " Mandato Enlazar",
						legend : "Pulse ${link}"
					},
					{
						name : " Mandato Contraer barra de herramientas (si está disponible*)",
						legend : "Pulse ${toolbarCollapse}"
					},
					{
						name : " Ayuda para la accesibilidad",
						legend : "Pulse ${a11yHelp}"
					}
				]
			},

			{	//added by ibm
				name : "",
				items :
				[
					{
						name : "Nota",
						legend : "* Algunas características las puede inhabilitar el administrador."
					}
				]
			}
		]
	}

});

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
		title : "Instruções de acessibilidade",
		contents : "Conteúdo da ajuda. Para fechar esta caixa de diálogo prima ESC.",
		legend :
		[
			{
				name : "Geral",
				items :
				[
					{
						name : "Barra de ferramentas do editor",
						legend:
							"Prima ${toolbarFocus} para navegar até à barra de ferramentas. " +
							"Aceda ao grupo da barra de ferramentas seguinte e anterior com as teclas TAB e SHIFT-TAB. " +
							"Aceda ao botão da barra de ferramentas seguinte e anterior com as teclas SETA PARA A DIREITA ou SETA PARA A ESQUERDA. " +
							"Prima BARRA DE ESPAÇOS ou ENTER para activar o botão da barra de ferramentas."
					},

					{
						name : "Caixa de diálogo do editor",
						legend :
							"Numa caixa de diálogo, prima TAB para navegar até ao campo seguinte da caixa de diálogo, prima SHIFT + TAB para aceder ao campo anterior, prima ENTER para submeter a caixa de diálogo e prima ESC para cancelar a caixa de diálogo. " +
							"Para caixas de diálogo com vários separadores, prima ALT + F10 para navegar até à lista de separadores. " +
							"Em seguida, aceda ao separador seguinte com a tecla TAB ou SETA PARA A DIREITA. " +
							"Aceda ao separador anterior com as teclas SHIFT + TAB ou SETA PARA A ESQUERDA. " +
							"Prima BARRA DE ESPAÇOS ou ENTER para seleccionar o separador."
					},

					{
						name : "Menu contextual do editor",
						legend :
							"Prima ${contextMenu} ou TECLA DE APLICAÇÃO para abrir o menu contextual. " +
							"Em seguida, aceda à opção de menu seguinte com a tecla TAB ou SETA PARA BAIXO. " +
							"Aceda à opção anterior com as teclas SHIFT+TAB ou SETA PARA CIMA. " +
							"Prima BARRA DE ESPAÇOS ou ENTER para seleccionar a opção de menu." +
							"Abra o submenu da opção actual com a tecla BARRA DE ESPAÇOS, ENTER ou SETA PARA A DIREITA. " +
							"Regresse ao item de menu ascendente com a tecla ESC ou SETA PARA A ESQUERDA. " +
							"Feche o menu contextual com a tecla ESC."
					},

					{
						name : "Caixa de lista do editor",
						legend :
							"Numa caixa de lista, aceda ao item seguinte da lista com a tecla TAB ou SETA PARA BAIXO. " +
							"Aceda ao item anterior da lista com as teclas SHIFT + TAB ou SETA PARA CIMA. " +
							"Prima BARRA DE ESPAÇOS ou ENTER para seleccionar a opção da lista." +
							"Prima ESC para fechar a caixa de lista."
					},

					{
						name : "Barra de caminho de elementos do editor (se disponível*)",
						legend :
							"Prima ${elementsPathFocus} para navegar até à barra de caminho de elementos. " +
							"Aceda ao botão seguinte do elemento com a tecla TAB ou SETA PARA A DIREITA. " +
							"Aceda ao botão anterior com as teclas SHIFT+TAB ou SETA PARA A ESQUERDA. " +
							"Prima BARRA DE ESPAÇOS ou ENTER para seleccionar o elemento no editor."
					}
				]
			},
			{
				name : "Comandos",
				items :
				[
					{
						name : " Comando Anular",
						legend : "Prima ${undo}"
					},
					{
						name : " Comando Refazer",
						legend : "Prima ${redo}"
					},
					{
						name : " Comando Negrito",
						legend : "Prima ${bold}"
					},
					{
						name : " Comando Itálico",
						legend : "Prima ${italic}"
					},
					{
						name : " Comando Sublinhado",
						legend : "Prima ${underline}"
					},
					{
						name : " Comando Ligação",
						legend : "Prima ${link}"
					},
					{
						name : " Comando Contrair barra de ferramentas (se disponível*)",
						legend : "Prima ${toolbarCollapse}"
					},
					{
						name : " Ajuda de acessibilidade",
						legend : "Prima ${a11yHelp}"
					}
				]
			},

			{	//added by ibm
				name : "",
				items :
				[
					{
						name : "Nota",
						legend : "* Algumas funções podem ser desactivadas pelo administrador."
					}
				]
			}
		]
	}

});

/*
Copyright (c) 2003-2011, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license


Portions Copyright IBM Corp., 2010-2011.
*/

/**
 * @fileOverview Defines the {@link CKEDITOR.lang} object, for the English
 *		language. This is the base file for all translations.
 */

/**#@+
   @type String
   @example
*/

/**
 * Constains the dictionary of language entries.
 * @namespace
 */
// NLS_ENCODING=UTF-8
// NLS_MESSAGEFORMAT_NONE
// G11N GA UI

CKEDITOR.lang["en"] =
{
	/**
	 * #STAT_NON_TRANSLATABLE <for dir: 'dir'>
	 * Please pay attention to variable 'dir' when translating:
	 * Only in 'Arabic' 'Persian' 'Hebrew' make dir a 'rtl' (dir : 'rtl'),
	 * Other languages DO NOT need to translate on variable 'dir', leave it as (dir: 'ltr')
	 */
	dir : "ltr",

	/*
	 * #END_NON_TRANSLATABLE <for dir: 'dir'>
	 */
	editorTitle : "Editor de rich text, %1.",

	// ARIA descriptions.
	toolbars	: "Barras de ferramentas do editor",
	editor	: "Editor de rich text",

	// Toolbar buttons without dialogs.
	source			: "Origem",
	newPage			: "Nova página",
	save			: "Guardar",
	preview			: "Pré-visualizar:",
	cut				: "Cortar",
	copy			: "Copiar",
	paste			: "Colar",
	print			: "Imprimir",
	underline		: "Sublinhado",
	bold			: "Negrito",
	italic			: "Itálico",
	selectAll		: "Seleccionar tudo",
	removeFormat	: "Remover formatação",
	strike			: "Rasurado",
	subscript		: "Inferior à linha",
	superscript		: "Superior à linha",
	horizontalrule	: "Inserir linha horizontal",
	pagebreak		: "Inserir quebra de página",
	pagebreakAlt		: "Quebra de página",
	unlink			: "Remover ligação",
	undo			: "Anular",
	redo			: "Refazer",

	// Common messages and labels.
	common :
	{
		browseServer	: "Servidor do navegador:",
		url				: "URL:",
		protocol		: "Protocolo:",
		upload			: "Transferir:",
		uploadSubmit	: "Enviar para o servidor",
		image			: "Inserir imagem",
		flash			: "Inserir vídeo Flash",
		form			: "Inserir formulário",
		checkbox		: "Inserir caixa de verificação",
		radio			: "Inserir botão de opção",
		textField		: "Inserir campo de texto",
		textarea		: "Inserir área de texto",
		hiddenField		: "Inserir campo oculto",
		button			: "Inserir botão",
		select			: "Inserir campo de selecção",
		imageButton		: "Inserir botão de imagem",
		notSet			: "<not set>",
		id				: "ID:",
		name			: "Nome:",
		langDir			: "Direcção do texto:",
		langDirLtr		: "Esquerda para a direita",
		langDirRtl		: "Direita para a esquerda",
		langCode		: "Código de idioma:",
		longDescr		: "URL de descrição longa:",
		cssClass		: "Classes de folha de estilos:",
		advisoryTitle	: "Título informativo:",
		cssStyle		: "Estilo:",
		ok				: "OK",
		cancel			: "Cancelar",
		close : "Fechar",
		preview			: "Pré-visualizar:",
		generalTab		: "Geral",
		advancedTab		: "Avançadas",
		validateNumberFailed	: "Este valor não corresponde a um número.",
		confirmNewPage	: "Serão perdidas todas as alterações não guardadas a este conteúdo. Tem a certeza de que pretende carregar a nova página?",
		confirmCancel	: "Algumas das opções foram alteradas. Tem a certeza de que pretende fechar a caixa de diálogo?",
		options : "Opções",
		target			: "Destino:",
		targetNew		: "Nova janela (_blank)",
		targetTop		: "Janela superior (_top)",
		targetSelf		: "Mesma janela (_self)",
		targetParent	: "Janela ascendente (_parent)",
		langDirLTR		: "Esquerda para a direita",
		langDirRTL		: "Direita para a esquerda",
		styles			: "Estilo:",
		cssClasses		: "Classes de folha de estilos:",
		width			: "Largura:",
		height			: "Altura:",
		align			: "Alinhar:",
		alignLeft		: "Esquerda",
		alignRight		: "Direita",
		alignCenter		: "Centro",
		alignTop		: "Superior",
		alignMiddle		: "Centro",
		alignBottom		: "Inferior",
		invalidHeight	: "A altura tem de corresponder a um número inteiro positivo.",
		invalidWidth	: "A largura tem de corresponder a um número inteiro positivo.",
		invalidCssLength	: "O valor especificado para o campo '%1' tem de corresponder a um número positivo com ou sem uma unidade de medição de CSS válida (px, %, pol, cm, mm, em, ex, pt ou pc).",
		invalidHtmlLength	: "O valor especificado para o campo '%1' tem de corresponder a um número positivo com ou sem uma unidade de medição de HTML válida (px ou %).",
		invalidInlineStyle	: "O valor especificado para o estilo incluído tem de consistir numa ou mais enuplas com o formato de \"name : value\", separadas por ponto e vírgula.",
		cssLengthTooltip	: "Introduza um número para um valor em píxeis ou um número com uma unidade de CSS válida (px, %, pol, cm, mm, em, ex, pt ou pc).",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">, indisponível</span>"
	},

	contextmenu :
	{
		options : "Opções do menu contextual"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "Inserir carácter especial",
		title		: "Carácter especial",
		options : "Opções de carácter especial"
	},

	// Link dialog.
	link :
	{
		toolbar		: "Ligação de URL",
		other 		: "<other>",
		menu		: "Editar ligação...",
		title		: "Ligação",
		info		: "Informações da ligação",
		target		: "Destino",
		upload		: "Transferir:",
		advanced	: "Avançadas",
		type		: "Tipo de ligação:",
		toUrl		: "URL",
		toAnchor	: "Ligação à âncora no texto",
		toEmail		: "Correio electrónico",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "Nome da moldura de destino:",
		targetPopupName	: "Nome da janela instantânea:",
		popupFeatures	: "Características da janela instantânea:",
		popupResizable	: "Redimensionável",
		popupStatusBar	: "Barra de estado",
		popupLocationBar	: "Barra de localização",
		popupToolbar	: "Barra de ferramentas",
		popupMenuBar	: "Barra de menus",
		popupFullScreen	: "Ecrã completo (IE)",
		popupScrollBars	: "Barras de deslocamento",
		popupDependent	: "Dependente (Netscape)",
		popupLeft		: "Posição à esquerda",
		popupTop		: "Posição superior",
		id				: "ID:",
		langDir			: "Direcção do texto:",
		langDirLTR		: "Esquerda para a direita",
		langDirRTL		: "Direita para a esquerda",
		acccessKey		: "Tecla de acesso:",
		name			: "Nome:",
		langCode		: "Código de idioma:",
		tabIndex		: "Índice de separadores:",
		advisoryTitle	: "Título informativo:",
		advisoryContentType	: "Tipo de conteúdo informativo:",
		cssClasses		: "Classes de folha de estilos:",
		charset			: "Conjunto de caracteres do recurso ligado:",
		styles			: "Estilo:",
		rel			: "Relação",
		selectAnchor	: "Seleccionar uma âncora",
		anchorName		: "Por nome da âncora",
		anchorId		: "Por ID do elemento",
		emailAddress	: "Endereço de correio electrónico",
		emailSubject	: "Assunto da mensagem",
		emailBody		: "Corpo da mensagem",
		noAnchors		: "Não existem marcadores disponíveis no documento. Faça clique no ícone 'Inserir marcador do documento' na barra de ferramentas para adicionar um marcador.",
		noUrl			: "Introduza o URL da ligação",
		noEmail			: "Introduza o endereço de correio electrónico"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "Inserir marcador do documento",
		menu		: "Editar marcador do documento",
		title		: "Marcador do documento",
		name		: "Nome:",
		errorName	: "Introduza um nome para o marcador do documento",
		remove		: "Remover marcador do documento"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "Propriedades da lista numerada",
		bulletedTitle		: "Propriedades da lista marcada",
		type				: "Tipo",
		start				: "Início",
		validateStartNumber				:"O número inicial da lista tem de ser um número inteiro.",
		circle				: "Círculo",
		disc				: "Disco",
		square				: "Quadrado",
		none				: "Nenhum",
		notset				: "<not set>",
		armenian			: "Numeração arménia",
		georgian			: "Numeração georgiana (an, ban, gan, etc.)",
		lowerRoman			: "Numeração romana em minúsculas (i, ii, iii, iv, v, etc.)",
		upperRoman			: "Numeração romana em maiúsculas (I, II, III, IV, V, etc.)",
		lowerAlpha			: "Lista alfabética em minúsculas (a, b, c, d, e, etc.)",
		upperAlpha			: "Lista alfabética em maiúsculas (A, B, C, D, E, etc.)",
		lowerGreek			: "Grego em minúsculas (alfa, beta, gama, etc.)",
		decimal				: "Decimal (1, 2, 3, etc.)",
		decimalLeadingZero	: "Decimal com zero à esquerda (01, 02, 03, etc.)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "Localizar e substituir",
		find				: "Localizar",
		replace				: "Substituir",
		findWhat			: "Localizar:",
		replaceWith			: "Substituir por:",
		notFoundMsg			: "O texto especificado não foi localizado.",
		noFindVal			: 'O texto a localizar é requerido.',
		findOptions			: "Opções de localização",
		matchCase			: "Correspondência de maiúsculas/minúsculas",
		matchWord			: "Correspondência de palavras inteiras",
		matchCyclic			: "Correspondência cíclica",
		replaceAll			: "Substituir tudo",
		replaceSuccessMsg	: "%1 ocorrência(s) substituída(s)."
	},

	// Table Dialog
	table :
	{
		toolbar		: "Inserir tabela",
		title		: "Tabela",
		menu		: "Propriedades da tabela",
		deleteTable	: "Eliminar tabela",
		rows		: "Linhas:",
		columns		: "Colunas:",
		border		: "Tamanho do contorno:",
		widthPx		: "píxeis",
		widthPc		: "percentagem",
		widthUnit	: "Unidade de largura:",
		cellSpace	: "Espaçamento de células:",
		cellPad		: "Preenchimento de células:",
		caption		: "Legenda:",
		summary		: "Resumo:",
		headers		: "Cabeçalhos:",
		headersNone		: "Nenhum",
		headersColumn	: "Primeira coluna",
		headersRow		: "Primeira linha",
		headersBoth		: "Ambos",
		invalidRows		: "O número de linhas tem de corresponder a um número inteiro superior a zero.",
		invalidCols		: "O número de colunas tem de corresponder a um número inteiro superior a zero.",
		invalidBorder	: "O tamanho do contorno tem de corresponder a um número positivo.",
		invalidWidth	: "A largura da tabela tem de corresponder a um número positivo.",
		invalidHeight	: "A altura da tabela tem de corresponder a um número positivo.",
		invalidCellSpacing	: "O espaçamento de células tem de corresponder a um número positivo.",
		invalidCellPadding	: "O preenchimento de células tem de corresponder a um número positivo.",

		cell :
		{
			menu			: "Célula",
			insertBefore	: "Inserir célula antes",
			insertAfter		: "Inserir célula depois",
			deleteCell		: "Eliminar células",
			merge			: "Unir células",
			mergeRight		: "Unir à direita",
			mergeDown		: "Unir para baixo",
			splitHorizontal	: "Dividir célula na horizontal",
			splitVertical	: "Dividir célula na vertical",
			title			: "Propriedades da célula",
			cellType		: "Tipo de célula:",
			rowSpan			: "Amplitude das linhas:",
			colSpan			: "Amplitude das colunas:",
			wordWrap		: "Translineação:",
			hAlign			: "Alinhamento horizontal:",
			vAlign			: "Alinhamento vertical:",
			alignBaseline	: "Linha de base",
			bgColor			: "Cor de segundo plano:",
			borderColor		: "Cor do contorno:",
			data			: "Dados",
			header			: "Cabeçalho",
			yes				: "Sim",
			no				: "Não",
			invalidWidth	: "A largura da célula tem de corresponder a um número positivo.",
			invalidHeight	: "A altura da célula tem de corresponder a um número positivo.",
			invalidRowSpan	: "A amplitude das linhas tem de corresponder a um número inteiro positivo.",
			invalidColSpan	: "A amplitude das colunas tem de corresponder a um número inteiro positivo.",
			chooseColor : "Seleccionar"
		},

		row :
		{
			menu			: "Linha",
			insertBefore	: "Inserir linha antes",
			insertAfter		: "Inserir linha depois",
			deleteRow		: "Eliminar linhas"
		},

		column :
		{
			menu			: "Coluna",
			insertBefore	: "Inserir coluna antes",
			insertAfter		: "Inserir coluna depois",
			deleteColumn	: "Eliminar colunas"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "Propriedades do botão",
		text		: "Texto (Valor):",
		type		: "Tipo:",
		typeBtn		: "Botão",
		typeSbm		: "Submeter",
		typeRst		: "Repor"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "Propriedades da caixa de verificação",
		radioTitle	: "Propriedades do botão de opção",
		value		: "Valor:",
		selected	: "Seleccionado"
	},

	// Form Dialog.
	form :
	{
		title		: "Inserir formulário",
		menu		: "Propriedades do formulário",
		action		: "Acção:",
		method		: "Método:",
		encoding	: "Codificação:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "Seleccionar propriedades do campo",
		selectInfo	: "Seleccionar informações",
		opAvail		: "Opções disponíveis",
		value		: "Valor:",
		size		: "Tamanho:",
		lines		: "linhas",
		chkMulti	: "Permitir selecções múltiplas",
		opText		: "Texto:",
		opValue		: "Valor:",
		btnAdd		: "Adicionar",
		btnModify	: "Modificar",
		btnUp		: "Para cima",
		btnDown		: "Para baixo",
		btnSetValue : "Definir como valor seleccionado",
		btnDelete	: "Eliminar"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "Propriedades da área de texto",
		cols		: "Colunas:",
		rows		: "Linhas:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "Propriedades do campo de texto",
		name		: "Nome:",
		value		: "Valor:",
		charWidth	: "Largura dos caracteres:",
		maxChars	: "Número máximo de caracteres:",
		type		: "Tipo:",
		typeText	: "Texto",
		typePass	: "Palavra-passe"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "Propriedades do campo oculto",
		name	: "Nome:",
		value	: "Valor:"
	},

	// Image Dialog.
	image :
	{
		title		: "Imagem",
		titleButton	: "Propriedades do botão de imagem",
		menu		: "Propriedades da imagem...",
		infoTab	: "Informações da imagem",
		btnUpload	: "Enviar para o servidor",
		upload	: "Transferir",
		alt		: "Texto alternativo:",
		lockRatio	: "Bloquear relação",
		resetSize	: "Repor tamanho",
		border	: "Contorno:",
		hSpace	: "Espaço horizontal:",
		vSpace	: "Espaço vertical:",
		alertUrl	: "Introduza o URL da imagem",
		linkTab	: "Ligação",
		button2Img	: "Pretende transformar o botão de imagem seleccionado numa imagem simples?",
		img2Button	: "Pretende transformar a imagem seleccionada num botão de imagem?",
		urlMissing : "O URL de origem da imagem está em falta.",
		validateBorder : "O contorno tem de corresponder a um número inteiro positivo.",
		validateHSpace : "O espaço horizontal tem de corresponder a um número inteiro positivo.",
		validateVSpace : "O espaço vertical tem de corresponder a um número inteiro positivo."
	},

	// Flash Dialog
	flash :
	{
		properties		: "Propriedades de flash",
		propertiesTab	: "Propriedades",
		title		: "Flash",
		chkPlay		: "Reproduzir automaticamente",
		chkLoop		: "Ciclo",
		chkMenu		: "Activar menu flash",
		chkFull		: "Permitir ecrã completo",
 		scale		: "Escala:",
		scaleAll		: "Mostrar tudo",
		scaleNoBorder	: "Sem contorno",
		scaleFit		: "Ajuste exacto",
		access			: "Acesso a script:",
		accessAlways	: "Sempre",
		accessSameDomain	: "Mesmo domínio",
		accessNever	: "Nunca",
		alignAbsBottom: "Abs Bottom",
		alignAbsMiddle: "Abs Middle",
		alignBaseline	: "Linha de base",
		alignTextTop	: "Parte superior do texto",
		quality		: "Qualidade",
		qualityBest	: "Melhor",
		qualityHigh	: "Elevada",
		qualityAutoHigh	: "Elevada automática",
		qualityMedium	: "Média",
		qualityAutoLow	: "Baixa automática",
		qualityLow	: "Baixa",
		windowModeWindow	: "Janela",
		windowModeOpaque	: "Opaco",
		windowModeTransparent	: "Transparente",
		windowMode	: "Modo de janela:",
		flashvars	: "Variáveis:",
		bgcolor	: "Cor de segundo plano:",
		hSpace	: "Espaço horizontal:",
		vSpace	: "Espaço vertical:",
		validateSrc : "O URL não pode estar vazio.",
		validateHSpace : "O espaço horizontal tem de corresponder a um número inteiro positivo.",
		validateVSpace : "O espaço vertical tem de corresponder a um número inteiro positivo."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "Verificar ortografia",
		title			: "Verificação ortográfica",
		notAvailable	: "Lamentamos, mas o serviço não se encontra actualmente disponível.",
		errorLoading	: "Erro ao carregar o sistema central do serviço da aplicação: %s.",
		notInDic		: "Não consta do dicionário",
		changeTo		: "Alterar para",
		btnIgnore		: "Ignorar",
		btnIgnoreAll	: "Ignorar tudo",
		btnReplace		: "Substituir",
		btnReplaceAll	: "Substituir tudo",
		btnUndo			: "Anular",
		noSuggestions	: "- Sem sugestões -",
		progress		: "Verificação ortográfica em curso...",
		noMispell		: "Verificação ortográfica concluída: Não foram encontrados erros ortográficos",
		noChanges		: "Verificação ortográfica concluída: Nenhuma palavra alterada",
		oneChange		: "Verificação ortográfica concluída: Uma palavra alterada",
		manyChanges		: "Verificação ortográfica concluída: %1 palavras alteradas",
		ieSpellDownload	: "O verificador ortográfico não está instalado. Pretende descarregar o mesmo agora?"
	},

	smiley :
	{
		toolbar	: "Inserir ícone de emoção",
		title	: "Ícones de emoção",
		options : "Opções de ícones de emoção"
	},

	elementsPath :
	{
		eleLabel : "Caminho de elementos",
		eleTitle : "%1 elemento"
	},

	numberedlist : "Lista numerada",
	bulletedlist : "Lista marcada",
	indent : "Aumentar indentação",
	outdent : "Diminuir indentação",

	bidi :
	{
		ltr : "Esquerda para a direita",
		rtl : "Direita para a esquerda",
	},

	justify :
	{
		left : "Alinhar à esquerda",
		center : "Alinhar ao centro",
		right : "Alinhar à direita",
		block : "Justificado"
	},

	blockquote : "Blockquote",

	clipboard :
	{
		title		: "Colar",
		cutError	: "As definições de segurança do navegador impedem o corte automático. Em alternativa, utilize Ctrl+X no teclado.",
		copyError	: "As definições de segurança do navegador impedem a cópia automática. Em alternativa, utilize Ctrl+C no teclado.",
		pasteMsg	: "Prima Ctrl+V (Cmd+V em MAC) para colar abaixo.",
		securityMsg	: "A segurança do navegador bloqueia a acção de colar directamente a partir da área de transferência.",
		pasteArea	: "Área de colagem"
	},

	pastefromword :
	{
		confirmCleanup	: "O texto que pretende colar parece ter sido copiado do Word. Pretende limpar o mesmo antes de colar?",
		toolbar			: "Colar especial",
		title			: "Colar especial",
		error			: "Não foi possível limpar os dados colados devido a um erro interno"
	},

	pasteText :
	{
		button	: "Colar como texto simples",
		title	: "Colar como texto simples"
	},

	templates :
	{
		button 			: "Modelos",
		title : "Modelos de conteúdo",
		options : "Opções de modelos",
		insertOption: "Substituir conteúdo real",
		selectPromptMsg: "Seleccione o modelo a abrir no editor",
		emptyListMsg : "(Nenhum modelo definido)"
	},

	showBlocks : "Mostrar blocos",

	stylesCombo :
	{
		label		: "Estilos",
		panelTitle 	: "Estilos",
		panelTitle1	: "Estilos de blocos",
		panelTitle2	: "Estilos incluídos",
		panelTitle3	: "Estilos de objectos"
	},

	format :
	{
		label		: "Formato",
		panelTitle	: "Formato de parágrafo",

		tag_p		: "Normal",
		tag_pre		: "Formatado",
		tag_address	: "Endereço",
		tag_h1		: "Título 1",
		tag_h2		: "Título 2",
		tag_h3		: "Título 3",
		tag_h4		: "Título 4",
		tag_h5		: "Título 5",
		tag_h6		: "Título 6",
		tag_div		: "Normal (DIV)"
	},

	div :
	{
		title				: "Criar contentor Div",
		toolbar				: "Criar contentor Div",
		cssClassInputLabel	: "Classes de folha de estilos",
		styleSelectLabel	: "Estilo",
		IdInputLabel		: "ID",
		languageCodeInputLabel	: " Código de idioma",
		inlineStyleInputLabel	: "Estilo incluído",
		advisoryTitleInputLabel	: "Título informativo",
		langDirLabel		: "Direcção do texto",
		langDirLTRLabel		: "Esquerda para a direita",
		langDirRTLLabel		: "Direita para a esquerda",
		edit				: "Editar Div",
		remove				: "Remover Div"
  	},

	iframe :
	{
		title		: "Propriedades de IFrame",
		toolbar		: "Inserir IFrame",
		noUrl		: "Introduza o URL de iframe",
		scrolling	: "Activar barras de deslocamento",
		border		: "Mostrar contorno do painel"
	},

	font :
	{
		label		: "Tipo de letra",
		voiceLabel	: "Tipo de letra",
		panelTitle	: "Nome do tipo de letra"
	},

	fontSize :
	{
		label		: "Tamanho",
		voiceLabel	: "Tamanho do tipo de letra",
		panelTitle	: "Tamanho do tipo de letra"
	},

	colorButton :
	{
		textColorTitle	: "Cor do texto",
		bgColorTitle	: "Cor de segundo plano",
		panelTitle		: "Cores",
		auto			: "Automático",
		more			: "Mais cores..."
	},

	colors :
	{
		"000" : "Preto",
		"800000" : "Mogno",
		"8B4513" : "Castanho sela",
		"2F4F4F" : "Cinzento ardósia escuro",
		"008080" : "Verde azulado",
		"000080" : "Azul marinho",
		"4B0082" : "Índigo",
		"696969" : "Cinzento escuro",
		"B22222" : "Tijolo fogo",
		"A52A2A" : "Castanho",
		"DAA520" : "Ouro velho",
		"006400" : "Verde escuro",
		"40E0D0" : "Turquesa",
		"0000CD" : "Azul médio",
		"800080" : "Roxo",
		"808080" : "Cinzento",
		"F00" : "Vermelho",
		"FF8C00" : "Laranja escuro",
		"FFD700" : "Dourado",
		"008000" : "Verde",
		"0FF" : "Ciano",
		"00F" : "Azul",
		"EE82EE" : "Violeta",
		"A9A9A9" : "Cinzento esbatido",
		"FFA07A" : "Salmão claro",
		"FFA500" : "Laranja",
		"FFFF00" : "Amarelo",
		"00FF00" : "Lima",
		"AFEEEE" : "Turquesa pálido",
		"ADD8E6" : "Azul claro",
		"DDA0DD" : "Cor de ameixa",
		"D3D3D3" : "Cinzento claro",
		"FFF0F5" : "Alfazema rosado",
		"FAEBD7" : "Branco antigo",
		"FFFFE0" : "Amarelo claro",
		"F0FFF0" : "Melão",
		"F0FFFF" : "Azul celeste",
		"F0F8FF" : "Azul Alice",
		"E6E6FA" : "Alfazema",
		"FFF" : "Branco"
	},

	scayt :
	{
		title			: "Verificação ortográfica ao escrever",
		opera_title		: "Não suportado pelo Opera",
		enable			: "Activar SCAYT",
		disable			: "Desactivar SCAYT",
		about			: "Acerca do SCAYT",
		toggle			: "Alternar SCAYT",
		options			: "Opções",
		langs			: "Idiomas",
		moreSuggestions	: "Mais sugestões",
		ignore			: "Ignorar",
		ignoreAll		: "Ignorar tudo",
		addWord			: "Adicionar palavra",
		emptyDic		: "O nome do dicionário não pode estar vazio.",

		optionsTab		: "Opções",
		allCaps			: "Ignorar palavras com todas as letras em maiúsculas",
		ignoreDomainNames : "Ignorar nomes de domínio",
		mixedCase		: "Ignorar palavras com letras em maiúsculas e minúsculas",
		mixedWithDigits	: "Ignorar palavras com números",

		languagesTab	: "Idiomas",

		dictionariesTab	: "Dicionários",
		dic_field_name	: "Nome do dicionário",
		dic_create		: "Criar",
		dic_restore		: "Restaurar",
		dic_delete		: "Eliminar",
		dic_rename		: "Mudar o nome",
		dic_info		: "Inicialmente o dicionário do utilizador está guardado num cookie. Contudo, os cookies têm um tamanho limitado. Quando o dicionário do utilizador aumentar e já não puder ser armazenado num cookie, poderá ser guardado no nosso servidor. Para armazenar o dicionário pessoal no servidor deve indicar um nome para o dicionário. Se já tiver um dicionário armazenado, introduza o respectivo nome e faça clique no botão Restaurar.",

		aboutTab		: "Acerca de"
	},

	about :
	{
		title		: "Acerca do CKEditor",
		dlgTitle	: "Acerca do CKEditor",
		help	: "Utilize $1 para obter ajuda.",
		userGuide : "Manual do utilizador do CKEditor",
		moreInfo	: "Para obter informações sobre licenças, visite o nosso sítio da Web:",
		copy		: "Copyright &copy; $1. Todos os direitos reservados."
	},

	maximize : "Maximizar",
	minimize : "Minimizar",

	fakeobjects :
	{
		anchor	: "Âncora",
		flash	: "Animação flash",
		iframe		: "IFrame",
		hiddenfield	: "Campo oculto",
		unknown	: "Objecto desconhecido"
	},

	resize : "Arrastar para redimensionar",

	colordialog :
	{
		title		: "Seleccionar cor",
		options	:	"Opções de cor",
		highlight	: "Realce",
		selected	: "Cor seleccionada",
		clear		: "Limpar"
	},

	toolbarCollapse	: "Contrair barra de ferramentas",
	toolbarExpand	: "Expandir barra de ferramentas",

	toolbarGroups :
	{
		document : "Documento",
		clipboard : "Área de transferência/Anular",
		editing : "Edição",
		forms : "Formulários",
		basicstyles : "Estilos básicos",
		paragraph : "Parágrafo",
		links : "Ligações",
		insert : "Inserir",
		styles : "Estilos",
		colors : "Cores",
		tools : "Ferramentas"
	},

	bidi :
	{
		ltr : "Mudar para texto da esquerda para a direita",
		rtl : "Mudar para texto da direita para a esquerda"
	},

	docprops :
	{
		label : "Propriedades do documento",
		title : "Propriedades do documento",
		design : "Concepção",
		meta : "Controlos meta",
		chooseColor : "Seleccionar",
		other : "Outro...",
		docTitle :	"Título da página",
		charset : 	"Codificação do conjunto de caracteres",
		charsetOther : "Outra codificação do conjunto de caracteres",
		charsetASCII : "ASCII",
		charsetCE : "Europeu central",
		charsetCT : "Chinês tradicional (Big5)",
		charsetCR : "Cirílico",
		charsetGR : "Grego",
		charsetJP : "Japonês",
		charsetKR : "Coreano",
		charsetTR : "Turco",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "Europeu ocidental",
		docType : "Título do tipo de documento",
		docTypeOther : "Outro título do tipo de documento",
		xhtmlDec : "Incluir declarações de XHTML",
		bgColor : "Cor de segundo plano",
		bgImage : "URL da imagem de segundo plano",
		bgFixed : "Segundo plano sem deslocamento (fixo)",
		txtColor : "Cor do texto",
		margin : "Margens da página",
		marginTop : "Superior",
		marginLeft : "Esquerda",
		marginRight : "Direita",
		marginBottom : "Inferior",
		metaKeywords : "Palavras-chave de indexação de documentos (separadas por vírgula)",
		metaDescription : "Descrição do documento",
		metaAuthor : "Autor",
		metaCopyright : "Copyright",
		previewHtml : "<p>Trata-se de um <strong>texto de exemplo</strong>. Está a utilizar o <a href=\"javascript:void(0)\">CKEditor</a>.</p>"
	},

	ibm :
	{

		common :
		{
			widthIn	: "polegadas",
			widthCm	: "centímetros",
			widthMm	: "milímetros",
			widthEm	: "em",
			widthEx	: "ex",
			widthPt	: "pontos",
			widthPc	: "picas"
		},
		table :
		{
			heightUnit	: "Unidade de altura:",
			insertMultipleRows : "Inserir linhas",
			insertMultipleCols : "Inserir colunas",
			noOfRows : "Número de linhas:",
			noOfCols : "Número de colunas:",
			insertPosition : "Posição:",
			insertBefore : "Antes",
			insertAfter : "Depois",
			selectTable : "Seleccionar tabela",
			selectRow : "Seleccionar linha",
			columnTitle : "Coluna",
			colProps : "Propriedades da coluna",
			invalidColumnWidth	: "A largura da coluna tem de corresponder a um número positivo."
		},
		cell :
		{
			title : "Célula"
		},
		emoticon :
		{
			angel		: "Anjo",
			angry		: "Zangado",
			cool		: "Com estilo",
			crying		: "A chorar",
			eyebrow		: "Desconfiado",
			frown		: "Triste",
			goofy		: "Engraçado",
			grin		: "Gargalhada",
			half		: "Céptico",
			idea		: "Ideia",
			laughing	: "Riso",
			laughroll	: "Rebolar a rir",
			no			: "Não",
			oops		: "Ups",
			shy			: "Tímido",
			smile		: "Sorriso",
			tongue		: "Língua de fora",
			wink		: "Piscadela",
			yes			: "Sim"
		},

		menu :
		{
			link	: "Inserir ligação",
			list	: "Lista",
			paste	: "Colar",
			action	: "Acção",
			align	: "Alinhar",
			emoticon: "Ícone de emoção"
		},

		iframe :
		{
			title	: "IFrame"
		},

		list:
		{
			numberedTitle		: "Lista numerada",
			bulletedTitle		: "Lista marcada"
		},

		// Anchor dialog
		anchor :
		{
			description	: "Introduza um nome de marcador descritivo, tal como 'Secção 1.2'. Após inserir o marcador, faça clique no ícone 'Ligação' ou 'Ligação de marcador do documento' para criar uma ligação para o mesmo.",
			title		: "Ligação de marcador do documento",
			linkTo		: "Ligação para:"
		},

		urllink :
		{
			title : "Ligação de URL",
			linkText : "Texto da ligação:",
			selectAnchor: "Seleccionar uma âncora:",
			nourl: "Introduza um URL no campo de texto.",
			urlhelp: "Introduza ou cole um URL que será aberto quando os utilizadores fizerem clique nesta ligação, por exemplo, http://www.exemplo.com.",
			displaytxthelp: "Introduza texto a apresentar para a ligação.",
			openinnew : "Abrir ligação numa nova janela"
		},

		spellchecker :
		{
			title : "Verificar ortografia",
			replace : "Substituir:",
			suggesstion : "Sugestões:",
			withLabel : "Por:",
			replaceButton : "Substituir",
			replaceallButton:"Substituir tudo",
			skipButton:"Ignorar",
			skipallButton: "Ignorar tudo",
			undochanges: "Anular alterações",
			complete: "Verificação ortográfica concluída",
			problem: "Problema ao obter dados de XML",
			addDictionary: "Adicionar ao dicionário",
			editDictionary: "Editar dicionário"
		},

		status :
		{
			keystrokeForHelp: "Prima ALT 0 para obter ajuda"
		},

		linkdialog :
		{
			label : "Caixa de diálogo de ligação"
		},

		image :
		{
			previewText : "O texto será colocado em torno da imagem que está a adicionar, tal como neste exemplo."
		}
	}

};

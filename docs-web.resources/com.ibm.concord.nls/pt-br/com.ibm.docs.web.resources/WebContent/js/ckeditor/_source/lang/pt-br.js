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
	editor	: "Editor de Rich Text",

	// Toolbar buttons without dialogs.
	source			: "Origem",
	newPage			: "Nova Página",
	save			: "Salvar",
	preview			: "Visualizar:",
	cut				: "Recortar",
	copy			: "Copiar",
	paste			: "Colar",
	print			: "Imprimir",
	underline		: "Sublinhado",
	bold			: "Negrito",
	italic			: "Itálico",
	selectAll		: "Selecionar Tudo",
	removeFormat	: "Remover Formato",
	strike			: "Tachado",
	subscript		: "Subscrito",
	superscript		: "Sobrescrito",
	horizontalrule	: "Inserir Linha Horizontal",
	pagebreak		: "Inserir Quebra de Página",
	pagebreakAlt		: "Quebra de Página",
	unlink			: "Remover Link",
	undo			: "Desfazer",
	redo			: "Refazer",

	// Common messages and labels.
	common :
	{
		browseServer	: "Servidor do Navegador:",
		url				: "URL:",
		protocol		: "Protocolo:",
		upload			: "Upload:",
		uploadSubmit	: "Enviá-lo ao Servidor",
		image			: "Inserir Imagem",
		flash			: "Inserir Filme em Flash",
		form			: "Inserir Formulário",
		checkbox		: "Inserir Caixa de Seleção",
		radio			: "Botão de Opções Inserir",
		textField		: "Inserir Campo de Texto",
		textarea		: "Inserir Área de Texto",
		hiddenField		: "Inserir Campo Oculto",
		button			: "Botão Inserir",
		select			: "Inserir Campo de Seleção",
		imageButton		: "Botão Inserir Imagem",
		notSet			: "<not set>",
		id				: "ID:",
		name			: "Nome:",
		langDir			: "Direção do Texto:",
		langDirLtr		: "Esquerda para a Direita",
		langDirRtl		: "Direita para a Esquerda",
		langCode		: "Código de Idioma:",
		longDescr		: "URL de Descrição Detalhada:",
		cssClass		: "Classes da Folha de Estilo:",
		advisoryTitle	: "Título Consultivo:",
		cssStyle		: "Estilo:",
		ok				: "OK",
		cancel			: "Cancelar",
		close : "Fechar",
		preview			: "Visualizar:",
		generalTab		: "Geral",
		advancedTab		: "Avançado",
		validateNumberFailed	: "Este valor não é um número.",
		confirmNewPage	: "Quaisquer mudanças não salvas neste conteúdo serão perdidas. Tem certeza de que deseja carregar uma nova página?",
		confirmCancel	: "Algumas das opções foram alteradas. Tem certeza que deseja fechar o diálogo?",
		options : "Opções",
		target			: "Destino:",
		targetNew		: "Nova Janela (_blank)",
		targetTop		: "Janela Superior (_top)",
		targetSelf		: "Mesma Janela (_self)",
		targetParent	: "Janela Pai (_parent)",
		langDirLTR		: "Esquerda para a Direita",
		langDirRTL		: "Direita para a Esquerda",
		styles			: "Estilo:",
		cssClasses		: "Classes de Folha de Estilo:",
		width			: "Largura:",
		height			: "Altura:",
		align			: "Alinhar",
		alignLeft		: "Esquerda",
		alignRight		: "Direita",
		alignCenter		: "Centro",
		alignTop		: "Início da Página",
		alignMiddle		: "Meio",
		alignBottom		: "Parte Inferior",
		invalidHeight	: "A altura deve ser um número inteiro positivo.",
		invalidWidth	: "A largura deve ser um número inteiro positivo.",
		invalidCssLength	: "O valor especificado para o campo '%1' deve ser um número positivo com ou sem uma unidade de medida de CSS válida (px, %, pol, cm, mm, em, ex, pt, ou pc).",
		invalidHtmlLength	: "O valor especificado para o campo '%1' deve ser um número positivo com ou sem uma unidade de medida de HTML válida (px ou %).",
		invalidInlineStyle	: "O valor especificado para o estilo sequencial deve consistir em uma ou mais enuplas com o formato de \"nome : valor\", separado por pontos e vírgulas.",
		cssLengthTooltip	: "Insira um número para um valor em pixels ou um número com uma unidade de CSS válida (px, %, pol, cm, mm, em, ex, pt ou pc).",

		// Put the voice-only part of the label in the span.
		unavailable		: "%1<span class=\"cke_accessibility\">, indisponível</span>"
	},

	contextmenu :
	{
		options : "Opções do Menu de Contexto"
	},

	// Special char dialog.
	specialChar		:
	{
		toolbar		: "Inserir Caractere Especial",
		title		: "Caractere Especial",
		options : "Opções de Caractere Especial"
	},

	// Link dialog.
	link :
	{
		toolbar		: "Link da URL",
		other 		: "<other>",
		menu		: "Link de Edição...",
		title		: "Link",
		info		: "Informações do Link",
		target		: "Destino",
		upload		: "Upload:",
		advanced	: "Avançado",
		type		: "Tipo de Link:",
		toUrl		: "URL",
		toAnchor	: "Link para âncora no texto",
		toEmail		: "Email",
		targetFrame	: "<frame>",
		targetPopup	: "<popup window>",
		targetFrameName	: "Nome do Quadro de Destino:",
		targetPopupName	: "Nome da Janela Pop-up:",
		popupFeatures	: "Recursos da Janela Pop-up:",
		popupResizable	: "Redimensionável",
		popupStatusBar	: "Barra de Status",
		popupLocationBar	: "Barra de Locais",
		popupToolbar	: "Barra de Ferramentas",
		popupMenuBar	: "Barra de Menus",
		popupFullScreen	: "Tela Cheia (IE)",
		popupScrollBars	: "Barras de Rolagem",
		popupDependent	: "Dependente (Netscape)",
		popupLeft		: "Posição Esquerda",
		popupTop		: "Posição Superior",
		id				: "ID:",
		langDir			: "Direção do Texto:",
		langDirLTR		: "Esquerda para a Direita",
		langDirRTL		: "Direita para a Esquerda",
		acccessKey		: "Chave de Acesso:",
		name			: "Nome:",
		langCode		: "Código de Idioma:",
		tabIndex		: "Índice de Tabulação:",
		advisoryTitle	: "Título Consultivo:",
		advisoryContentType	: "Tipo de Conteúdo Consultivo:",
		cssClasses		: "Classes da Folha de Estilo:",
		charset			: "Conjunto de Gráficos do Recurso Vinculado:",
		styles			: "Estilo:",
		rel			: "Relação",
		selectAnchor	: "Selecionar uma Âncora",
		anchorName		: "Por Nome de Âncora",
		anchorId		: "Por ID de Elemento",
		emailAddress	: "Endereço de E-Mail",
		emailSubject	: "Assunto da Mensagem",
		emailBody		: "Corpo da Mensagem",
		noAnchors		: "Não há marcador disponível no documento. Clique no ícone 'Inserir Marcador de Documento' na barra de ferramentas para incluir um.",
		noUrl			: "Digite a URL do link",
		noEmail			: "Digite o endereço de email"
	},

	// Anchor dialog
	anchor :
	{
		toolbar		: "Inserir Marcador de Documento",
		menu		: "Editar Marcador de Documento",
		title		: "Marcador de Documento",
		name		: "Nome:",
		errorName	: "Insira um nome para o marcador de documento",
		remove		: "Remover Marcador de Documento"
	},

	// List style dialog
	list:
	{
		numberedTitle		: "Propriedades de Lista Numerada",
		bulletedTitle		: "Propriedades de Lista com Marcadores",
		type				: "Tipo",
		start				: "Iniciar",
		validateStartNumber				:"O número inicial da lista deve ser um número inteiro.",
		circle				: "Círculo",
		disc				: "Disco",
		square				: "Quadrado",
		none				: "Nenhum",
		notset				: "<not set>",
		armenian			: "Numeração armênia",
		georgian			: "Numeração georgiana (an, ban, gan, etc.)",
		lowerRoman			: "Romano Minúsculo (i, ii, iii, iv, v, etc.)",
		upperRoman			: "Romano Maiúsculo (I, II, III, IV, V, etc.)",
		lowerAlpha			: "Alfabético Minúsculo (a, b, c, d, e, etc.)",
		upperAlpha			: "Alfabético Maiúsculo (A, B, C, D, E, etc.)",
		lowerGreek			: "Grego Minúsculo (alfa, beta, gama, etc.)",
		decimal				: "Decimal (1, 2, 3, etc.)",
		decimalLeadingZero	: "Decimal com zero à esquerda (01, 02, 03, etc.)"
	},

	// Find And Replace Dialog
	findAndReplace :
	{
		title				: "Localizar e Substituir",
		find				: "Localizar",
		replace				: "Substituir",
		findWhat			: "Localizar:",
		replaceWith			: "Substituir por:",
		notFoundMsg			: "O texto especificado não foi localizado.",
		noFindVal			: 'O texto a ser localizado é requerido.',
		findOptions			: "Localizar Opções",
		matchCase			: "Corresponder Caso",
		matchWord			: "Corresponder Palavra Inteira",
		matchCyclic			: "Correspondência cíclica",
		replaceAll			: "Substituir Tudo",
		replaceSuccessMsg	: "%1 ocorrência(s) substituída(s)."
	},

	// Table Dialog
	table :
	{
		toolbar		: "Inserir Tabela",
		title		: "Tabela",
		menu		: "Propriedades da Tabela",
		deleteTable	: "Excluir Tabela",
		rows		: "Linhas:",
		columns		: "Colunas:",
		border		: "Tamanho da Borda:",
		widthPx		: "pixels",
		widthPc		: "porcentagem",
		widthUnit	: "Unidade de largura:",
		cellSpace	: "Espaçamento da Célula:",
		cellPad		: "Preenchimento da Célula:",
		caption		: "Legenda:",
		summary		: "Resumo:",
		headers		: "Cabeçalhos:",
		headersNone		: "Nenhum",
		headersColumn	: "Primeira Coluna",
		headersRow		: "Primeira Linha",
		headersBoth		: "Ambas",
		invalidRows		: "O Número de linhas deve ser um número inteiro maior que zero.",
		invalidCols		: "O Número de colunas deve ser um número inteiro maior que zero.",
		invalidBorder	: "O tamanho da borda deve ser um número positivo.",
		invalidWidth	: "A largura da tabela deve ser um número positivo.",
		invalidHeight	: "A altura da tabela deve ser um número positivo.",
		invalidCellSpacing	: "O espaçamento da célula deve ser um número positivo.",
		invalidCellPadding	: "O preenchimento da célula deve ser um número positivo.",

		cell :
		{
			menu			: "Célula",
			insertBefore	: "Inserir Célula Antes",
			insertAfter		: "Inserir Célula Depois",
			deleteCell		: "Excluir Células",
			merge			: "Mesclar Células",
			mergeRight		: "Mesclar à Direita",
			mergeDown		: "Mesclar para Baixo",
			splitHorizontal	: "Dividir Célula Horizontalmente",
			splitVertical	: "Dividir Célula Verticalmente",
			title			: "Propriedades da Célula",
			cellType		: "Tipo de célula:",
			rowSpan			: "Amplitude das linhas:",
			colSpan			: "Amplitude das colunas:",
			wordWrap		: "Quebra automática de linha:",
			hAlign			: "Alinhamento horizontal:",
			vAlign			: "Alinhamento vertical:",
			alignBaseline	: "Linha de Base",
			bgColor			: "Cor do Plano de Fundo:",
			borderColor		: "Cor da borda:",
			data			: "Dados",
			header			: "Cabeçalho",
			yes				: "Sim",
			no				: "Não",
			invalidWidth	: "A largura da célula deve ser um número positivo.",
			invalidHeight	: "A altura da célula deve ser um número positivo.",
			invalidRowSpan	: "A amplitude das linhas deve ser um número positivo inteiro.",
			invalidColSpan	: "A amplitude das colunas deve ser um número positivo inteiro.",
			chooseColor : "Escolher"
		},

		row :
		{
			menu			: "Linha",
			insertBefore	: "Inserir Linha Antes",
			insertAfter		: "Inserir Linha Depois",
			deleteRow		: "Excluir Linhas"
		},

		column :
		{
			menu			: "Coluna",
			insertBefore	: "Inserir Coluna Antes",
			insertAfter		: "Inserir Coluna Depois",
			deleteColumn	: "Excluir Colunas"
		}
	},

	// Button Dialog.
	button :
	{
		title		: "Propriedades do Botão",
		text		: "Texto (Valor):",
		type		: "Digite:",
		typeBtn		: "Botão",
		typeSbm		: "Enviar",
		typeRst		: "Redefinir"
	},

	// Checkbox and Radio Button Dialogs.
	checkboxAndRadio :
	{
		checkboxTitle : "Propriedades da Caixa de Seleção",
		radioTitle	: "Propriedades do Botão de Opções",
		value		: "Valor:",
		selected	: "Selecionado"
	},

	// Form Dialog.
	form :
	{
		title		: "Inserir Formulário",
		menu		: "Propriedades do Formulário",
		action		: "Ação:",
		method		: "Método:",
		encoding	: "Codificação:"
	},

	// Select Field Dialog.
	select :
	{
		title		: "Selecionar Propriedades do Campo",
		selectInfo	: "Selecionar Informações",
		opAvail		: "Opções Disponíveis",
		value		: "Valor:",
		size		: "Tamanho:",
		lines		: "linhas",
		chkMulti	: "Permitir várias seleções",
		opText		: "Texto:",
		opValue		: "Valor:",
		btnAdd		: "Incluir",
		btnModify	: "Modificar",
		btnUp		: "Para Cima",
		btnDown		: "Para Baixo",
		btnSetValue : "Configurar como valor selecionado",
		btnDelete	: "Excluir"
	},

	// Textarea Dialog.
	textarea :
	{
		title		: "Propriedades da Área de Texto",
		cols		: "Colunas:",
		rows		: "Linhas:"
	},

	// Text Field Dialog.
	textfield :
	{
		title		: "Propriedades do Campo de Texto",
		name		: "Nome:",
		value		: "Valor:",
		charWidth	: "Largura do Caractere:",
		maxChars	: "Máximo de Caracteres:",
		type		: "Digite:",
		typeText	: "Texto",
		typePass	: "Senha"
	},

	// Hidden Field Dialog.
	hidden :
	{
		title	: "Propriedades do Campo Oculto",
		name	: "Nome:",
		value	: "Valor:"
	},

	// Image Dialog.
	image :
	{
		title		: "Imagem",
		titleButton	: "Propriedades do Botão de Imagem",
		menu		: "Propriedades da Imagem...",
		infoTab	: "Informações da Imagem",
		btnUpload	: "Enviar ao servidor",
		upload	: "Carregar",
		alt		: "Texto alternativo:",
		lockRatio	: "Bloquear Proporção",
		resetSize	: "Reconfigurar Tamanho",
		border	: "Borda:",
		hSpace	: "Espaço horizontal:",
		vSpace	: "Espaço vertical:",
		alertUrl	: "Digite a URL da imagem",
		linkTab	: "Link",
		button2Img	: "Deseja transformar o botão de imagem selecionado em uma imagem simples?",
		img2Button	: "Deseja transformar a imagem selecionada em um botão de imagem?",
		urlMissing : "A URL da origem da imagem está ausente.",
		validateBorder : "A borda deve ser um número inteiro positivo.",
		validateHSpace : "O espaço horizontal deve ser um número inteiro positivo.",
		validateVSpace : "O espaço vertical deve ser um número inteiro positivo."
	},

	// Flash Dialog
	flash :
	{
		properties		: "Propriedades de Atualização",
		propertiesTab	: "Propriedades",
		title		: "Atualizar",
		chkPlay		: "Reprodução automática",
		chkLoop		: "Loop",
		chkMenu		: "Ativar menu de atualização",
		chkFull		: "Permitir tela cheia",
 		scale		: "Escala:",
		scaleAll		: "Mostrar Tudo",
		scaleNoBorder	: "Nenhuma Borda",
		scaleFit		: "Ajuste Exato",
		access			: "Acesso ao script:",
		accessAlways	: "Sempre",
		accessSameDomain	: "Mesmo Domínio",
		accessNever	: "Nunca",
		alignAbsBottom: "Abs Inferior",
		alignAbsMiddle: "Abs Mediano",
		alignBaseline	: "Linha de Base",
		alignTextTop	: "Texto Superior",
		quality		: "Qualidade:",
		qualityBest	: "Melhor",
		qualityHigh	: "Alto",
		qualityAutoHigh	: "Alto Automaticamente",
		qualityMedium	: "Médio",
		qualityAutoLow	: "Baixo Automaticamente",
		qualityLow	: "Baixo",
		windowModeWindow	: "Janela",
		windowModeOpaque	: "Opaco",
		windowModeTransparent	: "Transparente",
		windowMode	: "Modo de Janela",
		flashvars	: "Variáveis:",
		bgcolor	: "Cor do Plano de Fundo:",
		hSpace	: "Espaço horizontal:",
		vSpace	: "Espaço vertical:",
		validateSrc : "A URL não deve estar vazia.",
		validateHSpace : "O espaço horizontal deve ser um número inteiro positivo.",
		validateVSpace : "O espaço vertical deve ser um número inteiro positivo."
	},

	// Speller Pages Dialog
	spellCheck :
	{
		toolbar			: "Verificação Ortográfica",
		title			: "Verificação Ortográfica",
		notAvailable	: "Desculpe, mas o serviço está indisponível agora.",
		errorLoading	: "Erro ao carregar host de serviço do aplicativo: %s.",
		notInDic		: "Não está no dicionário",
		changeTo		: "Alterar para",
		btnIgnore		: "Ignorar",
		btnIgnoreAll	: "Ignorar Todos",
		btnReplace		: "Substituir",
		btnReplaceAll	: "Substituir Tudo",
		btnUndo			: "Desfazer",
		noSuggestions	: "- Não há sugestões -",
		progress		: "Verificação ortográfica em andamento...",
		noMispell		: "Verificação ortográfica concluída: Nenhum erro de ortografia foi localizado",
		noChanges		: "Verificação ortográfica concluída: Nenhuma palavra foi alterada",
		oneChange		: "Verificação ortográfica concluída: Uma palavra foi alterada",
		manyChanges		: "Verificação ortográfica concluída: %1 de palavras alteradas",
		ieSpellDownload	: "O verificador ortográfico não está instalado. Deseja fazer download agora?"
	},

	smiley :
	{
		toolbar	: "Inserir Emoticon",
		title	: "Emoticons",
		options : "Opções de Emoticon"
	},

	elementsPath :
	{
		eleLabel : "Caminho dos Elementos",
		eleTitle : "%1 de elemento"
	},

	numberedlist : "Lista Numerada",
	bulletedlist : "Lista com Marcadores",
	indent : "Aumentar Indentação",
	outdent : "Diminuir Indentação",

	bidi :
	{
		ltr : "Esquerda para a Direita",
		rtl : "Direita para a Esquerda",
	},

	justify :
	{
		left : "Alinhar à Esquerda",
		center : "Alinhar ao Centro",
		right : "Alinhar à Direita",
		block : "Alinhar Justificado"
	},

	blockquote : "Citação de Bloco",

	clipboard :
	{
		title		: "Colar",
		cutError	: "Suas configurações de segurança do navegador impedem o recorte automático. Em vez disso, use Ctrl+X em seu teclado.",
		copyError	: "Suas configurações de segurança do navegador impedem a cópia automática. Em vez disso, use Ctrl+C em seu teclado.",
		pasteMsg	: "Pressione Ctrl+V (Cmd+V no MAC) para colar abaixo.",
		securityMsg	: "A segurança do seu navegador bloqueia a colagem diretamente da área de transferência.",
		pasteArea	: "Área de Colagem"
	},

	pastefromword :
	{
		confirmCleanup	: "O texto que você deseja colar parece ser copiado do Word. Deseja limpá-lo antes da colagem?",
		toolbar			: "Colar Especial",
		title			: "Colar Especial",
		error			: "Não foi possível limpar os dados colados devido a um erro interno"
	},

	pasteText :
	{
		button	: "Colar como texto simples",
		title	: "Colar como Texto Simples"
	},

	templates :
	{
		button 			: "Modelos",
		title : "Modelos de Conteúdo",
		options : "Opções de Modelo",
		insertOption: "Substituir conteúdo real",
		selectPromptMsg: "Selecionar o modelo para abrir no editor",
		emptyListMsg : "(Nenhum modelo definido)"
	},

	showBlocks : "Mostrar Blocos",

	stylesCombo :
	{
		label		: "Estilos",
		panelTitle 	: "Estilos",
		panelTitle1	: "Bloquear Estilos",
		panelTitle2	: "Estilos Sequenciais",
		panelTitle3	: "Estilos de Objeto"
	},

	format :
	{
		label		: "Formatar",
		panelTitle	: "Formato do Parágrafo",

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
		title				: "Criar Contêiner Div",
		toolbar				: "Criar Contêiner Div",
		cssClassInputLabel	: "Classes da Folha de Estilo",
		styleSelectLabel	: "Estilo",
		IdInputLabel		: "ID",
		languageCodeInputLabel	: " Código de Idioma",
		inlineStyleInputLabel	: "Estilo Sequencial",
		advisoryTitleInputLabel	: "Título Consultivo",
		langDirLabel		: "Direção do Texto",
		langDirLTRLabel		: "Esquerda para a Direita",
		langDirRTLLabel		: "Direita para a Esquerda",
		edit				: "Editar Div",
		remove				: "Remover Div"
  	},

	iframe :
	{
		title		: "Propriedades IFrame",
		toolbar		: "Inserir IFrame",
		noUrl		: "Digite a URL do iframe",
		scrolling	: "Ativar barras de rolagem",
		border		: "Mostrar borda do quadro"
	},

	font :
	{
		label		: "Fonte",
		voiceLabel	: "Fonte",
		panelTitle	: "Nome da Fonte"
	},

	fontSize :
	{
		label		: "Tamanho",
		voiceLabel	: "Tamanho da Fonte",
		panelTitle	: "Tamanho da Fonte"
	},

	colorButton :
	{
		textColorTitle	: "Cor do Texto",
		bgColorTitle	: "Cor do Plano de Fundo",
		panelTitle		: "Cores",
		auto			: "Automático",
		more			: "Mais Cores..."
	},

	colors :
	{
		"000" : "Preto",
		"800000" : "Castanho",
		"8B4513" : "Marrom Escuro",
		"2F4F4F" : "Cinza Escuro",
		"008080" : "Azul Petróleo",
		"000080" : "Azul Marinho",
		"4B0082" : "Índigo",
		"696969" : "Cinza Escuro",
		"B22222" : "Tijolo",
		"A52A2A" : "Marrom",
		"DAA520" : "Ouro",
		"006400" : "Verde Escuro",
		"40E0D0" : "Turquesa",
		"0000CD" : "Azul Médio",
		"800080" : "Púrpura",
		"808080" : "Cinza",
		"F00" : "Vermelho",
		"FF8C00" : "Laranja Escuro",
		"FFD700" : "Dourado",
		"008000" : "Verde",
		"0FF" : "Ciano",
		"00F" : "Azul",
		"EE82EE" : "Violeta",
		"A9A9A9" : "Cinza Chumbo",
		"FFA07A" : "Salmão",
		"FFA500" : "Laranja",
		"FFFF00" : "Amarelo",
		"00FF00" : "Verde Limão",
		"AFEEEE" : "Turquesa Claro",
		"ADD8E6" : "Azul Claro",
		"DDA0DD" : "Ameixa",
		"D3D3D3" : "Cinza Claro",
		"FFF0F5" : "Lavanda",
		"FAEBD7" : "Branco Antigo",
		"FFFFE0" : "Amarelo Claro",
		"F0FFF0" : "Mel",
		"F0FFFF" : "Azul",
		"F0F8FF" : "Azul Bebê",
		"E6E6FA" : "Lavanda",
		"FFF" : "Branco"
	},

	scayt :
	{
		title			: "Faça a verificação ortográfica à medida que você digita",
		opera_title		: "Não suportado por Opera",
		enable			: "Ativar SCAYT",
		disable			: "Desativar SCAYT",
		about			: "Sobre SCAYT",
		toggle			: "Comutar SCAYT",
		options			: "Opções",
		langs			: "Idiomas",
		moreSuggestions	: "Mais sugestões",
		ignore			: "Ignorar",
		ignoreAll		: "Ignorar Todos",
		addWord			: "Incluir Palavra",
		emptyDic		: "O nome do dicionário não deve ficar vazio.",

		optionsTab		: "Opções",
		allCaps			: "Ignorar Palavras Inteiras em Maiúsculo",
		ignoreDomainNames : "Ignorar Nomes de Domínio",
		mixedCase		: "Ignorar Palavras Compostas por Letras Maiúsculas e Minúsculas",
		mixedWithDigits	: "Ignorar Palavras com Números",

		languagesTab	: "Idiomas",

		dictionariesTab	: "Dicionários",
		dic_field_name	: "Nome do Dicionário",
		dic_create		: "Criar",
		dic_restore		: "Restaurar",
		dic_delete		: "Excluir",
		dic_rename		: "Renomear",
		dic_info		: "Inicialmente, o Dicionário do Usuário é armazenado em um Cookie. Entretanto, os Cookies têm seu tamanho limitado. Quando o Dicionário do Usuário aumenta a um ponto em que não é possível ser armazenado em um Cookie, ele pode ser armazenado em nosso servidor. Para armazenar seu dicionário pessoal em  nosso servidor, você deve especificar um nome para o dicionário. Se já houver um dicionário armazenado, digite o nome deste dicionário e clique no botão Restaurar.",

		aboutTab		: "Sobre"
	},

	about :
	{
		title		: "Sobre CKEditor",
		dlgTitle	: "Sobre CKEditor",
		help	: "Verificar $1 para obter ajuda.",
		userGuide : "Guia de Usuário do CKEditor",
		moreInfo	: "Para informações sobre licença, visite seu Web site:",
		copy		: "Copyright &copy; $1. Todos os direitos reservados."
	},

	maximize : "Maximizar",
	minimize : "Minimizar",

	fakeobjects :
	{
		anchor	: "Âncora",
		flash	: "Animação em Flash",
		iframe		: "IFrame",
		hiddenfield	: "Campo Oculto",
		unknown	: "Objeto Desconhecido"
	},

	resize : "Arrastar para Redimensionar",

	colordialog :
	{
		title		: "Selecionar Cor",
		options	:	"Opções de Cores",
		highlight	: "Destacar",
		selected	: "Cor Selecionada",
		clear		: "Limpar"
	},

	toolbarCollapse	: "Reduzir Barra de Ferramentas",
	toolbarExpand	: "Expandir Barra de Ferramentas",

	toolbarGroups :
	{
		document : "Documento",
		clipboard : "Área de Transferência/Desfazer",
		editing : "Editando",
		forms : "Formulários",
		basicstyles : "Estilos Básicos",
		paragraph : "Parágrafo",
		links : "Links",
		insert : "Inserir",
		styles : "Estilos",
		colors : "Cores",
		tools : "Ferramentas"
	},

	bidi :
	{
		ltr : "Alterar para Texto da Esquerda para a Direita",
		rtl : "Alterar para Texto da Direita para a Esquerda"
	},

	docprops :
	{
		label : "Propriedades do Documento",
		title : "Propriedades do Documento",
		design : "Design",
		meta : "Meta Tags",
		chooseColor : "Escolher",
		other : "Outro...",
		docTitle :	"Título da Página",
		charset : 	"Codificação do Conjunto de Caracteres",
		charsetOther : "Outra Codificação do Conjunto de Caracteres",
		charsetASCII : "ASCII",
		charsetCE : "Europeu Central",
		charsetCT : "Chinês Tradicional (Big5)",
		charsetCR : "Cirílico",
		charsetGR : "Grego",
		charsetJP : "Japonês",
		charsetKR : "Coreano",
		charsetTR : "Turco",
		charsetUN : "Unicode (UTF-8)",
		charsetWE : "Europeu Ocidental",
		docType : "Título do Tipo de Documento",
		docTypeOther : "Outros Títulos de Tipo de Documento",
		xhtmlDec : "Incluir Declarações XHTML",
		bgColor : "Cor do Plano de Fundo",
		bgImage : "URL da Imagem de Plano de Fundo",
		bgFixed : "Plano de Fundo Sem Rolagem (Fixo)",
		txtColor : "Cor do Texto",
		margin : "Margens da Página",
		marginTop : "Início da Página",
		marginLeft : "Esquerda",
		marginRight : "Direita",
		marginBottom : "Parte Inferior",
		metaKeywords : "Palavras-chave de Indexação do Documento (separadas por vírgula)",
		metaDescription : "Descrição do Documento",
		metaAuthor : "Autor",
		metaCopyright : "Copyright",
		previewHtml : "<p>Isso é algum <strong>texto de amostra</strong>. Você está usando o <a href=\"javascript:void(0)\">CKEditor</a>.</p>"
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
			insertMultipleRows : "Inserir Linhas",
			insertMultipleCols : "Inserir Colunas",
			noOfRows : "Número de Linhas:",
			noOfCols : "Número de Colunas:",
			insertPosition : "Posição:",
			insertBefore : "Antes",
			insertAfter : "Depois",
			selectTable : "Selecionar Tabela",
			selectRow : "Selecionar Linha",
			columnTitle : "Coluna",
			colProps : "Propriedades da Coluna",
			invalidColumnWidth	: "A largura da coluna deve ser um número positivo."
		},
		cell :
		{
			title : "Célula"
		},
		emoticon :
		{
			angel		: "Anjo",
			angry		: "Raiva",
			cool		: "Legal",
			crying		: "Chorando",
			eyebrow		: "Dúvida",
			frown		: "Carrancudo",
			goofy		: "Tonto",
			grin		: "Sorriso forçado",
			half		: "Metade",
			idea		: "Ideia",
			laughing	: "Rindo",
			laughroll	: "Rolando de rir",
			no			: "Não",
			oops		: "Sem graça",
			shy			: "Tímido",
			smile		: "Sorriso",
			tongue		: "Língua",
			wink		: "Piscadela",
			yes			: "Sim"
		},

		menu :
		{
			link	: "Inserir Link",
			list	: "Lista",
			paste	: "Colar",
			action	: "Ação",
			align	: "Alinhar",
			emoticon: "Emoticon"
		},

		iframe :
		{
			title	: "IFrame"
		},

		list:
		{
			numberedTitle		: "Lista Numerada",
			bulletedTitle		: "Lista com Marcadores"
		},

		// Anchor dialog
		anchor :
		{
			description	: "Digite um nome do marcador descritivo, tal como 'Seção 1.2'. Após inserir o marcador, clique em 'Link' ou no ícone 'Link do Marcador de  Documento' para vincular a ele.",
			title		: "Link do Marcador de Documento",
			linkTo		: "Link para:"
		},

		urllink :
		{
			title : "Link da URL",
			linkText : "Texto do Link:",
			selectAnchor: "Selecionar uma Âncora:",
			nourl: "Insira uma URL no campo de texto.",
			urlhelp: "Digite ou cole uma URL a ser aberta quando os usuários clicarem nessa coluna, por exemplo, http://www.example.com.",
			displaytxthelp: "Digite a exibição do texto para o link.",
			openinnew : "Abra o link na nova janela"
		},

		spellchecker :
		{
			title : "Verificação Ortográfica",
			replace : "Substituir:",
			suggesstion : "Sugestões:",
			withLabel : "Com:",
			replaceButton : "Substituir",
			replaceallButton:"Substituir Tudo",
			skipButton:"Ignorar",
			skipallButton: "Ignorar Todos",
			undochanges: "Desfazer Mudanças",
			complete: "Verificação Ortográfica Concluída",
			problem: "Problema de recuperação de dados XML",
			addDictionary: "Incluir no Dicionário",
			editDictionary: "Editar Dicionário"
		},

		status :
		{
			keystrokeForHelp: "Pressione ALT 0 para obter ajuda"
		},

		linkdialog :
		{
			label : "Diálogo de Link"
		},

		image :
		{
			previewText : "O texto fluirá em volta da imagem que você está incluindo como neste exemplo."
		}
	}

};

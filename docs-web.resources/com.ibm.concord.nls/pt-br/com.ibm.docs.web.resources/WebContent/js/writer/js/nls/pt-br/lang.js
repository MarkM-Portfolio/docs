/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2020                           */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */
define({
        PAGE_BREAK_TEXT: "Quebra de Página",
        SECTION_BREAK_TEXT: "Quebra de Seção",
        LINE_BREAK_TEXT: "Quebra de Linha",
        COLUMN_BREAK_TEXT: "Quebra de Coluna",
        INSERT_IMAGE_NOT_PROPER_PLACE: "Imagens somente podem ser incluídas no texto do corpo e em tabelas, não no local atual.",
        LOADING: "O conteúdo está carregando.",
        LOAD_FINISHED: "O carregamento do conteúdo foi concluído.",
        PAGE_SETUP: "Configuração de Página",
        NOTE_INVALIDACTION_FOOTNOTE: "Esta não é uma ação válida para nota de rodapé.",
        NOTE_INVALIDACTION_ENDNOTE: "Esta não é uma ação válida para nota final.",
        PAGENUMBER_OF_TOTALNUMBER: "Página ${0} de ${1}", //page 1 of N
        PAGE_NUMBER: "Página: ${pageNumber} / ${totalPageNumber}",
        toc: {
            title: "Índice",
            update: "Atualizar",
            del: "Excluir",
            toc: "Índice",
            linkTip: "Ctrl clique para navegar",
            linkTip_Mac: "\u2318 clique para navegar",
            pageNumber: "Somente o Número de Página",
            entireTable: "Tabela Inteira"
        },
        link: {
            addlink: "Incluir link",
            gotolink: "Abrir Link",
            unlink: "Remover Link",
            editlink: "Editar Link",
            internalLink: "Link Interno",
            ctrlLink: "Ctrl+Clique para acessar o link",
            ctrlLink_Mac: "\u2318Clique para acessar o link",
            cannotOpen: " não pode ser aberto no ${productName}."
        },
        field: {
            update: "Atualizar Campo"
        },
        insertTime: "Inserir Hora",
        insertDate: "Inserir Data",
        selectDate: "Selecionar Data",
        selectTime: "Selecionar Horário",
        acc_blank: "em branco", // when selection is nothing but space char and empty paragraph
        acc_space: "espaço", // string read out when the cursor is before one space char
        acc_inLink: "no link ",
        acc_inField: "no campo ",
        acc_selected: " selecionado",
        acc_inTable: "na linha da tabela ${0} coluna ${1} ",
        acc_imageSelected: "gráfico selecionado",
        acc_canvasSelected: "formato selecionado",
        acc_textboxSelected: "caixa de texto selecionada",
        ACC_TABLE_TABLESIZE: "Você selecionou ${0} linhas, ${1} colunas",
        ACC_TABLE_MAXSIZE: " O tamanho máximo suportado da tabela é de 20*20",
        ACC_headerFooterMode: "modo de edição de rodapé e cabeçalho.",
        ACC_EditorMode: "modo de edição do editor",
        ACC_FootnotesMode: "modo de edição de notas de rodapé",
        ACC_EndnotesMode: "modo de edição de notas de encerramento",
        ACC_uniformTable: "Uma nova linha é incluída",
        Acc_column: "coluna  ${0}",
        acc_page: "página  ${0}",
        acc_section: "seção  ${0}",
        acc_spellWarn: "a ortografia está incorreta",
        acc_outTable: "fora da tabela",
        acc_link: "link",
        acc_field: "campo",
        acc_footnote: "nota de rodapé",
        acc_endnote: "nota de fim",
        acc_editor: "Editar por ${0}",
        tablePropertyTitle: "Propriedades da Tabela",
        headerTitle: "Cabeçalho",
        footerTitle: "Rodapé",
        firstheaderTitle: "Cabeçalho da Primeira Página",
        firstfooterTitle: "Rodapé da Primeira Página",
        evenheaderTitle: "Cabeçalho de Página Par",
        evenfooterTitle: "Rodapé de Página Par",
        oddheaderTitle: "Cabeçalho de Página Ímpar",
        oddfooterTitle: "Rodapé de Página Ímpar",
        showTableBorder: "Mostrar Limites de Tabela",
        list_none: "Nenhum",
        SET_NUMBERING_VALUE: "Configurar valor da numeração",
        BIDI_CONTENT_EDITING: "Este documento inclui conteúdo bidirecional. Para funcionar corretamente com este documento, ative o suporte bidirecional em suas preferências do HCL Connections."
});

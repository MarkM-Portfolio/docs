define({
        clipboard: {
            pasteTableToTableError: "Vous ne pouvez pas créer ou coller un tableau dans un autre tableau.",
            securityMsg: "Du fait des paramètres de sécurité de votre navigateur, l'application ne peut pas accéder à votre presse-papiers.  Pour accéder au presse-papiers, appuyez sur Ctrl+V pour coller le contenu dans cette zone, puis cliquez sur OK.",
            pasteMaxMsg: "La taille du contenu que vous voulez coller est trop importante.",
            cutError: 'Les paramètres de sécurité de votre navigateur empêchent la copie automatique. Utilisez la combinaison de touches Ctrl+X de votre clavier.',
            copyError: 'Les paramètres de sécurité de votre navigateur empêchent la copie automatique. Utilisez la combinaison de touches Ctrl+C de votre clavier.',
            pasteError: "Du fait des paramètres de sécurité de votre navigateur, l'application ne peut pas accéder à votre presse-papiers. Utilisez la combinaison de touches Ctrl+V de votre clavier.",
            cutErrorOnMac: 'Les paramètres de sécurité de votre navigateur empêchent la copie automatique. Utilisez la combinaison \u2318X de votre clavier.',
            copyErrorOnMac: 'Les paramètres de sécurité de votre navigateur empêchent la copie automatique. Utilisez la combinaison \u2318C de votre clavier.',
            pasteErrorOnMac: "Du fait des paramètres de sécurité de votre navigateur, l'application ne peut pas accéder à votre presse-papiers. Utilisez la combinaison \u2318V de votre clavier."
        },
        coediting: {
            exitTitle: "Sortie de la co-édition",
            offlineTitle: "Problème réseau",
            reloadTitle: "Problème de synchronisation",
            firstTab: "Premier onglet",
            connectMsg: "Cliquez sur le bouton ${0} pour vous connecter à nouveau ou sur ${1} pour actualiser.",
            exitMsg: "Cliquez sur Quitter pour quitter le mode de co-édition ou sur Mode Afficher pour passer au mode en lecture seule.",
            lockMsg: "L'éditeur sera verrouillé pour empêcher la perte de données.",
            connectLabel: "Connecter",
            exitLabel: "Quitter",
            reloadLabel: "Recharger",
            viewLabel: "Mode Afficher",
            viweAlert: "Emplacement réservé au mode Afficher uniquement",
            forbiddenInput: "Vous ne pouvez pas saisir de texte car la sélection contient une tâche.",
            taskLockMsg: "${0} travaille en privé sur cette section. Vos modifications seront remplacées lorsque les modifications privées seront appliquées au document."
        },
        comments:
        {
            commentLabel: "Ajouter un commentaire",
            deleteComment: "Supprimer le commentaire",
            showComment: "Afficher le commentaire",
            hoverText: "Commentaire"
        },
        concordhelp:
        {
            about: "Contenu de l'aide"
        },

        concordpresentations:
        {
            newSlide: "Nouvelle diapositive",
            addImage: "Insérer une image",
            slideShow: "Démarrer le diaporama",
            addTextBox: "Ajouter une zone de texte",
            addPresComments: "Ajouter un commentaire",
            ctxMenuSmartTable: "Ajouter un tableau",
            slideTemplate: "Styles maître",
            slideLayout: "Mise en page de diapositive",
            saveAsDraft: "Enregistrer"
        },

        concordrestyler:
        {
            toolbarRestylePrevious: "Style précédent",
            toolbarRestyleNext: "Style suivant"
        },

        concordsave:
        {
            concordsaveLabel: "Enregistrer le document",
            concordpublishLabel: "Publier une version",
            publishOkLabel: "Publier",
            checkinLabel: "Restituer",
			yesLabel: "Oui"
        },

        concordtemplates:
        {
            toolbarTemplates: "Modèles",
            dlgLabelDefaultSearchbarValue: "Rechercher",
            dlgLabelInitSearchResults: "Résultats : 5 modèles",
            dlgLabelResults: "Résultats : ",
            dlgLabelTemplates: " modèles",
            dlgLabelShow: "Afficher : ",
            dlgLabelAll: " Tout ",
            dlgLabelDoc: "Documents",
            dlgLabelST: "Tableaux",
            dlgLabelSections: "Sections",
            dlgLabelSeperator: " | ",
            dlgLabelDone: " Terminé ",
            dlgLabelCancel: " Annuler ",
            dlgInsertSectionError: "Vous ne pouvez pas insérer une section car la sélection est à l'intérieur d'un tableau.",
            dlgLabelDataError: "Impossible d'extraire les modèles pour le moment. Réessayez plus tard.",
            dlgTitle: "Modèles",
            dlgLabelLoading: "Chargement en cours...",
            RESULTS_TOTAL_TEMPLATES: "Résultats : ${0} modèle(s)",
            template0:
            {
                title: "Fax",
                description: ""
            },
            template1:
            {
                title: "Facture",
                description: ""
            },
            template2:
            {
                title: "Mémo",
                description: ""
            },
            template3:
            {
                title: "Letter",
                description: ""
            },
            template4:
            {
                title: "Curriculum vitae",
                description: ""
            },
            template5:
            {
                title: "Papier à en-tête - Employé",
                description: ""
            },
            template6:
            {
                title: "Papier à en-tête - Société",
                description: ""
            },
            template7:
            {
                title: "Papier à en-tête personnel",
                description: ""
            },
            template8:
            {
                title: "Papier à en-tête - Article de recherche",
                description: ""
            },
            template9:
            {
                title: "Références",
                description: ""
            }
        },
        deletekey:
        {
            forbiddenCopy: "Vous ne pouvez pas copier le contenu car la sélection contient une tâche ou des commentaires.",
            forbiddenCut: "Vous ne pouvez pas supprimer le contenu car la sélection contient une tâche",
            forbiddenDelete: "Vous ne pouvez pas supprimer le contenu car la sélection contient une tâche."
        },
        dialogmessage:
        {
            title: "Message",
            dlgTitle: "Message",
            validate: "valider",
            dialogMessage: "Message de boîte de dialogue ici"
        },

        increasefont:
        {
            fail: "Vous ne pouvez pas continuer à augmenter ou diminuer la taille de la police, car elle a atteint la valeur maximale ou minimale."
        },

        list:
        {
            disableMutliRangeSel: "Vous ne pouvez pas ajouter de numéros ou de puces à des lignes discontinues au cours de la même opération. Essayez d'ajouter des numéros ou des puces à des lignes, un à un.",
            disableBullet: "Vous ne pouvez pas ajouter de numéros ou de puces au sélecteur de tâches. Essayez de sélectionner du texte sans sélectionner le bouton Actions, puis ajoutez des numéros ou des puces."
        },

        listPanel:
        {
            continuelabel: "Continuer la liste",
            restartlabel: "Redémarrer la liste"
        },
        liststyles:
        {
            // Note: captions taken from UX design (story 42103 in pre-2012 RTC repository)
            titles:
            {
                numeric: "Numérotation",
                bullets: "Puces",
                multilevel: "Listes multi-niveaux"  // for both numeric and bullet lists
            },
            numeric:
            {
                numeric1: "Numérotation 1",
                numeric2: "Numérotation 2",
                numericParen: "Numérotation et parenthèses",
                numericLeadingZero: "Numérotation et zéro de gauche",
                upperAlpha: "Alphabétique majuscule",
                upperAlphaParen: "Alphabétique majuscule et parenthèse",
                lowerAlpha: "Alphabétique minuscule",
                lowerAlphaParen: "Alphabétique minuscule et parenthèses",
                upperRoman: "Romain majuscule",
                lowerRoman: "Romain minuscule",
                japanese1: "Japonais numérique 1",
                japanese2: "Japonais numérique 2"
            },
            multilevelNumeric:
            {
                numeric: "Numérique",
                tieredNumbers: "Nombres à plusieurs niveaux",
                alphaNumeric: "Alpha numérique",
                numericRoman: "Romain numérique",
                numericArrows: "Numérique/flèches descendantes",
                alphaNumericBullet: "Alpha numérique/puce",
                alphaRoman: "Romain alphabétique",
                lowerAlphaSquares: "Alpha minuscule/carrés",
                upperRomanArrows: "Romain majuscule"
            },
            bullets:
            {
                circle: "Cercle",
                cutOutSquare: "Carré découpé",
                rightArrow: "Flèche vers la droite",
                diamond: "Losange",
                doubleArrow: "Flèche double",
                asterisk: "Astérisque",
                thinArrow: "Flèche fine",
                checkMark: "Coche",
                plusSign: "Signe plus",
                // TODO - captions for image bullets
                //      - using image titles as starting point
                //        (see images in story 42428 in pre-2012 RTC repository)
                imgBlueCube: "Cube bleu",
                imgBlackSquare: "Carré noir",
                imgBlueAbstract: "Abrégé bleu",
                imgLeaf: "Feuille",
                imgSilver: "Cercle argenté",
                imgRedArrow: "Flèche rouge",
                imgBlackArrow: "Flèche noire",
                imgPurpleArrow: "Flèche violette",
                imgGreenCheck: "Coche verte",
                imgRedX: "X rouge",
                imgGreenFlag: "Drapeau vert",
                imgRedFlag: "Drapeau rouge",
                imgStar: "Etoile"
            },
            multilevelBullets:
            {
                numeric: "Numérique",
                tieredNumbers: "Nombres à plusieurs niveaux",
                lowerAlpha: "Alphabétique minuscule",
                alphaRoman: "Romain alphabétique",
                lowerRoman: "Romain minuscule",
                upperRoman: "Romain majuscule",
                dirArrows: "Flèches directionnelles",
                descCircles: "Cercles descendants",
                descSquares: "Carrés descendants"
            }
        },

        presComments:
        {
            addPresComments: "Ajouter un commentaire"
        },

        publish:
        {
            publishLabel: "Enregistrer le document dans Mes fichiers",
            publishDocument: "Enregistrer le document dans Mes fichiers",
            publishDocumentWaitMessage: "Patientez pendant l'enregistrement du document dans Mes fichiers.",
            documentPublished: "Document enregistré dans Mes fichiers"
        },

        smarttables:
        {
            toolbarAddST: "Ajouter un tableau",
            toolbarDelSTRow: "Supprimer la ligne",
            toolbarDelSTCol: "Supprimer la colonne",
            toolbarDelST: "Supprimer le tableau",
            toolbarChgSTStyle: "Changer le style du tableau",
            toolbarMoveSTRowUp: "Déplacer la ligne au-dessus",
            toolbarMoveSTRowDown: "Déplacer la ligne au-dessous",
            toolbarMoveSTColBefore: "Déplacer la colonne avant",
            toolbarMoveSTColAfter: "Déplacer la colonne après",
            toolbarSortSTColAsc: "Tri croissant",
            toolbarSortSTColDesc: "Tri décroissant",
            toolbarResizeSTCols: "Redimensionner les colonnes",
            toolbarMakeHeaderRow: "Transformer en en-tête",
            toolbarMakeNonHeaderRow: "Annuler le statut d'en-tête",
            toolbarMakeHeaderCol: "Transformer en en-tête",
            toolbarMakeNonHeaderCol: "Annuler le statut d'en-tête",
            toolbarToggleFacetSelection: "Générer une catégorie en mode Afficher",
            ctxMenuSmartTable: "Tableau",
            ctxMenuTableProperties: "Propriétés du tableau...",
            ctxMenuTableCellProperties: "Propriétés de la cellule...",
            ctxMenuDeleteST: "Supprimer",
            ctxMenuChgSTStyle: "Changer de style",
            ctxMenuShowCaption: "Afficher la légende",
            ctxMenuHideCaption: "Masquer la légende",
            ctxMenuResizeST: "Redimensionner",
            ctxMenuResizeColumnsST: "Redimensionner les colonnes",
            ctxMenuSTRow: "Ligne",
            ctxMenuAddSTRowAbv: "Insérer une ligne au-dessus",
            ctxMenuAddSTRowBlw: "Insérer une ligne au-dessous",
            ctxMenuMoveSTRowUp: "Déplacer la ligne vers le haut",
            ctxMenuMoveSTRowDown: "Déplacer la ligne vers le bas",
            ctxMenuDelSTRow: "Supprimer",
            ctxMenuSTCol: "Colonne",
            ctxMenuAddSTColBfr: "Insérer une colonne avant",
            ctxMenuAddSTColAft: "Insérer une colonne après",
            ctxMenuMoveSTColBefore: "Déplacer la colonne vers la gauche",
            ctxMenuMoveSTColAfter: "Déplacer la colonne vers la droite",
            ctxMenuDelSTCol: "Supprimer",
            ctxMenuSortSTColAsc: "Tri croissant",
            ctxMenuSortSTColDesc: "Tri décroissant",
            ctxMenuShowAllFacets: "Afficher les catégories",
            ctxMenuHideAllFacets: "Masquer les catégories",
            ctxMenuSTCell: "Cellule",
            ctxMenuMergeCells: "Fusionner les cellules",
            ctxMenuMergeDown: "Fusionner avec la cellule au-dessous",
            ctxMenuVerSplit: "Fractionner verticalement",
            ctxMenuHorSplit: "Fractionner horizontalement",
            ctxMenuAlignTextLeft: "Aligner à gauche",
            ctxMenuAlignTextCenter: "Centrer",
            ctxMenuAlignTextRight: "Aligner à droite",
            ctxMenuClearSTCellContent: "Effacer le contenu",
            ctxMenuMakeHeaderRow: "Utiliser la ligne sélectionnée comme en-tête",
            ctxMenuMakeNonHeaderRow: "Supprimer le style de titre",
            ctxMenuMakeHeaderCol: "Utiliser la colonne sélectionnée comme en-tête",
            ctxMenuMakeNonHeaderCol: "Supprimer le style de titre",
            msgCannotInsertRowBeforeHeader: "Une nouvelle ligne ne peut pas être insérée devant le titre.",
            msgCannotInsertCoBeforeHeader: "Une nouvelle colonne ne peut pas être insérée devant le titre.",
            msgCannotMoveHeaderRow: "La ligne de titre ne peut pas être déplacée.",
            dlgTitleSTProperties: "Propriétés du tableau",
            dlgTitleAddST: "Ajout d'un tableau",
            dlgLabelSTName: "Nom de tableau :",
            dlgLabelSTType: "Choisir le type de titre",
            dlgLabelSTRows: "Nombre de lignes",
            dlgLabelSTCols: "Nombre de colonnes",
            dlgLabelSTTemplate: "Utiliser un modèle",
            dlgMsgValidationRowsMax: "Entrez un nombre entre 1 et 200.",
            dlgMsgValidationColsMax: "Entrez un nombre entre 1 et 25.",
            dlgMsgValidation: "La valeur doit être un nombre entier positif",
            dlgLabelSTInstruction: "Entrez le nombre de lignes et de colonnes. La valeur maximale est de 200 pour les lignes et de 25 pour les colonnes."
        },
        task: {
            titleAssign: "Affectation de section",
            ctxMenuTask: "Affecter",
            ctxMenuCreateTask: "Affecter une section",
            ctxMenuDeleteTask: "Supprimer",
            ctxMenuClearTask: "Effacer les affectations",
            ctxMenuHideTask: "Tout masquer",
            ctxMenuShowTask: "Tout afficher"
        },
        tablestyles: {
            tableStylesToolbarLabel: "Changer le style du tableau",
            styleTableHeading: "Style tableau",
            recommendedTableHeading: "Recommandé",
            tableStylesGalleryHeading: "Galerie",
            customHeading: "Personnalisé",
            customTableHeading: "Tableau personnalisé",
            customTableCustomizeATable: "Personnaliser un tableau",
            customTableStyleATable: "Attribuer un style à un tableau",
            customTableAddATable: "Ajouter un tableau",
            customTableSelectTableGrid: "Sélectionner une grille de tableau",
            customTableSelectColorScheme: "Sélectionner un schéma de couleurs",
            customTableHeader: "En-tête",
            customTableBanding: "Bandes",
            customTableSummary: "Récapitulatif",
            customTableBorders: "Bordures",
            customTableBackground: "Arrière-plan",
            tableStylePlain: "Simple",
            tableStyleBlueStyle: "Style bleu",
            tableStyleRedTint: "Teinte rouge",
            tableStyleBlueHeader: "En-tête bleu",
            tableStyleDarkGrayHeaderFooter: "En-tête/pied de page gris foncé",
            tableStyleLightGrayRows: "Lignes gris clair",
            tableStyleDarkGrayRows: "Lignes gris foncé",
            tableStyleBlueTint: "Teinte bleue",
            tableStyleRedHeader: "En-tête rouge",
            tableStyleGreenHeaderFooter: "En-tête/pied de page vert",
            tableStylePlainRows: "Lignes simples",
            tableStyleGrayTint: "Teinte grise",
            tableStyleGreenTint: "Teinte verte",
            tableStyleGreenHeader: "En-tête vert",
            tableStyleRedHeaderFooter: "En-tête/pied de page rouge",
            tableStyleGreenStyle: "Style vert",
            tableStylePurpleTint: "Teinte violette",
            tableStyleBlackHeader: "En-tête noir",
            tableStylePurpleHeader: "En-tête violet",
            tableStyleLightBlueHeaderFooter: "En-tête/pied de page bleu clair"
        },
        toc: {
            title: "Table des matières",
            update: "Mettre à jour",
            del: "Supprimer",
            toc: "Table des matières",
            linkTip: "Cliquez en appuyant sur Ctrl pour naviguer",
            pageNumber: "Numéro de page uniquement",
            entireTable: "Tableau entier"
        },
        link: {
            gotolink: "Accéder au lien",
            unlink: "Supprimer le lien",
            editlink: "Editer le lien"
        },
        field: {
            update: "Mettre à jour la zone"
        },
        undo: {
            undoTip: "Annuler",
            redoTip: "Rétablir"
        },
        wysiwygarea: {
            failedPasteActions: "Echec du collage. ${productName} ne peut pas copier et coller des images provenant d'une autre application.  Envoyez le fichier image par téléchargement dans ${productName} pour y utiliser l'image. ",
            filteredPasteActions: "Echec du collage. Pour rendre disponible l'image depuis un autre site Web, téléchargez l'image sur votre ordinateur local puis envoyez l'image par téléchargement dans ${productName}."
        }
})


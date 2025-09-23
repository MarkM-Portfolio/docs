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
		title : "Instructions d'accessibilité",
		contents : "Contenu de l'aide. Pour fermer cette boîte de dialogue, appuyez sur Echap.",
		legend :
		[
			{
				name : "Général",
				items :
				[
					{
						name : "Barres d'outils d'éditeur",
						legend:
							"Appuyez sur ${toolbarFocus} pour naviguer jusqu'à la barre d'outils." +
							"Déplacez-vous jusqu'au groupe de barre d'outils suivant ou précédent avec Tab et Maj-Tab. " +
							"Déplacez-vous jusqu'au bouton de barre d'outils suivant ou précédent avec Flèche vers la droite ou Flèche vers la gauche." +
							"Appuyez sur Espace ou Entrée pour activer le bouton de barre d'outils."
					},

					{
						name : "Boîte de dialogue d'éditeur",
						legend :
							"A l'intérieur d'une boîte de dialogue, appuyez sur TAB pour naviguer jusqu'à la zone suivante, sur Maj+Tab pour aller à la zone précédente, sur Entrée pour soumettre le contenu de la boîte de dialogue et sur Echap pour annuler." +
							"Pour les boîtes de dialogue disposant de plusieurs pages à onglet, appuyez sur Alt+F10 pour accéder au premier onglet." +
							"Déplacez-vous ensuite dans l'onglet suivant avec Tab ou Flèche vers la droite. " +
							"Placez-vous dans l'onglet précédent avec Maj+Tab ou Flèche vers la gauche." +
							"Appuyez sur Espace ou Entrée pour sélectionner la page d'onglet."
					},

					{
						name : "Menu contextuel d'éditeur",
						legend :
							"Appuyez sur ${contextMenu} ou sur la touche d'application pour ouvrir le menu contextuel." +
							"Déplacez-vous ensuite dans l'option de menu suivante avec Tab ou Flèche vers le bas." +
							"Placez-vous sur l'option précédente avec Maj+Tab ou Flèche vers le haut." +
							"Appuyez sur Espace ou Entrée pour sélectionner l'option de menu." +
							"Ouvrez le sous-menu de l'option actuelle avec Espace, Entrée ou Flèche vers la droite." +
							"Retournez à l'élément de menu parent avec Echap ou Flèche vers la gauche. " +
							"Fermez le menu contextuel avec Echap."
					},

					{
						name : "Zone de liste d'éditeur",
						legend :
							"A l'intérieur d'une zone de liste, déplacez-vous sur l'élément de liste suivant avec Tab ou Flèche vers le bas." +
							"Placez-vous sur l'élément de liste précédent avec Maj+Tab ou Flèche vers le haut." +
							"Appuyez sur Espace ou Entrée pour sélectionner l'option de liste." +
							"Appuyez sur Echap pour fermer la zone de liste."
					},

					{
						name : "Barre de chemin d'élément d'éditeur (si disponible*)",
						legend :
							"Appuyez sur ${elementsPathFocus} pour naviguer jusqu'à la barre de chemin des éléments. " +
							"Déplacez-vous sur le bouton d'élément suivant avec Tab et Flèche vers la droite." +
							"Placez-vous sur le bouton précédent avec Maj+Tab ou Flèche vers la gauche." +
							"Appuyez sur Espace ou Entrée pour sélectionner l'élément dans l'éditeur."
					}
				]
			},
			{
				name : "Commandes",
				items :
				[
					{
						name : " Commande Annuler",
						legend : "Appuyez sur ${undo}"
					},
					{
						name : " Commande Rétablir",
						legend : "Appuyez sur ${redo}"
					},
					{
						name : " Commande Gras",
						legend : "Appuyez sur ${bold}"
					},
					{
						name : " Commande Italique",
						legend : "Appuyez sur ${italic}"
					},
					{
						name : " Commande Soulignement",
						legend : "Appuyez sur ${underline}"
					},
					{
						name : " Commande Lien",
						legend : "Appuyez sur ${link}"
					},
					{
						name : " Commande Condenser la barre d'outils (si disponible*)",
						legend : "Appuyez sur ${toolbarCollapse}"
					},
					{
						name : " Aide d'accessibilité",
						legend : "Appuyez sur ${a11yHelp}"
					}
				]
			},

			{	//added by ibm
				name : "",
				items :
				[
					{
						name : "Remarque",
						legend : "* Certaines fonctions peuvent être désactivées par votre administrateur."
					}
				]
			}
		]
	}

});

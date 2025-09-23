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
		title : "Helppokäyttötoimintojen ohjeet",
		contents : "Ohjeen sisältö. Voit sulkea tämän valintaikkunan painamalla ESC-näppäintä.",
		legend :
		[
			{
				name : "Yleiset",
				items :
				[
					{
						name : "Muokkausohjelman työkalurivi",
						legend:
							"Siirry työkaluriville valitsemalla ${toolbarFocus}. " +
							"Siirry seuraavaan tai edelliseen työkaluriviryhmään painamalla SARKAINTA tai näppäinyhdistelmää VAIHTO + SARKAIN. " +
							"Siirry seuraavaan tai edelliseen työkalurivin painikkeeseen painamalla OIKEAA NUOLINÄPPÄINTÄ tai VASENTA NUOLINÄPPÄINTÄ. " +
							"Käytä työkalurivin painiketta painamalla VÄLINÄPPÄINTÄ tai ENTER-näppäintä."
					},

					{
						name : "Muokkaaja-valintaikkuna",
						legend :
							"Valintaikkunassa voit siirtyä seuraavaan valintaikkunan kenttään painamalla SARKAINTA, siirtyä edelliseen kenttään painamalla näppäinyhdistelmää VAIHTO + SARKAIN, sulkea valintaikkunan ja hyväksyä muutokset painamalla ENTER-näppäintä sekä sulkea valintaikkunan ja peruuttaa muutokset painamalla ESC-näppäintä. " +
							"Jos valintaikkunassa on useita välilehtiä, voit siirtyä välilehtiluetteloon painamalla näppäinyhdistelmää ALT + F10." +
							" Siirry sitten seuraavaan välilehteen painamalla SARKAINTA tai OIKEAA NUOLINÄPPÄINTÄ. " +
							"Siirry edelliseen välilehteen painamalla näppäinyhdistelmää VAIHTO + SARKAIN tai VASENTA NUOLINÄPPÄINTÄ. " +
							"Valitse välilehden sivu painamalla VÄLINÄPPÄINTÄ tai ENTER-näppäintä."
					},

					{
						name : "Muokkausohjelman pikavalikko",
						legend :
							"Avaa pikavalikko valitsemalla ${contextMenu} tai painamalla SOVELLUSNÄPPÄINTÄ. " +
							"Siirry seuraavaan valikon vaihtoehtoon painamalla SARKAINTA tai ALANUOLTA. " +
							"Siirry edelliseen vaihtoehtoon painamalla näppäinyhdistelmää VAIHTO + SARKAIN tai YLÄNUOLTA. " +
							"Valitse valikon vaihtoehto painamalla VÄLINÄPPÄINTÄ tai ENTER-näppäintä. " +
							"Avaa nykyisen asetuksen alivalikko painamalla VÄLINÄPPÄINTÄ tai ENTER-näppäintä tai OIKEAA NUOLINÄPPÄINTÄ." +
							"Palaa päävalikkoon painamalla ESC-näppäintä tai VASENTA NUOLINÄPPÄINTÄ. " +
							"Sulje pikavalikko painamalla ESC-näppäintä."
					},

					{
						name : "Muokkausohjelman luetteloruutu",
						legend :
							"Siirry luetteloruudussa seuraavaan luettelokohtaan painamalla SARKAINTA tai ALANUOLINÄPPÄINTÄ. " +
							"Siirry edelliseen luettelokohtaan painamalla näppäinyhdistelmää VAIHTO + SARKAIN tai YLÄNUOLINÄPPÄINTÄ. " +
							"Valitse luettelokohta painamalla VÄLINÄPPÄINTÄ tai ENTER-näppäintä. " +
							"Sulje luetteloruutu painamalla ESC-näppäintä."
					},

					{
						name : "Muokkausohjelman elementtien polku -palkki (jos käytettävissä*)",
						legend :
							"Siirry elementtien polku -palkkiin valitsemalla ${elementsPathFocus}. " +
							"Siirry seuraavaan elementtipainikkeeseen painamalla SARKAINTA tai OIKEAA NUOLINÄPPÄINTÄ. " +
							"Siirry edelliseen elementtipainikkeeseen painamalla näppäinyhdistelmää VAIHTO + SARKAIN tai VASENTA NUOLINÄPPÄINTÄ. " +
							"Valitse muokkausohjelman elementti painamalla VÄLINÄPPÄINTÄ tai ENTER-näppäintä."
					}
				]
			},
			{
				name : "Komennot",
				items :
				[
					{
						name : " Kumoa komento",
						legend : "Valitse ${undo}"
					},
					{
						name : " Tee komento uudelleen",
						legend : "Valitse ${redo}"
					},
					{
						name : " Lihavoinnin komento",
						legend : "Valitse ${bold}"
					},
					{
						name : "Kursivoinnin komento",
						legend : "Valitse ${italic}"
					},
					{
						name : " Alleviivauksen komento",
						legend : "Valitse ${underline}"
					},
					{
						name : " Linkityksen komento",
						legend : "Valitse ${link}"
					},
					{
						name : " Työkalurivin pienennyksen komento (jos käytettävissä*)",
						legend : "Valitse ${toolbarCollapse}"
					},
					{
						name : " Helppokäyttötoimintojen ohje",
						legend : "Valitse ${a11yHelp}"
					}
				]
			},

			{	//added by ibm
				name : "",
				items :
				[
					{
						name : "Huomautus",
						legend : "* Pääkäyttäjä voi ottaa jotkin toiminnot pois käytöstä."
					}
				]
			}
		]
	}

});

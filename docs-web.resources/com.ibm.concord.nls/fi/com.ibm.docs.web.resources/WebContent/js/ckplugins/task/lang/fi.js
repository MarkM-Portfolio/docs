/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2010, 2022                     */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

CKEDITOR.plugins.setLang( 'task', 'fi',{
	task :
	{
	   titleAssign:'Toimeksiannon teko osasta',
	   creatingTaskAsTODO:'Käsittely on meneillään... Järjestelmä luo parhaillaan toimeksiantoa tehtäväksi Aktiviteetit-sovellukseen',
	   updatingTask:'Käsittely on meneillään... Järjestelmä päivittää parhaillaan toimeksiantoa Aktiviteetit-sovelluksessa',
	   creatingFragment: 'Käsittely on meneillään... Järjestelmä luo parhaillaan yksityistä asiakirjaa tästä osasta',
	   updatingMaster: 'Käsittely on meneillään... Järjestelmä päivittää parhaillaan tätä osaa pääasiakirjassa',
	   cannotAccessActivity:'Aktiviteetteja ei voi käyttää toimeksiannon tallennuksessa.',
	   notMemberofActivity: 'Aktiviteetteja ei voi käyttää toimeksiannon tallennuksessa. Et ehkä ole tämän aktiviteetin jäsen',
	   taskAlreadyRemoved:'Tämän asiakirjan tehtävä on poistettu',
	   writeSection:'Määritä tässä osassa valmistuvien tehtävien kuvaukset.',
	   writeSectionDynamicSection:'Määritä tässä osassa valmistuvien tehtävien kuvaukset.',
	   assignTask:'Osoita',
	   cancelTask:'Peruuta',
	   ctxMenuTask: 'Tehtävä',
	   ctxMenuCreateTask: 'Tee osasta toimeksianto',
	   ctxMenuDeleteTask: 'Poista',
	   ctxMenuHideTask: 'Piilota kaikki',
	   ctxMenuShowTask: 'Näytä kaikki',
	   dlgTaskDeleteTitle: 'Poista osa',
	   dlgTaskCreateTitle: 'Tee osasta toimeksianto',	    
	   dlgTaskCreateSectionMode: 'Osoitettu tehtävä:',	    
	   dlgTaskCreateWriteSection: 'Kirjoita tämä osa',	    
	   dlgTaskCreateReviewSection: 'Tarkista tämä osa',
	   dlgTaskCreateAssignee: 'Henkilö, jolle tämä osa osoitetaan:',
	   dlgTaskCreateDescription: 'Kuvaus',
	   dlgTaskCreateInValidMessage: 'Käyttäjää ei ole määritetty muokkaajaksi.<br />Määritä ensin yhteiskäyttöön muokkaajaksi määritetyn käyttäjän kanssa.',
	   dlgTaskCreateWarningMessage: 'Käyttäjät on määritettävä asiakirjan muokkaajiksi <br />\"Omat tiedostot\" -kansiossa, ennen kuin heille voidaan osoittaa tehtäviä.',
	   assignmentAlreadyExist:'Valittu alue on jo osoitettu.',
	   write:'Kirjoita',
	   writeDesc:'Kirjoita ${0}: ${1}',
	   review:'Tarkista',
	   reviewDesc:'Tarkista ${0}: ${1}',
	   reworkDesc:'Käsittele uudelleen ${0}: ${1}',
	   writeCompleteDesc: 'Osa ${0}: kirjoittaja ${1}',
	   reviewCompleteDesc: 'Osa ${0}: tarkistaja ${1}',
	   workingPrivateDesc: '${1} käsittelee kohdetta ${0} yksityisesti',
	   done:'Valmis',
	   actions: 'Toiminnot',
	   currentUserSectionAssigned:'Sinulle on tehty seuraava toimeksianto tässä osassa: ${0}',
	   workPrivately:'Käsittele yksityisesti',
	   currentUserWorkingPrivately : 'Käsittelet tätä osaa yksityisesti',
	   gotoPrivateDocument:'Siirry yksityiseen asiakirjaan',
	   somebody:'Joku',
	   cannotGetAssigneeName:"Asianosaisen nimeä ei voi noutaa. Et ehkä ole aktiviteetin jäsen",
	   userSectionAssigned:'Käyttäjälle ${0} on tehty seuraava toimeksianto tässä osassa: ${1}',
	   userWorkingPrivately: '${0} käsittelee yksityisesti tätä osaa',
	   emptyDocTitle:'Nimetön luonnos',
	   changeOverride:'Tehtävän omistaja ohittaa tekemäsi muutoksen.',
	   onlyAssignerDeleteTask: 'Et voi poistaa tätä toimeksiantoa (sitä ei ole merkitty valmiiksi). Vain toimeksiannon osoittanut käyttäjä voi poistaa toimeksiannon.',
	   actionBtnEdit:'Muokkaa toimeksiantoa',
	   actionBtnRemove:'Poista toimeksianto',
	   actionBtnAbout:'Tietoja tästä osasta',
	   actionBtnMarkComplete:'Merkitse valmiiksi',
	   actionBtnWorkPrivately:'Käsittele yksityisesti',
	   actionBtnApprove:'Hyväksy tämä osa',
	   actionBtnGotoPrivate:'Siirry yksityiseen asiakirjaan',
	   actionBtnRework:'Edellyttää tekemistä uudelleen'
	}
});

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

CKEDITOR.plugins.setLang( 'task', 'pl',{
	task :
	{
	   titleAssign:'Przypisz sekcję',
	   creatingTaskAsTODO:'Trwa przetwarzanie... Przypisanie jest tworzone jako pozycja na liście czynności do wykonania w aplikacji Działania.',
	   updatingTask:'Trwa przetwarzanie... Przypisanie jest aktualizowane w aplikacji Działania.',
	   creatingFragment: 'Trwa przetwarzanie... Tworzony jest dokument prywatny dla tej sekcji.',
	   updatingMaster: 'Trwa przetwarzanie... Sekcja jest aktualizowana w dokumencie głównym.',
	   cannotAccessActivity:'Nie można uzyskać dostępu do komponentu Działania w celu zarejestrowania przypisania...',
	   notMemberofActivity: 'Nie można uzyskać dostępu do komponentu Działania w celu zarejestrowania przypisania. Być może użytkownik nie jest członkiem tego działania.',
	   taskAlreadyRemoved:'Czynność tego dokumentu została usunięta',
	   writeSection:'Opisz czynności, które mają zostać wykonane w odniesieniu do sekcji.',
	   writeSectionDynamicSection:'Opisz czynności, które mają zostać wykonane w odniesieniu do sekcji.',
	   assignTask:'Przypisz',
	   cancelTask:'Anuluj',
	   ctxMenuTask: 'Czynność',
	   ctxMenuCreateTask: 'Przypisz sekcję',
	   ctxMenuDeleteTask: 'Usuń',
	   ctxMenuHideTask: 'Ukryj wszystko',
	   ctxMenuShowTask: 'Pokaż wszystko',
	   dlgTaskDeleteTitle: 'Usuń sekcję',
	   dlgTaskCreateTitle: 'Przypisz sekcję',	    
	   dlgTaskCreateSectionMode: 'Przypisana czynność:',	    
	   dlgTaskCreateWriteSection: 'Pisz tę sekcję',	    
	   dlgTaskCreateReviewSection: 'Dokonaj przeglądu tej sekcji',
	   dlgTaskCreateAssignee: 'Osoba, do której ma zostać przypisana sekcja:',
	   dlgTaskCreateDescription: 'Opis',
	   dlgTaskCreateInValidMessage: 'Użytkownik nie jest zdefiniowany jako edytujący.<br />Najpierw należy udostępnić element do współużytkowania dla użytkownika z rolą Edytujący.',
	   dlgTaskCreateWarningMessage: 'Użytkownicy muszą być zdefiniowani jako edytujący dla dokumentu w<br />komponencie Moje pliki, zanim będzie możliwe przypisanie do nich czynności.',
	   assignmentAlreadyExist:'Wybrany obszar został wcześniej przypisany.',
	   write:'Pisanie',
	   writeDesc:'Pisanie sekcji ${0}: ${1}',
	   review:'Przegląd',
	   reviewDesc:'Przegląd sekcji ${0}: ${1}',
	   reworkDesc:'Przeróbka sekcji ${0}: ${1}',
	   writeCompleteDesc: 'Sekcja ${0} napisana przez użytkownika ${1}',
	   reviewCompleteDesc: 'Sekcja ${0} przejrzana przez użytkownika ${1}',
	   workingPrivateDesc: 'Trwa praca prywatna użytkownika ${1} nad sekcją ${0}',
	   done:'Gotowe',
	   actions: 'Działania',
	   currentUserSectionAssigned:'Bieżący użytkownik został przypisany do tej sekcji jako ${0}',
	   workPrivately:'Praca prywatna',
	   currentUserWorkingPrivately : 'Pracujesz prywatnie nad tą sekcją',
	   gotoPrivateDocument:'Idź do dokumentu prywatnego',
	   somebody:'Ktoś',
	   cannotGetAssigneeName:"Nie można uzyskać nazwy przypisanej osoby. Być może użytkownik nie jest członkiem działania.",
	   userSectionAssigned:'Użytkownik ${0} został przypisany do tej sekcji jako ${1}',
	   userWorkingPrivately: 'Użytkownik ${0} pracuje prywatnie nad tą sekcją',
	   emptyDocTitle:'Niezatytułowana wersja robocza',
	   changeOverride:'Zmiana zostanie nadpisana przez właściciela czynności.',
	   onlyAssignerDeleteTask: 'Nie można usunąć przypisania, które nie zostało oznaczone jako zakończone. Usunąć przypisanie może tylko osoba, która je utworzyła.',
	   actionBtnEdit:'Edytuj przypisanie',
	   actionBtnRemove:'Usuń przypisanie',
	   actionBtnAbout:'Informacje o tej sekcji',
	   actionBtnMarkComplete:'Oznacz jako zakończoną',
	   actionBtnWorkPrivately:'Praca prywatna',
	   actionBtnApprove:'Zatwierdź tę sekcję',
	   actionBtnGotoPrivate:'Idź do dokumentu prywatnego',
	   actionBtnRework:'Wymagana przeróbka'
	}
});

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

CKEDITOR.plugins.setLang( 'task', 'el',{
	task :
	{
	   titleAssign:'Ανάθεση ενότητας',
	   creatingTaskAsTODO:'Επεξεργασία σε εξέλιξη. Η ανατεθειμένη εργασία δημιουργείται ως εκκρεμής εργασία στην εφαρμογή Δραστηριότητες.',
	   updatingTask:'Επεξεργασία σε εξέλιξη. Η ανατεθειμένη εργασία ενημερώνεται στην εφαρμογή Δραστηριότητες.',
	   creatingFragment: 'Επεξεργασία σε εξέλιξη. Δημιουργείται ένα ιδιωτικό έγγραφο για αυτή την ενότητα.',
	   updatingMaster: 'Επεξεργασία σε εξέλιξη. Η ενότητα ενημερώνεται στο κύριο έγγραφο.',
	   cannotAccessActivity:'Δεν είναι δυνατή η πρόσβαση στις Δραστηριότητες για την καταγραφή της εργασίας που σας ανατέθηκε.',
	   notMemberofActivity: 'Δεν είναι δυνατή η πρόσβαση στις Δραστηριότητες για την καταγραφή της εργασίας που σας ανατέθηκε. Μπορεί να μην είστε μέλος αυτής της δραστηριότητας.',
	   taskAlreadyRemoved:'Η εργασία αυτού του εγγράφου έχει αφαιρεθεί.',
	   writeSection:'Περιγράψτε τις εργασίες που θέλετε να γίνουν για αυτή την ενότητα.',
	   writeSectionDynamicSection:'Περιγράψτε τις εργασίες που θέλετε να γίνουν για αυτή την ενότητα.',
	   assignTask:'Ανάθεση',
	   cancelTask:'Ακύρωση',
	   ctxMenuTask: 'Εργασία',
	   ctxMenuCreateTask: 'Ανάθεση ενότητας',
	   ctxMenuDeleteTask: 'Διαγραφή',
	   ctxMenuHideTask: 'Απόκρυψη όλων',
	   ctxMenuShowTask: 'Εμφάνιση όλων',
	   dlgTaskDeleteTitle: 'Αφαίρεση ενότητας',
	   dlgTaskCreateTitle: 'Ανάθεση ενότητας',	    
	   dlgTaskCreateSectionMode: 'Ανατεθειμένη εργασία:',	    
	   dlgTaskCreateWriteSection: 'Σύνταξη αυτής της ενότητας',	    
	   dlgTaskCreateReviewSection: 'Εξέταση αυτής της ενότητας',
	   dlgTaskCreateAssignee: 'Ανάθεση ενότητας στο χρήστη:',
	   dlgTaskCreateDescription: 'Περιγραφή',
	   dlgTaskCreateInValidMessage: 'Ο χρήστης δεν έχει οριστεί ως Επιμελητής.<br />Διαθέστε στο χρήστη το έγγραφο για κοινή χρήση, επιλέγοντας για το χρήστη το ρόλο του επιμελητή.',
	   dlgTaskCreateWarningMessage: 'Για να είναι δυνατή η ανάθεση εργασιών στους χρήστες, <br />οι χρήστες θα πρέπει να έχουν οριστεί ως \"Επιμελητές\" <br />του εγγράφου στη λίστα \"Τα αρχεία μου\".',
	   assignmentAlreadyExist:'Η επιλεγμένη περιοχή έχει ήδη ανατεθεί.',
	   write:'Σύνταξη',
	   writeDesc:'Σύνταξη ${0}: ${1}',
	   review:'Εξέταση',
	   reviewDesc:'Εξέταση ${0}: ${1}',
	   reworkDesc:'Επανεκτέλεση εργασίας για ${0}: ${1}',
	   writeCompleteDesc: 'Σύνταξη ενότητας ${0} από το χρήστη ${1}',
	   reviewCompleteDesc: 'Εξέταση ενότητας ${0} από το χρήστη ${1}',
	   workingPrivateDesc: 'Ιδιωτική εργασία του χρήστη ${1} στην ενότητα ${0}',
	   done:'Ολοκλήρωση',
	   actions: 'Ενέργειες',
	   currentUserSectionAssigned:'Σας ανατέθηκε η ακόλουθη εργασία για αυτή την ενότητα: ${0}',
	   workPrivately:'Ιδιωτική εργασία',
	   currentUserWorkingPrivately : 'Εργάζεστε ιδιωτικά σε αυτή την ενότητα',
	   gotoPrivateDocument:'Μετάβαση σε ιδιωτικό έγγραφο',
	   somebody:'Κάποιος',
	   cannotGetAssigneeName:"Δεν είναι δυνατή η ανάκτηση του ονόματος του χρήστη στον οποίο ανατέθηκε η εργασία. Μπορεί να μην είστε μέλος της δραστηριότητας.",
	   userSectionAssigned:'Ανατέθηκε στο χρήστη ${0} η ακόλουθη εργασία για αυτή την ενότητα: ${1}',
	   userWorkingPrivately: 'Ο χρήστης ${0} εργάζεται ιδιωτικά σε αυτή την ενότητα.',
	   emptyDocTitle:'Προσχέδιο χωρίς τίτλο',
	   changeOverride:'Η αλλαγή σας θα αντικατασταθεί από τον κάτοχο της εργασίας.',
	   onlyAssignerDeleteTask: 'Δεν μπορείτε να διαγράψετε αυτή την ανατεθειμένη εργασία που δεν έχει επισημανθεί ως ολοκληρωμένη. Μόνο ο χρήστης που την ανέθεσε μπορεί να τη διαγράψει.',
	   actionBtnEdit:'Τροποποίηση ανάθεσης',
	   actionBtnRemove:'Κατάργηση ανάθεσης',
	   actionBtnAbout:'Πληροφορίες για αυτή την ενότητα',
	   actionBtnMarkComplete:'Επισήμανση ως ολοκληρωμένης',
	   actionBtnWorkPrivately:'Ιδιωτική εργασία',
	   actionBtnApprove:'Έγκριση αυτής της ενότητας',
	   actionBtnGotoPrivate:'Μετάβαση σε ιδιωτικό έγγραφο',
	   actionBtnRework:'Απαιτείται επανεκτέλεση'
	}
});

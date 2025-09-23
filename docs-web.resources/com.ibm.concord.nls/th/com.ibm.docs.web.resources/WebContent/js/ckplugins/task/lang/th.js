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

CKEDITOR.plugins.setLang( 'task', 'th',{
	task :
	{
	   titleAssign:'กำหนดส่วน',
	   creatingTaskAsTODO:'กำลังประมวลผล... กำลังสร้างการกำหนดของคุณเป็นรายการสิ่งที่ต้องทำในแอ็พพลิเคชันกิจกรรม',
	   updatingTask:'กำลังประมวลผล... กำลังอัพเดตการกำหนดของคุณในแอ็พพลิเคชันกิจกรรม',
	   creatingFragment: 'กำลังประมวลผล... กำลังสร้างเอกสารส่วนตัวสำหรับส่วนนี้',
	   updatingMaster: 'กำลังประมวลผล... กำลังอัพเดตส่วนนี้ในเอกสารหลัก',
	   cannotAccessActivity:'ไม่สามารถเข้าถึงกิจกรรมเพื่อเร็กคอร์ดการกำหนดค่าของคุณได้..',
	   notMemberofActivity: 'ไม่สามารถเข้าถึงกิจกรรมเพื่อเร็กคอร์ดการกำหนดค่าของคุณได้ คุณอาจไม่ใช่สมาชิกของกิจกรรมนี้',
	   taskAlreadyRemoved:'ถอนภารกิจของเอกสารนี้ออกแล้ว',
	   writeSection:'อธิบายถึงภารกิจที่คุณต้องการทำกับส่วนนี้',
	   writeSectionDynamicSection:'อธิบายถึงภารกิจที่คุณต้องการทำกับส่วนนี้',
	   assignTask:'กำหนด',
	   cancelTask:'ยกเลิก',
	   ctxMenuTask: 'ภารกิจ',
	   ctxMenuCreateTask: 'กำหนดส่วน',
	   ctxMenuDeleteTask: 'ลบ',
	   ctxMenuHideTask: 'ซ่อนทั้งหมด',
	   ctxMenuShowTask: 'แสดงทั้งหมด',
	   dlgTaskDeleteTitle: 'ลบส่วน',
	   dlgTaskCreateTitle: 'กำหนดส่วน',	    
	   dlgTaskCreateSectionMode: 'ภารกิจที่กำหนดไว้:',	    
	   dlgTaskCreateWriteSection: 'เขียนส่วนนี้',	    
	   dlgTaskCreateReviewSection: 'ตรวจทานส่วนนี้',
	   dlgTaskCreateAssignee: 'บุคคลที่ต้องการกำหนดส่วนนี้:',
	   dlgTaskCreateDescription: 'คำอธิบาย',
	   dlgTaskCreateInValidMessage: 'ผู้ใช้ไม่ได้ถูกนิยามเป็น เอดิเตอร์<br />โปรดแบ่งใช้กับผู้ใช้ที่เป็น เอดิเตอร์ ก่อน',
	   dlgTaskCreateWarningMessage: 'ผู้ใช้ต้องถูกนิยามเป็น \"Editors\" ของเอกสารใน <br />\"My Files\" ก่อนที่จะสามารถกำหนดภารกิจให้กับผู้ใช้เหล่านั้นได้',
	   assignmentAlreadyExist:'พื้นที่ที่เลือกถูกกำหนดไว้แล้วก่อนหน้านี้',
	   write:'เขียน',
	   writeDesc:'เขียน ${0}: ${1}',
	   review:'ตรวจทาน',
	   reviewDesc:'ตรวจทาน ${0}: ${1}',
	   reworkDesc:'ทำงานซ้ำ ${0}: ${1}',
	   writeCompleteDesc: 'ส่วน ${0} ถูกขียนโดย ${1}',
	   reviewCompleteDesc: 'ส่วน ${0} ถูกตรวจทานโดย ${1}',
	   workingPrivateDesc: 'ทำงานแบบส่วนตัวบน ${0} โดย ${1}',
	   done:'เสร็จสิ้น',
	   actions: 'การดำเนินการ',
	   currentUserSectionAssigned:'คุณได้กำหนดให้กับ ${0} ในส่วนนี้',
	   workPrivately:'ทำงานแบบส่วนบุคคล',
	   currentUserWorkingPrivately : 'คุณกำลังทำงานแบบส่วนตัวบนส่วนนี้',
	   gotoPrivateDocument:'ไปยังเอกสารส่วนบุคคล',
	   somebody:'ใครบางคน',
	   cannotGetAssigneeName:"ไม่สามารถขอรับชื่อของผู้รับโอน คุณอาจไม่ใช่สมาชิกของกิจกรรมนี้",
	   userSectionAssigned:'${0} ได้ถูกกำหนดไปยัง ${1} ในส่วนนี้',
	   userWorkingPrivately: '${0} กำลังทำงานแบบส่วนตัวบนส่วนนี้',
	   emptyDocTitle:'แบบร่างที่ไม่มีหัวเรื่อง',
	   changeOverride:'การเปลี่ยนของคุณจะถูกเขียนทับโดยเจ้าของภารกิจ',
	   onlyAssignerDeleteTask: 'คุณไม่สามารถลบการกำหนดนี้ที่ไม่ถูกทำเครื่องหมายว่าสำเร็จแล้ว เฉพาะผู้ที่เป็นผู้กำหนดงานเท่านั้นที่สามารถลบได้',
	   actionBtnEdit:'แก้ไขการกำหนดค่า',
	   actionBtnRemove:'ถอนการกำหนดค่า',
	   actionBtnAbout:'เกี่ยวกับส่วนนี้',
	   actionBtnMarkComplete:'ทำเครื่องหมายว่าสมบูรณ์',
	   actionBtnWorkPrivately:'ทำงานแบบส่วนบุคคล',
	   actionBtnApprove:'อนุมัติส่วนนี้',
	   actionBtnGotoPrivate:'ไปยังเอกสารส่วนบุคคล',
	   actionBtnRework:'ทำงานใหม่ตามที่ต้องการ'
	}
});

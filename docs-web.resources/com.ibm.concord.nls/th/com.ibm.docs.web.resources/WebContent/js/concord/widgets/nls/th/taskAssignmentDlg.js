/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

({
	WRITE_MODE : "เขียน",
	REVIEW_MODE : "ตรวจทาน",
	LOCK_MODE : "ล็อก",	
	TASK_SELECT_ACTIVITY_MESSAGE: "ก่อนที่คุณจะมอบหมายส่วน ให้เลือกหรือสร้างกิจกรรมเพื่อบันทึกการมอบหมายของเอกสารนี้เป็นรายการสิ่งที่ต้องทำ หลังจากคุณมอบหมายกิจกรรมให้กับเอกสารแล้ว คุณจะไม่สามารถเปลี่ยนกิจกรรมได้",
	TASK_CREATE_TITLE: "มอบหมายส่วน",   
	TASK_CREATE_TITLE_PRES: "มอบหมายสไลด์",  
	TASK_EDIT_TITLE: "แก้ไขการมอบหมาย",
	TASK_REWORK_TITLE: "การมอบหมายงานใหม่",
	TASK_CREATE_SECTION_TITLE: "* หัวเรื่อง:",
	TASK_CREATE_OPTION_TITLE: "หัวเรื่อง:",
	TASK_CREATE_SECTION_MODE : "ภารกิจที่มอบหมายไว้:",
	TASK_CREATE_WRITE_SECTION: "เขียนส่วนนี้",
	TASK_CREATE_WRITE_SECTION_PRES: "เขียนสไลด์เหล่านี้",
	TASK_CREATE_REVIEW_SECTION: "ตรวจทานส่วนนี้",
	TASK_CREATE_REVIEW_SECTION_PRES: "ตรวจทานสไลด์เหล่านี้",
	TASK_CREATE_WRITE_CELLS: "เขียนเซลล์",
	TASK_CREATE_REVIEW_CELLS: "ตรวจทานเซลล์",
	TASK_CREATE_ASSIGNEE: "* มอบหมายให้กับ:",
	TASK_CREATE_DUEDATE: "วันที่ครบกำหนด:",
	TASK_CREATE_DESCRIPTION: "คำอธิบาย:",
	TASK_CREATE_DESCRIPTION_WITH_LIMITATION: "คำอธิบาย: (ไม่มากกว่า ${0} อักขระ)",
	TASK_CREATE_DESCRIPTION_CONTENT: "อธิบายถึงภารกิจที่คุณต้องการทำกับส่วนนี้",
	TASK_CREATE_NEED_REVIEW: "ต้องการการตรวจทานของการมอบหมายนี้",
	TASK_CREATE_NEED_REVIEW_PRES: "ต้องการผู้ตรวจทานของสไลด์เหล่านี้",
	TASK_CREATE_REVIEWER: "* ผู้ตรวจทาน",
	TASK_CREATE_INVALID_MSG: "ไม่ได้กำหนดบุคคลเป็นเอดิเตอร์ หรือไฟล์อาจถูกล็อคไว้โดยเอดิเตอร์อื่น ขั้นแรกให้แบ่งใช้เอกสารกับบุคคลโดยใช้บทบาท เอดิเตอร์ จากนั้นคุณก็สามารถมอบหมายส่วนได้",
	TASK_CREATE_INVALID_MSG2: "คุณไม่มีสิทธิสร้างการมอบหมายในไฟล์นี้ ไฟล์ต้องมีการแบ่งใช้กับคุณและระดับสิทธิเข้าถึงของคุณมีการตั้งค่าเป็นเอดิเตอร์ ไฟล์ยังอาจถูกล็อคโดยเอดิเตอร์อื่นด้วย",	
	TASK_CREATE_WARNING_MSG: "ผู้ใช้ต้องถูกกำหนดเป็น \"เอดิเตอร์\" ของเอกสารใน <br />\"ไฟล์ของฉัน\" ก่อนที่จะสามารถมอบหมายภารกิจให้กับพวกเขาได้",
	TASK_CREATE_WARNING_EMPTYTITLE_MSG: "หัวเรื่องต้องถูกระบุไว้",
	TASK_CREATE_WARNING_INVALIDLENGTH_MSG: "หัวเรื่องที่คุณป้อนยาวเกินไป ป้อนหัวเรื่องที่สั้นลง",
	TASK_CREATE_WARNING_REVIEWER_MSG: "ผู้ใช้ต้องถูกกำหนดเป็น \"เอดิเตอร์\" ของเอกสารใน <br />\"ไฟล์ของฉัน\" ก่อนที่จะสามารถมอบหมายให้ตรวจทานได้",
	TASK_CREATE_WARNING_EMPACTIVITYID_MSG: "ต้องเลือกกิจกรรม",
	TASK_CREATE_WARNING_EMPACTIVITYNAME_MSG: "ต้องระบุชื่อของกิจกรรม",
	TASK_DATEFORMAT_INVALID_MSG: "ค่าของวันที่ครบกำหนดไม่ถูกต้อง ป้อนวันที่ในรูปแบบ ${0}",
	TASK_SELECT_ACTIVITY: "* กิจกรรม:",
	TASK_SELECT_TASK_DEFAULT: "เลือกกิจกรรม",
	TASK_NEW_ACTIVITY: "กิจกรรมใหม่",
	TASK_CREATE_ACTIVITY_NAME: "* ชื่อกิจกรรมใหม่:",
	TASK_DUEDATE_EXAMPLE: "ตัวอย่างเช่น ${0}",
	TASK_HINT_CLOSE: "ปิด",
	TASK_A11Y_TITLE: "หัวเรื่องการมอบหมาย",
	TASK_A11Y_REVIEWER: "นี่เป็นวิดเจ็ตการพิมพ์ล่วงหน้า พิมพ์ชื่อเอดิเตอร์เพื่อเลือกผู้ตรวจทาน",
	TASK_A11Y_ASSIGNEE: "นี่เป็นวิดเจ็ตการพิมพ์ล่วงหน้า พิมพ์ชื่อเอดิเตอร์เพื่อเลือกผู้รับมอบหมาย",
	TASK_A11Y_DUEDATE: "วันที่ครบกำหนดของการมอบหมายนี้"	
})

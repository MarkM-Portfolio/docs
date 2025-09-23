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

CKEDITOR.plugins.setLang( "smarttables", "en",{
	smarttables :
	{
	   toolbarAddST: "เพิ่มตาราง",
	   toolbarAddSTRowAbv: "เพิ่มแถวด้านบน",
	   toolbarAddSTRowBlw: "เพิ่มแถวด้านล่าง",
	   toolbarAddSTColBfr: "เพิ่มคอลัมน์ก่อน",
	   toolbarAddSTColAft: "เพิ่มคอลัมน์หลัง",   
	   toolbarDelSTRow: "ลบแถว",
	   toolbarDelSTCol: "ลบคอลัมน์",
	   toolbarDelST: "ลบตาราง",
	   toolbarChgSTStyle: "เปลี่ยนลักษณะของตาราง",
	   toolbarMoveSTRowUp: "ย้ายแถวขึ้น",
	   toolbarMoveSTRowDown: "ย้ายแถวลง",
	   toolbarMoveSTColBefore: "ย้ายคอลัมน์ก่อน",
	   toolbarMoveSTColAfter: "ย้ายคอลัมน์หลัง",
	   toolbarSortSTColAsc: "เรียงลำดับจากน้อยไปมาก",
	   toolbarSortSTColDesc: "เรียงลำดับจากมากไปน้อย",
	   toolbarResizeSTCols: "ปรับขนาดคอลัมน์",
	   toolbarAlignTextLeft: "จัดตำแหน่งข้อความชิดซ้าย",
	   toolbarAlignTextCenter: "จัดตำแหน่งข้อความกึ่งกลาง",
	   toolbarAlignTextRight: "จัดตำแหน่งข้อความชิดขวา",
	   toolbarClearSTCellContent: "ล้างเนื้อหา",
	   toolbarMakeHeaderRow: "สร้างส่วนหัว",
	   toolbarMakeNonHeaderRow: "ไม่สร้างส่วนหัว",
	   toolbarMakeHeaderCol: "สร้างส่วนหัว",
	   toolbarMakeNonHeaderCol: "ไม่สร้างส่วนหัว",
	   toolbarToggleFacetSelection: "สร้างหมวดหมู่ในโหมดมุมมอง",
	   ctxMenuSmartTable: "ตาราง",
	   ctxMenuDeleteST: "ลบ",
	   ctxMenuChgSTStyle: "เปลี่ยนสไตล์",
	   ctxMenuShowCaption: "แสดงคำบรรยายภาพ",
	   ctxMenuHideCaption: "ซ่อนคำบรรยายภาพ",
	   ctxMenuResizeST: "ปรับขนาด",
	   ctxMenuResizeColumnsST: "ปรับขนาดคอลัมน์",
	   ctxMenuSTRow: "แถว",
	   ctxMenuAddSTRowAbv: "เพิ่มแถวด้านบน",
	   ctxMenuAddSTRowBlw: "เพิ่มแถวด้านล่าง",
	   ctxMenuMoveSTRowUp: "ย้ายแถวด้านบน",
	   ctxMenuMoveSTRowDown: "ย้ายแถวด้านล่าง",
	   ctxMenuDelSTRow: "ลบ",
	   ctxMenuSTCol: "คอลัมน์",
	   ctxMenuAddSTColBfr: "เพิ่มคอลัมน์ก่อน",
	   ctxMenuAddSTColAft: "เพิ่มคอลัมน์หลัง",  
	   ctxMenuMoveSTColBefore: "ย้ายคอลัมน์ก่อน",
	   ctxMenuMoveSTColAfter: "ย้ายคอลัมน์หลัง",
	   ctxMenuDelSTCol: "ลบ",
	   ctxMenuSortSTColAsc: "เรียงลำดับจากน้อยไปมาก",
	   ctxMenuSortSTColDesc: "เรียงลำดับจากมากไปน้อย",
	   ctxMenuShowAllFacets: "แสดงหมวดหมู่",
	   ctxMenuHideAllFacets: "ซ่อนหมวดหมู่",
	   ctxMenuSTCell: "เซลล์",
	   ctxMenuAlignTextLeft: "จัดตำแหน่งข้อความชิดซ้าย",
	   ctxMenuAlignTextCenter: "จัดตำแหน่งข้อความกึ่งกลาง",
	   ctxMenuAlignTextRight: "จัดตำแหน่งข้อความชิดขวา",
	   ctxMenuClearSTCellContent: "เคลียร์เนื้อหา",
	   ctxMenuMakeHeaderRow: "ใช้แถวที่เลือกเป็นส่วนหัว",
	   ctxMenuMakeNonHeaderRow: "ลบสไตล์ส่วนหัว",
	   ctxMenuMakeHeaderCol: "ใช้คอลัมน์ที่เลือกเป็นส่วนหัว",
	   ctxMenuMakeNonHeaderCol: "ลบสไตล์ส่วนหัว",
	   ctxMenuAddSummary: "เพิ่มสรุปข้อมูลตาราง",
	   ctxMenuAddCaption: "เพิ่มคำอธิบายตาราง",
	   msgCannotInsertRowBeforeHeader: "ไม่สามารถแทรกแถวใหม่ให้อยู่ก่อนส่วนหัวได้",
	   msgCannotInsertCoBeforeHeader: "ไม่สามารถแทรกคอลัมน์ใหม่ให้อยู่ก่อนส่วนหัวได้",
	   msgCannotMoveHeaderRow: "ไม่สามารถย้ายแถวส่วนหัวได้",
	   dlgTitleAddST: "เพิ่มตาราง",
	   dlgLabelSTName: "ชื่อตาราง:",
	   dlgLabelSTType: "เลือกประเภทของส่วนหัว",
	   dlgLabelSTRows: "จำนวนแถว",
	   dlgLabelSTCols: "จำนวนคอลัมน์",
	   dlgLabelSTTemplate: "ใช้เท็มเพลต",
	   dlgMsgValidationRowsMax:"จำนวนแถวสูงสุดคือ 200",
	   dlgMsgValidationColsMax:"จำนวนคอลัมน์สูงสุดคือ 25",
	   dlgMsgValidationRows:"ค่าต้องเป็นตัวเลข",
	   dlgMsgValidationCols:"ค่าต้องเป็นตัวเลข"
	}
});

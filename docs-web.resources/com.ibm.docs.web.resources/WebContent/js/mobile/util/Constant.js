dojo.provide("mobile.util.Constant");
dojo.require("mobile.bean.MimeType");
mobile.Constant = {
	TriState:{
		DISABLED: 0,
		ON: 1,
		OFF: 2
	},
	FileItemType: {
		SINGITEM: 0,
		TREEITEM: 1
	},
	FileURL: {
		OPENDOCS: "/app/doc/${repoId}/${docUri}/${action}",
		SHAREME: "/api/reposvr/${repoId}/collection/shared/feed",
		MYFILES: "/api/reposvr/${repoId}/library/mine/feed"
	},
	MimeType: new mobile.bean.MimeType(),
	ipad_landscapeSize: 10,
	ipad_portraitSize: 20,
	pageSize: 50  //minimum pageSize to load from server
};

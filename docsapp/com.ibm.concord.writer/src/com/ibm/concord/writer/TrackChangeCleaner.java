package com.ibm.concord.writer;

import com.ibm.concord.writer.model.ModelObject;
import com.ibm.concord.writer.model.Paragraph;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class TrackChangeCleaner {

	public static void clean(JSONArray container, long timeAgo) {
		if (container == null)
			return;

		Paragraph lastLivePara = null;
		JSONObject lastLiveParaObj = null;

		int size = container.size();
		// bottom-to-up
		for (int i = size - 1; i >= 0; i--) {
			JSONObject obj = (JSONObject) container.get(i);
			ModelObject mo = ModelObject.createModelObject(obj);

			boolean selfDeleted = mo.checkTrackChange(timeAgo);
			if (!selfDeleted) {
				if (mo instanceof Paragraph) {
					Paragraph para = (Paragraph) mo;
					boolean isRPRTrackDeleted = para.isRPRTrackDeleted(timeAgo,
							true);
					if (isRPRTrackDeleted) {
						// we should change this para, and remove last one.
						if (lastLivePara != null) {
							para.merge(lastLivePara);
							container.remove(lastLiveParaObj);
						}
					}
					lastLivePara = para;
					lastLiveParaObj = obj;
				} else {
					lastLivePara = null;
					lastLiveParaObj = null;
				}
			} else {
				container.remove(i);
			}
		}
	}

}

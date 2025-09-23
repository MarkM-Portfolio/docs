package com.ibm.concord.writer.message.impl;

import com.ibm.concord.writer.message.MessageUtil;
import com.ibm.concord.writer.message.Operation;
import com.ibm.concord.writer.model.ModelObject;
import com.ibm.json.java.JSONObject;

public class CheckModel extends Operation{
	
	public CheckModel(JSONObject json){
		this.read(json);
	}

	@Override
	protected void apply(JSONObject model) throws Exception {
		// TODO Auto-generated method stub
		JSONObject target = MessageUtil.getById(model, getTarget());
		if (target==null) return;
		ModelObject targetObj = ModelObject.createModelObject(target);
		if (targetObj == null || !(targetObj instanceof SelfCheckAble)) {
			throwUnSupported(model, targetObj);
		} else {
			((SelfCheckAble)targetObj).checkSelf();
		}
	}

	@Override
	public boolean read(JSONObject update) {
		try{
			setTarget(update.get(TARGET).toString());
			readOp(update);
			return true;
		}catch (Exception e){
			return false;
		}
	}

	@Override
	public JSONObject write() {
		// TODO Auto-generated method stub
		return null;
	}

	public interface SelfCheckAble {
		public void checkSelf();
	}
}

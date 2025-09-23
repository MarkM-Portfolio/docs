package com.ibm.concord.document.common.pres;

import java.util.ArrayList;
import java.util.List;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class Slide extends Model {

	private String wrapperId;
	private List<Element> elements;
	private TaskContainer taskContainer;
	private float w, h;

	public String getHTML() {
		String page = this.gartherAttrs(null);
		if (this.elements != null)
			for (Element ele : elements) {
				String div = ele.getHTML();
				page += div;
			}
		page += "</div>";
		String task = null;
		if(taskContainer != null)
		  task = taskContainer.getHTML();
		return "<div class='slideWrapper' id='" + this.wrapperId + "'>" + page + task
				+ "</div>";
	}

	public static Slide fromJson(JSONObject obj) {
		Slide slide = new Slide();

		slide.id = obj.get("id").toString();
		slide.wrapperId = obj.get("wrapperId").toString();
		slide.w = Float.parseFloat(obj.get("w").toString());
		slide.h = Float.parseFloat(obj.get("h").toString());

		slide.elements = new ArrayList<Element>();

		if (obj.containsKey("attrs")) {
			slide.attrs = (JSONObject) obj.get("attrs");
		}
		
	    if (obj.containsKey("taskContainer")) {
	        JSONObject tObj = (JSONObject) obj.get("taskContainer");
	        TaskContainer tc = TaskContainer.fromJson(tObj);
	        slide.taskContainer = tc;
        }

		if (obj.containsKey("elements")) {
			JSONArray arr = (JSONArray) obj.get("elements");
			for (int i = 0; i < arr.size(); i++) {
				JSONObject ele = (JSONObject) arr.get(i);
				Element element = Element.fromJson(ele);
				slide.elements.add(element);
			}

		}

		return slide;
	}

	public TaskContainer getTaskContainer()
    {
      return taskContainer;
    }
  
    public void setTaskContainer(TaskContainer taskContainer)
    {
      this.taskContainer = taskContainer;
    }

    public String getWrapperId() {
		return wrapperId;
	}

	public void setWrapperId(String wrapperId) {
		this.wrapperId = wrapperId;
	}

	public List<Element> getElements() {
		return elements;
	}

	public void setElements(List<Element> elements) {
		this.elements = elements;
	}

	public float getW() {
		return w;
	}

	public void setW(float w) {
		this.w = w;
	}

	public float getH() {
		return h;
	}

	public void setH(float h) {
		this.h = h;
	}

}

package com.ibm.docs.api.rest.sample.handlers;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public interface PostHandler
{
  void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception;
}

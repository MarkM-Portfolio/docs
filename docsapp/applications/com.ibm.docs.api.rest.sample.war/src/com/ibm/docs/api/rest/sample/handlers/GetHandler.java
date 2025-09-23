package com.ibm.docs.api.rest.sample.handlers;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public interface GetHandler
{
  void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception;
}

#include "StdAfx.h"
#include "GlobalApp.h"

GlobalApp::GlobalApp(void)
{
	GdiplusStartup(&m_gdiplusToken, &m_gdiplusStartupInput, NULL); 
}

GlobalApp::~GlobalApp(void)
{
	GdiplusShutdown(m_gdiplusToken);
}

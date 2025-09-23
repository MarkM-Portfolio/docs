#pragma once
#include "stdafx.h"

class GlobalApp
{
private:

	GdiplusStartupInput m_gdiplusStartupInput;
	ULONG_PTR m_gdiplusToken;

public:
	GlobalApp(void);
	~GlobalApp(void);
};

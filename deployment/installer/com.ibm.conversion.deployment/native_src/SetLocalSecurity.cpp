/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

// SetLocalSecurity.cpp : Defines the entry point for the console application.

#include "stdafx.h"

#ifndef UNICODE
#define UNICODE
#endif

#include <stdio.h>
#include <windows.h>
#include <ntsecapi.h>

#define RTN_OK 0
#define RTN_USAGE 1
#define RTN_ERROR 13

#ifndef STATUS_SUCCESS
#define STATUS_SUCCESS  ((NTSTATUS)0x00000000L)
#endif

void InitLsaString(PLSA_UNICODE_STRING LsaString, LPWSTR String)
{
    DWORD StringLength;

    if (String == NULL)
    {
        LsaString->Buffer = NULL;
        LsaString->Length = 0;
        LsaString->MaximumLength = 0;
        return;
    }

    StringLength = wcslen(String);
    LsaString->Buffer = String;
    LsaString->Length = (USHORT) StringLength * sizeof(WCHAR);
    LsaString->MaximumLength = (USHORT)(StringLength+1) * sizeof(WCHAR);
}

NTSTATUS OpenPolicy(LPWSTR ServerName, DWORD DesiredAccess, PLSA_HANDLE PolicyHandle)
{
    LSA_OBJECT_ATTRIBUTES ObjectAttributes;
    LSA_UNICODE_STRING ServerString;
    PLSA_UNICODE_STRING Server = NULL;

    // Always initialize the object attributes to all zeroes.
    ZeroMemory(&ObjectAttributes, sizeof(ObjectAttributes));

    if (ServerName != NULL)
    {
        // Make a LSA_UNICODE_STRING out of the LPWSTR passed in.
        InitLsaString(&ServerString, ServerName);
        Server = &ServerString;
    }

    // Attempt to open the policy.
    return LsaOpenPolicy(Server, &ObjectAttributes, DesiredAccess, PolicyHandle);
}

/*
This function attempts to obtain a SID representing the supplied account on the supplied system.
*/
BOOL GetAccountSid(LPTSTR SystemName, LPTSTR AccountName, PSID *Sid)
{
    LPTSTR ReferencedDomain=NULL;
    DWORD cbSid=128;    // initial allocation attempt
    DWORD cchReferencedDomain=16; // initial allocation size
    SID_NAME_USE peUse;
    BOOL bSuccess=FALSE; // assume this function will fail

    __try
    {
        // Initial memory allocations.
        if ((*Sid = HeapAlloc(GetProcessHeap(), 0, cbSid)) == NULL) __leave;

        if ((ReferencedDomain = (LPTSTR)HeapAlloc( GetProcessHeap(), 0, cchReferencedDomain * sizeof(TCHAR))) == NULL) __leave;

        // Obtain the SID of the specified account on the specified system.
        while(!LookupAccountName(
            SystemName,         // machine to lookup account on
            AccountName,        // account to lookup
            *Sid,                        // SID of interest
            &cbSid,                  // size of SID
            ReferencedDomain,   // domain account was found on
            &cchReferencedDomain,
            &peUse
            ))
        {
            if (GetLastError() == ERROR_INSUFFICIENT_BUFFER)
            {
                // Reallocate memory
                if ((*Sid = HeapReAlloc(GetProcessHeap(), 0, *Sid, cbSid)) == NULL) __leave;

                if ((ReferencedDomain = (LPTSTR)HeapReAlloc(GetProcessHeap(), 0, ReferencedDomain, cchReferencedDomain * sizeof(TCHAR))) == NULL) __leave;
            }
            else __leave;
        }

        // Indicate success.
        bSuccess=TRUE;
    }
    __finally
    {
        // Cleanup and indicate failure, if appropriate.
        HeapFree(GetProcessHeap(), 0, ReferencedDomain);
        
        if (!bSuccess)
        {
            if (*Sid != NULL)
            {
                HeapFree(GetProcessHeap(), 0, *Sid);
                *Sid = NULL;
            }
        }

    } // finally

    return bSuccess;
}

NTSTATUS SetPrivilegeOnAccount(LSA_HANDLE PolicyHandle, PSID AccountSid, LPWSTR PrivilegeName, BOOL bEnable)
{
    LSA_UNICODE_STRING PrivilegeString;

    // Create a LSA_UNICODE_STRING for the privilege name.
    InitLsaString(&PrivilegeString, PrivilegeName);

    // Grant or revoke the privilege accordingly.
    if (bEnable)
    {
        return LsaAddAccountRights(
            PolicyHandle,       // open policy handle
            AccountSid,         // target SID
            &PrivilegeString,   // privileges
            1                   // privilege count
            );
    }
    else
    {
        return LsaRemoveAccountRights(
            PolicyHandle,       // open policy handle
            AccountSid,         // target SID
            FALSE,              // do not disable all rights
            &PrivilegeString,   // privileges
            1                   // privilege count
            );
    }
}

void ShowUsage()
{
    fprintf(stderr, "Grants/Revokes Rights to a user/group.\nUsage: setrights.exe <Account> <option>\n");
    fprintf(stderr, "The following options are available for the command:\n");
    fprintf(stderr, "\t-r xxx  revokes the xxx right\n");
    fprintf(stderr, "\t+r xxx  grants the xxx right\n");
    fprintf(stderr, "Such as: setrights.exe admin +r SeServiceLogonRight. Grant the SeServiceLogonRight to admin.");
}

int _cdecl main(int argc, _TCHAR* argv[])
{
    LSA_HANDLE PolicyHandle;
    WCHAR wComputerName[256]=L"";   // machine name buffer
    TCHAR AccountName[256];                 // account name buffer
    TCHAR OperationName[256];              // operation name buffer
    TCHAR PrivilegeName[256];                // privilege name buffer
    PSID pSid;
    NTSTATUS Status;
    int iRetVal = RTN_ERROR;          // assume error from main
    BOOL bEnable = TRUE;

    if (argc < 4)
    {
        ShowUsage();
        return RTN_USAGE;
    }

    // Pick up account name on argv[1]. Assumes source is ANSI. Resultant string is ANSI or Unicode
    wsprintf(AccountName, TEXT("%hS"), argv[1]);

    // Pick up operation name on argv[2]. Assumes source is ANSI. Resultant string is ANSI or Unicode
    wsprintf(OperationName, TEXT("%hS"), argv[2]);
    if (wcscmp(OperationName, L"-r") == 0 || wcscmp(OperationName, L"+r") == 0)
    {
        bEnable = (wcscmp(OperationName, L"+r") == 0);
    }
    else
    {
        ShowUsage();
        return RTN_USAGE;
    }

    // Pick up privilege name on argv[3]. Assumes source is ANSI. Resultant string is ANSI or Unicode
    wsprintf(PrivilegeName, TEXT("%hS"), argv[3]);

    // TODO: Only support to set rights on local machine currently.
    //if (argc == 3) wsprintfW(wComputerName, L"%hS", argv[2]);

    // Open the policy on the target machine.
    if ((Status = OpenPolicy(
                wComputerName,      // target machine
                POLICY_ALL_ACCESS, // Access types
                &PolicyHandle       // resultant policy handle
                )) != STATUS_SUCCESS)
    {
        return RTN_ERROR;
    }

    // Obtain the SID of the user/group. Note that we could target a specific machine, but we don't. Specifying NULL for target 
    // machine searches for the SID in the following order: well-known, Built-in and local, primary domain, trusted domains.
    if (GetAccountSid(
            NULL,       // default lookup logic
            AccountName, // account to obtain SID
            &pSid       // buffer to allocate to contain resultant SID
            ))
    {
        // We only grant the privilege if we succeeded in obtaining the SID. We can actually add SIDs which 
        // cannot be looked up, but looking up the SID is a good sanity check which is suitable for most cases.

        // Grant the specified privilege to users represented by pSid.
        if ((Status = SetPrivilegeOnAccount(
                    PolicyHandle,     // Policy handle
                    pSid,                   // SID to grant privilege
                    PrivilegeName,  // Unicode privilege name
                    bEnable             // Enable the privilege
                    )) == STATUS_SUCCESS)
            iRetVal = RTN_OK;

        if (iRetVal == RTN_OK)
        {
            fprintf(stderr, "Changing privilege %s %s for account '%s' successful.", argv[2], argv[3], argv[1]);
        }
        else
        {
            fprintf(stderr, "Changing privilege %s %s for account '%s' failed. Error code is: %d.", argv[2], argv[3], argv[1], GetLastError());
        }
    }
    else
    {
        fprintf(stderr, "Obtaining the SID of account '%s' failed. Error code is: %d.", argv[1], GetLastError());
    }

    // Close the policy handle.
    LsaClose(PolicyHandle);

    // Free memory allocated for pSid.
    if (pSid != NULL) HeapFree(GetProcessHeap(), 0, pSid);

    return iRetVal;
}

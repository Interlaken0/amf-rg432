/*============================================================================*/
/*                                                                            */
/* File:          RG432TestExports.H                                          */
/*                                                                            */
/* Details:       Public exported function declarations for                   */
/*                 RG432Test1.0.dll                                           */
/*                                                                            */
/* Author:        Jeff Evemy                                                  */
/*                                                                            */
/* History:       Created Friday 17 July 2026                                 */
/*                                                                            */
/*============================================================================*/
#ifndef RG432TESTEXPORTS_H
#define RG432TESTEXPORTS_H
#include <stdint.h>

/*==================== Definitions ===========================================*/
#ifndef DLL_EXPORT
#define DLL_EXPORT  __declspec(dllexport)
#endif
#ifndef CALL_TYPE
#define CALL_TYPE  __cdecl
#endif

/*==================== Exported function declarations ========================*/
DLL_EXPORT uint8_t CALL_TYPE InitialiseDevice(char *szSerial, uint8_t *byErrorCode);
DLL_EXPORT uint8_t CALL_TYPE RunTest(uint8_t byType, uint8_t *byErrorCode);
DLL_EXPORT uint8_t CALL_TYPE GetResult(uint16_t *wDetails, char *szResultsFile);

/*============================================================================*/
/*==================== END OF FILE ===========================================*/
/*============================================================================*/
#endif

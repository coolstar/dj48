#include "Macro.h"

class MacroPlayback {
public:
	Macro *currentMacro;

	long startTime;
	int currentMacroActionIndex;
	void startPlayback();
    void startExport();
	void queueAction();
	void callbackReceived();
};

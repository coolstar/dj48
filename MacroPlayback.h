#include "Macro.h"

class MacroPlayback {
public:
	Macro *currentMacro;

	long startTime;
	int currentMacroActionIndex;
	void startPlayback();
	void queueAction();
	void callbackReceived();
};
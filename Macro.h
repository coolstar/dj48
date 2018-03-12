#include <sys/time.h>
#include <vector>
#include "MacroAction.h"

#ifndef __MACRO_H__
#define __MACRO_H__
class Macro {
	bool isRecording;
	long startTime;
	long duration;

public:
	Macro();

	std::vector <MacroAction *> macroActionsList;

	std::string macroName;
	void startRecording();
	void stopRecording();
	void gotButtonClick(std::string selector);
	void gotSliderAction(std::string selector, long sliderValue);
	void gotDropdownAction(std::string selector, std::string dropDownValue);
};
#endif
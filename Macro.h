#include <sys/time.h>
#include <vector>
#include "MacroAction.h"

#ifndef __MACRO_H__
#define __MACRO_H__
class Macro {
	bool isRecording;
    bool isLoading;
	long startTime;
	long duration;

public:
	Macro();

	std::vector <MacroAction *> macroActionsList;

	std::string macroName;
	void startRecording();
	void stopRecording();
    void startLoading();
    void stopLoading();
	void gotButtonClick(std::string selector);
    void addButtonClick(std::string selector, long offset);
	void gotSliderAction(std::string selector, long sliderValue);
    void addSliderAction(std::string selector, long sliderValue, long offset);
	void gotDropdownAction(std::string selector, std::string dropDownValue);
    void addDropdownAction(std::string selector, std::string dropDownValue, long offset);
};
#endif

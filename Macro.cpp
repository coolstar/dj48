#include "Macro.h"
#include <stdio.h>

Macro::Macro(){
	duration = 0;
}

void Macro::startRecording(){
	isRecording = true;
	struct timeval tp;
	gettimeofday(&tp, NULL);
	startTime = tp.tv_sec * 1000 + tp.tv_usec / 1000;
}

void Macro::stopRecording(){
	isRecording = false;

	struct timeval tp;
	gettimeofday(&tp, NULL);
	long stopTime = tp.tv_sec * 1000 + tp.tv_usec / 1000;
	duration = stopTime - startTime;
}

void Macro::gotButtonClick(std::string selector){
	if (!isRecording){
		printf("Not Recording!\n");
		return;
	}

	struct timeval tp;
	gettimeofday(&tp, NULL);
	long nowTime = tp.tv_sec * 1000 + tp.tv_usec / 1000;

	MacroAction *buttonAction = new MacroAction;
	buttonAction->macroTimeOffset = nowTime + duration - startTime;
	printf("Added Macro with offset %ld\n", buttonAction->macroTimeOffset);
	buttonAction->macroSelector = selector;
	buttonAction->macroType = MacroActionTypeClick;
	buttonAction->macroSliderValue = 0;
	buttonAction->macroDropDownValue = "";
	macroActionsList.push_back(buttonAction);
}

void Macro::gotSliderAction(std::string selector, long sliderValue){
	if (!isRecording){
		printf("Not Recording!\n");
		return;
	}

	struct timeval tp;
	gettimeofday(&tp, NULL);
	long nowTime = tp.tv_sec * 1000 + tp.tv_usec / 1000;

	MacroAction *sliderAction = new MacroAction;
	sliderAction->macroTimeOffset = nowTime + duration - startTime;
	printf("Added Macro with offset %ld\n", sliderAction->macroTimeOffset);
	sliderAction->macroSelector = selector;
	sliderAction->macroType = MacroActionTypeSetSliderValue;
	sliderAction->macroSliderValue = sliderValue;
	sliderAction->macroDropDownValue = "";
	macroActionsList.push_back(sliderAction);
}

void Macro::gotDropdownAction(std::string selector, std::string dropDownValue){
	if (!isRecording){
		printf("Not Recording!\n");
		return;
	}

	struct timeval tp;
	gettimeofday(&tp, NULL);
	long nowTime = tp.tv_sec * 1000 + tp.tv_usec / 1000;

	MacroAction *dropDownAction = new MacroAction;
	dropDownAction->macroTimeOffset = nowTime + duration - startTime;
	printf("Added Macro with offset %ld\n", dropDownAction->macroTimeOffset);
	dropDownAction->macroSelector = selector;
	dropDownAction->macroType = MacroActionTypeSetDropDownValue;
	dropDownAction->macroSliderValue = 0;
	dropDownAction->macroDropDownValue = dropDownValue;
	macroActionsList.push_back(dropDownAction);
}
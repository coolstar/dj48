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

void Macro::startLoading(){
    isLoading = true;
}

void Macro::stopLoading(){
    isLoading = false;
}

void Macro::addButtonClick(std::string selector, long offset){
    if (!isLoading){
#if DEBUG
        printf("Not Loading!\n");
#endif
        return;
    }
    
    MacroAction *buttonAction = new MacroAction;
    buttonAction->macroTimeOffset = offset;
#if DEBUG
    printf("Added Macro with offset %ld\n", buttonAction->macroTimeOffset);
#endif
    buttonAction->macroSelector = selector;
    buttonAction->macroType = MacroActionTypeClick;
    buttonAction->macroSliderValue = 0;
    buttonAction->macroDropDownValue = "";
    macroActionsList.push_back(buttonAction);
}

void Macro::gotButtonClick(std::string selector){
	if (!isRecording){
#if DEBUG
		printf("Not Recording!\n");
#endif
		return;
	}

	struct timeval tp;
	gettimeofday(&tp, NULL);
	long nowTime = tp.tv_sec * 1000 + tp.tv_usec / 1000;

	MacroAction *buttonAction = new MacroAction;
	buttonAction->macroTimeOffset = nowTime + duration - startTime;
#if DEBUG
	printf("Added Macro with offset %ld\n", buttonAction->macroTimeOffset);
#endif
	buttonAction->macroSelector = selector;
	buttonAction->macroType = MacroActionTypeClick;
	buttonAction->macroSliderValue = 0;
	buttonAction->macroDropDownValue = "";
	macroActionsList.push_back(buttonAction);
}

void Macro::gotSliderAction(std::string selector, long sliderValue){
	if (!isRecording){
#if DEBUG
		printf("Not Recording!\n");
#endif
		return;
	}

	struct timeval tp;
	gettimeofday(&tp, NULL);
	long nowTime = tp.tv_sec * 1000 + tp.tv_usec / 1000;

	MacroAction *sliderAction = new MacroAction;
	sliderAction->macroTimeOffset = nowTime + duration - startTime;
#if DEBUG
	printf("Added Macro with offset %ld\n", sliderAction->macroTimeOffset);
#endif
	sliderAction->macroSelector = selector;
	sliderAction->macroType = MacroActionTypeSetSliderValue;
	sliderAction->macroSliderValue = sliderValue;
	sliderAction->macroDropDownValue = "";
	macroActionsList.push_back(sliderAction);
}

void Macro::addSliderAction(std::string selector, long sliderValue, long offset){
    if (!isLoading){
#if DEBUG
        printf("Not Loading!\n");
#endif
        return;
    }
    
    MacroAction *sliderAction = new MacroAction;
    sliderAction->macroTimeOffset = offset;
#if DEBUG
    printf("Added Macro with offset %ld\n", offset);
#endif
    sliderAction->macroSelector = selector;
    sliderAction->macroType = MacroActionTypeSetSliderValue;
    sliderAction->macroSliderValue = sliderValue;
    sliderAction->macroDropDownValue = "";
    macroActionsList.push_back(sliderAction);
}

void Macro::gotDropdownAction(std::string selector, std::string dropDownValue){
	if (!isRecording){
#if DEBUG
		printf("Not Recording!\n");
#endif
		return;
	}

	struct timeval tp;
	gettimeofday(&tp, NULL);
	long nowTime = tp.tv_sec * 1000 + tp.tv_usec / 1000;

	MacroAction *dropDownAction = new MacroAction;
	dropDownAction->macroTimeOffset = nowTime + duration - startTime;
#if DEBUG
	printf("Added Macro with offset %ld\n", dropDownAction->macroTimeOffset);
#endif
	dropDownAction->macroSelector = selector;
	dropDownAction->macroType = MacroActionTypeSetDropDownValue;
	dropDownAction->macroSliderValue = 0;
	dropDownAction->macroDropDownValue = dropDownValue;
	macroActionsList.push_back(dropDownAction);
}

void Macro::addDropdownAction(std::string selector, std::string dropDownValue, long offset){
    if (!isLoading){
#if DEBUG
        printf("Not Loading!\n");
#endif
        return;
    }
    
    MacroAction *dropDownAction = new MacroAction;
    dropDownAction->macroTimeOffset = offset;
#if DEBUG
    printf("Added Macro with offset %ld\n", dropDownAction->macroTimeOffset);
#endif
    dropDownAction->macroSelector = selector;
    dropDownAction->macroType = MacroActionTypeSetDropDownValue;
    dropDownAction->macroSliderValue = 0;
    dropDownAction->macroDropDownValue = dropDownValue;
    macroActionsList.push_back(dropDownAction);
}

#include "Macros.h"

Macros::Macros(){
	printf("Hello from C++!\n");
}

void Macros::recordNewMacro(std::string macroName){
	Macro *macro = new Macro;
	macro->macroName = macroName;
	macro->startRecording();
	currentMacro = macro;
	macroList.push_back(macro);
}

void Macros::stopCurrentRecording(){
	if (!currentMacro){
		printf("No current Macro!\n");
		return;
	}
	currentMacro->stopRecording();
	currentMacro = NULL;
}

void Macros::playMacro(std::string macroName){
	for (int i = 0; i < macroList.size(); i++){
		Macro *macro = macroList[i];
		if (macro->macroName == macroName){
			macroPlayer.currentMacro = macro;
			macroPlayer.startPlayback();
			return;
		}
	}
	printf("Unable to find macro %s!\n", macroName.c_str());
}

void Macros::gotButtonClick(std::string selector){
	if (!currentMacro){
		printf("No current Macro!\n");
		return;
	}
	currentMacro->gotButtonClick(selector);
}

void Macros::gotSliderAction(std::string selector, long sliderValue){
	if (!currentMacro){
		printf("No current Macro!\n");
		return;
	}
	currentMacro->gotSliderAction(selector, sliderValue);
}

void Macros::gotDropdownAction(std::string selector, std::string dropDownValue){
	if (!currentMacro){
		printf("No current Macro!\n");
		return;
	}
	currentMacro->gotDropdownAction(selector, dropDownValue);
}
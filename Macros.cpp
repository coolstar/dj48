#include "Macros.h"
#include <emscripten/emscripten.h>

Macros::Macros(){
#if DEBUG
	printf("Hello from C++!\n");
#endif
}

void Macros::recordNewMacro(std::string macroName){
	Macro *macro = new Macro;
	macro->macroName = macroName;
	macro->startRecording();
	currentMacro = macro;
	macroList.push_back(macro);
    emscripten_run_script("resetSliders();");
}

void Macros::createNewMacro(std::string macroName){
    Macro *macro = new Macro;
    macro->macroName = macroName;
    macro->startLoading();
    currentLoadingMacro = macro;
    macroList.push_back(macro);
}

void Macros::stopCurrentLoading(){
    if (!currentLoadingMacro){
#if DEBUG
        printf("No current Macro!\n");
#endif
        return;
    }
    currentLoadingMacro->stopLoading();
    currentLoadingMacro = NULL;
}

void Macros::stopCurrentRecording(){
	if (!currentMacro){
#if DEBUG
		printf("No current Macro!\n");
#endif
		return;
	}
	currentMacro->stopRecording();
	currentMacro = NULL;
}

void Macros::playMacro(std::string macroName){
	for (int i = 0; i < macroList.size(); i++){
		Macro *macro = macroList[i];
		if (macro->macroName == macroName){
            emscripten_run_script("resetSliders();");
            
			macroPlayer.currentMacro = macro;
			macroPlayer.startPlayback();
			return;
		}
	}
#if DEBUG
	printf("Unable to find macro %s!\n", macroName.c_str());
#endif
}

void Macros::exportMacro(std::string macroName){
    for (int i = 0; i < macroList.size(); i++){
        Macro *macro = macroList[i];
        if (macro->macroName == macroName){
            macroPlayer.currentMacro = macro;
            macroPlayer.startExport();
            return;
        }
    }
#if DEBUG
    printf("Unable to find macro %s!\n", macroName.c_str());
#endif
}

void Macros::gotButtonClick(std::string selector){
	if (!currentMacro){
#if DEBUG
		printf("No current Macro!\n");
#endif
		return;
	}
	currentMacro->gotButtonClick(selector);
}

void Macros::addButtonClick(std::string selector, long offset){
    if (!currentLoadingMacro){
#if DEBUG
        printf("No current Macro!\n");
#endif
        return;
    }
    currentLoadingMacro->addButtonClick(selector, offset);
}

void Macros::gotSliderAction(std::string selector, long sliderValue){
	if (!currentMacro){
#if DEBUG
		printf("No current Macro!\n");
#endif
		return;
	}
	currentMacro->gotSliderAction(selector, sliderValue);
}

void Macros::addSliderAction(std::string selector, long sliderValue, long offset){
    if (!currentLoadingMacro){
#if DEBUG
        printf("No current Macro!\n");
#endif
        return;
    }
    currentLoadingMacro->addSliderAction(selector, sliderValue, offset);
}

void Macros::gotDropdownAction(std::string selector, std::string dropDownValue){
	if (!currentMacro){
#if DEBUG
		printf("No current Macro!\n");
#endif
		return;
	}
	currentMacro->gotDropdownAction(selector, dropDownValue);
}

void Macros::addDropdownAction(std::string selector, std::string dropDownValue, long offset){
    if (!currentLoadingMacro){
#if DEBUG
        printf("No current Macro!\n");
#endif
        return;
    }
    currentLoadingMacro->addDropdownAction(selector, dropDownValue, offset);
}

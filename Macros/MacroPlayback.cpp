#include <sys/time.h>
#include <string>
#include <stdlib.h>
#include "MacroPlayback.h"
#include <emscripten/emscripten.h>

void MacroPlayback::startPlayback(){
	struct timeval tp;
	gettimeofday(&tp, NULL);
	startTime = tp.tv_sec * 1000 + tp.tv_usec / 1000;
    
	currentMacroActionIndex = 0;
    
	if (currentMacro->macroActionsList.size() > 0)
		this->queueAction();
}

void MacroPlayback::startExport(){
    printf("macros.createNewMacro('testExport');\n");
    for (int i = 0; i < currentMacro->macroActionsList.size(); i++){
        MacroAction *currentAction = currentMacro->macroActionsList[i];
        if (currentAction->macroType == MacroActionTypeClick){
            printf("macros.addButtonClick('%s',%ld);\n",currentAction->macroSelector.c_str(), currentAction->macroTimeOffset);
        }
        if (currentAction->macroType == MacroActionTypeSetSliderValue){
            printf("macros.addSliderAction('%s',%ld,%ld);\n",currentAction->macroSelector.c_str(), currentAction->macroSliderValue, currentAction->macroTimeOffset);
        }
        if (currentAction->macroType == MacroActionTypeSetDropDownValue){
            printf("macros.gotDropdownAction('%s','%s',%ld);\n",currentAction->macroSelector.c_str(), currentAction->macroDropDownValue.c_str(), currentAction->macroTimeOffset);
        }
    }
    printf("macros.stopCurrentLoading();\n");
}

void MacroPlayback::queueAction(){
#if DEBUG
	printf("Queuing Action!\n");
#endif

	struct timeval tp;
	gettimeofday(&tp, NULL);
	long timeNow = tp.tv_sec * 1000 + tp.tv_usec / 1000;
	long offset = timeNow - startTime;

	MacroAction *currentAction = currentMacro->macroActionsList[currentMacroActionIndex];
	long diff = currentAction->macroTimeOffset - offset;
#if DEBUG
	printf("Queue for %ld milliseconds\n", diff);
#endif

	emscripten_sleep(diff);
	this->callbackReceived();
}

void MacroPlayback::callbackReceived(){
#if DEBUG
	printf("Callback Received for action %d!\n", currentMacroActionIndex);
#endif
    
	MacroAction *currentAction = currentMacro->macroActionsList[currentMacroActionIndex];
#if DEBUG
	printf("Selector: %s; Type: %d\n", currentAction->macroSelector.c_str(), currentAction->macroType);
#endif

	if (currentAction->macroType == MacroActionTypeClick){
        std::string buttonJavascript = "$('";
        buttonJavascript += currentAction->macroSelector;
        buttonJavascript += "')[0].click();";
        
#if DEBUG
        printf("Running: %s\n", buttonJavascript.c_str());
#endif
		emscripten_run_script(buttonJavascript.c_str());
	}
	if (currentAction->macroType == MacroActionTypeSetSliderValue){
        std::string sliderJavascript = "updateSlider=false;";
        sliderJavascript += "$('";
        sliderJavascript += currentAction->macroSelector;
        sliderJavascript += "')[0].noUiSlider.set(";
        
        int digits = currentAction->macroSliderValue / 10;
        digits += 1;
        char *rawValue = (char *)malloc(digits * sizeof(char));
        bzero(rawValue, digits * sizeof(char));
        sprintf(rawValue, "%ld", currentAction->macroSliderValue);
        sliderJavascript += rawValue;
        
        free(rawValue);
        
        sliderJavascript += "/100.0);";
        sliderJavascript += "updateSlider=true;";
#if DEBUG
        printf("Running: %s\n", sliderJavascript.c_str());
#endif
		emscripten_run_script(sliderJavascript.c_str());
	}
	if (currentAction->macroType == MacroActionTypeSetDropDownValue){
        std::string dropdownJavascript = "$('";
        dropdownJavascript += currentAction->macroSelector;
        dropdownJavascript += "')[0].value='";
        dropdownJavascript += currentAction->macroDropDownValue;
        dropdownJavascript += "';";
#if DEBUG
        printf("Running: %s\n", dropdownJavascript.c_str());
#endif
		emscripten_run_script(dropdownJavascript.c_str());
	}

	currentMacroActionIndex++;
	if (currentMacro->macroActionsList.size() > currentMacroActionIndex)
		this->queueAction();
}

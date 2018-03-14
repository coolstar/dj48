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

void MacroPlayback::queueAction(){
	printf("Queuing Action!\n");

	struct timeval tp;
	gettimeofday(&tp, NULL);
	long timeNow = tp.tv_sec * 1000 + tp.tv_usec / 1000;
	long offset = timeNow - startTime;

	MacroAction *currentAction = currentMacro->macroActionsList[currentMacroActionIndex];
	long diff = currentAction->macroTimeOffset - offset;
	printf("Queue for %ld milliseconds\n", diff);

	emscripten_sleep(diff);
	this->callbackReceived();
}

void MacroPlayback::callbackReceived(){
	printf("Callback Received for action %d!\n", currentMacroActionIndex);

	MacroAction *currentAction = currentMacro->macroActionsList[currentMacroActionIndex];
	printf("Selector: %s; Type: %d\n", currentAction->macroSelector.c_str(), currentAction->macroType);

	if (currentAction->macroType == MacroActionTypeClick){
        std::string buttonJavascript = "$('";
        buttonJavascript += currentAction->macroSelector;
        buttonJavascript += "')[0].click();";
        
        printf("Running: %s\n", buttonJavascript.c_str());
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
        
        /*std::stringstream sliderJavascriptStream;
        sliderJavascriptStream << "updateSlider=false;";
		sliderJavascriptStream << "$('";
		sliderJavascriptStream << currentAction->macroSelector;
		sliderJavascriptStream << "')[0].noUiSlider.set(";
		sliderJavascriptStream << currentAction->macroSliderValue;
		sliderJavascriptStream << "/100.0);";
        sliderJavascriptStream << "updateSlider=true;";
        std::string sliderJavascript;
        sliderJavascriptStream >> sliderJavascript;*/
        printf("Running: %s\n", sliderJavascript.c_str());
		emscripten_run_script(sliderJavascript.c_str());
	}
	if (currentAction->macroType == MacroActionTypeSetDropDownValue){
        std::string dropdownJavascript = "$('";
        dropdownJavascript += currentAction->macroSelector;
        dropdownJavascript += "')[0].value='";
        dropdownJavascript += currentAction->macroDropDownValue;
        dropdownJavascript += "';";
        printf("Running: %s\n", dropdownJavascript.c_str());
		emscripten_run_script(dropdownJavascript.c_str());
	}

	currentMacroActionIndex++;
	if (currentMacro->macroActionsList.size() > currentMacroActionIndex)
		this->queueAction();
}

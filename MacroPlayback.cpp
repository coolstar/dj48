#include <sys/time.h>
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
		std::string buttonJavascript="document.getElementById('";
		buttonJavascript += currentAction->macroSelector;
		buttonJavascript += "').click();";
		emscripten_run_script(buttonJavascript.c_str());
	}
	if (currentAction->macroType == MacroActionTypeSetSliderValue){
		std::string sliderJavascript="document.getElementById('";
		sliderJavascript += currentAction->macroSelector;
		sliderJavascript += "').noUiSlider.set(";
		sliderJavascript += currentAction->macroSliderValue;
		sliderJavascript += ");";
		emscripten_run_script(sliderJavascript.c_str());
	}
	if (currentAction->macroType == MacroActionTypeSetDropDownValue){
		std::string dropdownJavascript="document.getElementById('";
		dropdownJavascript += currentAction->macroSelector;
		dropdownJavascript += "').value='";
		dropdownJavascript += currentAction->macroDropDownValue;
		dropdownJavascript += "';";
		emscripten_run_script(dropdownJavascript.c_str());
	}

	currentMacroActionIndex++;
	if (currentMacro->macroActionsList.size() > currentMacroActionIndex)
		this->queueAction();
}
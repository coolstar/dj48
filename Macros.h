#include <vector>
#include <string>
#include "Macro.h"
#include "MacroPlayback.h"
#include <emscripten/bind.h>

using namespace emscripten;

#ifndef __MACROS_H__
#define __MACROS_H__
class Macros {
public:
	std::vector <Macro *> macroList;

	Macros();

	MacroPlayback macroPlayer;

	Macro *currentMacro;
	void recordNewMacro(std::string macroName);
	void stopCurrentRecording();
	void playMacro(std::string macroName);

	void gotButtonClick(std::string selector);
	void gotSliderAction(std::string selector, long sliderValue);
	void gotDropdownAction(std::string selector, std::string dropDownValue);
};

EMSCRIPTEN_BINDINGS(Macros) {
    class_<Macros>("Macros")
        .constructor<>()
        .function("recordNewMacro", &Macros::recordNewMacro)
        .function("stopCurrentRecording", &Macros::stopCurrentRecording)
        .function("playMacro", &Macros::playMacro)
        .function("gotButtonClick", &Macros::gotButtonClick)
        .function("gotSliderAction", &Macros::gotSliderAction)
        .function("gotDropdownAction", &Macros::gotDropdownAction)
        //.property("x", &MyClass::getX, &MyClass::setX)
        //.class_function("getStringFromInstance", &MyClass::getStringFromInstance)
        ;
}
#endif

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
    Macro *currentLoadingMacro;
	void recordNewMacro(std::string macroName);
	void stopCurrentRecording();
    void createNewMacro(std::string macroName);
    void stopCurrentLoading();
	void playMacro(std::string macroName);
    void exportMacro(std::string macroName);

	void gotButtonClick(std::string selector);
	void gotSliderAction(std::string selector, long sliderValue);
	void gotDropdownAction(std::string selector, std::string dropDownValue);
    
    void addButtonClick(std::string selector, long offset);
    void addSliderAction(std::string selector, long sliderValue, long offset);
    void addDropdownAction(std::string selector, std::string dropDownValue, long offset);
};

EMSCRIPTEN_BINDINGS(Macros) {
    class_<Macros>("Macros")
        .constructor<>()
        .function("recordNewMacro", &Macros::recordNewMacro)
        .function("stopCurrentRecording", &Macros::stopCurrentRecording)
        .function("createNewMacro", &Macros::createNewMacro)
        .function("stopCurrentLoading", &Macros::stopCurrentLoading)
        .function("playMacro", &Macros::playMacro)
        .function("exportMacro", &Macros::exportMacro)
        .function("gotButtonClick", &Macros::gotButtonClick)
        .function("gotSliderAction", &Macros::gotSliderAction)
        .function("gotDropdownAction", &Macros::gotDropdownAction)
        .function("addButtonClick", &Macros::addButtonClick)
        .function("addSliderAction", &Macros::addSliderAction)
        .function("addDropdownAction", &Macros::addDropdownAction)
        //.property("x", &MyClass::getX, &MyClass::setX)
        //.class_function("getStringFromInstance", &MyClass::getStringFromInstance)
        ;
}
#endif

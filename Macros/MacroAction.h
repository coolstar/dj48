#include <string>

#ifndef __MACROACTION_H__
#define __MACROACTION_H__
enum MacroActionType {
	MacroActionTypeClick,
	MacroActionTypeSetSliderValue,
	MacroActionTypeSetDropDownValue
};

class MacroAction {
public:
	long macroTimeOffset;
	std::string macroSelector;
	MacroActionType macroType;
	long macroSliderValue;
	std::string macroDropDownValue;

    MacroAction();
};
#endif
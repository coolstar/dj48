CC="/Users/coolstar/emscripten/emcc"
CXX="/Users/coolstar/emscripten/em++"
CXXFLAGS="-std=c++14"

all: Macros.js

Macros.js: Macros.o MacroAction.o Macro.o MacroPlayback.o
	$(CXX) Macros.o MacroAction.o Macro.o MacroPlayback.o -o Macros.js --bind -s ASYNCIFY=1 -s EXTRA_EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]'

clean:
	rm -f Macros.o Macro.o MacroPlayback.o Macros.js
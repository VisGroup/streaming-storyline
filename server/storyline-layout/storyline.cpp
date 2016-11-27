#include <iostream>
#include <string>

//#include "StorylineDataSlice.hpp"
//#include "StorylineLayout.hpp"
//#include "StorylineSession.hpp"
//#include "tools.h"

using namespace std;

//StorylineDataSlice parseData(string line) {
//    StorylineDataSlice slice;
//    // <time>TAB<name>,<name>,<name>\t<name>,<name>,<name>\t
//    std::vector<std::string> tokens = split(line, '\t');
//    int time = std::stoi(tokens.front());
//    // TODO
//
//    return slice;
//}

int main() {
//    StorylineLayout * sl = new StorylineLayout();
    string line;
    while (true) {
        getline(cin, line);
        if (line == "#") {
            break;
        }
        // parse
//        StorylineDataSlice result = sl->update(parseData(line));
        cout << "fuck + random" << endl;
//        cout << result.toString() << endl;
    }
    return 0;
}

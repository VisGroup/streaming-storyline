#include <iostream>
#include <string>

#include "StorylineDataSlice.hpp"
#include "StorylineLayout.hpp"
#include "StorylineSession.hpp"
#include "tools.h"

using namespace std;

StorylineDataSlice * parseData(string line) {
    StorylineDataSlice * slice = new StorylineDataSlice();
    // <time>TAB<name>,<name>,<name>\t<name>,<name>,<name>\t
    vector<string> tokens = split(line, '\t');
    vector<string>::iterator it = tokens.begin();
    slice->sliceTime = stoi(*(it ++));
    for (; it != tokens.end(); it ++) {
        vector<string> members = split(*it, ',');
        StorylineSession * session = new StorylineSession();
        for (vector<string>::iterator _iter = members.begin(); _iter != members.end(); _iter ++) {
            session->positions->insert(pair<int, double>(stoi(*_iter), .0));
        }
        slice->sessions->push_back(session);
    }

    return slice;
}

int main() {
    StorylineLayout * sl = new StorylineLayout();
    string line;
    while (true) {
        getline(cin, line);
        if (line == "#") {
            break;
        }
        // parse
        StorylineDataSlice * result = sl->update(parseData(line));
//        cout << "fuck + random" << endl;
        cout << result->toString() << endl;
    }
    return 0;
}

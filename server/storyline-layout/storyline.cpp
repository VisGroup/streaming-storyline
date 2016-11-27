#include <iostream>
#include <string>
#include <sstream>

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
		if (session->positions->size() == 0) continue;
        slice->sessions->push_back(session);
    }

    return slice;
}

int main() {
    StorylineLayout * sl = new StorylineLayout();
    string line("0	4	6,3	1,5	");
	StorylineDataSlice * result = sl->update(parseData(line));
    cout << result->toString() << endl;
//    while (true) {
//        getline(cin, line);
//        if (line == "#") {
//            break;
//        }
//        // parse
//        StorylineDataSlice * result = sl->update(parseData(line));
////        cout << "fuck + random" << endl;
//        cout << result->toString() << endl;
//    }
    return 0;
}

int main1() {
	map<int, double> m;
	m.insert(pair<int, double>(0, 1.2));
	m.insert(pair<int, double>(1, 2.2));
	stringstream res;
	res << "{";
    map<int, double>::iterator it = m.begin();
    for (; it != m.end(); it ++) {
        res << (it->first);
        res << (": ");
        res << (it->second);
        if (it != m.end())
            res << (",");
    }
    res << ("}");
	cout << res.str();
	getchar();
	return 0;
}
#include <sstream>
#include <string>
#include <iostream>
#include "StorylineLayout.hpp"
#include "StorylineDataSlice.hpp"
#include "tools.h"

using namespace std;

void split(const std::string &s, char delim, std::vector<std::string> &elems) {
	std::stringstream ss;
	ss.str(s);
	std::string item;
	while (std::getline(ss, item, delim)) {
		elems.push_back(item);
	}
}


std::vector<std::string> split(const std::string &s, char delim) {
	std::vector<std::string> elems;
	split(s, delim, elems);
	return elems;
}


StorylineDataSlice * parseData(string line) {
	StorylineDataSlice * slice = new StorylineDataSlice();
	// <time>TAB<name>,<name>,<name>\t<name>,<name>,<name>\t
	vector<string> tokens = split(line, '\t');
	vector<string>::iterator it = tokens.begin();
	slice->slicetime = stoi(*(it++));
	for (; it != tokens.end(); it++) {
		vector<string> members = split(*it, ',');
		StorylineSession * session = new StorylineSession();
		for (vector<string>::iterator _iter = members.begin(); _iter != members.end(); _iter++) {
			session->positions.insert(pair<int, double>(stoi(*_iter), .0));
		}
		if (session->positions.size() == 0) continue;
		slice->session.push_back(*session);
	}
	return slice;
}
#ifndef TOOLS_H
#define TOOLS_H

#include <sstream>
#include <string>
#include <iostream>
#include "StorylineLayout.hpp"
#include "StorylineDataSlice.hpp"

using namespace std;

void split(const std::string &s, char delim, std::vector<std::string> &elems);

std::vector<std::string> split(const std::string &s, char delim);

StorylineDataSlice * parseData(string line);

#endif
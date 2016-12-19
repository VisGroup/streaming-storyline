#include <iostream>
#include <fstream>
#include <sstream>
#include <string>

#include "StorylineLayout.hpp"
#include "tools.h"

using namespace std;

int main() {
	ifstream f("data.txt");
	std::string line;
	StorylineLayout * sl = new StorylineLayout();

	while (std::getline(f, line))
	{
		std::istringstream iss(line);
		StorylineDataSlice * slice = parseData(line);
		StorylineDataSlice result = sl->update(*slice);
		cout << result.toString() << endl;
	}

	f.close();
	return 0;
}
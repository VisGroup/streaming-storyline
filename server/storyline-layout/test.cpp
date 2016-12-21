#include <iostream>
#include <fstream>
#include <sstream>
#include <string>

#include "StorylineLayout.hpp"
#include "tools.h"

using namespace std;

int mainas() {
	ifstream f("data.txt");
	std::string line;
	StorylineLayout * sl = new StorylineLayout();
	int time = 0;
	while (std::getline(f, line))
	{
		if(time==0){
			std::istringstream iss(line);
			StorylineDataSlice *preslice = parseData(line);
			sl->preslice = *preslice;
			time++;
		}else{
			std::istringstream iss(line);
			StorylineDataSlice *slice = parseData(line);
			StorylineDataSlice result = sl->update(*slice);
			cout << result.toString() << endl;
			time++;
		}
	}

	f.close();
	system("pause");
	return 0;
}
//
//main.cpp
//Stream_Storyline
//
//Created by 任谦 on 2016/11/28

//this test is for:
//STATUS1:num cross
//STATUS2:simwitn repeat
//STATUS3:insert place is not enough

#include <stdio.h>
#include <map>
#include <algorithm>
#include <functional>
#include <iostream>
#include "StorylineLayout.hpp"
#include "tools.h"

using namespace std;

int main() {
	StorylineLayout * sl = new StorylineLayout();
	/*string line("0	4	6,3	1,5	");
	StorylineDataSlice * result = sl->update(parseData(line));
	cout << result->toString() << endl;*/
	string line;
	int time = 0;
	while (true) {
		getline(cin, line);
		if (line == "#") {
			break;
		}
		// parse
		//StorylineDataSlice result = sl->update(*parseData(line));
		////        cout << "fuck + random" << endl;
		//cout << result.toString() << endl;

		if (time == 0) {
			std::istringstream iss(line);
			StorylineDataSlice *preslice = parseData(line);
			sl->preslice = *preslice;
			cout << preslice->toString() << endl;
		}
		else {
			std::istringstream iss(line);
			StorylineDataSlice *slice = parseData(line);
			//slice->show();
			StorylineDataSlice result = sl->update(*slice);
			cout << result.toString() << endl;
		}
		time++;
	}
	return 0;
}

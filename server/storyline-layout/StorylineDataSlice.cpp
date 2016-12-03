#include "StorylineDataSlice.hpp"
#include <string>
#include <sstream>

using namespace std;

StorylineDataSlice::StorylineDataSlice() {
    this->sessions = new std::vector<StorylineSession*>();
}

string StorylineDataSlice::toString() {
    stringstream result;
	result << ("{time:");
    result << (this->sliceTime);
    result << (",sessions:[");
    for (vector<StorylineSession*>::iterator it = this->sessions->begin(); ;) {
        result << ((*it)->toString());
		it ++;
        if (it != this->sessions->end()) {
            result << (",");
        } else {
			break;
		}
    }
    result << ("]}");
    return result.str();
}
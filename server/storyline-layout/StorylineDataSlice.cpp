#include "StorylineDataSlice.hpp"
#include <string>

using namespace std;

StorylineDataSlice::StorylineDataSlice() {
    this->sessions = new std::vector<StorylineSession*>();
}

std::string StorylineDataSlice::toString() {
    std::string result("{time:");
    result.append(this.sliceTime);
    result.append(",sessions:[");
    for (vector<StorylineDataSlice*>::iterator it = this->sessions->begin(); it != this->sessions->end(); it ++) {
        result.append(it->toString());
        if (it != this->sessions->end()) {
            result.append(",");
        }
    }
    result.append("]}");
    return result;
}
#include "StorylineSession.hpp"
#include <string>
using namespace std;

StorylineSession::StorylineSession() {
    this->positions = new std::map<int, double>();

}

StorylineSession::~StorylineSession() {
}

string StorylineSession::toString() {
    string res("{");
    map<int, float>::iterator it = this->positions->begin();
    for (; it != this.positions->end(); it ++) {
        res.append(it->first);
        res.append(":");
        res.append(it->second);
        if (it != this.positions->end())
            res.append(",");
    }
    res.append("}");
    return string;
}
#include "StorylineSession.hpp"
#include <string>
#include <sstream>
using namespace std;

StorylineSession::StorylineSession() {
    this->positions = new std::map<int, double>();

}

StorylineSession::~StorylineSession() {
}

string StorylineSession::toString() {
    stringstream res;
	res << ("{");
    map<int, double>::iterator it = this->positions->begin();
    for (; ;) {
        res << (it->first);
        res << (": ");
        res << (it->second);
		it ++;
        if (it != this->positions->end())
            res << (",");
		else
			break;
    }
    res << ("}");
    return res.str();
}
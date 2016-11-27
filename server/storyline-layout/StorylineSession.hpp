//
//  StorylineSession.hpp
//  Streaming-Storyline
//
//  Created by 肖剑楠 on 2016/11/20.
//
//

#ifndef StorylineSession_h
#define StorylineSession_h

#include <map>
using namespace std;

class StorylineSession
{
public:
    StorylineSession();
    ~StorylineSession();
    map<int, double> * positions; // entity-name , y-pos
//    std::string identifier;
    string toString();
};

#endif /* StorylineSession_h */

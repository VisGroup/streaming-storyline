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

class StorylineSession
{
public:
    StorylineSession();
    ~StorylineSession();
    std::map<std::string, double> positions;
    std::string identifier;
};


#endif /* StorylineSession_h */

//
//  StorylineDataSlice.hpp
//  Streaming-Storyline
//
//  Created by 肖剑楠 on 2016/11/20.
//
//

#ifndef StorylineDataSlice_hpp
#define StorylineDataSlice_hpp

#include <vector>
#include <string>

#include "StorylineSession.hpp"

class StorylineDataSlice {
public:
    StorylineDataSlice();
    std::vector<StorylineSession*> * sessions;
    int sliceTime;
    std::string toString();
};


#endif /* StorylineDataSlice_hpp */

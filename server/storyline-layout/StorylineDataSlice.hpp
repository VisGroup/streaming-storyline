﻿//
//  StorylineDataSlice.hpp
//  Streaming-Storyline
//
//  Created by derekxiao on 2016/11/20.
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

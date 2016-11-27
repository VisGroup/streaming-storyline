//
//  StorylineLayout.hpp
//  Streaming-Storyline
//
//  Created by 肖剑楠 on 2016/11/20.
//
//

#ifndef StorylineLayout_hpp
#define StorylineLayout_hpp

#include <stdio.h>
#include "StorylineSession.hpp"
#include "StorylineDataSlice.hpp"

class StorylineLayout {
public:
    StorylineLayout();
    ~StorylineLayout();
public:
    StorylineDataSlice * update(StorylineDataSlice * slice);
private:
    void ordering();
    void aligning();
    StorylineDataSlice * compressing();
};

#endif /* StorylineLayout_hpp */

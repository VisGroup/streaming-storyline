//
//  StorylineLayout.hpp
//  Streaming-Storyline
//
//  Created by derekxiao on 2016/11/20.
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
	StorylineDataSlice * prev;
	StorylineDataSlice * curr;
};

#endif /* StorylineLayout_hpp */


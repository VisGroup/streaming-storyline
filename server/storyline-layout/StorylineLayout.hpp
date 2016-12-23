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
	StorylineDataSlice preslice;
	std::vector<StorylineSession> tempsession;
    StorylineLayout();
    ~StorylineLayout();

    StorylineDataSlice update(StorylineDataSlice &slice);
public:             //change to public temporarily.
	void classify(StorylineDataSlice &slice);
    void ordering(StorylineDataSlice &slice);
    void aligning(StorylineDataSlice &slice);
	//StorylineDataSlice compressing();
};

#endif /* StorylineLayout_hpp */

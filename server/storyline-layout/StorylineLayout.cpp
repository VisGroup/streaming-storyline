//
//  StorylineLayout.cpp
//  Streaming-Storyline
//
//  Created by derekxiao on 2016/11/20.
//
//

#include "StorylineLayout.hpp"
#include "StorylineDataSlice.hpp"

StorylineLayout::StorylineLayout() {
    // TODO
}

StorylineLayout::~StorylineLayout() {
    
}

StorylineDataSlice * StorylineLayout::update(StorylineDataSlice * slice) {
	this->curr = slice;
    this->ordering();
    this->aligning();
    return this->compressing();
}

void StorylineLayout::ordering() {
    // TODO
}

void StorylineLayout::aligning() {
    // TODO
}

StorylineDataSlice * StorylineLayout::compressing() {
    // TODO: xiaojiannan
    return this->curr;
}

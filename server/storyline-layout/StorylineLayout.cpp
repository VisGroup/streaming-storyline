//
//  StorylineLayout.cpp
//  Streaming-Storyline
//
//  Created by 肖剑楠 on 2016/11/20.
//
//

#include "StorylineLayout.hpp"

StorylineLayout::StorylineLayout() {
    // TODO
}

StorylineLayout::~StorylineLayout() {
    
}

StorylineDataSlice StorylineLayout::update(StorylineDataSlice slice) {
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

StorylineDataSlice StorylineLayout::compressing() {
    // TODO: xiaojiannan
    return new StorylineDataSlice();
}

//
//  StorylineDataSlice.hpp
//  Streaming-Storyline
//
//  Created by 肖剑楠 on 2016/11/20.
//
//

#ifndef StorylineDataSlice_hpp
#define StorylineDataSlice_hpp

#include<vector>
#include<map>
#include"StorylineSession.hpp"
#include<iostream>
#include<string>

class StorylineDataSlice {
public:
    std::vector<StorylineSession> session;
    int slicetime;
	std::vector<StorylineSession> groupextend;
	std::vector<StorylineSession> groupnew;
	const double MINSPACE = 2;

	std::string toString();
	void show();
	void show(std::vector<StorylineSession> group);
	void clearGhost(std::vector<StorylineSession> &tempsession);
	void cputSimNum(StorylineDataSlice &preslice);
	void cputLCS(std::vector<StorylineSession> &tempsession, StorylineDataSlice &preslice);
	void updateSimwith(std::vector<StorylineSession> &tempsession, std::vector<StorylineSession> &groupnew, int simwith);
	void updateNewGroup(StorylineDataSlice &preslice, StorylineSession &newgroup, int simwith);
	void insertGhost(StorylineDataSlice &preslice, std::vector<StorylineSession> &tempsession, int simwith);
	void insertSession(std::vector<StorylineSession> &tempsession, StorylineSession &newgroup, int simwith);
	int ComputeCross(StorylineSession &tempsimwith, StorylineSession &newgroup, int simwith);
	void groupClassify(StorylineDataSlice &slice, StorylineDataSlice &preslice, std::vector<StorylineSession> &tempsession);
	StorylineDataSlice &operator= (StorylineDataSlice slice);
};

#endif /* StorylineDataSlice_hpp */

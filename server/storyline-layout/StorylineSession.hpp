//
//  StorylineSession.hpp
//  Streaming-Storyline
//
//  Created by 肖剑楠 on 2016/11/20.
//
//
#pragma once
#ifndef StorylineSession_h
#define StorylineSession_h

#include <map>
#include <iostream>
#include <string>

class StorylineSession
{
public:
    //StorylineSession();
    //~StorylineSession();
    std::map<int, double> positions;				// entity-name , y-pos
	int similarity=-1;									//the maximum number of same entities in this session and the sessions in previous slice.
	int unempty=0;
	int matched=0;
	int simwith=-1;
	int simlenghmax = 0;                             //最长公共连续子序列长度
	std::map<int, double>::iterator simlengbeginpre;           //最长公共连续子序列在前一时间的map中的起始位置
	std::map<int, double>::iterator simlengbeginthis;
	const double MINDISTANCE = 1;
	
	std::string toString();
	void show();
	//最长公共连续子序列在此positions中的起始位置
	double thisBeginPos();
	double thisEndPos();
	bool equals(StorylineSession &mapsearch);
	bool mapEquals(std::map<int, double>& map1, std::map<int, double>& map2);
	int simEntiNumInMap(StorylineSession &mapsimilar);
	void LoopLCS(StorylineSession & session1);
	void aligningByLCS(StorylineSession &simwithpre);
	void aligningByTurn(double lastpos,double MINSPACE);
	bool mapFindPair(std::map<int, double>& map, int pairfirst);
	StorylineSession &operator= (StorylineSession sesright);
private:

};

bool operator> (const StorylineSession sesleft, const StorylineSession sesright);
bool operator< (const StorylineSession sesleft, const StorylineSession sesright);
bool operator== (const StorylineSession sesleft, const StorylineSession sesright);
#endif /* StorylineSession_h */

//
//  StorylineLayout.cpp
//  Streaming-Storyline
//
//  Created by 肖剑楠 on 2016/11/20.
//
//

#include "StorylineLayout.hpp"
#include "StorylineDataSlice.hpp"
#include <algorithm>
#include <functional>

StorylineLayout::StorylineLayout() {
    // TODO
}

StorylineLayout::~StorylineLayout() {
    
}

StorylineDataSlice StorylineLayout::update(StorylineDataSlice &slice) {
	this->classify(slice);
    this->ordering(slice);
    //this->aligning(slice);
	slice.session = tempsession;
	//slice.show();
	return slice;
    //return this->compressing();
}

void StorylineLayout::classify(StorylineDataSlice &slice) {
	slice.groupClassify(slice, preslice, tempsession);         //tempsession keep the order same with preslice
}

void StorylineLayout::ordering(StorylineDataSlice &slice) {
	slice.cputSimNum(preslice);
	std::sort(slice.groupnew.begin(), slice.groupnew.end(), std::greater<StorylineSession>());
	//std::cout << "groupnew" << std::endl;
	//slice.show(slice.groupnew);
	for (unsigned int i = 0; i < slice.groupnew.size(); i++) {
    //insert repeat group to the ghost slot followed the similar group directly
		if (slice.groupnew[i].simwith != -1) {
			int simwith = slice.groupnew[i].simwith;
			if (tempsession[simwith].unempty == 0) {
				slice.updateNewGroup(preslice, slice.groupnew[i], simwith);
				tempsession[simwith] = slice.groupnew[i];
				tempsession[simwith].unempty = 1;                              //标记为非空
			} else {
				slice.insertGhost(preslice, tempsession, simwith);				//相似槽对应位置非空，需在两向量中同时插入GhostSlot
			/*	std::cout << "InsertGhost:" << std::endl;
				slice.show(slice.groupnew);
				slice.show(tempsession);
				slice.show(preslice.session);*/
				slice.updateSimwith(tempsession,slice.groupnew, simwith);					//因为插入了GhostSlot因此需要更新相似槽位置
	/*			std::cout << "updateSimwith:" << std::endl;
				slice.show(slice.groupnew);
				slice.show(tempsession);
				slice.show(preslice.session);*/
				slice.updateNewGroup(preslice, slice.groupnew[i], simwith);		//将preslice中与该newgroup相同entity的y-pos赋值给newgroup中entity.
		/*		std::cout << "updateNewGroup:" << std::endl;
				slice.show(slice.groupnew);
				slice.show(tempsession);
				slice.show(preslice.session);*/
				//std::cout << slice.groupnew[i].simwith<< std::endl;
				preslice.insertSession(tempsession, slice.groupnew[i], slice.groupnew[i].simwith);
		/*		std::cout << "inserted:" << std::endl;
				slice.show(slice.groupnew);
				slice.show(tempsession);
				slice.show(preslice.session);*/
			}
		}
		else {
			tempsession.push_back(slice.groupnew[i]);
			tempsession[tempsession.size()-1].unempty = 1;
		}
	}
}

void StorylineLayout::aligning(StorylineDataSlice &slice) {
	slice.clearGhost(tempsession);
	//std::cout << "Tempsessionclear:" << std::endl;
	//slice.show(tempsession);
	//std::cout << "Presliceclear:" << std::endl;
	//slice.show(preslice.session);
	//std::cout << "cputLCS"<<std::endl;
	slice.cputLCS(tempsession, preslice);
}

//StorylineDataSlice StorylineLayout::compressing() {
//    // TODO: xiaojiannan
//    return new StorylineDataSlice();
//}

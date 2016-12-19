

#include "StorylineSession.hpp"
#include "StorylineDataSlice.hpp"
#include "StorylineLayout.hpp"
#include <vector>
#include <string>
#include <sstream>


std::string StorylineDataSlice::toString() {
	std::stringstream result;
	result << ("{time:");
	result << (this->slicetime);
	result << (",sessions:[");
	for (std::vector<StorylineSession>::iterator it = this->session.begin(); ;) {
		result << ((*it).toString());
		it++;
		if (it != this->session.end()) {
			result << (",");
		}
		else {
			break;
		}
	}
	result << ("]}");
	return result.str();
}

void StorylineDataSlice::clearGhost(std::vector<StorylineSession> &tempsession) {			  //clear the empty ghost slots and other empty slots
	for (unsigned int i = 0; i<tempsession.size();)
	{
		if (tempsession[i].unempty == 0) {
			tempsession.erase(tempsession.begin() + i);
		}
		else ++i;
	}
}

void StorylineDataSlice::groupClassify(StorylineDataSlice &slice, StorylineDataSlice &preslice, std::vector<StorylineSession> &tempsession) {
	int maxsize = preslice.session.size() > slice.session.size() ? preslice.session.size() : slice.session.size();
	for (int i = 0; i < maxsize; i++) {
		StorylineSession inisession;
		tempsession.push_back(inisession);
	}
	for (unsigned int j = 0; j < slice.session.size(); j++) {
		for (unsigned int i = 0; i < preslice.session.size(); i++) {
			if (preslice.session[i].equals(slice.session[j])) {
				tempsession[i] = preslice.session[i];
				tempsession[i].unempty = 1;
				tempsession[i].simwith = i;
				tempsession[i].similarity = slice.session[i].positions.size();
				slice.groupextend.push_back(preslice.session[i]);
				break;
			}
			else if (i == preslice.session.size() - 1) {
				slice.groupnew.push_back(slice.session[j]);
			}
		}
	}
}

void StorylineDataSlice::updateNewGroup(StorylineDataSlice &preslice, StorylineSession &newgroup,int simwith) {
	std::map<int, double>::iterator newbegin = newgroup.positions.begin();
	while (newbegin != newgroup.positions.end()) {
		std::map<int, double>::const_iterator prebegin = preslice.session[simwith].positions.begin();
		std::map<int, double>::const_iterator preend = preslice.session[simwith].positions.end();
		while (prebegin != preend) {                        
			if (newbegin->first == prebegin->first) {
				newbegin->second = prebegin->second;
				prebegin++;
				break;
			}
			else
				prebegin++;
		}
		newbegin++;
	}
}

void StorylineDataSlice::cputSimNum(StorylineDataSlice &preslice) {
	std::vector<int> simwithvec;
	for (unsigned int i = 0; i < groupnew.size(); i++) {
		int simcount=0,temp;
		for (unsigned int j = 0; j < preslice.session.size(); j++) {
			temp = groupnew[i].simEntiNumInMap(preslice.session[j]);
			//std::cout << temp << "  " << simcount << std::endl;
			if (temp != 0) {
				if (temp > simcount) {
					if (simcount != 0) {
						simwithvec.pop_back();
						//std::cout << "size  " <<simwithvec.size() << std::endl;
						groupnew[i].simwith = j;
						simcount = temp;
						simwithvec.push_back(j);
						//std::cout << "size  " << simwithvec.size() << std::endl;
					}
					else {
						groupnew[i].simwith = j;
						simcount = temp;
						simwithvec.push_back(j);
						//std::cout << "size  " << simwithvec.size() << std::endl;
					}
				}else {
					if (temp == simcount) {
						std::vector<int>::iterator result = find(simwithvec.begin(), simwithvec.end(), j);
						if (result != simwithvec.end()) {
						}else {
							groupnew[i].simwith = j;
							simcount = temp;
							simwithvec.push_back(j);
							//std::cout << "size  " << simwithvec.size() << std::endl;
						}
					}
				}
			}
		}
		groupnew[i].similarity = simcount;
	}
	//for (int i = 0; i < simwithvec.size(); i++) {
	//	std::cout << simwithvec[i] << std::endl;
	//}
}

void StorylineDataSlice::cputLCS(std::vector<StorylineSession> &tempsession,StorylineDataSlice &preslice) {
	for (unsigned int i = int((tempsession.size() - 1) / 2); i < tempsession.size(); i++) {
		int simwith = tempsession[i].simwith;
		//std::cout << "simwith" << simwith << std::endl;
		if (simwith >= 0) {
			tempsession[i].LoopLCS(preslice.session[simwith]);
			std::map<int, double>::iterator lastpos = tempsession[i - 1].positions.end();
			double thisbeginpos = tempsession[i].thisBeginPos();
			lastpos--;
			if (i == int((tempsession.size() - 1) / 2)) {
				preslice.session[simwith].matched = 1;
				tempsession[i].aligningByLCS(preslice.session[simwith]);
			}
			else if (preslice.session[simwith].matched == 0&&thisbeginpos-MINSPACE>=lastpos->second) {                  
				preslice.session[simwith].matched = 1;  
				tempsession[i].aligningByLCS(preslice.session[simwith]);
			}
			else {
				tempsession[i].aligningByTurn(lastpos->second, MINSPACE);
			}
		}
		else {
			if (i >= 1) {
				int prei = i - 1;
				std::map<int, double>::iterator presessiter = tempsession[prei].positions.end();
				presessiter--;
				std::map<int, double>::iterator thissessiter = tempsession[i].positions.begin();
				thissessiter->second = presessiter->second + MINSPACE;
				thissessiter++;
				while (thissessiter != tempsession[i].positions.end()) {
						(++thissessiter)->second = (--thissessiter)->second + tempsession[i].MINDISTANCE;
						thissessiter++;
				}
			}
		}
	 }
	if (int((tempsession.size() - 1) / 2) != 0) {
		for (int i = int((tempsession.size() - 1) / 2) - 1; i >= 0; i--) {
			int simwith = tempsession[i].simwith;
			//std::cout << "simwith" << simwith << std::endl;
			if (simwith >= 0) {
				tempsession[i].LoopLCS(preslice.session[simwith]);
				std::map<int, double>::iterator nextpos = tempsession[i + 1].positions.begin();
				double thisendpos = tempsession[i].thisEndPos();
				if (preslice.session[simwith].matched == 0 && thisendpos + MINSPACE <= nextpos->second) {
					preslice.session[simwith].matched = 1;
					tempsession[i].aligningByLCS(preslice.session[simwith]);
				}
				else {
					tempsession[i].aligningByTurn(nextpos->second, MINSPACE);
				}
			}
			else {
					int nexti = i + 1;
					std::map<int, double>::iterator nextsessiter = tempsession[nexti].positions.begin();
					std::map<int, double>::iterator thissessiter = tempsession[i].positions.end();
					std::map<int, double>::iterator thisbegin = tempsession[i].positions.begin();

					thissessiter--;
					thissessiter->second = nextsessiter->second - MINSPACE;
					thissessiter--;
					thisbegin--;
					while (thissessiter != thisbegin) {
						(--thissessiter)->second = (++thissessiter)->second - tempsession[i].MINDISTANCE;
						thissessiter--;
					}
				//assign the position of elements in the totally new session
			}
		}
	}
}

void StorylineDataSlice::insertGhost(StorylineDataSlice &preslice, std::vector<StorylineSession> &tempsession, int simwith) {
	StorylineSession inisession1;
	StorylineSession inisession2;
	StorylineSession inisession11;
	StorylineSession inisession22;
	preslice.session.insert(preslice.session.begin()+simwith, inisession1);           //insert before the similar group;
	tempsession.insert(tempsession.begin()+simwith, inisession2); 
	preslice.session.insert(preslice.session.begin() + simwith + 2, inisession11);           //insert behind the similar group;
	tempsession.insert(tempsession.begin() + simwith + 2, inisession22);
}

void StorylineDataSlice::insertSession(std::vector<StorylineSession> &tempsession, StorylineSession &newgroup, int simwith) {
	int up=this->ComputeCross(tempsession[simwith], newgroup, simwith);
	int down = this->ComputeCross(newgroup, tempsession[simwith], simwith);

	if (up > down) {
		int index = newgroup.simwith + 1;
		tempsession[index] = newgroup;
		tempsession[index].unempty = 1;
	}
	else {
		int index = newgroup.simwith - 1;
		tempsession[index] = newgroup;
		tempsession[index].unempty = 1;
	}
}
void StorylineDataSlice::updateSimwith(std::vector<StorylineSession> &tempsession, std::vector<StorylineSession> &groupnew, int simwith) {
	for (unsigned int i = 0; i < groupnew.size(); i++) {
		groupnew[i].simwith = groupnew[i].simwith > simwith ? groupnew[i].simwith + 2 : groupnew[i].simwith;
		groupnew[i].simwith = groupnew[i].simwith == simwith ? groupnew[i].simwith + 1 : groupnew[i].simwith;
	}
	for (unsigned int i = 0; i < tempsession.size(); i++) {
		tempsession[i].simwith = tempsession[i].simwith > simwith ? tempsession[i].simwith + 2 : tempsession[i].simwith;
		tempsession[i].simwith = tempsession[i].simwith == simwith ? tempsession[i].simwith + 1 : tempsession[i].simwith;
	}
}

int StorylineDataSlice::ComputeCross(StorylineSession &tempsimwith, StorylineSession &newgroup, int simwith) {
	int cross = 0;
	int count = 0;
	std::map<int, double>::iterator newbegin = newgroup.positions.begin();
	std::map<int, double>::iterator newend = newgroup.positions.end();
	std::map<int, double>::iterator prebegin = this->session[simwith].positions.begin();
	std::map<int, double>::iterator preend = this->session[simwith].positions.end();
	std::map<int, double>::iterator preforward = prebegin;
	for (; newbegin != newend; ) {
		for (preforward = prebegin; preforward != preend;) {
			if ((preforward->first != newbegin->first)&&newgroup.mapFindPair(tempsimwith.positions,preforward->first)) {
				count++;
			}
			else if (preforward->first == newbegin->first) {
				cross += count;
				count = 0;
				newbegin++;
				break;
			}
			preforward++;
		}
		if (preforward == preend) {
			count = 0;
			newbegin++;
		}
	}
	return cross;
}

void StorylineDataSlice::show() {
	std::cout << "slicetime: " << slicetime << std::endl;
	std::cout << "slice: " << std::endl;
	for (unsigned int i = 0; i < session.size(); i++) {
		std::cout << "   session" << i + ":   " << std::endl;
		session[i].show();
	}
}

void StorylineDataSlice::show(std::vector<StorylineSession> group) {
	for (unsigned int i = 0; i < group.size(); i++) {
		std::cout << "   map" << i <<":   " << std::endl;
		group[i].show();
		std::cout << "        " << "similarity:"<<group[i].similarity<< std::endl; 
		std::cout << "        " << "simwith:" << group[i].simwith << std::endl;
		std::cout << "        " << "unempty:" << group[i].unempty << std::endl;
		std::cout << "        " << "matched:" << group[i].matched << std::endl;
		std::cout << "        " << "simlenghmax:" << group[i].simlenghmax << std::endl;
		//std::cout << "        " << "simlengbeginpre:" << group[i].simlengbeginpre->first << std::endl;
		//std::cout << "        " << "simlengbeginthis:" << group[i].simlengbeginthis->first << std::endl;
	}
}

StorylineDataSlice &StorylineDataSlice::operator= (StorylineDataSlice slice) {
	this->groupextend = slice.groupextend;
	this->groupnew = slice.groupnew;
	this->slicetime = slice.slicetime;
	this->session = slice.session;
	return *this;
}


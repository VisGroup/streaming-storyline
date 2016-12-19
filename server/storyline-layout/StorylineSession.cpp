#include "StorylineSession.hpp"
#include "StorylineDataSlice.hpp"
#include "StorylineLayout.hpp"
#include <string>
#include <sstream>


std::string StorylineSession::toString() {
	std::stringstream res;
	res << ("{");
	std::map<int, double>::iterator it = this->positions.begin();
	for (; ;) {
		res << (it->first);
		res << (": ");
		res << (it->second);
		it++;
		if (it != this->positions.end())
			res << (",");
		else
			break;
	}
	res << ("}");
	return res.str();
}

bool StorylineSession::equals(StorylineSession &mapsearch) {
	if (this->mapEquals(this->positions , mapsearch.positions))
		return true;
	else
		return false;
}

bool StorylineSession::mapEquals(std::map<int, double>& map1, std::map<int, double>& map2) {
	if (map1.size() == map2.size()) {
		std::map<int, double>::const_iterator map1begin = map1.begin();
		std::map<int, double>::const_iterator map2begin = map2.begin();
		while (map1begin != map1.end()) {
			if (map1begin->first == map2begin->first);
			else
				return false;
			map1begin++;
			map2begin++;
		}
		return true;
	}
	else
		return false;
}

bool StorylineSession::mapFindPair(std::map<int, double>& map, int pairfirst) {
	std::map<int, double>::iterator mapbegin = map.begin();
	std::map<int, double>::iterator mapend = map.end();
	while (mapbegin != mapend) {
		if (mapbegin->first == pairfirst) {
			return true;
		}
		mapbegin++;
	}
	return false;
}

int StorylineSession::simEntiNumInMap(StorylineSession &mapsimilar) {               //how many entities both in mapsimilar and positions
	int count = 0;
	std::map<int, double>::const_iterator simbegin = mapsimilar.positions.begin();
	while (simbegin != mapsimilar.positions.end()) {
		std::map<int, double>::const_iterator posbegin = this->positions.begin();
		while (posbegin != positions.end()) {
			if (simbegin->first == posbegin->first) {
				count++;
				break;
			}
			else
				posbegin++;
		}
		simbegin++;
	}
	return count;
}

int FindLongestSubString(std::map<int, double> map1, std::map<int, double> map2, int posi, int posj) {
	std::map<int, double>::const_iterator map1begin = map1.begin();
	std::map<int, double>::const_iterator map2begin = map2.begin();
	for (int i = 0; i < posi; i++) map1begin++;
	for (int j = 0; j < posj; j++) map2begin++;
	int count = 0;
	while (map1begin != map1.end() && map2begin != map2.end()) {
		if (map1begin->first == map2begin->first) {
			count++;
			map1begin++;
			map2begin++;
		}
		else
			break;
	}
	return count;
}
//得仔细斟酌
void StorylineSession::LoopLCS(StorylineSession &session1){
	int simlenghmax = 0;
	for (unsigned int i = 0; i < this->positions.size(); i++)
	{
		for (unsigned int j = 0; j < session1.positions.size(); j++)
		{
			int sublongmap = FindLongestSubString(this->positions, session1.positions,i,j);
			if (sublongmap > simlenghmax) {
				simlenghmax = sublongmap;
				std::map<int, double>::iterator map1begin = this->positions.begin();
				std::map<int, double>::iterator map2begin = session1.positions.begin();
				for (unsigned int subi = 0; subi < i; subi++) map1begin++;
				for (unsigned int subj = 0; subj < j; subj++) map2begin++;
				simlengbeginthis = map1begin;
				simlengbeginpre = map2begin;
				this->simlenghmax = simlenghmax;                      //change the max length of continous subsequence
			}
		}
	}
}

void StorylineSession::aligningByLCS(StorylineSession &simwithpre) {
	std::map<int, double>::const_iterator thisbegin = this->positions.begin();
	std::map<int, double>::iterator thisend = this->positions.end();
	std::map<int, double>::iterator forwarditer = this->positions.begin();
	std::map<int, double>::iterator backiter = this->simlengbeginthis;
	std::map<int, double>::const_iterator preforwarditer = this->simlengbeginpre;
	while (forwarditer != thisend) {
		if (forwarditer->first == this->simlengbeginpre->first) {
			int aligncount = 0;
			while (aligncount < this->simlenghmax) {
				forwarditer->second = preforwarditer->second;
				aligncount++;
				forwarditer++;
				preforwarditer++;
			}
			if (forwarditer != thisend) {
				(++forwarditer)->second = (--forwarditer)->second + MINDISTANCE;
				forwarditer++;
			}		
		}else 
			forwarditer++;
	}
	//std::cout << "thisbegin" << thisbegin->first << std::endl;
	thisbegin--;							//thisbegin has changed
	//std::cout << "backiter" << backiter->first << std::endl;
	backiter--;
	while (backiter != thisbegin) {
		 (--backiter)->second = (++backiter)->second - MINDISTANCE;
		backiter--;
	}
}

void StorylineSession::aligningByTurn(double lastpos, double MINSPACE ) {
	std::map<int, double>::const_iterator thisbegin = this->positions.begin();
	std::map<int, double>::iterator thisend = this->positions.end();
	std::map<int, double>::iterator forwarditer = this->positions.begin();
	while (forwarditer != thisend) {
		if (forwarditer == thisbegin) {
			forwarditer->second = lastpos + MINSPACE;
			forwarditer++;
		}
		else {
			(++forwarditer)->second = (--forwarditer)->second + MINDISTANCE;
			forwarditer++;
		}
	}
}

double StorylineSession::thisBeginPos() {                      //return the position when session is inserted here
	double distance = 0;
	std::map<int, double>::const_iterator thisbegin = this->positions.begin();
	std::map<int, double>::iterator backiter = this->simlengbeginthis;
	while (backiter != thisbegin) {
		distance++;
		backiter--;
	}
	return this->simlengbeginthis->second - distance*MINDISTANCE;
}

double StorylineSession::thisEndPos() {                      //return the position when session is inserted here
	double distance = 0;
	std::map<int, double>::const_iterator thisend = this->positions.end();
	thisend--;
	std::map<int, double>::iterator forwarditer = this->simlengbeginthis;
	while (forwarditer != thisend) {
		distance++;
		forwarditer++;
	}
	return this->simlengbeginthis->second + distance*MINDISTANCE;
}

bool operator> (const StorylineSession sesleft, const StorylineSession sesright) {
	return sesleft.similarity > sesright.similarity;
}

bool operator< (const StorylineSession sesleft, const StorylineSession sesright) {
	return sesleft.similarity < sesright.similarity;
}

bool operator== (const StorylineSession sesleft, const StorylineSession sesright) {
	return sesleft.similarity == sesright.similarity;
}


StorylineSession &StorylineSession::operator= (StorylineSession sesright) {
	this->positions = sesright.positions;
	this->similarity = sesright.similarity;
	this->unempty = sesright.unempty;
	this->matched = sesright.matched;
	this->simwith = sesright.simwith;
	this->simlenghmax = sesright.simlenghmax;
	return *this;
}

void StorylineSession::show() {
	std::map<int, double>::const_iterator mapbegin = positions.begin();
	std::map<int, double>::const_iterator mapend = positions.end();
	while (mapbegin != mapend) {
		std::cout << "        " << mapbegin->second << "  " << mapbegin->first << std::endl;
		mapbegin++;
	}
}
g++ -c StorylineSession.cpp
g++ -c StorylineDataSlice.cpp
g++ -c StorylineLayout.cpp
g++ -c tools.cpp
g++ -o gintama main.cpp StorylineSession.o StorylineDataSlice.o StorylineLayout.o tools.o
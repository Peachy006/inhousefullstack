package com.github.peachy006.inhousebackend.brackets;


import com.github.peachy006.inhousebackend.bracket.Bracket;
import com.github.peachy006.inhousebackend.user.User;

import java.util.*;

public class BracketGenerator{

    public List<Bracket> generateBrackets(List<User> users) {
        List<User> sorted = new ArrayList<>(users);
        Collections.sort(sorted);
        users = sorted;

        int totalUsers = users.size();

        List<Integer> brackets = getBracketSizes(totalUsers);

        List<Bracket> bracketsList = new ArrayList<>();

        int userIndex = 0;

        for(int size: brackets) {
            Bracket bracket = new Bracket();
            bracket.setUsers(new HashSet<>(users.subList(userIndex, userIndex + size)));

            bracketsList.add(bracket);

            userIndex += size;
        }
        return bracketsList;
    }



    public List<User> sortUsers(Set<User> users) {
        int n = users.size();
        User[] sortedUsers = new User[n];
        int count = 0;
        for(User u : users) {
            sortedUsers[count++] = u;
        }
        Arrays.sort(sortedUsers);
        return new ArrayList<>(Arrays.asList(sortedUsers));
    }

    public List<Integer> getBracketSizes(int userCount) {
        List<Integer> sizes = new ArrayList<>();

        while (userCount > 0) {
            if (userCount >= 4 && userCount <= 6) {
                sizes.add(userCount);
                userCount = 0;
                break;
            }

            int after5 = userCount - 5;
            if (after5 >= 8 || after5 == 4 || after5 == 5 || after5 == 6 || after5 == 0) {
                sizes.add(5);
                userCount -= 5;
            }
            else if (userCount - 6 >= 8 || userCount - 6 == 4 || userCount - 6 == 5 || userCount - 6 == 6 || userCount - 6 == 0) {
                sizes.add(6);
                userCount -= 6;
            }
            else if (userCount >= 4) {
                sizes.add(4);
                userCount -= 4;
            }
            else {
                sizes.add(userCount);
                userCount = 0;
            }
        }
        return sizes;
    }

}
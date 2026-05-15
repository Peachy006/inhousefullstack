package com.github.peachy006.inhousebackend.brackets;


import com.github.peachy006.inhousebackend.bracket.Bracket;
import com.github.peachy006.inhousebackend.user.User;

import java.util.*;

public class BracketGenerator{

    public List<Bracket> generateBrackets(List<User> users) {
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
                break;
            }

            int remainder = userCount - 5;

            if (remainder == 0 || remainder >= 4 && remainder != 7) {
                sizes.add(5);
                userCount -= 5;
            } else {
                sizes.add(6);
                userCount -= 6;
            }
        }

        return sizes;
    }

}
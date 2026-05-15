package com.github.peachy006.inhousebackend.user;

import java.util.HashSet;
import java.util.Set;

public class TestDataFactory {

    public TestDataFactory() {
    }

    public static Set<User> getTestUsers() {
        Set<User> users = new HashSet<>();

        users.add(new User("Iron",       135.5, 18, true));
        users.add(new User("Iron",       142.0, 22, false));
        users.add(new User("Bronze",     158.3, 25, true));
        users.add(new User("Bronze",     120.7, 19, false));
        users.add(new User("Bronze",     175.1, 30, true));
        users.add(new User("Silver",     160.0, 21, false));
        users.add(new User("Silver",     148.9, 27, true));
        users.add(new User("Silver",     133.4, 20, false));
        users.add(new User("Gold",       185.2, 24, true));
        users.add(new User("Gold",       140.6, 23, false));
        users.add(new User("Gold",       170.0, 28, true));
        users.add(new User("Platinum",   155.8, 26, false));
        users.add(new User("Platinum",   190.3, 31, true));
        users.add(new User("Platinum",   125.0, 17, false));
        users.add(new User("Diamond",    168.7, 29, true));
        users.add(new User("Diamond",    145.2, 22, false));
        users.add(new User("Diamond",    178.4, 33, true));
        users.add(new User("Master",     162.1, 35, false));
        users.add(new User("Master",     195.0, 28, true));
        users.add(new User("Master",     138.5, 24, false));
        users.add(new User("Grandmaster",180.9, 32, true));
        users.add(new User("Challenger", 172.3, 26, false));

        return users;
    }
}

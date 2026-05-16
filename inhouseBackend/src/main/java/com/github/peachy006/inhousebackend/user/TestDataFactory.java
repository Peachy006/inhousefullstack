package com.github.peachy006.inhousebackend.user;

import java.util.HashSet;
import java.util.Set;

public class TestDataFactory {

    public TestDataFactory() {
    }

    public static Set<User> getTestUsers() {
        Set<User> users = new HashSet<>();

        users.add(new User("Alex",    "Iron",        135.5, 18, true));
        users.add(new User("Beth",    "Iron",        142.0, 22, false));
        users.add(new User("Carlos",  "Bronze",      158.3, 25, true));
        users.add(new User("Diana",   "Bronze",      120.7, 19, false));
        users.add(new User("Ethan",   "Bronze",      175.1, 30, true));
        users.add(new User("Fiona",   "Silver",      160.0, 21, false));
        users.add(new User("Greg",    "Silver",      148.9, 27, true));
        users.add(new User("Hana",    "Silver",      133.4, 20, false));
        users.add(new User("Ivan",    "Gold",        185.2, 24, true));
        users.add(new User("Jana",    "Gold",        140.6, 23, false));
        users.add(new User("Kyle",    "Gold",        170.0, 28, true));
        users.add(new User("Lisa",    "Platinum",    155.8, 26, false));
        users.add(new User("Mike",    "Platinum",    190.3, 31, true));
        users.add(new User("Nina",    "Platinum",    125.0, 17, false));
        users.add(new User("Omar",    "Diamond",     168.7, 29, true));
        users.add(new User("Petra",   "Diamond",     145.2, 22, false));
        users.add(new User("Quinn",   "Diamond",     178.4, 33, true));
        users.add(new User("Rosa",    "Master",      162.1, 35, false));
        users.add(new User("Sam",     "Master",      195.0, 28, true));
        users.add(new User("Tara",    "Master",      138.5, 24, false));
        users.add(new User("Uri",     "Grandmaster", 180.9, 32, true));
        users.add(new User("Vera",    "Challenger",  172.3, 26, false));

        return users;
    }
}

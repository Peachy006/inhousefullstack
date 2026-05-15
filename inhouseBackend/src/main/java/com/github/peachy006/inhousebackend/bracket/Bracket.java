package com.github.peachy006.inhousebackend.bracket;

import com.github.peachy006.inhousebackend.user.User;

import java.util.HashSet;
import java.util.Set;

public class Bracket {
    Set<User> users;

    public Bracket() {
        this.users = new HashSet<>();
    }

    public Set<User> getUsers() {
        return users;
    }

    public void addUser(User u) {
        users.add(u);
    }

    public int userCount() {
        return users.size();
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }

}

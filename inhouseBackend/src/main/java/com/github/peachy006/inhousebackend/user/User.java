package com.github.peachy006.inhousebackend.user;

import java.util.Objects;

public class User implements Comparable<User>{
    String rank;
    double weight;
    int age;
    boolean isBoy;

    public User() {}

    public User(String rank, double weight, int age, boolean isBoy) {
        this.rank = rank;
        this.weight = weight;
        this.age = age;
        this.isBoy = isBoy;
    }

    public String getRank() {
        return rank;
    }

    public void setRank(String rank) {
        this.rank = rank;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public boolean isBoy() {
        return isBoy;
    }

    public void setBoy(boolean boy) {
        isBoy = boy;
    }

    @Override
    public String toString() {
        return rank + " | age=" + age + " | weight=" + weight + " | " + (isBoy ? "M" : "F");
    }

    @Override
    public int compareTo(User other) {
        return Integer.compare(this.age, other.age);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User)) return false;
        User other = (User) o;
        return age == other.age
            && isBoy == other.isBoy
            && Double.compare(weight, other.weight) == 0
            && Objects.equals(rank, other.rank);
    }

    @Override
    public int hashCode() {
        return Objects.hash(rank, weight, age, isBoy);
    }
}
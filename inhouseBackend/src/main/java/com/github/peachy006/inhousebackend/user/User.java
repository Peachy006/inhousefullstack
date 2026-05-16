package com.github.peachy006.inhousebackend.user;

import java.util.Objects;

public class User implements Comparable<User>{
    String name;
    String rank;
    double weight;
    int age;
    boolean boy;

    public User() {}

    public User(String name, String rank, double weight, int age, boolean boy) {
        this.name = name;
        this.rank = rank;
        this.weight = weight;
        this.age = age;
        this.boy = boy;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
        return boy;
    }

    public void setBoy(boolean boy) {
        this.boy = boy;
    }

    @Override
    public String toString() {
        return name + " | " + rank + " | age=" + age + " | weight=" + weight + " | " + (boy ? "M" : "F");
    }

    @Override
    public int compareTo(User other) {
        return Double.compare(this.score(), other.score());
    }

    private double score() {
        double s = 0;
        s += rankValue() * 10;
        s += age * 5;
        s += weight;
        if (boy) s += 3;
        return s;
    }

    private int rankValue() {
        switch (rank) {
            case "white":  return 0;
            case "grey":   return 1;
            case "yellow": return 2;
            case "orange": return 3;
            case "green":  return 4;
            default:       return 0;
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User)) return false;
        User other = (User) o;
        return age == other.age
            && boy == other.boy
            && Double.compare(weight, other.weight) == 0
            && Objects.equals(name, other.name)
            && Objects.equals(rank, other.rank);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, rank, weight, age, boy);
    }
}
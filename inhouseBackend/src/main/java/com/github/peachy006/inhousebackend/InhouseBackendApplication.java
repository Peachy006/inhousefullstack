package com.github.peachy006.inhousebackend;

import com.github.peachy006.inhousebackend.user.User;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import com.github.peachy006.inhousebackend.user.TestDataFactory;

import java.util.HashSet;
import java.util.Set;


@SpringBootApplication
public class InhouseBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(InhouseBackendApplication.class, args);
    }

    Set<User> users = TestDataFactory.getTestUsers();

}

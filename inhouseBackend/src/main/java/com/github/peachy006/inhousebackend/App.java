package com.github.peachy006.inhousebackend;

import com.github.peachy006.inhousebackend.bracket.Bracket;
import com.github.peachy006.inhousebackend.brackets.BracketGenerator;
import com.github.peachy006.inhousebackend.user.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class App {

    private final BracketGenerator bracketGenerator = new BracketGenerator();

    @PostMapping("/api/brackets")
    public List<Bracket> generateBrackets(@RequestBody List<User> users) {
        System.out.println("Received " + users.size() + " users");
        List<Bracket> brackets = bracketGenerator.generateBrackets(users);

        for (int i = 0; i < brackets.size(); i++) {
            System.out.println("--- Bracket " + (i + 1) + " ---");
            for (User u : brackets.get(i).getUsers()) {
                System.out.println("  " + u);
            }
        }

        return brackets;
    }
}

package com.example.moodbite;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MoodBiteApplication {

    public static void main(String[] args) {
        System.out.println("🍽️ MoodBite Application 개별 배포 테스트 시작! v1.1");
        System.out.println("🚀 fetch-depth 수정 후 재테스트!");
        SpringApplication.run(MoodBiteApplication.class, args);
    }

}

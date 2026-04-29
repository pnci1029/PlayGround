package com.example.moodbite;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MoodBiteApplication {

    public static void main(String[] args) {
        System.out.println("🍽️ MoodBite Application 개별 배포 테스트 시작! v1.2");
        System.out.println("🚀 grep 패턴 수정 후 재테스트!");
        System.out.println("✅ 이제 MoodBite만 재시작되길 기대!");
        SpringApplication.run(MoodBiteApplication.class, args);
    }

}

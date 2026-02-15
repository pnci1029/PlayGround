package com.example.moodbite.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "kakao.maps.api")
data class KakaoApiConfig(
    var url: String = "",
    var key: String = ""
)
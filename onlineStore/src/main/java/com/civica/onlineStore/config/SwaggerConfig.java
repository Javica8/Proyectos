package com.civica.onlineStore.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Cívica-Sport API")
                        .version("1.0.0")
                        .description("API para la gestión y administración de tu tienda de deportes")
                        .contact(new Contact()
                                .name("Soporte Cívica-Sport")
                                .email("soporte@Cívica-Sport.com")
                                .url("https://Cívica-Sport.com")));
    }
}
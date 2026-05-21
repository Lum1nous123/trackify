package vn.lum1nous.trackify.security;

import vn.lum1nous.trackify.security.handler.JsonAccessDeniedHandler;
import vn.lum1nous.trackify.security.handler.JsonAuthenticationEntryPoint;
import vn.lum1nous.trackify.security.jwt.JwtOncePerRequestAuthenticator;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

        private final JwtOncePerRequestAuthenticator jwtOncePerRequestAuthenticator;
        private final JsonAuthenticationEntryPoint jsonAuthenticationEntryPoint;
        private final JsonAccessDeniedHandler jsonAccessDeniedHandler;

        public SecurityConfig(
                        JwtOncePerRequestAuthenticator jwtOncePerRequestAuthenticator,
                        JsonAuthenticationEntryPoint jsonAuthenticationEntryPoint,
                        JsonAccessDeniedHandler jsonAccessDeniedHandler) {
                this.jwtOncePerRequestAuthenticator = jwtOncePerRequestAuthenticator;
                this.jsonAuthenticationEntryPoint = jsonAuthenticationEntryPoint;
                this.jsonAccessDeniedHandler = jsonAccessDeniedHandler;
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(List.of("http://localhost:3000", "https://trackify-hazel.vercel.app"));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                config.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .httpBasic(basic -> basic.disable())
                                .formLogin(form -> form.disable())
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(csrf -> csrf.disable())
                                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint(jsonAuthenticationEntryPoint)
                                                .accessDeniedHandler(jsonAccessDeniedHandler))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/api/health").permitAll()
                                                .requestMatchers("/api/auth/**").permitAll()
                                                .requestMatchers("/api/scrape/**").permitAll()
                                                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**")
                                                .permitAll()
                                                .anyRequest().authenticated())
                                .addFilterBefore(jwtOncePerRequestAuthenticator,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}

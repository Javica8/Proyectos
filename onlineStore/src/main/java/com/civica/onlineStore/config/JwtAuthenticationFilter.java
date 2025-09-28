package com.civica.onlineStore.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.civica.onlineStore.service.CustomUserDetailsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider,
            CustomUserDetailsService customUserDetailsService) {
        this.tokenProvider = tokenProvider;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
    throws ServletException, IOException {
    
    String path = request.getServletPath();
    
    // Rutas públicas que no requieren autenticación
    if (path.startsWith("/api/v1/auth/") || 
        path.startsWith("/auth/") || 
        path.startsWith("/css/") || 
        path.startsWith("/js/") || 
        path.startsWith("/img/") || 
        path.startsWith("/static/") || 
        path.endsWith(".html") || 
        path.equals("/") ||
        path.equals("/favicon.ico") ||
        path.startsWith("/h2-console/")) {
        filterChain.doFilter(request, response);
        return;
    }

    try {
        String jwt = getJwtFromRequest(request);
        
        if (StringUtils.hasText(jwt)) {
            if (tokenProvider.validateToken(jwt)) {
                String email = tokenProvider.getUsernameFromJWT(jwt);
                
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
    } catch (Exception ex) {
        logger.error("Error al autenticar el usuario: {}", ex.getMessage());
    }

    filterChain.doFilter(request, response);
}

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
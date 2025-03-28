package com.codingapi.springboot.security.filter;

import com.alibaba.fastjson.JSONObject;
import com.codingapi.springboot.framework.dto.response.Response;
import com.codingapi.springboot.framework.dto.response.SingleResponse;
import com.codingapi.springboot.security.dto.request.LoginRequest;
import com.codingapi.springboot.security.dto.request.LoginRequestContext;
import com.codingapi.springboot.security.dto.response.LoginResponse;
import com.codingapi.springboot.security.gateway.Token;
import com.codingapi.springboot.security.gateway.TokenContext;
import com.codingapi.springboot.security.gateway.TokenGateway;
import com.codingapi.springboot.security.properties.CodingApiSecurityProperties;
import io.jsonwebtoken.Header;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

@Slf4j
public class MyLoginFilter extends UsernamePasswordAuthenticationFilter {

    private final TokenGateway tokenGateway;

    private final SecurityLoginHandler loginHandler;

    public MyLoginFilter(AuthenticationManager authenticationManager, TokenGateway tokenGateway, SecurityLoginHandler loginHandler, CodingApiSecurityProperties securityJwtProperties) {
        super(authenticationManager);
        this.tokenGateway = tokenGateway;
        this.loginHandler = loginHandler;
        this.setRequiresAuthenticationRequestMatcher(new AntPathRequestMatcher(securityJwtProperties.getLoginProcessingUrl(), "POST"));
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        log.debug("login authentication ~");
        String content = null;
        try {
            content = IOUtils.toString(request.getInputStream(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new AuthenticationServiceException("request input stream read fail.");
        }
        LoginRequest login = JSONObject.parseObject(content, LoginRequest.class);
        if (login == null || login.isEmpty()) {
            throw new AuthenticationServiceException("request stream read was null.");
        }
        try {
            loginHandler.preHandle(request, response, login);
        } catch (Exception e) {
            throw new AuthenticationServiceException(e.getLocalizedMessage());
        }
        LoginRequestContext.getInstance().set(login);
        return getAuthenticationManager().authenticate(new UsernamePasswordAuthenticationToken(login.getUsername(), login.getPassword()));
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException, ServletException {
        log.debug("login success authentication ~");
        UserDetails user = (UserDetails) authResult.getPrincipal();
        LoginRequest loginRequest = LoginRequestContext.getInstance().get();

        Token token = tokenGateway.create(user.getUsername(), loginRequest.getPassword(),
                user.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList()),
                TokenContext.getExtra());

        LoginResponse loginResponse = loginHandler.postHandle(request, response, loginRequest, user, token);
        String content = JSONObject.toJSONString(SingleResponse.of(loginResponse));

        // 设置响应的 Content-Type 为 JSON，并指定字符编码为 UTF-8
        response.setContentType("application/json;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");

        IOUtils.write(content, response.getOutputStream(), StandardCharsets.UTF_8);

        LoginRequestContext.getInstance().clean();

    }


    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed) throws IOException, ServletException {
        log.debug("login fail authentication ~");
        String content = JSONObject.toJSONString(Response.buildFailure("login.error", failed.getMessage()));

        // 设置响应的 Content-Type 为 JSON，并指定字符编码为 UTF-8
        response.setContentType("application/json;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");

        IOUtils.write(content, response.getOutputStream(), StandardCharsets.UTF_8);

        LoginRequestContext.getInstance().clean();
    }
}

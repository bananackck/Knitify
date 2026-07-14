package com.knitify.auth;

import com.knitify.auth.AuthService.AuthResult;
import com.knitify.auth.AuthService.MemberResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    static final String ACCESS_COOKIE = "KNITIFY_ACCESS";
    static final String REFRESH_COOKIE = "KNITIFY_REFRESH";
    private final AuthService authService;
    private final boolean cookieSecure;

    public AuthController(AuthService authService, @Value("${app.cookie-secure}") boolean cookieSecure) {
        this.authService = authService;
        this.cookieSecure = cookieSecure;
    }

    @PostMapping("/signup")
    public MemberResponse signup(@Valid @RequestBody SignupRequest request, HttpServletResponse response) {
        return setAuthCookies(response, authService.signup(request.loginId(), request.password(), request.nickname()));
    }

    @PostMapping("/login")
    public MemberResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        return setAuthCookies(response, authService.login(request.loginId(), request.password()));
    }

    @PostMapping("/refresh")
    public MemberResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        String token = JwtAuthenticationFilter.findCookie(request, REFRESH_COOKIE);
        if (token == null) throw new JwtService.InvalidTokenException();
        return setAuthCookies(response, authService.refresh(token));
    }

    @PostMapping("/logout")
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        authService.logout(JwtAuthenticationFilter.findCookie(request, REFRESH_COOKIE));
        clearCookie(response, ACCESS_COOKIE, "/");
        clearCookie(response, REFRESH_COOKIE, "/api/auth");
    }

    @GetMapping("/me")
    public MemberResponse me(Authentication authentication) { return authService.me((Long) authentication.getPrincipal()); }

    @GetMapping("/csrf")
    public CsrfResponse csrf(CsrfToken token) { return new CsrfResponse(token.getHeaderName(), token.getToken()); }

    private MemberResponse setAuthCookies(HttpServletResponse response, AuthResult result) {
        addCookie(response, ACCESS_COOKIE, result.accessToken().value(), "/", Duration.between(java.time.Instant.now(), result.accessToken().expiresAt()));
        addCookie(response, REFRESH_COOKIE, result.refreshToken().value(), "/api/auth", Duration.between(java.time.Instant.now(), result.refreshToken().expiresAt()));
        return result.member();
    }

    private void addCookie(HttpServletResponse response, String name, String value, String path, Duration maxAge) {
        response.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from(name, value).httpOnly(true).secure(cookieSecure)
                .sameSite("Lax").path(path).maxAge(maxAge).build().toString());
    }

    private void clearCookie(HttpServletResponse response, String name, String path) { addCookie(response, name, "", path, Duration.ZERO); }

    public record SignupRequest(
            @NotBlank @Pattern(regexp = "^[A-Za-z0-9_]{4,30}$") String loginId,
            @NotBlank @Size(min = 8, max = 72) String password,
            @NotBlank @Size(min = 2, max = 30) String nickname) {}
    public record LoginRequest(@NotBlank String loginId, @NotBlank String password) {}
    public record CsrfResponse(String headerName, String token) {}
}

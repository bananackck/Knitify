package com.knitify.auth;

import com.knitify.auth.JwtService.IssuedToken;
import com.knitify.auth.JwtService.TokenClaims;
import com.knitify.auth.JwtService.TokenType;
import com.knitify.member.Member;
import com.knitify.member.MemberRepository;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {
    private final MemberRepository memberRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final long accessTokenSeconds;
    private final long refreshTokenSeconds;

    public AuthService(MemberRepository memberRepository, RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder, JwtService jwtService,
                       @Value("${app.auth.access-token-seconds}") long accessTokenSeconds,
                       @Value("${app.auth.refresh-token-seconds}") long refreshTokenSeconds) {
        this.memberRepository = memberRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.accessTokenSeconds = accessTokenSeconds;
        this.refreshTokenSeconds = refreshTokenSeconds;
    }

    public AuthResult signup(String loginId, String password, String nickname) {
        if (memberRepository.existsByLoginId(loginId)) throw new DuplicateLoginIdException();
        Member member = memberRepository.save(new Member(loginId, passwordEncoder.encode(password), nickname));
        return issueTokens(member);
    }

    public AuthResult login(String loginId, String password) {
        Member member = memberRepository.findByLoginId(loginId).orElseThrow(InvalidCredentialsException::new);
        if (!passwordEncoder.matches(password, member.getPasswordHash())) throw new InvalidCredentialsException();
        return issueTokens(member);
    }

    public AuthResult refresh(String refreshToken) {
        TokenClaims claims = jwtService.verify(refreshToken, TokenType.REFRESH);
        RefreshToken stored = refreshTokenRepository.findByTokenIdHash(jwtService.hashTokenId(claims.tokenId()))
                .orElseThrow(JwtService.InvalidTokenException::new);
        Instant now = Instant.now();
        if (!stored.isActive(now) || !stored.getMember().getId().equals(claims.memberId())) throw new JwtService.InvalidTokenException();
        stored.revoke(now);
        return issueTokens(stored.getMember());
    }

    public void logout(String refreshToken) {
        if (refreshToken == null) return;
        try {
            TokenClaims claims = jwtService.verify(refreshToken, TokenType.REFRESH);
            refreshTokenRepository.findByTokenIdHash(jwtService.hashTokenId(claims.tokenId()))
                    .filter(token -> token.isActive(Instant.now()))
                    .ifPresent(token -> token.revoke(Instant.now()));
        } catch (JwtService.InvalidTokenException ignored) {
            // Invalid cookies are cleared by the controller as part of logout.
        }
    }

    @Transactional(readOnly = true)
    public MemberResponse me(Long memberId) {
        Member member = memberRepository.findById(memberId).orElseThrow(JwtService.InvalidTokenException::new);
        return MemberResponse.from(member);
    }

    private AuthResult issueTokens(Member member) {
        IssuedToken access = jwtService.issue(member.getId(), TokenType.ACCESS, accessTokenSeconds);
        IssuedToken refresh = jwtService.issue(member.getId(), TokenType.REFRESH, refreshTokenSeconds);
        refreshTokenRepository.save(new RefreshToken(member, jwtService.hashTokenId(refresh.tokenId()), refresh.expiresAt()));
        return new AuthResult(MemberResponse.from(member), access, refresh);
    }

    public record AuthResult(MemberResponse member, IssuedToken accessToken, IssuedToken refreshToken) {}
    public record MemberResponse(Long id, String loginId, String nickname) {
        static MemberResponse from(Member member) { return new MemberResponse(member.getId(), member.getLoginId(), member.getNickname()); }
    }
    public static class DuplicateLoginIdException extends RuntimeException {}
    public static class InvalidCredentialsException extends RuntimeException {}
}

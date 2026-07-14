package com.knitify.auth;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private static final Base64.Encoder URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder URL_DECODER = Base64.getUrlDecoder();
    private final ObjectMapper objectMapper;
    private final byte[] secret;

    public JwtService(ObjectMapper objectMapper, @Value("${app.jwt-secret}") String secret) {
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("JWT secret must be at least 32 bytes");
        }
        this.objectMapper = objectMapper;
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
    }

    public IssuedToken issue(Long memberId, TokenType type, long lifetimeSeconds) {
        Instant now = Instant.now();
        String tokenId = UUID.randomUUID().toString();
        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put("sub", memberId.toString());
        claims.put("type", type.name());
        claims.put("jti", tokenId);
        claims.put("iat", now.getEpochSecond());
        claims.put("exp", now.plusSeconds(lifetimeSeconds).getEpochSecond());
        try {
            String header = encode(objectMapper.writeValueAsBytes(Map.of("alg", "HS256", "typ", "JWT")));
            String payload = encode(objectMapper.writeValueAsBytes(claims));
            String content = header + "." + payload;
            return new IssuedToken(content + "." + encode(sign(content)), tokenId, now.plusSeconds(lifetimeSeconds));
        } catch (Exception exception) {
            throw new IllegalStateException("JWT 발급에 실패했습니다.", exception);
        }
    }

    public TokenClaims verify(String token, TokenType expectedType) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) throw new IllegalArgumentException("Invalid JWT");
            byte[] expected = sign(parts[0] + "." + parts[1]);
            if (!MessageDigest.isEqual(expected, URL_DECODER.decode(parts[2]))) throw new IllegalArgumentException("Invalid signature");
            Map<String, Object> claims = objectMapper.readValue(URL_DECODER.decode(parts[1]), new TypeReference<>() {});
            TokenType type = TokenType.valueOf((String) claims.get("type"));
            long expiresAt = ((Number) claims.get("exp")).longValue();
            if (type != expectedType || Instant.now().getEpochSecond() >= expiresAt) throw new IllegalArgumentException("Expired or wrong token");
            return new TokenClaims(Long.valueOf((String) claims.get("sub")), (String) claims.get("jti"), Instant.ofEpochSecond(expiresAt));
        } catch (Exception exception) {
            throw new InvalidTokenException();
        }
    }

    public String hashTokenId(String tokenId) {
        try { return HexFormatHolder.hex(MessageDigest.getInstance("SHA-256").digest(tokenId.getBytes(StandardCharsets.UTF_8))); }
        catch (Exception exception) { throw new IllegalStateException(exception); }
    }

    private byte[] sign(String value) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret, "HmacSHA256"));
        return mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
    }
    private String encode(byte[] value) { return URL_ENCODER.encodeToString(value); }

    public enum TokenType { ACCESS, REFRESH }
    public record IssuedToken(String value, String tokenId, Instant expiresAt) {}
    public record TokenClaims(Long memberId, String tokenId, Instant expiresAt) {}
    public static class InvalidTokenException extends RuntimeException {}
    private static class HexFormatHolder {
        static String hex(byte[] bytes) { return java.util.HexFormat.of().formatHex(bytes); }
    }
}

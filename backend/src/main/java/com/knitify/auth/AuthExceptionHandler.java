package com.knitify.auth;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class AuthExceptionHandler {
    @ExceptionHandler(AuthService.DuplicateLoginIdException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    Map<String, String> duplicateLoginId() { return Map.of("message", "이미 사용 중인 아이디입니다."); }

    @ExceptionHandler({AuthService.InvalidCredentialsException.class, JwtService.InvalidTokenException.class})
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    Map<String, String> unauthorized() { return Map.of("message", "인증 정보가 올바르지 않습니다."); }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    Map<String, String> validation() { return Map.of("message", "입력값을 확인해 주세요."); }
}

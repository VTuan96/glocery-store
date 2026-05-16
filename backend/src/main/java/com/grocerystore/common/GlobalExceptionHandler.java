package com.grocerystore.common;

import com.grocerystore.auth.DeactivatedAccountException;
import com.grocerystore.auth.InvalidCredentialsException;
import com.grocerystore.auth.InvalidOverrideTokenException;
import com.grocerystore.product.DuplicateBarcodeException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;

/**
 * Global exception handler — all exceptions map to RFC 7807 ProblemDetail responses.
 * No try/catch in controllers; all error handling goes through here.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidCredentialsException.class)
    public ProblemDetail handleInvalidCredentials(InvalidCredentialsException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.UNAUTHORIZED);
        problem.setType(URI.create("https://grocerystore.app/errors/invalid-credentials"));
        problem.setTitle("Unauthorized");
        problem.setDetail("Mã PIN không đúng");
        return problem;
    }

    @ExceptionHandler(DeactivatedAccountException.class)
    public ProblemDetail handleDeactivatedAccount(DeactivatedAccountException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.UNAUTHORIZED);
        problem.setType(URI.create("https://grocerystore.app/errors/deactivated-account"));
        problem.setTitle("Unauthorized");
        problem.setDetail(ex.getMessage());
        return problem;
    }

    @ExceptionHandler(InvalidOverrideTokenException.class)
    public ProblemDetail handleInvalidOverrideToken(InvalidOverrideTokenException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setType(URI.create("https://grocerystore.app/errors/invalid-override-token"));
        problem.setTitle("Invalid Override Token");
        problem.setDetail(ex.getMessage());
        return problem;
    }

    @ExceptionHandler(DuplicateBarcodeException.class)
    public ProblemDetail handleDuplicateBarcode(DuplicateBarcodeException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.CONFLICT);
        problem.setType(URI.create("https://grocerystore.app/errors/duplicate-barcode"));
        problem.setTitle("Duplicate Barcode");
        problem.setDetail(ex.getMessage());
        return problem;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleIllegalArgument(IllegalArgumentException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
        problem.setType(URI.create("https://grocerystore.app/errors/not-found"));
        problem.setTitle("Not Found");
        problem.setDetail(ex.getMessage());
        return problem;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setType(URI.create("https://grocerystore.app/errors/validation-error"));
        problem.setTitle("Validation Failed");
        String detail = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .findFirst()
                .orElse("Invalid request");
        problem.setDetail(detail);
        return problem;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGeneric(Exception ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        problem.setType(URI.create("https://grocerystore.app/errors/internal-error"));
        problem.setTitle("Internal Server Error");
        problem.setDetail("An unexpected error occurred");
        return problem;
    }
}

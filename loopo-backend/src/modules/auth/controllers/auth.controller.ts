import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { LocalAuthGuard } from '../../../shared/common/guards/local-auth.guard';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RefreshTokenGuard } from '../../../shared/common/guards/refresh-token.guard';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';
import { Public } from '../../../shared/common/decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Email or phone already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto, // Decalred for Swagger Documentation
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.authService.login(req.user, ip, userAgent);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Tokens successfully refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto, // Declared for Swagger
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const tokenInfo = req.user as any;
    return this.authService.refreshTokens(tokenInfo.refreshToken, ip, userAgent);
  }

  @Public() // Logout route takes refresh token directly
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate password reset via email' })
  @ApiResponse({ status: 200, description: 'Reset password link queued' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using verification token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('send-email-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend email verification token' })
  @ApiResponse({ status: 200, description: 'Verification email queued' })
  async sendEmailVerification(@CurrentUser() user: any) {
    return this.authService.sendEmailVerification(user.id);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('send-phone-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a 6-digit OTP verification code' })
  @ApiResponse({ status: 200, description: 'OTP queued and sent' })
  async sendPhoneOtp(@CurrentUser() user: any, @Body('phone') phone: string) {
    return this.authService.sendPhoneOtp(user.id, phone);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('verify-phone-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify phone number using 6-digit OTP' })
  @ApiResponse({ status: 200, description: 'Phone number verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid/expired OTP' })
  async verifyPhoneOtp(@CurrentUser() user: any, @Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyPhoneOtp(user.id, verifyOtpDto.phone, verifyOtpDto.otp);
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth Flow' })
  async googleAuth() {
    // Standard OAuth redirect handler
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback endpoint' })
  async googleAuthRedirect(@Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.authService.login(req.user, ip, userAgent);
  }

  @Public()
  @Get('apple')
  @UseGuards(AuthGuard('apple'))
  @ApiOperation({ summary: 'Initiate Apple OAuth Flow' })
  async appleAuth() {
    // Standard OAuth redirect handler
  }

  @Public()
  @Post('apple/callback')
  @UseGuards(AuthGuard('apple'))
  @ApiOperation({ summary: 'Apple OAuth callback endpoint' })
  async appleAuthRedirect(@Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.authService.login(req.user, ip, userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getProfile(@CurrentUser() user: any) {
    return {
      message: 'Profile retrieved successfully',
      data: user,
    };
  }
}

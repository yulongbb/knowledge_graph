import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 从请求头中提取 JWT
      secretOrKey: 'secretKey', // JWT 密钥
    });
  }

  // 验证 JWT 的有效性
  async validate(payload: JwtPayload, done: Function) {
    const user = await this.authService.validateAccount(payload);
    if (!user) {
      return done(new UnauthorizedException(), false); // 如果用户无效，抛出未授权异常
    }
    done(null, user); // 验证通过，返回用户信息
  }
}

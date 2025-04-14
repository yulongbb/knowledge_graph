import { Controller, Get, UseGuards, HttpStatus, HttpCode, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('用户认证') // 分组
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录', description: '用户通过账号和密码登录系统' })
  @ApiBody({
    description: '登录参数',
    schema: {
      type: 'object',
      properties: {
        account: { type: 'string', description: '用户账号' },
        password: { type: 'string', description: '用户密码' },
      },
    },
  })
  async login(@Body() params): Promise<any> {
    return this.authService.login(params.account, params.password);
  }

  @Get('menus')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '获取用户菜单', description: '通过 JWT 获取用户的菜单权限' })
  @ApiBearerAuth()
  async menus(): Promise<any> {
    return this.authService.menus();
  }
}

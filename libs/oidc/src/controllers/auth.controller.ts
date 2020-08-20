import { Controller, Get, Req, Res, Param, Next } from '@nestjs/common';
import { Response, Request } from 'express';
import { Public } from '../decorators/public.decorator';
import { OidcService } from '../services';
import { isAvailableRouteForMultitenant } from '../decorators';

@Controller()
export class AuthController {
  constructor(public oidcService: OidcService) {}

  @isAvailableRouteForMultitenant(false)
  @Get('/user')
  user(@Req() req) {
    return req.user.userinfo;
  }

  @Public()
  @isAvailableRouteForMultitenant(false)
  @Get('/login')
  login(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: Function,
    @Param() params,
  ) {
    this.oidcService.login(req, res, next, params);
  }

  @Public()
  @isAvailableRouteForMultitenant(false)
  @Get('login/callback')
  loginCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: Function,
    @Param() params,
  ) {
    this.oidcService.login(req, res, next, params);
  }

  @Public()
  @isAvailableRouteForMultitenant(false)
  @Get('/logout')
  async logout(@Req() req: Request, @Res() res: Response, @Param() params) {
    this.oidcService.logout(req, res, params);
  }

  @isAvailableRouteForMultitenant(false)
  @Get('/check-token')
  async checkTokens(@Req() req: Request, @Res() res: Response) {
    this.oidcService.checkToken(req, res);
  }

  @isAvailableRouteForMultitenant(false)
  @Get('/refresh-token')
  refreshTokens(@Req() req, @Res() res) {
    this.oidcService.refreshTokens(req, res);
  }

  @Public()
  @isAvailableRouteForMultitenant(false)
  @Get('/loggedout')
  loggedOut(@Res() res: Response, @Param() params) {
    this.oidcService.loggedOut(res, params);
  }
}

import { CanActivate, ExecutionContext, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { MisdirectedStatus } from '../interfaces';
import { OidcService } from '../services';

@Injectable()
export class TenancyGuard implements CanActivate {
  constructor(private reflector: Reflector, private oidcService: OidcService) { }

  canActivate(context: ExecutionContext): boolean {
    const classIsMultitenant = this.reflector.get<boolean>('isMultitenant', context.getClass());
    const handlerIsMultitenant = this.reflector.get<boolean>('isMultitenant', context.getHandler());
    const isMultitenant = typeof classIsMultitenant !== 'undefined' ? classIsMultitenant : handlerIsMultitenant;

    let req = context.switchToHttp().getRequest();
    if (context['contextType'] === 'graphql') {
      req = GqlExecutionContext.create(context).getContext().req;
    }

    if (typeof isMultitenant !== 'undefined' && isMultitenant !== this.oidcService.isMultitenant) {
      throw new NotFoundException();
    } else if (
      ((typeof isMultitenant === 'undefined' || isMultitenant === this.oidcService.isMultitenant) && !req.user) ||
      !req.user.userinfo.channel ||
      !req.params.tenantId ||
      !req.params.channelType ||
      (req.user.userinfo.channel &&
        req.user.userinfo.tenant &&
        req.user.userinfo.tenant === req.params.tenantId &&
        req.user.userinfo.channel === req.params.channelType)
    ) {
      return true;
    } else {
      throw new HttpException(
        {
          tenantId: req.params.tenantId,
          channelType: req.params.channelType,
        },
        MisdirectedStatus.MISDIRECTED,
      );
    }
  }
}

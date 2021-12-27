import { ClientProxy, RpcException } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { catchError, firstValueFrom } from 'rxjs';

import type { Constructor } from '../types';
import { PageDto } from './dto/page.dto';
import { PageTypeException } from '../exceptions/page-type.exception';

export class AbstractClientService<ActionType> {
  constructor(private client: ClientProxy) {}

  public async send<R, I>(
    pattern: ActionType,
    data: I,
    returnDataOptions: { class: Constructor<R>; isPage: true },
    isType?: false,
  ): Promise<PageDto<R>>;

  public async send<R, I>(
    pattern: ActionType,
    data: I,
    returnDataOptions:
      | { class: Constructor<R>; isPage?: false }
      | { isPage?: false; isType: true },
  ): Promise<R>;

  public async send<R, I>(pattern: ActionType, data: I): Promise<void>;

  public async send<R, I>(
    pattern: ActionType,
    data: I,
    returnDataOptions?: Partial<{
      class?: Constructor<R>;
      isPage?: boolean;
      isType?: boolean;
    }>,
  ): Promise<R | PageDto<R> | void> {
    const returnData = await firstValueFrom(this.client.send(pattern, data).pipe(catchError((err) => {
      throw new RpcException(err);
    })), {
      defaultValue: undefined,
    });

    if (returnDataOptions?.isPage && (!returnData.data || !returnData.meta)) {
      throw new PageTypeException();
    }

    if (
      !returnDataOptions?.class ||
      returnDataOptions?.isType ||
      returnDataOptions?.isPage
    ) {
      return returnData;
    }

    return plainToInstance(returnDataOptions.class, returnData);
  }
}

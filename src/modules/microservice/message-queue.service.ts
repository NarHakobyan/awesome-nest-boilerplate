import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ClientProxy, Closeable, Transport, ClientProxyFactory } from '@nestjs/microservices';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { MicroserviceConfigs } from './MicroserviceConfigs';
import { ConfigService } from '../config/config.service';

@Injectable()
export class MessageQueueService implements OnApplicationBootstrap {
    private _client: ClientProxy & Closeable;
    private _connected = new BehaviorSubject(false);

    constructor(private readonly _microserviceConfigs: MicroserviceConfigs, private _configService: ConfigService) {}

    public onConnect() {
        return this._connected.pipe(filter((value) => value === true));
    }

    public send<R = any, I = any>(pattern: any, data: I): Observable<R> {
        return this.onConnect().pipe(switchMap(() => this._client.send<R, I>(pattern, data)));
    }

    /**
     * connect to microservices
     */
    public connect(): Promise<any> {
        return this._client.connect()
            .then(() => {
            this._connected.next(true);
        });
    }

    /**
     * close microservice connection
     */
    public close() {
        this._client.close();
        this._connected.next(false);
    }

    onApplicationBootstrap(): any {
        this._client = ClientProxyFactory.create({
            transport: Transport.TCP,
            options: {
                port: this._configService.getNumber('TRANSPORT_PORT'),
            },
        });
        if (this._microserviceConfigs.autoConnect) {
            this.connect();
        }
    }
}

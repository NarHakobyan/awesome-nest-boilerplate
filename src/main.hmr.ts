import { bootstrap } from './main';

void bootstrap().then((app) => {
  if ((<any>module).hot) {
    (<any>module).hot.accept();
    (<any>module).hot.dispose(() => app.close());
  }
});

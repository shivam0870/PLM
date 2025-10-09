import {injectable, BindingScope} from '@loopback/core';
import {Engine} from 'json-rules-engine';

@injectable({scope: BindingScope.TRANSIENT})
export class RulesService {
  constructor() {}

  async run(rules: any[] = [], facts: object = {}): Promise<object> {
    if (!rules || rules.length === 0) return facts;

    const engine = new Engine(rules);
    const out = {...facts};

    engine.on('success', event => {
      if (event.params && event.params.assign) {
        Object.assign(out, event.params.assign);
      }
    });

    await engine.run(out);
    return out;
  }
}

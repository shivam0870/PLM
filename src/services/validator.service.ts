import {Engine} from 'json-rules-engine';

export class ValidatorService {
  private engine: Engine;

  constructor() {
    this.engine = new Engine();

    // Define rules for extensible models
    this.engine.addRule({
      conditions: {
        all: [
          {
            fact: 'objectType',
            operator: 'equal',
            value: 'boms'
          },
          {
            fact: 'data',
            path: '$.cost',
            operator: 'greaterThan',
            value: 1000
          }
        ]
      },
      event: {
        type: 'high-cost-bom',
        params: {
          message: 'BOM cost is high, triggering additional checks'
        }
      }
    });
//add the validatin here
    this.engine.addRule({
      conditions: {
        all: [
          {
            fact: 'objectType',
            operator: 'equal',
            value: 'styles'
          },
          {
            fact: 'data',
            path: '$.hit',
            operator: 'greaterThan',
            value: 10
          }
        ]
      },
      event: {
        type: 'high-hit-style',
        params: {
          message: 'Style hit is high, triggering additional actions'
        }
      }
    });

    this.engine.addRule({
      conditions: {
        all: [
          {
            fact: 'objectType',
            operator: 'equal',
            value: 'styles'
          },
          {
            fact: 'data',
            path: '$.brand',
            operator: 'equal',
            value: 'Nike'
          }
        ]
      },
      event: {
        type: 'nike-brand',
        params: {
          message: 'Style is Nike brand, triggering additional validations'
        }
      }
    });
  }

  getEngine(): Engine {
    return this.engine;
  }

  async runRules(facts: any): Promise<any[]> {
    const events = await this.engine.run(facts);
    return events.events;
  }
}


//Move all the validation rules to here in  one file no explicit validation should be there
// only validation shoould be in terms of json-rules-engine


//we need to add one more thing in the avoiding garbage attributes - 
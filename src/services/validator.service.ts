import {Application, CoreBindings, inject} from '@loopback/core';
import {DefaultCrudRepository, Entity} from '@loopback/repository';
import {Engine} from 'json-rules-engine';

export class ValidatorService {
  private engine: Engine;

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
  ) {
    this.engine = new Engine();
    this.addOperators();
    this.addRules();
  }

  private addOperators() {
    // Standard operators
    this.engine.addOperator('equal', (factValue: any, jsonValue: any) => factValue === jsonValue);
    this.engine.addOperator('greaterThan', (factValue: any, jsonValue: any) => factValue > jsonValue);
    this.engine.addOperator('lessThan', (factValue: any, jsonValue: any) => factValue < jsonValue);
    
    // Custom operator for string length validation
    this.engine.addOperator('lengthLessThan', (factValue: string, jsonValue: number) => {
      return !!(factValue && factValue.length < jsonValue);
    });
    
    this.engine.addOperator('lengthGreaterThan', (factValue: string, jsonValue: number) => {
      return !!(factValue && factValue.length > jsonValue);
    });
  }

  private addRules() {
    // Rule: Name length validation - FIXED
    this.engine.addRule({
      conditions: {
        any: [
          {fact: 'name', operator: 'lengthLessThan', value: 3},
          {fact: 'name', operator: 'lengthGreaterThan', value: 50},
        ],
      },
      event: {
        type: 'validation-error',
        params: {
          field: 'name',
          message: 'Name must be between 3 and 50 characters.',
        },
      },
    });

    // Rule: Hit value range validation
    this.engine.addRule({
      conditions: {
        all: [
          {fact: 'objectType', operator: 'equal', value: 'styles'},
          {
            any: [
              {fact: 'data', path: '$.hit', operator: 'lessThan', value: 1},
              {fact: 'data', path: '$.hit', operator: 'greaterThan', value: 12},
            ],
          },
        ],
      },
      event: {
        type: 'validation-error',
        params: {
          field: 'data.hit',
          message: 'Hit value must be between 1 and 12.',
        },
      },
    });

    // Rule: Brand validation - trigger if brand is not in allowed list
    this.engine.addRule({
      conditions: {
        all: [
          {fact: 'objectType', operator: 'equal', value: 'styles'},
          {fact: 'data', path: '$.brand', operator: 'notEqual', value: 'Nike'},
          {fact: 'data', path: '$.brand', operator: 'notEqual', value: 'Adidas'},
        ],
      },
      event: {
        type: 'validation-error',
        params: {
          field: 'data.brand',
          message: 'Brand must be one of: Nike, Adidas.',
        },
      },
    });
  }

  async runRules(facts: any): Promise<any[]> {
    try {
      const {events} = await this.engine.run(facts);
      return events.map(e => e.params); // Return only the params for cleaner error messages
    } catch (error) {
      console.error('Rules engine error:', error);
      return [];
    }
  }
}


//Move all the validation rules to here in  one file no explicit validation should be there
// only validation shoould be in terms of json-rules-engine


//we need to add one more thing in the avoiding garbage attributes - like in the data object brand can be there but brand1 cannot be there likewise season can be there but seazon1, seasones cannot be there so this also we have to change 
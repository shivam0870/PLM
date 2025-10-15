import { Engine } from 'json-rules-engine';
export declare class ValidatorService {
    private engine;
    constructor();
    getEngine(): Engine;
    runRules(facts: any): Promise<any[]>;
}

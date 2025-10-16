import { Application } from '@loopback/core';
export declare class ValidatorService {
    private app;
    private engine;
    constructor(app: Application);
    private addOperators;
    private addRules;
    runRules(facts: any): Promise<any[]>;
}

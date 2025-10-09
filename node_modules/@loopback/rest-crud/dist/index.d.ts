/**
 * REST API controller implementing default CRUD semantics.
 *
 * @remarks
 * Allows LoopBack 4 applications to quickly expose models via REST API without
 * having to implement custom controller or repository classes.
 *
 * @packageDocumentation
 */
export { defineCrudRepositoryClass } from '@loopback/repository';
export * from './crud-rest.api-builder';
export * from './crud-rest.component';
export * from './crud-rest.controller';

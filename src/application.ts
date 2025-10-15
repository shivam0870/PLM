import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, inject} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {ValidatorService} from './services';
import {GenericController} from './controllers';
import {BomRepository} from './repositories';

export {ApplicationConfig};

//This is the main applicaiton class 
export class FyndPlmApiApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent); // this provides the auto generated api documentation website that we see
    //at the localhost:3000/explorer

    // Bind our services
    this.service(ValidatorService);

    // Bind our controllers
    this.controller(GenericController);

    // Bind our repositories
    this.bind('repositories.BomRepository').toClass(BomRepository);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.ts'],
        nested: true,
      },
    };
  }
}

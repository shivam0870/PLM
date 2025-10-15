"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FyndPlmApiApplication = void 0;
const tslib_1 = require("tslib");
const boot_1 = require("@loopback/boot");
const rest_explorer_1 = require("@loopback/rest-explorer");
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const service_proxy_1 = require("@loopback/service-proxy");
const path_1 = tslib_1.__importDefault(require("path"));
const services_1 = require("./services");
const controllers_1 = require("./controllers");
const repositories_1 = require("./repositories");
//This is the main applicaiton class 
class FyndPlmApiApplication extends (0, boot_1.BootMixin)((0, service_proxy_1.ServiceMixin)((0, repository_1.RepositoryMixin)(rest_1.RestApplication))) {
    constructor(options = {}) {
        super(options);
        // Set up default home page
        this.static('/', path_1.default.join(__dirname, '../public'));
        // Customize @loopback/rest-explorer configuration here
        this.configure(rest_explorer_1.RestExplorerBindings.COMPONENT).to({
            path: '/explorer',
        });
        this.component(rest_explorer_1.RestExplorerComponent); // this provides the auto generated api documentation website that we see
        //at the localhost:3000/explorer
        // Bind our services
        this.service(services_1.ValidatorService);
        // Bind our controllers
        this.controller(controllers_1.GenericController);
        // Bind our repositories
        this.bind('repositories.BomRepository').toClass(repositories_1.BomRepository);
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
exports.FyndPlmApiApplication = FyndPlmApiApplication;
//# sourceMappingURL=application.js.map
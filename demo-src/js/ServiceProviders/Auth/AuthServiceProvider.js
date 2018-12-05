import Auth from "./Auth"
import {ServiceProvider} from "laralite"
export default class AuthServiceProvider extends ServiceProvider {

    constructor(app) {
        super(app)
        this.deferred = true
    }

    register() {
        this.app.bind('Auth', Auth)
    }

    boot() {

    }

    static get provides() {
        return [
            'Auth'
        ]
    }
}
/**
 * pimple.js - Javascript implementation of Fabien Potencier's Pimple simple Dependency Injection Container.
 *
 * @author Dario Mancuso
 * @copyright 2009 Fabien Potencier (pimple.php - https://github.com/fabpot/Pimple)
 * @copyright 2012 Dario Mancuso (Javascript port)
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @link https://github.com/dario1985
 */

(function () {

    if (!window.Exception) {
        window.Exception = function (m) {}
        window.Exception.prototype = new Error();
    }

    if (!window.InvalidArgumentException) {
        window.InvalidArgumentException = function (m) {}
        window.InvalidArgumentException.prototype = new Exception();
    }

    window.Pimple = function (values) {

        var values = values || {};

        /**
         * Sets a parameter or an object.
         *
         * Objects must be defined as Closures.
         *
         * Allowing any callable leads to difficult to debug problems
         * as function names (strings) are callable (creating a function with
         * the same a name as an existing parameter would break your container).
         *
         * @param string id    The unique identifier for the parameter or object
         * @param mixed  value The value of the parameter or a closure to defined an object
         */
        this.set = function (id, value) {
            values[id] = value;
        }

        /**
         * Gets a parameter or an object.
         *
         * @param  string id The unique identifier for the parameter or object
         *
         * @return mixed  The value of the parameter or an object
         *
         * @throws InvalidArgumentException if the identifier is not defined
         */
        this.get = function (id) {
            if (!(id in values)) {
                throw new InvalidArgumentException('Identifier "' + id + '" is not defined.');
            }

            return (typeof(values[id]) == "function" ? values[id](this) : values[id]);
        }

        /**
         * Checks if a parameter or an object is set.
         *
         * @param  string id The unique identifier for the parameter or object
         *
         * @return Boolean
         */
        this.exists = function (id) {
            return (typeof(values[id]) != "undefined");
        }

        /**
         * Unsets a parameter or an object.
         *
         * @param  string id The unique identifier for the parameter or object
         */
        this.unset = function (id) {
            delete(values[id]);
        }

        /**
         * Returns a closure that stores the result of the given closure for
         * uniqueness in the scope of this instance of Pimple.
         *
         * @param Closure callable A closure to wrap for uniqueness
         *
         * @return Closure The wrapped closure
         */
        this.share = function (callable) {
            if (typeof(callable) != "function") {
                throw new InvalidArgumentException('First argument is expected to be a valid callback');
            }

            var fn = callable;
            return function (c) {
                arguments.callee._object = arguments.callee._object || fn(c)
                return arguments.callee._object;
            };
        }

        /**
         * Protects a callable from being interpreted as a service.
         *
         * This is useful when you want to store a callable as a parameter.
         *
         * @param Closure callable A closure to protect from being evaluated
         *
         * @return Closure The protected closure
         */
        this.protect = function (callable) {
            if (typeof(callable) != "function") {
                throw new InvalidArgumentException('First argument is expected to be a valid callback');
            }

            var fn = callable;
            return function (c) {
                return fn;
            };
        }

        /**
         * Gets a parameter or the closure defining an object.
         *
         * @param  string id The unique identifier for the parameter or object
         *
         * @return mixed  The value of the parameter or the closure defining an object
         *
         * @throws InvalidArgumentException if the identifier is not defined
         */
        this.raw = function (id) {
            if (!(id in values)) {
                throw new InvalidArgumentException('Identifier "' + id + '" is not defined.');
            }
            return values[id];
        }

        /**
         * Extends an object definition.
         *
         * Useful when you want to extend an existing object definition,
         * without necessarily loading that object.
         *
         * @param  string  id       The unique identifier for the object
         * @param  Closure callable A closure to extend the original
         *
         * @return Closure The wrapped closure
         *
         * @throws InvalidArgumentException if the identifier is not defined
         */
        this.extend = function (id, callable) {
            if (!(id in values)) {
                throw new InvalidArgumentException('Identifier "' + id + '" is not defined.');
            }

            if (typeof(callable) != "function") {
                throw new InvalidArgumentException('Second argument is expected to be a valid callback');
            }

            var factory = values[id], fn = callable;

            if (typeof(factory) != "function") {
                throw new InvalidArgumentException('Identifier "' + id + '" does not contain an object definition.');
            }

            return values[id] = function (c) {
                return fn(factory(c), c);
            };
        }
    }
})()
/* global beforeEach,afterEach,test,expect */

import Container from "../src/Container"
import ErrorHandler from "../src/Exceptions/ErrorHandler"
import {ClassA, ClassB, ClassC, ClassD} from "./mocks"

let container = new Container
container.debug(false)
beforeEach(() => {
	container = new Container
	container.errorHandler(ErrorHandler)
	container.debug(false)
});



test('Container can resolve dependencies from parameters of classes and functions / callbacks.', () => {
	container.bind('classA', ClassA, true)
	container.bind('classB', ClassB, true)
	container.bind('classC', ClassC, true)

	const classA = container.make('classA')
	const classB = container.make('classB')
	const classC = container.make('classC')

	expect(classA).toBeInstanceOf(ClassA)
	expect(classB).toBeInstanceOf(ClassB)
	expect(classC).toBeInstanceOf(ClassC)
	expect(classA.classB).toBeInstanceOf(ClassB)
	expect(classA.classC).toBeInstanceOf(ClassC)
	expect(classB.classC).toBeInstanceOf(ClassC)
	expect(classC).toBeInstanceOf(ClassC)
	expect(container._injections.length).toBe(0)
})



test('Container will throw a "Exception" when a missing dependency is detected.', () => {
	container.bind('ClassD', ClassD)
	try {
		const classD = container.make('classD')
	} catch (e) {
		console.error(e)
		expect(e.toString()).toContain(' No Binding found')
		expect(e).toBeInstanceOf(Error)
	}
})




test('Container will throw a "Circular Dependency Exception" when a stack overflow is detected.', () => {
	class CircularA {
		constructor(CircularB) {
		}
	}

	class CircularB {
		constructor(CircularA) {
		}
	}
	container.bind('CircularA', CircularA, true)
	container.bind('CircularB', CircularB, true)

	try {
		const classA = container.make('CircularA')
	} catch (e) {
		expect(e.toString()).toContain('Circular Dependency Exception')
		expect(e).toBeInstanceOf(Error)
	}
})


test('Container will resolve shared instances of shared bindings once instantiated.', () => {

	class TestClass {
		constructor() {
			this.state = 0
		}
	}

	container.bind('TestClass', TestClass, true)

	let classA = container.make('TestClass')
	classA.state = 1

	expect(container.make('TestClass').state).toBe(1)
})


test('Container will not resolve shared instances of unsharable bindings.', () => {

	class TestClass {
		constructor() {
			this.state = 0
		}
	}
	container.bind('TestClass', TestClass, false)

	let testInstance = container.make('TestClass')
	testInstance.state = 1

	expect(container.make('TestClass').state).toBe(0)
})


test('Container will resolve instance with parameters.', () => {
    
    const firstArgument = 'First argument';
    const secondArgument = 'Second argument';
    class TestClass {
        constructor(first, second) {
            this.first = first;
            this.second = second;
        }
    }
    container.bind('TestClass', TestClass)
    
    let testInstance = container.makeWith('TestClass', firstArgument, secondArgument)
    
    expect(testInstance).toBeInstanceOf(TestClass)
    expect(testInstance.first).toBe(firstArgument)
    expect(testInstance.second).toBe(secondArgument)
})


test('Container can resolve a non bound class if params are passed', () => {
    
    const firstArgument = 'First argument';
    const secondArgument = 'Second argument';
    class TestClass {
        constructor(first, second) {
            this.first = first;
            this.second = second;
        }
    }
    
    let testInstance = container.buildWith(TestClass, firstArgument, secondArgument)
    
    expect(testInstance).toBeInstanceOf(TestClass)
    expect(testInstance.first).toBe(firstArgument)
    expect(testInstance.second).toBe(secondArgument)
})


test('Container will throw the usual exception if alias cannot be resolved', () => {
    
    try {
        container.makeWith('UnBoundClass')
    } catch (e) {
        expect(e.toString()).toContain('Cannot resolve a concrete instance for')
        expect(e).toBeInstanceOf(Error)
    }
})


test('Arguments can be mixed with bound classes', () => {
    
    class BoundClass {}
    container.bind('BoundClass', BoundClass)
    
    const randomArgument = 'Random argument'
    
    class TestClass {
        constructor(BoundClass, random) {
            this.bound = BoundClass;
            this.random = random;
        }
    }
    
    let instance = container.buildWith(TestClass, 'BoundClass', randomArgument)
    expect(instance).toBeInstanceOf(TestClass)
    expect(instance.bound).toBeInstanceOf(BoundClass)
    expect(instance.random).toBe(randomArgument)
})


test('Arguments can be mixed', () => {
    
    container.bind('ClassA', ClassA, false)
    container.bind('ClassB', ClassB, false)
    
    const randomArgument = 'Random argument'
    
    class TestClass {
        constructor(ClassA, random, ClassB) {
            this.classA = ClassA;
            this.random = random;
            this.classB = ClassB;
        }
    }
    
    let instance = container.buildWith(TestClass, 'ClassA', randomArgument, 'ClassB')

    expect(instance).toBeInstanceOf(TestClass)
    expect(instance.classA).toBeInstanceOf(ClassA)
    expect(instance.random).toBe(randomArgument)
    expect(instance.classB).toBeInstanceOf(ClassB)
})

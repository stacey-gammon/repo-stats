import { sayHello } from '.'

it('test sayHello', () => {
  expect(sayHello('World')).toBe('Hello World!');
})
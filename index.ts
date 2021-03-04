/*
  В качестве оригинала даётся объект, представляющий собой дерево заранее неизвестной глубины
  Листья дерева ― строки с {placeholder}'ами

  Результатом должен быть объект такой же формы, как и оригинал
  Листья дерева ― format-функции, заменяющие плейсхолдеры значениями из аргумента-объекта
  Сигнатура format-функции:
    (vars?: { [key: string]: string | number }) => string

  NOTE: можно использовать готовую реализацию format-функции
 */

//Implementation
type TFormatArgs = Record<string, string | number>;
type TFormatFunc = (arg?: TFormatArgs) => string;
type Input = {
  [key: string]: string | Input;
};
type Result<T> = {
  [K in keyof T]: T[K] extends string ? TFormatFunc : Result<T[K]>;
};

const sourceStrings = {
  hello: 'Добрый вечор, {username}!',
  admin: {
    objectForm: {
      label: 'Пароль администратора',
      hint: 'Не менее {minLength} символов. Сейчас ― {length}'
    }
  }
};
const formatFn = (str: string, value?: TFormatArgs): string => {
  if (value) {
    Object.keys(value).forEach(
      (key) => (str = str.replace(`{${key}}`, `${value[key]}`))
    );
  }
  return str;
};
const i18Fn = <T extends Input>(strings: T): Result<T> => {
  const recursiveMethod = (arg: Input): Result<T> => {
    let result: Result<T> | undefined;
    Object.keys(arg).forEach(
      (key) =>
        (result = {
          ...result,
          [key]:
            typeof arg[key] === 'string'
              ? (prop?: TFormatArgs) => {
                return formatFn(arg[key] as string, prop);
              }
              : recursiveMethod(arg[key] as Input)
        })
    );
    if (!result) throw new Error('result is undefined');
    return result;
  };
  return recursiveMethod(strings);
};

//Tests
const t = i18Fn(sourceStrings);
console.log('🚀 Starting tests...');
const testFormat = 'Добрый вечор, me!' === t.hello({ username: 'me' });
console.assert(testFormat, '  ❌ First level failed!');
const testDepth = 'Пароль администратора' === t.admin.objectForm.label();
console.assert(testDepth, '  ❌ Generic depth failed!');
const testDepthFmt =
  'Не менее 8 символов. Сейчас ― 6' ===
  t.admin.objectForm.hint({ minLength: 8, length: 6 });
console.assert(
  testDepthFmt,
  '  ❌ Variables failed',
  t.admin.objectForm.hint({ minLength: 8, length: 6 })
);
if (testDepth && testDepthFmt && testFormat)
  console.log('🎉 Good! All tests passed.');

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
  hello: 'Добрый вечор, {username}!, {username}',
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
      (key) => {
        const searchValue = `{${key}}`;
        while (str.indexOf(searchValue) !== -1) {
          str = str.replace(searchValue, `${value[key]}`);
        }
      }
    );
  }
  return str;
};
const i18Fn = <T extends Input>(strings: T): Result<T> => {
  let result: Result<T>;
  Object.keys(strings).forEach(key => {
    const stringKey = strings[key];
    result = {
      ...result,
      [key]: typeof stringKey === 'string'
        ? (prop?: TFormatArgs) => {
          return formatFn(stringKey, prop);
        }
        : i18Fn(stringKey)
    };
  });
  return result;
};

//Tests
const t = i18Fn(sourceStrings);
console.log('🚀 Starting tests...');
const testFormat = 'Добрый вечор, me!, me' === t.hello({ username: 'me' });
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

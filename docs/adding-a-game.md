# Как добавить игру

Игра подключается как локальный compile-time модуль. Платформа обнаруживает
`src/games/*/gameModule.ts` через `import.meta.glob`, поэтому новая игра не
требует правок центрального меню, роутера или реестра.

## Минимальная структура

```text
src/games/alias/
  gameModule.ts
  AliasGame.tsx
  identity.ts
  app/
  domain/
  features/
  infrastructure/

tests/games/alias/
docs/games/alias.md
```

Идентификатор папки и `gameModule.id` должны совпадать и быть записаны в
`kebab-case`. Между разными каталогами в `src/games` запрещены прямые импорты.

## Дескриптор модуля

```ts
import { MessagesSquare } from "lucide-react";

import {
  GAME_MODULE_API_VERSION,
  defineGame,
} from "../../app/gameModule";

export const gameModule = defineGame({
  apiVersion: GAME_MODULE_API_VERSION,
  id: "alias",
  title: "Alias",
  description: "Объясняйте слова своей команде",
  continueDescription: "Продолжить игру",
  Icon: MessagesSquare,
  order: 20,
  getCatalogState: ({ storage }) => ({
    hasSavedSession: storage?.getItem("session:v1") !== null,
  }),
  load: () => import("./AliasGame"),
});
```

`gameModule.ts` загружается вместе с каталогом, поэтому он должен оставаться
маленьким и не создавать provider, не загружать контент и не писать в storage.
Сама игра загружается лениво через `load` и обязана иметь default export.

## Корневой компонент

```tsx
import type { GameHostProps } from "../../app/gameModule";

export default function AliasGame({
  preferences,
  storage,
  onExit,
  onOpenSettings,
}: GameHostProps) {
  // Соберите здесь provider и собственный экранный автомат игры.
  return null;
}
```

Платформа передаёт игре общие настройки, изолированный storage и команды
возврата. Она не должна знать о раундах, командах, ролях или других правилах
конкретной игры.

## Границы ответственности

- `domain` содержит чистые правила без React, DOM, `fetch` и `localStorage`;
- `app` или `application` содержит состояние, команды и порты;
- `infrastructure` реализует адаптеры поверх переданного storage и загрузчики;
- `features` или `ui` содержит экраны и использует `src/shared/ui`;
- стили игры хранятся только в `*.module.css` без `:global`;
- только composition root/provider создаёт конкретные адаптеры;
- код одной игры никогда не импортирует код другой игры;
- общим становится только компонент, уже доказавший универсальность.

Не создавайте универсальные `GameState`, `Round` или `Settings`: одинаковые
названия в разных играх обычно имеют разную семантику.

## Хранение данных

Поле `storage` из `GameHostProps` уже ограничено namespace текущей игры. Ключи
передавайте относительные:

```text
storage.setItem("session:v1", serializedSession)
storage.setItem("history:v1", serializedHistory)
```

В браузере платформа сохранит их как
`sh1sha-games:alias:session:v1` и `sh1sha-games:alias:history:v1`. Прямой доступ
игрового кода к `localStorage` или `sessionStorage` запрещён архитектурной
проверкой: это исключает случайную коллизию с другой игрой.

Формат сохранения должен быть версионирован. Изменение схемы сопровождается
миграцией и тестом восстановления старой версии. Ошибка storage не должна
ломать игру целиком. Методы повторяют браузерный Storage и могут бросить ошибку
из-за запрета доступа или заполненной квоты; infrastructure-адаптер обязан
преобразовать её в контролируемый результат или предупреждение.

## Обязательные проверки

Новый модуль должен иметь:

- unit-тесты правил;
- тест редьюсера или конечного автомата;
- тест восстановления storage, если оно используется;
- smoke-тест корневого компонента;
- короткую документацию в `docs/games/<id>.md`.

Перед pull request выполните:

```bash
npm run check
```

Команда проверит типы, тесты, лимит 300 строк, production-сборку и запрет
межигровых или обратных зависимостей.

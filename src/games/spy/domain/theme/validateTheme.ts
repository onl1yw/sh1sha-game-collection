import type {
  ThemeGroup,
  ThemeValidationIssue,
  ThemeValidationResult,
} from "./types";
import { THEME_LIMITS } from "./themeLimits";

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ROOT_KEYS = ["schemaVersion", "id", "name", "description", "groups"];
const GROUP_KEYS = ["id", "name", "items"];

export function validateTheme(input: unknown): ThemeValidationResult {
  const errors: ThemeValidationIssue[] = [];
  if (!isRecord(input)) {
    return failure("$", "Тематика должна быть объектом");
  }

  reportUnknownKeys(input, ROOT_KEYS, "$", errors);
  if (input.schemaVersion !== 1) {
    errors.push(issue("schemaVersion", "Поддерживается только версия 1"));
  }

  const id = readText(input.id, "id", errors, {
    id: true,
    maxLength: THEME_LIMITS.idLength,
  });
  const name = readText(input.name, "name", errors, {
    maxLength: THEME_LIMITS.themeNameLength,
  });
  const description = readText(input.description, "description", errors, {
    allowEmpty: true,
    maxLength: THEME_LIMITS.descriptionLength,
  });
  const groups = readGroups(input.groups, errors);

  if (errors.length > 0 || id === null || name === null || description === null) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: { schemaVersion: 1, id, name, description, groups },
  };
}

function readGroups(input: unknown, errors: ThemeValidationIssue[]): ThemeGroup[] {
  if (!Array.isArray(input) || input.length === 0) {
    errors.push(issue("groups", "Нужна хотя бы одна группа"));
    return [];
  }
  if (input.length > THEME_LIMITS.groupCount) {
    errors.push(
      issue(
        "groups",
        `В тематике должно быть не больше ${THEME_LIMITS.groupCount} групп`,
      ),
    );
    return [];
  }

  const groups: ThemeGroup[] = [];
  const groupIds = new Set<string>();
  const itemNames = new Set<string>();

  input.forEach((value, index) => {
    const path = `groups[${index}]`;
    if (!isRecord(value)) {
      errors.push(issue(path, "Группа должна быть объектом"));
      return;
    }

    reportUnknownKeys(value, GROUP_KEYS, path, errors);
    const id = readText(value.id, `${path}.id`, errors, {
      id: true,
      maxLength: THEME_LIMITS.idLength,
    });
    const name = readText(value.name, `${path}.name`, errors, {
      maxLength: THEME_LIMITS.groupNameLength,
    });
    const items = readItems(value.items, `${path}.items`, itemNames, errors);

    if (id !== null) {
      if (groupIds.has(id)) {
        errors.push(issue(`${path}.id`, `Идентификатор «${id}» повторяется`));
      }
      groupIds.add(id);
    }

    if (id !== null && name !== null && items !== null) {
      groups.push({ id, name, items });
    }
  });

  return groups;
}

function readItems(
  input: unknown,
  path: string,
  knownItems: Set<string>,
  errors: ThemeValidationIssue[],
): string[] | null {
  if (
    !Array.isArray(input) ||
    input.length < 1 ||
    input.length > THEME_LIMITS.itemsPerGroup
  ) {
    errors.push(
      issue(
        path,
        `В группе должно быть от 1 до ${THEME_LIMITS.itemsPerGroup} объектов`,
      ),
    );
    return null;
  }

  const items: string[] = [];
  input.forEach((value, index) => {
    const item = readText(value, `${path}[${index}]`, errors, {
      maxLength: THEME_LIMITS.itemLength,
    });
    if (item === null) return;

    const normalized = item.toLocaleLowerCase("ru-RU");
    if (knownItems.has(normalized)) {
      errors.push(issue(`${path}[${index}]`, `Объект «${item}» повторяется`));
    }
    knownItems.add(normalized);
    items.push(item);
  });

  return items;
}

function readText(
  value: unknown,
  path: string,
  errors: ThemeValidationIssue[],
  options: { allowEmpty?: boolean; id?: boolean; maxLength?: number } = {},
): string | null {
  if (typeof value !== "string") {
    errors.push(issue(path, "Ожидается строка"));
    return null;
  }

  const text = value.trim();
  if (!options.allowEmpty && !text) {
    errors.push(issue(path, "Строка не должна быть пустой"));
  }
  if (
    options.maxLength !== undefined &&
    Array.from(text).length > options.maxLength
  ) {
    errors.push(
      issue(path, `Строка не должна быть длиннее ${options.maxLength} символов`),
    );
  }
  if (options.id && !ID_PATTERN.test(text)) {
    errors.push(issue(path, "Идентификатор должен быть записан в kebab-case"));
  }
  return text;
}

function reportUnknownKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  path: string,
  errors: ThemeValidationIssue[],
): void {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) {
      errors.push(issue(`${path}.${key}`, "Неизвестное поле"));
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function issue(path: string, message: string): ThemeValidationIssue {
  return { path, message };
}

function failure(path: string, message: string): ThemeValidationResult {
  return { success: false, errors: [issue(path, message)] };
}

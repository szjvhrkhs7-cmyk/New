# FinPlanner — Финансовый планировщик

iOS-приложение для еженедельного планирования расходов с двусторонней синхронизацией
с системным календарём iPhone (EventKit), учётом план/факт и аналитикой.

## Стек

- SwiftUI (iOS 17+), декларативный UI без UIKit-экранов (кроме точечных мостов:
  `UIViewControllerRepresentable` для шторки шеринга, `UIGraphicsPDFRenderer` для PDF).
- SwiftData — локальное хранилище (`@Model`, `@Query`).
- EventKit — синхронизация с системным календарём (отдельный календарь
  «Финансовый планировщик», а не дефолтный календарь пользователя).
- Swift Charts — графики аналитики.
- LocalAuthentication — опциональный Face ID лок.
- XCTest — модульные тесты.
- Зависимости только через Swift Package Manager; на данный момент внешних
  пакетов нет — всё на системных фреймворках Apple.

## Структура проекта

```
FinPlanner/
  FinPlanner.xcodeproj/        Xcode-проект (pbxproj + общая схема FinPlanner)
  FinPlanner/                  Исходный код таргета приложения
    App/                       Точка входа, корневой TabView, DI контейнеров
    Core/                      Код, не привязанный к конкретной фиче
      Models/                  SwiftData-модели и связанные enum/struct
      Persistence/             Настройка ModelContainer/Schema
      Extensions/              Расширения Foundation-типов (Date, Decimal)
      DesignSystem/            Цвета, отступы, переиспользуемые View-модификаторы
      Security/                Face ID лок (BiometricAuthManager, AppLockView)
    Features/                  Код, сгруппированный по фиче
      Expenses/                Главный недельный экран (план/факт по тратам)
        ViewModels/
        Views/
      Calendar/                Синхронизация с системным календарём
        Services/
      Analytics/                Месяц/квартал статистика и графики
        ViewModels/
        Services/
        Views/
      Export/                  CSV/PDF экспорт и шторка шеринга
        Services/
        Views/
    Resources/                 Info.plist, Assets.xcassets
  FinPlannerTests/             Юнит-тесты (XCTest), без UI-тестов
```

### Принцип модульности по фиче

Каждая фича (`Expenses`, `Calendar`, `Analytics`, `Export`) — самодостаточная
папка со своими `Views`/`ViewModels`/`Services`. Общий код, используемый всеми
фичами (модели данных, дизайн-система, форматирование), лежит в `Core`.
Изменения внутри одной фичи не должны требовать правок в другой, кроме точек
интеграции через `Core/Models` и протоколы (`CalendarSyncing`).

## Архитектурные решения

- **`CalendarSyncing` протокол** (`Features/Calendar/Services/CalendarSyncing.swift`)
  отделяет UI и бизнес-логику от конкретной реализации EventKit
  (`EventKitCalendarSyncService`). Для превью и тестов используется
  `PreviewCalendarSyncService` (no-op), внедряется через `EnvironmentValues`.
- **`CalendarChangeApplier`** — чистая функция без зависимости от `EKEventStore`,
  которая определяет, изменилась ли дата/заметка события, и применяет изменение
  к `ExpenseItem`. Это специально выделено в отдельный тип, чтобы логику
  двусторонней синхронизации можно было тестировать без реального EventKit.
- **`PlanFactCalculator`** — чистая функция подсчёта план/факт сумм и разбивки
  по категориям, не зависящая от SwiftData/View-слоя, тестируется напрямую.
- **`ExpenseItem`** хранит категорию/статус как `String` (raw value) и предоставляет
  вычисляемые свойства `category`/`status` поверх enum — обычный паттерн
  для SwiftData-моделей, так как `@Model` не поддерживает enum с ассоциированными
  значениями так же гибко, как обычные структуры.

## Конвенции именования и стиля

- UI-строки — на русском языке (это продукт для русскоязычного рынка).
  Имена типов, свойств, файлов — на английском.
- Имя файла = имя главного типа в нём (один основной тип на файл).
- Комментарии пишутся, только когда без них неочевидна причина решения
  (нестандартный обход API, хрупкое инвариант). Не описывать в комментариях,
  что делает код — это видно из именования.
- Группировка экранов: `XxxView` — экран/подэкран, `XxxRowView`/`XxxCard` —
  переиспользуемый кусок UI, сервисы — `XxxService`/`XxxCalculator`/`XxxExporter`.
- Suffix `ViewModels` используется для enum/struct, описывающих состояние UI
  выбора (сортировка, период), а не для классов ObservableObject — большая
  часть состояния экранов держится прямо в SwiftUI `@State`/`@Query`.

## Тестирование

`FinPlannerTests` использует XCTest и покрывает только логику, не зависящую от
живого UI/EventKit/файловой системы устройства:

- `WeekIntervalTests` — арифметика недель (`Core/Extensions/DateWeek.swift`).
- `PlanFactCalculatorTests` — расчёт план/факт и разбивки по категориям.
- `CalendarChangeApplierTests` — логика применения изменений из календаря к модели.
- `WeeklyTrendCalculatorTests` — разбивка трат по неделям для графика тренда.
- `CSVExporterTests` — формат CSV, сортировка, экранирование полей.
- `PDFExporterTests` — что `PDFExporter` отдаёт валидные PDF-байты (`%PDF-`).

Новый код с нетривиальной логикой (расчёты, парсинг, синхронизация) должен
сопровождаться тестами в этом стиле: извлекать чистую функцию из
View/EventKit-кода и тестировать её изолированно.

## Сборка и тесты

Стандартный layout Xcode-проекта, без генераторов (`xcodegen`/`tuist`) и без
ручных шагов в Xcode GUI:

```bash
xcodebuild -project FinPlanner/FinPlanner.xcodeproj -scheme FinPlanner \
  -destination 'platform=iOS Simulator,name=iPhone 15' build

xcodebuild -project FinPlanner/FinPlanner.xcodeproj -scheme FinPlanner \
  -destination 'platform=iOS Simulator,name=iPhone 15' test
```

## Git

- Один коммит — одна фича/фикс, с понятным сообщением о причине изменения.
- Минимальные зависимости — только системные фреймворки Apple, SPM-пакеты
  добавлять только при явной необходимости.

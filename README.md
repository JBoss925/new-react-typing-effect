# new-react-typing-effect

A customizable React typing-effect component written in TypeScript. It cycles through messages, types and deletes text at configurable speeds, and lets consumers fully control text and cursor rendering.

## Features

- TypeScript-first React component.
- Message cycling.
- Configurable typing/deleting speed.
- Configurable empty-text and full-text delays.
- Custom cursor string.
- Custom cursor renderer.
- Custom text renderer with cursor placement control.

## Install

```bash
npm install new-react-typing-effect
```

or:

```bash
yarn add new-react-typing-effect
```

## Usage

```tsx
import TypingEffect from "new-react-typing-effect";

export function Home() {
  return (
    <TypingEffect
      messages={["Message 1", "Message 2", "Message 3"]}
      cursor="|"
      textRenderer={(text, renderedCursor, atIndex) =>
        atIndex % 2 === 0 ? (
          <h2 style={{ color: "green" }}>
            {text}
            {renderedCursor}
          </h2>
        ) : (
          <h2 style={{ color: "blue" }}>
            {text}
            {renderedCursor}
          </h2>
        )
      }
      cursorRenderer={(cursor) => <span style={{ color: "red" }}>{cursor}</span>}
      options={{
        cursor: {
          blinkPeriod: 500
        },
        text: {
          charactersPerSecond: 2,
          emptyTextDelayMS: 500,
          fullTextDelayMS: 5000
        }
      }}
    />
  );
}
```

## Props

```tsx
export type TypingEffectProps = {
  messages: string[];
  cursor?: string;
  textRenderer?: (
    text: string,
    renderedCursor: JSX.Element,
    atIndex: number
  ) => JSX.Element;
  cursorRenderer?: (cursor: string) => JSX.Element;
  options?: {
    cursor?: {
      blinkPeriod?: number;
    };
    text?: {
      charactersPerSecond?: number;
      emptyTextDelayMS?: number;
      fullTextDelayMS?: number;
    };
  };
};
```

## Local Development

Prerequisites:

- Node.js
- Yarn or npm

Install dependencies:

```bash
yarn install
```

Build the package:

```bash
yarn build
```

Run lint:

```bash
yarn lint
```

Format source files:

```bash
yarn format
```

The package build output is written to `lib/`, and `package.json` publishes that directory through the `files` field.

## Release Checklist

1. Update source in `src/`.
2. Run `yarn lint`.
3. Run `yarn build`.
4. Confirm `lib/` contains compiled output.
5. Bump the package version.
6. Publish with npm credentials.

## Troubleshooting

- If imports fail in a consuming app, verify the package was built and `lib/index.js` exists.
- If TypeScript JSX types fail locally, reinstall dependencies and confirm React type versions are installed.
- If the cursor appears in the wrong location, provide a custom `textRenderer` and place `renderedCursor` explicitly.

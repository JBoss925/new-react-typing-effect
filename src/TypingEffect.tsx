import React, { useEffect, useState } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */

// Type declarations -----------------------------------------------------------
export type TypingEffectOptions = {
  cursor?: {
    // The number of milliseconds per cursor blink
    blinkPeriod: number;
  };
  text?: {
    charactersPerSecond: number;
    emptyTextDelayMS?: number;
    fullTextDelayMS?: number;
  };
};
type ComputedTypingEffectOptions = {
  cursor: {
    blinkPeriod: number;
  };
  text: {
    charactersPerSecond: number;
    emptyTextDelayMS: number;
    fullTextDelayMS: number;
  };
};
export type CursorRenderer = (cursor: string) => JSX.Element;
export type TextRenderer = (text: string, renderedCursor: JSX.Element, atIndex: number) => JSX.Element;
export type TypingEffectProps = {
  messages: string[];
  cursor?: string;
  textRenderer?: TextRenderer;
  cursorRenderer?: CursorRenderer;
  options?: TypingEffectOptions;
};
// -----------------------------------------------------------------------------

// Utility functions -----------------------------------------------------------
const getValueAtPropPath = (propPath: string[], object: any): unknown => {
  let cursor = object;
  for (const propName of propPath) {
    cursor = cursor[propName];
  }
  return cursor;
};
const setValueAtPropPath = (propPath: string[], object: any, value: any): any => {
  let cursor = object;
  for (const propName of propPath.slice(0, propPath.length - 1)) {
    if (cursor[propName] === undefined) {
      cursor[propName] = {};
    }
    cursor = cursor[propName];
  }
  cursor[propPath[propPath.length - 1]] = value;
  return object;
};
const appendToPropPath = (propPath: string[], propName: string): string[] => {
  const newPropPath = Array.from(propPath);
  newPropPath.push(propName);
  return newPropPath;
};
const computeOptions = (options: TypingEffectOptions | undefined): ComputedTypingEffectOptions => {
  if (options === undefined) {
    return DefaultOptions;
  }
  const comp = (propPath: string[], object: any, defaultObject: any) => {
    let objectCopy = object;
    if (typeof objectCopy === 'object') {
      // go thru props
      const propNames = Object.getOwnPropertyNames(getValueAtPropPath(propPath, defaultObject));
      for (const propName of propNames) {
        const prop = objectCopy[propName];
        // if our prop is another object, recurse
        if (typeof prop === 'object') {
          const newPropPath = appendToPropPath(propPath, propName);
          objectCopy = setValueAtPropPath(newPropPath, objectCopy, comp(newPropPath, prop, defaultObject));
        }
        // if our prop is value, replace it with the default if undefined or null
        else if (prop === undefined || prop === null) {
          const newPropPath = appendToPropPath(propPath, propName);
          objectCopy = setValueAtPropPath(newPropPath, objectCopy, getValueAtPropPath(newPropPath, defaultObject));
        }
      }
    }
    return objectCopy;
  };
  return comp([], options, DefaultOptions);
};
// -----------------------------------------------------------------------------

// Default values --------------------------------------------------------------
const DefaultCursorRenderer: CursorRenderer = (cursor) => <span>{cursor}</span>;
const DefaultTextRenderer: TextRenderer = (text, renderedCursor) => (
  <h2>
    {text}
    {renderedCursor}
  </h2>
);
const DefaultCursor = '|';
const DefaultOptions: ComputedTypingEffectOptions = {
  cursor: {
    blinkPeriod: 1500,
  },
  text: {
    charactersPerSecond: 2.5,
    emptyTextDelayMS: 1000,
    fullTextDelayMS: 1000,
  },
};
// -----------------------------------------------------------------------------

// Cursor  ---------------------------------------------------------------------
const TypingEffectCursor: React.FC<{
  cursor: string;
  options: ComputedTypingEffectOptions;
  cursorRenderer: CursorRenderer;
}> = ({ cursor, options, cursorRenderer }) => {
  const [goingTransparent, setGoingTransparent] = useState<boolean>(false);
  const halfPeriod = options.cursor.blinkPeriod / 2;
  const halfPeriodInSeconds = halfPeriod / 1000;

  useEffect(() => {
    let timeoutID: NodeJS.Timeout;
    const cb = (toTransparent: boolean) => {
      setGoingTransparent(!toTransparent);
      timeoutID = setTimeout(() => {
        cb(!toTransparent);
      }, halfPeriod);
    };
    timeoutID = setTimeout(() => {
      cb(goingTransparent);
    }, halfPeriod);
    return () => {
      clearInterval(timeoutID);
    };
  }, []);

  const renderedCursor = cursorRenderer === undefined ? DefaultCursorRenderer(cursor) : cursorRenderer(cursor);
  return (
    <span
      style={{
        transition: `opacity ${halfPeriodInSeconds}s`,
        WebkitTransition: `opacity ${halfPeriodInSeconds}s`,
        MozTransition: `opacity ${halfPeriodInSeconds}s`,
        opacity: goingTransparent ? 0 : 1,
      }}
    >
      {renderedCursor}
    </span>
  );
};
// -----------------------------------------------------------------------------

// Component  ------------------------------------------------------------------
const TypingEffect: React.FC<TypingEffectProps> = ({ messages, textRenderer, cursorRenderer, cursor, options }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(0);
  const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);
  const currentMessage = messages[currentMessageIndex];
  const currentText = currentMessage.slice(0, currentTextIndex);
  const [addingToMessage, setAddingToMessage] = useState<boolean>(true);
  const atIndex = currentText.length;
  const finalOptions = computeOptions(options);
  const finalCursor = cursor ?? DefaultCursor;
  const finalCursorRenderer = cursorRenderer ?? DefaultCursorRenderer;
  const renderedCursor = (
    <TypingEffectCursor options={finalOptions} cursor={finalCursor} cursorRenderer={finalCursorRenderer} />
  );
  const renderedText =
    textRenderer === undefined
      ? DefaultTextRenderer(currentText, renderedCursor, atIndex)
      : textRenderer(currentText, renderedCursor, atIndex);

  const perCharDelay = 1000 / finalOptions.text.charactersPerSecond;
  const emptyDelay = finalOptions.text.emptyTextDelayMS;
  const fullDelay = finalOptions.text.fullTextDelayMS;

  useEffect(() => {
    let timeoutID: NodeJS.Timeout;
    const addCharacter = (
      currIndex: number,
      data: { addingToMessage: boolean; messages: string[]; messageInd: number },
    ) => {
      const newInd = currIndex + 1;
      whatDoIDoNext(newInd, data);
    };
    const removeCharacter = (
      currIndex: number,
      data: { addingToMessage: boolean; messages: string[]; messageInd: number },
    ) => {
      const newInd = currIndex - 1;
      whatDoIDoNext(newInd, data);
    };
    const whatDoIDoNext = (
      newIndex: number,
      data: { addingToMessage: boolean; messages: string[]; messageInd: number },
    ) => {
      if (newIndex === data.messages[data.messageInd].length + 1) {
        setAddingToMessage(false);
        timeoutID = setTimeout(() => {
          removeCharacter(data.messages[data.messageInd].length, {
            ...data,
            addingToMessage: false,
          });
        }, fullDelay);
      } else if (newIndex === -1) {
        setAddingToMessage(true);
        setCurrentMessageIndex((data.messageInd + 1) % data.messages.length);
        timeoutID = setTimeout(() => {
          addCharacter(0, {
            ...data,
            addingToMessage: true,
            messageInd: (data.messageInd + 1) % data.messages.length,
          });
        }, emptyDelay);
      } else {
        setCurrentTextIndex(newIndex);
        if (data.addingToMessage) {
          timeoutID = setTimeout(() => {
            addCharacter(newIndex, data);
          }, perCharDelay);
        } else {
          timeoutID = setTimeout(() => {
            removeCharacter(newIndex, data);
          }, perCharDelay);
        }
      }
    };
    timeoutID = setTimeout(() => {
      whatDoIDoNext(currentTextIndex, {
        addingToMessage,
        messages,
        messageInd: currentMessageIndex,
      });
    }, 0);
    return () => {
      clearTimeout(timeoutID);
    };
  }, []);
  return renderedText;
};
// -----------------------------------------------------------------------------

export default TypingEffect;

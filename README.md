# new-react-typing-effect
A new, more customizable typing effect component; written in Typescript.

### How to use
```tsx
import TypingEffect from 'new-react-typing-effect';

const Home: React.FC = () => (
  <TypingEffect
    messages={["Message 1", "Message 2", "Message 3"]}
    cursor="|"
    textRenderer={(text, renderedCursor, atIndex) => {
      return (
        atIndex % 2 === 0 ? 
        <h2 style={{ color: 'green' }}>{text}{renderedCursor}</h2> :
        <h2 style={{ color: 'blue' }}>{text}{renderedCursor}</h2>
      );
    }}
    cursorRenderer={(cursor) => (
      <span style={{ color: 'red' }}>{cursor}</span>
    )}
    options={{
      text: {
        charactersPerSecond: 2,
        fullTextDelayMS: 5000,
      },
    }}
  />
);

export default Home;
```

### Types
The types are self-documenting (as everything is natively written in Typescript). But here's the props type for quick reference:
```tsx
export type TypingEffectProps = {

  // The messages to cycle through
  messages: string[];

  // The cursor to display (instead of the default '|').
  cursor?: string;

  // The function that renders the final element
  textRenderer?: (text: string, renderedCursor: JSX.Element, atIndex: number) => JSX.Element;
  /***
   * NOTE: textRenderer is passed the renderedCursor as an argument, 
   * allowing you to place the cursor wherever you choose 
   * [including in the same element as the message]
  ***/

  // The function that renders the cursor (without worrying about opacity)
  cursorRenderer?: (cursor: string) => JSX.Element;

  // Configuration options
  options?: {

    // Cursor options
    cursor?: {

      // The number of milliseconds per cursor blink
      blinkPeriod: number;

    };

    // Text options
    text?: {

      // Number of character to type/delete per second
      charactersPerSecond: number;

      // Delay in milliseconds when the message is empty
      emptyTextDelayMS?: number;

      // Delay in milliseconds when the message is full
      fullTextDelayMS?: number;

    };
  };
};
```

### Motivation
I was trying to use the existing react-typing-effect package, but found the type definitions incomplete, and I basically had to write my own cursor functionality for what I wanted to be able to do (which was move the rendered cursor). So, I just decided to write my own version in Typescript. And I figure it may help out some other people in a similar situation.
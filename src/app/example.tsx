import { FC } from "hono/jsx";

export const Example: FC<{ messages: string[] }> = (props: { messages: string[] }) => {
  return (
    <>
      <h1>Hello Hono!</h1>
      <ul>
        {props.messages.map((message) => {
          return <li>{message}!!</li>;
        })}
      </ul>
    </>
  );
};

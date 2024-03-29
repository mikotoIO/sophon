import { DependencyList, useEffect, useState } from 'react';
import './App.css';

import { createClient, MainServiceClient } from './schema';

function useClient(url: string) {
  const [client, setClient] = useState<MainServiceClient | null>(null);
  useEffect(() => {
    return createClient({ url }, c => setClient(c));
  }, [url])
  return client;
}

function useStream<T>(
  stream: (handler: T) => () => void,
  handler: T,
  deps?: DependencyList,
) {
  useEffect(() => {
    const cleanup = stream(handler);
    return () => {
      cleanup();
    };
  }, deps);
}

function TestApp({ client }: {
  client: MainServiceClient;
}) {
  useStream(client.ping.bind(client), (x) => {
    console.log(x);
  }, []);
  const [count, setCount] = useState(0);


  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button
          onClick={async () => {
            // client.main.adder(2, 3).then((r) => console.log(r));
            try {
              console.log(await client.hello({ name: 'Bob', age: 20 }));
            } catch (e) {
              console.error(e);
            }
          }}
        >
          count is {count}
        </button>
        <button
          onClick={async () => {
            // client.main.adder(2, 3).then((r) => console.log(r));
            console.log(await client.child.hello());
          }}
        >
          Child test
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

function App() {
  const client = useClient('http://localhost:3000');

  if (!client) {
    return <div>loading...</div>;
  }

  return (
    <TestApp client={client} />
  );
}

export default App;

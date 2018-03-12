import React from 'react';

// TODO
// index.css comes from the client/build folder, for server side rendering
// For CRA, index.css comes from the client/asset folder.
// They should be equal.
// Make sure to minify the index.css for production

const HTML = (props) => {
  return (
    <html lang="en">
      <head>
        <title>LooseLeaf</title>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.100.2/css/materialize.min.css"
          />
          <link rel="stylesheet" href="/index.css"/>
    </head>
      <body>
        <div
          id="root"
          dangerouslySetInnerHTML={{ __html: props.html }}
        />
        <script dangerouslySetInnerHTML={{
          __html: `
            window.__SERIALIZED_STATE__ =
              JSON.stringify(${props.serverState})
          `
        }}
        />
        <script type="application/javascript" src="/main.bundle.js" />
      </body>
    </html>
  );
};

export default HTML;

module.exports = {
    "extends": "airbnb",
    "env": {
      "browser": true,
      "node": true,
      "es6": true,
      "mocha": true
    },
    "plugins": [
        "react",
        "jsx-a11y",
        "import"
    ],
    "rules": {
      "arrow-body-style": [0, "as-needed", {
        requireReturnForObjectLiteral: false,
      }],
      "comma-dangle": ["error", "never"],
      "no-underscore-dangle": "off",
      "jsx-a11y/no-static-element-interactions": "off",
      "react/no-did-mount-set-state": "off"
    },
    "globals": {
      "window": true,
      "document": true
    }
};

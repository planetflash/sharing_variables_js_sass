const HtmlWebpackPlugin = require("html-webpack-plugin");
const sass = require("node-sass");
const sassUtils = require("node-sass-utils")(sass);
const sassVars = require(__dirname + "/src/theme.js");

// Convert js strings to dimenssions
const convertStringToSassDimension = function (result) {
  // Only attempt to convert strings
  if (typeof result !== "string") {
    return result;
  }

  const cssUnits = [
    "rem",
    "em",
    "vh",
    "vw",
    "vmin",
    "vmax",
    "ex",
    "%",
    "px",
    "cm",
    "mm",
    "in",
    "pt",
    "pc",
    "ch",
  ];
  const parts = result.match(/[a-zA-Z]+|[0-9]+/g);
  const value = parts[0];
  const unit = parts[parts.length - 1];
  if (cssUnits.indexOf(unit) !== -1) {
    result = new sassUtils.SassDimension(parseInt(value, 10), unit);
  }

  return result;
};

module.exports = {
  mode: "development",
  output: {
    path: __dirname,
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
          {
            loader: "sass-loader",
            options: {
              sassOptions: {
                functions: {
                  "get($keys)": function (keys) {
                    keys = keys.getValue().split(".");
                    var result = sassVars;
                    var i;
                    for (i = 0; i < keys.length; i++) {
                      result = result[keys[i]];
                      // Convert to SassDimension if dimenssion
                      if (typeof result === "string") {
                        result = convertStringToSassDimension(result);
                      } else if (typeof result === "object") {
                        Object.keys(result).forEach(function (key) {
                          var value = result[key];
                          result[key] = convertStringToSassDimension(value);
                        });
                      }
                    }
                    result = sassUtils.castToSass(result);
                    return result;
                  },
                },
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "./index.html",
    }),
  ],
};

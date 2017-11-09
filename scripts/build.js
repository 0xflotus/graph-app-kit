const replace = require("rollup-plugin-replace");
const del = require("del");
const rollup = require("rollup");
const babel = require("rollup-plugin-babel");
const commonjs = require("rollup-plugin-commonjs");
const resolve = require("rollup-plugin-node-resolve");
const rollupAnalyzer = require("rollup-analyzer")({ limit: 10 });

process.env.NODE_ENV = process.env.NODE_ENV || "production";
const isProduction = process.env.NODE_ENV === "production";

const inputs = [
  "index",
  "ui/index",
  "ui/Render/index",
  "ui/AsciiTable/index",
  "ui/Chart/index",
  "utils/index",
  "utils/Cypher/index",
  "utils/DriverProvider/index",
  "utils/DesktopIntegration/index"
];
const bundleTypes = [
  {
    format: "cjs",
    plugins: [
      resolve({
        jsnext: true,
        main: true,
        browser: true,
        extensions: [".js", ".jsx"]
      }),
      commonjs({
        sourceMap: false,
        namedExports: {
          "node_modules/@vx/scale/build/index.js": [
            "scaleTime",
            "scaleLinear",
            "scaleOrdinal"
          ],
          "node_modules/@vx/curve/build/index.js": [
            "curveBasis",
            "curveMonotoneX"
          ],
          "node_modules/@vx/gradient/build/index.js": ["LinearGradient"],
          "node_modules/@vx/group/build/index.js": ["Group"],
          "node_modules/@vx/shape/build/index.js": [
            "AxisLeft",
            "AreaClosed",
            "LinePath"
          ],
          "node_modules/@vx/glyph/build/index.js": ["GlyphDot"],
          "node_modules/@vx/axis/build/index.js": ["AxisLeft", "AxisBottom"],
          "node_modules/@vx/legend/build/index.js": ["LegendOrdinal"],
          "node_modules/@data-ui/xy-chart/build/index.js": [
            "XYChart",
            "XAxis",
            "YAxis",
            "BarSeries",
            "PointSeries",
            "CrossHair",
            "LineSeries"
          ],
          "node_modules/@data-ui/radial-chart/build/index.js": [
            "RadialChart",
            "ArcSeries",
            "ArcLabel"
          ],
          "node_modules/@data-ui/theme/build/index.js": ["chartTheme"]
        }
      })
    ],
    babelPresets: ["es2015-rollup", "react-app"],
    babelPlugins: []
  }
];

let bundles = [];
bundleTypes.forEach(bType => {
  inputs.forEach(input => {
    bundles.push({
      ...bType,
      input: `src/${input}.js`,
      moduleName: input
    });
  });
});

let promise = Promise.resolve();

// Clean up the output directory
promise = promise.then(() => del(["dist/*"]));

// Compile source code into a distributable format with Babel and Rollup
for (const config of bundles) {
  promise = promise.then(() =>
    rollup
      .rollup({
        input: config.input,
        external: ["react", "prop-types"],
        plugins: [
          replace({ "process.env.NODE_ENV": JSON.stringify("production") }),
          babel({
            babelrc: false,
            exclude: [
              "**/node_modules/**",
              "dist/**",
              "**/coverage/**",
              "**/styleguide/**"
            ],
            presets: config.babelPresets,
            plugins: config.babelPlugins
          })
        ].concat(config.plugins)
      })
      .then(bundle => {
        bundle.write({
          file: `dist/${config.moduleName || "main"}.js`,
          format: config.format,
          sourcemap: !isProduction,
          name: config.moduleName,
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
            "prop-types": "PropTypes"
          }
        });
        return bundle;
      })
      .then(
        bundle =>
          isProduction
            ? null
            : rollupAnalyzer
                .formatted(bundle)
                .then(console.log)
                .catch(console.error)
      )
  );
}

promise.catch(err => console.error(err.stack)); // eslint-disable-line no-console

// @ts-check
const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin");

module.exports = (/** @type {object} */env) => {
    const isDevBuild = !(env && env.prod);
    const clientBundleOutputDir = "wwwroot/dist";

    /** 
     * Plugins that apply in both development and production builds
     * 
     * @type {array}
     * */
    const commonPlugins = [

        // maps these identifiers to the jQuery package (because Bootstrap expects it to be a global variable)
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),

        // Many packages sets different levels of logging, caching or some optimization. This variable comes
        // from express framework.
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': isDevBuild ? '"development"' : '"production"'
        }),

        // WORKAROUND: webpack -> superagent uses require
        // new webpack.DefinePlugin({
        //     "global.GENTLY": false
        // }),

        // Workaround for https://github.com/andris9/encoding/issues/16
        // new webpack.NormalModuleReplacementPlugin(/\/iconv-loader$/, require.resolve('node-noop')),

        // plugin that ensures the vendor modules (placed in node_modules directory) 
        // are bundled separately
        new webpack.optimize.CommonsChunkPlugin({
            name: 'scripts-vendors',
            filename: 'scripts-vendors.js',
            minChunks(module, count) {
                var context = module.context;
                return context && context.indexOf('node_modules') >= 0;
            },
        }),

        // Plugin that extracts css styles into separate files. It must be enabled for both of
        // production and development builds beacause shared loaders configuration.
        new ExtractTextPlugin({
            filename: "[name].css",
            disable: isDevBuild
        })
    ]

    // plugins that apply in development builds only
    const devOnlyPlugins = [
        new webpack.SourceMapDevToolPlugin({
            filename: "[file].map",
            exclude: ['scripts-vendors.js', 'styles-app.js', 'styles-vendors.js'],
            moduleFilenameTemplate: path.relative(
                clientBundleOutputDir,
                "[resourcePath]"
            ) // Point sourcemap entries to the original file locations on disk
        }),
        new HardSourceWebpackPlugin(),
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
        })
    ];

    // plugins that apply in production builds only
    const productionOnlyPlugins = [
        new UglifyJsPlugin({
            cache: true,
            parallel: true
        })
    ];

    /** 
     * @type {import("webpack").Configuration}
     */
    const config = {
        entry: {
            "scripts-app": "./ClientApp/app.tsx",
            "styles-app": "./ClientApp/styles/app.scss",
            "styles-vendors": "./ClientApp/styles/vendors.scss",
        },
        stats: { modules: false },
        resolve: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
        output: {
            filename: "[name].js",
            publicPath: "/dist/", // Webpack dev middleware, if enabled, handles requests for this URL prefix
            path: path.join(__dirname, clientBundleOutputDir)
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    include: /ClientApp/,
                    use: {
                        loader: "awesome-typescript-loader",
                        options: {
                            silent: true
                        }
                    }
                },
                {
                    test: /\.(png|jpg|jpeg|gif)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    use: {
                        loader: "file-loader",
                        options: {
                            name: "src/img/[name].[ext]"
                        }
                    }
                },
                {
                    test: /\.(woff2?|ttf|svg|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    use: {
                        loader: "file-loader",
                        options: {
                            name: "fonts/[name].[ext]"
                        }
                    }
                },
                {
                    test: /\.scss$(\?|$)/,
                    use: ExtractTextPlugin.extract({
                        fallback: "style-loader",
                        use: [
                            {
                                loader: "css-loader",
                                options: {
                                    minimize: !isDevBuild,
                                    sourceMap: isDevBuild
                                }
                            },
                            {
                                loader: "sass-loader",
                                options: {
                                    sourceMap: isDevBuild
                                }
                            }
                        ]
                    })
                },
                {
                    test: /\.css(\?|$)/,
                    use: ExtractTextPlugin.extract({
                        fallback: "style-loader",
                        use: [
                            "style-loader",
                            {
                                loader: "css-loader",
                                options: {
                                    minimize: !isDevBuild,
                                    sourceMap: isDevBuild
                                }
                            }
                        ]
                    })
                }
            ]
        },
        plugins: commonPlugins.concat(isDevBuild ? devOnlyPlugins : productionOnlyPlugins),
        devServer: {
            contentBase: "wwwroot",
            stats: {
                modules: false
            },
            open: true,
            openPage: "page.html"
        }
    };

    return config;
};
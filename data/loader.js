(async function() {
    const scripts = [
        "emulator.js",
        "nipplejs.js",
        "shaders.js",
        "storage.js",
        "gamepad.js",
        "GameManager.js",
        "socket.io.min.js",
        "compression.js"
    ];

    const folderPath = (path) => path.substring(0, path.length - path.split("/").pop().length);
    let scriptPath = (typeof window.EJS_pathtodata === "string") ? window.EJS_pathtodata : folderPath((new URL(document.currentScript.src)).pathname);
    if (!scriptPath.endsWith("/")) scriptPath += "/";

    function loadScript(file) {
        return new Promise(function(resolve) {
            let script = document.createElement("script");
            
            // Fix for Modern Builds: Treat engine as a Module
            if (file.endsWith("emulator.min.js") || file === "emulator.js") {
                script.type = "module";
            }

            script.src = function() {
                if ("undefined" != typeof EJS_paths && typeof EJS_paths[file] === "string") {
                    return EJS_paths[file];
                } else if (file.endsWith("emulator.min.js")) {
                    return scriptPath + file;
                } else {
                    return scriptPath + "src/" + file;
                }
            }();
            
            script.onload = resolve;
            script.onerror = () => {
                filesmissing(file).then(e => resolve());
            }
            document.head.appendChild(script);
        })
    }

    function loadStyle(file) {
        return new Promise(function(resolve) {
            let css = document.createElement("link");
            css.rel = "stylesheet";
            css.href = function() {
                if ("undefined" != typeof EJS_paths && typeof EJS_paths[file] === "string") {
                    return EJS_paths[file];
                } else {
                    return scriptPath + file;
                }
            }();
            css.onload = resolve;
            css.onerror = () => {
                filesmissing(file).then(e => resolve());
            }
            document.head.appendChild(css);
        })
    }

    async function filesmissing(file) {
        let minifiedFailed = file.includes(".min.") && !file.includes("socket");
        if (minifiedFailed) {
            if (file === "emulator.min.js") {
                for (let i = 0; i < scripts.length; i++) {
                    await loadScript(scripts[i]);
                }
            } else {
                await loadStyle("emulator.css");
            }
        }
    }

    // Load Engine and CSS
    if (("undefined" != typeof EJS_DEBUG_XX && true === EJS_DEBUG_XX)) {
        for (let i = 0; i < scripts.length; i++) {
            await loadScript(scripts[i]);
        }
        await loadStyle("emulator.css");
    } else {
        await loadScript("emulator.min.js");
        await loadStyle("emulator.min.css");
    }

    const config = {};
    config.gameUrl = window.EJS_gameUrl;
    config.dataPath = scriptPath;
    config.system = window.EJS_core;
    config.biosUrl = window.EJS_biosUrl;
    config.gameName = window.EJS_gameName;
    config.color = window.EJS_color;
    config.adUrl = window.EJS_AdUrl;
    config.adMode = window.EJS_AdMode;
    config.adTimer = window.EJS_AdTimer;
    config.adSize = window.EJS_AdSize;
    config.alignStartButton = window.EJS_alignStartButton;
    config.VirtualGamepadSettings = window.EJS_VirtualGamepadSettings;
    config.buttonOpts = window.EJS_Buttons;
    config.volume = window.EJS_volume;
    config.defaultControllers = window.EJS_defaultControls;
    config.startOnLoad = window.EJS_startOnLoaded;
    config.fullscreenOnLoad = window.EJS_fullscreenOnLoaded;
    config.filePaths = window.EJS_paths;
    config.loadState = window.EJS_loadStateURL;
    config.cacheLimit = window.EJS_CacheLimit;
    config.cheats = window.EJS_cheats;
    config.defaultOptions = window.EJS_defaultOptions;
    config.gamePatchUrl = window.EJS_gamePatchUrl;
    config.gameParentUrl = window.EJS_gameParentUrl;
    config.netplayUrl = window.EJS_netplayServer;
    config.gameId = window.EJS_gameID;
    config.backgroundImg = window.EJS_backgroundImage;
    config.backgroundBlur = window.EJS_backgroundBlur;
    config.backgroundColor = window.EJS_backgroundColor;
    config.controlScheme = window.EJS_controlScheme;
    config.threads = window.EJS_threads;
    config.disableCue = window.EJS_disableCue;
    config.startBtnName = window.EJS_startButtonName;
    config.softLoad = window.EJS_softLoad;
    config.capture = window.EJS_screenCapture;
    config.externalFiles = window.EJS_externalFiles;
    config.dontExtractBIOS = window.EJS_dontExtractBIOS;
    config.disableDatabases = window.EJS_disableDatabases;
    config.disableLocalStorage = window.EJS_disableLocalStorage;
    config.forceLegacyCores = window.EJS_forceLegacyCores;
    config.noAutoFocus = window.EJS_noAutoFocus;
    config.videoRotation = window.EJS_videoRotation;
    config.hideSettings = window.EJS_hideSettings;
    config.shaders = Object.assign({}, window.EJS_SHADERS, window.EJS_shaders ? window.EJS_shaders : {});

    let systemLang;
    try {
        systemLang = Intl.DateTimeFormat().resolvedOptions().locale;
    } catch(e) {} 

    if ((typeof window.EJS_language === "string" && window.EJS_language !== "en-US") || (systemLang && window.EJS_disableAutoLang !== false)) {
        const language = window.EJS_language || systemLang;
        try {
            let path = ("undefined" != typeof EJS_paths && typeof EJS_paths[language] === "string") ? EJS_paths[language] : scriptPath + "localization/" + language + ".json";
            config.language = language;
            config.langJson = JSON.parse(await (await fetch(path)).text());
        } catch(e) {
            delete config.language;
            delete config.langJson;
        }
    }

    // --- CRITICAL MODULE SYNC START ---
    // If EmulatorJS isn't defined yet, try to manually import it
    try {
        if (typeof EmulatorJS === "undefined") {
            const module = await import(scriptPath + "emulator.min.js");
            window.EmulatorJS = module.EmulatorJS || module.default;
        }
    } catch (e) {}

    // Wait up to 500ms for the browser to register the class
    let attempts = 0;
    while (typeof EmulatorJS === "undefined" && attempts < 5) {
        await new Promise(res => setTimeout(res, 100));
        attempts++;
    }

    if (typeof EmulatorJS !== "undefined") {
        window.EJS_emulator = new EmulatorJS(EJS_player, config);
        window.EJS_adBlocked = (url, del) => window.EJS_emulator.adBlocked(url, del);
        if (typeof window.EJS_ready === "function") {
            window.EJS_emulator.on("ready", window.EJS_ready);
        }
    } else {
        console.error("EmulatorJS failed to load. Check that emulator.min.js is in the /data/ folder.");
    }
    // --- CRITICAL MODULE SYNC END ---
})();